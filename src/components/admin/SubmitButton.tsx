"use client";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { btnPrimary } from "./ui";

/** ปุ่มบันทึก — แสดง spinner ระหว่างรอ server action */
export function SubmitButton({ children = "บันทึก", className = btnPrimary }: { children?: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
