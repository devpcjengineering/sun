import "server-only";
import {
  getClient,
  getClients,
  getPackages,
  getPost,
  getPosts,
  getPostsByClientName,
  getServices,
  getSettings,
  getTestimonials,
} from "@/lib/data";
import type { Client, Package, Post, Service, SiteSettings, Testimonial } from "@/lib/types";

// ห่อการเรียกข้อมูลทุกตัวด้วย try/catch — ถ้า Supabase ยังไม่ตั้งค่า/ล่ม เว็บยังแสดงผลได้ด้วยข้อความ default

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  site_name: "SUNNAKHON GROUP",
  hero_eyebrow: "#teamsunnakhon",
  hero_title: "จัด Event, Live Commerce และ Production ครบวงจร จบในที่เดียว",
  hero_subtitle:
    "เนรมิตงานประกวด คอนเสิร์ต งานนักศึกษา และไลฟ์สดขายสินค้าให้ปัง พร้อมบริการวิดีโอโปรดักชัน ตัดต่อ และออกแบบกราฟิก/Motion Graphics ทุกรูปแบบ การันตีผลงานด้วยประสบการณ์กว่า 4 ปี",
  hero_image_url: null,
  hero_image_public_id: null,
  why_title: "ทำไมต้อง #teamsunnakhon",
  why_text:
    "\"เพราะความต้องการของคุณ #teamsunnakhon ทำได้ทุกอย่าง\" เราไม่ใช่แค่ออแกไนเซอร์ แต่เราคือ 'พาร์ทเนอร์' ที่พร้อมเนรมิตทุกไอเดียของคุณให้เกิดขึ้นจริง ด้วยประสบการณ์ 4 ปี เราเข้าใจทุกมิติของการจัดงาน ทั้งอีเวนต์ออฟไลน์ ไลฟ์สด วิดีโอโปรดักชัน และงานออกแบบ... ให้เราดูแลจบ ครบในที่เดียว",
  stats: [{ value: "4+", label: "ปีประสบการณ์" }],
  band_eyebrow: "Why Us",
  band_title: "#teamsunnakhon ทำได้ทุกอย่าง",
  band_text: "เราไม่ใช่แค่ออแกไนเซอร์ แต่คือพาร์ทเนอร์ที่พร้อมเนรมิตทุกไอเดียของคุณให้เกิดขึ้นจริง จบครบในที่เดียว",
  ticker_items: ["EVENT", "LIVE COMMERCE", "VIDEO PRODUCTION", "GRAPHIC & MOTION", "#TEAMSUNNAKHON"],
  capabilities: [
    { icon: "mic", title: "Event Organizer", text: "ประกวด คอนเสิร์ต งานนักศึกษา" },
    { icon: "smartphone", title: "Live Commerce", text: "ไลฟ์สดขายสินค้าให้ปัง" },
    { icon: "clapperboard", title: "Video Production", text: "ถ่ายทำ ตัดต่อ ทุกรูปแบบ" },
    { icon: "palette", title: "Graphic & Motion", text: "ดีไซน์ที่สะกดทุกสายตา" },
  ],
  cta_title: "พร้อมให้เราเนรมิตงานของคุณหรือยัง?",
  cta_text: "ทักมาคุยไอเดียกับทีมงานได้เลย ปรึกษาฟรี",
  phone: "08-3974-4566",
  email: null,
  line_id: "@sunnakhon.org",
  line_url: null,
  facebook_url: "https://www.facebook.com/sunnakhon.46/",
  instagram_url: null,
  tiktok_url: null,
  youtube_url: null,
  address: null,
  map_url: null,
  seo_title: "SUNNAKHON GROUP | Event, Live Commerce & Production ครบวงจร",
  seo_description:
    "รับจัดงานประกวด คอนเสิร์ต งานนักศึกษา ไลฟ์สดขายสินค้า วิดีโอโปรดักชัน และกราฟิก/Motion Graphics ประสบการณ์กว่า 4 ปี",
  updated_at: "",
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: "d1",
    slug: "event-organizer",
    title: "Event Organizer",
    subtitle: "รับจัดงานอีเวนต์ครบวงจร",
    description:
      "เนรมิตงานให้ปังทุกสเกล! ทั้งงานประกวดนางงาม คอนเสิร์ต และงานนักศึกษา พร้อมบริการจัดหา Supplier และดีลสปอนเซอร์ให้แบบเบ็ดเสร็จ",
    icon: "mic",
    cover_url: null,
    cover_public_id: null,
    features: ["งานประกวดนางงาม", "คอนเสิร์ต", "งานนักศึกษา", "จัดหา Supplier", "ดีลสปอนเซอร์"],
    sort_order: 1,
    published: true,
  },
  {
    id: "d2",
    slug: "live-commerce",
    title: "Live Commerce",
    subtitle: "ไลฟ์สดขายสินค้า",
    description:
      "เปลี่ยนผู้ชมให้เป็นผู้ซื้อ! บริการไลฟ์สดแบบเรียลไทม์ ผสานความบันเทิงเข้ากับการขายออนไลน์ ดึงดูดสายตาและดันยอดขายให้พุ่งกระฉูด",
    icon: "smartphone",
    cover_url: null,
    cover_public_id: null,
    features: ["ไลฟ์สดแบบเรียลไทม์", "ผสานความบันเทิงกับการขาย", "ดันยอดขายออนไลน์"],
    sort_order: 2,
    published: true,
  },
  {
    id: "d3",
    slug: "video-production",
    title: "Video Production",
    subtitle: "โปรดักชันและตัดต่อวิดีโอ",
    description:
      "สร้างสรรค์งานวิดีโอคุณภาพสูง รับถ่ายทำและตัดต่อวิดีโอทุกรูปแบบ เล่าเรื่องราวของคุณให้น่าสนใจและดูเป็นมืออาชีพ",
    icon: "clapperboard",
    cover_url: null,
    cover_public_id: null,
    features: ["ถ่ายทำวิดีโอ", "ตัดต่อวิดีโอ", "เล่าเรื่องแบบมืออาชีพ"],
    sort_order: 3,
    published: true,
  },
  {
    id: "d4",
    slug: "graphic-motion-design",
    title: "Graphic & Motion Design",
    subtitle: "ออกแบบกราฟิก",
    description:
      "สะกดทุกสายตาด้วยงานดีไซน์ รับออกแบบกราฟิกทุกชนิด รวมถึง Motion Graphics ภาพเคลื่อนไหวสุดล้ำ ที่จะทำให้แบรนด์ของคุณโดดเด่น",
    icon: "palette",
    cover_url: null,
    cover_public_id: null,
    features: ["ออกแบบกราฟิกทุกชนิด", "Motion Graphics", "Brand Identity"],
    sort_order: 4,
    published: true,
  },
];

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    // ปล่อยให้ Next.js จัดการ error ภายใน (dynamic usage / redirect / notFound)
    const digest = (err as { digest?: unknown } | null)?.digest;
    if (typeof digest === "string" && (digest.startsWith("NEXT_") || digest === "DYNAMIC_SERVER_USAGE")) {
      throw err;
    }
    return fallback;
  }
}

