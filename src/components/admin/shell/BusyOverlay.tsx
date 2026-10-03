"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useBusy } from "@/lib/busy";

const SHOW_DELAY = 180; // งานสั้นกว่านี้ไม่ต้องขึ้น (กันกะพริบ)
const MIN_VISIBLE = 600; // ขึ้นแล้วต้องค้างอย่างน้อยเท่านี้ (ให้ดูนุ่มนวล ไม่แวบ)
const DONE_HOLD = 500; // โชว์ "เสร็จแล้ว" ก่อนค่อย ๆ จาง
const FADE = 280;

type Phase = "hidden" | "busy" | "done" | "leaving";

/**
 * ตัวโหลดเต็มจอของหลังบ้าน: ล็อกการกดระหว่างอัปโหลด/บันทึก/ลบ แสดงความคืบหน้า
 * รอจนทุกงานเสร็จจริง → แสดง "เสร็จแล้ว" → จางหายอย่างนุ่มนวล แล้วจึงปล่อยให้ใช้งานต่อ
 * และเตือนก่อนปิด/รีเฟรชหน้าถ้างานยังไม่เสร็จ
 */
export function BusyOverlay() {
  const busy = useBusy();
  const [phase, setPhase] = useState<Phase>("hidden");
  const shown = { label: busy.lastLabel, progress: busy.lastProgress };
  const shownAt = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  useEffect(() => {
    if (busy.count > 0) {
      if (phase === "hidden") {
        clearTimers();
        later(() => {
          shownAt.current = Date.now();
          setPhase("busy");
        }, SHOW_DELAY);
      } else if (phase === "done" || phase === "leaving") {
        // มีงานใหม่เข้ามาระหว่างกำลังจาง → กลับมาแสดงต่อ
        clearTimers();
        later(() => setPhase("busy"), 0);
      }
    } else {
      // ทุกงานเสร็จ
      if (phase === "hidden") {
        clearTimers(); // งานสั้นมาก ไม่เคยขึ้น
      } else if (phase === "busy") {
        clearTimers();
        const wait = Math.max(0, MIN_VISIBLE - (Date.now() - shownAt.current));
        later(() => {
          setPhase("done");
          later(() => {
            setPhase("leaving");
            later(() => setPhase("hidden"), FADE);
          }, DONE_HOLD);
        }, wait);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy.count, busy.label, busy.progress]);

  useEffect(() => clearTimers, []);

  // เตือนก่อนปิดแท็บ/รีเฟรช ระหว่างงานยังไม่เสร็จ
  useEffect(() => {
    if (busy.count === 0) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [busy.count]);

  // ล็อกการเลื่อนหน้าขณะแสดง
  useEffect(() => {
    if (phase === "hidden") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "hidden") return null;

  const pct = shown.progress === null ? null : Math.round(shown.progress * 100);
  const isDone = phase === "done" || phase === "leaving";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!isDone}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/35 backdrop-blur-[2px] transition-opacity"
      style={{ transitionDuration: `${FADE}ms`, opacity: phase === "leaving" ? 0 : 1 }}
    >
      <div
        className="fade-up w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-white p-6 text-center shadow-2xl"
        style={{ transform: phase === "leaving" ? "scale(.97)" : undefined, transition: `transform ${FADE}ms` }}
      >
        <div className="mx-auto flex size-12 items-center justify-center">
          {isDone ? (
            <CheckCircle2 className="size-10 text-emerald-600" aria-hidden />
          ) : (
            <Loader2 className="size-9 animate-spin text-brand" aria-hidden />
          )}
        </div>
        <p className="mt-3 text-base font-semibold text-ink">{isDone ? "เสร็จเรียบร้อย" : shown.label}</p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-soft">
          {isDone ? (
            <div className="h-full w-full rounded-full bg-emerald-600" />
          ) : pct === null ? (
            <div className="loader-bar h-full w-1/3 rounded-full bg-brand" />
          ) : (
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          )}
        </div>
        <p className="mt-2 h-4 text-xs text-muted">
          {isDone ? "" : pct === null ? "โปรดรอสักครู่ อย่าปิดหน้านี้" : `${pct}% · อย่าปิดหน้านี้`}
        </p>
      </div>
    </div>
  );
}
