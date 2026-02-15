"use client";

import Link from "next/link";
import {
  Star,
  FileText,
  Newspaper,
  Calendar,
} from "lucide-react";
import { TierBadge, type BusinessState } from "./TierBadge";
import { LockedStatCard } from "./LockedStatCard";

interface SponsorData {
  campaign_name: string | null;
  sponsor_packages: { name: string } | null;
}

interface DeliverableData {
  quantity_owed: number;
  quantity_delivered: number;
}

interface OverviewClientProps {
  state: BusinessState;
  businessStatus: string;
  avgRating: string;
  reviewCount: number;
  storyCount: number;
  eventCount: number;
  sponsor: SponsorData | null;
  deliverables: DeliverableData[] | null;
}

export function OverviewClient({
  state,
  businessStatus,
  avgRating,
  reviewCount,
  storyCount,
  eventCount,
  sponsor,
  deliverables,
}: OverviewClientProps) {
  const isLocked = state === "free";
  const isSponsor = state === "sponsor";

  // Deliverables progress
  const totalOwed = deliverables?.reduce((sum, d) => sum + d.quantity_owed, 0) ?? 0;
  const totalDelivered = deliverables?.reduce((sum, d) => sum + d.quantity_delivered, 0) ?? 0;
  const progressPct = totalOwed > 0 ? Math.round((totalDelivered / totalOwed) * 100) : 0;

  return (
    <div>
      {/* Row 1: Core Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Listing Status */}
        <div className="bg-white border border-[#e5e5e5] p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6b7280]">
            LISTING STATUS
          </div>
          <div className="mt-2 font-display text-[32px] font-bold text-[#1a1a1a]">
            {businessStatus === "active" ? "Active" : capitalize(businessStatus)}
          </div>
          <div className="mt-1">
            {businessStatus === "active" ? (
              <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[11px] font-semibold text-[#16a34a]">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-[#e5e7eb] px-2.5 py-0.5 text-[11px] font-semibold text-[#374151]">
                {capitalize(businessStatus)}
              </span>
            )}
          </div>
        </div>

        {/* Current Tier */}
        <div className="bg-white border border-[#e5e5e5] p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6b7280]">
            CURRENT TIER
          </div>
          <div className="mt-2">
            <TierBadge state={state} />
          </div>
          <div className="mt-1 text-[12px] text-[#6b7280]">
            {state === "free" && "Free"}
            {state === "standard" && "Standard"}
            {state === "founding" && "Founding Member"}
            {state === "sponsor" && "Partner"}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white border border-[#e5e5e5] p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6b7280]">
            REVIEWS
          </div>
          <div className="mt-2 font-display text-[32px] font-bold text-[#1a1a1a]">
            {avgRating}
          </div>
          <div className="mt-1 text-[12px] text-[#6b7280]">
            {reviewCount} total reviews
          </div>
        </div>
      </div>

      {/* Row 2: Sponsor Summary (sponsor state ONLY) */}
      {isSponsor && sponsor && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Sponsorship card */}
          <div className="bg-white border border-[#e5e5e5] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6b7280] mb-2">
              SPONSORSHIP
            </div>
            <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[11px] font-semibold text-[#16a34a]">
              Active
            </span>
            <div className="mt-2 text-[13px] font-semibold text-[#1a1a1a]">
              {sponsor.sponsor_packages?.name ?? "Sponsorship Package"}
            </div>
            <div className="text-[12px] text-[#6b7280]">
              {sponsor.campaign_name ?? "Current Campaign"}
            </div>
            <Link
              href="/dashboard/sponsorship"
              className="inline-block mt-3 text-[12px] font-semibold text-[#c1121f] hover:underline"
            >
              View Details &rarr;
            </Link>
          </div>

          {/* Deliverables card */}
          <div className="bg-white border border-[#e5e5e5] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6b7280] mb-2">
              DELIVERABLES
            </div>
            <div className="text-[14px] font-semibold text-[#1a1a1a]">
              {totalDelivered} of {totalOwed} delivered
            </div>
            <div className="mt-2 w-full h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#fdd870] rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <Link
              href="/dashboard/sponsorship"
              className="inline-block mt-3 text-[12px] font-semibold text-[#c1121f] hover:underline"
            >
              View Details &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Row 3: Engagement Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Page Views */}
        {isLocked ? (
          <LockedStatCard
            eyebrow="PAGE VIEWS"
            value="2,340"
            subtitle="Monthly page views"
            linkHref="/dashboard/billing"
            linkText="Upgrade to unlock &rarr;"
          />
        ) : (
          <div className="bg-white border border-[#e5e5e5] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6b7280]">
              PAGE VIEWS
            </div>
            <div className="mt-2 font-display text-[32px] font-bold text-[#1a1a1a]">
              2,340
            </div>
            <div className="mt-1 text-[12px]">
              <span className="text-[#16a34a] font-semibold">&uarr; 12% this month</span>
            </div>
          </div>
        )}

        {/* Press Mentions */}
        {isLocked ? (
          <LockedStatCard
            eyebrow="PRESS MENTIONS"
            value="2"
            subtitle="Published stories"
            linkHref="/dashboard/billing"
            linkText="Upgrade to unlock &rarr;"
          />
        ) : (
          <div className="bg-white border border-[#e5e5e5] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6b7280]">
              PRESS MENTIONS
            </div>
            <div className="mt-2 font-display text-[32px] font-bold text-[#1a1a1a]">
              {storyCount}
            </div>
            <div className="mt-1 text-[12px] text-[#6b7280]">
              Published stories
            </div>
          </div>
        )}

        {/* Upcoming Events — never locked */}
        <div className="bg-white border border-[#e5e5e5] p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#6b7280]">
            UPCOMING EVENTS
          </div>
          <div className="mt-2 font-display text-[32px] font-bold text-[#1a1a1a]">
            {eventCount}
          </div>
          <div className="mt-1 text-[12px] text-[#6b7280]">
            Active events
          </div>
        </div>
      </div>

      {/* Sponsorship Upsell Banner — hidden for sponsor state */}
      {!isSponsor && (
        <div className="bg-[#fee198] px-5 py-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Star size={16} className="text-[#1a1a1a] flex-shrink-0" />
            <span className="text-[13px] text-[#1a1a1a]">
              Grow your business with dedicated content and ad placements
            </span>
          </div>
          <Link
            href="/dashboard/sponsorship"
            className="inline-flex items-center rounded-full bg-[#fdd870] px-4 py-2 text-[13px] font-semibold text-[#1a1a1a] hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
          >
            Explore Packages &rarr;
          </Link>
        </div>
      )}

      {/* Recent Activity Feed */}
      <div className="bg-white border border-[#e5e5e5] p-6">
        <h3 className="font-display text-[18px] font-bold text-[#1a1a1a] mb-4">
          Recent Activity
        </h3>

        <ActivityItem
          icon={<Star size={16} />}
          iconBg="bg-[#fee198]"
          text={<>New 5-star review: &ldquo;Amazing atmosphere and service!&rdquo;</>}
          time="2 hours ago"
        />

        {isSponsor && (
          <ActivityItem
            icon={<FileText size={16} />}
            iconBg="bg-[#bbf7d0]"
            text={<>Sponsored blog feature published: &ldquo;Top 10 Hidden Gems&rdquo;</>}
            time="1 day ago"
          />
        )}

        <ActivityItem
          icon={<Newspaper size={16} />}
          iconBg="bg-[#e5e7eb]"
          text={<>Your business was mentioned in &ldquo;Best Boxing Gyms in Atlanta&rdquo;</>}
          time="2 days ago"
        />

        <ActivityItem
          icon={<Calendar size={16} />}
          iconBg="bg-[#e5e7eb]"
          text={<>Event &ldquo;Community Fitness Day&rdquo; scheduled for Mar 14</>}
          time="3 days ago"
          isLast
        />
      </div>
    </div>
  );
}

function ActivityItem({
  icon,
  iconBg,
  text,
  time,
  isLast = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  text: React.ReactNode;
  time: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 py-3 ${
        !isLast ? "border-b border-[#f5f5f5]" : ""
      }`}
    >
      <span
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconBg}`}
      >
        {icon}
      </span>
      <span className="flex-1 text-[13px] text-[#1a1a1a]">{text}</span>
      <span className="text-[11px] text-[#9ca3af] flex-shrink-0">{time}</span>
    </div>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