export async function loadSettings(): Promise<SiteSettings> {
  const s = await safe<SiteSettings | null>(() => getSettings(), null);
  if (!s) return DEFAULT_SETTINGS;
  // เติมค่าที่ขาดด้วย default
  return {
    ...DEFAULT_SETTINGS,
    ...Object.fromEntries(Object.entries(s).filter(([, v]) => v !== null && v !== undefined)),
    hero_image_url: s.hero_image_url ?? null,
    stats: Array.isArray(s.stats) ? s.stats : DEFAULT_SETTINGS.stats,
  } as SiteSettings;
}

export async function loadServices(): Promise<Service[]> {
  const list = await safe<Service[]>(() => getServices(), []);
  return list.length ? list : DEFAULT_SERVICES;
}

export const loadClients = (): Promise<Client[]> => safe(() => getClients(), []);
export const loadPackages = (): Promise<Package[]> => safe(() => getPackages(), []);
export const loadTestimonials = (): Promise<Testimonial[]> => safe(() => getTestimonials(), []);
/** ผลงาน (kind = work) เท่านั้น */
export const loadPosts = (opts: { category?: string; limit?: number; featured?: boolean } = {}): Promise<Post[]> =>
  safe(() => getPosts({ ...opts, kind: "work" }), []);
/** บทความ (kind = article) เท่านั้น */
export const loadArticles = (opts: { limit?: number; featured?: boolean } = {}): Promise<Post[]> =>
  safe(() => getPosts({ ...opts, kind: "article" }), []);
export const loadPost = (slug: string): Promise<Post | null> => safe(() => getPost(slug), null);
export const loadClient = (slug: string): Promise<Client | null> => safe(() => getClient(slug), null);
/** ผลงาน/บทความที่ทำร่วมกับลูกค้า (จับคู่ด้วยชื่อลูกค้า) */
export const loadPostsByClient = (name: string): Promise<Post[]> => safe(() => getPostsByClientName(name), []);
