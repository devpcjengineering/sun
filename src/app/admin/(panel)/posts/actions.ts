"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, getAdminUser } from "@/lib/supabase/server";
import { deleteCloudinaryImages as destroyImages } from "@/lib/cloudinary-server";
import { POST_CATEGORIES, type GalleryImage } from "@/lib/types";
import { bangkokInputToIso, fallbackSlug, SLUG_RE, slugify } from "@/components/admin/posts/helpers";

export type PostFormState = { error?: string; fieldErrors?: Record<string, string> };

const CATEGORY_VALUES = POST_CATEGORIES.map((c) => c.value) as unknown as [string, ...string[]];
const YOUTUBE_RE = /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i;

const httpsUrl = z.string().trim().url("URL ไม่ถูกต้อง").refine((u) => u.startsWith("https://"), "ต้องเป็นลิงก์ https://");

const PostSchema = z.object({
  title: z.string().trim().min(1, "กรุณากรอกชื่อโพสต์").max(200, "ชื่อโพสต์ยาวเกินไป (สูงสุด 200 ตัวอักษร)"),
  slug: z.string().trim().toLowerCase().max(100, "slug ยาวเกินไป").refine((s) => s === "" || SLUG_RE.test(s), "slug ใช้ได้เฉพาะ a-z, 0-9 และเครื่องหมาย - (เช่น my-event-2025)"),
  category: z.enum(CATEGORY_VALUES, "เลือกหมวดหมู่ไม่ถูกต้อง"),
  client_name: z.string().trim().max(150, "ชื่อลูกค้ายาวเกินไป"),
  excerpt: z.string().trim().max(500, "คำโปรยยาวเกินไป (สูงสุด 500 ตัวอักษร)"),
  content: z.string().max(100000, "เนื้อหายาวเกินไป"),
  video_url: z
    .string()
    .trim()
    .refine((u) => u === "" || YOUTUBE_RE.test(u), "ต้องเป็นลิงก์ YouTube (https://www.youtube.com/... หรือ https://youtu.be/...)"),
  tags: z.array(z.string().max(40, "แท็กยาวเกินไป (สูงสุด 40 ตัวอักษร)")).max(20, "ใส่แท็กได้สูงสุด 20 อัน"),
  cover_url: z.union([z.literal(""), httpsUrl]),
  cover_public_id: z.string().max(300),
  gallery: z
    .array(z.object({ url: httpsUrl, public_id: z.string().max(300) }))
    .max(30, "แกลเลอรีมีได้สูงสุด 30 รูป"),
  featured: z.boolean(),
  published: z.boolean(),
});

type Parsed = z.infer<typeof PostSchema> & { published_at_input: string };

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function readForm(fd: FormData): { ok: true; data: Parsed } | { ok: false; state: PostFormState } {
  let gallery: unknown = [];
  try {
    gallery = JSON.parse(str(fd, "gallery") || "[]");
  } catch {
    return { ok: false, state: { error: "ข้อมูลแกลเลอรีไม่ถูกต้อง กรุณารีเฟรชหน้าแล้วลองใหม่" } };
  }

  const tags = Array.from(
    new Set(
      str(fd, "tags")
        .split(/[,\n،]/)
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean),
    ),
  );

  const parsed = PostSchema.safeParse({
    title: str(fd, "title"),
    slug: str(fd, "slug"),
    category: str(fd, "category") || "event",
    client_name: str(fd, "client_name"),
    excerpt: str(fd, "excerpt"),
    content: str(fd, "content"),
    video_url: str(fd, "video_url"),
    tags,
    cover_url: str(fd, "cover_url"),
    cover_public_id: str(fd, "cover_public_id"),
    gallery,
    featured: fd.get("featured") === "on",
    published: fd.get("published") === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, state: { error: "กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง", fieldErrors } };
  }
  return { ok: true, data: { ...parsed.data, published_at_input: str(fd, "published_at") } };
}

async function slugTaken(slug: string, excludeId?: string) {
  const supabase = await createClient();
  let q = supabase.from("posts").select("id", { head: true, count: "exact" }).eq("slug", slug);
  if (excludeId) q = q.neq("id", excludeId);
  const { count } = await q;
  return (count ?? 0) > 0;
}

