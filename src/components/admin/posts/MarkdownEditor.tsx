"use client";
import { useRef, useState } from "react";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/upload";
import { inputCls } from "@/components/admin/ui";
import { MarkdownPreview } from "./MarkdownPreview";

type ToolKey = "h2" | "h3" | "b" | "i" | "ul" | "ol" | "a";
const TOOLS: { key: ToolKey; label: string; icon: React.ReactNode }[] = [
  { key: "h2", label: "หัวข้อใหญ่", icon: <Heading2 className="size-4" /> },
  { key: "h3", label: "หัวข้อรอง", icon: <Heading3 className="size-4" /> },
  { key: "b", label: "ตัวหนา", icon: <Bold className="size-4" /> },
  { key: "i", label: "ตัวเอียง", icon: <Italic className="size-4" /> },
  { key: "ul", label: "รายการ", icon: <List className="size-4" /> },
  { key: "ol", label: "รายการเลขลำดับ", icon: <ListOrdered className="size-4" /> },
  { key: "a", label: "แทรกลิงก์", icon: <Link2 className="size-4" /> },
];

export function MarkdownEditor({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function apply(next: string, selStart: number, selEnd: number) {
    onChange(next);
    requestAnimationFrame(() => {
      const ta = ref.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(selStart, selEnd);
    });
  }

  function getSel() {
    const ta = ref.current;
    const start = ta?.selectionStart ?? value.length;
    const end = ta?.selectionEnd ?? value.length;
    return { start, end, selected: value.slice(start, end) };
  }

  function wrap(before: string, after: string, placeholder: string) {
    const { start, end, selected } = getSel();
    const text = selected || placeholder;
    const next = value.slice(0, start) + before + text + after + value.slice(end);
    apply(next, start + before.length, start + before.length + text.length);
  }

  function linePrefix(prefix: string | ((i: number) => string)) {
    const { start, end } = getSel();
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const nl = value.indexOf("\n", end);
    const lineEnd = nl === -1 ? value.length : nl;
    const block = value.slice(lineStart, lineEnd) || "ข้อความ";
    const out = block
      .split("\n")
      .map((l, i) => (typeof prefix === "function" ? prefix(i) : prefix) + l.replace(/^(#{1,3}\s+|[-*]\s+|\d+[.)]\s+)/, ""))
      .join("\n");
    apply(value.slice(0, lineStart) + out + value.slice(lineEnd), lineStart, lineStart + out.length);
  }

  function link() {
    const { start, end, selected } = getSel();
    const text = selected || "ข้อความลิงก์";
    const url = "https://";
    const next = value.slice(0, start) + `[${text}](${url})` + value.slice(end);
    const urlStart = start + text.length + 3;
    apply(next, urlStart, urlStart + url.length);
  }

  async function insertImage(file?: File) {
    if (!file) return;
    setErr("");
    if (!file.type.startsWith("image/")) return setErr("เลือกไฟล์รูปภาพเท่านั้น");
    if (file.size > 10 * 1024 * 1024) return setErr("ไฟล์ใหญ่เกิน 10MB");
    setBusy(true);
    try {
      const up = await uploadImage(file, "posts");
      const { start, end } = getSel();
      const md = `\n![](${up.url})\n`;
      const next = value.slice(0, start) + md + value.slice(end);
      apply(next, start + md.length, start + md.length);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function runTool(key: ToolKey) {
    switch (key) {
      case "h2":
        return linePrefix("## ");
      case "h3":
        return linePrefix("### ");
      case "b":
        return wrap("**", "**", "ตัวหนา");
      case "i":
        return wrap("*", "*", "ตัวเอียง");
      case "ul":
        return linePrefix("- ");
      case "ol":
        return linePrefix((i) => `${i + 1}. `);
      case "a":
        return link();
    }
  }

  const tabBtn = (t: "write" | "preview", label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === t}
      onClick={() => setTab(t)}
      className={`rounded-md px-3 py-1.5 text-sm transition ${
        tab === t ? "bg-ink font-medium text-white" : "text-muted hover:bg-soft hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/10">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-soft/60 px-2 py-1.5">
        <div role="tablist" className="flex gap-1">
          {tabBtn("write", "เขียน")}
          {tabBtn("preview", "ตัวอย่าง")}
        </div>
        {tab === "write" && (
          <div className="flex flex-wrap items-center gap-0.5">
            {TOOLS.map((t) => (
              <button
                key={t.key}
                type="button"
                title={t.label}
                aria-label={t.label}
                onClick={() => runTool(t.key)}
                className="rounded-md p-1.5 text-ink/70 transition hover:bg-white hover:text-ink"
              >
                {t.icon}
              </button>
            ))}
            <button
              type="button"
              title="แทรกรูปภาพ"
              aria-label="แทรกรูปภาพ"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="rounded-md p-1.5 text-ink/70 transition hover:bg-white hover:text-ink disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => insertImage(e.target.files?.[0])} />
          </div>
        )}
      </div>

      {/* textarea อยู่ใน DOM เสมอ เพื่อให้ถูกส่งไปกับฟอร์มแม้อยู่ในแท็บตัวอย่าง */}
      <textarea
        ref={ref}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={16}
        placeholder={"เขียนเนื้อหาด้วย Markdown เช่น\n## หัวข้อ\nข้อความ **ตัวหนา** และ [ลิงก์](https://example.com)"}
        className={`${inputCls} ${tab === "write" ? "" : "hidden"} resize-y rounded-none border-0 font-mono text-[13px] leading-6 focus:ring-0`}
      />
      {tab === "preview" && (
        <div className="min-h-64 px-4 py-4">
          <MarkdownPreview source={value} />
        </div>
      )}
      {err && <p className="border-t border-line px-4 py-2 text-sm text-brand">{err}</p>}
    </div>
  );
}
