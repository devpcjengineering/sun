import Link from "next/link";
import { cloudinaryLoader, isCloudinaryUrl } from "@/lib/cloudinary-loader";
import type { Client } from "@/lib/types";
import { ButtonLink, SectionHeading } from "./ui";

/**
 * โลโก้ในแถบไหลเป็น <img> ธรรมดา ชี้ URL เดียว (กว้าง 2 เท่าของที่แสดง) — ไม่มี srcset ต่อรูป
 * HTML จึงเล็กลงมากเมื่อมีลูกค้าเยอะ (แถบมีสำเนาอีกชุดเพื่อให้วนต่อเนื่อง) ; เบราว์เซอร์แคช URL ซ้ำให้เอง
 */
function LogoImg({ url, alt }: { url: string; alt: string }) {
  const src = isCloudinaryUrl(url) ? cloudinaryLoader({ src: url, width: 352, quality: 80 }) : url;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={176}
      height={64}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-contain"
    />
  );
}

function Logo({ client }: { client: Client }) {
  const img = (
    <span className="relative block h-14 w-36 sm:h-16 sm:w-44">
      <LogoImg url={client.logo_url} alt={client.name} />
    </span>
  );
  if (client.slug) {
    return (
      <Link
        href={`/customers/${encodeURIComponent(client.slug)}`}
        className="group block px-6 sm:px-9"
        aria-label={client.name}
      >
        {img}
      </Link>
    );
  }
  return client.website_url ? (
    <a
      href={client.website_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block px-6 sm:px-9"
      aria-label={client.name}
    >
      {img}
    </a>
  ) : (
    <div className="group px-6 sm:px-9">{img}</div>
  );
}

/** ส่วนที่ 3: ลูกค้าที่เคยร่วมงาน — โลโก้วิ่งไปทางซ้าย (ซ่อนทั้งส่วนถ้าไม่มีลูกค้า) */
export default function ClientMarquee({ clients }: { clients: Client[] }) {
  if (!clients.length) return null;

  // ทำให้แต่ละครึ่งของ track กว้างพอเต็มจอ แล้วคัดลอกอีกชุดเพื่อให้วนไม่สะดุด (animation เลื่อน -50%)
  const repeat = Math.max(1, Math.ceil(10 / clients.length));
  const half = Array.from({ length: repeat }, () => clients).flat();

  return (
    <section className="border-y border-line bg-white py-14 sm:py-20" aria-labelledby="clients-heading">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div id="clients-heading">
          <SectionHeading eyebrow="Our Clients" title="ลูกค้าที่เคยร่วมงาน" center />
        </div>
      </div>
      <div
        className="marquee mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
      >
        <div className="marquee-track items-center" style={{ animationDuration: `${Math.max(25, half.length * 3.5)}s` }}>
          {half.map((c, i) => (
            <Logo key={`a-${c.id}-${i}`} client={c} />
          ))}
          <div className="marquee-dup contents" aria-hidden="true">
            {half.map((c, i) => (
              <div key={`b-${c.id}-${i}`} className="group px-6 sm:px-9">
                <span className="relative block h-14 w-36 sm:h-16 sm:w-44">
                  <LogoImg url={c.logo_url} alt="" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 flex justify-center px-5">
        <ButtonLink href="/customers" variant="outline" arrow>
          ดูลูกค้าทั้งหมด
        </ButtonLink>
      </div>
    </section>
  );
}
