"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "phone" | "email" | "message", string>>;
};

function str(v: FormDataEntryValue | null, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function submitInquiry(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // honeypot — บอตมักกรอกช่องที่ซ่อนไว้
  if (str(formData.get("website"), 100)) return { ok: true };

  const name = str(formData.get("name"), 200);
  const phone = str(formData.get("phone"), 50);
  const email = str(formData.get("email"), 200);
  const service = str(formData.get("service"), 200);
  const message = str(formData.get("message"), 5000);

  const fieldErrors: NonNullable<ContactState["fieldErrors"]> = {};
  if (!name) fieldErrors.name = "กรุณากรอกชื่อ";
  if (!phone && !email) {
    fieldErrors.phone = "กรุณากรอกเบอร์โทรหรืออีเมลอย่างน้อยหนึ่งช่อง";
  }
  if (phone && !/^[0-9+\-\s()]{8,20}$/.test(phone)) fieldErrors.phone = "รูปแบบเบอร์โทรไม่ถูกต้อง";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  if (!message) fieldErrors.message = "กรุณากรอกรายละเอียด";
  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "กรุณาตรวจสอบข้อมูลอีกครั้ง", fieldErrors };
  }

  // ลูกค้ามาจากไหน (จาก TrackPageView ผ่านช่องซ่อน) — ไม่บังคับ
  const source = str(formData.get("visit_source"), 100).toLowerCase();
  const referrer = str(formData.get("visit_referrer"), 1000);
  const landing = str(formData.get("visit_landing"), 300);

  try {
    const sb = await createClient();
    const { error } = await sb.from("inquiries").insert({
      name,
      phone: phone || null,
      email: email || null,
      service: service || null,
      message,
      source: source || null,
      referrer: /^https?:\/\//i.test(referrer) ? referrer : null,
      landing_path: landing.startsWith("/") ? landing : null,
    });
    if (error) throw error;
    return { ok: true };
  } catch {
    return { ok: false, error: "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือติดต่อเราทางโทรศัพท์/LINE" };
  }
}
