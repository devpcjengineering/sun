import type { Metadata } from "next";
import Link from "next/link";
import CtaBand from "@/components/site/CtaBand";
import PostCard from "@/components/site/PostCard";
import Reveal from "@/components/site/Reveal";
import { loadPosts, loadSettings } from "@/components/site/safe-data";
import { ButtonLink, Container, EmptyState, PageHero } from "@/components/site/ui";
import { POST_CATEGORIES } from "@/lib/types";

type Props = { searchParams: Promise<{ category?: string | string[] }> };

function parseCategory(raw: string | string[] | undefined): string | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return POST_CATEGORIES.some((c) => c.value === v) ? v : undefined;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [s, sp] = await Promise.all([loadSettings(), searchParams]);
  const cat = parseCategory(sp.category);
  const label = POST_CATEGORIES.find((c) => c.value === cat)?.label;
  return {
    title: label ? `ผลงานของเรา - ${label}` : "ผลงานของเรา",
    description: s.seo_description,
    alternates: { canonical: "/portfolio" },
    openGraph: { title: `ผลงานของเรา | ${s.site_name}`, description: s.seo_description, locale: "th_TH" },
  };
}

export default async function PortfolioPage({ searchParams }: Props) {
  const sp = await searchParams;
  const category = parseCategory(sp.category);
  const [settings, posts] = await Promise.all([loadSettings(), loadPosts({ category })]);
  const sorted = [...posts].sort((a, b) => Number(b.featured) - Number(a.featured));

  const chip = (active: boolean) =>
    `rounded-full border px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
      active ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-ink"
    }`;

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="ผลงานของเรา"
        text="รวมผลงานอีเวนต์ ไลฟ์สด วิดีโอ และกราฟิก ที่ทีม #teamsunnakhon ตั้งใจสร้างสรรค์"
      />

      <section className="py-14 sm:py-20" aria-label="รายการผลงาน">
        <Container>
          <nav aria-label="กรองตามหมวดหมู่" className="flex flex-wrap gap-2">
            <Link href="/portfolio" className={chip(!category)} aria-current={!category ? "true" : undefined}>
              ทั้งหมด
            </Link>
            {POST_CATEGORIES.map((c) => (
              <Link
                key={c.value}
                href={`/portfolio?category=${c.value}`}
                className={chip(category === c.value)}
                aria-current={category === c.value ? "true" : undefined}
              >
                {c.label}
              </Link>
            ))}
          </nav>

          {sorted.length ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 80} className="h-full">
                  <PostCard post={p} priority={i < 3} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState
                title={category ? "ยังไม่มีผลงานในหมวดนี้" : "ผลงานกำลังจะมาเร็ว ๆ นี้"}
                text="ลองเลือกหมวดอื่น หรือทักมาคุยไอเดียกับทีมงานได้เลย"
                action={
                  category ? (
                    <ButtonLink href="/portfolio" variant="outline">
                      ดูผลงานทั้งหมด
                    </ButtonLink>
                  ) : (
                    <ButtonLink href="/contact">ติดต่อเรา</ButtonLink>
                  )
                }
              />
            </div>
          )}
        </Container>
      </section>

      <CtaBand settings={settings} />
    </>
  );
}
