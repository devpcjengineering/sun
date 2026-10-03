import Link from "next/link";
import { ArrowUpRight, Film } from "lucide-react";
import { POST_CATEGORIES, type Post } from "@/lib/types";
import SmartImage from "./SmartImage";

export function categoryLabel(value: string): string {
  return POST_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export default function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <Link
      href={`/portfolio/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-xl hover:shadow-black/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-soft">
        {post.cover_url ? (
          <SmartImage
            src={post.cover_url}
            alt={post.title}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ink text-white/30">
            <Film className="h-12 w-12" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
          {categoryLabel(post.category)}
        </span>
        {post.featured && (
          <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">
            แนะนำ
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {post.client_name && <p className="text-xs font-semibold uppercase tracking-wider text-muted">{post.client_name}</p>}
        <h3 className="mt-1 text-lg font-bold leading-snug text-ink group-hover:text-brand">{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-ink group-hover:text-brand">
          ดูผลงาน
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
