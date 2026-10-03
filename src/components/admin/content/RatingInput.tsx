"use client";
import { useState } from "react";
import { Star } from "lucide-react";

/** เลือกคะแนน 1–5 ดาว (ส่งค่าผ่าน hidden input ชื่อ name) */
export function RatingInput({ name = "rating", defaultValue = 5 }: { name?: string; defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="คะแนน">
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ดาว`}
          onClick={() => setValue(n)}
          className="rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          <Star className={`size-7 transition ${n <= value ? "fill-brand text-brand" : "text-black/20"}`} aria-hidden />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted">{value}/5</span>
    </div>
  );
}
