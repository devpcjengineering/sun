import type { Metadata } from "next";
import NotFoundContent from "@/components/site/NotFoundContent";

export const metadata: Metadata = { title: "ไม่พบหน้าที่ต้องการ", robots: { index: false } };

export default function SiteNotFound() {
  return <NotFoundContent />;
}
