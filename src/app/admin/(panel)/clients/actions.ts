"use server";
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

const clientSchema = z.object({
  name,
  website_url: optLink,
  logo_url: logoUrl,
  logo_public_id: logoPublicId,
});

/** เพิ่มโลโก้ทีละรายการ (ฟอร์ม inline) */
export async function createClientLogo(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return NO_PERMISSION;
  const p = parseForm(clientSchema, {
    name: field(fd, "name"),
    website_url: field(fd, "website_url"),
    logo_url: field(fd, "logo_url"),
    logo_public_id: field(fd, "logo_public_id"),
  });
  if (!p.ok) return p.state;
  const sb = await createClient();
  const sort_order = await nextSortOrder("clients");
  const { error } = await sb.from("clients").insert({ ...p.data, sort_order, published: true });
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
  const rows = p.data.map((r, i) => ({ ...r, website_url: null, sort_order: start + i, published: true }));
  const { error } = await sb.from("clients").insert(rows);
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
    website_url: field(fd, "website_url"),
    logo_url: field(fd, "logo_url"),
    logo_public_id: field(fd, "logo_public_id"),
  });
  if (!p.ok) return p.state;
  const sb = await createClient();
  const { data: old } = await sb.from("clients").select("logo_public_id").eq("id", id.data).maybeSingle();
  const { error } = await sb.from("clients").update(p.data).eq("id", id.data);
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
