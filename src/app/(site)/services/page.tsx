import type { Metadata } from "next";
import { Check } from "lucide-react";
import CtaBand from "@/components/site/CtaBand";
import { ServiceIcon } from "@/components/site/icons";
import Reveal from "@/components/site/Reveal";
import { loadServices, loadSettings } from "@/components/site/safe-data";
import SmartImage from "@/components/site/SmartImage";
import { ButtonLink, Container, PageHero } from "@/components/site/ui";

export async function generateMetadata(): Promise<Metadata> {
  const s = await loadSettings();
  return {
    title: "บริการของเรา",
    description: s.seo_description,
    alternates: { canonical: "/services" },
    openGraph: { title: `บริการของเรา | ${s.site_name}`, description: s.seo_description, locale: "th_TH" },
  };
}

export default async function ServicesPage() {
  const [settings, services] = await Promise.all([loadSettings(), loadServices()]);

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="บริการของเรา"
        text="ตั้งแต่จัดอีเวนต์ ไลฟ์สดขายสินค้า ไปจนถึงวิดีโอโปรดักชันและงานออกแบบ ครบจบในที่เดียวกับ #teamsunnakhon"
      />

      <div>
        {services.map((s, i) => {
          const flip = i % 2 === 1;
          return (
            <section
              key={s.id}
              id={s.slug}
              className={`scroll-mt-20 py-16 sm:py-24 ${i % 2 === 1 ? "bg-soft" : "bg-white"}`}
              aria-labelledby={`${s.slug}-title`}
            >
              <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                <Reveal className={flip ? "lg:order-2" : ""}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-ink">
                    {s.cover_url ? (
                      <SmartImage
                        src={s.cover_url}
                        alt={s.title}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-ink">
                        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-brand/40 blur-3xl" aria-hidden="true" />
                        <ServiceIcon name={s.icon} className="relative h-28 w-28 text-white sm:h-36 sm:w-36" />
                      </div>
                    )}
                    <span
                      className="absolute bottom-5 left-5 text-6xl font-extrabold leading-none text-white/90 sm:text-7xl"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={120} className={flip ? "lg:order-1" : ""}>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
                    <ServiceIcon name={s.icon} className="h-6 w-6" />
                  </span>
                  <h2 id={`${s.slug}-title`} className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                    {s.title}
                  </h2>
                  {s.subtitle && <p className="mt-2 text-lg font-semibold text-brand">{s.subtitle}</p>}
                  {s.description && <p className="mt-5 text-base leading-loose text-muted sm:text-lg">{s.description}</p>}
                  {s.features.length > 0 && (
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {s.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-ink">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                            <Check className="h-3 w-3" aria-hidden="true" />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <ButtonLink href="/contact" arrow>
                      สอบถามบริการนี้
                    </ButtonLink>
                    <ButtonLink href="/portfolio" variant="outline">
                      ดูผลงาน
                    </ButtonLink>
                  </div>
                </Reveal>
              </Container>
            </section>
          );
        })}
      </div>

      <CtaBand settings={settings} />
    </>
  );
}
