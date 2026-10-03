"use client";
import { useState } from "react";
import { Field, inputCls } from "@/components/admin/ui";

/** ช่อง slug + คำใบ้แสดงลิงก์หน้าลูกค้าที่จะได้ */
export function SlugField({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const slug = value.trim().toLowerCase();
  const hint = slug
    ? `ลิงก์หน้าลูกค้า: /customers/${slug}`
    : "เว้นว่างเพื่อสร้างจากชื่ออัตโนมัติ — ลิงก์จะเป็น /customers/<slug>";
  return (
    <Field label="Slug (ลิงก์หน้าลูกค้า)" hint={hint}>
      <input
        name="slug"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={80}
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        className={inputCls}
        placeholder="เช่น kasetsart-university"
      />
    </Field>
  );
}
