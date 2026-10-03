"use client";
import { createClient } from "@/lib/supabase/client";
import { startBusy } from "@/lib/busy";
import type { CloudinaryFolder } from "./cloudinary";

export type UploadedImage = { url: string; public_id: string; width: number; height: number };

type CloudinaryResponse = { secure_url: string; public_id: string; width: number; height: number; error?: { message?: string } };

/** POST ด้วย XHR เพื่อให้ได้ความคืบหน้าการอัปโหลดจริง */
function postWithProgress(url: string, fd: FormData, onProgress: (p: number) => void): Promise<CloudinaryResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onerror = () => reject(new Error("เชื่อมต่อ Cloudinary ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่"));
    xhr.onload = () => {
      let body: CloudinaryResponse | null = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && body) return resolve(body);
      const msg = body?.error?.message;
      reject(new Error(msg ? `Cloudinary: ${msg}` : "อัปโหลดรูปไม่สำเร็จ"));
    };
    xhr.send(fd);
  });
}

/** อัปโหลดจาก browser ไป Cloudinary ด้วย signature จาก Edge Function `cloudinary-sign` (ตัวโหลดรวมแสดงอัตโนมัติ) */
export async function uploadImage(file: File, folder: CloudinaryFolder): Promise<UploadedImage> {
  const busy = startBusy("กำลังอัปโหลดรูป…");
  try {
    const sb = createClient();
    const { data: s, error } = await sb.functions.invoke("cloudinary-sign", { body: { folder } });
    if (error || !s?.signature) {
      let detail = "";
      try {
        detail = (await (error as { context?: Response })?.context?.json())?.error ?? "";
      } catch {}
      throw new Error(detail || "ขอสิทธิ์อัปโหลดไม่สำเร็จ (ต้องล็อกอินเป็นแอดมิน / ตั้งค่า Edge Function แล้วหรือยัง)");
    }
    busy.progress(0.05);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", s.apiKey);
    fd.append("timestamp", String(s.timestamp));
    fd.append("signature", s.signature);
    fd.append("folder", s.folder);

    const j = await postWithProgress(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, fd, (p) =>
      busy.progress(0.05 + p * 0.95),
    );
    busy.progress(1);
    return { url: j.secure_url, public_id: j.public_id, width: j.width, height: j.height };
  } finally {
    busy.done();
  }
}

/** ลบรูป (best-effort) ผ่าน Edge Function `cloudinary-delete` */
export async function deleteImage(publicId: string) {
  const busy = startBusy("กำลังลบรูป…");
  try {
    await createClient().functions.invoke("cloudinary-delete", { body: { publicIds: [publicId] } });
  } finally {
    busy.done();
  }
}
