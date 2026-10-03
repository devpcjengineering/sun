import { ButtonLink, Container } from "./ui";

export default function NotFoundContent() {
  return (
    <section className="relative overflow-hidden bg-white">
      <Container className="relative py-24 text-center sm:py-36">
        <p className="text-8xl font-extrabold leading-none text-brand sm:text-9xl">404</p>
        <h1 className="mt-6 text-3xl font-bold text-ink sm:text-4xl">ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          หน้านี้อาจถูกย้ายหรือลบไปแล้ว ลองกลับไปหน้าแรก หรือดูผลงานของเรา
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" arrow>
            กลับหน้าแรก
          </ButtonLink>
          <ButtonLink href="/portfolio" variant="outline">
            ผลงานของเรา
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
