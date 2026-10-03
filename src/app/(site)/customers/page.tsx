import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import CtaBand from "@/components/site/CtaBand";
import Reveal from "@/components/site/Reveal";
import { loadClients, loadSettings } from "@/components/site/safe-data";
import SmartImage from "@/components/site/SmartImage";
import { ButtonLink, Container, EmptyState, PageHero } from "@/components/site/ui";
import type { Client } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const s = await loadSettings();
  const description = "แบรนด์ องค์กร และสถาบันที่ไว้วางใจให้ #teamsunnakhon ดูแลงานอีเวนต์ ไลฟ์สด วิดีโอ และกราฟิก";
  return {
    title: "ลูกค้าที่เคยร่วมงาน",
    description,
    alternates: { canonical: "/customers" },
    openGraph: { title: `ลูกค้าที่เคยร่วมงาน | ${s.site_name}`, description, locale: "th_TH" },
  };
}

function ClientCardBody({ client, linked }: { client: Client; linked: boolean }) {
  const desc = client.description?.replace(/\s+/g, " ").trim();
  return (
    <>
      <div className="relative flex h-40 items-center justify-center border-b border-line bg-white p-6">
        <span className="relative block h-full w-full">
          <SmartImage
            src={client.logo_url}
            alt={client.name}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain"
          />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="flex items-start justify-between gap-2 text-base font-bold text-ink sm:text-lg">
          <span>{client.name}</span>
          {linked && (
            <ArrowUpRight
              className="mt-1 h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-brand"
              aria-hidden="true"
            />
          )}
        </h2>
        {desc && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{desc}</p>}
      </div>
    </>
  );
}

export default async function CustomersPage() {
  const [settings, clients] = await Promise.all([loadSettings(), loadClients()]);
  const card =
    "group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white transition duration-300";

  return (
    <>
      <PageHero
        eyebrow="Our Clients"
        title="ลูกค้าที่เคยร่วมงาน"
        text="แบรนด์ องค์กร และสถาบันที่ไว้วางใจให้ #teamsunnakhon ดูแลงานอีเวนต์ ไลฟ์สด วิดีโอ และกราฟิก"
      />

      <section className="py-14 sm:py-20" aria-label="รายชื่อลูกค้า">
        <Container>
          {clients.length ? (
            <ul className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {clients.map((c, i) => (
                <li key={c.id}>
                  <Reveal delay={(i % 4) * 70} className="h-full">
                    {c.slug ? (
                      <Link
                        href={`/customers/${encodeURIComponent(c.slug)}`}
                        className={`${card} hover:-translate-y-1 hover:border-ink/20 hover:shadow-xl hover:shadow-black/5`}
                      >
                        <ClientCardBody client={c} linked />
                      </Link>
                    ) : (
                      <div className={card}>
                        <ClientCardBody client={c} linked={false} />
                      </div>
                    )}
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="เรากำลังรวบรวมรายชื่อลูกค้า"
              text="ระหว่างนี้ทักมาคุยไอเดียกับทีมงานได้เลย"
              action={<ButtonLink href="/contact">ติดต่อเรา</ButtonLink>}
            />
          )}
        </Container>
      </section>

      <CtaBand settings={settings} />
    </>
  );
}
