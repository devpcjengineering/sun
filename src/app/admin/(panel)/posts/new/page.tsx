import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { PostForm } from "@/components/admin/posts/PostForm";
import { createPost } from "../actions";

export const metadata: Metadata = { title: "เขียนโพสต์ใหม่" };

export default function NewPostPage() {
  return (
    <>
      <Link href="/admin/posts" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" />
        กลับไปรายการโพสต์
      </Link>
      <PageHeader title="เขียนโพสต์ใหม่" desc="เพิ่มผลงานหรือบทความลงเว็บไซต์" />
      <PostForm action={createPost} />
    </>
  );
}
