import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Eye, EyeOff, ImageOff, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, btnGhost, btnPrimary, btnDark, EmptyState, inputCls, PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { POST_CATEGORIES, POST_KINDS, type Post } from "@/lib/types";
import { deletePost, toggleFeatured, togglePublish } from "./actions";

export const metadata: Metadata = { title: "ผลงานและบทความ" };

const PAGE_SIZE = 20;

type SP = { kind?: string; q?: string; status?: string; category?: string; page?: string; error?: string };

const categoryLabel = (v: string) => POST_CATEGORIES.find((c) => c.value === v)?.label ?? v;

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeZone: "Asia/Bangkok" }).format(new Date(iso));

function href(sp: SP, patch: Partial<SP>) {
  const merged = { ...sp, ...patch };
  const p = new URLSearchParams();
  for (const k of ["kind", "q", "status", "category", "page"] as const) {
    if (merged[k]) p.set(k, String(merged[k]));
  }
  const s = p.toString();
  return `/admin/posts${s ? `?${s}` : ""}`;
}

export default async function PostsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const kind = POST_KINDS.some((k) => k.value === sp.kind) ? (sp.kind as "work" | "article") : "";
  const q = (sp.q ?? "").trim().slice(0, 100);
  const status = sp.status === "published" || sp.status === "draft" ? sp.status : "";
  const category =
    kind !== "article" && POST_CATEGORIES.some((c) => c.value === sp.category) ? (sp.category as string) : "";
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);

  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("id, kind, slug, title, category, cover_url, featured, published, published_at, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (kind) query = query.eq("kind", kind);
  if (q) query = query.ilike("title", `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
  if (status) query = query.eq("published", status === "published");
  if (category) query = query.eq("category", category);

  const countOf = (k?: "work" | "article") => {
    const c = supabase.from("posts").select("id", { count: "exact", head: true });
    return k ? c.eq("kind", k) : c;
  };
  const [{ data, count, error }, allCount, workCount, articleCount] = await Promise.all([
    query,
    countOf(),
    countOf("work"),
    countOf("article"),
  ]);
  const tabs = [
    { key: "", label: "ทั้งหมด", n: allCount.count ?? 0 },
    { key: "work", label: "ผลงาน", n: workCount.count ?? 0 },
    { key: "article", label: "บทความ", n: articleCount.count ?? 0 },
  ];
  const kindLabel = (v: string) => POST_KINDS.find((k) => k.value === v)?.label ?? v;
  const noun = kind === "article" ? "บทความ" : kind === "work" ? "ผลงาน" : "รายการ";
  const posts = (data ?? []) as Pick<
    Post,
    "id" | "kind" | "slug" | "title" | "category" | "cover_url" | "featured" | "published" | "published_at" | "created_at"
  >[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = Boolean(q || status || category);
  const errorMsg = sp.error?.slice(0, 300);

  return (
    <>
      <PageHeader
        title={kind === "article" ? "บทความ" : kind === "work" ? "ผลงาน" : "ผลงานและบทความ"}
        desc={`ทั้งหมด ${total} รายการ`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/posts/new?kind=work" className={kind === "article" ? btnDark : btnPrimary}>
              <Plus className="size-4" />
              เพิ่มผลงาน
            </Link>
            <Link href="/admin/posts/new?kind=article" className={kind === "article" ? btnPrimary : btnDark}>
              <Plus className="size-4" />
              เขียนบทความ
            </Link>
          </div>
        }
      />

      <div role="tablist" aria-label="ประเภท" className="mb-4 flex flex-wrap gap-1 border-b border-line">
        {tabs.map((t) => {
          const active = kind === t.key;
          return (
            <Link
              key={t.key || "all"}
              role="tab"
              aria-selected={active}
              href={href({}, { kind: t.key })}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition ${
                active ? "border-brand font-medium text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
              <span className="rounded-full bg-soft px-2 py-0.5 text-xs text-muted">{t.n}</span>
            </Link>
          );
        })}
      </div>

      {(errorMsg || error) && (
        <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{errorMsg ?? `อ่านข้อมูลไม่สำเร็จ: ${error?.message}`}</span>
        </div>
      )}

      <form method="get" action="/admin/posts" className="mb-4 flex flex-wrap items-center gap-2">
        {kind && <input type="hidden" name="kind" value={kind} />}
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={q}
            placeholder={`ค้นหาจากชื่อ${noun}`}
            aria-label={`ค้นหาจากชื่อ${noun}`}
            className={`${inputCls} pl-9`}
          />
        </div>
        <select name="status" defaultValue={status} aria-label="สถานะ" className={`${inputCls} w-auto`}>
          <option value="">ทุกสถานะ</option>
          <option value="published">เผยแพร่แล้ว</option>
          <option value="draft">ฉบับร่าง</option>
        </select>
        {kind !== "article" && (
          <select name="category" defaultValue={category} aria-label="หมวดหมู่" className={`${inputCls} w-auto`}>
            <option value="">ทุกหมวดหมู่</option>
            {POST_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        )}
        <button type="submit" className={btnDark}>
          ค้นหา
        </button>
        {filtered && (
          <Link href={href({}, { kind })} className={btnGhost}>
            ล้างตัวกรอง
          </Link>
        )}
      </form>

      {posts.length === 0 ? (
        <EmptyState>
          {filtered ? (
            `ไม่พบ${noun}ที่ตรงกับเงื่อนไข`
          ) : (
            <>
              ยังไม่มี{noun} —{" "}
              <Link
                href={`/admin/posts/new?kind=${kind === "article" ? "article" : "work"}`}
                className="font-medium text-brand hover:underline"
              >
                {kind === "article" ? "เขียนบทความแรกของคุณ" : "เพิ่มผลงานแรกของคุณ"}
              </Link>
            </>
          )}
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {/* มือถือ/แท็บเล็ตเล็ก: การ์ดเรียงแนวตั้ง ไม่ต้องเลื่อนขวา */}
          <ul className="divide-y divide-line md:hidden">
            {posts.map((p) => (
              <li key={p.id} className="space-y-3 p-4">
                <div className="flex gap-3">
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-soft">
                    {p.cover_url ? (
                      <Image src={p.cover_url} alt="" fill sizes="80px" className="object-cover" />
                    ) : (
                      <ImageOff className="absolute inset-0 m-auto size-5 text-muted" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/posts/${p.id}/edit?kind=${p.kind ?? "work"}`}
                      className="font-medium text-ink [overflow-wrap:anywhere] hover:text-brand"
                    >
                      {p.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-xs text-muted [overflow-wrap:anywhere]">{p.slug}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge tone={p.kind === "article" ? "black" : "red"}>{kindLabel(p.kind ?? "work")}</Badge>
                  {p.kind !== "article" && <Badge>{categoryLabel(p.category)}</Badge>}
                  <Badge tone={p.published ? "green" : "gray"}>{p.published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}</Badge>
                  {p.featured && (
                    <span className="inline-flex items-center gap-1 text-brand">
                      <Star className="size-3.5 fill-brand" aria-hidden /> แนะนำ
                    </span>
                  )}
                  <span className="text-muted">{fmt(p.published_at ?? p.created_at)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <form action={toggleFeatured}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="featured" value={String(!p.featured)} />
                    <button type="submit" className={`${btnGhost} !px-3 !py-2 text-xs`}>
                      <Star className={`size-4 ${p.featured ? "fill-brand text-brand" : ""}`} aria-hidden />
                      {p.featured ? "เลิกแนะนำ" : "ตั้งเป็นแนะนำ"}
                    </button>
                  </form>
                  <form action={togglePublish}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="publish" value={String(!p.published)} />
                    <button type="submit" className={`${btnGhost} !px-3 !py-2 text-xs`}>
                      {p.published ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                      {p.published ? "ซ่อน" : "เผยแพร่"}
                    </button>
                  </form>
                  <Link href={`/admin/posts/${p.id}/edit?kind=${p.kind ?? "work"}`} className={`${btnGhost} !px-3 !py-2 text-xs`}>
                    <Pencil className="size-4" aria-hidden /> แก้ไข
                  </Link>
                  <form action={deletePost}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmButton
                      message={`ลบ${kindLabel(p.kind ?? "work")} "${p.title}" ถาวร?`}
                      className={`${btnGhost} !px-3 !py-2 text-xs text-brand hover:!bg-brand/10`}
                    >
                      <Trash2 className="size-4" aria-hidden /> ลบ
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-line bg-soft/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">รายการ</th>
                  <th className="px-4 py-3 font-medium">ประเภท</th>
                  <th className="px-4 py-3 font-medium">หมวดหมู่</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                  <th className="px-4 py-3 text-center font-medium">แนะนำ</th>
                  <th className="px-4 py-3 font-medium">วันที่</th>
                  <th className="px-4 py-3 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {posts.map((p) => (
                  <tr key={p.id} className="transition hover:bg-soft/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-soft">
                          {p.cover_url ? (
                            <Image src={p.cover_url} alt="" fill sizes="64px" className="object-cover" />
                          ) : (
                            <ImageOff className="absolute inset-0 m-auto size-4 text-muted" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/posts/${p.id}/edit?kind=${p.kind ?? "work"}`} className="line-clamp-1 font-medium text-ink hover:text-brand">
                            {p.title}
                          </Link>
                          <p className="line-clamp-1 font-mono text-xs text-muted">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={p.kind === "article" ? "black" : "red"}>{kindLabel(p.kind ?? "work")}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.kind === "article" ? "–" : categoryLabel(p.category)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.published ? "green" : "gray"}>{p.published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form action={toggleFeatured}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="featured" value={String(!p.featured)} />
                        <button
                          type="submit"
                          aria-label={p.featured ? "เลิกเป็นรายการแนะนำ" : "ตั้งเป็นรายการแนะนำ"}
                          title={p.featured ? "เลิกเป็นรายการแนะนำ" : "ตั้งเป็นรายการแนะนำ"}
                          className="rounded-md p-1.5 hover:bg-soft"
                        >
                          <Star className={`size-4 ${p.featured ? "fill-brand text-brand" : "text-muted"}`} />
                        </button>
                      </form>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{fmt(p.published_at ?? p.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <form action={togglePublish}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="publish" value={String(!p.published)} />
                          <button
                            type="submit"
                            title={p.published ? "ยกเลิกการเผยแพร่" : "เผยแพร่"}
                            aria-label={p.published ? "ยกเลิกการเผยแพร่" : "เผยแพร่"}
                            className="rounded-md p-2 text-muted transition hover:bg-soft hover:text-ink"
                          >
                            {p.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </form>
                        <Link
                          href={`/admin/posts/${p.id}/edit?kind=${p.kind ?? "work"}`}
                          title="แก้ไข"
                          aria-label="แก้ไข"
                          className="rounded-md p-2 text-muted transition hover:bg-soft hover:text-ink"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <form action={deletePost}>
                          <input type="hidden" name="id" value={p.id} />
                          <ConfirmButton
                            message={`ลบ${kindLabel(p.kind ?? "work")} "${p.title}" ถาวร?`}
                            className="rounded-md p-2 text-muted transition hover:bg-brand/10 hover:text-brand"
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">ลบ</span>
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
              <span className="text-muted">
                หน้า {page} / {pages}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={href(sp, { page: String(page - 1) })} className={btnGhost}>
                    ก่อนหน้า
                  </Link>
                )}
                {page < pages && (
                  <Link href={href(sp, { page: String(page + 1) })} className={btnGhost}>
                    ถัดไป
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
