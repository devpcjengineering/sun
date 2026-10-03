import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Service, SiteSettings } from "@/lib/types";
import { FacebookIcon, InstagramIcon, LineIcon, TiktokIcon, YoutubeIcon } from "./brand-icons";
import { Container } from "./ui";
import { NAV_LINKS, lineHref, telHref } from "./utils";

export default function Footer({ settings, services }: { settings: SiteSettings; services: Service[] }) {
  const socials = [
    { href: settings.facebook_url, label: "Facebook", icon: <FacebookIcon className="h-5 w-5" /> },
    { href: lineHref(settings), label: "LINE", icon: <LineIcon className="h-5 w-5" /> },
    settings.instagram_url && { href: settings.instagram_url, label: "Instagram", icon: <InstagramIcon className="h-5 w-5" /> },
    settings.tiktok_url && { href: settings.tiktok_url, label: "TikTok", icon: <TiktokIcon className="h-5 w-5" /> },
    settings.youtube_url && { href: settings.youtube_url, label: "YouTube", icon: <YoutubeIcon className="h-5 w-5" /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="h-1 bg-brand" aria-hidden="true" />
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Image src="/brand/logo-white.svg" alt="SUNNAKHON GROUP" width={190} height={47} unoptimized className="h-10 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
            Event, Live Commerce และ Production ครบวงจร จบในที่เดียว ด้วยประสบการณ์กว่า 4 ปี
          </p>
          <p className="mt-4 text-sm font-semibold text-brand">#teamsunnakhon</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-brand hover:bg-brand"
                >
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="แผนผังเว็บไซต์">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">เมนู</h2>
          <ul className="mt-5 space-y-3">
            {[...NAV_LINKS, { href: "/articles", label: "บทความ" }, { href: "/customers", label: "ลูกค้าที่เคยร่วมงาน" }, { href: "/contact", label: "ติดต่อเรา" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/80 transition-colors hover:text-brand">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="บริการ">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">บริการ</h2>
          <ul className="mt-5 space-y-3">
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/services#${s.slug}`} className="text-white/80 transition-colors hover:text-brand">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">ติดต่อเรา</h2>
          <ul className="mt-5 space-y-4 text-white/80">
            <li>
              <a href={telHref(settings.phone)} className="flex items-start gap-3 transition-colors hover:text-brand">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                {settings.phone}
              </a>
            </li>
            <li>
              <a href={lineHref(settings)} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 transition-colors hover:text-brand">
                <LineIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                LINE {settings.line_id}
              </a>
            </li>
            <li>
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 transition-colors hover:text-brand">
                <FacebookIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                Facebook: Sunnakhon
              </a>
            </li>
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-start gap-3 break-all transition-colors hover:text-brand">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                {settings.map_url ? (
                  <a href={settings.map_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
                    {settings.address}
                  </a>
                ) : (
                  settings.address
                )}
              </li>
            )}
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center gap-2 pt-6 text-center text-sm text-white/50 sm:flex-row sm:justify-between sm:text-left">
          <p>© 2026 Sunnakhon group. All Rights Reserved.</p>
          <p className="flex items-center gap-4">
            <span>#teamsunnakhon</span>
            {/* เดสก์ท็อป: อยู่ข้าง #teamsunnakhon */}
            <a href="/admin" className="hidden text-white/40 transition-colors hover:text-white sm:inline">
              เข้าสู่ระบบหลังบ้าน
            </a>
          </p>
        </Container>
        {/* มือถือ: ล่างสุดของหน้า กึ่งกลาง */}
        <Container className="flex justify-center pb-6 pt-3 text-sm text-white/40 sm:hidden">
          <a href="/admin" className="transition-colors hover:text-white">
            เข้าสู่ระบบหลังบ้าน
          </a>
        </Container>
      </div>
    </footer>
  );
}
