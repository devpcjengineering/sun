import type { Metadata } from "next";
import CtaBand from "@/components/site/CtaBand";
import PostCard from "@/components/site/PostCard";
import Reveal from "@/components/site/Reveal";
import { loadArticles, loadSettings } from "@/components/site/safe-data";
import { ButtonLink, Container, EmptyState, PageHero } from "@/components/site/ui";

export async function generateMetadata(): Promise<Metadata> {
  const s = await loadSettings();
  const description = "บทความ เคล็ดลับ และเรื่องราวจากทีม #teamsunnakhon";
  return {
    title: "บทความ",
    description,
    alternates: { canonical: "/articles" },
    openGraph: { title: `บทความ | ${s.site_name}`, description, locale: "th_TH" },
  };
}

export default async function ArticlesPage() {
  const [settings, articles] = await Promise.all([loadSettings(), loadArticles()]);

  return (
    <>
      <PageHero
        eyebrow="Articles"
        title="บทความ"
        text="เคล็ดลับ ความรู้ และเรื่องราวเบื้องหลังงานอีเวนต์ ไลฟ์สด วิดีโอ และกราฟิก จากทีม #teamsunnakhon"
      />

      <section className="py-14 sm:py-20" aria-label="รายการบทความ">
        <Container>
          {articles.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 80} className="h-full">
                  <PostCard post={p} priority={i < 3} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title="บทความกำลังจะมาเร็ว ๆ นี้"
              text="เรากำลังเตรียมบทความดี ๆ มาให้อ่าน ระหว่างนี้ทักมาคุยไอเดียกับทีมงานได้เลย"
              action={<ButtonLink href="/contact">ติดต่อเรา</ButtonLink>}
            />
          )}
        </Container>
      </section>

      <CtaBand settings={settings} />
    </>
  );
}
