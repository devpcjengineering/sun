import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "ตั้งค่าเว็บไซต์" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sb = await createClient();
  const { data, error } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();

  return (
    <div>
      <PageHeader title="ตั้งค่าเว็บไซต์" desc="แก้ไขข้อความ ช่องทางติดต่อ และ SEO ของเว็บไซต์ — กดบันทึกครั้งเดียวทุกหมวด" />
      {error || !data ? (
        <EmptyState>
          {error ? `โหลดข้อมูลไม่สำเร็จ: ${error.message}` : "ไม่พบข้อมูลการตั้งค่า — ให้รันไฟล์ supabase/schema.sql ก่อน"}
        </EmptyState>
      ) : (
        <SettingsForm settings={data as SiteSettings} />
      )}
    </div>
  );
}
