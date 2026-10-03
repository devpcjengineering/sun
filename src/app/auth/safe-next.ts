/** ป้องกัน open redirect: ยอมรับเฉพาะ path ภายในเว็บ ("/..." และไม่ใช่ "//...") */
export function safeNext(value: string | null | undefined, fallback = "/admin"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if ([...value].some((c) => c.charCodeAt(0) < 32)) return fallback;
  return value;
}
