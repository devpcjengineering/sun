"use client";
import { useEffect, useSyncExternalStore } from "react";

// สถานะ "กำลังทำงาน" ของหลังบ้าน (อัปโหลด/บันทึก/ลบ) — ใช้ร่วมกันทั้งแอป
// ใครเริ่มงานเรียก startBusy() ได้ handle; BusyOverlay อ่านสถานะนี้แล้วแสดงตัวโหลดจนกว่าทุกงานจะเสร็จ

export type BusySnapshot = {
  count: number;
  label: string;
  /** 0..1 ถ้าทุกงานรู้ความคืบหน้า ไม่งั้น null (แสดงแบบวิ่งไม่รู้จบ) */
  progress: number | null;
  /** ค่าล่าสุดตอนที่ยังมีงาน (คงไว้หลังงานเสร็จ เพื่อใช้แสดงตอน fade-out) */
  lastLabel: string;
  lastProgress: number | null;
};

type Task = { label: string; progress: number | null };

const tasks = new Map<number, Task>();
const listeners = new Set<() => void>();
let seq = 0;
const EMPTY: BusySnapshot = { count: 0, label: "", progress: null, lastLabel: "", lastProgress: null };
let snapshot: BusySnapshot = EMPTY;

function recompute() {
  if (tasks.size === 0) {
    snapshot = { ...EMPTY, lastLabel: snapshot.lastLabel, lastProgress: snapshot.lastProgress };
  } else {
    const list = [...tasks.values()];
    const known = list.every((t) => t.progress !== null);
    const progress = known ? list.reduce((s, t) => s + (t.progress as number), 0) / list.length : null;
    const last = list[list.length - 1];
    const same = list.every((t) => t.label === last.label);
    const label = list.length > 1 && same ? `${last.label} (${list.length})` : last.label;
    snapshot = { count: list.length, label, progress, lastLabel: label, lastProgress: progress };
  }
  listeners.forEach((l) => l());
}

export type BusyHandle = {
  progress: (p: number | null) => void;
  done: () => void;
};

export function startBusy(label = "กำลังดำเนินการ…"): BusyHandle {
  const id = ++seq;
  tasks.set(id, { label, progress: null });
  recompute();
  return {
    progress(p) {
      const t = tasks.get(id);
      if (!t) return;
      t.progress = p === null ? null : Math.min(1, Math.max(0, p));
      recompute();
    },
    done() {
      if (tasks.delete(id)) recompute();
    },
  };
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useBusy(): BusySnapshot {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY,
  );
}

/** ผูกสถานะ pending ของฟอร์ม/transition เข้ากับตัวโหลดรวม */
export function useBusyWhile(active: boolean, label?: string) {
  useEffect(() => {
    if (!active) return;
    const h = startBusy(label);
    return () => h.done();
  }, [active, label]);
}
