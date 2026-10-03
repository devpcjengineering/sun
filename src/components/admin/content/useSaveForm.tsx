"use client";
import { startTransition, useActionState, type FormEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useBusyWhile } from "@/lib/busy";
import { btnPrimary } from "../ui";
import type { ActionState } from "./FormMessage";

/**
 * ผูกฟอร์มเข้ากับ Server Action แบบ "ไม่ล้างค่าในช่อง" เมื่อเกิด error
 * (ถ้าใช้ <form action> ตรง ๆ React 19 จะรีเซ็ตฟอร์มทุกครั้งหลัง action จบ ทำให้ค่าที่พิมพ์หายเมื่อ validate ไม่ผ่าน)
 */
export function useSaveForm(action: (prev: ActionState, fd: FormData) => Promise<ActionState>) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  }
  return { state, pending, onSubmit };
}

export function SaveButton({
  pending,
  children = "บันทึก",
  className = btnPrimary,
}: {
  pending: boolean;
  children?: ReactNode;
  className?: string;
}) {
  useBusyWhile(pending, "กำลังบันทึก…");
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
