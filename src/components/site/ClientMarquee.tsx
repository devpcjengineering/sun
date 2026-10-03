import type { Client } from "@/lib/types";
import SmartImage from "./SmartImage";
import { SectionHeading } from "./ui";

function Logo({ client }: { client: Client }) {
  const img = (
    <span className="relative block h-14 w-36 sm:h-16 sm:w-44">
      <SmartImage
        src={client.logo_url}
        alt={client.name}
        sizes="176px"
        className="object-contain opacity-60 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
      />
    </span>
  );
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
        className="marquee mt-10 overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
      >
        <div className="marquee-track items-center" style={{ animationDuration: `${Math.max(25, half.length * 3.5)}s` }}>
          {half.map((c, i) => (
            <Logo key={`a-${c.id}-${i}`} client={c} />
          ))}
          <div className="contents" aria-hidden="true">
            {half.map((c, i) => (
              <div key={`b-${c.id}-${i}`} className="group px-6 sm:px-9">
                <span className="relative block h-14 w-36 sm:h-16 sm:w-44">
                  <SmartImage
                    src={c.logo_url}
                    alt=""
                    sizes="176px"
                    className="object-contain opacity-60 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
