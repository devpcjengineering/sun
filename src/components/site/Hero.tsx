import { Mic, Palette, Smartphone, Clapperboard } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import SmartImage from "./SmartImage";
import { ButtonLink, Container } from "./ui";

const CHIPS = [
  { icon: Mic, label: "Event" },
  { icon: Smartphone, label: "Live Commerce" },
  { icon: Clapperboard, label: "Video" },
  { icon: Palette, label: "Motion" },
];

export default function Hero({ settings }: { settings: SiteSettings }) {
  const stat = settings.stats?.[0];
  return (
    <section className="relative overflow-hidden bg-white">
      {/* พื้นหลังกราฟิก */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:64px_64px]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -bottom-10 -left-4 select-none text-[16rem] font-extrabold leading-none text-ink/[0.03] sm:text-[24rem]"
        aria-hidden="true"
      >
        #
      </div>

      <Container className="relative grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:py-32">
        <div>
          <p className="fade-up inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-4 py-1.5 text-sm font-bold text-brand">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand motion-reduce:animate-none" aria-hidden="true" />
            {settings.hero_eyebrow}
          </p>
          <h1
            className="fade-up mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-ink [animation-delay:80ms] [text-wrap:balance] sm:text-5xl lg:text-6xl"
          >
            {settings.hero_title}
          </h1>
          <p className="fade-up mt-6 max-w-xl text-base leading-relaxed text-muted [animation-delay:160ms] sm:text-lg">
            {settings.hero_subtitle}
          </p>
          <div className="fade-up mt-10 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row">
            <ButtonLink href="/contact" arrow>
              ปรึกษาฟรี ติดต่อเรา
            </ButtonLink>
            <ButtonLink href="/portfolio" variant="outline">
              ดูผลงานของเรา
            </ButtonLink>
          </div>
        </div>

        <div className="fade-up relative [animation-delay:200ms]">
          {settings.hero_image_url ? (
            <div className="relative mx-auto max-w-xl">
              <div className="absolute -bottom-4 -right-4 h-full w-full rounded-[2rem] bg-brand" aria-hidden="true" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-ink">
                <SmartImage
                  src={settings.hero_image_url}
                  alt={settings.site_name}
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="relative mx-auto grid max-w-md grid-cols-2 gap-4">
              <div className="col-span-2 rounded-[2rem] bg-ink p-8 text-white shadow-2xl shadow-black/20">
                <p className="text-sm font-semibold uppercase tracking-widest text-white/50">Experience</p>
                <p className="mt-2 text-7xl font-extrabold leading-none sm:text-8xl">
                  {stat?.value ?? "4+"}
                  <span className="text-brand">.</span>
                </p>
                <p className="mt-2 text-lg text-white/80">{stat?.label ?? "ปีประสบการณ์"}</p>
              </div>
              {CHIPS.map((c, i) => (
                <div
                  key={c.label}
                  className={`flex items-center gap-3 rounded-3xl p-5 text-sm font-semibold transition-transform duration-300 hover:-translate-y-1 ${
                    i === 0 || i === 3 ? "bg-brand text-white" : "border border-line bg-white text-ink shadow-sm"
                  }`}
                >
                  <c.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                  {c.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
