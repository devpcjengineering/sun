"use client";

import Image from "next/image";
import { cloudinaryLoader, isCloudinaryUrl } from "@/lib/cloudinary-loader";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/**
 * รูปแบบ fill (parent ต้อง relative + กำหนดขนาด)
 * Cloudinary -> โหลดตรงจาก CDN พร้อม f_auto/q_auto/ย่อขนาดตามหน้าจอ, โฮสต์อื่น -> unoptimized
 */
export default function SmartImage({ src, alt, sizes, className, priority }: Props) {
  const cloud = isCloudinaryUrl(src);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loader={cloud ? cloudinaryLoader : undefined}
      unoptimized={!cloud}
      className={className}
    />
  );
}
