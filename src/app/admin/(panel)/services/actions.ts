"use server";
import { z } from "zod";
import type { ActionState } from "@/components/admin/content/FormMessage";
import { ICON_VALUES } from "@/components/admin/content/icons";
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
  toLines,
  toggleRow,
} from "@/components/admin/content/crud";

const schema = z.object({
  title: z.string().trim().min(1, "กรุณากรอกชื่อบริการ").max(150, "ชื่อยาวเกิน 150 ตัวอักษร"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "กรุณากรอก slug")
    .max(100, "slug ยาวเกิน 100 ตัวอักษร")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug ใช้ได้เฉพาะ a-z, 0-9 และขีดกลาง (-) เช่น event-organizer"),
  subtitle: optText(200),
  description: optText(3000),
  icon: z.enum(ICON_VALUES, { error: "เลือกไอคอนจากรายการ" }),
  cover_url: optImageUrl,
  cover_public_id: optPublicId,
  features: z.array(z.string().max(200, "จุดเด่นยาวเกิน 200 ตัวอักษร")).max(30),
  sort_order: sortOrderSchema,
  published: z.boolean(),
});

export async function saveService(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return NO_PERMISSION;
  const idRaw = field(fd, "id");
  let id: string | null = null;
  if (idRaw) {
    const r = idSchema.safeParse(idRaw);
    if (!r.success) return { ok: false, error: "รหัสรายการไม่ถูกต้อง" };
    id = r.data;
  }
  const p = parseForm(schema, {
    title: field(fd, "title"),
    slug: field(fd, "slug"),
    subtitle: field(fd, "subtitle"),
    description: field(fd, "description"),
    icon: field(fd, "icon"),
    cover_url: field(fd, "cover_url"),
    cover_public_id: field(fd, "cover_public_id"),
    features: toLines(field(fd, "features")),
    sort_order: sortOrderOf(fd),
    published: checked(fd, "published"),
  });
  if (!p.ok) return p.state;
  return saveRow({
    table: "services",
    id,
    values: p.data,
    imageCol: "cover_public_id",
    redirectTo: "/admin/services",
    uniqueMessage: "slug นี้ถูกใช้แล้ว กรุณาใช้ slug อื่น",
  });
}

export async function toggleService(fd: FormData) {
  await toggleRow("services", fd);
}

export async function moveService(fd: FormData) {
  await moveRow("services", fd);
}

export async function deleteService(fd: FormData) {
  await deleteRow("services", fd, "cover_public_id");
}
