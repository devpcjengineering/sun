"use client";
import { useActionState, useRef, useState } from "react";
import { ExternalLink, ImageUp, Loader2, Pencil } from "lucide-react";
import { Badge, btnGhost, Field, inputCls } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { FormMessage, type ActionState } from "@/components/admin/content/FormMessage";
import { RowControls } from "@/components/admin/content/RowControls";
import { deleteImage, uploadImage } from "@/lib/upload";
import type { Client } from "@/lib/types";
import { deleteClient, moveClient, toggleClient, updateClientLogo } from "./actions";

const actions = { toggle: toggleClient, move: moveClient, remove: deleteClient };

export function ClientCard({ client, isFirst, isLast }: { client: Client; isFirst: boolean; isLast: boolean }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <ClientEditForm client={client} onClose={() => setEditing(false)} />;
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <div className="relative aspect-[3/2] border-b border-line bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={client.logo_url}
          alt={client.name}
          loading="lazy"
          className={`h-full w-full object-contain p-4 transition ${client.published ? "" : "opacity-40 grayscale"}`}
        />
        {!client.published && (
          <span className="absolute left-2 top-2">
            <Badge>ซ่อนอยู่</Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink" title={client.name}>
            {client.name}
          </p>
          {client.website_url ? (
            <a
              href={client.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex max-w-full items-center gap-1 text-xs text-muted hover:text-brand"
            >
              <ExternalLink className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{client.website_url.replace(/^https?:\/\//, "")}</span>
            </a>
          ) : (
            <p className="mt-0.5 text-xs text-muted/70">ไม่ระบุเว็บไซต์</p>
          )}
        </div>
        <div className="mt-auto">
          <RowControls
            id={client.id}
            published={client.published}
            isFirst={isFirst}
            isLast={isLast}
            axis="horizontal"
            actions={actions}
            itemLabel={`โลโก้ ${client.name}`}
            deleteMessage={`ลบโลโก้ "${client.name}"? รูปบน Cloudinary จะถูกลบด้วย และไม่สามารถย้อนกลับได้`}
          >
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`แก้ไข ${client.name}`}
              title="แก้ไข"
              className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-white text-ink transition hover:bg-soft"
            >
              <Pencil className="size-4" aria-hidden />
            </button>
          </RowControls>
        </div>
      </div>
    </div>
  );
}

function ClientEditForm({ client, onClose }: { client: Client; onClose: () => void }) {
  const [logo, setLogo] = useState({ url: client.logo_url, public_id: client.logo_public_id });
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [state, formAction] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const res = await updateClientLogo(prev, fd);
    if (res?.ok) onClose();
    return res;
  }, null);

  async function pick(file?: File) {
    if (!file) return;
    setErr("");
    if (!file.type.startsWith("image/")) return setErr("เลือกไฟล์รูปภาพเท่านั้น");
    if (file.size > 10 * 1024 * 1024) return setErr("ไฟล์ใหญ่เกิน 10MB");
    setUploading(true);
    try {
      const up = await uploadImage(file, "clients");
      // รูปที่เพิ่งอัปโหลดแต่ยังไม่ได้บันทึก (ถ้าเปลี่ยนซ้ำ) ลบทิ้ง — ไม่แตะรูปเดิมจนกว่าจะบันทึก
      if (logo.public_id && logo.public_id !== client.logo_public_id) void deleteImage(logo.public_id);
      setLogo({ url: up.url, public_id: up.public_id });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function cancel() {
    if (logo.public_id && logo.public_id !== client.logo_public_id) void deleteImage(logo.public_id);
    onClose();
  }

  return (
    <form
      action={formAction}
      className="col-span-2 space-y-3 rounded-2xl border-2 border-ink bg-white p-4 sm:col-span-2"
      aria-label={`แก้ไข ${client.name}`}
    >
      <input type="hidden" name="id" value={client.id} />
      <input type="hidden" name="logo_url" value={logo.url ?? ""} />
      <input type="hidden" name="logo_public_id" value={logo.public_id ?? ""} />
      <div className="relative aspect-[3/2] max-h-40 w-full overflow-hidden rounded-xl border border-line bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.url ?? ""} alt="" className="h-full w-full object-contain p-3" />
        {uploading && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="size-6 animate-spin text-brand" aria-hidden />
          </div>
        )}
      </div>
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={`${btnGhost} w-full`}>
        <ImageUp className="size-4" aria-hidden /> เปลี่ยนโลโก้
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => void pick(e.target.files?.[0])} />
      {err && <p className="text-sm text-brand">{err}</p>}
      <Field label="ชื่อลูกค้า">
        <input name="name" required maxLength={120} defaultValue={client.name} className={inputCls} />
      </Field>
      <Field label="เว็บไซต์">
        <input
          name="website_url"
          type="url"
          inputMode="url"
          defaultValue={client.website_url ?? ""}
          className={inputCls}
          placeholder="https://"
        />
      </Field>
      <FormMessage state={state} />
      <div className="flex gap-2">
        <SubmitButton>บันทึก</SubmitButton>
        <button type="button" onClick={cancel} className={btnGhost}>
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
