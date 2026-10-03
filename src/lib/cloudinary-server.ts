import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * ลบรูปจาก Cloudinary จาก Server Action (เช่นตอนลบโพสต์/โลโก้) โดยเรียก Edge Function `cloudinary-delete`
 * ด้วย session ของแอดมินที่กำลังล็อกอิน — best-effort ไม่ throw
 */
export async function deleteCloudinaryImages(publicIds: (string | null | undefined)[]) {
  const ids = publicIds.filter((x): x is string => !!x && x.startsWith("sunnakhon/"));
  if (!ids.length) return;
  try {
    const sb = await createClient();
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (!session) return;
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cloudinary-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ publicIds: ids }),
    });
  } catch {
    // ลบรูปไม่สำเร็จไม่ควรทำให้ action หลักล้มเหลว
  }
}
