import Link from "next/link";
import { Lock } from "lucide-react";

interface LockedStatCardProps {
  eyebrow: string;
  value: string;
  subtitle: string;
  linkHref: string;
  linkText: string;
}

export function LockedStatCard({
  eyebrow,
  value,
  subtitle,
  linkHref,
  linkText,
}: LockedStatCardProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] p-5 relative">
      <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6b7280]">
        {eyebrow}
      </div>
      <div
        className="mt-2 font-display text-[32px] font-bold text-black select-none"
        style={{ filter: "blur(6px)" }}
      >
        {value}
      </div>
      <div
        className="mt-1 text-[12px] text-[#6b7280] select-none"
        style={{ filter: "blur(6px)" }}
      >
        {subtitle}
      </div>
      <div className="absolute inset-0 bg-white/70 z-[2] flex flex-col items-center justify-center">
        <Lock size={20} className="text-[#9ca3af] mb-1" />
        <Link
          href={linkHref}
          className="text-[11px] font-semibold text-[#c1121f] hover:underline"
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
}
