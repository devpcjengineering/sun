// helper ที่ใช้ได้ทั้ง client และ server (ไม่มี side-effect)
import type { GalleryImage } from "@/lib/types";

/** ค่าเริ่มต้นของฟอร์ม — ต้องอยู่ในไฟล์ที่ไม่ใช่ "use client" เพื่อให้หน้า server ใช้ spread ได้
 *  (ถ้า export จากไฟล์ client ฝั่ง server จะได้แค่ตัวอ้างอิงเปล่า ทำให้ทุกฟิลด์เป็น undefined) */
export type PostFormInitial = {
  kind: string;
  title: string;
  slug: string;
  category: string;
  client_name: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  cover_public_id: string | null;
  gallery: GalleryImage[];
  video_url: string;
  tags: string;
  featured: boolean;
  published: boolean;
  published_at: string; // datetime-local (เวลาไทย) หรือ ""
};

export const EMPTY_POST: PostFormInitial = {
  kind: "work",
  title: "",
  slug: "",
  category: "event",
  client_name: "",
  excerpt: "",
  content: "",
  cover_url: null,
  cover_public_id: null,
  gallery: [],
  video_url: "",
  tags: "",
  featured: false,
  published: false,
  published_at: "",
};

/** แปลงข้อความเป็น slug ภาษาอังกฤษ (ตัวอักษรไทยจะถูกตัดออก) */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/** slug สำรองเมื่อชื่อโพสต์ไม่มีตัวอักษรละติน เช่น "post-lx3k9a2" */
export function fallbackSlug(): string {
  return `post-${Date.now().toString(36)}`;
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const BKK_OFFSET_MS = 7 * 60 * 60 * 1000;

/** ISO (UTC) → ค่าสำหรับ <input type="datetime-local"> ตามเวลาไทย (UTC+7) */
export function isoToBangkokInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  return new Date(t + BKK_OFFSET_MS).toISOString().slice(0, 16);
}

/** ค่า datetime-local (ตีความเป็นเวลาไทย) → ISO UTC ; คืน null ถ้าว่าง/ไม่ถูกต้อง */
export function bangkokInputToIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const t = Date.parse(`${value}${value.length === 16 ? ":00" : ""}+07:00`);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}
