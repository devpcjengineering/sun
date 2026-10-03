import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Eye, EyeOff, ImageOff, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, btnGhost, btnPrimary, btnDark, EmptyState, inputCls, PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { POST_CATEGORIES, type Post } from "@/lib/types";
import { deletePost, toggleFeatured, togglePublish } from "./actions";

export const metadata: Metadata = { title: "โพสต์/ผลงาน" };

const PAGE_SIZE = 20;

type SP = { q?: string; status?: string; category?: string; page?: string; error?: string };

const categoryLabel = (v: string) => POST_CATEGORIES.find((c) => c.value === v)?.label ?? v;

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeZone: "Asia/Bangkok" }).format(new Date(iso));

function href(sp: SP, patch: Partial<SP>) {
  const merged = { ...sp, ...patch };
  const p = new URLSearchParams();
  for (const k of ["q", "status", "category", "page"] as const) {
    if (merged[k]) p.set(k, String(merged[k]));
  }
  const s = p.toString();
  return `/admin/posts${s ? `?${s}` : ""}`;
}

export default async function PostsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const status = sp.status === "published" || sp.status === "draft" ? sp.status : "";
  const category = POST_CATEGORIES.some((c) => c.value === sp.category) ? (sp.category as string) : "";
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);

  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("id, slug, title, category, cover_url, featured, published, published_at, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) query = query.ilike("title", `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
  if (status) query = query.eq("published", status === "published");
  if (category) query = query.eq("category", category);

  const { data, count, error } = await query;
  const posts = (data ?? []) as Pick<
    Post,
    "id" | "slug" | "title" | "category" | "cover_url" | "featured" | "published" | "published_at" | "created_at"
  >[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = Boolean(q || status || category);
  const errorMsg = sp.error?.slice(0, 300);

  return (
    <>
      <PageHeader
        title="โพสต์/ผลงาน"
        desc={`ทั้งหมด ${total} รายการ`}
        action={
          <Link href="/admin/posts/new" className={btnPrimary}>
            <Plus className="size-4" />
            เขียนโพสต์ใหม่
          </Link>
        }
      />

      {(errorMsg || error) && (
        <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{errorMsg ?? `อ่านข้อมูลไม่สำเร็จ: ${error?.message}`}</span>
        </div>
      )}

      <form method="get" action="/admin/posts" className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={q}
            placeholder="ค้นหาจากชื่อโพสต์"
            aria-label="ค้นหาจากชื่อโพสต์"
            className={`${inputCls} pl-9`}
          />
        </div>
        <select name="status" defaultValue={status} aria-label="สถานะ" className={`${inputCls} w-auto`}>
          <option value="">ทุกสถานะ</option>
          <option value="published">เผยแพร่แล้ว</option>
          <option value="draft">ฉบับร่าง</option>
        </select>
        <select name="category" defaultValue={category} aria-label="หมวดหมู่" className={`${inputCls} w-auto`}>
          <option value="">ทุกหมวดหมู่</option>
          {POST_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button type="submit" className={btnDark}>
          ค้นหา
        </button>
        {filtered && (
          <Link href="/admin/posts" className={btnGhost}>
            ล้างตัวกรอง
          </Link>
        )}
      </form>

      {posts.length === 0 ? (
        <EmptyState>
          {filtered ? (
            "ไม่พบโพสต์ที่ตรงกับเงื่อนไข"
          ) : (
            <>
              ยังไม่มีโพสต์ —{" "}
              <Link href="/admin/posts/new" className="font-medium text-brand hover:underline">
                เขียนโพสต์แรกของคุณ
              </Link>
            </>
          )}
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-soft/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">โพสต์</th>
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
                          <Link href={`/admin/posts/${p.id}/edit`} className="line-clamp-1 font-medium text-ink hover:text-brand">
                            {p.title}
                          </Link>
                          <p className="line-clamp-1 font-mono text-xs text-muted">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{categoryLabel(p.category)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.published ? "green" : "gray"}>{p.published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form action={toggleFeatured}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="featured" value={String(!p.featured)} />
                        <button
                          type="submit"
                          aria-label={p.featured ? "เลิกเป็นโพสต์แนะนำ" : "ตั้งเป็นโพสต์แนะนำ"}
                          title={p.featured ? "เลิกเป็นโพสต์แนะนำ" : "ตั้งเป็นโพสต์แนะนำ"}
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
                          href={`/admin/posts/${p.id}/edit`}
                          title="แก้ไข"
                          aria-label="แก้ไข"
                          className="rounded-md p-2 text-muted transition hover:bg-soft hover:text-ink"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <form action={deletePost}>
                          <input type="hidden" name="id" value={p.id} />
                          <ConfirmButton
                            message={`ลบโพสต์ "${p.title}" ถาวร?`}
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
