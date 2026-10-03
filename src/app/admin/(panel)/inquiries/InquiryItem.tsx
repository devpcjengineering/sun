"use client";
import { useState } from "react";
import { Check, ChevronDown, Mail, Phone, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import type { Inquiry } from "@/lib/types";
import { deleteInquiry, openInquiry, setInquiryStatus } from "./actions";

const STATUS_LABEL = { new: "ใหม่", read: "อ่านแล้ว", done: "เสร็จสิ้น" } as const;
const STATUS_TONE = { new: "red", read: "gray", done: "green" } as const;

const smallBtn =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-xs font-medium text-ink transition hover:bg-soft";

export function InquiryItem({ inquiry, createdLabel }: { inquiry: Inquiry; createdLabel: string }) {
  const [opened, setOpened] = useState(false);
  // เปิดอ่านแล้ว new → read (แสดงผลทันที โดยไม่รอ revalidate)
  const status = opened && inquiry.status === "new" ? "read" : inquiry.status;

  async function changeStatus(fd: FormData) {
    setOpened(false); // ใช้สถานะจริงจาก server หลังเปลี่ยนแล้ว
    await setInquiryStatus(fd);
  }

  return (
    <details
      className="group rounded-2xl border border-line bg-white open:shadow-sm"
      onToggle={(e) => {
        if (e.currentTarget.open && inquiry.status === "new" && !opened) {
          setOpened(true);
          void openInquiry(inquiry.id);
        }
      }}
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className={`mt-2 size-2 shrink-0 rounded-full ${status === "new" ? "bg-brand" : "bg-transparent"}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className={`text-ink ${status === "new" ? "font-semibold" : "font-medium"}`}>{inquiry.name}</p>
            <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
            {inquiry.service && <Badge tone="black">{inquiry.service}</Badge>}
            <time dateTime={inquiry.created_at} className="text-xs text-muted">
              {createdLabel}
            </time>
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-muted group-open:hidden">{inquiry.message}</p>
        </div>
        <ChevronDown className="mt-1 size-4 shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
      </summary>

      <div className="space-y-4 border-t border-line px-4 pb-4 pt-4 sm:pl-9">
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{inquiry.message}</p>

        <div className="flex flex-wrap gap-2">
          {inquiry.phone && (
            <a href={`tel:${inquiry.phone.replace(/[^\d+]/g, "")}`} className={smallBtn}>
              <Phone className="size-3.5" aria-hidden /> {inquiry.phone}
            </a>
          )}
          {inquiry.email && (
            <a href={`mailto:${inquiry.email}`} className={smallBtn}>
              <Mail className="size-3.5" aria-hidden /> {inquiry.email}
            </a>
          )}
          {!inquiry.phone && !inquiry.email && <span className="text-xs text-muted">ไม่มีช่องทางติดต่อกลับ</span>}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          {status !== "read" && (
            <form action={changeStatus}>
              <input type="hidden" name="id" value={inquiry.id} />
              <input type="hidden" name="status" value="read" />
              <button type="submit" className={smallBtn}>
                <Check className="size-3.5" aria-hidden /> ทำเครื่องหมายว่าอ่านแล้ว
              </button>
            </form>
          )}
          {status !== "done" && (
            <form action={changeStatus}>
              <input type="hidden" name="id" value={inquiry.id} />
              <input type="hidden" name="status" value="done" />
              <button type="submit" className={`${smallBtn} border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700`}>
                <Check className="size-3.5" aria-hidden /> เสร็จสิ้น
              </button>
            </form>
          )}
          {status !== "new" && (
            <form action={changeStatus}>
              <input type="hidden" name="id" value={inquiry.id} />
              <input type="hidden" name="status" value="new" />
              <button type="submit" className={smallBtn}>
                <RotateCcw className="size-3.5" aria-hidden /> ตั้งเป็นใหม่
              </button>
            </form>
          )}
          <form action={deleteInquiry} className="ml-auto">
            <input type="hidden" name="id" value={inquiry.id} />
            <ConfirmButton
              message={`ลบข้อความจาก "${inquiry.name}"? ไม่สามารถย้อนกลับได้`}
              className={`${smallBtn} text-brand hover:bg-brand/10`}
            >
              <Trash2 className="size-3.5" aria-hidden /> ลบ
            </ConfirmButton>
          </form>
        </div>
      </div>
    </details>
  );
}
