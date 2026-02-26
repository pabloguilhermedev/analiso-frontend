"use client";

import { Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Testimonial } from "../../data/landing";

interface TestimonialsClientProps {
  testimonials: Testimonial[];
}

export function TestimonialsClient({ testimonials }: TestimonialsClientProps) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      setActiveTestimonial((current) => {
        if (event.key === "ArrowRight") {
          return (current + 1) % testimonials.length;
        }
        return (current - 1 + testimonials.length) % testimonials.length;
      });
    },
    [testimonials.length],
  );

  const current = testimonials[activeTestimonial];

  return (
    <section className="bg-[#F4F6F9] px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto w-full max-w-[1200px] text-center" onKeyDown={onKeyDown}>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#6B7280]">
          <Sparkles className="h-3.5 w-3.5 text-[#0E9384]" />
          O que dizem os usuários
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-[-0.01em] text-[#0F0F14] md:text-5xl">Quando o dia finalmente faz sentido.</h2>

        <article className="mx-auto mt-10 max-w-[640px] rounded-[20px] border border-[#E8EAED] bg-white p-8 text-left shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
          <p className="text-base italic leading-[1.7] text-[#111827]">“{current.quote}”</p>
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E7EB] text-sm font-semibold text-[#111827]">
              {current.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#111827]">{current.name}</p>
              <p className="text-xs text-[#6B7280]">{current.role}</p>
            </div>
          </div>
        </article>

        <div className="mt-6 flex items-center justify-center gap-2" role="tablist" aria-label="Depoimentos">
          {testimonials.map((_, idx) => (
            <button
              key={`testimonial-dot-${idx}`}
              type="button"
              aria-label={`Ver depoimento ${idx + 1}`}
              aria-pressed={activeTestimonial === idx}
              onClick={() => setActiveTestimonial(idx)}
              className={`rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2 ${
                activeTestimonial === idx ? "h-2 w-2 bg-[#0E9384]" : "h-1.5 w-1.5 bg-[#D1D5DB]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
