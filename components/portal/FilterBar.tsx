"use client";

import { Search } from "lucide-react";

interface FilterConfig {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  onFilterChange: (key: string, value: string) => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  action?: React.ReactNode;
}

export function FilterBar({
  filters,
  onFilterChange,
  searchPlaceholder = "Search...",
  onSearch,
  action,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
      {/* Search */}
      {onSearch && (
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b7280]"
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-8 pr-3 py-[7px] text-[12px] font-body border border-[#e5e5e5] rounded focus:border-[#e6c46d] focus:ring-2 focus:ring-[#fee198]/30 focus:outline-none transition-colors"
          />
        </div>
      )}

      {/* Filter selects */}
      {filters.map((filter) => (
        <select
          key={filter.key}
          value={filter.value}
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
          className="px-3 py-[7px] text-[12px] font-body border border-[#e5e5e5] rounded focus:border-[#e6c46d] focus:ring-2 focus:ring-[#fee198]/30 focus:outline-none transition-colors"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {/* Action button slot */}
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}
