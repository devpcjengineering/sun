import type { ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Trash2 } from "lucide-react";
import { ConfirmButton } from "../ConfirmButton";

type RowAction = (formData: FormData) => void | Promise<void>;

const iconBtn =
  "inline-flex size-8 items-center justify-center rounded-lg border border-line bg-white text-ink transition hover:bg-soft disabled:pointer-events-none disabled:opacity-30";

/**
 * ชุดปุ่มประจำแถว: สวิตช์เผยแพร่ / เลื่อนลำดับ / (slot แก้ไข) / ลบ
 * ใช้ได้ทั้งใน server และ client component — actions คือ Server Action ที่รับ FormData
 */
export function RowControls({
  id,
  published,
  isFirst,
  isLast,
  axis = "vertical",
  actions,
  itemLabel = "รายการนี้",
  deleteMessage,
  children,
}: {
  id: string;
  published: boolean;
  isFirst: boolean;
  isLast: boolean;
  axis?: "vertical" | "horizontal";
  actions: { toggle: RowAction; move: RowAction; remove: RowAction };
  itemLabel?: string;
  deleteMessage?: string;
  children?: ReactNode;
}) {
  const Prev = axis === "vertical" ? ArrowUp : ArrowLeft;
  const Next = axis === "vertical" ? ArrowDown : ArrowRight;
  const prevLabel = axis === "vertical" ? "เลื่อนขึ้น" : "เลื่อนไปก่อนหน้า";
  const nextLabel = axis === "vertical" ? "เลื่อนลง" : "เลื่อนไปถัดไป";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <form action={actions.toggle}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="published" value={String(!published)} />
        <button
          type="submit"
          role="switch"
          aria-checked={published}
          title={published ? "คลิกเพื่อซ่อน" : "คลิกเพื่อเผยแพร่"}
          className="inline-flex h-8 items-center gap-2 rounded-lg border border-line bg-white px-2 text-xs font-medium text-ink transition hover:bg-soft"
        >
          <span
            aria-hidden
            className={`relative inline-block h-4 w-7 rounded-full transition ${published ? "bg-emerald-500" : "bg-black/20"}`}
          >
            <span
              className={`absolute top-0.5 size-3 rounded-full bg-white shadow transition-all ${published ? "left-3.5" : "left-0.5"}`}
            />
          </span>
          {published ? "เผยแพร่" : "ซ่อน"}
        </button>
      </form>

      <form action={actions.move}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="up" />
        <button type="submit" disabled={isFirst} className={iconBtn} aria-label={prevLabel} title={prevLabel}>
          <Prev className="size-4" aria-hidden />
        </button>
      </form>
      <form action={actions.move}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="down" />
        <button type="submit" disabled={isLast} className={iconBtn} aria-label={nextLabel} title={nextLabel}>
          <Next className="size-4" aria-hidden />
        </button>
      </form>

      {children}

      <form action={actions.remove}>
        <input type="hidden" name="id" value={id} />
        <ConfirmButton
          message={deleteMessage ?? `ยืนยันการลบ${itemLabel}? ไม่สามารถย้อนกลับได้`}
          className={`${iconBtn} text-brand hover:bg-brand/10`}
        >
          <Trash2 className="size-4" aria-hidden />
          <span className="sr-only">ลบ{itemLabel}</span>
        </ConfirmButton>
      </form>
    </div>
  );
}
