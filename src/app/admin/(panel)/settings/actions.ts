"use server";
import { z } from "zod";
import { createClient, getAdminContext } from "@/lib/supabase/server";
import { canManage } from "@/lib/types";
import type { ActionState } from "@/components/admin/content/FormMessage";
import {
  NO_PERMISSION,
  destroyImage,
  field,
  optImageUrl,
  optLink,
  optPublicId,
  optText,
  revalidateSite,
} from "@/components/admin/content/crud";

const text = (max: number) => z.string().trim().max(max, `ยาวเกิน ${max} ตัวอักษร`);
const link = z
  .string()
  .trim()
  .max(500, "ลิงก์ยาวเกินไป")
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://");

const schema = z.object({
  hero_eyebrow: text(100),
  hero_title: text(300).min(1, "กรุณากรอกหัวข้อหลักของหน้าแรก"),
  hero_subtitle: text(1000),
  hero_image_url: optImageUrl,
  hero_image_public_id: optPublicId,

  why_title: text(200),
  why_text: text(3000),

  stats: z
    .array(
      z.object({
        value: text(30).min(1, "สถิติแต่ละรายการต้องมีตัวเลข/ค่า"),
        label: text(80).min(1, "สถิติแต่ละรายการต้องมีคำอธิบาย"),
      }),
    )
    .max(8, "เพิ่มสถิติได้ไม่เกิน 8 รายการ"),

  cta_title: text(200),
  cta_text: text(500),

  phone: text(40).min(1, "กรุณากรอกเบอร์โทร"),
  email: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || z.email().safeParse(v).success, "รูปแบบอีเมลไม่ถูกต้อง")
    .transform((v) => v || null),
  line_id: text(80),
  line_url: optLink,
  facebook_url: link,
  instagram_url: optLink,
  tiktok_url: optLink,
  youtube_url: optLink,
  address: optText(500),
  map_url: optLink,

  seo_title: text(120).min(1, "กรุณากรอก SEO title"),
  seo_description: text(300),
});

const LABELS: Record<string, string> = {
  hero_eyebrow: "Hero · ข้อความเล็กด้านบน",
  hero_title: "Hero · หัวข้อหลัก",
  hero_subtitle: "Hero · คำอธิบาย",
  hero_image_url: "Hero · รูปภาพ",
  hero_image_public_id: "Hero · รูปภาพ",
  why_title: "ทำไมต้องเรา · หัวข้อ",
  why_text: "ทำไมต้องเรา · ข้อความ",
  stats: "สถิติ",
  cta_title: "CTA · หัวข้อ",
  cta_text: "CTA · ข้อความ",
  phone: "ติดต่อ · เบอร์โทร",
  email: "ติดต่อ · อีเมล",
  line_id: "ติดต่อ · LINE ID",
  line_url: "ติดต่อ · ลิงก์ LINE",
  facebook_url: "ติดต่อ · Facebook",
  instagram_url: "ติดต่อ · Instagram",
  tiktok_url: "ติดต่อ · TikTok",
  youtube_url: "ติดต่อ · YouTube",
  address: "ติดต่อ · ที่อยู่",
  map_url: "ติดต่อ · ลิงก์แผนที่",
  seo_title: "SEO · Title",
  seo_description: "SEO · Description",
};

export async function saveSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await getAdminContext();
  if (!ctx) return NO_PERMISSION;
  if (!canManage(ctx.role)) return { ok: false, error: "ไม่มีสิทธิ์ — เฉพาะแอดมินและ Dev เท่านั้นที่แก้ไขการตั้งค่าเว็บไซต์ได้" };

  const values = fd.getAll("stats_value").map((v) => (typeof v === "string" ? v : ""));
  const labels = fd.getAll("stats_label").map((v) => (typeof v === "string" ? v : ""));
  const stats = values
    .map((value, i) => ({ value, label: labels[i] ?? "" }))
    .filter((s) => s.value.trim() !== "" || s.label.trim() !== "");

  const parsed = schema.safeParse({
    hero_eyebrow: field(fd, "hero_eyebrow"),
    hero_title: field(fd, "hero_title"),
    hero_subtitle: field(fd, "hero_subtitle"),
    hero_image_url: field(fd, "hero_image_url"),
    hero_image_public_id: field(fd, "hero_image_public_id"),
    why_title: field(fd, "why_title"),
    why_text: field(fd, "why_text"),
    stats,
    cta_title: field(fd, "cta_title"),
    cta_text: field(fd, "cta_text"),
    phone: field(fd, "phone"),
    email: field(fd, "email"),
    line_id: field(fd, "line_id"),
    line_url: field(fd, "line_url"),
    facebook_url: field(fd, "facebook_url"),
    instagram_url: field(fd, "instagram_url"),
    tiktok_url: field(fd, "tiktok_url"),
    youtube_url: field(fd, "youtube_url"),
    address: field(fd, "address"),
    map_url: field(fd, "map_url"),
    seo_title: field(fd, "seo_title"),
    seo_description: field(fd, "seo_description"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const key = String(issue?.path[0] ?? "");
    const label = LABELS[key] ? `${LABELS[key]}: ` : "";
    return { ok: false, error: `${label}${issue?.message ?? "ข้อมูลไม่ถูกต้อง"}` };
  }
  const p = { data: parsed.data };

  const sb = await createClient();
  const { data: old } = await sb.from("site_settings").select("hero_image_public_id").eq("id", 1).maybeSingle();
  const { error } = await sb.from("site_settings").upsert({ id: 1, ...p.data }, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };

  if (old?.hero_image_public_id && old.hero_image_public_id !== p.data.hero_image_public_id) {
    await destroyImage(old.hero_image_public_id);
  }
  revalidateSite();
  return { ok: true, message: "บันทึกการตั้งค่าเรียบร้อยแล้ว" };
}
