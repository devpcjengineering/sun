"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, getAdminContext } from "@/lib/supabase/server";
import { canManage, ROLES } from "@/lib/types";

export type AdminFormState = { error?: string; ok?: string };

const EmailSchema = z.string().trim().toLowerCase().min(1, "กรุณากรอกอีเมล").max(254).pipe(z.email("รูปแบบอีเมลไม่ถูกต้อง"));
const RoleSchema = z.enum(ROLES, { error: "สิทธิ์ไม่ถูกต้อง" });

const NO_PERMISSION_MSG = "ไม่มีสิทธิ์ — เฉพาะแอดมินและ Dev เท่านั้นที่จัดการผู้ดูแลระบบได้";
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/** จำนวนผู้ใช้ที่มีสิทธิ์ admin หรือ dev */
async function countManagers(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { count } = await supabase.from("admins").select("email", { count: "exact", head: true }).in("role", ["admin", "dev"]);
  return count ?? 0;
}

export async function addAdmin(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const ctx = await getAdminContext();
  if (!ctx) return { error: "หมดสิทธิ์การเข้าใช้งาน กรุณาเข้าสู่ระบบใหม่" };
  if (!canManage(ctx.role)) return { error: NO_PERMISSION_MSG };

  const parsed = EmailSchema.safeParse(fd.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "อีเมลไม่ถูกต้อง" };
  const email = parsed.data;

  const roleParsed = RoleSchema.safeParse(fd.get("role") || "staff");
  if (!roleParsed.success) return { error: "สิทธิ์ไม่ถูกต้อง" };
  const role = roleParsed.data;

  const supabase = await createClient();
  const { data: dup } = await supabase.from("admins").select("email").ilike("email", escapeLike(email)).maybeSingle();
  if (dup) return { error: "อีเมลนี้เป็นผู้ดูแลระบบอยู่แล้ว" };

  const { error } = await supabase.from("admins").insert({ email, role });
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
  const me = await getAdminContext();
  if (!me) fail("หมดสิทธิ์การเข้าใช้งาน");
  if (!canManage(me.role)) fail(NO_PERMISSION_MSG);

  const parsed = EmailSchema.safeParse(fd.get("email"));
  if (!parsed.success) fail("อีเมลไม่ถูกต้อง");
  const email = parsed.data;

  if ((me.user.email ?? "").toLowerCase() === email) fail("ไม่สามารถลบตัวเองออกจากผู้ดูแลระบบได้");

  const supabase = await createClient();
  const { count } = await supabase.from("admins").select("email", { count: "exact", head: true });
  if ((count ?? 0) <= 1) fail("ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้");

  const { data: target } = await supabase.from("admins").select("role").ilike("email", escapeLike(email)).maybeSingle();
  if (target && canManage(target.role) && (await countManagers(supabase)) <= 1) {
    fail("ไม่สามารถลบแอดมิน/Dev คนสุดท้ายได้");
  }

  const { error } = await supabase.from("admins").delete().ilike("email", escapeLike(email));
  if (error) fail(`ลบไม่สำเร็จ: ${error.message}`);

  revalidatePath("/admin/admins");
  redirect("/admin/admins");
}

export async function updateAdminRole(fd: FormData) {
  const me = await getAdminContext();
  if (!me) fail("หมดสิทธิ์การเข้าใช้งาน");
  if (!canManage(me.role)) fail(NO_PERMISSION_MSG);

  const emailParsed = EmailSchema.safeParse(fd.get("email"));
  if (!emailParsed.success) fail("อีเมลไม่ถูกต้อง");
  const email = emailParsed.data;

  const roleParsed = RoleSchema.safeParse(fd.get("role"));
  if (!roleParsed.success) fail("สิทธิ์ไม่ถูกต้อง");
  const role = roleParsed.data;

  const supabase = await createClient();
  const { data: target } = await supabase.from("admins").select("role").ilike("email", escapeLike(email)).maybeSingle();
  if (!target) fail("ไม่พบผู้ดูแลระบบคนนี้");
  if (target.role === role) redirect("/admin/admins");

  const demoting = canManage(target.role) && !canManage(role);
  if (demoting) {
    if ((me.user.email ?? "").toLowerCase() === email) fail("ไม่สามารถลดสิทธิ์ของตัวเองได้");
    if ((await countManagers(supabase)) <= 1) fail("ไม่สามารถลดสิทธิ์แอดมิน/Dev คนสุดท้ายได้");
  }

  const { error } = await supabase.from("admins").update({ role }).ilike("email", escapeLike(email));
  if (error) fail(`เปลี่ยนสิทธิ์ไม่สำเร็จ: ${error.message}`);

  revalidatePath("/admin/admins");
  redirect("/admin/admins");
}
