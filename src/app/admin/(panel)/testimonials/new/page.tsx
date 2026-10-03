import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { TestimonialForm } from "../TestimonialForm";

export const metadata: Metadata = { title: "เพิ่มเสียงลูกค้า" };

export default function NewTestimonialPage() {
  return (
    <div>
      <PageHeader title="เพิ่มเสียงลูกค้า" desc="เพิ่มรีวิวจากลูกค้า" />
      <TestimonialForm />
    </div>
  );
}
