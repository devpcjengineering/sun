// Types ตรงกับ supabase/schema.sql

export type SiteSettings = {
  id: 1;
  site_name: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  hero_image_public_id: string | null;
  why_title: string;
  why_text: string;
  stats: { value: string; label: string }[];
  cta_title: string;
  cta_text: string;
  phone: string;
  email: string | null;
  line_id: string;
  line_url: string | null;
  facebook_url: string;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  address: string | null;
  map_url: string | null;
  seo_title: string;
  seo_description: string;
  updated_at: string;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon: string; // lucide icon name
  cover_url: string | null;
  cover_public_id: string | null;
  features: string[];
  sort_order: number;
  published: boolean;
};

export const POST_CATEGORIES = [
  { value: "event", label: "Event" },
  { value: "live-commerce", label: "Live Commerce" },
  { value: "video", label: "Video Production" },
  { value: "graphic", label: "Graphic & Motion" },
  { value: "other", label: "อื่น ๆ" },
] as const;

export type GalleryImage = { url: string; public_id: string };

export const POST_KINDS = [
  { value: "work", label: "ผลงาน" },
  { value: "article", label: "บทความ" },
] as const;

export type Post = {
  id: string;
  kind: (typeof POST_KINDS)[number]["value"]; // work = ผลงาน, article = บทความ
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null; // markdown
  cover_url: string | null;
  cover_public_id: string | null;
  gallery: GalleryImage[];
  video_url: string | null;
  category: (typeof POST_CATEGORIES)[number]["value"];
  client_name: string | null;
  tags: string[];
  featured: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  name: string;
  logo_url: string;
  logo_public_id: string | null;
  website_url: string | null;
  sort_order: number;
  published: boolean;
};

export type Package = {
  id: string;
  name: string;
  price_text: string;
  price_note: string | null;
  description: string | null;
  features: string[];
  highlight: boolean;
  cta_label: string;
  sort_order: number;
  published: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatar_url: string | null;
  avatar_public_id: string | null;
  rating: number;
  sort_order: number;
  published: boolean;
};

export type Inquiry = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  service: string | null;
  message: string;
  status: "new" | "read" | "done";
  created_at: string;
};

// ───────── สิทธิ์ผู้ดูแลระบบ ─────────
export const ROLES = ["admin", "dev", "staff"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "แอดมิน",
  dev: "Dev",
  staff: "Staff",
};

export function isRole(v: unknown): v is Role {
  return typeof v === "string" && (ROLES as readonly string[]).includes(v);
}

/** admin / dev จัดการตั้งค่าเว็บและผู้ดูแลระบบได้ — staff จัดการเนื้อหาเท่านั้น */
export function canManage(role: Role | null | undefined): boolean {
  return role === "admin" || role === "dev";
}
