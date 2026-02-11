"use client";

import { useState } from "react";

/* ============================================================
   PartnerFAQ — Accordion FAQ for /partner/* pages
   ============================================================ */

interface FAQItem {
  question: string;
  answer: string;
}

interface PartnerFAQProps {
  title?: string;
  items: FAQItem[];
}

export function PartnerFAQ({ title = "Questions? We\u2019ve Got Answers.", items }: PartnerFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-24 bg-[#f8f8f8]">
      <div className="site-container">
        <h2 className="font-display text-section-sm md:text-section font-semibold text-black text-center mb-12">
          {title}
        </h2>
        <div className="max-w-[800px] mx-auto">
          {items.map((item, i) => (
            <div key={i} className="border-b border-gray-200">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left py-6 flex justify-between items-center font-display text-xl md:text-card font-semibold text-black hover:text-[#c1121f] transition-colors"
              >
                <span>{item.question}</span>
                <span
                  className={`text-2xl font-light transition-transform duration-300 ml-4 shrink-0 ${
                    openIndex === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-[300px] pb-6" : "max-h-0"
                }`}
              >
                <p className="text-base text-gray-mid leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
