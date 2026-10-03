import type { Metadata } from "next";
import ClientMarquee from "@/components/site/ClientMarquee";
import CtaBand from "@/components/site/CtaBand";
import Hero from "@/components/site/Hero";
import PackageCard from "@/components/site/PackageCard";
import PostCard from "@/components/site/PostCard";
import Process from "@/components/site/Process";
import Reveal from "@/components/site/Reveal";
import Stats from "@/components/site/Stats";
import Testimonials from "@/components/site/Testimonials";
import WhyServices from "@/components/site/WhyServices";
import {
  loadArticles,
  loadClients,
  loadPackages,
  loadPosts,
  loadServices,
  loadSettings,
  loadTestimonials,
} from "@/components/site/safe-data";
import { ButtonLink, Container, EmptyState, SectionHeading } from "@/components/site/ui";

export async function generateMetadata(): Promise<Metadata> {
  const s = await loadSettings();
  return {
    title: { absolute: s.seo_title },
    description: s.seo_description,
    alternates: { canonical: "/" },
    openGraph: { title: s.seo_title, description: s.seo_description, type: "website", locale: "th_TH" },
  };
}

export default async function HomePage() {
  const [settings, services, clients, posts, articles, testimonials, packages] = await Promise.all([
    loadSettings(),
    loadServices(),
    loadClients(),
    loadPosts({ limit: 12 }),
    loadArticles({ limit: 3 }),
    loadTestimonials(),
    loadPackages(),
  ]);

  // ผลงานเด่นขึ้นก่อน แล้วเรียงตามวันที่ล่าสุด (sort เสถียร)
  const latest = [...posts].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 6);

  return (
    <>
      <Hero settings={settings} />
      <WhyServices settings={settings} services={services} />
      <ClientMarquee clients={clients} />
      <Stats stats={settings.stats} />

      <section className="py-20 sm:py-28" aria-labelledby="latest-heading">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div id="latest-heading">
              <SectionHeading eyebrow="Portfolio" title="ผลงานล่าสุด" text="ตัวอย่างงานที่ทีม #teamsunnakhon ภูมิใจนำเสนอ" />
            </div>
            <ButtonLink href="/portfolio" variant="outline" arrow className="self-start sm:self-auto">
              ดูผลงานทั้งหมด
            </ButtonLink>
          </div>
          {latest.length ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 100} className="h-full">
                  <PostCard post={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-12">
              <EmptyState
                title="ผลงานกำลังจะมาเร็ว ๆ นี้"
                text="เรากำลังรวบรวมผลงานเด่นมาให้ชม ระหว่างนี้ทักมาคุยไอเดียกับทีมงานได้เลย"
                action={<ButtonLink href="/contact">ติดต่อเรา</ButtonLink>}
              />
            </div>
          )}
        </Container>
      </section>

      {articles.length > 0 && (
        <section className="bg-soft py-20 sm:py-28" aria-labelledby="articles-heading">
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div id="articles-heading">
                <SectionHeading eyebrow="Articles" title="บทความล่าสุด" text="เคล็ดลับและเรื่องราวจากทีม #teamsunnakhon" />
              </div>
              <ButtonLink href="/articles" variant="outline" arrow className="self-start sm:self-auto">
                ดูบทความทั้งหมด
              </ButtonLink>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 100} className="h-full">
                  <PostCard post={p} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <div className={articles.length > 0 ? "" : "bg-soft"}>
        <Process />
      </div>

      <Testimonials items={testimonials} />

      {packages.length > 0 && (
        <section className="py-20 sm:py-28" aria-labelledby="packages-heading">
          <Container>
            <div id="packages-heading">
              <SectionHeading
                eyebrow="Packages"
                title="แพ็คเก็จ/ราคา"
                text="เลือกแพ็คเก็จที่เหมาะกับงานของคุณ หรือให้เราออกแบบแพ็คเก็จเฉพาะคุณ"
                center
              />
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {packages.slice(0, 3).map((p, i) => (
                <Reveal key={p.id} delay={i * 100} className="h-full">
                  <PackageCard pkg={p} />
                </Reveal>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <ButtonLink href="/packages" variant="outline" arrow>
                ดูแพ็คเก็จทั้งหมด
              </ButtonLink>
            </div>
          </Container>
        </section>
      )}

      <CtaBand settings={settings} />
    </>
  );
}
