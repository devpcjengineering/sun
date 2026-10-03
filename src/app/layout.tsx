import type { Metadata, Viewport } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"], // ไม่ได้ใช้ 300 ที่ไหนในเว็บ
  display: "swap",
});

const SITE_NAME = "SUNNAKHON GROUP";
const TITLE = "SUNNAKHON GROUP | Event, Live Commerce & Production ครบวงจร";
const DESCRIPTION =
  "รับจัดงานประกวด คอนเสิร์ต งานนักศึกษา ไลฟ์สดขายสินค้า วิดีโอโปรดักชัน และกราฟิก/Motion Graphics ประสบการณ์กว่า 4 ปี";

export const viewport: Viewport = {
  themeColor: "#cc0000",
  width: "device-width",
  initialScale: 1,
};

// รูปตัวอย่างตอนแชร์ (og:image / twitter:image) มาจาก src/app/opengraph-image.png และ twitter-image.png อัตโนมัติ
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: TITLE, template: "%s | SUNNAKHON GROUP" },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "SUNNAKHON GROUP",
    "ซันนคร กรุ๊ป",
    "รับจัดอีเวนต์",
    "Event Organizer",
    "Live Commerce",
    "ไลฟ์สดขายสินค้า",
    "Video Production",
    "ตัดต่อวิดีโอ",
    "Motion Graphics",
    "ออกแบบกราฟิก",
    "งานประกวด",
    "คอนเสิร์ต",
    "งานนักศึกษา",
    "teamsunnakhon",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  formatDetection: { telephone: true, email: false, address: false },
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: SITE_NAME,
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${prompt.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
