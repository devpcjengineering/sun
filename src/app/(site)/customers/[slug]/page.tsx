import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import CtaBand from "@/components/site/CtaBand";
import PostCard from "@/components/site/PostCard";
import { loadClient, loadPostsByClient, loadSettings } from "@/components/site/safe-data";
import SmartImage from "@/components/site/SmartImage";
import { ButtonLink, Container, Eyebrow, SectionHeading } from "@/components/site/ui";

type Props = { params: Promise<{ slug: string }> };

function decode(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = await loadClient(decode(slug));
  if (!client) return { title: "ไม่พบลูกค้า" };
  const description =
    client.description?.replace(/\s+/g, " ").trim().slice(0, 160) || `${client.name} — ลูกค้าที่เคยร่วมงานกับ #teamsunnakhon`;
  const image = client.logo_url && /^https:\/\//i.test(client.logo_url) ? client.logo_url : null;
  return {
    title: client.name,
    description,
    alternates: { canonical: `/customers/${client.slug ?? slug}` },
    openGraph: {
      title: client.name,
      description,
      locale: "th_TH",
      images: image ? [{ url: image, alt: client.name }] : undefined,
    },
  };
}

export default async function CustomerDetailPage({ params }: Props) {
  const { slug } = await params;
  const client = await loadClient(decode(slug));
  if (!client) notFound();

  const [settings, posts] = await Promise.all([loadSettings(), loadPostsByClient(client.name)]);
  const website = client.website_url && /^https?:\/\//i.test(client.website_url) ? client.website_url : null;

  return (
    <>
      <section className="py-12 sm:py-20">
        <Container>
          <Link
            href="/customers"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            กลับไปลูกค้าทั้งหมด
          </Link>

          <div className="fade-up mx-auto mt-8 max-w-3xl text-center">
            <div className="mx-auto flex h-48 w-full max-w-md items-center justify-center rounded-3xl border border-line bg-white p-8 sm:h-60">
              <span className="relative block h-full w-full">
                <SmartImage
                  src={client.logo_url}
                  alt={client.name}
                  sizes="(min-width: 640px) 448px, 100vw"
                  priority
                  className="object-contain"
                />
              </span>
            </div>
            <div className="mt-8 flex justify-center">
              <Eyebrow>Our Client</Eyebrow>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-ink [text-wrap:balance] sm:text-5xl">
              {client.name}
            </h1>
            {client.description && (
              <p className="mt-6 whitespace-pre-line text-left text-base leading-relaxed text-muted sm:text-center sm:text-lg">
                {client.description}
              </p>
            )}
            {website && (
              <div className="mt-8 flex justify-center">
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:text-base"
                >
                  เยี่ยมชมเว็บไซต์
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </Container>
      </section>

      {posts.length > 0 && (
        <section className="bg-soft py-16 sm:py-24" aria-labelledby="client-works-heading">
          <Container>
            <div id="client-works-heading">
              <SectionHeading eyebrow="Works" title="ผลงานที่ทำร่วมกัน" />
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
            <div className="mt-10">
              <ButtonLink href="/customers" variant="outline">
                ดูลูกค้าทั้งหมด
              </ButtonLink>
            </div>
          </Container>
        </section>
      )}

      <CtaBand settings={settings} />
    </>
  );
}
