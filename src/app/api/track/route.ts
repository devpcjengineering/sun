import { createClient } from "@supabase/supabase-js";
import { classifySource, deviceOf, isBot } from "@/lib/analytics";

// รับ beacon จาก <TrackPageView> แล้วบันทึกลง page_views
// ไม่เก็บ IP ตรง ๆ — เก็บเป็น hash รายวัน (ip + ua + วันที่ + salt) เพื่อนับผู้เข้าชมไม่ซ้ำ

export const runtime = "nodejs";

const OK = new Response(null, { status: 204 });

async function visitorHash(ip: string, ua: string): Promise<string | null> {
  if (!ip) return null;
  const salt = process.env.SUPABASE_SECRET_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${salt}|${day}|${ip}|${ua}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf).slice(0, 16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return OK;

  const ua = request.headers.get("user-agent");
  if (isBot(ua)) return OK;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return OK;
  }

  const path = str(body.path, 300);
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/login") || path.startsWith("/api")) return OK;

  const ownHost = request.headers.get("host") ?? "";
  const referrer = str(body.referrer, 1000) || null;
  const source = classifySource(referrer, str(body.utm_source, 60) || null, ownHost);
  const refHost = (() => {
    try {
      return referrer ? new URL(referrer).hostname.replace(/^www\./i, "").slice(0, 200) : null;
    } catch {
      return null;
    }
  })();

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "";
  const country = (request.headers.get("x-vercel-ip-country") ?? "").toUpperCase().slice(0, 2) || null;

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  await sb.from("page_views").insert({
    path,
    source,
    referrer: source ? refHost : null,
    utm_medium: str(body.utm_medium, 100) || null,
    utm_campaign: str(body.utm_campaign, 100) || null,
    country,
    device: deviceOf(ua),
    visitor: await visitorHash(ip, ua ?? ""),
  });
  return OK;
}
