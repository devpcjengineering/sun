import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import CtaBand from "@/components/site/CtaBand";
import Gallery from "@/components/site/Gallery";
import Markdown from "@/components/site/Markdown";
import PostCard, { categoryLabel } from "@/components/site/PostCard";
import { loadPost, loadPosts, loadSettings } from "@/components/site/safe-data";
import SmartImage from "@/components/site/SmartImage";
import { Container, SectionHeading } from "@/components/site/ui";
import { formatThaiDate, youtubeEmbed } from "@/components/site/utils";
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
  if (!post) return { title: "ไม่พบผลงาน" };
  if (post.kind === "article") return { title: post.title, alternates: { canonical: `/articles/${post.slug}` } };
  const description = post.excerpt ?? undefined;
  return {
    title: post.title,
    description,
    alternates: { canonical: `/portfolio/${post.slug}` },
    openGraph: openGraphFor({
      title: post.title,
      description,
      path: `/portfolio/${post.slug}`,
      type: "article",
      images: post.cover_url ? [{ url: post.cover_url }] : undefined,
    }),
    twitter: twitterFor({ title: post.title, description, image: post.cover_url ?? undefined }),
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await loadPost(decode(slug));
  if (!post) notFound();
  if (post.kind === "article") redirect(`/articles/${encodeURIComponent(post.slug)}`);

  const [settings, sameCategory] = await Promise.all([loadSettings(), loadPosts({ category: post.category, limit: 4 })]);
  const related = sameCategory.filter((p) => p.id !== post.id).slice(0, 3);
  const embed = youtubeEmbed(post.video_url);
  const gallery = Array.isArray(post.gallery) ? post.gallery.filter((g) => g?.url) : [];

  return (
    <>
      <article>
        <header className="bg-ink text-white">
          <Container className="py-12 sm:py-20">
            <Link
              href="/portfolio"
              className="fade-up inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              กลับไปผลงานทั้งหมด
            </Link>
            <div className="fade-up mt-6 max-w-4xl">
              <Link
                href={`/portfolio?category=${post.category}`}
                className="inline-block rounded-full bg-brand px-4 py-1 text-xs font-semibold text-white hover:bg-brand-dark"
              >
                {categoryLabel(post.category)}
              </Link>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight [text-wrap:balance] sm:text-5xl">
                {post.title}
              </h1>
              {post.excerpt && <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">{post.excerpt}</p>}
              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/70">
                {post.client_name && (
                  <div className="flex items-center gap-2">
                    <dt className="text-white/50">ลูกค้า</dt>
                    <dd className="font-semibold text-white">{post.client_name}</dd>
                  </div>
                )}
                {post.published_at && (
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">วันที่เผยแพร่</dt>
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <dd>
                      <time dateTime={post.published_at}>{formatThaiDate(post.published_at)}</time>
                    </dd>
                  </div>
                )}
              </dl>
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

            {embed && (
              <div className="mt-10 aspect-video overflow-hidden rounded-3xl bg-ink">
                <iframe
                  src={embed}
                  title={`วิดีโอ ${post.title}`}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            )}
            {!embed && post.video_url && /^https?:\/\//i.test(post.video_url) && (
              <p className="mt-8">
                <a
                  href={post.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand underline underline-offset-4"
                >
                  ดูวิดีโอ
                </a>
              </p>
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

            {post.tags.length > 0 && (
              <ul className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6" aria-label="แท็ก">
                {post.tags.map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-sm text-muted">
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <section className="bg-soft py-16 sm:py-24" aria-labelledby="related-heading">
          <Container>
            <div id="related-heading">
              <SectionHeading eyebrow="Related" title="ผลงานที่เกี่ยวข้อง" />
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
