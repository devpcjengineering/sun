import type { SiteSettings } from "@/lib/types";
import Reveal from "./Reveal";
import { Container } from "./ui";

export default function Stats({ stats }: { stats: SiteSettings["stats"] }) {
  const items = (stats ?? []).filter((s) => s?.value);
  if (!items.length) return null;
  return (
    <section className="relative overflow-hidden bg-ink py-16 text-white sm:py-24" aria-label="ตัวเลขความสำเร็จ">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/25 blur-3xl" aria-hidden="true" />
      <Container className="relative">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-10 sm:gap-x-16">
          {items.map((s, i) => (
            <Reveal key={`${s.label}-${i}`} delay={i * 100} className="min-w-[8rem] text-center">
              <p className="text-5xl font-extrabold leading-none tracking-tight text-brand sm:text-7xl">{s.value}</p>
              <p className="mt-3 text-sm text-white/70 sm:text-base">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
