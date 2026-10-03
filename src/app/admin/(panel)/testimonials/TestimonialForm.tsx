"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, Field, btnGhost, inputCls } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { FormMessage } from "@/components/admin/content/FormMessage";
import { RatingInput } from "@/components/admin/content/RatingInput";
import { SaveButton, useSaveForm } from "@/components/admin/content/useSaveForm";
import type { Testimonial } from "@/lib/types";
import { saveTestimonial } from "./actions";

export function TestimonialForm({ item }: { item?: Testimonial }) {
  const { state, pending, onSubmit } = useSaveForm(saveTestimonial);
  const [avatar, setAvatar] = useState({ url: item?.avatar_url ?? null, public_id: item?.avatar_public_id ?? null });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อลูกค้า">
              <input name="name" required maxLength={120} defaultValue={item?.name} className={inputCls} />
            </Field>
            <Field label="ตำแหน่ง / หน่วยงาน" hint="เช่น ประธานนักศึกษา คณะวิศวกรรมศาสตร์">
              <input name="role" maxLength={160} defaultValue={item?.role ?? ""} className={inputCls} />
            </Field>
          </div>
          <Field label="ข้อความรีวิว">
            <textarea
              name="content"
              required
              rows={6}
              maxLength={2000}
              defaultValue={item?.content}
              className={inputCls}
            />
          </Field>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-ink">คะแนน</p>
            <RatingInput defaultValue={item?.rating ?? 5} />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <ImageUpload
              folder="testimonials"
              name="avatar"
              label="รูปโปรไฟล์ (ไม่บังคับ)"
              value={avatar}
              onChange={setAvatar}
              aspect="aspect-square"
            />
          </Card>
          <Card className="space-y-4">
            <Field label="ลำดับการแสดงผล" hint="เลขน้อยแสดงก่อน — เว้นว่างเพื่อวางไว้ท้ายสุด">
              <input
                name="sort_order"
                type="number"
                min={0}
                max={9999}
                defaultValue={item?.sort_order}
                className={inputCls}
                placeholder="อัตโนมัติ"
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="published"
                defaultChecked={item?.published ?? true}
                className="size-4 accent-brand"
              />
              เผยแพร่บนเว็บไซต์
            </label>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton pending={pending}>{item ? "บันทึกการแก้ไข" : "เพิ่มเสียงลูกค้า"}</SaveButton>
        <Link href="/admin/testimonials" className={btnGhost}>
          ยกเลิก
        </Link>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
