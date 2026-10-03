import { Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { FacebookIcon, LineIcon } from "./brand-icons";
import { Container } from "./ui";
import { keepTogether, lineHref, telHref } from "./utils";

export default function CtaBand({ settings }: { settings: SiteSettings }) {
  const btn =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base";
  return (
    <section className="relative overflow-hidden bg-brand text-white">
      <div
        className="pointer-events-none absolute -left-20 -top-32 h-80 w-80 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-black/20 blur-3xl"
        aria-hidden="true"
      />
      <Container className="relative py-16 text-center sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">#teamsunnakhon</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">{keepTogether(settings.cta_title)}</h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">{settings.cta_text}</p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <a href={telHref(settings.phone)} className={`${btn} bg-white text-ink hover:bg-ink hover:text-white`}>
            <Phone className="h-5 w-5" aria-hidden="true" />
            {settings.phone}
          </a>
          <a
            href={lineHref(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn} border border-white/60 text-white hover:bg-white hover:text-ink`}
          >
            <LineIcon className="h-5 w-5" />
            LINE {settings.line_id}
          </a>
          <a
            href={settings.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn} border border-white/60 text-white hover:bg-white hover:text-ink`}
          >
            <FacebookIcon className="h-5 w-5" />
            Facebook
          </a>
        </div>
      </Container>
    </section>
  );
}
