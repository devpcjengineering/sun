"use client";
import { createClient } from "@/lib/supabase/client";
import type { CloudinaryFolder } from "./cloudinary";

export type UploadedImage = { url: string; public_id: string; width: number; height: number };

/** อัปโหลดจาก browser ไป Cloudinary ด้วย signature จาก Edge Function `cloudinary-sign` */
export async function uploadImage(file: File, folder: CloudinaryFolder): Promise<UploadedImage> {
  const sb = createClient();
  const { data: s, error } = await sb.functions.invoke("cloudinary-sign", { body: { folder } });
  if (error || !s?.signature) {
    let detail = "";
    try {
      detail = (await (error as { context?: Response })?.context?.json())?.error ?? "";
    } catch {}
    throw new Error(detail || "ขอสิทธิ์อัปโหลดไม่สำเร็จ (ต้องล็อกอินเป็นแอดมิน / ตั้งค่า Edge Function แล้วหรือยัง)");
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", s.apiKey);
  fd.append("timestamp", String(s.timestamp));
  fd.append("signature", s.signature);
  fd.append("folder", s.folder);

  const up = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: "POST", body: fd });
  if (!up.ok) {
    const msg = (await up.json().catch(() => null))?.error?.message;
    throw new Error(msg ? `Cloudinary: ${msg}` : "อัปโหลดรูปไม่สำเร็จ");
  }
  const j = await up.json();
  return { url: j.secure_url, public_id: j.public_id, width: j.width, height: j.height };
}

/** ลบรูป (best-effort) ผ่าน Edge Function `cloudinary-delete` */
export async function deleteImage(publicId: string) {
  await createClient().functions.invoke("cloudinary-delete", { body: { publicIds: [publicId] } });
}
