"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";

export interface PostPickerPost {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  featured_image_url: string | null;
}

interface PostPickerProps {
  value: { id: string; title: string } | null;
  onChange: (post: { id: string; title: string } | null) => void;
}

export function PostPicker({ value, onChange }: PostPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostPickerPost[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: "published", limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/posts?${params}`);
      const data: PostPickerPost[] = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPosts(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, open, fetchPosts]);

  /* Close on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (value) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 border border-[#e5e5e5] bg-[#f9f9f9] text-[13px]">
        <span className="flex-1 truncate text-black font-medium">{value.title}</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[#6b7280] hover:text-black transition-colors flex-shrink-0"
          aria-label="Clear selected post"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search published posts…"
          className="w-full pl-8 pr-3 py-2.5 text-[14px] font-body border border-[#e5e5e5] focus:border-[#e6c46d] focus:ring-2 focus:ring-[#fee198]/30 focus:outline-none transition-colors"
        />
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#e5e5e5] shadow-lg max-h-60 overflow-y-auto">
          {loading && (
            <div className="px-3 py-2 text-[12px] text-[#9ca3af]">Loading…</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-[12px] text-[#9ca3af]">No posts found</div>
          )}
          {!loading && results.map((post) => (
            <button
              key={post.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange({ id: post.id, title: post.title });
                setQuery("");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-[#fef9ec] transition-colors border-b border-[#f3f4f6] last:border-0"
            >
              <div className="text-[13px] font-medium text-black truncate">{post.title}</div>
              {post.published_at && (
                <div className="text-[11px] text-[#9ca3af] mt-0.5">
                  {new Date(post.published_at).toLocaleDateString()}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
