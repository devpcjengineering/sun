import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { ServiceForm } from "../ServiceForm";

export const metadata: Metadata = { title: "เพิ่มบริการ" };

export default function NewServicePage() {
  return (
    <div>
      <PageHeader title="เพิ่มบริการ" desc="กรอกรายละเอียดบริการใหม่" />
      <ServiceForm />
    </div>
  );
}
