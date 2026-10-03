import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import type { Inquiry } from "@/lib/types";
import { InquiryItem } from "./InquiryItem";

export const metadata: Metadata = { title: "ข้อความติดต่อ" };
export const dynamic = "force-dynamic";

const TABS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "new", label: "ใหม่" },
  { value: "read", label: "อ่านแล้ว" },
  { value: "done", label: "เสร็จสิ้น" },
] as const;

const fmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: raw } = await searchParams;
  const status = raw === "new" || raw === "read" || raw === "done" ? raw : "all";

  const sb = await createClient();
  let q = sb.from("inquiries").select("*").order("created_at", { ascending: false }).limit(300);
  if (status !== "all") q = q.eq("status", status);

  const count = (s?: string) => {
    let c = sb.from("inquiries").select("id", { count: "exact", head: true });
    if (s) c = c.eq("status", s);
    return c;
  };
  const [{ data, error }, all, cNew, cRead, cDone] = await Promise.all([
    q,
    count(),
    count("new"),
    count("read"),
    count("done"),
  ]);
  const counts: Record<string, number> = {
    all: all.count ?? 0,
    new: cNew.count ?? 0,
    read: cRead.count ?? 0,
    done: cDone.count ?? 0,
  };
  const items = (data ?? []) as Inquiry[];

  return (
    <div>
      <PageHeader title="ข้อความติดต่อ" desc="ข้อความจากฟอร์มติดต่อบนเว็บไซต์ — ใหม่ล่าสุดอยู่บนสุด" />

      <nav aria-label="กรองตามสถานะ" className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = status === t.value;
          return (
            <Link
              key={t.value}
              href={t.value === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${t.value}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:bg-soft"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-2 text-xs ${
                  active ? "bg-white/20" : t.value === "new" && counts.new > 0 ? "bg-brand text-white" : "bg-soft text-muted"
                }`}
              >
                {counts[t.value]}
              </span>
            </Link>
          );
        })}
      </nav>

      {error ? (
        <EmptyState>โหลดข้อมูลไม่สำเร็จ: {error.message}</EmptyState>
      ) : items.length === 0 ? (
        <EmptyState>{status === "all" ? "ยังไม่มีข้อความติดต่อ" : "ไม่มีข้อความในสถานะนี้"}</EmptyState>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <InquiryItem key={it.id} inquiry={it} createdLabel={fmt.format(new Date(it.created_at))} />
          ))}
        </div>
      )}
    </div>
  );
}
