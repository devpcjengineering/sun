"use client";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { deleteImage, uploadImage } from "@/lib/upload";
import type { CloudinaryFolder } from "@/lib/cloudinary";

type Value = { url: string | null; public_id: string | null };

/**
 * อัปโหลดรูปเดี่ยวขึ้น Cloudinary
 * - ควบคุมผ่าน value/onChange (เก็บ url + public_id ลง DB ทั้งคู่)
 * - ถ้าส่ง name มาด้วย จะมี <input type="hidden"> ชื่อ `${name}_url` และ `${name}_public_id` ให้ใช้กับ <form action> ได้เลย
 */
export function ImageUpload({
  folder,
  value,
  onChange,
  name,
  label,
  aspect = "aspect-video",
  contain = false,
}: {
  folder: CloudinaryFolder;
  value: Value;
  onChange: (v: Value) => void;
  name?: string;
  label?: string;
  aspect?: string; // tailwind aspect class
  contain?: boolean; // ใช้ object-contain (เหมาะกับโลโก้)
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pick(file?: File) {
    if (!file) return;
    setErr("");
    if (!file.type.startsWith("image/")) return setErr("เลือกไฟล์รูปภาพเท่านั้น");
    if (file.size > 10 * 1024 * 1024) return setErr("ไฟล์ใหญ่เกิน 10MB");
    setBusy(true);
    try {
      const up = await uploadImage(file, folder);
      onChange({ url: up.url, public_id: up.public_id });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  async function remove() {
    // ลบจาก Cloudinary แบบ best-effort (ไม่กระทบ DB จนกว่าจะกดบันทึก)
    if (value.public_id) void deleteImage(value.public_id);
    onChange({ url: null, public_id: null });
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-ink">{label}</p>}
      <div
        className={`relative ${aspect} w-full overflow-hidden rounded-xl border border-dashed border-line bg-soft`}
      >
        {value.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt="" className={`h-full w-full ${contain ? "object-contain p-4" : "object-cover"}`} />
        ) : (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-muted hover:text-ink"
          >
            <ImagePlus className="size-6" />
            คลิกเพื่ออัปโหลดรูป
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="size-6 animate-spin text-brand" />
          </div>
        )}
        {value.url && !busy && (
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="rounded-md bg-ink/80 px-2.5 py-1 text-xs text-white hover:bg-ink"
            >
              เปลี่ยนรูป
            </button>
            <button
              type="button"
              onClick={remove}
              aria-label="ลบรูป"
              className="rounded-md bg-brand p-1 text-white hover:bg-brand-dark"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      {name && (
        <>
          <input type="hidden" name={`${name}_url`} value={value.url ?? ""} />
          <input type="hidden" name={`${name}_public_id`} value={value.public_id ?? ""} />
        </>
      )}
      {err && <p className="text-sm text-brand">{err}</p>}
    </div>
  );
}
