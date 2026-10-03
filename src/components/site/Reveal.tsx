import type { CSSProperties, ReactNode } from "react";

/**
 * เอฟเฟกต์ fade-up เมื่อเลื่อนมาถึง — ใช้ CSS scroll-driven animation (ไม่มี JavaScript ฝั่ง client)
 * เบราว์เซอร์ที่ยังไม่รองรับจะเห็นเนื้อหาทันทีโดยไม่มีแอนิเมชัน; เคารพ prefers-reduced-motion
 * delay (ms) ใช้เลื่อนจังหวะการเข้าของรายการที่เรียงกัน (stagger)
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const style = delay ? ({ "--rd": Math.min(20, Math.round(delay / 20)) } as CSSProperties) : undefined;
  return (
    <div style={style} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
