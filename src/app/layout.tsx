import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "SUNNAKHON GROUP | Event, Live Commerce & Production ครบวงจร",
    template: "%s | SUNNAKHON GROUP",
  },
  description:
    "รับจัดงานประกวด คอนเสิร์ต งานนักศึกษา ไลฟ์สดขายสินค้า วิดีโอโปรดักชัน และกราฟิก/Motion Graphics ประสบการณ์กว่า 4 ปี",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${prompt.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
