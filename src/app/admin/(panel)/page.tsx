import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Circle,
  FileText,
  FilePen,
  Inbox,
  Plus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, btnDark, btnGhost, btnPrimary, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import type { Inquiry } from "@/lib/types";

export const metadata: Metadata = { title: "แดชบอร์ด" };

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string;
  value: number | null;
  icon: LucideIcon;
  href: string;
  tone?: "default" | "red";
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-line bg-white p-5 transition hover:border-ink hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span
          className={`grid size-10 place-items-center rounded-xl ${tone === "red" ? "bg-brand/10 text-brand" : "bg-soft text-ink"}`}
        >
          <Icon className="size-5" />
        </span>
        <ArrowRight className="size-4 text-muted opacity-0 transition group-hover:opacity-100" />
      </div>
      <p className="mt-4 text-3xl font-semibold text-ink">{value ?? "–"}</p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
    </Link>
  );
}

function CheckItem({ ok, title, hint }: { ok: boolean; title: string; hint?: string }) {
  return (
    <li className="flex items-start gap-3">
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
      ) : (
        <Circle className="mt-0.5 size-5 shrink-0 text-brand" />
      )}
      <div className="min-w-0">
        <p className={`text-sm font-medium ${ok ? "text-ink" : "text-brand"}`}>{title}</p>
        {!ok && hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
    </li>
  );
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(
    new Date(iso),
  );
}

const STATUS_BADGE = {
  new: { label: "ใหม่", tone: "red" },
  read: { label: "อ่านแล้ว", tone: "gray" },
  done: { label: "เสร็จสิ้น", tone: "green" },
} as const;

