"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, X } from "lucide-react";

/**
 * SearchBar — works on every page.
 * Pushes ?q=<term> to the current URL so the server component
 * can read searchParams and filter its queries.
 */
export function SearchBar({
  placeholder = "Search…",
  className = "",
}: {
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const [value, setValue] = useState(currentQ);

  const pushSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term.trim()) {
        params.set("q", term.trim());
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className={`relative w-full max-w-xl ${className}`}>
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-mid pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") pushSearch(value);
        }}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 text-sm bg-white border border-gray-200 rounded-full outline-none focus:border-[#e6c46d] transition-colors placeholder:text-gray-mid"
      />
      {value && (
        <button
          onClick={() => {
            setValue("");
            pushSearch("");
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-mid hover:text-black"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
      {isPending && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#e6c46d] border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
}
