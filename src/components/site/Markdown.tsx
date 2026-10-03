import type { ReactNode } from "react";

// Markdown renderer แบบเล็กและปลอดภัย (ไม่ใช้ dangerouslySetInnerHTML)
// รองรับ: # ## ###, รายการ - / 1., > quote, ---, **bold**, *italic*, `code`, [text](url)

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function safeHref(href: string): string | null {
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href) || href.startsWith("/") || href.startsWith("#")) return href;
  return null;
}

function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
      return (
        <code key={key} className="rounded bg-soft px-1.5 py-0.5 text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={key}>{part.slice(1, -1)}</em>;
    const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (m) {
      const href = safeHref(m[2]);
      if (!href) return m[1];
      const external = /^https?:/i.test(href);
      return (
        <a
          key={key}
          href={href}
          className="font-medium text-brand underline underline-offset-4 hover:text-brand-dark"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {m[1]}
        </a>
      );
    }
    return part;
  });
}

export default function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `b${k++}`;

    if (!line.trim()) {
      i++;
      continue;
    }

    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const text = inline(h[2], key);
      if (level === 1)
        out.push(
          <h2 key={key} className="mb-4 mt-10 text-3xl font-bold text-ink">
            {text}
          </h2>,
        );
      else if (level === 2)
        out.push(
          <h3 key={key} className="mb-3 mt-8 text-2xl font-bold text-ink">
            {text}
          </h3>,
        );
      else
        out.push(
          <h4 key={key} className="mb-2 mt-6 text-xl font-semibold text-ink">
            {text}
          </h4>,
        );
      i++;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      out.push(<hr key={key} className="my-8 border-line" />);
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ""));
      out.push(
        <ul key={key} className="my-4 list-disc space-y-1.5 pl-6 marker:text-brand">
          {items.map((t, n) => (
            <li key={n}>{inline(t, `${key}-${n}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ""));
      out.push(
        <ol key={key} className="my-4 list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-brand">
          {items.map((t, n) => (
            <li key={n}>{inline(t, `${key}-${n}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push(
        <blockquote key={key} className="my-6 border-l-4 border-brand bg-soft py-3 pl-5 pr-4 italic text-ink">
          {inline(buf.join(" "), key)}
        </blockquote>,
      );
      continue;
    }

    // ย่อหน้า: รวมบรรทัดต่อเนื่องจนเจอบรรทัดว่างหรือ block อื่น
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3}\s|\s*[-*]\s|\s*\d+[.)]\s|>|---+$)/.test(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    if (!buf.length) {
      i++;
      continue;
    }
    out.push(
      <p key={key} className="my-4 whitespace-pre-line">
        {inline(buf.join("\n"), key)}
      </p>,
    );
  }

  return <div className="leading-loose text-ink/90">{out}</div>;
}
