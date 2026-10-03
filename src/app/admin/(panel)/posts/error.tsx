"use client";
import { AlertTriangle } from "lucide-react";
import { btnDark } from "@/components/admin/ui";

export default function PostsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-brand/20 bg-brand/5 px-6 py-12 text-center">
      <AlertTriangle className="mx-auto size-8 text-brand" />
      <h2 className="mt-3 font-semibold text-ink">เกิดข้อผิดพลาด</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{error.message || "ไม่สามารถโหลดข้อมูลโพสต์ได้"}</p>
      <button type="button" onClick={reset} className={`${btnDark} mt-5`}>
        ลองอีกครั้ง
      </button>
    </div>
  );
}
