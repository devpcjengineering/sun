import type { Metadata } from "next";
import Link from "next/link";
import { Check, Pencil, Plus } from "lucide-react";
import { Badge, EmptyState, PageHeader, btnPrimary } from "@/components/admin/ui";
import { RowControls } from "@/components/admin/content/RowControls";
import { createClient } from "@/lib/supabase/server";
import type { Package } from "@/lib/types";
import { deletePackage, movePackage, togglePackage } from "./actions";

export const metadata: Metadata = { title: "แพ็กเกจ / ราคา" };
export const dynamic = "force-dynamic";

const actions = { toggle: togglePackage, move: movePackage, remove: deletePackage };

export default async function PackagesPage() {
  const sb = await createClient();
  const { data, error } = await sb
    .from("packages")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const packages = (data ?? []) as Package[];

  return (
    <div>
      <PageHeader
        title="แพ็กเกจ / ราคา"
        desc="แพ็กเกจและราคาที่แสดงบนเว็บไซต์ — เรียงตามลำดับด้านล่าง"
        action={
          <Link href="/admin/packages/new" className={btnPrimary}>
            <Plus className="size-4" aria-hidden /> เพิ่มแพ็กเกจ
          </Link>
        }
      />

      {error ? (
        <EmptyState>โหลดข้อมูลไม่สำเร็จ: {error.message}</EmptyState>
      ) : packages.length === 0 ? (
        <EmptyState>ยังไม่มีแพ็กเกจ — กด &quot;เพิ่มแพ็กเกจ&quot; เพื่อเริ่มต้น</EmptyState>
      ) : (
        <ul className="space-y-3">
          {packages.map((p, i) => (
            <li
              key={p.id}
              className={`flex flex-col gap-4 rounded-2xl border bg-white p-4 lg:flex-row lg:items-center ${
                p.highlight ? "border-brand/50" : "border-line"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink">{p.name}</p>
                  {p.highlight && <Badge tone="red">แนะนำ</Badge>}
                  {!p.published && <Badge>ซ่อนอยู่</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-ink">
                  {p.price_text}
                  {p.price_note && <span className="text-muted"> · {p.price_note}</span>}
                </p>
                {p.features.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    {p.features.slice(0, 4).map((f) => (
                      <li key={f} className="inline-flex items-center gap-1">
                        <Check className="size-3 text-brand" aria-hidden /> {f}
                      </li>
                    ))}
                    {p.features.length > 4 && <li>+{p.features.length - 4} รายการ</li>}
                  </ul>
                )}
              </div>
              <RowControls
                id={p.id}
                published={p.published}
                isFirst={i === 0}
                isLast={i === packages.length - 1}
                actions={actions}
                itemLabel={`แพ็กเกจ ${p.name}`}
                deleteMessage={`ลบแพ็กเกจ "${p.name}"? ไม่สามารถย้อนกลับได้`}
              >
                <Link
                  href={`/admin/packages/${p.id}`}
                  aria-label={`แก้ไข ${p.name}`}
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
