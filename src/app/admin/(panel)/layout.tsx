import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, getAdminUser } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/shell/AdminShell";

export const metadata: Metadata = {
  title: { default: "หลังบ้าน", template: "%s | หลังบ้าน SUNNAKHON" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) {
    // แยกกรณี "ยังไม่ล็อกอิน" กับ "ล็อกอินแล้วแต่ไม่ใช่แอดมิน"
    const supabase = await createClient();
    const {
      data: { user: anyUser },
    } = await supabase.auth.getUser();
    redirect(anyUser ? "/login?error=not_admin" : "/login");
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v ? v : null);

  return (
    <AdminShell
      user={{
        email: user.email ?? "",
        name: str(meta.full_name) ?? str(meta.name),
        avatar: str(meta.avatar_url) ?? str(meta.picture),
      }}
      unread={count ?? 0}
    >
      {children}
    </AdminShell>
  );
}
