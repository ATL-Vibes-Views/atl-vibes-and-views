"use client";

import { useState, useRef, useEffect } from "react";
import type { NeighborhoodGrouped } from "@/lib/types";

interface NeighborhoodSelectProps {
  groups: NeighborhoodGrouped[];
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
}

export function NeighborhoodSelect({
  groups,
  value,
  onChange,
  required,
}: NeighborhoodSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Resolve selected name */
  const selectedName = (() => {
    for (const g of groups) {
      const n = g.neighborhoods.find((n) => n.id === value);
      if (n) return `${n.name} (${g.area_name})`;
    }
    return "";
  })();

  /* Close on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Filter */
  const term = search.toLowerCase();
  const filtered = groups
    .map((g) => ({
      ...g,
      neighborhoods: g.neighborhoods.filter((n) =>
        n.name.toLowerCase().includes(term)
      ),
    }))
    .filter((g) => g.neighborhoods.length > 0);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={open ? search : selectedName}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setSearch("");
          }}
          placeholder="Search neighborhoods…"
          required={required && !value}
          className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors pr-10"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSearch("");
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid hover:text-black text-sm"
          >
            ✕
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-mid">
              No neighborhoods found
            </div>
          ) : (
            filtered.map((g) => (
              <div key={g.area_slug}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-mid uppercase tracking-eyebrow bg-gray-50 sticky top-0">
                  {g.area_name}
                </div>
                {g.neighborhoods.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      onChange(n.id);
                      setSearch("");
                      setOpen(false);
                    }}
                    className={`w-full text-left px-6 py-2 text-sm hover:bg-[#f8f5f0] transition-colors ${
                      n.id === value ? "bg-[#f8f5f0] font-medium" : ""
                    }`}
                  >
                    {n.name}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
