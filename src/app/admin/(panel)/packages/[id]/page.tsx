import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import type { Package } from "@/lib/types";
import { PackageForm } from "../PackageForm";

export const metadata: Metadata = { title: "แก้ไขแพ็กเกจ" };
export const dynamic = "force-dynamic";

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data } = await sb.from("packages").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const pkg = data as Package;

  return (
    <div>
      <PageHeader title="แก้ไขแพ็กเกจ" desc={pkg.name} />
      <PackageForm key={pkg.id} pkg={pkg} />
    </div>
  );
}
