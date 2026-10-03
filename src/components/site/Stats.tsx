import type { SiteSettings } from "@/lib/types";
import Reveal from "./Reveal";
import { ServiceIcon } from "./icons";
import { Container } from "./ui";

/** ข้อความที่ขึ้นต้นด้วย # แสดงเป็นสีแดง */
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split(/(#\S+)/g).map((part, i) =>
        part.startsWith("#") ? (
          <span key={i} className="text-brand">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

type Props = Pick<SiteSettings, "stats" | "band_eyebrow" | "band_title" | "band_text" | "ticker_items" | "capabilities">;

// ค่าทั้งหมดแก้ได้ที่หลังบ้าน: ตั้งค่าเว็บไซต์ > แถบเด่นหน้าแรก
export default function Stats({ stats, band_eyebrow, band_title, band_text, ticker_items, capabilities }: Props) {
  const items = (stats ?? []).filter((s) => s?.value);
  const caps = (capabilities ?? []).filter((c) => c?.title);
  const ticker = (ticker_items ?? []).map((t) => t.trim()).filter(Boolean);
  if (!items.length && !caps.length && !ticker.length) return null;

  return (
    <section className="relative overflow-hidden bg-ink text-white" aria-label="ตัวเลขความสำเร็จ">
      {/* พื้นหลัง: แสงสีแดง + ลายตาราง */}
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-brand/15 blur-3xl" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px]"
        aria-hidden="true"
      />

      <Container className="relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <Reveal>
            {band_eyebrow && (
              <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-brand">
                <span className="h-px w-8 bg-brand" aria-hidden="true" />
                {band_eyebrow}
              </p>
            )}
            {band_title && (
              <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
                <Highlighted text={band_title} />
              </h2>
            )}
            {band_text && <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">{band_text}</p>}
          </Reveal>

          {items.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-4">
              {items.map((s, i) => (
                <Reveal
                  key={`${s.label}-${i}`}
                  delay={i * 100}
                  className="min-w-[10rem] rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-6 backdrop-blur"
                >
                  <p className="text-5xl font-extrabold leading-none tracking-tight text-brand sm:text-6xl">{s.value}</p>
                  <p className="mt-3 text-sm text-white/70 sm:text-base">{s.label}</p>
                </Reveal>
              ))}
            </div>
          )}
        </div>

        {caps.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {caps.map((c, i) => (
              <Reveal key={`${c.title}-${i}`} delay={i * 90} className="group">
                <li className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors duration-300 hover:border-brand hover:bg-brand">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white transition-colors group-hover:bg-white group-hover:text-brand">
                    <ServiceIcon name={c.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{c.title}</h3>
                  {c.text && (
                    <p className="mt-1.5 text-sm text-white/65 transition-colors group-hover:text-white/90">{c.text}</p>
                  )}
                </li>
              </Reveal>
            ))}
          </ul>
        )}
      </Container>

      {/* ป้ายข้อความวิ่งไปทางซ้าย */}
      {ticker.length > 0 && (
        <div className="relative overflow-hidden border-t border-white/10 py-5" aria-hidden="true">
          <div className="marquee-track items-center" style={{ animationDuration: `${Math.max(20, ticker.length * 6)}s` }}>
            {[0, 1].map((n) => (
              <div key={n} className="flex shrink-0 items-center">
                {ticker.map((t, i) => (
                  <span key={`${n}-${i}`} className="flex items-center">
                    <span className="whitespace-nowrap px-8 text-2xl font-extrabold tracking-wider text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.35)] sm:text-4xl">
                      {t}
                    </span>
                    <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
