"use client";

import { TrendingUp } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatGrid } from "@/components/portal/StatGrid";
import { StatCard } from "@/components/portal/StatCard";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHLY_VIEWS = [180, 220, 310, 280, 350, 420, 390, 510, 480, 560, 620, 590];
const MAX_VIEW = Math.max(...MONTHLY_VIEWS);

const TRAFFIC_SOURCES = [
  { label: "Direct", pct: 45 },
  { label: "ATL Vibes Search", pct: 30 },
  { label: "Google", pct: 15 },
  { label: "Social", pct: 10 },
];

export default function AnalyticsClient({ tier }: { tier: string }) {
  const showUpgradeBanner = tier === "free" || tier === "standard";

  return (
    <>
      <PortalTopbar title="Analytics" />
      <div className="p-8 max-[899px]:pt-16">
        {/* Upgrade banner */}
        {showUpgradeBanner && (
          <div className="bg-[#fee198] border border-[#e6c46d] px-6 py-4 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-[#1a1a1a]" />
              <span className="text-[13px] font-body text-[#1a1a1a]">
                Upgrade to Premium for detailed analytics including search impressions and competitor insights.
              </span>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#1a1a1a] text-white hover:bg-black transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
        )}

        {/* Stat cards */}
        <StatGrid columns={3}>
          <StatCard
            label="Page Views"
            value="2,340"
            trend={{ value: "12%", direction: "up" }}
          />
          <StatCard
            label="Search Appearances"
            value="890"
            trend={{ value: "8%", direction: "up" }}
          />
          <StatCard
            label="Profile Clicks"
            value="156"
            trend={{ value: "15%", direction: "up" }}
          />
        </StatGrid>

        {/* Views Over Time — CSS bar chart */}
        <div className="mt-8 bg-white border border-[#e5e5e5] p-6">
          <h3 className="font-display text-[18px] font-semibold text-black mb-6">Views Over Time</h3>
          <div className="flex items-end gap-2 h-[200px]">
            {MONTHLY_VIEWS.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-[#6b7280]">{v}</span>
                <div
                  className="w-full bg-[#fee198] hover:bg-[#e6c46d] transition-colors"
                  style={{ height: `${(v / MAX_VIEW) * 160}px` }}
                />
                <span className="text-[10px] text-[#6b7280] mt-1">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="mt-6 bg-white border border-[#e5e5e5] p-6">
          <h3 className="font-display text-[18px] font-semibold text-black mb-6">Traffic Sources</h3>
          <div className="space-y-4">
            {TRAFFIC_SOURCES.map((src) => (
              <div key={src.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-body text-[#374151]">{src.label}</span>
                  <span className="text-[13px] font-body font-semibold text-[#374151]">{src.pct}%</span>
                </div>
                <div className="h-2 bg-[#f5f5f5]">
                  <div
                    className="h-full bg-[#fee198]"
                    style={{ width: `${src.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
