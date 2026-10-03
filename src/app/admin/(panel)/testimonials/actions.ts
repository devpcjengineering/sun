"use server";
import { z } from "zod";
import type { ActionState } from "@/components/admin/content/FormMessage";
import {
  NO_PERMISSION,
  checked,
  deleteRow,
  field,
  idSchema,
  isAdmin,
  moveRow,
  optImageUrl,
  optPublicId,
  optText,
  parseForm,
  saveRow,
  sortOrderOf,
  sortOrderSchema,
  toggleRow,
} from "@/components/admin/content/crud";

const schema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(120, "ชื่อยาวเกิน 120 ตัวอักษร"),
  role: optText(160),
  content: z.string().trim().min(1, "กรุณากรอกข้อความรีวิว").max(2000, "ข้อความยาวเกิน 2,000 ตัวอักษร"),
  avatar_url: optImageUrl,
  avatar_public_id: optPublicId,
  rating: z
    .number({ error: "คะแนนต้องเป็นตัวเลข" })
    .int("คะแนนต้องเป็นจำนวนเต็ม")
    .min(1, "คะแนนต่ำสุดคือ 1")
    .max(5, "คะแนนสูงสุดคือ 5"),
  sort_order: sortOrderSchema,
  published: z.boolean(),
});

export async function saveTestimonial(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return NO_PERMISSION;
  const idRaw = field(fd, "id");
  let id: string | null = null;
  if (idRaw) {
    const r = idSchema.safeParse(idRaw);
    if (!r.success) return { ok: false, error: "รหัสรายการไม่ถูกต้อง" };
    id = r.data;
  }
  const p = parseForm(schema, {
    name: field(fd, "name"),
    role: field(fd, "role"),
    content: field(fd, "content"),
    avatar_url: field(fd, "avatar_url"),
    avatar_public_id: field(fd, "avatar_public_id"),
    rating: Number(field(fd, "rating") || 5),
    sort_order: sortOrderOf(fd),
    published: checked(fd, "published"),
  });
  if (!p.ok) return p.state;
  return saveRow({
    table: "testimonials",
    id,
    values: p.data,
    imageCol: "avatar_public_id",
    redirectTo: "/admin/testimonials",
  });
}

export async function toggleTestimonial(fd: FormData) {
  await toggleRow("testimonials", fd);
}

export async function moveTestimonial(fd: FormData) {
  await moveRow("testimonials", fd);
}

export async function deleteTestimonial(fd: FormData) {
  await deleteRow("testimonials", fd, "avatar_public_id");
}
