import type { Metadata } from "next";
import { openGraphFor } from "@/lib/seo";
import { Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, LineIcon } from "@/components/site/brand-icons";
import ContactForm from "@/components/site/ContactForm";
import { loadServices, loadSettings } from "@/components/site/safe-data";
import { ButtonLink, Container, PageHero } from "@/components/site/ui";
import { lineHref, telHref } from "@/components/site/utils";

export async function generateMetadata(): Promise<Metadata> {
  const s = await loadSettings();
  return {
    title: "ติดต่อเรา",
    description: s.seo_description,
    alternates: { canonical: "/contact" },
    openGraph: openGraphFor({ title: `ติดต่อเรา | ${s.site_name}`, description: s.seo_description, path: "/contact" }),
  };
}

export default async function ContactPage() {
  const [settings, services] = await Promise.all([loadSettings(), loadServices()]);

  const cards = [
    {
      icon: <Phone className="h-6 w-6" aria-hidden="true" />,
      label: "โทรศัพท์",
      value: settings.phone,
      href: telHref(settings.phone),
    },
    {
      icon: <LineIcon className="h-6 w-6" />,
      label: "LINE",
      value: settings.line_id,
      href: lineHref(settings),
    },
    {
      icon: <FacebookIcon className="h-6 w-6" />,
      label: "Facebook",
      value: "Sunnakhon",
      href: settings.facebook_url,
    },
    settings.email && {
      icon: <Mail className="h-6 w-6" aria-hidden="true" />,
      label: "อีเมล",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; href: string }[];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="ติดต่อเรา"
        text="มีไอเดียหรืองานที่อยากให้เราช่วย? ส่งข้อความหรือทักมาได้เลย ปรึกษาฟรี ไม่มีค่าใช้จ่าย"
      />

      <section className="py-14 sm:py-24" aria-label="ช่องทางติดต่อ">
        <Container className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <h2 className="mb-6 text-2xl font-bold text-ink sm:text-3xl">ส่งข้อความถึงเรา</h2>
            <ContactForm services={services.map((s) => s.title)} />
          </div>

          <aside className="space-y-4" aria-label="ข้อมูลติดต่อ">
            <h2 className="mb-6 text-2xl font-bold text-ink sm:text-3xl">ช่องทางติดต่อ</h2>
            {cards.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex items-center gap-4 rounded-3xl border border-line bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-brand hover:shadow-lg"
              >
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-white transition-colors group-hover:bg-brand">
                  {c.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-muted">{c.label}</span>
                  <span className="block break-words font-semibold text-ink">{c.value}</span>
                </span>
              </a>
            ))}
            {settings.address && (
              <div className="flex items-start gap-4 rounded-3xl border border-line bg-white p-5">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-white">
                  <MapPin className="h-6 w-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm text-muted">ที่อยู่</span>
                  <span className="block font-semibold text-ink">{settings.address}</span>
                  {settings.map_url && (
                    <a
                      href={settings.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-sm font-semibold text-brand underline underline-offset-4"
                    >
                      เปิดแผนที่
                    </a>
                  )}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-4">
              <ButtonLink href={telHref(settings.phone)}>โทรเลย</ButtonLink>
              <ButtonLink href={lineHref(settings)} variant="dark">
                LINE
              </ButtonLink>
              <ButtonLink href={settings.facebook_url} variant="outline">
                Facebook
              </ButtonLink>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
