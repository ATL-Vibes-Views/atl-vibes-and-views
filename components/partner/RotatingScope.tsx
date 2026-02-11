"use client";

import { useEffect, useState } from "react";

const WORDS = [
  "Local Businesses",
  "Founders & Creators",
  "Neighborhoods",
  "Events & Experiences",
  "City Culture",
  "Community Impact",
];

export function RotatingScope() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length);
        setFading(false);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`font-display text-[40px] md:text-[64px] font-semibold text-[#c1121f] transition-opacity duration-500 block mb-6 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      {WORDS[index]}
    </span>
  );
}
