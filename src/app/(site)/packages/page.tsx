import type { Metadata } from "next";
import { openGraphFor } from "@/lib/seo";
import CtaBand from "@/components/site/CtaBand";
import PackageCard from "@/components/site/PackageCard";
import Reveal from "@/components/site/Reveal";
import { loadPackages, loadSettings } from "@/components/site/safe-data";
import { ButtonLink, Container, EmptyState, PageHero } from "@/components/site/ui";

export async function generateMetadata(): Promise<Metadata> {
  const s = await loadSettings();
  return {
    title: "แพ็คเก็จ/ราคา",
    description: s.seo_description,
    alternates: { canonical: "/packages" },
    openGraph: openGraphFor({ title: `แพ็คเก็จ/ราคา | ${s.site_name}`, description: s.seo_description, path: "/packages" }),
  };
}

export default async function PackagesPage() {
  const [settings, packages] = await Promise.all([loadSettings(), loadPackages()]);

  return (
    <>
      <PageHero
        eyebrow="Packages"
        title="แพ็คเก็จ/ราคา"
        text="เลือกแพ็คเก็จที่เหมาะกับงานของคุณ ปรับแต่งได้ตามงบประมาณและรูปแบบงาน ปรึกษาทีมงานได้ฟรี"
      />

      <section className="py-16 sm:py-24" aria-label="รายการแพ็คเก็จ">
        <Container>
          {packages.length ? (
            <div className="grid gap-8 pt-3 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 100} className="h-full">
                  <PackageCard pkg={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title="กำลังจัดทำแพ็คเก็จ"
              text="ขณะนี้ยังไม่มีแพ็คเก็จที่เผยแพร่ ทักมาบอกความต้องการ ทีมงานจะเสนอราคาให้ตามงานของคุณ"
              action={<ButtonLink href="/contact">ขอใบเสนอราคา</ButtonLink>}
            />
          )}

          <div className="mt-16 rounded-3xl bg-soft p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">ต้องการแพ็คเก็จเฉพาะงานของคุณ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              บอกรายละเอียดงาน วันที่ และงบประมาณคร่าว ๆ ทีม #teamsunnakhon จะออกแบบแพ็คเก็จที่ใช่ให้
            </p>
            <div className="mt-6 flex justify-center">
              <ButtonLink href="/contact" arrow>
                ติดต่อเรา
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand settings={settings} />
    </>
  );
}
