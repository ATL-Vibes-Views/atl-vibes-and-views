"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import type { BusinessState } from "./TierBadge";

interface DeliverableSummary {
  deliverable_type: string;
  label: string;
  quantity_delivered: number;
}

interface AnalyticsClientProps {
  state: BusinessState;
  deliverables: DeliverableSummary[] | null;
}

const MOCK_CHART = [
  { month: "Jul", value: 180 },
  { month: "Aug", value: 220 },
  { month: "Sep", value: 310 },
  { month: "Oct", value: 280 },
  { month: "Nov", value: 350 },
  { month: "Dec", value: 290 },
  { month: "Jan", value: 380 },
  { month: "Feb", value: 420 },
];

const MAX_VALUE = Math.max(...MOCK_CHART.map((d) => d.value));

export function AnalyticsClient({
  state,
  deliverables,
}: AnalyticsClientProps) {
  const isFree = state === "free";
  const isSponsor = state === "sponsor";

  return (
    <div>
      {/* Top Stats — 3-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#e5e5e5] p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6b7280]">
            PAGE VIEWS
          </div>
          <div className="mt-2 font-display text-[32px] font-bold text-[#1a1a1a]">
            2,340
          </div>
          <div className="mt-1 text-[12px] font-semibold text-[#16a34a]">
            &uarr; 12%
          </div>
        </div>

        <div className="bg-white border border-[#e5e5e5] p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6b7280]">
            SEARCH APPEARANCES
          </div>
          <div className="mt-2 font-display text-[32px] font-bold text-[#1a1a1a]">
            890
          </div>
          <div className="mt-1 text-[12px] font-semibold text-[#16a34a]">
            &uarr; 8%
          </div>
        </div>

        <div className="bg-white border border-[#e5e5e5] p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6b7280]">
            PROFILE CLICKS
          </div>
          <div className="mt-2 font-display text-[32px] font-bold text-[#1a1a1a]">
            156
          </div>
          <div className="mt-1 text-[12px] font-semibold text-[#16a34a]">
            &uarr; 15%
          </div>
        </div>
      </div>

      {/* Views Chart — always visible */}
      <div className="bg-white border border-[#e5e5e5] p-6 mt-6">
        <h3 className="font-display text-[18px] font-bold text-[#1a1a1a] mb-4">
          Views Over Time
        </h3>
        <div className="grid grid-cols-8 gap-2 items-end" style={{ height: 200 }}>
          {MOCK_CHART.map((d) => {
            const barHeight = Math.round((d.value / MAX_VALUE) * 160);
            return (
              <div
                key={d.month}
                className="flex flex-col items-center justify-end h-full"
              >
                <span className="text-[11px] font-semibold text-[#1a1a1a] mb-1">
                  {d.value}
                </span>
                <div
                  className="w-full bg-[#fee198]"
                  style={{ height: barHeight }}
                />
                <span className="text-[11px] text-[#6b7280] mt-1">
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign Impact — sponsor only */}
      {isSponsor && (
        <div className="bg-white border border-[#e5e5e5] p-6 mt-6">
          <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#c1121f]">
            SPONSORSHIP
          </div>
          <h3 className="font-display text-[18px] font-bold text-[#1a1a1a] mt-1">
            Campaign Impact
          </h3>
          <p className="text-[13px] text-[#6b7280] mt-2">
            Since your sponsorship started:
          </p>

          {deliverables && deliverables.length > 0 ? (
            <ul className="mt-3">
              {deliverables.map((d, i) => (
                <li
                  key={i}
                  className="text-[13px] text-[#1a1a1a] py-1.5 pl-4 relative"
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#fdd870]" />
                  {d.quantity_delivered} {d.label} delivered
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-[#6b7280] mt-3">
              No deliverables tracked yet.
            </p>
          )}

          <Link
            href="/dashboard/sponsorship"
            className="inline-block mt-4 text-[13px] font-semibold text-[#c1121f] hover:underline"
          >
            View full sponsorship details &rarr;
          </Link>
        </div>
      )}

      {/* Locked Section — free only */}
      {isFree && (
        <div className="bg-[#f5f5f5] border border-[#e5e5e5] p-8 text-center mt-6">
          <Lock size={24} className="text-[#9ca3af] mx-auto mb-2" />
          <h3 className="font-display text-[18px] font-bold text-[#1a1a1a]">
            Advanced Analytics
          </h3>
          <p className="text-[13px] text-[#6b7280] mt-2 max-w-[400px] mx-auto">
            Upgrade to Standard or Premium to see detailed analytics including
            search trends, visitor demographics, and competitive insights.
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center justify-center rounded-full bg-[#fee198] px-6 py-2.5 text-[13px] font-semibold text-[#1a1a1a] hover:opacity-90 transition-opacity mt-4"
          >
            Upgrade Plan &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
