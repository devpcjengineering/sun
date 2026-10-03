// Loader กลางของ next/image (ตั้งใน next.config.ts: images.loaderFile)
// รูป Cloudinary โหลดตรงจาก CDN พร้อมย่อขนาด/แปลงฟอร์แมตอัตโนมัติ; รูปอื่นคืน URL เดิม
import { cloudinaryLoader } from "./cloudinary-loader";

export default function loader(p: { src: string; width: number; quality?: number }): string {
  return cloudinaryLoader(p);
}
