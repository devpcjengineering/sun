import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { PackageForm } from "../PackageForm";

export const metadata: Metadata = { title: "เพิ่มแพ็กเกจ" };

export default function NewPackagePage() {
  return (
    <div>
      <PageHeader title="เพิ่มแพ็กเกจ" desc="กรอกรายละเอียดแพ็กเกจใหม่" />
      <PackageForm />
    </div>
  );
}
