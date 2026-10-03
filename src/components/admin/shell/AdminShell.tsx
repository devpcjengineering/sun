"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

type ShellUser = { email: string; name: string | null; avatar: string | null };

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-white.svg" alt="SUNNAKHON GROUP" className="h-9 w-auto" />
      <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
        Admin
      </span>
    </Link>
  );
}

function Avatar({ user }: { user: ShellUser }) {
  const initial = (user.name ?? user.email).trim().charAt(0).toUpperCase() || "A";
  return user.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="size-9 rounded-full border border-line object-cover" />
  ) : (
    <span className="grid size-9 place-items-center rounded-full bg-ink text-sm font-semibold text-white">{initial}</span>
  );
}

export function AdminShell({
  user,
  unread,
  children,
}: {
  user: ShellUser;
  unread: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  // ปิดด้วย Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-soft">
      {/* backdrop (มือถือ) */}
      {open && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-ink transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="ปิดเมนู"
            className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav unread={unread} onNavigate={() => setOpen(false)} />
        </div>
        <div className="shrink-0 border-t border-white/10 p-4 text-xs text-white/40">
          <p>SUNNAKHON GROUP</p>
          <p>ระบบจัดการเว็บไซต์</p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="เปิดเมนู"
            aria-expanded={open}
            aria-controls="admin-sidebar"
            className="rounded-md p-2 text-ink hover:bg-soft lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex-1" />

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-ink transition hover:bg-soft"
          >
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">ดูหน้าเว็บ</span>
            <span className="sr-only sm:hidden">ดูหน้าเว็บ</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Avatar user={user} />
            <div className="hidden min-w-0 leading-tight md:block">
              {user.name && <p className="max-w-48 truncate text-sm font-medium text-ink">{user.name}</p>}
              <p className="max-w-48 truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-brand/10 hover:text-brand"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
              <span className="sr-only sm:hidden">ออกจากระบบ</span>
            </button>
          </form>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
