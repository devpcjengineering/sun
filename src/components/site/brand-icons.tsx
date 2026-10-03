// ไอคอนแบรนด์ (lucide v1 ไม่มีไอคอนแบรนด์)
type P = { className?: string };

export function FacebookIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.9.4-1.7 1.8-1.7h1.6V3.8c-.3 0-1.3-.2-2.5-.2-2.6 0-4.3 1.6-4.3 4.4v2.5H7.3v3.3h2.8V22h3.4z" />
    </svg>
  );
}

export function LineIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5C6.8 2.5 2.6 5.9 2.6 10.1c0 3.7 3.3 6.8 7.7 7.4.3.1.7.2.8.5.1.3 0 .7 0 1l-.1.9c0 .3-.2 1 .9.5s5.9-3.5 8-6c1.5-1.6 2.2-3.2 2.2-5.1 0-4.2-4.2-7.6-9.4-7.6zM8.3 12.8H6.1a.4.4 0 0 1-.4-.4V8.6c0-.2.2-.4.4-.4s.4.2.4.4V12h1.8c.2 0 .4.2.4.4s-.2.4-.4.4zm1.8-.4c0 .2-.2.4-.4.4s-.4-.2-.4-.4V8.6c0-.2.2-.4.4-.4s.4.2.4.4v3.8zm4.3 0c0 .2-.1.3-.3.4h-.1c-.1 0-.2-.1-.3-.2l-1.8-2.4v2.2c0 .2-.2.4-.4.4s-.4-.2-.4-.4V8.6c0-.2.1-.3.3-.4h.1c.1 0 .2.1.3.2l1.8 2.4V8.6c0-.2.2-.4.4-.4s.4.2.4.4v3.8zm3.2-2.4c.2 0 .4.2.4.4s-.2.4-.4.4h-1.5v.9h1.5c.2 0 .4.2.4.4s-.2.4-.4.4h-1.9a.4.4 0 0 1-.4-.4V8.6c0-.2.2-.4.4-.4h1.9c.2 0 .4.2.4.4s-.2.4-.4.4h-1.5v.9h1.5z" />
    </svg>
  );
}

export function InstagramIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8C22 15.2 22 12 22 12s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" />
    </svg>
  );
}

export function TiktokIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 3c.3 2.4 1.7 3.9 4 4v3.1c-1.4.1-2.7-.3-4-1.1v6.1c0 3.9-3.2 6.4-6.6 5.8-2.7-.5-4.6-2.9-4.4-5.7.2-3 2.8-5.2 5.8-4.9v3.2c-1.5-.3-2.8.8-2.8 2.2 0 1.4 1.1 2.4 2.5 2.3 1.2-.1 2.1-1 2.1-2.3V3h3.4z" />
    </svg>
  );
}
