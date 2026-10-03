"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, Field, btnGhost, inputCls } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { POST_CATEGORIES, type GalleryImage } from "@/lib/types";
import { MarkdownEditor } from "./MarkdownEditor";
import { GalleryUpload } from "./GalleryUpload";
import { fallbackSlug, slugify } from "./helpers";
import type { PostFormState } from "@/app/admin/(panel)/posts/actions";

export type PostFormInitial = {
  title: string;
  slug: string;
  category: string;
  client_name: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  cover_public_id: string | null;
  gallery: GalleryImage[];
  video_url: string;
  tags: string;
  featured: boolean;
  published: boolean;
  published_at: string; // datetime-local (เวลาไทย) หรือ ""
};

export const EMPTY_POST: PostFormInitial = {
  title: "",
  slug: "",
  category: "event",
  client_name: "",
  excerpt: "",
  content: "",
  cover_url: null,
  cover_public_id: null,
  gallery: [],
  video_url: "",
  tags: "",
  featured: false,
  published: false,
  published_at: "",
};

function FieldError({ msg }: { msg?: string }) {
  return msg ? (
    <p role="alert" className="mt-1 text-xs text-brand">
      {msg}
    </p>
  ) : null;
}

function Check({
  name,
  checked,
  onChange,
  title,
  desc,
}: {
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 accent-brand"
      />
      <span>
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
    </label>
  );
}

export function PostForm({
  action,
  initial = EMPTY_POST,
  isEdit = false,
}: {
  action: (prev: PostFormState, fd: FormData) => Promise<PostFormState>;
  initial?: PostFormInitial;
  isEdit?: boolean;
}) {
  const [state, formAction] = useActionState(action, {} as PostFormState);

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [category, setCategory] = useState(initial.category);
  const [clientName, setClientName] = useState(initial.client_name);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [content, setContent] = useState(initial.content);
  const [cover, setCover] = useState({ url: initial.cover_url, public_id: initial.cover_public_id });
  const [gallery, setGallery] = useState<GalleryImage[]>(initial.gallery);
  const [video, setVideo] = useState(initial.video_url);
  const [tags, setTags] = useState(initial.tags);
  const [featured, setFeatured] = useState(initial.featured);
  const [published, setPublished] = useState(initial.published);
  const [publishedAt, setPublishedAt] = useState(initial.published_at);

  const fe = state.fieldErrors ?? {};

  function onTitle(v: string) {
    setTitle(v);
    if (slugTouched) return;
    const auto = slugify(v);
    if (auto) setSlug(auto);
    else if (!v.trim()) setSlug("");
    else if (!slug.startsWith("post-")) setSlug(fallbackSlug()); // ชื่อภาษาไทยล้วน → slug จาก timestamp
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">{state.error}</p>
            {Object.keys(fe).length > 0 && (
              <ul className="mt-1 list-disc pl-4 text-xs">
                {Object.values(fe).map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ───── คอลัมน์หลัก ───── */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-5">
            <div>
              <Field label="ชื่อโพสต์ *">
                <input
                  name="title"
                  required
                  maxLength={200}
                  value={title}
                  onChange={(e) => onTitle(e.target.value)}
                  placeholder="เช่น งานประกวด Miss Sunnakhon 2025"
                  className={inputCls}
                />
              </Field>
              <FieldError msg={fe.title} />
            </div>

            <div>
              <Field
                label="Slug (ลิงก์ของโพสต์)"
                hint="ใช้ a-z 0-9 และ - เท่านั้น (เช่น miss-sunnakhon-2025) ปล่อยว่างให้ระบบสร้างให้อัตโนมัติ และต้องไม่ซ้ำกับโพสต์อื่น"
              >
                <input
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value.toLowerCase());
                  }}
                  maxLength={100}
                  placeholder="สร้างอัตโนมัติจากชื่อ"
                  className={`${inputCls} font-mono text-[13px]`}
                />
              </Field>
              <FieldError msg={fe.slug} />
            </div>

            <div>
              <Field label="คำโปรย (แสดงในการ์ด/ผลค้นหา)" hint={`${excerpt.length}/500`}>
                <textarea
                  name="excerpt"
                  rows={3}
                  maxLength={500}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <FieldError msg={fe.excerpt} />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-ink">เนื้อหา (Markdown)</p>
              <MarkdownEditor name="content" value={content} onChange={setContent} />
              <p className="text-xs text-muted">
                รองรับ # หัวข้อ, **ตัวหนา**, *ตัวเอียง*, [ลิงก์](https://...), รายการ - และรูป ![](https://...)
              </p>
              <FieldError msg={fe.content} />
            </div>
          </Card>

          <Card className="space-y-5">
            <h2 className="font-semibold text-ink">รูปภาพและวิดีโอ</h2>
            <div className="max-w-xl">
              <ImageUpload folder="posts" name="cover" label="รูปปก" value={cover} onChange={setCover} />
              <FieldError msg={fe.cover_url} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-ink">แกลเลอรี ({gallery.length} รูป)</p>
              <GalleryUpload value={gallery} onChange={setGallery} />
              <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
              <FieldError msg={fe.gallery} />
            </div>

            <div>
              <Field label="ลิงก์วิดีโอ YouTube" hint="เช่น https://www.youtube.com/watch?v=... หรือ https://youtu.be/...">
                <input
                  name="video_url"
                  type="url"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v="
                  className={inputCls}
                />
              </Field>
              <FieldError msg={fe.video_url} />
            </div>
          </Card>
        </div>

        {/* ───── แถบด้านข้าง ───── */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="space-y-4">
            <h2 className="font-semibold text-ink">การเผยแพร่</h2>
            <Check
              name="published"
              checked={published}
              onChange={setPublished}
              title="เผยแพร่"
              desc="ปิดไว้ = ฉบับร่าง (ไม่แสดงบนเว็บไซต์)"
            />
            <Check name="featured" checked={featured} onChange={setFeatured} title="โพสต์แนะนำ ★" desc="แสดงเด่นในหน้าแรก" />
            <div>
              <Field label="วันที่เผยแพร่ (เวลาไทย)" hint="เว้นว่างไว้ = ตั้งเป็นเวลาปัจจุบันตอนเผยแพร่ครั้งแรก">
                <input
                  name="published_at"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <FieldError msg={fe.published_at} />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              <SubmitButton>{isEdit ? "บันทึกการแก้ไข" : "สร้างโพสต์"}</SubmitButton>
              <Link href="/admin/posts" className={btnGhost}>
                ยกเลิก
              </Link>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="font-semibold text-ink">รายละเอียด</h2>
            <div>
              <Field label="หมวดหมู่">
                <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                  {POST_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <FieldError msg={fe.category} />
            </div>
            <div>
              <Field label="ชื่อลูกค้า / งาน">
                <input
                  name="client_name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  maxLength={150}
                  className={inputCls}
                />
              </Field>
              <FieldError msg={fe.client_name} />
            </div>
            <div>
              <Field label="แท็ก" hint="คั่นด้วยเครื่องหมายจุลภาค เช่น คอนเสิร์ต, งานนักศึกษา">
                <input name="tags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} />
              </Field>
              <FieldError msg={fe.tags} />
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
