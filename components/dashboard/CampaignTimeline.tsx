"use client";

interface TimelineItem {
  id: string;
  title: string;
  deliverable_type: string;
  delivered_at: string;
}

interface CampaignTimelineProps {
  items: TimelineItem[] | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CampaignTimeline({ items }: CampaignTimelineProps) {
  const now = new Date();

  return (
    <div className="mb-8">
      <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#c1121f]">
        TIMELINE
      </div>
      <h3 className="font-display text-[18px] font-bold text-[#1a1a1a] mt-1 mb-4">
        Campaign Timeline
      </h3>

      {!items || items.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] p-5 text-center text-[13px] text-[#6b7280]">
          No timeline events yet.
        </div>
      ) : (
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-[#e5e5e5]" />

          {items.map((item, i) => {
            const isPast = new Date(item.delivered_at) <= now;
            return (
              <div
                key={item.id}
                className={`relative ${
                  i < items.length - 1 ? "pb-5" : ""
                }`}
              >
                {/* Dot */}
                <div
                  className={`absolute -left-5 top-1 w-[10px] h-[10px] rounded-full border-2 border-white ${
                    isPast ? "bg-[#fdd870]" : "bg-[#d1d5db]"
                  }`}
                />

                {/* Content */}
                <div className="text-[11px] text-[#9ca3af]">
                  {formatDate(item.delivered_at)}
                </div>
                <div className="text-[13px] font-semibold text-[#1a1a1a] mt-0.5">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#6b7280]">
                  {item.deliverable_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