export default async function DashboardPage() {
  const supabase = await createClient();

  const head = (table: string) => supabase.from(table).select("id", { count: "exact", head: true });

  const [published, drafts, clients, unread, latest] = await Promise.all([
    head("posts").eq("published", true),
    head("posts").eq("published", false),
    head("clients"),
    head("inquiries").eq("status", "new"),
    supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const dbError = [published, drafts, clients, unread, latest].find((r) => r.error)?.error;
  const inquiries = (latest.data ?? []) as Inquiry[];

  // ตรวจ env แบบปลอดภัย: บอกแค่ว่า "มี/ไม่มี" ไม่เปิดเผยค่า
  const has = (k: string) => Boolean(process.env[k]);
  const supabaseOk = has("NEXT_PUBLIC_SUPABASE_URL") && has("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const siteUrlOk = has("NEXT_PUBLIC_SITE_URL");
  const hasPost = (published.count ?? 0) > 0;
  const hasClient = (clients.count ?? 0) > 0;

  const checklist = [
    {
      ok: supabaseOk && !dbError,
      title: "เชื่อมต่อ Supabase (ฐานข้อมูล + ล็อกอิน)",
      hint: dbError
        ? "ติดต่อฐานข้อมูลไม่ได้ — ตรวจว่ารัน supabase/schema.sql ใน SQL Editor แล้ว"
        : "เพิ่ม NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local",
    },
    {
      ok: siteUrlOk,
      title: "กำหนด URL ของเว็บไซต์ (สำหรับ sitemap / OG)",
      hint: "เพิ่ม NEXT_PUBLIC_SITE_URL เช่น https://www.example.com",
    },
    { ok: hasPost, title: "มีโพสต์ที่เผยแพร่แล้วอย่างน้อย 1 รายการ", hint: "ไปที่เมนู โพสต์/ผลงาน แล้วกด เขียนโพสต์ใหม่" },
    { ok: hasClient, title: "เพิ่มโลโก้ลูกค้าอย่างน้อย 1 รายการ", hint: "ไปที่เมนู ลูกค้าที่เคยร่วมงาน (โลโก้)" },
  ];
  const doneCount = checklist.filter((c) => c.ok).length;

  return (
    <>
      <PageHeader
        title="แดชบอร์ด"
        desc="ภาพรวมเว็บไซต์ SUNNAKHON GROUP"
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/posts/new" className={btnPrimary}>
              <Plus className="size-4" />
              เขียนโพสต์ใหม่
            </Link>
            <Link href="/admin/clients" className={btnDark}>
              <Building2 className="size-4" />
              เพิ่มโลโก้ลูกค้า
            </Link>
          </div>
        }
      />

      {dbError && (
        <div role="alert" className="mb-6 flex items-start gap-2.5 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>อ่านข้อมูลจากฐานข้อมูลไม่สำเร็จ: {dbError.message}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="โพสต์ที่เผยแพร่" value={dbError ? null : (published.count ?? 0)} icon={FileText} href="/admin/posts?status=published" />
        <StatCard label="โพสต์ฉบับร่าง" value={dbError ? null : (drafts.count ?? 0)} icon={FilePen} href="/admin/posts?status=draft" />
        <StatCard label="ลูกค้า/โลโก้" value={dbError ? null : (clients.count ?? 0)} icon={Building2} href="/admin/clients" />
        <StatCard label="ข้อความที่ยังไม่อ่าน" value={dbError ? null : (unread.count ?? 0)} icon={Inbox} href="/admin/inquiries" tone="red" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-ink">ข้อความติดต่อล่าสุด</h2>
            <Link href="/admin/inquiries" className="text-sm text-brand hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          {inquiries.length === 0 ? (
            <EmptyState>ยังไม่มีข้อความติดต่อเข้ามา</EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {inquiries.map((q) => {
                const s = STATUS_BADGE[q.status] ?? STATUS_BADGE.read;
                return (
                  <li key={q.id}>
                    <Link href="/admin/inquiries" className="-mx-2 block rounded-lg px-2 py-3 transition hover:bg-soft">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-ink">
                          {q.name}
                          {q.service && <span className="font-normal text-muted"> · {q.service}</span>}
                        </p>
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-muted">{q.message}</p>
                      <p className="mt-1 text-xs text-muted/80">{formatDate(q.created_at)}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-semibold text-ink">เช็กลิสต์การตั้งค่า</h2>
              <Badge tone={doneCount === checklist.length ? "green" : "red"}>
                {doneCount}/{checklist.length}
              </Badge>
            </div>
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-soft">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
            </div>
            <ul className="space-y-3.5">
              {checklist.map((c) => (
                <CheckItem key={c.title} {...c} />
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="mb-1 font-semibold text-ink">ตั้งค่าอัปโหลดรูป (Cloudinary)</h2>
            <p className="mb-3 text-xs text-muted">
              ระบบเซ็นชื่อ/ลบรูปทำงานผ่าน Supabase Edge Functions — ตรวจสอบจากหน้านี้ไม่ได้ ถ้าอัปโหลดรูปไม่ได้ให้ทำตามขั้นตอนนี้
            </p>
            <ol className="list-decimal space-y-1.5 pl-5 text-xs text-muted">
              <li>
                ตั้ง secrets:{" "}
                <code className="rounded bg-soft px-1">supabase secrets set CLOUDINARY_CLOUD_NAME=… CLOUDINARY_API_KEY=… CLOUDINARY_API_SECRET=…</code>
              </li>
              <li>
                Deploy:{" "}
                <code className="rounded bg-soft px-1">supabase functions deploy cloudinary-sign cloudinary-delete</code>
              </li>
              <li>ลองอัปโหลดรูปปกในหน้า เขียนโพสต์ใหม่ เพื่อทดสอบ</li>
            </ol>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold text-ink">ทางลัด</h2>
            <div className="grid gap-2">
              <Link href="/admin/services" className={`${btnGhost} justify-start`}>
                <Sparkles className="size-4" />
                จัดการบริการ
              </Link>
              <Link href="/admin/settings" className={`${btnGhost} justify-start`}>
                ตั้งค่าเว็บไซต์
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
