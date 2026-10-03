import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PostForm, type PostFormInitial } from "@/components/admin/posts/PostForm";
import { isoToBangkokInput } from "@/components/admin/posts/helpers";
import type { Post } from "@/lib/types";
import { deletePost, updatePost } from "../../actions";

export const metadata: Metadata = { title: "แก้ไขผลงาน/บทความ" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) notFound();
  const post = data as Post;

  const kind = post.kind === "article" ? "article" : "work";
  const noun = kind === "article" ? "บทความ" : "ผลงาน";

  const initial: PostFormInitial = {
    kind,
    title: post.title,
    slug: post.slug,
    category: post.category,
    client_name: post.client_name ?? "",
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    cover_url: post.cover_url,
    cover_public_id: post.cover_public_id,
    gallery: Array.isArray(post.gallery) ? post.gallery : [],
    video_url: post.video_url ?? "",
    tags: (post.tags ?? []).join(", "),
    featured: post.featured,
    published: post.published,
    published_at: isoToBangkokInput(post.published_at),
  };

  return (
    <>
      <Link
        href={`/admin/posts?kind=${kind}`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        กลับไปรายการ{noun}
      </Link>
      <PageHeader title={`แก้ไข${noun}`} desc={post.title} />
      <PostForm key={post.id} action={updatePost.bind(null, post.id)} initial={initial} isEdit />

      <Card className="mt-6 border-brand/30">
        <h2 className="font-semibold text-brand">ลบ{noun}</h2>
        <p className="mt-1 text-sm text-muted">การลบจะลบรูปปกและแกลเลอรีบน Cloudinary ด้วย และไม่สามารถย้อนกลับได้</p>
        <form action={deletePost} className="mt-4">
          <input type="hidden" name="id" value={post.id} />
          <input type="hidden" name="from" value="edit" />
          <input type="hidden" name="kind" value={kind} />
          <ConfirmButton
            message={`ลบ${noun} "${post.title}" ถาวร?`}
            className="inline-flex items-center gap-2 rounded-lg border border-brand px-4 py-2.5 text-sm font-medium text-brand transition hover:bg-brand hover:text-white"
          >
            <Trash2 className="size-4" />
            ลบ{noun}นี้
          </ConfirmButton>
        </form>
      </Card>
    </>
  );
}
