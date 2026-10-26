"use client";
import { useSyncExternalStore } from "react";
import { VISIT_KEY, type VisitInfo } from "@/lib/analytics";

// ช่องซ่อนในฟอร์มติดต่อ: ส่ง "ลูกค้ามาจากไหน" (จาก TrackPageView) ไปกับข้อความ

const subscribe = () => () => {};
function readVisit(): string | null {
  try {
    return sessionStorage.getItem(VISIT_KEY);
  } catch {
    return null;
  }
}

export function VisitSourceFields() {
  // server render = null (ไม่มี storage) → client อ่านค่าหลัง hydrate โดยไม่ต้อง setState ใน effect
  const raw = useSyncExternalStore(subscribe, readVisit, () => null);
  if (!raw) return null;
  let visit: VisitInfo;
  try {
    visit = JSON.parse(raw) as VisitInfo;
  } catch {
    return null;
  }
  return (
    <>
      <input type="hidden" name="visit_source" value={visit.source} />
      <input type="hidden" name="visit_referrer" value={visit.referrer ?? ""} />
      <input type="hidden" name="visit_landing" value={visit.landing_path} />
    </>
  );
}
