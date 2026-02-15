"use client";

interface Deliverable {
  id: string;
  label: string;
  deliverable_type: string;
  quantity_owed: number;
  quantity_delivered: number;
  notes: string | null;
}

interface DeliverableTrackerProps {
  deliverables: Deliverable[] | null;
}

export function DeliverableTracker({ deliverables }: DeliverableTrackerProps) {
  return (
    <div className="mb-8">
      <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#c1121f]">
        DELIVERABLES
      </div>
      <h3 className="font-display text-[18px] font-bold text-[#1a1a1a] mt-1 mb-4">
        What&rsquo;s Included
      </h3>

      {!deliverables || deliverables.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] p-5 text-center text-[13px] text-[#6b7280]">
          No deliverables found.
        </div>
      ) : (
        deliverables.map((d) => {
          const pct =
            d.quantity_owed > 0
              ? Math.round((d.quantity_delivered / d.quantity_owed) * 100)
              : 0;
          return (
            <div
              key={d.id}
              className="bg-white border border-[#e5e5e5] p-5 mb-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-semibold text-[#1a1a1a]">
                  {d.label}
                </span>
                <span className="text-[13px] text-[#6b7280]">
                  {d.quantity_delivered} of {d.quantity_owed} delivered
                </span>
              </div>
              <div className="w-full h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#fdd870] rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {d.notes && (
                <div className="mt-2 text-[11px] italic text-[#9ca3af]">
                  {d.notes}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
