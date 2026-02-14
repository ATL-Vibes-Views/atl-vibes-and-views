"use client";

import Link from "next/link";

interface MobileNavProps {
  items: { label: string; path: string; isActive: boolean }[];
}

export function MobileNav({ items }: MobileNavProps) {
  return (
    <nav className="sticky top-[48px] z-40 bg-white border-b border-[#e5e5e5] min-[900px]:hidden overflow-x-auto whitespace-nowrap">
      <div className="flex px-3 gap-1">
        {items.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={[
              "inline-block px-3 py-2.5 text-[10px] uppercase tracking-[1px] font-semibold transition-colors",
              item.isActive
                ? "text-black border-b-2 border-black"
                : "text-[#6b7280] border-b-2 border-transparent hover:text-black",
            ].join(" ")}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
