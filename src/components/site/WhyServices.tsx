import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service, SiteSettings } from "@/lib/types";
import { ServiceIcon } from "./icons";
import Reveal from "./Reveal";
import { Container, SectionHeading } from "./ui";

/** ส่วนที่ 2: ทำไมต้อง #teamsunnakhon + การ์ดบริการ 3 ใบ */
export default function WhyServices({ settings, services }: { settings: SiteSettings; services: Service[] }) {
  const top = services.slice(0, 3);
  return (
    <section className="bg-soft py-20 sm:py-28" aria-labelledby="why-heading">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div id="why-heading">
            <SectionHeading eyebrow="Why us" title={settings.why_title} />
          </div>
          <p className="whitespace-pre-line text-base leading-loose text-muted sm:text-lg lg:pt-9">{settings.why_text}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {top.map((s, i) => (
            <Reveal key={s.id} delay={i * 100} className="h-full">
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white p-8 transition duration-300 hover:-translate-y-1.5 hover:border-brand hover:shadow-xl hover:shadow-brand/10">
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none" aria-hidden="true" />
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white transition-colors duration-300 group-hover:bg-brand">
                  <ServiceIcon name={s.icon} className="h-7 w-7" />
                </span>
                <h3 className="mt-6 text-xl font-bold text-ink">{s.title}</h3>
                {s.subtitle && <p className="mt-1 text-sm font-semibold text-brand">{s.subtitle}</p>}
                {s.description && <p className="mt-4 flex-1 leading-relaxed text-muted">{s.description}</p>}
                <Link
                  href={`/services#${s.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand"
                >
                  ดูเพิ่มเติม
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  <span className="sr-only">เกี่ยวกับ {s.title}</span>
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
