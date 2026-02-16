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
  blog_posts: { title: string } | null;
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
};

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

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function CalendarClient({ entries, scripts, events, newsletters }: CalendarClientProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const today = new Date();
    const start = getWeekStart(today);
    return addDays(start, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Build a map of date → items
  const dayMap = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {};

    for (const day of weekDays) {
      map[formatDateKey(day)] = [];
    }

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
        });
      } else if (entry.story_id && entry.stories) {
        map[key].push({
          id: entry.id,
          label: entry.stories.headline,
          type: "story",
          tier: entry.tier,
          status: entry.status,
        });
      }
    }

    for (const script of scripts) {
      if (!script.scheduled_date) continue;
      const key = script.scheduled_date;
      if (!map[key]) continue;
      map[key].push({
        id: script.id,
        label: script.title,
        type: "script",
        status: script.status,
      });
    }

    for (const event of events) {
      if (!event.start_date) continue;
      const key = event.start_date.split("T")[0];
      if (!map[key]) continue;
      map[key].push({
        id: event.id,
        label: event.title,
        type: "event",
        status: event.status,
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
      });
    }

    return map;
  }, [entries, scripts, events, newsletters, weekDays]);

  const weekLabel = `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const todayKey = formatDateKey(new Date());

  return (
    <>
      <PortalTopbar
        title="Content Calendar"
        actions={
          <button
            onClick={() => setWeekOffset(0)}
            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
          >
            Today
          </button>
        }
      />
      <div className="p-8 space-y-4">
        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="inline-flex items-center justify-center w-8 h-8 border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="font-display text-[18px] font-semibold text-black">
            {weekLabel}
          </h2>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="inline-flex items-center justify-center w-8 h-8 border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Color legend */}
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

        {/* 7-column grid */}
        <div className="grid grid-cols-7 border border-[#e5e5e5]">
          {/* Day headers */}
          {weekDays.map((day, i) => {
            const key = formatDateKey(day);
            const isToday = key === todayKey;
            return (
              <div
                key={`header-${i}`}
                className={`px-2 py-2 text-center border-b border-[#e5e5e5] ${i > 0 ? "border-l border-[#e5e5e5]" : ""} ${isToday ? "bg-[#fef3c7]" : "bg-[#f9fafb]"}`}
              >
                <span className="text-[11px] font-semibold text-[#6b7280]">{DAY_NAMES[i]}</span>
                <br />
                <span className={`text-[14px] font-semibold ${isToday ? "text-[#c1121f]" : "text-black"}`}>
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
                className={`min-h-[140px] px-1.5 py-2 ${i > 0 ? "border-l border-[#e5e5e5]" : ""} ${isToday ? "bg-[#fffef5]" : "bg-white"}`}
              >
                {items.length === 0 && (
                  <span className="text-[10px] text-[#d1d5db] block text-center mt-8">—</span>
                )}
                <div className="space-y-1">
                  {items.map((item) => {
                    const colors = TYPE_COLORS[item.type];
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        className={`px-1.5 py-1 text-[10px] font-semibold border ${colors.border} ${colors.bg} ${colors.text} cursor-pointer truncate`}
                        title={item.label}
                        onClick={() => console.log("Open:", item.type, item.id)}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
