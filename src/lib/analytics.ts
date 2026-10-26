// ใช้ร่วมกันทั้งฝั่ง browser / server / หลังบ้าน — จัดกลุ่ม "ลูกค้ามาจากไหน" จาก referrer และ utm

export const TRACK_ENDPOINT = "/api/track";
/** sessionStorage key: ข้อมูลที่ผู้ชมเข้ามาครั้งแรก (ใช้ติดไปกับฟอร์มติดต่อ) */
export const VISIT_KEY = "sn_visit";

export type VisitInfo = {
  source: string; // กลุ่ม เช่น google / facebook / direct / example.com
  referrer: string | null; // URL เต็มของหน้าที่ลิงก์มา
  landing_path: string; // หน้าแรกที่เข้ามา
};

const KNOWN: { test: RegExp; source: string }[] = [
  { test: /(^|\.)facebook\.com$|(^|\.)fb\.com$|^l\.facebook\.com$|^lm\.facebook\.com$|^m\.facebook\.com$/i, source: "facebook" },
  { test: /(^|\.)instagram\.com$|^l\.instagram\.com$/i, source: "instagram" },
  { test: /(^|\.)google\./i, source: "google" },
  { test: /(^|\.)line\.me$|(^|\.)line-apps\.com$|(^|\.)line\.naver\.jp$/i, source: "line" },
  { test: /(^|\.)tiktok\.com$/i, source: "tiktok" },
  { test: /(^|\.)youtube\.com$|^youtu\.be$/i, source: "youtube" },
  { test: /(^|\.)twitter\.com$|^t\.co$|(^|\.)x\.com$/i, source: "x" },
  { test: /(^|\.)bing\.com$/i, source: "bing" },
  { test: /(^|\.)yahoo\./i, source: "yahoo" },
  { test: /(^|\.)messenger\.com$/i, source: "facebook" },
  { test: /(^|\.)linkedin\.com$|^lnkd\.in$/i, source: "linkedin" },
  { test: /(^|\.)threads\.(net|com)$/i, source: "threads" },
];

/** ชื่อแหล่งที่มาสำหรับแสดงผล (หลังบ้าน) */
export const SOURCE_LABELS: Record<string, string> = {
  direct: "เข้าตรง / พิมพ์ URL",
  google: "Google",
  facebook: "Facebook",
  instagram: "Instagram",
  line: "LINE",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X (Twitter)",
  bing: "Bing",
  yahoo: "Yahoo",
  linkedin: "LinkedIn",
  threads: "Threads",
};

export function sourceLabel(source: string | null | undefined): string {
  if (!source) return "ไม่ทราบ";
  return SOURCE_LABELS[source] ?? source;
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase() || null;
  } catch {
    return null;
  }
}

/**
 * จัดกลุ่มแหล่งที่มา: utm_source มาก่อน, ถัดมาคือโดเมนของ referrer
 * - referrer เป็นโดเมนเราเอง → null (ไม่ใช่การเข้ามาจากข้างนอก)
 * - ไม่มี referrer → "direct"
 */
export function classifySource(referrer: string | null | undefined, utmSource: string | null | undefined, ownHost?: string): string | null {
  const utm = (utmSource ?? "").trim().toLowerCase().slice(0, 60);
  if (utm) {
    const hit = KNOWN.find((k) => k.test.test(utm));
    return hit ? hit.source : utm;
  }
  if (!referrer) return "direct";
  const host = hostOf(referrer);
  if (!host) return "direct";
  const own = (ownHost ?? "").replace(/^www\./i, "").toLowerCase();
  if (own && (host === own || host.endsWith(`.${own}`))) return null;
  const hit = KNOWN.find((k) => k.test.test(host));
  return hit ? hit.source : host;
}

/** กรองบอท/เครื่องมือดึงตัวอย่างลิงก์ — ไม่นับเป็นผู้เข้าชม */
export function isBot(ua: string | null | undefined): boolean {
  if (!ua) return true;
  return /bot|crawl|spider|slurp|facebookexternalhit|fetch|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|java\/|go-http|axios|node-fetch|okhttp/i.test(ua);
}

export function deviceOf(ua: string | null | undefined): "mobile" | "desktop" {
  return /mobi|android|iphone|ipad|ipod|tablet/i.test(ua ?? "") ? "mobile" : "desktop";
}

export const COUNTRY_NAMES: Record<string, string> = {
  TH: "ไทย",
  US: "สหรัฐอเมริกา",
  SG: "สิงคโปร์",
  JP: "ญี่ปุ่น",
  CN: "จีน",
  KR: "เกาหลีใต้",
  MY: "มาเลเซีย",
  VN: "เวียดนาม",
  LA: "ลาว",
  MM: "เมียนมา",
  KH: "กัมพูชา",
  ID: "อินโดนีเซีย",
  PH: "ฟิลิปปินส์",
  IN: "อินเดีย",
  AU: "ออสเตรเลีย",
  GB: "สหราชอาณาจักร",
  DE: "เยอรมนี",
  FR: "ฝรั่งเศส",
  HK: "ฮ่องกง",
  TW: "ไต้หวัน",
};

export function countryLabel(code: string | null | undefined): string {
  if (!code) return "ไม่ทราบ";
  return COUNTRY_NAMES[code] ?? code;
}
