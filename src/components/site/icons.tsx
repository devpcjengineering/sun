import {
  Camera,
  Clapperboard,
  Film,
  Megaphone,
  Mic,
  Music,
  Palette,
  PenTool,
  Smartphone,
  Sparkles,
  Store,
  Tv,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  clapperboard: Clapperboard,
  film: Film,
  megaphone: Megaphone,
  mic: Mic,
  music: Music,
  palette: Palette,
  "pen-tool": PenTool,
  smartphone: Smartphone,
  sparkles: Sparkles,
  store: Store,
  tv: Tv,
  users: Users,
  video: Video,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name?.toLowerCase()] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
