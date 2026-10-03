// Markdown renderer แบบเล็กและปลอดภัย (ไม่พึ่งไลบรารี)
// - escape HTML ทั้งหมดก่อน แล้วค่อยแปลง syntax ที่รองรับ
// - รองรับ: # ## ### , **bold** , *italic* / _italic_ , `code` , [text](http/https) ,
//   ![alt](https) , รายการ - / * / 1. , ขึ้นบรรทัดใหม่ , ---
// ใช้ได้ทั้งฝั่ง server และ client (ผลลัพธ์เป็น HTML string ที่ปลอดภัยสำหรับ dangerouslySetInnerHTML)

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const TOKEN = "\u0000";

/** แปลง inline syntax ในข้อความที่ escape แล้ว */
function renderInline(escaped: string): string {
  const stash: string[] = [];
  const put = (html: string) => {
    stash.push(html);
    return `${TOKEN}${stash.length - 1}${TOKEN}`;
  };

  let s = escaped;

  // inline code
  s = s.replace(/`([^`\n]+)`/g, (_, code: string) => put(`<code>${code}</code>`));

  // image (https เท่านั้น)
  s = s.replace(/!\[([^\]\n]*)\]\((https:\/\/[^\s)]+)\)/g, (_, alt: string, url: string) =>
    put(`<img src="${url}" alt="${alt}" loading="lazy" />`),
  );

  // link (http/https เท่านั้น) — ข้อความในลิงก์รองรับ bold/italic
  s = s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, text: string, url: string) =>
    put(`<a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${renderEmphasis(text)}</a>`),
  );

  s = renderEmphasis(s);

  // คืนค่า token (วนซ้ำเผื่อมี token ซ้อนในลิงก์)
  const restore = new RegExp(`${TOKEN}(\\d+)${TOKEN}`, "g");
  for (let i = 0; i < 3 && s.includes(TOKEN); i++) {
    s = s.replace(restore, (_, n: string) => stash[Number(n)] ?? "");
  }
  return s;
}

function renderEmphasis(s: string): string {
  return s
    .replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<![*\w])\*(?=\S)([^*\n]+?)(?<=\S)\*(?![*\w])/g, "<em>$1</em>")
    .replace(/(?<![_\w])_(?=\S)([^_\n]+?)(?<=\S)_(?![_\w])/g, "<em>$1</em>");
}

export function renderMarkdown(src: string): string {
  if (!src) return "";
  const text = escapeHtml(src.replace(/\r\n?/g, "\n").replaceAll(TOKEN, ""));
  const lines = text.split("\n");
  const out: string[] = [];

  let para: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${para.map(renderInline).join("<br />")}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      out.push(`<${list.type}>${list.items.map((i) => `<li>${renderInline(i)}</li>`).join("")}</${list.type}>`);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushPara();
      flushList();
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushPara();
      flushList();
      out.push("<hr />");
      continue;
    }

    const ul = /^\s*[-*]\s+(.+)$/.exec(line);
    const ol = ul ? null : /^\s*\d+[.)]\s+(.+)$/.exec(line);
    if (ul || ol) {
      flushPara();
      const type = ul ? "ul" : "ol";
      if (list && list.type !== type) flushList();
      if (!list) list = { type, items: [] };
      list.items.push((ul ?? ol)![1]);
      continue;
    }

    flushList();
    para.push(line);
  }
  flushPara();
  flushList();

  return out.join("\n");
}
