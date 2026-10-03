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
  optText,
  parseForm,
  saveRow,
  sortOrderOf,
  sortOrderSchema,
  toLines,
  toggleRow,
} from "@/components/admin/content/crud";

const schema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อแพ็กเกจ").max(150, "ชื่อยาวเกิน 150 ตัวอักษร"),
  price_text: z.string().trim().min(1, "กรุณากรอกราคา (หรือพิมพ์ว่า สอบถามราคา)").max(120, "ราคายาวเกิน 120 ตัวอักษร"),
  price_note: optText(200),
  description: optText(2000),
  features: z.array(z.string().max(200, "ฟีเจอร์ยาวเกิน 200 ตัวอักษร")).max(30),
  highlight: z.boolean(),
  cta_label: z.string().trim().min(1, "กรุณากรอกข้อความปุ่ม").max(60, "ข้อความปุ่มยาวเกิน 60 ตัวอักษร"),
  sort_order: sortOrderSchema,
  published: z.boolean(),
});

export async function savePackage(_prev: ActionState, fd: FormData): Promise<ActionState> {
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
    price_text: field(fd, "price_text"),
    price_note: field(fd, "price_note"),
    description: field(fd, "description"),
    features: toLines(field(fd, "features")),
    highlight: checked(fd, "highlight"),
    cta_label: field(fd, "cta_label"),
    sort_order: sortOrderOf(fd),
    published: checked(fd, "published"),
  });
  if (!p.ok) return p.state;
  return saveRow({ table: "packages", id, values: p.data, redirectTo: "/admin/packages" });
}

export async function togglePackage(fd: FormData) {
  await toggleRow("packages", fd);
}

export async function movePackage(fd: FormData) {
  await moveRow("packages", fd);
}

export async function deletePackage(fd: FormData) {
  await deleteRow("packages", fd);
}
