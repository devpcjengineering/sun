import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { Badge, EmptyState, PageHeader, btnPrimary } from "@/components/admin/ui";
import { RowControls } from "@/components/admin/content/RowControls";
import { ServiceIcon } from "@/components/admin/content/icons";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/types";
import { deleteService, moveService, toggleService } from "./actions";

export const metadata: Metadata = { title: "บริการ" };
export const dynamic = "force-dynamic";

const actions = { toggle: toggleService, move: moveService, remove: deleteService };

export default async function ServicesPage() {
  const sb = await createClient();
  const { data, error } = await sb
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const services = (data ?? []) as Service[];

  return (
    <div>
      <PageHeader
        title="บริการ"
        desc="บริการที่แสดงในหน้าแรกและหน้าบริการ — เรียงตามลำดับด้านล่าง"
        action={
          <Link href="/admin/services/new" className={btnPrimary}>
            <Plus className="size-4" aria-hidden /> เพิ่มบริการ
          </Link>
        }
      />

      {error ? (
        <EmptyState>โหลดข้อมูลไม่สำเร็จ: {error.message}</EmptyState>
      ) : services.length === 0 ? (
        <EmptyState>ยังไม่มีบริการ — กด &quot;เพิ่มบริการ&quot; เพื่อเริ่มต้น</EmptyState>
      ) : (
        <ul className="space-y-3">
          {services.map((s, i) => (
            <li
              key={s.id}
              className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div
                  className={`grid size-12 shrink-0 place-items-center rounded-xl ${s.published ? "bg-ink text-white" : "bg-soft text-muted"}`}
                >
                  <ServiceIcon name={s.icon} className="size-6" />
                </div>
                {s.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.cover_url} alt="" className="hidden h-12 w-20 shrink-0 rounded-lg object-cover md:block" />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-ink">{s.title}</p>
                    {!s.published && <Badge>ซ่อนอยู่</Badge>}
                  </div>
                  <p className="truncate text-sm text-muted">{s.subtitle || "—"}</p>
                  <p className="mt-0.5 text-xs text-muted/80">
                    /{s.slug} · ลำดับ {s.sort_order} · {s.features.length} จุดเด่น
                  </p>
                </div>
              </div>
              <RowControls
                id={s.id}
                published={s.published}
                isFirst={i === 0}
                isLast={i === services.length - 1}
                actions={actions}
                itemLabel={`บริการ ${s.title}`}
                deleteMessage={`ลบบริการ "${s.title}"? ไม่สามารถย้อนกลับได้`}
              >
                <Link
                  href={`/admin/services/${s.id}`}
                  aria-label={`แก้ไข ${s.title}`}
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
