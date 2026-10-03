import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "../safe-next";

/** ปลายทางของ Google OAuth: แลก code เป็น session แล้วตรวจสิทธิ์แอดมิน */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  // รองรับการรันหลัง proxy/load balancer
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost && process.env.NODE_ENV === "production" ? `${forwardedProto}://${forwardedHost}` : url.origin;

  const fail = (error: string) => NextResponse.redirect(`${origin}/login?error=${error}`);

  if (url.searchParams.get("error")) return fail("oauth");
  if (!code) return fail("missing_code");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail("auth");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return fail("not_admin");
  }

  return NextResponse.redirect(`${origin}${next}`);
}
