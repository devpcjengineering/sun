import Image from "next/image";
import { isCloudinaryUrl } from "@/lib/cloudinary-loader";

type Props = {
  src: string;
  alt: string;
  /** โหมด fill: ใส่ sizes ตามเลย์เอาต์ (ใช้ vw จะได้ srcset สั้นลง) */
  sizes?: string;
  /** รูปขนาดคงที่ (โลโก้/อวาตาร์): srcset เหลือแค่ 1x/2x แทนที่จะสร้างทุกความกว้าง */
  fixed?: { width: number; height: number };
  className?: string;
  priority?: boolean;
};

/**
 * Server Component ไม่เพิ่ม JS ฝั่ง client
 * - ไม่ใส่ fixed: โหมด fill (parent ต้อง relative + กำหนดขนาด)
 * - ใส่ fixed: ใช้ width/height ตายตัว
 * Cloudinary -> โหลดตรงจาก CDN (loader กลางใน next.config.ts) ; โฮสต์อื่น -> unoptimized
 */
export default function SmartImage({ src, alt, sizes, fixed, className, priority }: Props) {
  const unoptimized = !isCloudinaryUrl(src);
  if (fixed) {
    return (
      <Image
        src={src}
        alt={alt}
        width={fixed.width}
        height={fixed.height}
        priority={priority}
        unoptimized={unoptimized}
        className={className}
      />
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={unoptimized} className={className} />;
}
