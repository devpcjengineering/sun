import type { Metadata } from "next";
import { Badge, EmptyState, PageHeader } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";
import { ClientAddForm } from "./ClientAddForm";
import { ClientBulkUploader } from "./ClientBulkUploader";
import { ClientCard } from "./ClientCard";

export const metadata: Metadata = { title: "ลูกค้าที่เคยร่วมงาน" };
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const sb = await createClient();
  const { data, error } = await sb
    .from("clients")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const clients = (data ?? []) as Client[];
  const hidden = clients.filter((c) => !c.published).length;

  return (
    <div>
      <PageHeader
        title="ลูกค้าที่เคยร่วมงาน (โลโก้)"
        desc="โลโก้เหล่านี้จะวิ่งเป็นแถบบนหน้าแรก — เรียงตามลำดับด้านล่าง"
        action={
          <div className="flex items-center gap-2">
            <Badge tone="black">{clients.length} โลโก้</Badge>
            {hidden > 0 && <Badge>ซ่อน {hidden}</Badge>}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ClientAddForm />
        <ClientBulkUploader />
      </div>

      <h2 className="mb-3 mt-8 text-base font-semibold text-ink">โลโก้ทั้งหมด</h2>
      {error ? (
        <EmptyState>โหลดข้อมูลไม่สำเร็จ: {error.message}</EmptyState>
      ) : clients.length === 0 ? (
        <EmptyState>ยังไม่มีโลโก้ — เพิ่มทีละรายการหรืออัปโหลดหลายไฟล์ได้ด้านบน</EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {clients.map((c, i) => (
            <li key={c.id} className="contents">
              <ClientCard client={c} isFirst={i === 0} isLast={i === clients.length - 1} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
