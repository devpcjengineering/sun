"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Building2,
  Sparkles,
  Tags,
  MessageSquareQuote,
  Inbox,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { canManage, type Role } from "@/lib/types";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: "unread"; kind?: "work" | "article"; manageOnly?: boolean };

const NAV: NavItem[] = [
  { href: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/admin/posts?kind=work", label: "ผลงาน", icon: FileText, kind: "work" },
  { href: "/admin/posts?kind=article", label: "บทความ", icon: Newspaper, kind: "article" },
  { href: "/admin/clients", label: "ลูกค้าที่เคยร่วมงาน (โลโก้)", icon: Building2 },
  { href: "/admin/services", label: "บริการ", icon: Sparkles },
  { href: "/admin/packages", label: "แพ็คเก็จ/ราคา", icon: Tags },
  { href: "/admin/testimonials", label: "เสียงลูกค้า", icon: MessageSquareQuote },
  { href: "/admin/inquiries", label: "ข้อความติดต่อ", icon: Inbox, badge: "unread" },
  { href: "/admin/settings", label: "ตั้งค่าเว็บไซต์", icon: Settings, manageOnly: true },
  { href: "/admin/admins", label: "ผู้ดูแลระบบ", icon: ShieldCheck, manageOnly: true },
];

export function SidebarNav({ unread, role, onNavigate }: { unread: number; role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const kindParam = useSearchParams().get("kind");

  return (
    <nav aria-label="เมนูหลังบ้าน" className="space-y-1">
      {NAV.filter((item) => !item.manageOnly || canManage(role)).map((item) => {
        const base = item.href.split("?")[0];
        const inPosts = pathname === base || pathname.startsWith(`${base}/`);
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : item.kind
              ? inPosts && (kindParam === item.kind || (kindParam !== "article" && kindParam !== "work" && item.kind === "work"))
              : inPosts;
        const Icon = item.icon;
        const count = item.badge === "unread" ? unread : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              active ? "bg-white/10 font-medium text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span
              aria-hidden
              className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand transition-opacity ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
            <Icon className={`size-[18px] shrink-0 ${active ? "text-brand" : ""}`} />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {count > 0 && (
              <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold leading-none text-white">
                {count > 99 ? "99+" : count}
                <span className="sr-only"> ข้อความใหม่</span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
