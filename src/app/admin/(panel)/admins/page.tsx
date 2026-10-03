import type { Metadata } from "next";
import { AlertTriangle, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient, getAdminContext } from "@/lib/supabase/server";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { canManage, isRole, ROLE_LABELS, type Role } from "@/lib/types";
import { AddAdminForm } from "./AddAdminForm";
import { RoleSelect } from "./RoleSelect";
import { removeAdmin } from "./actions";

export const metadata: Metadata = { title: "ผู้ดูแลระบบ" };

type AdminRow = { email: string; role: string; created_at: string };

const ROLE_TONE: Record<Role, "gray" | "red" | "green" | "black"> = { admin: "red", dev: "black", staff: "gray" };

export default async function AdminsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const ctx = await getAdminContext();
  if (!ctx || !canManage(ctx.role)) redirect("/admin");
  const myEmail = (ctx.user.email ?? "").toLowerCase();

  const supabase = await createClient();
  const { data, error } = await supabase.from("admins").select("email, role, created_at").order("created_at", { ascending: true });
  const admins = ((data ?? []) as AdminRow[]).map((a) => ({ ...a, role: isRole(a.role) ? a.role : ("staff" as Role) }));
  const managerCount = admins.filter((a) => canManage(a.role)).length;
  const errorMsg = sp.error?.slice(0, 300) ?? (error ? `อ่านข้อมูลไม่สำเร็จ: ${error.message}` : null);

  return (
    <>
      <PageHeader title="ผู้ดูแลระบบ" desc="อีเมล Google ที่ได้รับอนุญาตให้เข้าหลังบ้านได้" />

      {errorMsg && (
        <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card className="mb-6">
        <h2 className="mb-3 font-semibold text-ink">เพิ่มผู้ดูแลระบบ</h2>
        <AddAdminForm />
      </Card>

      {admins.length === 0 ? (
        <EmptyState>ยังไม่มีผู้ดูแลระบบ</EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {admins.map((a) => {
            const isMe = a.email.toLowerCase() === myEmail;
            const isLast = admins.length <= 1 || (canManage(a.role) && managerCount <= 1);
            return (
              <li key={a.email} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  {/* มือถือ: อีเมลเต็มบรรทัดของตัวเอง ป้ายตำแหน่งอยู่บรรทัดถัดไป */}
                  <p className="text-sm font-medium text-ink [overflow-wrap:anywhere]">{a.email}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge tone={ROLE_TONE[a.role]}>{ROLE_LABELS[a.role]}</Badge>
                    {isMe && <Badge tone="black">คุณ</Badge>}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    เพิ่มเมื่อ{" "}
                    {new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeZone: "Asia/Bangkok" }).format(new Date(a.created_at))}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  {/* ลดสิทธิ์ตัวเอง / แอดมิน-Dev คนสุดท้ายไม่ได้ → ล็อก dropdown */}
                  <RoleSelect email={a.email} role={a.role} disabled={isMe || isLast} />
                {isMe || isLast ? (
                  <span className="text-xs text-muted">{isMe ? "ลบตัวเองไม่ได้" : "ผู้ดูแลคนสุดท้าย"}</span>
                ) : (
                  <form action={removeAdmin}>
                    <input type="hidden" name="email" value={a.email} />
                    <ConfirmButton
                      message={`ลบสิทธิ์ผู้ดูแลระบบของ ${a.email}?`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-brand/10 hover:text-brand"
                    >
                      <Trash2 className="size-4" />
                      ลบ
                    </ConfirmButton>
                  </form>
                )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
