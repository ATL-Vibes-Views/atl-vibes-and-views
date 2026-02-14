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

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: "bg-[#dcfce7] text-[#16a34a]",
  gold: "bg-[#fee198] text-[#1a1a1a]",
  red: "bg-[#fee2e2] text-[#c1121f]",
  blue: "bg-[#dbeafe] text-[#2563eb]",
  yellow: "bg-[#fef3c7] text-[#b45309]",
  gray: "bg-[#f5f5f5] text-[#6b7280]",
  purple: "bg-[#f3e8ff] text-[#7c3aed]",
  orange: "bg-[#fff7ed] text-[#c2410c]",
  teal: "bg-[#ccfbf1] text-[#0d9488]",
};

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
