import {
  Camera,
  Clapperboard,
  Megaphone,
  Mic,
  Music,
  Palette,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

/** ไอคอน lucide ที่เลือกใช้กับ "บริการ" ได้ (whitelist) */
export const SERVICE_ICONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "mic", label: "ไมค์ / อีเวนต์", Icon: Mic },
  { value: "smartphone", label: "สมาร์ทโฟน / ไลฟ์สด", Icon: Smartphone },
  { value: "clapperboard", label: "คลาเพอร์บอร์ด / วิดีโอ", Icon: Clapperboard },
  { value: "palette", label: "จานสี / ดีไซน์", Icon: Palette },
  { value: "sparkles", label: "ประกาย", Icon: Sparkles },
  { value: "camera", label: "กล้อง", Icon: Camera },
  { value: "video", label: "วิดีโอ", Icon: Video },
  { value: "music", label: "ดนตรี", Icon: Music },
  { value: "megaphone", label: "โฆษณา", Icon: Megaphone },
  { value: "store", label: "ร้านค้า", Icon: Store },
  { value: "users", label: "ผู้คน", Icon: Users },
  { value: "star", label: "ดาว", Icon: Star },
];

export const ICON_VALUES = SERVICE_ICONS.map((i) => i.value) as [string, ...string[]];

export function ServiceIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  const Icon = SERVICE_ICONS.find((i) => i.value === name)?.Icon ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}
