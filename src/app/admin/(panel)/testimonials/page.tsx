import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Star, User } from "lucide-react";
import { Badge, EmptyState, PageHeader, btnPrimary } from "@/components/admin/ui";
import { RowControls } from "@/components/admin/content/RowControls";
import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/lib/types";
import { deleteTestimonial, moveTestimonial, toggleTestimonial } from "./actions";

export const metadata: Metadata = { title: "เสียงลูกค้า" };
export const dynamic = "force-dynamic";

const actions = { toggle: toggleTestimonial, move: moveTestimonial, remove: deleteTestimonial };

export default async function TestimonialsPage() {
  const sb = await createClient();
  const { data, error } = await sb
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const items = (data ?? []) as Testimonial[];

  return (
    <div>
      <PageHeader
        title="เสียงลูกค้า"
        desc="รีวิวจากลูกค้าที่แสดงบนหน้าแรก — เรียงตามลำดับด้านล่าง"
        action={
          <Link href="/admin/testimonials/new" className={btnPrimary}>
            <Plus className="size-4" aria-hidden /> เพิ่มเสียงลูกค้า
          </Link>
        }
      />

      {error ? (
        <EmptyState>โหลดข้อมูลไม่สำเร็จ: {error.message}</EmptyState>
      ) : items.length === 0 ? (
        <EmptyState>ยังไม่มีเสียงลูกค้า — กด &quot;เพิ่มเสียงลูกค้า&quot; เพื่อเริ่มต้น</EmptyState>
      ) : (
        <ul className="space-y-3">
          {items.map((t, i) => (
            <li
              key={t.id}
              className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 lg:flex-row lg:items-center"
            >
              <div className="flex min-w-0 flex-1 items-start gap-4">
                {t.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.avatar_url} alt="" className="size-12 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-soft text-muted">
                    <User className="size-5" aria-hidden />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink">{t.name}</p>
                    {t.role && <span className="text-sm text-muted">{t.role}</span>}
                    {!t.published && <Badge>ซ่อนอยู่</Badge>}
                  </div>
                  <p
                    className="mt-0.5 flex items-center gap-0.5"
                    role="img"
                    aria-label={`คะแนน ${t.rating} จาก 5`}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`size-3.5 ${n <= t.rating ? "fill-brand text-brand" : "text-black/20"}`}
                        aria-hidden
                      />
                    ))}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{t.content}</p>
                </div>
              </div>
              <RowControls
                id={t.id}
                published={t.published}
                isFirst={i === 0}
                isLast={i === items.length - 1}
                actions={actions}
                itemLabel={`เสียงลูกค้าของ ${t.name}`}
                deleteMessage={`ลบเสียงลูกค้าของ "${t.name}"? ไม่สามารถย้อนกลับได้`}
              >
                <Link
                  href={`/admin/testimonials/${t.id}`}
                  aria-label={`แก้ไข ${t.name}`}
                  title="แก้ไข"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-xs font-medium text-ink transition hover:bg-soft"
                >
                  <Pencil className="size-3.5" aria-hidden /> แก้ไข
                </Link>
              </RowControls>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
