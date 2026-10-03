"use client";
import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { Card, btnGhost } from "@/components/admin/ui";
import { FormMessage, type ActionState } from "@/components/admin/content/FormMessage";
import { uploadImage } from "@/lib/upload";
import { bulkCreateClients } from "./actions";

type Item = {
  id: number;
  name: string;
  status: "uploading" | "queued" | "uploaded" | "saved" | "error";
  error?: string;
};

const MAX_SIZE = 10 * 1024 * 1024;
const CONCURRENCY = 3;

/** ชื่อจากชื่อไฟล์: ตัดนามสกุล, แทน _ - ด้วยช่องว่าง */
function nameFromFile(file: File) {
  return (
    file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "ลูกค้า"
  );
}

/** อัปโหลดโลโก้หลายไฟล์พร้อมกัน (เลือกหลายไฟล์ / ลากมาวาง) แล้วบันทึกลง DB ทีเดียว */
export function ClientBulkUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [result, setResult] = useState<ActionState>(null);

  const patch = (id: number, p: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));

  async function handleFiles(list: FileList | File[]) {
    const files = Array.from(list);
    if (!files.length || busy) return;
    setResult(null);

    const entries: (Item & { file: File })[] = [];
    const rejected: Item[] = [];
    for (const file of files) {
      const base: Item = { id: nextId.current++, name: nameFromFile(file), status: "queued" };
      if (!file.type.startsWith("image/")) rejected.push({ ...base, status: "error", error: "ไม่ใช่ไฟล์รูปภาพ" });
      else if (file.size > MAX_SIZE) rejected.push({ ...base, status: "error", error: "ไฟล์ใหญ่เกิน 10MB" });
      else entries.push({ ...base, file });
    }
    setItems((prev) => [...prev, ...rejected, ...entries.map((e): Item => ({ id: e.id, name: e.name, status: e.status }))]);
    if (!entries.length) return;

    setBusy(true);
    const uploaded: { name: string; logo_url: string; logo_public_id: string; id: number }[] = [];
    let cursor = 0;
    async function worker() {
      while (cursor < entries.length) {
        const e = entries[cursor++];
        patch(e.id, { status: "uploading" });
        try {
          const up = await uploadImage(e.file, "clients");
          uploaded.push({ id: e.id, name: e.name, logo_url: up.url, logo_public_id: up.public_id });
          patch(e.id, { status: "uploaded" });
        } catch (err) {
          patch(e.id, { status: "error", error: err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ" });
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, entries.length) }, worker));

    if (uploaded.length) {
      try {
        const res = await bulkCreateClients(
          uploaded.map(({ name, logo_url, logo_public_id }) => ({ name, logo_url, logo_public_id })),
        );
        setResult(res);
        if (res?.ok) {
          const ids = new Set(uploaded.map((u) => u.id));
          setItems((prev) => prev.map((it) => (ids.has(it.id) ? { ...it, status: "saved" } : it)));
        }
      } catch {
        setResult({ ok: false, error: "บันทึกลงฐานข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง" });
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const done = items.filter((i) => i.status === "saved").length;
  const failed = items.filter((i) => i.status === "error").length;

  return (
    <Card className="flex flex-col">
      <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
        <UploadCloud className="size-4 text-brand" aria-hidden /> อัปโหลดหลายไฟล์พร้อมกัน
      </h2>
      <p className="mt-1 text-sm text-muted">
        เลือกหรือลากไฟล์โลโก้มาวางได้หลายไฟล์ ระบบตั้งชื่อจากชื่อไฟล์ให้ (แก้ชื่อได้ภายหลัง)
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`mt-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
          drag ? "border-brand bg-brand/5" : "border-line bg-soft"
        }`}
      >
        {busy ? (
          <Loader2 className="size-8 animate-spin text-brand" aria-hidden />
        ) : (
          <UploadCloud className="size-8 text-muted" aria-hidden />
        )}
        <p className="text-sm text-ink">{busy ? "กำลังอัปโหลด…" : "ลากไฟล์รูปมาวางที่นี่"}</p>
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={btnGhost}>
          เลือกไฟล์โลโก้
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted">
              สำเร็จ {done}/{items.length} รายการ{failed > 0 && ` · ผิดพลาด ${failed}`}
            </span>
            {!busy && (
              <button
                type="button"
                onClick={() => {
                  setItems([]);
                  setResult(null);
                }}
                className="text-sm text-muted underline hover:text-ink"
              >
                ล้างรายการ
              </button>
            )}
          </div>
          <ul className="max-h-48 space-y-1.5 overflow-auto pr-1" aria-live="polite">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-2 rounded-lg bg-soft px-3 py-1.5 text-sm">
                {it.status === "saved" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden />
                ) : it.status === "error" ? (
                  <AlertCircle className="size-4 shrink-0 text-brand" aria-hidden />
                ) : (
                  <Loader2
                    className={`size-4 shrink-0 text-muted ${it.status === "uploading" ? "animate-spin" : "opacity-40"}`}
                    aria-hidden
                  />
                )}
                <span className="min-w-0 flex-1 truncate">{it.name}</span>
                {it.error && <span className="shrink-0 text-xs text-brand">{it.error}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {result && (
        <div className="mt-3">
          <FormMessage state={result} />
        </div>
      )}
    </Card>
  );
}
