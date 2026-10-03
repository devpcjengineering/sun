// POST { folder } → { signature, timestamp, folder, apiKey, cloudName }
// ออก signature ให้แอดมินอัปโหลดตรงไป Cloudinary (API secret อยู่ใน Edge Function เท่านั้น)
import { corsHeaders, FOLDERS, json, requireAdmin, ROOT, sign } from "../_shared/cloudinary.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!(await requireAdmin(req))) return json({ error: "Unauthorized" }, 401);

  const { folder } = await req.json().catch(() => ({}));
  if (!FOLDERS.includes(folder)) return json({ error: "Bad folder" }, 400);

  const timestamp = Math.round(Date.now() / 1000);
  const fullFolder = `${ROOT}/${folder}`;
  const signature = await sign({ folder: fullFolder, timestamp });

  return json({
    signature,
    timestamp,
    folder: fullFolder,
    apiKey: Deno.env.get("CLOUDINARY_API_KEY"),
    cloudName: Deno.env.get("CLOUDINARY_CLOUD_NAME"),
  });
});
