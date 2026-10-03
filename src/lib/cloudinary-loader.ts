// Loader ของ next/image: ให้เบราว์เซอร์โหลดรูปตรงจาก Cloudinary CDN (ไม่ผ่านเซิร์ฟเวอร์ Next)
// โดยให้ Cloudinary ย่อขนาด + แปลงฟอร์แมต (AVIF/WebP) + บีบคุณภาพอัตโนมัติ ผ่าน URL transformation
// ไม่มี secret — ใช้ได้ทั้งฝั่ง client และ server

export function isCloudinaryUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "res.cloudinary.com" && u.pathname.includes("/image/upload/");
  } catch {
    return false;
  }
}

export function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  if (!isCloudinaryUrl(src)) return src;
  const t = `f_auto,q_${quality ?? "auto"},c_limit,w_${width},dpr_auto`;
  return src.replace("/image/upload/", `/image/upload/${t}/`);
}
