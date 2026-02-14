"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";

interface EventItem {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  venue_name: string | null;
  status: string;
  is_free: boolean;
  ticket_price_min: number | null;
  ticket_price_max: number | null;
  description: string | null;
  neighborhood_name: string | null;
}

type TabFilter = "upcoming" | "past" | "all";

const TAB_FILTERS: { label: string; key: TabFilter }[] = [
  { label: "Upcoming", key: "upcoming" },
  { label: "Past", key: "past" },
  { label: "All", key: "all" },
];

function statusVariant(status: string) {
  switch (status) {
    case "active":
      return "green" as const;
    case "draft":
      return "gray" as const;
    case "cancelled":
      return "red" as const;
    default:
      return "gray" as const;
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(t: string | null) {
  if (!t) return null;
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function EventsClient({ events }: { events: EventItem[] }) {
  const [activeTab, setActiveTab] = useState<TabFilter>("upcoming");
  const today = new Date().toISOString().split("T")[0];

  const filteredEvents = events.filter((e) => {
    if (activeTab === "upcoming") return e.start_date >= today && e.status === "active";
    if (activeTab === "past") return e.start_date < today;
    return true;
  });

  // Placeholder events if none exist
  const displayEvents =
    filteredEvents.length > 0
      ? filteredEvents
      : activeTab === "all" || activeTab === "upcoming"
        ? [
            {
              id: "placeholder-1",
              title: "Community Fitness Day",
              slug: "community-fitness-day",
              start_date: "2026-03-15",
              start_time: "09:00:00",
              end_date: "2026-03-15",
              end_time: "14:00:00",
              venue_name: "Blandtown Boxing",
              status: "active",
              is_free: true,
              ticket_price_min: null,
              ticket_price_max: null,
              description: "Join us for a free day of boxing classes, fitness demos, and community building in the Westside.",
              neighborhood_name: "Blandtown",
            },
            {
              id: "placeholder-2",
              title: "Boxing Fundamentals Workshop",
              slug: "boxing-fundamentals",
              start_date: "2026-03-22",
              start_time: "18:00:00",
              end_date: null,
              end_time: "20:00:00",
              venue_name: "Blandtown Boxing",
              status: "draft",
              is_free: false,
              ticket_price_min: 25,
              ticket_price_max: 25,
              description: "A beginner-friendly workshop covering stance, footwork, and basic combinations.",
              neighborhood_name: "Blandtown",
            },
          ]
        : [];

  return (
    <>
      <PortalTopbar
        title="Events"
        actions={
          <button
            type="button"
            onClick={() => console.log("New event clicked")}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
          >
            + New Event
          </button>
        }
      />
      <div className="p-8 max-[899px]:pt-16">
        {/* Pill-style tab filter */}
        <div className="inline-flex border border-[#e5e5e5] mb-6">
          {TAB_FILTERS.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                "px-5 py-2 text-[13px] font-body font-semibold transition-colors",
                i === 0 ? "rounded-l-full" : "",
                i === TAB_FILTERS.length - 1 ? "rounded-r-full" : "",
                activeTab === tab.key
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-white text-[#6b7280] hover:bg-[#f5f5f5]",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Event list */}
        {displayEvents.length > 0 ? (
          <div className="space-y-4">
            {displayEvents.map((event) => {
              const isDraft = event.status === "draft";
              return (
                <div
                  key={event.id}
                  className={[
                    "bg-white p-5",
                    isDraft
                      ? "border-2 border-dashed border-[#e5e5e5] bg-[#f9fafb]"
                      : "border border-[#e5e5e5]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-[18px] font-semibold text-black">
                          {event.title}
                        </h3>
                        <StatusBadge variant={statusVariant(event.status)}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </StatusBadge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#6b7280]">
                        <span>{formatDate(event.start_date)}</span>
                        {event.start_time && <span>{formatTime(event.start_time)}{event.end_time ? ` – ${formatTime(event.end_time)}` : ""}</span>}
                        {event.venue_name && <span>{event.venue_name}</span>}
                        {event.neighborhood_name && <span>{event.neighborhood_name}</span>}
                      </div>

                      <div className="mt-1 text-[12px] text-[#6b7280]">
                        {event.is_free ? (
                          <span className="font-semibold text-[#16a34a]">Free</span>
                        ) : event.ticket_price_min ? (
                          <span>
                            ${event.ticket_price_min}
                            {event.ticket_price_max && event.ticket_price_max !== event.ticket_price_min
                              ? ` – $${event.ticket_price_max}`
                              : ""}
                          </span>
                        ) : null}
                      </div>

                      {event.description && (
                        <p className="text-[13px] font-body text-[#374151] mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isDraft && (
                        <button
                          type="button"
                          onClick={() => console.log("Publish event", event.id)}
                          className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => console.log("Edit event", event.id)}
                        className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
                      >
                        Edit
                      </button>
                      {isDraft ? (
                        <button
                          type="button"
                          onClick={() => console.log("Delete event", event.id)}
                          className="text-[#c1121f] text-xs font-semibold hover:underline"
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => console.log("Cancel event", event.id)}
                          className="text-[#c1121f] text-xs font-semibold hover:underline"
                        >
                          Cancel Event
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#e5e5e5] p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-[#d1d5db]" />
            <h3 className="font-display text-[22px] font-semibold text-black mb-2">
              No events found
            </h3>
            <p className="text-[14px] font-body text-[#6b7280]">
              {activeTab === "upcoming"
                ? "You don't have any upcoming events. Create one to get started."
                : activeTab === "past"
                  ? "No past events on record."
                  : "No events found."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
