export default function PostsLoading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="กำลังโหลด">
      <div className="h-8 w-48 rounded-lg bg-line" />
      <div className="h-11 rounded-lg bg-line/70" />
      <div className="space-y-px overflow-hidden rounded-2xl border border-line bg-white">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <div className="h-12 w-16 rounded-lg bg-soft" />
            <div className="h-4 flex-1 rounded bg-soft" />
            <div className="h-4 w-24 rounded bg-soft" />
          </div>
        ))}
      </div>
    </div>
  );
}
