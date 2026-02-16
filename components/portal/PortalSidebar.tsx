"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  count?: number;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

interface PortalSidebarProps {
  theme: "light" | "dark";
  brandLabel: string;
  subLabel: string;
  navGroups: NavGroup[];
  activePath: string;
  businessCard?: {
    name: string;
    status: string;
    tier: string;
  };
}

export function PortalSidebar({
  theme,
  brandLabel,
  subLabel,
  navGroups,
  activePath,
  businessCard,
}: PortalSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isLight = theme === "light";

  // Collect all nav paths for precise active detection
  const allNavPaths = useMemo(
    () => navGroups.flatMap((g) => g.items.map((i) => i.path)),
    [navGroups]
  );

  const sidebarWidth = isLight ? "w-[260px]" : "w-[240px]";

  const sidebarBg = isLight ? "bg-white border-r border-[#e5e5e5]" : "bg-[#1a1a1a]";

  const brandClass = isLight
    ? "font-display text-[17px] font-bold text-black"
    : "font-display text-[16px] font-bold text-white";

  const subLabelClass = isLight
    ? "text-[10px] uppercase tracking-[1.5px] text-[#6b7280]"
    : "text-[9px] uppercase tracking-[1.5px] text-[#fee198]";

  const mobileHeaderBg = isLight ? "bg-white border-b border-[#e5e5e5]" : "bg-black";
  const mobileHeaderText = isLight ? "text-black" : "text-white";

  return (
    <>
      {/* Mobile header — visible below 900px */}
      <div
        className={`${mobileHeaderBg} fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-3 py-3 min-[900px]:hidden`}
      >
        <span className={`font-display text-[15px] font-bold ${mobileHeaderText}`}>
          {brandLabel}
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={mobileHeaderText}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/50 min-[900px]:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          sidebarBg,
          sidebarWidth,
          "fixed top-0 left-0 h-screen flex flex-col z-[80]",
          "transition-transform duration-200",
          "max-[899px]:w-[280px]",
          mobileOpen ? "max-[899px]:translate-x-0" : "max-[899px]:-translate-x-full",
          "min-[900px]:translate-x-0",
        ].join(" ")}
      >
        {/* Brand header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className={brandClass}>{brandLabel}</div>
              <div className={`${subLabelClass} mt-0.5`}>{subLabel}</div>
            </div>
            {/* Close button on mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className={`min-[900px]:hidden ${isLight ? "text-black" : "text-white"}`}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Business card — client portal only */}
        {isLight && businessCard && (
          <div className="mx-4 mb-3 rounded-none border border-[#e5e5e5] bg-[#f5f5f5] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-black">
                {businessCard.name}
              </span>
              <span className="inline-block h-2 w-2 rounded-full bg-[#16a34a]" />
            </div>
            <span className="inline-flex items-center mt-1 rounded-full bg-[#fee198] px-2 py-0.5 text-[10px] font-semibold text-[#1a1a1a]">
              {businessCard.tier}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {navGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-4" : ""}>
              {/* Group label — admin dark theme only */}
              {group.label && !isLight && (
                <div className="px-3 mb-1.5 text-[9px] uppercase tracking-[1.5px] text-white/[0.35]">
                  {group.label}
                </div>
              )}

              {group.items.map((item) => {
                // Exact match always wins. Only use startsWith if no more-specific
                // nav item also matches (prevents double-highlight on nested routes).
                const exactMatch = pathname === item.path;
                const prefixMatch = pathname.startsWith(item.path + "/");
                const moreSpecificExists = prefixMatch && allNavPaths.some(
                  (p) => p !== item.path && p.startsWith(item.path + "/") && (pathname === p || pathname.startsWith(p + "/"))
                );
                const isActive = exactMatch || (prefixMatch && !moreSpecificExists);

                const itemBase = isLight
                  ? "flex items-center gap-2.5 px-3 py-2 text-[13px] font-body border-l-[3px] transition-colors"
                  : "flex items-center gap-2.5 px-3 py-1.5 text-[12px] font-body border-l-[3px] transition-colors";

                const itemColors = isLight
                  ? isActive
                    ? "bg-[#fee198] text-black font-bold border-black"
                    : "text-[#6b7280] border-transparent hover:bg-[#f5f5f5] hover:text-black"
                  : isActive
                    ? "bg-[#fee198] text-black font-bold border-black"
                    : "text-white/[0.6] border-transparent hover:bg-white/[0.08] hover:text-white";

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`${itemBase} ${itemColors}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.count !== undefined && !isLight && (
                      <span className="rounded-full bg-white/[0.15] px-2 py-0.5 text-[10px] text-white/[0.7]">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
