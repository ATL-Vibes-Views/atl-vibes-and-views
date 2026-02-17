"use client";

import { useState, useMemo } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPostEntry {
  id: string;
  title: string;
  slug: string | null;
  featured_image_url: string | null;
  excerpt: string | null;
  published_at: string;
  status: string;
}

interface ScriptEntry {
  id: string;
  title: string;
  platform: string | null;
  scheduled_date: string | null;
  status: string;
  media_url: string | null;
  platform_captions: Record<string, unknown> | null;
  posted_at: string | null;
}

interface NewsletterEntry {
  id: string;
  subject: string;
  scheduled_send_date: string | null;
  status: string;
}

interface CalendarClientProps {
  blogPosts: BlogPostEntry[];
  scripts: ScriptEntry[];
  newsletters: NewsletterEntry[];
}

type CalendarItem = {
  id: string;
  label: string;
  type: "post" | "script" | "newsletter";
  tier?: string | null;
  status?: string | null;
  platform?: string | null;
  date?: string;
  slug?: string | null;
  postId?: string | null;
  storyId?: string | null;
  imageUrl?: string | null;
  caption?: string | null;
  postedAt?: string | null;
};

type ViewMode = "daily" | "weekly" | "monthly";
type ChannelFilter = "" | "website" | "newsletter" | "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin" | "x";

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  post: { bg: "bg-[#dbeafe]", text: "text-[#1e40af]", border: "border-[#93c5fd]" },
  script: { bg: "bg-[#ffedd5]", text: "text-[#9a3412]", border: "border-[#fdba74]" },
  newsletter: { bg: "bg-[#ede9fe]", text: "text-[#5b21b6]", border: "border-[#c4b5fd]" },
};

