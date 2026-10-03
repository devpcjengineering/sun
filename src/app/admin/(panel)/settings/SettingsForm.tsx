"use client";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Card, Field, btnGhost, inputCls } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { FormMessage } from "@/components/admin/content/FormMessage";
import { SaveButton, useSaveForm } from "@/components/admin/content/useSaveForm";
import { SERVICE_ICONS, ServiceIcon } from "@/components/admin/content/icons";
import type { SiteSettings } from "@/lib/types";
import { saveSettings } from "./actions";

const TABS = [
  { id: "hero", label: "หน้าแรก (Hero)" },
  { id: "why", label: "ทำไมต้องเรา" },
  { id: "band", label: "แถบเด่นหน้าแรก" },
  { id: "stats", label: "สถิติ" },
  { id: "cta", label: "CTA" },
  { id: "contact", label: "ช่องทางติดต่อ" },
  { id: "seo", label: "SEO" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const MAX_STATS = 8;
const MAX_CAPS = 6;
const MAX_TICKER = 12;

export function SettingsForm({ settings: s }: { settings: SiteSettings }) {
  const uid = useId();
  const { state, pending, onSubmit } = useSaveForm(saveSettings);
  const [tab, setTab] = useState<TabId>("hero");
  const [hero, setHero] = useState({ url: s.hero_image_url, public_id: s.hero_image_public_id });
  const keySeq = useRef(s.stats.length);
  const [stats, setStats] = useState(() => s.stats.map((x, i) => ({ key: i, value: x.value, label: x.label })));

  const capSeq = useRef((s.capabilities ?? []).length);
  const [caps, setCaps] = useState(() =>
    (s.capabilities ?? []).map((c, i) => ({ key: i, icon: c.icon, title: c.title, text: c.text })),
  );
  const patchCap = (key: number, patch: Partial<{ icon: string; title: string; text: string }>) =>
    setCaps((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const moveCap = (index: number, dir: -1 | 1) =>
    setCaps((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });

  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = (id: string) => `${uid}-panel-${id}`;

  function onTabKey(e: KeyboardEvent, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = TABS[(index + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length].id;
    setTab(next);
    document.getElementById(tabId(next))?.focus();
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div role="tablist" aria-label="หมวดการตั้งค่า" className="mb-5 grid grid-cols-2 gap-1 sm:flex sm:flex-wrap">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            id={tabId(t.id)}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={panelId(t.id)}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={`rounded-lg px-4 py-2 text-center text-sm font-medium transition ${
              tab === t.id ? "bg-ink text-white" : "text-muted hover:bg-soft hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ทุกหมวดอยู่ใน DOM เสมอ (ซ่อนด้วย hidden) เพื่อให้ส่งค่าทั้งหมดพร้อมกัน */}
      <Panel id={panelId("hero")} labelledBy={tabId("hero")} active={tab === "hero"}>
        <Card className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-4">
            <Field label="ข้อความเล็กด้านบน (eyebrow)">
              <input name="hero_eyebrow" maxLength={100} defaultValue={s.hero_eyebrow} className={inputCls} />
            </Field>
            <Field label="หัวข้อหลัก">
              <textarea name="hero_title" rows={3} maxLength={300} defaultValue={s.hero_title} className={inputCls} />
            </Field>
            <Field label="คำอธิบาย">
              <textarea
                name="hero_subtitle"
                rows={5}
                maxLength={1000}
                defaultValue={s.hero_subtitle}
                className={inputCls}
              />
            </Field>
          </div>
          <ImageUpload folder="site" name="hero_image" label="รูป Hero" value={hero} onChange={setHero} />
        </Card>
      </Panel>

      <Panel id={panelId("why")} labelledBy={tabId("why")} active={tab === "why"}>
        <Card className="space-y-4">
          <Field label="หัวข้อ">
            <input name="why_title" maxLength={200} defaultValue={s.why_title} className={inputCls} />
          </Field>
          <Field label="ข้อความ">
            <textarea name="why_text" rows={8} maxLength={3000} defaultValue={s.why_text} className={inputCls} />
          </Field>
        </Card>
      </Panel>

      <Panel id={panelId("band")} labelledBy={tabId("band")} active={tab === "band"}>
        <Card className="space-y-5">
          <Field label="ข้อความเล็กด้านบน (eyebrow)">
            <input name="band_eyebrow" maxLength={100} defaultValue={s.band_eyebrow ?? ""} className={inputCls} />
          </Field>
          <Field label="หัวข้อ" hint="คำที่ขึ้นต้นด้วย # จะแสดงเป็นสีแดง เช่น ทำไมต้อง #ซันนครฯ">
            <input name="band_title" maxLength={200} defaultValue={s.band_title ?? ""} className={inputCls} />
          </Field>
          <Field label="ข้อความ">
            <textarea name="band_text" rows={4} maxLength={1000} defaultValue={s.band_text ?? ""} className={inputCls} />
          </Field>
          <Field
            label="ข้อความวิ่ง (ตัวอักษรเส้นขอบใต้แถบดำ)"
            hint={`1 บรรทัดต่อ 1 รายการ — สูงสุด ${MAX_TICKER} รายการ รายการละไม่เกิน 40 ตัวอักษร`}
          >
            <textarea
              name="ticker_items"
              rows={6}
              defaultValue={(s.ticker_items ?? []).join("\n")}
              className={inputCls}
              placeholder={"EVENT\nLIVE COMMERCE"}
            />
          </Field>

          <div className="space-y-3 border-t border-line pt-5">
            <p className="text-sm font-medium text-ink">การ์ดความสามารถ (สูงสุด {MAX_CAPS} ใบ)</p>
            {caps.length === 0 && (
              <p className="rounded-xl bg-soft px-4 py-6 text-center text-sm text-muted">ยังไม่มีการ์ด</p>
            )}
            <ul className="space-y-3">
              {caps.map((row, i) => (
                <li key={row.key} className="grid gap-3 rounded-xl border border-line p-3 sm:grid-cols-[13rem_1fr_auto]">
                  <Field label="ไอคอน">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                        <ServiceIcon name={row.icon} />
                      </span>
                      <select
                        name="cap_icon"
                        aria-label={`การ์ดที่ ${i + 1} ไอคอน`}
                        value={row.icon}
                        onChange={(e) => patchCap(row.key, { icon: e.target.value })}
                        className={inputCls}
                      >
                        {SERVICE_ICONS.map((ic) => (
                          <option key={ic.value} value={ic.value}>
                            {ic.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Field>
                  <div className="space-y-3">
                    <Field label="หัวข้อ">
                      <input
                        name="cap_title"
                        aria-label={`การ์ดที่ ${i + 1} หัวข้อ`}
                        maxLength={60}
                        value={row.title}
                        onChange={(e) => patchCap(row.key, { title: e.target.value })}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="ข้อความ">
                      <textarea
                        name="cap_text"
                        aria-label={`การ์ดที่ ${i + 1} ข้อความ`}
                        rows={2}
                        maxLength={300}
                        value={row.text}
                        onChange={(e) => patchCap(row.key, { text: e.target.value })}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="flex gap-1 sm:flex-col">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => moveCap(i, -1)}
                      aria-label={`เลื่อนการ์ดที่ ${i + 1} ขึ้น`}
                      className="inline-flex size-10 items-center justify-center rounded-lg border border-line transition hover:bg-soft disabled:opacity-40"
                    >
                      <ArrowUp className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      disabled={i === caps.length - 1}
                      onClick={() => moveCap(i, 1)}
                      aria-label={`เลื่อนการ์ดที่ ${i + 1} ลง`}
                      className="inline-flex size-10 items-center justify-center rounded-lg border border-line transition hover:bg-soft disabled:opacity-40"
                    >
                      <ArrowDown className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCaps((prev) => prev.filter((r) => r.key !== row.key))}
                      aria-label={`ลบการ์ดที่ ${i + 1}`}
                      className="inline-flex size-10 items-center justify-center rounded-lg border border-line text-brand transition hover:bg-brand/10"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={caps.length >= MAX_CAPS}
              onClick={() => setCaps((prev) => [...prev, { key: capSeq.current++, icon: "sparkles", title: "", text: "" }])}
              className={btnGhost}
            >
              <Plus className="size-4" aria-hidden /> เพิ่มการ์ด
            </button>
          </div>
        </Card>
      </Panel>

      <Panel id={panelId("stats")} labelledBy={tabId("stats")} active={tab === "stats"}>
        <Card className="space-y-4">
          <p className="text-sm text-muted">
            ตัวเลขเด่น เช่น &quot;4+&quot; = &quot;ปีประสบการณ์&quot; (สูงสุด {MAX_STATS} รายการ)
          </p>
          {stats.length === 0 && <p className="rounded-xl bg-soft px-4 py-6 text-center text-sm text-muted">ยังไม่มีสถิติ</p>}
          <ul className="space-y-3">
            {stats.map((row, i) => (
              <li key={row.key} className="grid grid-cols-[6rem_1fr_auto] items-end gap-3 sm:grid-cols-[8rem_1fr_auto]">
                <Field label={i === 0 ? "ตัวเลข / ค่า" : ""}>
                  <input
                    name="stats_value"
                    aria-label={`สถิติที่ ${i + 1} ตัวเลข`}
                    maxLength={30}
                    value={row.value}
                    onChange={(e) =>
                      setStats((prev) => prev.map((r) => (r.key === row.key ? { ...r, value: e.target.value } : r)))
                    }
                    className={inputCls}
                    placeholder="4+"
                  />
                </Field>
                <Field label={i === 0 ? "คำอธิบาย" : ""}>
                  <input
                    name="stats_label"
                    aria-label={`สถิติที่ ${i + 1} คำอธิบาย`}
                    maxLength={80}
                    value={row.label}
                    onChange={(e) =>
                      setStats((prev) => prev.map((r) => (r.key === row.key ? { ...r, label: e.target.value } : r)))
                    }
                    className={inputCls}
                    placeholder="ปีประสบการณ์"
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => setStats((prev) => prev.filter((r) => r.key !== row.key))}
                  aria-label={`ลบสถิติที่ ${i + 1}`}
                  className="mb-0.5 inline-flex size-10 items-center justify-center rounded-lg border border-line text-brand transition hover:bg-brand/10"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={stats.length >= MAX_STATS}
            onClick={() => setStats((prev) => [...prev, { key: keySeq.current++, value: "", label: "" }])}
            className={btnGhost}
          >
            <Plus className="size-4" aria-hidden /> เพิ่มสถิติ
          </button>
        </Card>
      </Panel>

      <Panel id={panelId("cta")} labelledBy={tabId("cta")} active={tab === "cta"}>
        <Card className="space-y-4">
          <Field label="หัวข้อ">
            <input name="cta_title" maxLength={200} defaultValue={s.cta_title} className={inputCls} />
          </Field>
          <Field label="ข้อความ">
            <textarea name="cta_text" rows={3} maxLength={500} defaultValue={s.cta_text} className={inputCls} />
          </Field>
        </Card>
      </Panel>

      <Panel id={panelId("contact")} labelledBy={tabId("contact")} active={tab === "contact"}>
        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="เบอร์โทร">
              <input name="phone" type="tel" maxLength={40} defaultValue={s.phone} className={inputCls} />
            </Field>
            <Field label="อีเมล">
              <input name="email" type="email" maxLength={200} defaultValue={s.email ?? ""} className={inputCls} />
            </Field>
            <Field label="LINE ID">
              <input name="line_id" maxLength={80} defaultValue={s.line_id} className={inputCls} placeholder="@sunnakhon.org" />
            </Field>
            <Field label="ลิงก์ LINE (เช่น https://line.me/ti/p/...)">
              <input name="line_url" type="url" defaultValue={s.line_url ?? ""} className={inputCls} placeholder="https://" />
            </Field>
            <Field label="Facebook">
              <input name="facebook_url" type="url" defaultValue={s.facebook_url} className={inputCls} placeholder="https://" />
            </Field>
            <Field label="Instagram">
              <input name="instagram_url" type="url" defaultValue={s.instagram_url ?? ""} className={inputCls} placeholder="https://" />
            </Field>
            <Field label="TikTok">
              <input name="tiktok_url" type="url" defaultValue={s.tiktok_url ?? ""} className={inputCls} placeholder="https://" />
            </Field>
            <Field label="YouTube">
              <input name="youtube_url" type="url" defaultValue={s.youtube_url ?? ""} className={inputCls} placeholder="https://" />
            </Field>
          </div>
          <Field label="ที่อยู่">
            <textarea name="address" rows={3} maxLength={500} defaultValue={s.address ?? ""} className={inputCls} />
          </Field>
          <Field label="ลิงก์แผนที่ (Google Maps)">
            <input name="map_url" type="url" defaultValue={s.map_url ?? ""} className={inputCls} placeholder="https://maps.google.com/..." />
          </Field>
        </Card>
      </Panel>

      <Panel id={panelId("seo")} labelledBy={tabId("seo")} active={tab === "seo"}>
        <Card className="space-y-4">
          <Field label="SEO Title" hint="แนะนำไม่เกิน ~60 ตัวอักษร">
            <input name="seo_title" maxLength={120} defaultValue={s.seo_title} className={inputCls} />
          </Field>
          <Field label="SEO Description" hint="แนะนำไม่เกิน ~160 ตัวอักษร">
            <textarea
              name="seo_description"
              rows={3}
              maxLength={300}
              defaultValue={s.seo_description}
              className={inputCls}
            />
          </Field>
        </Card>
      </Panel>

      <div className="sticky bottom-0 z-20 -mx-1 mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <SaveButton pending={pending}>บันทึกการตั้งค่า</SaveButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

function Panel({
  id,
  labelledBy,
  active,
  children,
}: {
  id: string;
  labelledBy: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div id={id} role="tabpanel" aria-labelledby={labelledBy} hidden={!active}>
      {children}
    </div>
  );
}
