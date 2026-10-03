import type { SiteSettings } from "@/lib/types";

export const NAV_LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/services", label: "บริการของเรา" },
  { href: "/portfolio", label: "ผลงานของเรา" },
  { href: "/packages", label: "แพ็คเก็จ/ราคา" },
] as const;

/** กันไม่ให้คำสำคัญถูกตัดขึ้นบรรทัดใหม่กลางคำ (เช่น "ครบ/วงจร", "Live/Commerce") */
export function keepTogether(text: string): string {
  return text
    .replace(/ครบวงจร/g, "ครบ⁠วงจร")
    .replace(/Live Commerce/gi, (m) => m.replace(" ", " "))
    .replace(/Motion Graphics/gi, (m) => m.replace(" ", " "))
    .replace(/Video Production/gi, (m) => m.replace(" ", " "));
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

export function lineHref(s: Pick<SiteSettings, "line_id" | "line_url">): string {
  if (s.line_url) return s.line_url;
  return `https://line.me/R/ti/p/${s.line_id.startsWith("@") ? s.line_id : `@${s.line_id}`}`;
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** แปลงลิงก์ YouTube เป็น embed URL (ถ้าไม่ใช่ YouTube คืน null) */
export function youtubeEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === "youtu.be") id = u.pathname.slice(1);
    else if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/shorts/") || u.pathname.startsWith("/live/"))
        id = u.pathname.split("/")[2];
    }
    if (!id || !/^[\w-]{6,20}$/.test(id)) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  } catch {
    return null;
  }
}

export function formatThaiDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}
