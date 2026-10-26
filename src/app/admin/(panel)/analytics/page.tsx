import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BarChart3, ExternalLink, Eye, Inbox, Monitor, Settings, Smartphone, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, btnGhost, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { countryLabel, sourceLabel } from "@/lib/analytics";
import type { AnalyticsSummary } from "@/lib/types";

export const metadata: Metadata = { title: "สถิติเข้าชม" };
export const dynamic = "force-dynamic";

const PERIODS = [
  { value: 7, label: "7 วัน" },
  { value: 30, label: "30 วัน" },
  { value: 90, label: "90 วัน" },
] as const;

const num = new Intl.NumberFormat("th-TH");
const dayFmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", timeZone: "Asia/Bangkok" });

function StatCard({ label, value, icon: Icon, hint }: { label: string; value: number; icon: typeof Eye; hint?: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-soft text-ink">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold text-ink">{num.format(value)}</p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted/80">{hint}</p>}
    </Card>
  );
}

/** กราฟแท่งรายวัน — HTML/CSS ล้วน ไม่ต้องใช้ไลบรารี */
function DailyChart({ daily }: { daily: AnalyticsSummary["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => d.views));
  const every = daily.length > 45 ? 10 : daily.length > 14 ? 5 : 1;
  return (
    <div>
      <div className="flex h-44 items-end gap-px sm:gap-0.5" role="img" aria-label="จำนวนการเข้าชมรายวัน">
        {daily.map((d) => {
          const h = Math.round((d.views / max) * 100);
          return (
            <div key={d.day} className="group relative flex h-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-brand/80 transition group-hover:bg-brand"
                style={{ height: `${Math.max(h, d.views > 0 ? 2 : 0)}%` }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] text-white group-hover:block">
                {dayFmt.format(new Date(`${d.day}T00:00:00+07:00`))} · {num.format(d.views)} วิว · {num.format(d.visitors)} คน
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-px text-[10px] text-muted sm:gap-0.5">
        {daily.map((d, i) => (
          <span key={d.day} className="flex-1 truncate text-center">
            {i % every === 0 || i === daily.length - 1 ? dayFmt.format(new Date(`${d.day}T00:00:00+07:00`)) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function RankList({
  title,
  items,
  total,
  label = (k) => k,
  empty = "ยังไม่มีข้อมูล",
}: {
  title: string;
  items: { key: string; count: number }[];
  total: number;
  label?: (key: string) => string;
  empty?: string;
}) {
  return (
    <Card>
      <h2 className="mb-3 font-semibold text-ink">{title}</h2>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">{empty}</p>
      ) : (
        <ol className="space-y-2.5">
          {items.map((it) => {
            const pct = total > 0 ? Math.round((it.count / total) * 100) : 0;
            return (
              <li key={it.key}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-ink">{label(it.key)}</span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {num.format(it.count)} <span className="text-xs">({pct}%)</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft">
                  <div className="h-full rounded-full bg-ink/80" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const sp = await searchParams;
  const days = (PERIODS.find((p) => String(p.value) === sp.days) ?? PERIODS[1]).value;

  const sb = await createClient();
  const [{ data, error }, settingsRes] = await Promise.all([
    sb.rpc("page_view_summary", { p_days: days }),
    sb.from("site_settings").select("ga_id").eq("id", 1).maybeSingle(),
  ]);
  const s = (data ?? null) as AnalyticsSummary | null;
  // รหัส GA จากหน้าตั้งค่าเว็บไซต์ก่อน ถ้าไม่มีค่อยใช้ env
  const gaFromSettings = ((settingsRes.data as { ga_id?: string | null } | null)?.ga_id ?? "").trim();
  const gaId = gaFromSettings || process.env.NEXT_PUBLIC_GA_ID || "";
  const notInstalled = !!error && /page_view_summary|schema cache|does not exist/i.test(error.message);

  const deviceCount = (k: string) => s?.devices.find((d) => d.key === k)?.count ?? 0;
  const deviceTotal = s ? s.devices.reduce((a, d) => a + d.count, 0) : 0;
  const mobilePct = deviceTotal ? Math.round((deviceCount("mobile") / deviceTotal) * 100) : 0;

  return (
    <>
      <PageHeader
        title="สถิติเข้าชม"
        desc="ยอดเข้าชมเว็บไซต์ และลูกค้ามาจากไหนบ้าง — นับจากหน้าเว็บจริง ไม่นับระบบจัดการเว็บไซต์และบอต"
        action={
          <nav aria-label="ช่วงเวลา" className="flex gap-1 rounded-lg border border-line bg-white p-1">
            {PERIODS.map((p) => {
              const active = p.value === days;
              return (
                <Link
                  key={p.value}
                  href={`/admin/analytics?days=${p.value}`}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${active ? "bg-ink text-white" : "text-muted hover:bg-soft hover:text-ink"}`}
                >
                  {p.label}
                </Link>
              );
            })}
          </nav>
        }
      />

      {error && (
        <div role="alert" className="mb-6 flex items-start gap-2.5 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            {notInstalled
              ? "ยังไม่ได้ติดตั้งตารางสถิติ — เปิด Supabase > SQL Editor แล้วรันไฟล์ supabase/schema.sql อีกครั้ง"
              : `โหลดสถิติไม่สำเร็จ: ${error.message}`}
          </span>
        </div>
      )}

      {s && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label={`การเข้าชม (${days} วัน)`} value={s.views} icon={Eye} />
            <StatCard label="ผู้เข้าชมไม่ซ้ำ" value={s.visitors} icon={Users} hint="นับต่อวัน ไม่ระบุตัวตน" />
            <StatCard label="ข้อความติดต่อ" value={s.inquiries} icon={Inbox} />
            <Card>
              <div className="flex items-center gap-2">
                <span className="grid size-10 place-items-center rounded-xl bg-soft text-ink">
                  <Smartphone className="size-5" />
                </span>
                <span className="grid size-10 place-items-center rounded-xl bg-soft text-ink">
                  <Monitor className="size-5" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-ink">{mobilePct}%</p>
              <p className="mt-0.5 text-sm text-muted">เข้าจากมือถือ</p>
              <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-soft">
                <div className="h-full bg-brand" style={{ width: `${mobilePct}%` }} />
              </div>
            </Card>
          </div>

          <Card className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-ink">การเข้าชมรายวัน</h2>
              <Badge tone="gray">เวลาไทย</Badge>
            </div>
            {s.views === 0 ? (
              <EmptyState>ยังไม่มีการเข้าชมในช่วงนี้ — เปิดหน้าเว็บสักครั้งแล้วรีเฟรชหน้านี้</EmptyState>
            ) : (
              <DailyChart daily={s.daily} />
            )}
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <RankList title="ลูกค้ามาจากไหน (ผู้เข้าชม)" items={s.sources} total={s.sources.reduce((a, x) => a + x.count, 0)} label={sourceLabel} empty="ยังไม่มีข้อมูล — ช่องทางที่ลิงก์มาจะขึ้นที่นี่ เช่น Facebook, Google, LINE" />
            <RankList title="ลูกค้าที่ส่งข้อความ มาจากไหน" items={s.inquiry_sources} total={s.inquiries} label={(k) => (k === "unknown" ? "ไม่ทราบ (ข้อความเก่า)" : sourceLabel(k))} empty="ยังไม่มีข้อความติดต่อในช่วงนี้" />
            <RankList title="หน้าที่คนดูมากที่สุด" items={s.pages} total={s.views} />
            <RankList title="ประเทศ" items={s.countries} total={s.views} label={(k) => (k === "??" ? "ไม่ทราบ (ทดสอบในเครื่อง)" : countryLabel(k))} />
          </div>
        </>
      )}

      <Card className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <BarChart3 className="size-4" /> Google Analytics 4
            </h2>
            {gaId ? (
              <p className="mt-1 text-sm text-muted">
                เชื่อมต่อแล้ว (<span className="font-mono">{gaId}</span>
                {!gaFromSettings && " จาก env"}) — รายงานละเอียด เช่น เวลาบนหน้า, เพศ/อายุ, Google Ads ดูได้ที่ Google Analytics
              </p>
            ) : (
              <div className="mt-1 space-y-1 text-sm text-muted">
                <p>ยังไม่ได้เชื่อมต่อ — เปิดใช้ฟรีได้ใน 2 ขั้น:</p>
                <ol className="list-decimal space-y-0.5 pl-5">
                  <li>
                    สร้าง Property ที่ analytics.google.com → Admin → Data Streams → Web แล้วคัดลอก <span className="font-mono">Measurement ID (G-XXXXXXXXXX)</span>
                  </li>
                  <li>
                    นำไปวางที่{" "}
                    <Link href="/admin/settings" className="font-medium text-brand hover:underline">
                      ตั้งค่าเว็บไซต์ → แท็บ SEO → Google Analytics
                    </Link>{" "}
                    แล้วกดบันทึก (มีผลทันที ไม่ต้อง deploy ใหม่)
                  </li>
                </ol>
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/admin/settings" className={btnGhost}>
              <Settings className="size-4" />
              แก้รหัส GA
            </Link>
            <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className={btnGhost}>
              <ExternalLink className="size-4" />
              เปิด Google Analytics
            </a>
          </div>
        </div>
      </Card>
    </>
  );
}
