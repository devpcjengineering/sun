"use client";
import { useActionState } from "react";
import { AlertTriangle, CheckCircle2, UserPlus } from "lucide-react";
import { inputCls } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ROLES, ROLE_LABELS } from "@/lib/types";
import { addAdmin, type AdminFormState } from "./actions";

export function AddAdminForm() {
  const [state, action] = useActionState(addAdmin, {} as AdminFormState);

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          key={state.ok ?? "form"}
          type="email"
          name="email"
          required
          autoComplete="off"
          placeholder="name@gmail.com"
          aria-label="อีเมล Google ของผู้ดูแลระบบ"
          className={`${inputCls} sm:max-w-sm`}
        />
        <select
          name="role"
          defaultValue="staff"
          aria-label="สิทธิ์"
          className={`${inputCls} sm:w-40`}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <SubmitButton>
          <UserPlus className="size-4" />
          เพิ่มผู้ดูแลระบบ
        </SubmitButton>
      </div>
      <p className="text-xs text-muted">
        ใช้อีเมลเดียวกับบัญชี Google ที่จะใช้ล็อกอิน (เช่น Gmail) · Administrator/Developer = จัดการได้ทุกอย่าง · Staff = จัดการเนื้อหาเท่านั้น (ไม่มีสิทธิ์ตั้งค่าเว็บไซต์และผู้ดูแลระบบ)
      </p>
      {state.error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-brand">
          <AlertTriangle className="size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="flex items-center gap-1.5 text-sm text-emerald-700">
          <CheckCircle2 className="size-4 shrink-0" />
          {state.ok}
        </p>
      )}
    </form>
  );
}
