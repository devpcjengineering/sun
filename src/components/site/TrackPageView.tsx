"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { TRACK_ENDPOINT, VISIT_KEY, classifySource, type VisitInfo } from "@/lib/analytics";

// นับการเข้าชมทุกหน้า (รวมตอนกดลิงก์ภายในเว็บ) และจำว่าผู้ชมคนนี้ "เข้ามาจากไหน" ไว้ใน sessionStorage
// เพื่อให้ฟอร์มติดต่อส่งไปพร้อมข้อความ — ไม่ใช้ cookie, ไม่ระบุตัวตน

function rememberVisit(pathname: string, referrer: string, utmSource: string | null) {
  try {
    if (sessionStorage.getItem(VISIT_KEY)) return;
    const info: VisitInfo = {
      source: classifySource(referrer || null, utmSource, location.hostname) ?? "direct",
      referrer: referrer || null,
      landing_path: pathname,
    };
    sessionStorage.setItem(VISIT_KEY, JSON.stringify(info));
  } catch {
    // private mode / ปิด storage — ข้ามไป
  }
}

export default function TrackPageView() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (!pathname) return;
    const sp = new URLSearchParams(location.search);
    const utmSource = sp.get("utm_source");
    // referrer มีความหมายเฉพาะตอนโหลดหน้าแรก — หน้าถัดไปคือคลิกภายในเว็บ
    const referrer = first.current ? document.referrer : "";
    if (first.current) rememberVisit(pathname, referrer, utmSource);
    first.current = false;

    const payload = JSON.stringify({
      path: pathname,
      referrer,
      utm_source: utmSource,
      utm_medium: sp.get("utm_medium"),
      utm_campaign: sp.get("utm_campaign"),
    });
    const blob = new Blob([payload], { type: "application/json" });
    if (!navigator.sendBeacon?.(TRACK_ENDPOINT, blob)) {
      fetch(TRACK_ENDPOINT, { method: "POST", body: payload, keepalive: true, headers: { "content-type": "application/json" } }).catch(
        () => {},
      );
    }
  }, [pathname]);

  return null;
}
