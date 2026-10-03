import type { Metadata } from "next";

// เพจที่ตั้ง openGraph เองจะทับของ layout ทั้งก้อน (รวมรูปและชื่อเว็บ) — ใช้ helper นี้เพื่อให้ได้ครบทุกหน้า
export const SITE_NAME = "SUNNAKHON GROUP";

/** รูปตัวอย่างตอนแชร์ 1200×630 (public/og-image.png) */
export const OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: `${SITE_NAME} — Event, Live Commerce & Production ครบวงจร` };

type OG = NonNullable<Metadata["openGraph"]>;

export function openGraphFor(o: {
  title: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  publishedTime?: string;
}): OG {
  const base = {
    siteName: SITE_NAME,
    locale: "th_TH",
    title: o.title,
    description: o.description,
    url: o.path ?? "/",
    images: o.images && o.images.length ? o.images : [OG_IMAGE],
  };
  return o.type === "article"
    ? { ...base, type: "article", publishedTime: o.publishedTime }
    : { ...base, type: "website" };
}

/** Twitter card ใหญ่ + รูปเดียวกับ OG */
export function twitterFor(o: { title: string; description?: string; image?: string }): NonNullable<Metadata["twitter"]> {
  return { card: "summary_large_image", title: o.title, description: o.description, images: [o.image ?? OG_IMAGE.url] };
}
