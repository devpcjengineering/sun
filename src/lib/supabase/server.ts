import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { isRole, type Role } from "@/lib/types";

/** Supabase client สำหรับ Server Component / Server Action / Route Handler */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // เรียกจาก Server Component — proxy.ts จะ refresh session ให้แล้ว
          }
        },
      },
    },
  );
}

/** คืน {user, role} ถ้าล็อกอินและอยู่ในตาราง admins ไม่งั้นคืน null */
export async function getAdminContext(): Promise<{ user: User; role: Role } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: ok } = await supabase.rpc("is_admin");
  if (!ok) return null;
  const { data: r } = await supabase.rpc("admin_role");
  // ถ้าอ่านสิทธิ์ไม่ได้ ให้ถือเป็นสิทธิ์ต่ำสุด (staff)
  const role: Role = isRole(r) ? r : "staff";
  return { user, role };
}

/** คืน user ถ้าล็อกอินและอยู่ในตาราง admins ไม่งั้นคืน null */
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: ok } = await supabase.rpc("is_admin");
  return ok ? user : null;
}
