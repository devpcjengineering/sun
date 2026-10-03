import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Client, Package, Post, Service, SiteSettings, Testimonial } from "@/lib/types";

// Data access สำหรับหน้าเว็บสาธารณะ (RLS ให้อ่านได้เฉพาะ published)

export async function getSettings(): Promise<SiteSettings> {
  const sb = await createClient();
  const { data } = await sb.from("site_settings").select("*").eq("id", 1).single();
  return data as SiteSettings;
}

export async function getServices(): Promise<Service[]> {
  const sb = await createClient();
  const { data } = await sb.from("services").select("*").eq("published", true).order("sort_order");
  return (data ?? []) as Service[];
}

export async function getClients(): Promise<Client[]> {
  const sb = await createClient();
  const { data } = await sb.from("clients").select("*").eq("published", true).order("sort_order");
  return (data ?? []) as Client[];
}

export async function getClient(slug: string): Promise<Client | null> {
  const sb = await createClient();
  const { data } = await sb.from("clients").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  return (data as Client) ?? null;
}

/** ผลงาน/บทความที่ระบุชื่อลูกค้านี้ (posts.client_name ตรงกับชื่อลูกค้า) */
export async function getPostsByClientName(name: string, limit = 12): Promise<Post[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("posts")
    .select("*")
    .eq("published", true)
    .ilike("client_name", name)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Post[];
}

export async function getPackages(): Promise<Package[]> {
  const sb = await createClient();
  const { data } = await sb.from("packages").select("*").eq("published", true).order("sort_order");
  return (data ?? []) as Package[];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const sb = await createClient();
  const { data } = await sb.from("testimonials").select("*").eq("published", true).order("sort_order");
  return (data ?? []) as Testimonial[];
}

export async function getPosts(
  opts: { kind?: Post["kind"]; category?: string; limit?: number; featured?: boolean } = {},
): Promise<Post[]> {
  const sb = await createClient();
  let q = sb.from("posts").select("*").eq("published", true).order("published_at", { ascending: false });
  if (opts.kind) q = q.eq("kind", opts.kind);
  if (opts.category) q = q.eq("category", opts.category);
  if (opts.featured) q = q.eq("featured", true);
  if (opts.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data ?? []) as Post[];
}

export async function getPost(slug: string): Promise<Post | null> {
  const sb = await createClient();
  const { data } = await sb.from("posts").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  return (data as Post) ?? null;
}
