import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/types";
import { ServiceForm } from "../ServiceForm";

export const metadata: Metadata = { title: "แก้ไขบริการ" };
export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data } = await sb.from("services").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const service = data as Service;

  return (
    <div>
      <PageHeader title="แก้ไขบริการ" desc={service.title} />
      <ServiceForm key={service.id} service={service} />
    </div>
  );
}