const LEGEND = [
  { type: "post", label: "Blog Post" },
  { type: "script", label: "Script" },
  { type: "newsletter", label: "Newsletter" },
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CHANNEL_OPTIONS: { value: ChannelFilter; label: string }[] = [
  { value: "", label: "All Channels" },
  { value: "website", label: "Website" },
  { value: "newsletter", label: "Newsletter" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function buildItemsForDates(
  dateKeys: Set<string>,
  blogPosts: BlogPostEntry[],
  scripts: ScriptEntry[],
  newsletters: NewsletterEntry[],
  channelFilter: ChannelFilter,
): Record<string, CalendarItem[]> {
  const map: Record<string, CalendarItem[]> = {};

  for (const key of dateKeys) {
    map[key] = [];
  }

  // Channel filter logic:
  //   "" (All Channels) → show everything
  //   "website"          → blog posts only
  //   "newsletter"       → newsletters only
  //   platform name      → scripts with that platform only
  const isPlatformFilter = !["", "website", "newsletter"].includes(channelFilter);
  const showBlogPosts = channelFilter === "" || channelFilter === "website";
  const showScripts = channelFilter === "" || isPlatformFilter;
  const showNewsletters = channelFilter === "" || channelFilter === "newsletter";

  if (showBlogPosts) {
    for (const post of blogPosts) {
      const key = post.published_at.split("T")[0];
      if (!map[key]) continue;
      map[key].push({
        id: post.id,
        label: post.title,
        type: "post",
        status: post.status,
        date: key,
        slug: post.slug,
        postId: post.id,
        imageUrl: post.featured_image_url,
        caption: post.excerpt,
        postedAt: post.published_at,
      });
    }
  }

  if (showScripts) {
    for (const script of scripts) {
      // Use posted_at first, fall back to scheduled_date
      const rawDate = script.posted_at ?? script.scheduled_date;
      if (!rawDate) continue;
      const key = rawDate.split("T")[0];
      if (!map[key]) continue;
      if (isPlatformFilter && (script.platform ?? "").toLowerCase() !== channelFilter) {
        continue;
      }
      // Extract caption from platform_captions JSONB
      const pc = script.platform_captions;
      const platformKey = (script.platform ?? "").toLowerCase();
      const pcData = pc && typeof pc[platformKey] === "object" ? (pc[platformKey] as Record<string, string>) : null;

      map[key].push({
        id: script.id,
        label: script.title,
        type: "script",
        status: script.status,
        platform: script.platform,
        date: key,
        imageUrl: script.media_url,
        caption: pcData?.caption ?? pcData?.description ?? null,
        postedAt: script.posted_at,
      });
    }
  }

  if (showNewsletters) {
    for (const nl of newsletters) {
      if (!nl.scheduled_send_date) continue;
      const key = nl.scheduled_send_date.split("T")[0];
      if (!map[key]) continue;
      map[key].push({
        id: nl.id,
        label: nl.subject,
        type: "newsletter",
        status: nl.status,
        date: key,
      });
    }
  }

  return map;
}

export function CalendarClient({ blogPosts, scripts, newsletters }: CalendarClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

  const todayKey = formatDateKey(new Date());

  // --- Daily computations ---
  const currentDay = useMemo(() => {
    return addDays(new Date(), dayOffset);
  }, [dayOffset]);

  const currentDayKey = useMemo(() => formatDateKey(currentDay), [currentDay]);

  // --- Weekly computations ---
  const weekStart = useMemo(() => {
    const today = new Date();
    const start = getWeekStart(today);
    return addDays(start, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // --- Monthly computations ---
  const monthAnchor = useMemo(() => {
    return addMonths(getMonthStart(new Date()), monthOffset);
  }, [monthOffset]);

  const monthGrid = useMemo(() => {
    const year = monthAnchor.getFullYear();
    const month = monthAnchor.getMonth();
    const firstDay = new Date(year, month, 1);
    // getDay() returns 0=Sun, we want Mon=0
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;
    const daysInMonth = getDaysInMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const cells: { date: Date; inMonth: boolean }[] = [];

    // Previous month trailing days
    for (let i = startDow - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      cells.push({ date: new Date(year, month - 1, day), inMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), inMonth: true });
    }

    // Next month leading days (fill to complete rows of 7)
    const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
    for (let d = 1; d <= remaining; d++) {
      cells.push({ date: new Date(year, month + 1, d), inMonth: false });
    }

    return cells;
  }, [monthAnchor]);

  // --- Build item maps based on view mode ---
  const dayMap = useMemo(() => {
    let dateKeys: Set<string>;

    if (viewMode === "daily") {
      dateKeys = new Set([currentDayKey]);
    } else if (viewMode === "weekly") {
      dateKeys = new Set(weekDays.map((d) => formatDateKey(d)));
    } else {
      dateKeys = new Set(monthGrid.map((cell) => formatDateKey(cell.date)));
    }

    return buildItemsForDates(dateKeys, blogPosts, scripts, newsletters, channelFilter);
  }, [viewMode, currentDayKey, weekDays, monthGrid, blogPosts, scripts, newsletters, channelFilter]);

  // --- Navigation handlers ---
  function handlePrev() {
    if (viewMode === "daily") setDayOffset((o) => o - 1);
    else if (viewMode === "weekly") setWeekOffset((o) => o - 1);
    else setMonthOffset((o) => o - 1);
  }

  function handleNext() {
    if (viewMode === "daily") setDayOffset((o) => o + 1);
    else if (viewMode === "weekly") setWeekOffset((o) => o + 1);
    else setMonthOffset((o) => o + 1);
  }

  function handleToday() {
    setDayOffset(0);
    setWeekOffset(0);
    setMonthOffset(0);
  }

  // --- Navigation label ---
  const navigationLabel = useMemo(() => {
    if (viewMode === "daily") {
      return currentDay.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } else if (viewMode === "weekly") {
      return `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return monthAnchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  }, [viewMode, currentDay, weekDays, monthAnchor]);

  // --- Render a single item badge ---
  function renderItemBadge(item: CalendarItem) {
    const colors = TYPE_COLORS[item.type];
    return (
      <div
        key={`${item.type}-${item.id}`}
        className={`px-1.5 py-1 text-[10px] font-semibold border ${colors.border} ${colors.bg} ${colors.text} cursor-pointer truncate`}
        title={item.label}
        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
      >
        {item.label}
      </div>
    );
  }

  // --- View Post link for popup ---
  function getViewPostUrl(item: CalendarItem): string | null {
    if (item.type === "post" && item.slug) {
      return "/hub/stories/" + item.slug;
    }
    if (item.type === "script") {
      return "/admin/social/distribute/" + item.id;
    }
    return null;
  }

  return (
    <>
      <PortalTopbar title="Content Calendar" />
      <div className="p-8 space-y-4">
        {/* View Toggle + Channel Filter */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleToday}
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 text-[#374151] hover:border-gray-400 transition-colors"
          >
            Today
          </button>
          <div className="flex border border-gray-200 rounded-full overflow-hidden">
            {(["daily", "weekly", "monthly"] as ViewMode[]).map((mode) => {
              const label = mode === "daily" ? "Day" : mode === "weekly" ? "Week" : "Month";
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as ChannelFilter)}
            className="ml-4 px-3 py-2 border border-gray-200 text-sm bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a]"
          >
            {CHANNEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {LEGEND.map((item) => {
            const colors = TYPE_COLORS[item.type];
            return (
              <div key={item.type} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`} />
                <span className="text-[11px] text-[#6b7280]">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="inline-flex items-center justify-center w-8 h-8 border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="font-display text-[18px] font-semibold text-black">
            {navigationLabel}
          </h2>
          <button
            onClick={handleNext}
            className="inline-flex items-center justify-center w-8 h-8 border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* =================== DAILY VIEW =================== */}
        {viewMode === "daily" && (
          <div className="border border-[#e5e5e5] bg-white">
            <div
              className={`px-4 py-3 border-b border-[#e5e5e5] ${
                currentDayKey === todayKey ? "bg-[#fef3c7]" : "bg-[#f9fafb]"
              }`}
            >
              <span className="text-[11px] font-semibold text-[#6b7280]">
                {currentDay.toLocaleDateString("en-US", { weekday: "long" })}
              </span>
              <span
                className={`ml-2 text-[14px] font-semibold ${
                  currentDayKey === todayKey ? "text-[#c1121f]" : "text-black"
                }`}
              >
                {currentDay.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="px-4 py-4 min-h-[200px]">
              {(dayMap[currentDayKey] ?? []).length === 0 ? (
                <span className="text-[13px] text-[#d1d5db] block text-center mt-12">
                  No items scheduled
                </span>
              ) : (
                <div className="space-y-2">
                  {(dayMap[currentDayKey] ?? []).map((item) => {
                    const colors = TYPE_COLORS[item.type];
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        className={`flex items-start gap-3 px-4 py-3 border ${colors.border} ${colors.bg} cursor-pointer transition-colors`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-semibold ${colors.text}`}>
                            {item.label}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-semibold uppercase text-[#6b7280]">
                              {item.type}
                            </span>
                            {item.platform && (
                              <span className="text-[10px] text-[#6b7280]">
                                {item.platform}
                              </span>
                            )}
                            {item.status && (
                              <span className="text-[10px] text-[#6b7280]">
                                {item.status}
                              </span>
                            )}
                            {item.tier && (
                              <span className="text-[10px] text-[#6b7280]">
                                Tier {item.tier}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================== WEEKLY VIEW =================== */}
        {viewMode === "weekly" && (
          <div className="grid grid-cols-7 border border-[#e5e5e5]">
            {/* Day headers */}
            {weekDays.map((day, i) => {
              const key = formatDateKey(day);
              const isToday = key === todayKey;
              return (
                <div
                  key={`header-${i}`}
                  className={`px-2 py-2 text-center border-b border-[#e5e5e5] ${
                    i > 0 ? "border-l border-[#e5e5e5]" : ""
                  } ${isToday ? "bg-[#fef3c7]" : "bg-[#f9fafb]"}`}
                >
                  <span className="text-[11px] font-semibold text-[#6b7280]">
                    {DAY_NAMES[i]}
                  </span>
                  <br />
                  <span
                    className={`text-[14px] font-semibold ${
                      isToday ? "text-[#c1121f]" : "text-black"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>
              );
            })}

            {/* Day cells */}
            {weekDays.map((day, i) => {
              const key = formatDateKey(day);
              const items = dayMap[key] ?? [];
              const isToday = key === todayKey;
              return (
                <div
                  key={`cell-${i}`}
                  className={`min-h-[140px] px-1.5 py-2 ${
                    i > 0 ? "border-l border-[#e5e5e5]" : ""
                  } ${isToday ? "bg-[#fffef5]" : "bg-white"}`}
                >
                  {items.length === 0 && (
                    <span className="text-[10px] text-[#d1d5db] block text-center mt-8">
                      —
                    </span>
                  )}
                  <div className="space-y-1">{items.map(renderItemBadge)}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* =================== MONTHLY VIEW =================== */}
        {viewMode === "monthly" && (
          <div className="border border-[#e5e5e5]">
            {/* Day name headers */}
            <div className="grid grid-cols-7">
              {DAY_NAMES.map((name, i) => (
                <div
                  key={`month-header-${i}`}
                  className={`px-2 py-2 text-center bg-[#f9fafb] border-b border-[#e5e5e5] ${
                    i > 0 ? "border-l border-[#e5e5e5]" : ""
                  }`}
                >
                  <span className="text-[11px] font-semibold text-[#6b7280]">
                    {name}
                  </span>
                </div>
              ))}
            </div>

            {/* Month grid rows */}
            {Array.from(
              { length: Math.ceil(monthGrid.length / 7) },
              (_, rowIdx) => {
                const rowCells = monthGrid.slice(rowIdx * 7, rowIdx * 7 + 7);
                return (
                  <div key={`month-row-${rowIdx}`} className="grid grid-cols-7">
                    {rowCells.map((cell, colIdx) => {
                      const key = formatDateKey(cell.date);
                      const items = dayMap[key] ?? [];
                      const isToday = key === todayKey;
                      const MAX_VISIBLE = 3;
                      const visibleItems = items.slice(0, MAX_VISIBLE);
                      const hiddenCount = items.length - MAX_VISIBLE;

                      return (
                        <div
                          key={`month-cell-${rowIdx}-${colIdx}`}
                          className={`min-h-[100px] px-1.5 py-1.5 border-b border-[#e5e5e5] ${
                            colIdx > 0 ? "border-l border-[#e5e5e5]" : ""
                          } ${
                            !cell.inMonth
                              ? "bg-[#f9fafb]"
                              : isToday
                                ? "bg-[#fffef5]"
                                : "bg-white"
                          }`}
                        >
                          <span
                            className={`text-[12px] font-semibold block mb-1 ${
                              !cell.inMonth
                                ? "text-[#d1d5db]"
                                : isToday
                                  ? "text-[#c1121f]"
                                  : "text-[#374151]"
                            }`}
                          >
                            {cell.date.getDate()}
                          </span>
                          <div className="space-y-0.5">
                            {visibleItems.map(renderItemBadge)}
                            {hiddenCount > 0 && (
                              <span className="text-[9px] font-semibold text-[#6b7280] block px-1">
                                +{hiddenCount} more
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>

      {/* ── Item Detail Popup ── */}
      {selectedItem && (
        <>
          <div
            className="fixed inset-0 z-[90] bg-black/40"
            onClick={() => setSelectedItem(null)}
          />
          <div className="fixed z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white border border-gray-200 shadow-lg">
            {/* Image */}
            {selectedItem.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedItem.imageUrl}
                alt=""
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-300 text-sm">No image</span>
              </div>
            )}

            <div className="px-5 py-4">
              {/* Title */}
              <h3 className="font-display text-[16px] font-semibold text-black">
                {selectedItem.label}
              </h3>

              {/* Caption — truncated to 2 lines */}
              {selectedItem.caption && (
                <p className="text-[13px] text-[#6b7280] mt-1.5 line-clamp-2">
                  {selectedItem.caption}
                </p>
              )}

              {/* Platform badge + Date */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {selectedItem.type === "script" && selectedItem.platform ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1a1a1a] text-white">
                    {selectedItem.platform.charAt(0).toUpperCase() + selectedItem.platform.slice(1)}
                  </span>
                ) : selectedItem.type === "post" ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#dbeafe] text-[#1e40af] border border-[#93c5fd]">
                    Website
                  </span>
                ) : null}

                {(selectedItem.postedAt || selectedItem.date) && (
                  <span className="text-[12px] text-[#6b7280]">
                    {new Date(
                      selectedItem.postedAt ?? selectedItem.date + "T00:00:00"
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      ...(selectedItem.postedAt ? { hour: "numeric", minute: "2-digit" } : {}),
                    })}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                {(() => {
                  const url = getViewPostUrl(selectedItem);
                  if (!url) return null;
                  return (
                    <button
                      onClick={() => window.open(url, "_blank")}
                      className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors"
                    >
                      View Post
                    </button>
                  );
                })()}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-[#374151] hover:border-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
