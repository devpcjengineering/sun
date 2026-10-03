// หน้าโหลดเต็มจอ — แสดงตอนเข้าหลังบ้านครั้งแรก/รีเฟรช ระหว่างตรวจสิทธิ์และดึงข้อมูล
export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-white"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-black.svg" alt="SUNNAKHON GROUP" className="h-14 w-auto animate-pulse" />
      <div className="h-1 w-56 overflow-hidden rounded-full bg-soft">
        <div className="loader-bar h-full w-1/3 rounded-full bg-brand" />
      </div>
      <p className="text-sm text-muted">กำลังโหลดหลังบ้าน…</p>
    </div>
  );
}
