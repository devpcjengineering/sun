"use client";
import Link from "next/link";
import { Card, Field, btnGhost, inputCls } from "@/components/admin/ui";
import { FormMessage } from "@/components/admin/content/FormMessage";
import { SaveButton, useSaveForm } from "@/components/admin/content/useSaveForm";
import type { Package } from "@/lib/types";
import { savePackage } from "./actions";

export function PackageForm({ pkg }: { pkg?: Package }) {
  const { state, pending, onSubmit } = useSaveForm(savePackage);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {pkg && <input type="hidden" name="id" value={pkg.id} />}
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card className="space-y-4">
          <Field label="ชื่อแพ็กเกจ">
            <input name="name" required maxLength={150} defaultValue={pkg?.name} className={inputCls} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ราคา" hint='พิมพ์อิสระ เช่น "เริ่มต้น 25,000 บาท" หรือ "สอบถามราคา"'>
              <input
                name="price_text"
                required
                maxLength={120}
                defaultValue={pkg?.price_text ?? "สอบถามราคา"}
                className={inputCls}
              />
            </Field>
            <Field label="หมายเหตุราคา" hint='เช่น "ตามขนาดและรูปแบบงาน"'>
              <input name="price_note" maxLength={200} defaultValue={pkg?.price_note ?? ""} className={inputCls} />
            </Field>
          </div>
          <Field label="รายละเอียด">
            <textarea
              name="description"
              rows={3}
              maxLength={2000}
              defaultValue={pkg?.description ?? ""}
              className={inputCls}
            />
          </Field>
          <Field label="สิ่งที่รวมในแพ็กเกจ" hint="พิมพ์ 1 บรรทัด = 1 รายการ">
            <textarea
              name="features"
              rows={7}
              defaultValue={pkg?.features.join("\n") ?? ""}
              className={inputCls}
              placeholder={"วางคอนเซ็ปต์และแผนงาน\nจัดหา Supplier และสถานที่\nทีมงานดูแลหน้างาน"}
            />
          </Field>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-4">
            <Field label="ข้อความปุ่ม">
              <input
                name="cta_label"
                required
                maxLength={60}
                defaultValue={pkg?.cta_label ?? "ติดต่อเรา"}
                className={inputCls}
              />
            </Field>
            <Field label="ลำดับการแสดงผล" hint="เลขน้อยแสดงก่อน — เว้นว่างเพื่อวางไว้ท้ายสุด">
              <input
                name="sort_order"
                type="number"
                min={0}
                max={9999}
                defaultValue={pkg?.sort_order}
                className={inputCls}
                placeholder="อัตโนมัติ"
              />
            </Field>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
              <input
                type="checkbox"
                name="highlight"
                defaultChecked={pkg?.highlight ?? false}
                className="mt-0.5 size-4 accent-brand"
              />
              <span>
                <span className="font-medium">แพ็กเกจแนะนำ (Highlight)</span>
                <span className="block text-xs text-muted">เน้นการ์ดด้วยสีแบรนด์บนหน้าเว็บ</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="published"
                defaultChecked={pkg?.published ?? true}
                className="size-4 accent-brand"
              />
              เผยแพร่บนเว็บไซต์
            </label>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton pending={pending}>{pkg ? "บันทึกการแก้ไข" : "สร้างแพ็กเกจ"}</SaveButton>
        <Link href="/admin/packages" className={btnGhost}>
          ยกเลิก
        </Link>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
