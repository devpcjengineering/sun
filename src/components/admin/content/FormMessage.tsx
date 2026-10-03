import { AlertCircle, CheckCircle2 } from "lucide-react";

/** ผลลัพธ์ของ Server Action ที่ใช้กับ useActionState */
export type ActionState = { ok: boolean; error?: string; message?: string } | null;

/** แสดงข้อความสำเร็จ/ผิดพลาดของฟอร์ม (ว่างเมื่อยังไม่มีผลลัพธ์) */
export function FormMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.ok) {
    if (!state.message) return null;
    return (
      <p
        role="status"
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
      >
        <CheckCircle2 className="size-4 shrink-0" aria-hidden />
        {state.message}
      </p>
    );
  }
  return (
    <p role="alert" className="inline-flex items-start gap-2 rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{state.error ?? "เกิดข้อผิดพลาด"}</span>
    </p>
  );
}
