import { ClipboardList, Hammer, MessagesSquare, PartyPopper } from "lucide-react";
import Reveal from "./Reveal";
import { Container, SectionHeading } from "./ui";

const STEPS = [
  {
    icon: MessagesSquare,
    title: "คุยโจทย์และไอเดีย",
    text: "ทีมงานรับฟังเป้าหมาย งบประมาณ และรูปแบบงาน ทั้งอีเวนต์ ไลฟ์สด หรือโปรดักชัน พร้อมให้คำปรึกษาฟรี",
  },
  {
    icon: ClipboardList,
    title: "วางแผนและเสนอคอนเซ็ปต์",
    text: "สรุปคอนเซ็ปต์ ไทม์ไลน์ สคริปต์ และใบเสนอราคาที่ชัดเจน จัดหา Supplier และสถานที่ให้ครบ",
  },
  {
    icon: Hammer,
    title: "ลงมือผลิตและเตรียมงาน",
    text: "ถ่ายทำ ออกแบบกราฟิก ตัดต่อ ตั้งสตูดิโอไลฟ์ และซักซ้อมทีม เพื่อให้ทุกอย่างพร้อมก่อนวันจริง",
  },
  {
    icon: PartyPopper,
    title: "หน้างานและส่งมอบผลงาน",
    text: "ทีมดูแลหน้างานตลอดการจัดงาน/ไลฟ์ และส่งมอบไฟล์งาน รายงานสรุปผล พร้อมแก้ไขตามที่ตกลง",
  },
];

export default function Process() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="process-heading">
      <Container>
        <div id="process-heading">
          <SectionHeading
            eyebrow="How we work"
            title="ขั้นตอนการทำงานของเรา"
            text="ง่าย ชัดเจน และมีทีมดูแลตั้งแต่ต้นจนจบ"
            center
          />
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 100} className="h-full">
                <div className="group relative h-full rounded-3xl border border-line bg-white p-7 transition duration-300 hover:border-brand hover:shadow-lg">
                  <span className="absolute right-6 top-4 text-6xl font-extrabold text-soft transition-colors group-hover:text-brand/10" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white transition-colors group-hover:bg-brand">
                    <s.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="relative mt-5 text-lg font-bold text-ink">
                    <span className="sr-only">ขั้นตอนที่ {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
