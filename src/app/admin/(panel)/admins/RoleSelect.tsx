"use client";
import { useRef } from "react";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/types";
import { updateAdminRole } from "./actions";

/** dropdown เปลี่ยนสิทธิ์ — เลือกแล้วบันทึกทันที */
export function RoleSelect({ email, role, disabled }: { email: string; role: Role; disabled?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateAdminRole}>
      <input type="hidden" name="email" value={email} />
      <select
        name="role"
        defaultValue={role}
        disabled={disabled}
        aria-label={`สิทธิ์ของ ${email}`}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-lg border border-line bg-white px-2.5 py-2 text-sm text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10 disabled:opacity-60"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    </form>
  );
}
