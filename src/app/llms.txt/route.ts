import {
  loadArticles,
  loadClients,
  loadPackages,
  loadPosts,
  loadServices,
  loadSettings,
  loadTestimonials,
} from "@/components/site/safe-data";

export const dynamic = "force-dynamic";

/** /llms.txt — สรุปข้อมูลสาธารณะทั้งเว็บเป็นข้อความล้วน สำหรับ AI / LLM */
export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const [s, services, packages, clients, works, articles, testimonials] = await Promise.all([
    loadSettings(),
    loadServices(),
    loadPackages(),
    loadClients(),
    loadPosts(),
    loadArticles(),
    loadTestimonials(),
  ]);

  const L: string[] = [];
  L.push(`# ${s.site_name}`, "", `> ${s.hero_title}`, "", s.hero_subtitle, "");

  L.push("## ติดต่อ");
  L.push(`- เว็บไซต์: ${base}`);
  if (s.phone) L.push(`- โทร: ${s.phone}`);
  if (s.email) L.push(`- อีเมล: ${s.email}`);
  if (s.line_id) L.push(`- LINE: ${s.line_id}`);
  if (s.facebook_url) L.push(`- Facebook: ${s.facebook_url}`);
  if (s.instagram_url) L.push(`- Instagram: ${s.instagram_url}`);
  if (s.tiktok_url) L.push(`- TikTok: ${s.tiktok_url}`);
  if (s.youtube_url) L.push(`- YouTube: ${s.youtube_url}`);
  if (s.address) L.push(`- ที่อยู่: ${s.address}`);
  L.push("");

  L.push(`## ${s.why_title}`, "", s.why_text, "");

  L.push("## บริการของเรา", "");
  for (const v of services) {
    L.push(`### ${v.title}${v.subtitle ? ` — ${v.subtitle}` : ""}`);
    if (v.description) L.push(v.description);
    if (v.features?.length) L.push(...v.features.map((f) => `- ${f}`));
    L.push("");
  }

  if (packages.length) {
    L.push("## แพ็คเก็จ/ราคา", "");
    for (const p of packages) {
      L.push(`### ${p.name} — ${p.price_text}${p.price_note ? ` (${p.price_note})` : ""}`);
      if (p.description) L.push(p.description);
      if (p.features?.length) L.push(...p.features.map((f) => `- ${f}`));
      L.push("");
    }
  }

  if (clients.length) {
    L.push("## ลูกค้าที่เคยร่วมงาน", "", `ดูทั้งหมด: ${base}/customers`, "");
    for (const c of clients) {
      const desc = c.description ? c.description.replace(/\s+/g, " ").trim().slice(0, 200) : "";
      L.push(
        c.slug
          ? `- [${c.name}](${base}/customers/${encodeURIComponent(c.slug)})${desc ? `: ${desc}` : ""}`
          : `- ${c.name}`,
      );
    }
    L.push("");
  }

  if (works.length) {
    L.push("## ผลงานของเรา", "");
    for (const p of works) {
      L.push(`- [${p.title}](${base}/portfolio/${encodeURIComponent(p.slug)})${p.excerpt ? `: ${p.excerpt}` : ""}`);
    }
    L.push("");
  }

  if (articles.length) {
    L.push("## บทความ", "");
    for (const p of articles) {
      L.push(`- [${p.title}](${base}/articles/${encodeURIComponent(p.slug)})${p.excerpt ? `: ${p.excerpt}` : ""}`);
    }
    L.push("");
  }

  if (testimonials.length) {
    L.push("## เสียงจากลูกค้า", "");
    for (const t of testimonials) L.push(`- "${t.content}" — ${t.name}${t.role ? `, ${t.role}` : ""}`);
    L.push("");
  }

  return new Response(L.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
