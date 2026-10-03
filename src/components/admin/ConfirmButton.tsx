"use client";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useBusyWhile } from "@/lib/busy";

/** ปุ่ม submit ที่ถามยืนยันก่อน — ใช้ใน <form action={deleteAction}> และเปิดตัวโหลดรวมระหว่างรอ */
export function ConfirmButton({
  message = "ยืนยันการลบ? ไม่สามารถย้อนกลับได้",
  className,
  children,
}: {
  message?: string;
  className?: string;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  useBusyWhile(pending, "กำลังดำเนินการ…");
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
