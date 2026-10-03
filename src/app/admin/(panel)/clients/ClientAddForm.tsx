"use client";
import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Card, Field, inputCls } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { FormMessage, type ActionState } from "@/components/admin/content/FormMessage";
import { createClientLogo } from "./actions";
import { SlugField } from "./SlugField";

/** ฟอร์มเพิ่มโลโก้ทีละรายการ */
export function ClientAddForm() {
  const [logo, setLogo] = useState<{ url: string | null; public_id: string | null }>({ url: null, public_id: null });
  const [formKey, setFormKey] = useState(0);
  const [state, formAction] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const res = await createClientLogo(prev, fd);
    if (res?.ok) {
      setLogo({ url: null, public_id: null });
      setFormKey((k) => k + 1); // ล้างช่อง slug (controlled)
    }
    return res;
  }, null);

  return (
    <Card>
      <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
        <Plus className="size-4 text-brand" aria-hidden /> เพิ่มโลโก้ทีละรายการ
      </h2>
      <form action={formAction} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_1fr]">
          <ImageUpload folder="clients" name="logo" value={logo} onChange={setLogo} aspect="aspect-[3/2]" contain />
          <div className="space-y-4">
            <Field label="ชื่อลูกค้า / แบรนด์">
              <input name="name" required maxLength={120} className={inputCls} placeholder="เช่น มหาวิทยาลัยเกษตรศาสตร์" />
            </Field>
            <SlugField key={formKey} />
            <Field label="เว็บไซต์ (ไม่บังคับ)">
              <input name="website_url" type="url" inputMode="url" className={inputCls} placeholder="https://" />
            </Field>
          </div>
        </div>
        <Field label="รายละเอียดลูกค้า (ไม่บังคับ)" hint="แสดงในหน้าลูกค้า /customers/<slug>">
          <textarea name="description" rows={4} maxLength={2000} className={inputCls} placeholder="เล่าโดยย่อเกี่ยวกับลูกค้า / งานที่เคยร่วมกัน" />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton>เพิ่มโลโก้</SubmitButton>
          <FormMessage state={state} />
        </div>
      </form>
    </Card>
  );
}
