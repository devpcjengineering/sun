// โครงโหลดของพื้นที่เนื้อหา — แสดงทุกครั้งที่สลับเมนูภายในหลังบ้าน (sidebar ยังอยู่)
export default function PanelLoading() {
  return (
    <div role="status" aria-live="polite" aria-label="กำลังโหลด" className="space-y-6">
      <div className="loader-bar-top fixed left-0 top-0 z-[60] h-0.5 w-full bg-brand" />
      <div className="space-y-2">
        <div className="h-7 w-56 animate-pulse rounded-lg bg-soft" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-soft" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-line bg-soft" />
        ))}
      </div>
      <div className="space-y-3 rounded-2xl border border-line bg-white p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-soft" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
      <span className="sr-only">กำลังโหลด…</span>
    </div>
  );
}
