"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, Field, btnGhost, inputCls } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { FormMessage } from "@/components/admin/content/FormMessage";
import { SaveButton, useSaveForm } from "@/components/admin/content/useSaveForm";
import { SERVICE_ICONS, ServiceIcon } from "@/components/admin/content/icons";
import type { Service } from "@/lib/types";
import { saveService } from "./actions";

export function ServiceForm({ service }: { service?: Service }) {
  const { state, pending, onSubmit } = useSaveForm(saveService);
  const [cover, setCover] = useState({ url: service?.cover_url ?? null, public_id: service?.cover_public_id ?? null });
  const [icon, setIcon] = useState(service?.icon ?? "sparkles");
  const iconLabel = SERVICE_ICONS.find((i) => i.value === icon)?.label;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {service && <input type="hidden" name="id" value={service.id} />}
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card className="space-y-4">
          <Field label="ชื่อบริการ">
            <input name="title" required maxLength={150} defaultValue={service?.title} className={inputCls} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug" hint="ตัวอักษรอังกฤษพิมพ์เล็ก ตัวเลข และขีดกลาง ต้องไม่ซ้ำ">
              <input
                name="slug"
                required
                maxLength={100}
                defaultValue={service?.slug}
                className={inputCls}
                placeholder="event-organizer"
                spellCheck={false}
              />
            </Field>
            <Field label="คำโปรย (subtitle)">
              <input name="subtitle" maxLength={200} defaultValue={service?.subtitle ?? ""} className={inputCls} />
            </Field>
          </div>
          <Field label="รายละเอียด">
            <textarea
              name="description"
              rows={5}
              maxLength={3000}
              defaultValue={service?.description ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="จุดเด่น / สิ่งที่รวมในบริการ" hint="พิมพ์ 1 บรรทัด = 1 รายการ">
            <textarea
              name="features"
              rows={6}
              defaultValue={service?.features.join("\n") ?? ""}
              className={inputCls}
              placeholder={"งานประกวดนางงาม\nคอนเสิร์ต\nงานนักศึกษา"}
            />
          </Field>

          <fieldset>
            <legend className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink">
              ไอคอน
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-0.5 text-xs font-normal text-white">
                <ServiceIcon name={icon} className="size-3.5" /> {iconLabel}
              </span>
            </legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {SERVICE_ICONS.map(({ value, label, Icon }) => (
                <label key={value} title={label} className="cursor-pointer">
                  <input
                    type="radio"
                    name="icon"
                    value={value}
                    checked={icon === value}
                    onChange={() => setIcon(value)}
                    className="peer sr-only"
                  />
                  <span className="flex aspect-square items-center justify-center rounded-xl border border-line bg-white text-muted transition hover:text-ink peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ink/30">
                    <Icon className="size-5" aria-hidden />
                    <span className="sr-only">{label}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-4">
            <ImageUpload folder="services" name="cover" label="รูปปก" value={cover} onChange={setCover} />
          </Card>
          <Card className="space-y-4">
            <Field label="ลำดับการแสดงผล" hint="เลขน้อยแสดงก่อน — เว้นว่างเพื่อวางไว้ท้ายสุด">
              <input
                name="sort_order"
                type="number"
                min={0}
                max={9999}
                defaultValue={service?.sort_order}
                className={inputCls}
                placeholder="อัตโนมัติ"
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="published"
                defaultChecked={service?.published ?? true}
                className="size-4 accent-brand"
              />
              เผยแพร่บนเว็บไซต์
            </label>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton pending={pending}>{service ? "บันทึกการแก้ไข" : "สร้างบริการ"}</SaveButton>
        <Link href="/admin/services" className={btnGhost}>
          ยกเลิก
        </Link>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
