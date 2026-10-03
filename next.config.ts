import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/next-image-loader.ts",
    formats: ["image/avif", "image/webp"],
    // ลดจำนวนขนาดที่สร้างใน srcset (ค่าเริ่มต้น 16 ขนาด) — ช่วยให้ HTML เล็กลงมาก
    deviceSizes: [640, 960, 1280, 1920],
    imageSizes: [96, 192, 384],
  },
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
