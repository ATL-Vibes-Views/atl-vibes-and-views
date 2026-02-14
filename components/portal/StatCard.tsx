import { StatusBadge } from "./StatusBadge";

type BadgeVariant =
  | "green"
  | "gold"
  | "red"
  | "blue"
  | "yellow"
  | "gray"
  | "purple"
  | "orange"
  | "teal";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  badge?: { text: string; variant: BadgeVariant };
  trend?: { value: string; direction: "up" | "down" };
}

export function StatCard({ label, value, subtitle, badge, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] p-5">
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280]">
          {label}
        </span>
        {badge && (
          <StatusBadge variant={badge.variant}>{badge.text}</StatusBadge>
        )}
      </div>
      <div className="mt-2 font-display text-[28px] font-bold text-black">
        {value}
      </div>
      {(subtitle || trend) && (
        <div className="mt-1 flex items-center gap-2">
          {subtitle && (
            <span className="text-[12px] text-[#6b7280]">{subtitle}</span>
          )}
          {trend && (
            <span
              className={`text-[12px] font-semibold ${
                trend.direction === "up" ? "text-[#16a34a]" : "text-[#c1121f]"
              }`}
            >
              {trend.direction === "up" ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
