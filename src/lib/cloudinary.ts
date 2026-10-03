// ค่าคงที่ร่วม — การเซ็นชื่อ/ลบรูปทำใน Supabase Edge Functions (supabase/functions/cloudinary-*)
// ไม่มี Cloudinary secret ฝั่ง Next.js
export const CLOUDINARY_FOLDERS = ["posts", "clients", "services", "testimonials", "site"] as const;
export type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[number];
export const CLOUDINARY_ROOT = "sunnakhon";
