"use client";
import type { ReactNode } from "react";

/** ปุ่ม submit ที่ถามยืนยันก่อน — ใช้ใน <form action={deleteAction}> */
export function ConfirmButton({
  message = "ยืนยันการลบ? ไม่สามารถย้อนกลับได้",
  className,
  children,
}: {
  message?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
