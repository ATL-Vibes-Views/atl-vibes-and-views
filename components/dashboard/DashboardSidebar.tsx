"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Award,
  Store,
  Calendar,
  Newspaper,
  Star,
  BarChart3,
  CreditCard,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { TierBadge, type BusinessState } from "./TierBadge";

interface DashboardSidebarProps {
  businessName: string;
  businessState: BusinessState;
  isActive: boolean;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: (NavItem | "separator")[] = [
  { label: "Overview", path: "/dashboard", icon: <LayoutDashboard size={16} /> },
  { label: "My Sponsorship", path: "/dashboard/sponsorship", icon: <Award size={16} /> },
  "separator",
  { label: "My Listing", path: "/dashboard/listing", icon: <Store size={16} /> },
  { label: "My Events", path: "/dashboard/events", icon: <Calendar size={16} /> },
  { label: "Press & Stories", path: "/dashboard/stories", icon: <Newspaper size={16} /> },
  { label: "Reviews", path: "/dashboard/reviews", icon: <Star size={16} /> },
  "separator",
  { label: "Analytics", path: "/dashboard/analytics", icon: <BarChart3 size={16} /> },
  { label: "Plan & Billing", path: "/dashboard/billing", icon: <CreditCard size={16} /> },
  { label: "Settings", path: "/dashboard/settings", icon: <Settings size={16} /> },
];

export function DashboardSidebar({
  businessName,
  businessState,
  isActive,
}: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const allNavPaths = useMemo(
    () =>
      navItems
        .filter((item): item is NavItem => item !== "separator")
        .map((item) => item.path),
    []
  );

  return (
    <>
      {/* Mobile header */}
      <div className="bg-white border-b border-[#e5e5e5] fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 py-3 min-[900px]:hidden">
        <span className="font-display text-[15px] font-bold text-[#1a1a1a]">
          ATL Vibes &amp; Views
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#1a1a1a]"
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
          "bg-white border-r border-[#e5e5e5]",
          "w-[240px] fixed top-0 left-0 h-screen flex flex-col z-[80]",
          "transition-transform duration-200",
          "max-[899px]:w-[280px]",
          mobileOpen
            ? "max-[899px]:translate-x-0"
            : "max-[899px]:-translate-x-full",
          "min-[900px]:translate-x-0",
        ].join(" ")}
      >
        {/* Brand header */}
        <div className="px-5 pt-6 pb-5 border-b border-[#e5e5e5]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-[17px] font-bold text-[#1a1a1a]">
                ATL Vibes &amp; Views
              </div>
              <div className="text-[10px] uppercase tracking-[1.5px] text-[#6b7280] mt-0.5">
                BUSINESS PORTAL
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="min-[900px]:hidden text-[#1a1a1a]"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Business card */}
        <div className="mx-4 mt-4 mb-3 border border-[#e5e5e5] bg-[#f5f5f5] px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-[#1a1a1a]">
              {businessName}
            </span>
            {isActive && (
              <span className="inline-block h-2 w-2 rounded-full bg-[#16a34a] flex-shrink-0" />
            )}
          </div>
          <div className="mt-1.5">
            <TierBadge state={businessState} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item, i) => {
            if (item === "separator") {
              return (
                <div
                  key={`sep-${i}`}
                  className="my-2 mx-5 border-t border-[#e5e5e5]"
                />
              );
            }

            const exactMatch = pathname === item.path;
            const prefixMatch = pathname.startsWith(item.path + "/");
            const moreSpecificExists =
              prefixMatch &&
              allNavPaths.some(
                (p) =>
                  p !== item.path &&
                  p.startsWith(item.path + "/") &&
                  (pathname === p || pathname.startsWith(p + "/"))
              );
            const isItemActive =
              exactMatch || (prefixMatch && !moreSpecificExists);

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={[
                  "flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium transition-colors",
                  isItemActive
                    ? "bg-[#fee198] text-[#1a1a1a] font-semibold border-l-[3px] border-[#1a1a1a]"
                    : "text-[#6b7280] border-l-[3px] border-transparent hover:bg-[#f5f5f5] hover:text-[#1a1a1a]",
                ].join(" ")}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
