import Image from "next/image";
import { isCloudinaryUrl } from "@/lib/cloudinary-loader";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/**
 * รูปแบบ fill (parent ต้อง relative + กำหนดขนาด) — Server Component ไม่เพิ่ม JS ฝั่ง client
 * Cloudinary -> โหลดตรงจาก CDN (loader กลางใน next.config.ts) ; โฮสต์อื่น -> unoptimized
 */
export default function SmartImage({ src, alt, sizes, className, priority }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!isCloudinaryUrl(src)}
      className={className}
    />
  );
}
