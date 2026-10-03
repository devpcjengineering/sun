import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/lib/types";
import { TestimonialForm } from "../TestimonialForm";

export const metadata: Metadata = { title: "แก้ไขเสียงลูกค้า" };
export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data } = await sb.from("testimonials").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const item = data as Testimonial;

  return (
    <div>
      <PageHeader title="แก้ไขเสียงลูกค้า" desc={item.name} />
      <TestimonialForm key={item.id} item={item} />
    </div>
  );
}
