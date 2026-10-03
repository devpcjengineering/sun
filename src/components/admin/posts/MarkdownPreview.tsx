import { renderMarkdown } from "@/lib/markdown";

/** แสดงตัวอย่าง Markdown (renderMarkdown escape HTML แล้ว จึงปลอดภัยต่อ dangerouslySetInnerHTML) */
export function MarkdownPreview({ source }: { source: string }) {
  const html = renderMarkdown(source);
  if (!html) {
    return <p className="text-sm text-muted">ยังไม่มีเนื้อหา — พิมพ์ในแท็บ &quot;เขียน&quot; เพื่อดูตัวอย่าง</p>;
  }
  return (
    <div
      className={[
        "text-[15px] leading-7 text-ink",
        "[&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold",
        "[&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold",
        "[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold",
        "[&_p]:my-3",
        "[&_a]:text-brand [&_a]:underline",
        "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-1",
        "[&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-xl",
        "[&_code]:rounded [&_code]:bg-soft [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px]",
        "[&_hr]:my-6 [&_hr]:border-line",
        "[&>*:first-child]:mt-0",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
