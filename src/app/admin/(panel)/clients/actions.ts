"use server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CLOUDINARY_ROOT } from "@/lib/cloudinary";
import type { ActionState } from "@/components/admin/content/FormMessage";
import {
  NO_PERMISSION,
  deleteRow,
  destroyImage,
  field,
  idSchema,
  isAdmin,
  moveRow,
  nextSortOrder,
  optLink,
  optText,
  parseForm,
  revalidateSite,
  toggleRow,
} from "@/components/admin/content/crud";

const logoUrl = z
  .string()
  .trim()
  .refine((v) => v.startsWith("https://res.cloudinary.com/"), "กรุณาอัปโหลดโลโก้");
const logoPublicId = z
  .string()
  .trim()
  .refine((v) => v.startsWith(`${CLOUDINARY_ROOT}/`), "รหัสรูปภาพไม่ถูกต้อง");
const name = z.string().trim().min(1, "กรุณากรอกชื่อลูกค้า").max(120, "ชื่อยาวเกิน 120 ตัวอักษร");

/** slug ที่ผู้ใช้กรอกเอง — ว่างได้ (null = สร้างให้อัตโนมัติ) */
const slugField = z
  .string()
  .trim()
  .max(80, "slug ยาวเกิน 80 ตัวอักษร")
  .refine(
    (v) => v === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
    "slug ใช้ได้เฉพาะ a-z, 0-9 และขีดกลาง (-) เช่น kasetsart-university",
  )
  .transform((v) => v || null);

const clientSchema = z.object({
  name,
  slug: slugField,
  description: optText(2000),
  website_url: optLink,
  logo_url: logoUrl,
  logo_public_id: logoPublicId,
});

const SLUG_TAKEN = "slug นี้ถูกใช้แล้ว กรุณาเปลี่ยนเป็นค่าอื่น";
const SLUG_BASE_MAX = 70; // เหลือที่ให้ suffix -2, -3, …

type Sb = Awaited<ReturnType<typeof createClient>>;

const randomHex = (bytes: number) => randomBytes(bytes).toString("hex");

/** slug จากชื่อ (เฉพาะ a-z 0-9 -) — ถ้าไม่มีตัวอักษรละติน/ตัวเลขเลยใช้ c-<hex 8 ตัว> */
function slugFromName(value: string): string {
  const s = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_BASE_MAX)
    .replace(/-+$/g, "");
  return s || `c-${randomHex(4)}`;
}

/** slug นี้มีลูกค้าอื่นใช้อยู่แล้วหรือไม่ */
async function slugTaken(sb: Sb, slug: string, excludeId?: string): Promise<boolean> {
  let q = sb.from("clients").select("id").eq("slug", slug).limit(1);
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q;
  return (data?.length ?? 0) > 0;
}

/** หา slug ที่ไม่ซ้ำ: base, base-2, base-3, … (`used` = slug ที่จองไว้ในชุดเดียวกัน) */
async function uniqueSlug(sb: Sb, base: string, used: Set<string> = new Set()): Promise<string> {
  const { data } = await sb.from("clients").select("slug").ilike("slug", `${base}%`).limit(1000);
  const taken = new Set<string>(used);
  for (const r of data ?? []) if (r.slug) taken.add(r.slug as string);
  let candidate = base;
  for (let n = 2; taken.has(candidate) && n < 1000; n++) candidate = `${base}-${n}`;
  if (taken.has(candidate)) candidate = `${base}-${randomHex(3)}`;
  used.add(candidate);
  return candidate;
}

const isUniqueViolation = (e: { code?: string } | null) => e?.code === "23505";

/** เพิ่มโลโก้ทีละรายการ (ฟอร์ม inline) */
export async function createClientLogo(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return NO_PERMISSION;
  const p = parseForm(clientSchema, {
    name: field(fd, "name"),
    slug: field(fd, "slug").trim().toLowerCase(),
    description: field(fd, "description"),
    website_url: field(fd, "website_url"),
    logo_url: field(fd, "logo_url"),
    logo_public_id: field(fd, "logo_public_id"),
  });
  if (!p.ok) return p.state;
  const sb = await createClient();
  const typed = p.data.slug;
  if (typed && (await slugTaken(sb, typed))) return { ok: false, error: SLUG_TAKEN };
  const sort_order = await nextSortOrder("clients");
  const base = typed ?? slugFromName(p.data.name);
  let slug = typed ?? (await uniqueSlug(sb, base));
  let { error } = await sb.from("clients").insert({ ...p.data, slug, sort_order, published: true });
  if (isUniqueViolation(error)) {
    if (typed) return { ok: false, error: SLUG_TAKEN };
    // ชนกันพอดี (race) → ต่อท้ายด้วยรหัสสุ่มแล้วลองอีกครั้ง
    slug = `${base}-${randomHex(3)}`;
    ({ error } = await sb.from("clients").insert({ ...p.data, slug, sort_order, published: true }));
  }
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true, message: `เพิ่มโลโก้ "${p.data.name}" แล้ว` };
}

