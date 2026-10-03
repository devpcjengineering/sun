import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { EMPTY_POST, PostForm } from "@/components/admin/posts/PostForm";
import { createPost } from "../actions";

export const metadata: Metadata = { title: "เพิ่มผลงาน/เขียนบทความ" };

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const sp = await searchParams;
  const kind = sp.kind === "article" ? "article" : "work";
  const isArticle = kind === "article";

  return (
    <>
      <Link
        href={`/admin/posts?kind=${kind}`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        {isArticle ? "กลับไปรายการบทความ" : "กลับไปรายการผลงาน"}
      </Link>
      <PageHeader
        title={isArticle ? "เขียนบทความใหม่" : "เพิ่มผลงานใหม่"}
        desc={isArticle ? "เขียนบทความลงเว็บไซต์" : "เพิ่มผลงานลงเว็บไซต์"}
      />
      <PostForm key={kind} action={createPost} initial={{ ...EMPTY_POST, kind }} />
    </>
  );
}
