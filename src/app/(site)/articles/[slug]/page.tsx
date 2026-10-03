import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import CtaBand from "@/components/site/CtaBand";
import Gallery from "@/components/site/Gallery";
import Markdown from "@/components/site/Markdown";
import PostCard from "@/components/site/PostCard";
import { loadArticles, loadPost, loadSettings } from "@/components/site/safe-data";
import SmartImage from "@/components/site/SmartImage";
import { ButtonLink, Container, SectionHeading } from "@/components/site/ui";
import { formatThaiDate, siteUrl } from "@/components/site/utils";
import { openGraphFor, twitterFor } from "@/lib/seo";

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
  const post = await loadPost(decode(slug));
  if (!post) return { title: "ไม่พบบทความ" };
  if (post.kind !== "article") return { title: post.title, alternates: { canonical: `/portfolio/${post.slug}` } };
  const description = post.excerpt ?? undefined;
  return {
    title: post.title,
    description,
    alternates: { canonical: `/articles/${post.slug}` },
    openGraph: openGraphFor({
      title: post.title,
      description,
      path: `/articles/${post.slug}`,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_url ? [{ url: post.cover_url }] : undefined,
    }),
    twitter: twitterFor({ title: post.title, description, image: post.cover_url ?? undefined }),
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await loadPost(decode(slug));
  if (!post) notFound();
  if (post.kind !== "article") redirect(`/portfolio/${encodeURIComponent(post.slug)}`);

  const [settings, recent] = await Promise.all([loadSettings(), loadArticles({ limit: 4 })]);
  const related = recent.filter((p) => p.id !== post.id).slice(0, 3);
  const gallery = Array.isArray(post.gallery) ? post.gallery.filter((g) => g?.url) : [];
  const tags = Array.isArray(post.tags) ? post.tags : [];

  const url = `${siteUrl()}/articles/${encodeURIComponent(post.slug)}`;
  const shareLinks = [
    { label: "แชร์ไปยัง Facebook", text: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "แชร์ไปยัง LINE", text: "LINE", href: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}` },
  ];

  return (
    <>
      <article>
        <header className="bg-ink text-white">
          <Container className="py-12 sm:py-20">
            <Link
              href="/articles"
              className="fade-up inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              กลับไปบทความทั้งหมด
            </Link>
            <div className="fade-up mt-6 max-w-4xl">
              <span className="inline-block rounded-full bg-brand px-4 py-1 text-xs font-semibold text-white">บทความ</span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight [text-wrap:balance] sm:text-5xl">
                {post.title}
              </h1>
              {post.excerpt && <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">{post.excerpt}</p>}
              {post.published_at && (
                <p className="mt-6 flex items-center gap-2 text-sm text-white/70">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <time dateTime={post.published_at}>{formatThaiDate(post.published_at)}</time>
                </p>
              )}
            </div>
          </Container>
        </header>

        <Container className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl">
            {post.cover_url && (
              <div className="relative -mt-16 aspect-[16/9] overflow-hidden rounded-[2rem] bg-soft shadow-2xl shadow-black/20 sm:-mt-32">
                <SmartImage
                  src={post.cover_url}
                  alt={post.title}
                  sizes="(min-width: 1024px) 896px, 100vw"
                  priority
                  className="object-cover"
                />
              </div>
            )}

            {post.content && (
              <div className="mt-10 text-base sm:text-lg">
                <Markdown source={post.content} />
              </div>
            )}

            {gallery.length > 0 && (
              <section className="mt-14" aria-labelledby="gallery-heading">
                <h2 id="gallery-heading" className="mb-6 text-2xl font-bold text-ink">
                  แกลเลอรี
                </h2>
                <Gallery images={gallery} title={post.title} />
              </section>
            )}

            {tags.length > 0 && (
              <ul className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6" aria-label="แท็ก">
                {tags.map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-sm text-muted">
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
              <span className="text-sm font-semibold text-ink">แชร์บทความ</span>
              {shareLinks.map((s) => (
                <a
                  key={s.text}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {s.text}
                </a>
              ))}
              <ButtonLink href="/articles" variant="outline" className="ml-auto !px-5 !py-2 !text-sm">
                บทความทั้งหมด
              </ButtonLink>
            </div>
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <section className="bg-soft py-16 sm:py-24" aria-labelledby="related-heading">
          <Container>
            <div id="related-heading">
              <SectionHeading eyebrow="Related" title="บทความที่เกี่ยวข้อง" />
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <CtaBand settings={settings} />
    </>
  );
}
