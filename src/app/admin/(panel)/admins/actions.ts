"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, getAdminUser } from "@/lib/supabase/server";

export type AdminFormState = { error?: string; ok?: string };

const EmailSchema = z.string().trim().toLowerCase().min(1, "กรุณากรอกอีเมล").max(254).pipe(z.email("รูปแบบอีเมลไม่ถูกต้อง"));

export async function addAdmin(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  if (!(await getAdminUser())) return { error: "หมดสิทธิ์การเข้าใช้งาน กรุณาเข้าสู่ระบบใหม่" };

  const parsed = EmailSchema.safeParse(fd.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "อีเมลไม่ถูกต้อง" };
  const email = parsed.data;

  const supabase = await createClient();
  const { data: dup } = await supabase.from("admins").select("email").ilike("email", email.replace(/[\\%_]/g, (c) => `\\${c}`)).maybeSingle();
  if (dup) return { error: "อีเมลนี้เป็นผู้ดูแลระบบอยู่แล้ว" };

  const { error } = await supabase.from("admins").insert({ email });
  if (error) {
    return { error: error.code === "23505" ? "อีเมลนี้เป็นผู้ดูแลระบบอยู่แล้ว" : `เพิ่มไม่สำเร็จ: ${error.message}` };
  }

  revalidatePath("/admin/admins");
  return { ok: `เพิ่ม ${email} เป็นผู้ดูแลระบบแล้ว` };
}

function fail(message: string): never {
  redirect(`/admin/admins?error=${encodeURIComponent(message)}`);
}

export async function removeAdmin(fd: FormData) {
  const me = await getAdminUser();
  if (!me) fail("หมดสิทธิ์การเข้าใช้งาน");

  const parsed = EmailSchema.safeParse(fd.get("email"));
  if (!parsed.success) fail("อีเมลไม่ถูกต้อง");
  const email = parsed.data;

  if ((me.email ?? "").toLowerCase() === email) fail("ไม่สามารถลบตัวเองออกจากผู้ดูแลระบบได้");

  const supabase = await createClient();
  const { count } = await supabase.from("admins").select("email", { count: "exact", head: true });
  if ((count ?? 0) <= 1) fail("ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้");

  const { error } = await supabase.from("admins").delete().ilike("email", email.replace(/[\\%_]/g, (c) => `\\${c}`));
  if (error) fail(`ลบไม่สำเร็จ: ${error.message}`);

  revalidatePath("/admin/admins");
  redirect("/admin/admins");
}
