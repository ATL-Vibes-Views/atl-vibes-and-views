"use client";

import { useState, useMemo } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarEntry {
  id: string;
  story_id: string | null;
  post_id: string | null;
  tier: string | null;
  scheduled_date: string;
  status: string | null;
  stories: { headline: string } | null;
  blog_posts: { title: string; slug: string | null } | null;
}

interface ScriptEntry {
  id: string;
  title: string;
  platform: string | null;
  scheduled_date: string | null;
  status: string;
}

interface EventEntry {
  id: string;
  title: string;
  start_date: string | null;
  status: string;
}

interface NewsletterEntry {
  id: string;
  subject: string;
  scheduled_send_date: string | null;
  status: string;
}

interface CalendarClientProps {
  entries: CalendarEntry[];
  scripts: ScriptEntry[];
  events: EventEntry[];
  newsletters: NewsletterEntry[];
}

type CalendarItem = {
  id: string;
  label: string;
  type: "post" | "story" | "script" | "event" | "newsletter";
  tier?: string | null;
  status?: string | null;
  platform?: string | null;
  date?: string;
  slug?: string | null;
  postId?: string | null;
  storyId?: string | null;
};

type ViewMode = "daily" | "weekly" | "monthly";
type ChannelFilter = "" | "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin" | "x";

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  post: { bg: "bg-[#dbeafe]", text: "text-[#1e40af]", border: "border-[#93c5fd]" },
  story: { bg: "bg-[#fef3c7]", text: "text-[#92400e]", border: "border-[#fcd34d]" },
  script: { bg: "bg-[#ffedd5]", text: "text-[#9a3412]", border: "border-[#fdba74]" },
  event: { bg: "bg-[#d1fae5]", text: "text-[#065f46]", border: "border-[#6ee7b7]" },
  newsletter: { bg: "bg-[#ede9fe]", text: "text-[#5b21b6]", border: "border-[#c4b5fd]" },
};

const LEGEND = [
  { type: "post", label: "Blog Post" },
  { type: "story", label: "Story" },
  { type: "script", label: "Script" },
  { type: "event", label: "Event" },
  { type: "newsletter", label: "Newsletter" },
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CHANNEL_OPTIONS: { value: ChannelFilter; label: string }[] = [
  { value: "", label: "All Channels" },
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
  entries: CalendarEntry[],
  scripts: ScriptEntry[],
  events: EventEntry[],
  newsletters: NewsletterEntry[],
  channelFilter: ChannelFilter,
): Record<string, CalendarItem[]> {
  const map: Record<string, CalendarItem[]> = {};

  for (const key of dateKeys) {
    map[key] = [];
  }

  // When a specific channel is selected, hide non-platform content types
  const showNonPlatformContent = channelFilter === "";

  if (showNonPlatformContent) {
    for (const entry of entries) {
      const key = entry.scheduled_date;
      if (!map[key]) continue;
      if (entry.post_id && entry.blog_posts) {
        map[key].push({
          id: entry.id,
          label: entry.blog_posts.title,
          type: "post",
          tier: entry.tier,
          status: entry.status,
          date: key,
          slug: entry.blog_posts.slug,
          postId: entry.post_id,
        });
      } else if (entry.story_id && entry.stories) {
        map[key].push({
          id: entry.id,
          label: entry.stories.headline,
          type: "story",
          tier: entry.tier,
          status: entry.status,
          date: key,
          storyId: entry.story_id,
        });
      }
    }
  }

  for (const script of scripts) {
    if (!script.scheduled_date) continue;
    const key = script.scheduled_date;
    if (!map[key]) continue;
    if (channelFilter !== "" && (script.platform ?? "").toLowerCase() !== channelFilter) {
      continue;
    }
    map[key].push({
      id: script.id,
      label: script.title,
      type: "script",
      status: script.status,
      platform: script.platform,
      date: key,
    });
  }

  if (showNonPlatformContent) {
    for (const event of events) {
      if (!event.start_date) continue;
      const key = event.start_date.split("T")[0];
      if (!map[key]) continue;
      map[key].push({
        id: event.id,
        label: event.title,
        type: "event",
        status: event.status,
        date: key,
      });
    }

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

export function CalendarClient({ entries, scripts, events, newsletters }: CalendarClientProps) {
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

    return buildItemsForDates(dateKeys, entries, scripts, events, newsletters, channelFilter);
  }, [viewMode, currentDayKey, weekDays, monthGrid, entries, scripts, events, newsletters, channelFilter]);

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
            <div className="px-5 py-4">
              {/* Type badge */}
              {(() => {
                const colors = TYPE_COLORS[selectedItem.type];
                return (
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold border ${colors.border} ${colors.bg} ${colors.text} mb-2`}>
                    {selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)}
                  </span>
                );
              })()}

              <h3 className="font-display text-[16px] font-semibold text-black">
                {selectedItem.label}
              </h3>

              <div className="mt-3 space-y-1.5 text-[13px] text-[#374151]">
                {selectedItem.date && (
                  <p>
                    <span className="text-[#6b7280] font-medium">Date:</span>{" "}
                    {new Date(selectedItem.date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
                {selectedItem.platform && (
                  <p>
                    <span className="text-[#6b7280] font-medium">Platform:</span>{" "}
                    {selectedItem.platform}
                  </p>
                )}
                {selectedItem.status && (
                  <p>
                    <span className="text-[#6b7280] font-medium">Status:</span>{" "}
                    {selectedItem.status}
                  </p>
                )}
                {selectedItem.tier && (
                  <p>
                    <span className="text-[#6b7280] font-medium">Tier:</span>{" "}
                    {selectedItem.tier}
                  </p>
                )}
              </div>

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
