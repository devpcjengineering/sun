"use client";

import { useActionState } from "react";
import { CircleAlert, CircleCheck, Loader, Send } from "lucide-react";
import { submitInquiry, type ContactState } from "@/app/(site)/contact/actions";

const initial: ContactState = { ok: false };

const field =
  "mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-brand";

export default function ContactForm({ services }: { services: string[] }) {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const fe = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div role="status" className="rounded-3xl border border-line bg-white p-10 text-center">
        <CircleCheck className="mx-auto h-14 w-14 text-brand" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold text-ink">ส่งข้อความเรียบร้อยแล้ว</h2>
        <p className="mt-2 text-muted">ขอบคุณที่ติดต่อ #teamsunnakhon ทีมงานจะติดต่อกลับโดยเร็วที่สุด</p>
      </div>
    );
  }

  const err = (id: string, msg?: string) =>
    msg ? (
      <p id={id} className="mt-1.5 text-sm text-brand">
        {msg}
      </p>
    ) : null;

  return (
    <form action={action} className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-10" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-semibold text-ink">
            ชื่อ <span className="text-brand">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={200}
            autoComplete="name"
            className={field}
            placeholder="ชื่อ-นามสกุล / ชื่อองค์กร"
            aria-invalid={!!fe.name}
            aria-describedby={fe.name ? "name-err" : undefined}
          />
          {err("name-err", fe.name)}
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-semibold text-ink">
            เบอร์โทร
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            maxLength={50}
            autoComplete="tel"
            className={field}
            placeholder="08x-xxx-xxxx"
            aria-invalid={!!fe.phone}
            aria-describedby={fe.phone ? "phone-err" : undefined}
          />
          {err("phone-err", fe.phone)}
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-ink">
            อีเมล
          </label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={200}
            autoComplete="email"
            className={field}
            placeholder="you@example.com"
            aria-invalid={!!fe.email}
            aria-describedby={fe.email ? "email-err" : undefined}
          />
          {err("email-err", fe.email)}
        </div>
        <div>
          <label htmlFor="service" className="text-sm font-semibold text-ink">
            บริการที่สนใจ
          </label>
          <select id="service" name="service" className={field} defaultValue="">
            <option value="">ยังไม่ระบุ</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="อื่น ๆ">อื่น ๆ</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="text-sm font-semibold text-ink">
            รายละเอียดงาน <span className="text-brand">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            maxLength={5000}
            className={field}
            placeholder="บอกเราเกี่ยวกับงานของคุณ เช่น ประเภทงาน วันที่ สถานที่ งบประมาณคร่าว ๆ"
            aria-invalid={!!fe.message}
            aria-describedby={fe.message ? "message-err" : undefined}
          />
          {err("message-err", fe.message)}
        </div>
        {/* honeypot */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">เว็บไซต์</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mt-6 flex items-start gap-2 rounded-2xl bg-brand/10 px-4 py-3 text-sm text-brand-dark">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-8 py-3.5 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {pending ? (
          <>
            <Loader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            กำลังส่ง...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden="true" />
            ส่งข้อความ
          </>
        )}
      </button>
    </form>
  );
}
