import type { Metadata } from "next";
import { AlertTriangle, Trash2 } from "lucide-react";
import { createClient, getAdminUser } from "@/lib/supabase/server";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AddAdminForm } from "./AddAdminForm";
import { removeAdmin } from "./actions";

export const metadata: Metadata = { title: "ผู้ดูแลระบบ" };

type AdminRow = { email: string; created_at: string };

export default async function AdminsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const me = await getAdminUser();
  const myEmail = (me?.email ?? "").toLowerCase();

  const supabase = await createClient();
  const { data, error } = await supabase.from("admins").select("email, created_at").order("created_at", { ascending: true });
  const admins = (data ?? []) as AdminRow[];
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
            const isLast = admins.length <= 1;
            return (
              <li key={a.email} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                    <span className="truncate">{a.email}</span>
                    {isMe && <Badge tone="black">คุณ</Badge>}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    เพิ่มเมื่อ{" "}
                    {new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeZone: "Asia/Bangkok" }).format(new Date(a.created_at))}
                  </p>
                </div>
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
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
