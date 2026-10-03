import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/**
 * รูปแบบ fill (parent ต้อง relative + กำหนดขนาด)
 * Cloudinary -> next/image, โฮสต์อื่น -> unoptimized เพื่อไม่ให้ติด remotePatterns
 */
export default function SmartImage({ src, alt, sizes, className, priority }: Props) {
  let cloudinary = false;
  try {
    cloudinary = new URL(src).hostname === "res.cloudinary.com";
  } catch {
    cloudinary = src.startsWith("/");
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!cloudinary}
      className={className}
    />
  );
}
