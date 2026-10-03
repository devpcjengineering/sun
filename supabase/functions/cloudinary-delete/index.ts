// POST { publicIds: string[] } → { results: { publicId, result }[] }
// ลบรูปจาก Cloudinary (เฉพาะแอดมิน และเฉพาะ public_id ในโฟลเดอร์ sunnakhon/)
import { corsHeaders, json, requireAdmin, ROOT, sign } from "../_shared/cloudinary.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!(await requireAdmin(req))) return json({ error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({}));
  const ids: string[] = (Array.isArray(body.publicIds) ? body.publicIds : [])
    .filter((x: unknown): x is string => typeof x === "string" && x.startsWith(`${ROOT}/`))
    .slice(0, 50);
  if (!ids.length) return json({ error: "No valid publicIds" }, 400);

  const cloud = Deno.env.get("CLOUDINARY_CLOUD_NAME");
  const apiKey = Deno.env.get("CLOUDINARY_API_KEY")!;

  const results = await Promise.all(
    ids.map(async (publicId) => {
      const timestamp = Math.round(Date.now() / 1000);
      const signature = await sign({ public_id: publicId, timestamp, invalidate: true });
      const fd = new FormData();
      fd.append("public_id", publicId);
      fd.append("timestamp", String(timestamp));
      fd.append("invalidate", "true");
      fd.append("api_key", apiKey);
      fd.append("signature", signature);
      const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      return { publicId, result: j.result ?? "error" };
    }),
  );
  return json({ results });
});
