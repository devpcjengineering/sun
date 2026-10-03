import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import Reveal from "./Reveal";
import SmartImage from "./SmartImage";
import { Container, SectionHeading } from "./ui";

export default function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-soft py-20 sm:py-28" aria-labelledby="testimonials-heading">
      <Container>
        <div id="testimonials-heading">
          <SectionHeading eyebrow="Testimonials" title="เสียงจากลูกค้าของเรา" center />
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 100}>
              <figure className="flex h-full flex-col rounded-3xl bg-white p-8 shadow-sm">
                <Quote className="h-8 w-8 text-brand" aria-hidden="true" />
                <div className="mt-4 flex gap-0.5" role="img" aria-label={`ให้คะแนน ${t.rating} จาก 5`}>
                  {Array.from({ length: 5 }, (_, n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${n < t.rating ? "fill-brand text-brand" : "text-line"}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 leading-relaxed text-ink">{t.content}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-sm font-bold text-white">
                    {t.avatar_url ? (
                      <SmartImage src={t.avatar_url} alt={t.name} fixed={{ width: 44, height: 44 }} className="h-full w-full object-cover" />
                    ) : (
                      t.name.slice(0, 1)
                    )}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{t.name}</span>
                    {t.role && <span className="block text-sm text-muted">{t.role}</span>}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
