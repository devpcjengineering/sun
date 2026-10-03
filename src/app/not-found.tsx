import type { Metadata } from "next";
import FloatingContact from "@/components/site/FloatingContact";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import NotFoundContent from "@/components/site/NotFoundContent";
import { loadServices, loadSettings } from "@/components/site/safe-data";
import { lineHref } from "@/components/site/utils";

export const metadata: Metadata = { title: "ไม่พบหน้าที่ต้องการ", robots: { index: false } };

// not-found ระดับ root (URL ที่ไม่ตรงกับ route ใดเลย) อยู่นอก (site)/layout จึงใส่ Header/Footer เอง
export default async function NotFound() {
  const [settings, services] = await Promise.all([loadSettings(), loadServices()]);
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <NotFoundContent />
      </main>
      <Footer settings={settings} services={services} />
      <FloatingContact phone={settings.phone} lineUrl={lineHref(settings)} />
    </>
  );
}
