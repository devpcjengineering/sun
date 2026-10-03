import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, getAdminUser } from "@/lib/supabase/server";
import { CLOUDINARY_ROOT } from "@/lib/cloudinary";
import { deleteCloudinaryImages } from "@/lib/cloudinary-server";
import type { ActionState } from "./FormMessage";

// helper ฝั่ง server ที่ใช้ร่วมกันใน actions.ts ของทุกโมดูล (ไม่ใช่ "use server" — import ได้เฉพาะจาก server)

export type OrderedTable = "clients" | "services" | "packages" | "testimonials";

export const NO_PERMISSION: ActionState = {
  ok: false,
  error: "ไม่มีสิทธิ์ดำเนินการ — กรุณาเข้าสู่ระบบแอดมินอีกครั้ง",
};

/** ใช้กับ action ที่ไม่มี state: ไม่ใช่แอดมินให้ throw */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function isAdmin() {
  return !!(await getAdminUser());
}

export function revalidateSite() {
  revalidatePath("/", "layout");
}

/** ลบรูปจาก Cloudinary (เฉพาะรูปของโปรเจกต์นี้ — public_id ต้องขึ้นต้นด้วย sunnakhon/) */
export async function destroyImage(publicId: string | null | undefined) {
  await deleteCloudinaryImages([publicId]);
}

// ───────── อ่านค่าจาก FormData ─────────
export function field(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export function checked(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true";
}

/** textarea หนึ่งบรรทัด = หนึ่งรายการ */
export function toLines(value: string, max = 30): string[] {
  return value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** sort_order: ว่าง = null (ให้ระบบใส่ท้ายสุด) */
export function sortOrderOf(fd: FormData): number | null {
  const raw = field(fd, "sort_order").trim();
  return raw === "" ? null : Number(raw);
}

// ───────── zod schemas ที่ใช้ซ้ำ ─────────
export const sortOrderSchema = z
  .number({ error: "ลำดับต้องเป็นตัวเลข" })
  .int("ลำดับต้องเป็นจำนวนเต็ม")
  .min(0, "ลำดับต้องไม่ติดลบ")
  .max(9999)
  .nullable();

/** ข้อความไม่บังคับ — ว่างเป็น null */
export const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `ยาวเกิน ${max} ตัวอักษร`)
    .transform((v) => v || null);

/** ลิงก์ไม่บังคับ (http/https) — ว่างเป็น null */
export const optLink = z
  .string()
  .trim()
  .max(500, "ลิงก์ยาวเกินไป")
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://")
  .transform((v) => v || null);

/** URL รูปที่มาจาก Cloudinary เท่านั้น */
export const optImageUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || v.startsWith("https://res.cloudinary.com/"), "ที่อยู่รูปภาพไม่ถูกต้อง")
  .transform((v) => v || null);

export const optPublicId = z
  .string()
  .trim()
  .refine((v) => v === "" || v.startsWith(`${CLOUDINARY_ROOT}/`), "รหัสรูปภาพไม่ถูกต้อง")
  .transform((v) => v || null);

export const idSchema = z.uuid({ error: "รหัสรายการไม่ถูกต้อง" });

export function parseForm<T extends z.ZodType>(
  schema: T,
  raw: unknown,
): { ok: true; data: z.output<T> } | { ok: false; state: ActionState } {
  const r = schema.safeParse(raw);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, state: { ok: false, error: r.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" } };
}

// ───────── CRUD ทั่วไป ─────────
export async function nextSortOrder(table: OrderedTable): Promise<number> {
  const sb = await createClient();
  const { data } = await sb.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  return ((data?.[0]?.sort_order as number | undefined) ?? 0) + 1;
}

/**
 * สร้าง/แก้ไขแถวแล้ว redirect กลับหน้ารายการ
 * - sort_order เป็น null → สร้างใหม่ใส่ท้ายสุด / แก้ไขคงค่าเดิม
 * - imageCol (เช่น "cover_public_id") → ถ้ารูปเปลี่ยนจะลบรูปเก่าออกจาก Cloudinary
 */
export async function saveRow(opts: {
  table: OrderedTable;
  id: string | null;
  values: Record<string, unknown> & { sort_order: number | null };
  imageCol?: string;
  redirectTo: string;
  uniqueMessage?: string;
}): Promise<ActionState> {
  if (!(await isAdmin())) return NO_PERMISSION;
  const sb = await createClient();
  const { table, id, imageCol } = opts;
  const values: Record<string, unknown> = { ...opts.values };
  let oldImage: string | null = null;

  if (id) {
    if (values.sort_order === null) delete values.sort_order;
    if (imageCol) {
      const { data: old } = await sb.from(table).select(imageCol).eq("id", id).maybeSingle();
      oldImage = ((old as unknown as Record<string, string | null> | null)?.[imageCol] ?? null) as string | null;
    }
    const { error } = await sb.from(table).update(values).eq("id", id);
    if (error) return { ok: false, error: error.code === "23505" ? (opts.uniqueMessage ?? "ข้อมูลซ้ำ") : error.message };
  } else {
    if (values.sort_order === null) values.sort_order = await nextSortOrder(table);
    const { error } = await sb.from(table).insert(values);
    if (error) return { ok: false, error: error.code === "23505" ? (opts.uniqueMessage ?? "ข้อมูลซ้ำ") : error.message };
  }

  if (imageCol && oldImage && oldImage !== values[imageCol]) await destroyImage(oldImage);
  revalidateSite();
  redirect(opts.redirectTo);
}

/** สลับสถานะเผยแพร่ (FormData: id, published=true|false) */
export async function toggleRow(table: OrderedTable, fd: FormData) {
  await requireAdmin();
  const id = idSchema.parse(field(fd, "id"));
  const published = field(fd, "published") === "true";
  const sb = await createClient();
  const { error } = await sb.from(table).update({ published }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateSite();
}

/** เลื่อนลำดับขึ้น/ลง (FormData: id, dir=up|down) — จัด sort_order ใหม่เป็น 1..n กันค่าซ้ำ */
export async function moveRow(table: OrderedTable, fd: FormData) {
  await requireAdmin();
  const id = idSchema.parse(field(fd, "id"));
  const dir = field(fd, "dir") === "up" ? -1 : 1;
  const sb = await createClient();
  const { data, error } = await sb
    .from(table)
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as { id: string; sort_order: number }[];
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return;
  [rows[i], rows[j]] = [rows[j], rows[i]];
  const updates = rows
    .map((r, idx) => ({ id: r.id, order: idx + 1, prev: r.sort_order }))
    .filter((r) => r.order !== r.prev);
  const results = await Promise.all(updates.map((u) => sb.from(table).update({ sort_order: u.order }).eq("id", u.id)));
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
  revalidateSite();
}

/** ลบแถว (FormData: id) และลบรูปบน Cloudinary ถ้ามี imageCol */
export async function deleteRow(table: OrderedTable, fd: FormData, imageCol?: string) {
  await requireAdmin();
  const id = idSchema.parse(field(fd, "id"));
  const sb = await createClient();
  let image: string | null = null;
  if (imageCol) {
    const { data } = await sb.from(table).select(imageCol).eq("id", id).maybeSingle();
    image = ((data as unknown as Record<string, string | null> | null)?.[imageCol] ?? null) as string | null;
  }
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  await destroyImage(image);
  revalidateSite();
}
