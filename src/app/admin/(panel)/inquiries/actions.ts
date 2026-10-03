"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { field, idSchema, requireAdmin } from "@/components/admin/content/crud";

/** เปิดอ่านข้อความ: new → read (ไม่ revalidate เพื่อไม่ให้รายการหายจากตัวกรอง "ใหม่" ขณะกำลังอ่าน) */
export async function openInquiry(id: string) {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return;
  const sb = await createClient();
  await sb.from("inquiries").update({ status: "read" }).eq("id", parsed.data).eq("status", "new");
}

const statusSchema = z.enum(["new", "read", "done"]);

export async function setInquiryStatus(fd: FormData) {
  await requireAdmin();
  const id = idSchema.parse(field(fd, "id"));
  const status = statusSchema.parse(field(fd, "status"));
  const sb = await createClient();
  const { error } = await sb.from("inquiries").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function deleteInquiry(fd: FormData) {
  await requireAdmin();
  const id = idSchema.parse(field(fd, "id"));
  const sb = await createClient();
  const { error } = await sb.from("inquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}
