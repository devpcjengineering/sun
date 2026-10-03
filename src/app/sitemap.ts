import type { MetadataRoute } from "next";
import { loadPosts } from "@/components/site/safe-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1, lastModified: now },
    { url: `${base}/services`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${base}/portfolio`, changeFrequency: "weekly", priority: 0.8, lastModified: now },
    { url: `${base}/packages`, changeFrequency: "monthly", priority: 0.7, lastModified: now },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.6, lastModified: now },
  ];

  const posts = await loadPosts();
  return [
    ...pages,
    ...posts.map((p) => ({
      url: `${base}/portfolio/${encodeURIComponent(p.slug)}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
