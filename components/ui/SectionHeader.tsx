import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  count?: number;
  countNoun?: [string, string];
  action?: { label: string; href: string };
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  count,
  countNoun,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-end justify-between border-b border-gray-200 pb-4 mb-8 ${className}`}
    >
      <div>
        {eyebrow && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-red-brand">
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight mt-1">
          {title}
        </h2>
      </div>
      {count !== undefined && countNoun && (
        <span className="text-xs text-gray-mid pb-1">
          {count} {count === 1 ? countNoun[0] : countNoun[1]}
        </span>
      )}
      {action && (
        <Link
          href={action.href}
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-eyebrow text-black hover:text-red-brand transition-colors shrink-0 pb-1"
        >
          {action.label} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
