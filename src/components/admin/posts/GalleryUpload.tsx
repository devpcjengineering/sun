"use client";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import { uploadImage } from "@/lib/upload";
import type { GalleryImage } from "@/lib/types";

const MAX_IMAGES = 30;

/**
 * แกลเลอรีหลายรูป (Cloudinary โฟลเดอร์ 'posts') — เรียงลำดับ/ลบได้
 * การลบรูปเป็นแค่เอาออกจากรายการ; ไฟล์บน Cloudinary จะถูกลบตอนกดบันทึก (server action)
 */
export function GalleryUpload({
  value,
  onChange,
}: {
  value: GalleryImage[];
  onChange: (v: GalleryImage[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState("");

  async function pick(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErr("");
    const list = Array.from(files);
    const room = MAX_IMAGES - value.length;
    if (list.length > room) setErr(`เพิ่มได้สูงสุด ${MAX_IMAGES} รูป`);

    const added: GalleryImage[] = [];
    const errors: string[] = [];
    setBusy(Math.min(list.length, room));
    for (const file of list.slice(0, Math.max(room, 0))) {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: ไม่ใช่ไฟล์รูปภาพ`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: ไฟล์ใหญ่เกิน 10MB`);
        continue;
      }
      try {
        const up = await uploadImage(file, "posts");
        added.push({ url: up.url, public_id: up.public_id });
      } catch (e) {
        errors.push(`${file.name}: ${e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ"}`);
      }
    }
    if (added.length) onChange([...value, ...added]);
    if (errors.length) setErr(errors.join(" • "));
    setBusy(0);
    if (ref.current) ref.current.value = "";
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((img, i) => (
          <li key={img.public_id || img.url} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={`รูปที่ ${i + 1}`} className="h-full w-full object-cover" />
            <span className="absolute left-1.5 top-1.5 rounded bg-ink/80 px-1.5 py-0.5 text-[11px] text-white">{i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, k) => k !== i))}
              aria-label={`ลบรูปที่ ${i + 1}`}
              className="absolute right-1.5 top-1.5 rounded-md bg-brand p-1 text-white hover:bg-brand-dark"
            >
              <X className="size-4" />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="เลื่อนไปก่อนหน้า"
                className="rounded-md bg-white/90 p-1 text-ink hover:bg-white disabled:opacity-30"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                aria-label="เลื่อนไปถัดไป"
                className="rounded-md bg-white/90 p-1 text-ink hover:bg-white disabled:opacity-30"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </li>
        ))}

        {Array.from({ length: busy }).map((_, i) => (
          <li key={`busy-${i}`} className="grid aspect-square place-items-center rounded-xl border border-dashed border-line bg-soft">
            <Loader2 className="size-6 animate-spin text-brand" />
          </li>
        ))}

        {value.length + busy < MAX_IMAGES && (
          <li>
            <button
              type="button"
              onClick={() => ref.current?.click()}
              disabled={busy > 0}
              className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-soft text-sm text-muted transition hover:border-ink hover:text-ink disabled:opacity-60"
            >
              <ImagePlus className="size-6" />
              เพิ่มรูป
            </button>
          </li>
        )}
      </ul>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => pick(e.target.files)} />
      {err && <p className="text-sm text-brand">{err}</p>}
    </div>
  );
}
