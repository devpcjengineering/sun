import type { ReactNode } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import FloatingContact from "@/components/site/FloatingContact";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import TrackPageView from "@/components/site/TrackPageView";
import { loadServices, loadSettings } from "@/components/site/safe-data";
import { lineHref } from "@/components/site/utils";

// เนื้อหามาจากฐานข้อมูล ให้ render ตอนมีคำขอเสมอ (แอดมินแก้แล้วเห็นทันที)
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, services] = await Promise.all([loadSettings(), loadServices()]);
  // Google Analytics 4 — ใส่ NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX ใน env จึงจะโหลด (นับเฉพาะหน้าเว็บ ไม่นับระบบจัดการเว็บไซต์)
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} services={services} />
      <FloatingContact phone={settings.phone} lineUrl={lineHref(settings)} />
      <TrackPageView />
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </>
  );
}
