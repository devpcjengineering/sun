import { createClient } from "npm:@supabase/supabase-js@2";

export const ROOT = "sunnakhon";
export const FOLDERS = ["posts", "clients", "services", "testimonials", "site"];

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** ตรวจว่าผู้เรียกล็อกอินอยู่และเป็นแอดมิน (ตาราง admins ผ่านฟังก์ชัน is_admin) */
export async function requireAdmin(req: Request): Promise<boolean> {
  const auth = req.headers.get("Authorization");
  if (!auth) return false;
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: u, error } = await sb.auth.getUser();
  if (error || !u.user) return false;
  const { data } = await sb.rpc("is_admin");
  return data === true;
}

/** Cloudinary signature = sha1(params เรียงตามตัวอักษร + api_secret) */
export async function sign(params: Record<string, string | number | boolean>) {
  const secret = Deno.env.get("CLOUDINARY_API_SECRET");
  if (!secret || !Deno.env.get("CLOUDINARY_API_KEY") || !Deno.env.get("CLOUDINARY_CLOUD_NAME")) {
    throw new Error("Cloudinary ยังไม่ได้ตั้งค่า: ต้องมี secrets CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
  }
  const str =
    Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&") + secret;
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
