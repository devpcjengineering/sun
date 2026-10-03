import { Check } from "lucide-react";
import type { Package } from "@/lib/types";
import { ButtonLink } from "./ui";

export default function PackageCard({ pkg }: { pkg: Package }) {
  const hi = pkg.highlight;
  return (
    <div
      className={`relative flex h-full flex-col rounded-3xl p-8 transition duration-300 hover:-translate-y-1 ${
        hi ? "bg-ink text-white shadow-2xl shadow-black/20 ring-2 ring-brand" : "border border-line bg-white text-ink"
      }`}
    >
      {hi && (
        <span className="absolute -top-3 left-8 rounded-full bg-brand px-4 py-1 text-xs font-bold text-white">
          แนะนำ
        </span>
      )}
      <h3 className="text-xl font-bold">{pkg.name}</h3>
      {pkg.description && (
        <p className={`mt-2 text-sm leading-relaxed ${hi ? "text-white/70" : "text-muted"}`}>{pkg.description}</p>
      )}
      <div className="mt-6">
        <p className={`text-3xl font-extrabold tracking-tight ${hi ? "text-white" : "text-ink"}`}>{pkg.price_text}</p>
        {pkg.price_note && <p className={`mt-1 text-sm ${hi ? "text-white/60" : "text-muted"}`}>{pkg.price_note}</p>}
      </div>
      <ul className="mt-6 flex-1 space-y-3 border-t border-current/10 pt-6">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            <span className={hi ? "text-white/90" : "text-ink"}>{f}</span>
          </li>
        ))}
      </ul>
      <ButtonLink href="/contact" variant={hi ? "primary" : "outline"} arrow className="mt-8 w-full">
        {pkg.cta_label || "ติดต่อเรา"}
      </ButtonLink>
    </div>
  );
}