const bulkSchema = z
  .array(z.object({ name, logo_url: logoUrl, logo_public_id: logoPublicId }))
  .min(1, "ไม่มีรายการ")
  .max(100, "เพิ่มได้ครั้งละไม่เกิน 100 รายการ");

/** เพิ่มโลโก้หลายรายการ — รูปถูกอัปโหลดขึ้น Cloudinary จาก browser แล้ว เหลือบันทึกลง DB */
export async function bulkCreateClients(
  items: { name: string; logo_url: string; logo_public_id: string }[],
): Promise<ActionState> {
  if (!(await isAdmin())) return NO_PERMISSION;
  const p = parseForm(bulkSchema, items);
  if (!p.ok) return p.state;
  const sb = await createClient();
  const start = await nextSortOrder("clients");
  const build = async () => {
    const used = new Set<string>();
    const out = [];
    for (const [i, r] of p.data.entries()) {
      const slug = await uniqueSlug(sb, slugFromName(r.name), used);
      out.push({ ...r, slug, description: null, website_url: null, sort_order: start + i, published: true });
    }
    return out;
  };
  let rows = await build();
  let { error } = await sb.from("clients").insert(rows);
  if (isUniqueViolation(error)) {
    // slug ชนกันพอดี (race) → สร้างใหม่แล้วลองอีกครั้ง
    rows = await build();
    ({ error } = await sb.from("clients").insert(rows));
  }
  if (error) {
    // บันทึกไม่สำเร็จ → เก็บกวาดรูปที่เพิ่งอัปโหลด
    await Promise.all(p.data.map((r) => destroyImage(r.logo_public_id)));
    return { ok: false, error: error.message };
  }
  revalidateSite();
  return { ok: true, message: `เพิ่มโลโก้ ${rows.length} รายการแล้ว` };
}

/** แก้ไขชื่อ/เว็บไซต์/โลโก้ของลูกค้า */
export async function updateClientLogo(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return NO_PERMISSION;
  const id = idSchema.safeParse(field(fd, "id"));
  if (!id.success) return { ok: false, error: "รหัสรายการไม่ถูกต้อง" };
  const p = parseForm(clientSchema, {
    name: field(fd, "name"),
    slug: field(fd, "slug").trim().toLowerCase(),
    description: field(fd, "description"),
    website_url: field(fd, "website_url"),
    logo_url: field(fd, "logo_url"),
    logo_public_id: field(fd, "logo_public_id"),
  });
  if (!p.ok) return p.state;
  const sb = await createClient();
  const { data: old } = await sb.from("clients").select("logo_public_id, slug").eq("id", id.data).maybeSingle();

  // slug: เปลี่ยนเฉพาะเมื่อผู้ใช้กรอกค่าใหม่ — แก้ชื่อไม่ทำให้ slug เดิมเปลี่ยน
  const { slug: typed, ...rest } = p.data;
  let slug: string | null = old?.slug ?? null;
  if (typed && typed !== slug) {
    if (await slugTaken(sb, typed, id.data)) return { ok: false, error: SLUG_TAKEN };
    slug = typed;
  } else if (!slug) {
    slug = await uniqueSlug(sb, slugFromName(p.data.name));
  }

  const { error } = await sb
    .from("clients")
    .update({ ...rest, slug })
    .eq("id", id.data);
  if (isUniqueViolation(error)) return { ok: false, error: SLUG_TAKEN };
  if (error) return { ok: false, error: error.message };
  if (old?.logo_public_id && old.logo_public_id !== p.data.logo_public_id) await destroyImage(old.logo_public_id);
  revalidateSite();
  return { ok: true, message: "บันทึกแล้ว" };
}

export async function toggleClient(fd: FormData) {
  await toggleRow("clients", fd);
}

export async function moveClient(fd: FormData) {
  await moveRow("clients", fd);
}

export async function deleteClient(fd: FormData) {
  await deleteRow("clients", fd, "logo_public_id");
}
