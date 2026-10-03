import { Clapperboard, Mic, Palette, Smartphone } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import Reveal from "./Reveal";
import { Container } from "./ui";

const CAPABILITIES = [
  { icon: Mic, title: "Event Organizer", text: "ประกวด คอนเสิร์ต งานนักศึกษา" },
  { icon: Smartphone, title: "Live Commerce", text: "ไลฟ์สดขายสินค้าให้ปัง" },
  { icon: Clapperboard, title: "Video Production", text: "ถ่ายทำ ตัดต่อ ทุกรูปแบบ" },
  { icon: Palette, title: "Graphic & Motion", text: "ดีไซน์ที่สะกดทุกสายตา" },
];

const TICKER = ["EVENT", "LIVE COMMERCE", "VIDEO PRODUCTION", "GRAPHIC & MOTION", "#TEAMSUNNAKHON"];

export default function Stats({ stats }: { stats: SiteSettings["stats"] }) {
  const items = (stats ?? []).filter((s) => s?.value);
  if (!items.length) return null;

  return (
    <section className="relative overflow-hidden bg-ink text-white" aria-label="ตัวเลขความสำเร็จ">
      {/* พื้นหลัง: แสงสีแดง + ตัวอักษรใหญ่จาง ๆ */}
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-brand/15 blur-3xl" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px]"
        aria-hidden="true"
      />

      <Container className="relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-brand">
              <span className="h-px w-8 bg-brand" aria-hidden="true" />
              Why Us
            </p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
              <span className="text-brand">#teamsunnakhon</span> ทำได้ทุกอย่าง
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
              เราไม่ใช่แค่ออแกไนเซอร์ แต่คือพาร์ทเนอร์ที่พร้อมเนรมิตทุกไอเดียของคุณให้เกิดขึ้นจริง จบครบในที่เดียว
            </p>
          </Reveal>

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
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.title} delay={i * 90} className="group">
              <li className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors duration-300 hover:border-brand hover:bg-brand">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white transition-colors group-hover:bg-white group-hover:text-brand">
                  <c.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{c.title}</h3>
                <p className="mt-1.5 text-sm text-white/65 transition-colors group-hover:text-white/90">{c.text}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </Container>

      {/* ป้ายข้อความวิ่งไปทางซ้าย */}
      <div className="relative overflow-hidden border-t border-white/10 py-5" aria-hidden="true">
        <div className="marquee-track items-center" style={{ animationDuration: "30s" }}>
          {[0, 1].map((n) => (
            <div key={n} className="flex shrink-0 items-center">
              {TICKER.map((t) => (
                <span key={`${n}-${t}`} className="flex items-center">
                  <span className="px-8 text-2xl font-extrabold tracking-wider text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.35)] sm:text-4xl">
                    {t}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