/** ตัดสินใจ slug สุดท้าย: ถ้าผู้ใช้กรอกเองแล้วซ้ำ → error, ถ้าสร้างอัตโนมัติแล้วซ้ำ → ต่อท้ายให้ไม่ซ้ำ */
async function resolveSlug(data: Parsed, excludeId?: string): Promise<{ slug: string } | { error: PostFormState }> {
  if (data.slug) {
    if (await slugTaken(data.slug, excludeId)) {
      return { error: { error: "slug นี้ถูกใช้แล้ว", fieldErrors: { slug: "slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน" } } };
    }
    return { slug: data.slug };
  }
  const base = slugify(data.title) || fallbackSlug();
  let slug = base;
  for (let i = 0; i < 5 && (await slugTaken(slug, excludeId)); i++) {
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return { slug };
}

function dbMessage(error: { code?: string; message: string }): PostFormState {
  if (error.code === "23505") {
    return { error: "slug นี้ถูกใช้แล้ว", fieldErrors: { slug: "slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน" } };
  }
  return { error: `บันทึกไม่สำเร็จ: ${error.message}` };
}

function toRow(data: Parsed, slug: string, publishedAt: string | null) {
  return {
    title: data.title,
    slug,
    category: data.category,
    client_name: data.client_name || null,
    excerpt: data.excerpt || null,
    content: data.content || null,
    video_url: data.video_url || null,
    tags: data.tags,
    cover_url: data.cover_url || null,
    cover_public_id: data.cover_url ? data.cover_public_id || null : null,
    gallery: data.gallery,
    featured: data.featured,
    published: data.published,
    published_at: publishedAt,
  };
}

export async function createPost(_prev: PostFormState, fd: FormData): Promise<PostFormState> {
  if (!(await getAdminUser())) return { error: "หมดสิทธิ์การเข้าใช้งาน กรุณาเข้าสู่ระบบใหม่" };

  const r = readForm(fd);
  if (!r.ok) return r.state;
  const s = await resolveSlug(r.data);
  if ("error" in s) return s.error;

  // วันที่เผยแพร่: ใช้ค่าที่กรอก; ถ้าเผยแพร่เลยแต่ไม่ได้กรอก → ตอนนี้
  const publishedAt = bangkokInputToIso(r.data.published_at_input) ?? (r.data.published ? new Date().toISOString() : null);

  const supabase = await createClient();
  const { error } = await supabase.from("posts").insert(toRow(r.data, s.slug, publishedAt));
  if (error) return dbMessage(error);

  revalidatePath("/", "layout");
  redirect("/admin/posts");
}

export async function updatePost(id: string, _prev: PostFormState, fd: FormData): Promise<PostFormState> {
  if (!(await getAdminUser())) return { error: "หมดสิทธิ์การเข้าใช้งาน กรุณาเข้าสู่ระบบใหม่" };
  if (!z.uuid().safeParse(id).success) return { error: "ไม่พบโพสต์นี้" };

  const r = readForm(fd);
  if (!r.ok) return r.state;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("posts")
    .select("cover_public_id, gallery, published_at")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { error: "ไม่พบโพสต์นี้ (อาจถูกลบไปแล้ว)" };

  const s = await resolveSlug(r.data, id);
  if ("error" in s) return s.error;

  // ครั้งแรกที่เผยแพร่ → ตั้ง published_at อัตโนมัติ ; ถ้ากรอกเองให้ใช้ค่าที่กรอก
  const publishedAt =
    bangkokInputToIso(r.data.published_at_input) ??
    (r.data.published ? ((existing.published_at as string | null) ?? new Date().toISOString()) : ((existing.published_at as string | null) ?? null));

  const row = toRow(r.data, s.slug, publishedAt);
  const { error } = await supabase.from("posts").update(row).eq("id", id);
  if (error) return dbMessage(error);

  // ลบรูปที่ถูกเอาออกจาก Cloudinary
  const keep = new Set<string>([row.cover_public_id ?? "", ...r.data.gallery.map((g) => g.public_id)]);
  const old = [existing.cover_public_id as string | null, ...(((existing.gallery as GalleryImage[] | null) ?? []).map((g) => g.public_id))];
  await destroyImages(old.filter((p) => p && !keep.has(p)));

  revalidatePath("/", "layout");
  redirect("/admin/posts");
}

function failList(message: string): never {
  redirect(`/admin/posts?error=${encodeURIComponent(message)}`);
}

export async function togglePublish(fd: FormData) {
  if (!(await getAdminUser())) failList("หมดสิทธิ์การเข้าใช้งาน");
  const id = str(fd, "id");
  const publish = str(fd, "publish") === "true";
  if (!z.uuid().safeParse(id).success) failList("ไม่พบโพสต์นี้");

  const supabase = await createClient();
  const patch: { published: boolean; published_at?: string } = { published: publish };
  if (publish) {
    const { data } = await supabase.from("posts").select("published_at").eq("id", id).maybeSingle();
    if (!data?.published_at) patch.published_at = new Date().toISOString();
  }
  const { error } = await supabase.from("posts").update(patch).eq("id", id);
  if (error) failList(`เปลี่ยนสถานะไม่สำเร็จ: ${error.message}`);
  revalidatePath("/", "layout");
}

export async function toggleFeatured(fd: FormData) {
  if (!(await getAdminUser())) failList("หมดสิทธิ์การเข้าใช้งาน");
  const id = str(fd, "id");
  if (!z.uuid().safeParse(id).success) failList("ไม่พบโพสต์นี้");
  const supabase = await createClient();
  const { error } = await supabase.from("posts").update({ featured: str(fd, "featured") === "true" }).eq("id", id);
  if (error) failList(`บันทึกไม่สำเร็จ: ${error.message}`);
  revalidatePath("/", "layout");
}

export async function deletePost(fd: FormData) {
  if (!(await getAdminUser())) failList("หมดสิทธิ์การเข้าใช้งาน");
  const id = str(fd, "id");
  if (!z.uuid().safeParse(id).success) failList("ไม่พบโพสต์นี้");

  const supabase = await createClient();
  const { data: existing } = await supabase.from("posts").select("cover_public_id, gallery").eq("id", id).maybeSingle();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) failList(`ลบไม่สำเร็จ: ${error.message}`);

  if (existing) {
    await destroyImages([
      existing.cover_public_id as string | null,
      ...(((existing.gallery as GalleryImage[] | null) ?? []).map((g) => g.public_id)),
    ]);
  }
  revalidatePath("/", "layout");
  if (str(fd, "from") === "edit") redirect("/admin/posts");
}
