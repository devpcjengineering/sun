import { Phone } from "lucide-react";
import { LineIcon } from "./brand-icons";

/** ปุ่มลอย LINE / โทร ทุกหน้า */
export default function FloatingContact({ phone, lineUrl }: { phone: string; lineUrl: string }) {
  return (
    <div className="fixed bottom-5 right-4 z-30 flex flex-col gap-3 sm:bottom-6 sm:right-6">
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ติดต่อผ่าน LINE"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#06c755] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06c755]"
      >
        <LineIcon className="h-7 w-7" />
      </a>
      <a
        href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
        aria-label={`โทร ${phone}`}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Phone className="h-6 w-6" aria-hidden="true" />
      </a>
    </div>
  );
}
