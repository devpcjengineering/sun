import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { safeNext } from "../auth/safe-next";
import { GoogleLoginButton } from "./GoogleLoginButton";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  not_admin: "อีเมลนี้ไม่มีสิทธิ์เข้าหลังบ้าน กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มอีเมลของคุณ",
  auth: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  oauth: "การเข้าสู่ระบบด้วย Google ถูกยกเลิกหรือไม่สำเร็จ",
  missing_code: "ไม่พบรหัสยืนยันจาก Google กรุณาลองใหม่อีกครั้ง",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const errorMsg = sp.error ? (ERRORS[sp.error] ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง") : null;
  const supabaseReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-soft px-4 py-10">
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-brand/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 size-96 rounded-full bg-ink/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-line bg-white p-8 shadow-xl shadow-black/5 sm:p-10">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-black.svg" alt="SUNNAKHON GROUP" className="h-16 w-auto" />
          </div>
          <div className="mx-auto mt-6 h-1 w-10 rounded-full bg-brand" />
          <h1 className="mt-6 text-center text-2xl font-semibold text-ink">เข้าสู่ระบบหลังบ้าน</h1>
          <p className="mt-2 text-center text-sm text-muted">
            สำหรับผู้ดูแลเว็บไซต์ SUNNAKHON GROUP เท่านั้น
          </p>

          {errorMsg && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mt-8">
            {supabaseReady ? (
              <GoogleLoginButton next={next} />
            ) : (
              <div className="rounded-xl border border-dashed border-line bg-soft px-4 py-4 text-sm text-muted">
                ยังไม่ได้ตั้งค่า Supabase — เพิ่ม <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_URL</code> และ{" "}
                <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> ในไฟล์{" "}
                <code className="rounded bg-white px-1">.env.local</code> แล้วรีสตาร์ทเซิร์ฟเวอร์
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            ใช้บัญชี Google ที่ได้รับอนุญาตเท่านั้น ระบบจะไม่เก็บรหัสผ่านของคุณ
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink">
            <ArrowLeft className="size-4" />
            กลับหน้าเว็บไซต์
          </Link>
        </div>
      </div>
    </main>
  );
}
