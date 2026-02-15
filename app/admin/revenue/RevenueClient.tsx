"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DollarSign, TrendingUp, Users, Megaphone, Mail } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";

/* ============================================================
   REVENUE OVERVIEW — Dashboard for sponsor + ad revenue
   ============================================================ */

interface SponsorRow {
  id: string;
  sponsor_name: string;
  status: string;
  campaign_value: number | null;
  campaign_start: string | null;
  campaign_end: string | null;
  package_type: string | null;
  is_active: boolean | null;
  placements_total: number | null;
  placements_used: number | null;
}

interface RevenueClientProps {
  sponsors: SponsorRow[];
  stats: {
    totalRevenue: number;
    activeRevenue: number;
    activeSponsors: number;
    totalSponsors: number;
    activeFlights: number;
    totalPlacements: number;
    sponsoredNewsletters: number;
  };
}

const statusBadgeMap: Record<string, "green" | "gold" | "gray" | "blue" | "red"> = {
  active: "green",
  pending: "gold",
  completed: "gray",
  paused: "blue",
  cancelled: "red",
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents);
}

export function RevenueClient({ sponsors, stats }: RevenueClientProps) {
  const columns = useMemo(
    () => [
      {
        key: "sponsor_name",
        header: "Sponsor",
        width: "30%",
        render: (item: SponsorRow) => (
          <Link
            href={`/admin/sponsors/${item.id}`}
            className="font-display text-[14px] font-semibold text-black hover:text-[#c1121f] transition-colors"
          >
            {item.sponsor_name}
          </Link>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (item: SponsorRow) => (
          <StatusBadge variant={statusBadgeMap[item.status] ?? "gray"}>
            {item.status}
          </StatusBadge>
        ),
      },
      {
        key: "package_type",
        header: "Package",
        render: (item: SponsorRow) => (
          <span className="text-[13px] text-[#374151]">
            {item.package_type ?? "—"}
          </span>
        ),
      },
      {
        key: "campaign_value",
        header: "Value",
        render: (item: SponsorRow) => (
          <span className="text-[13px] font-semibold text-[#374151]">
            {item.campaign_value ? formatCurrency(item.campaign_value) : "—"}
          </span>
        ),
      },
      {
        key: "placements",
        header: "Placements",
        render: (item: SponsorRow) => (
          <span className="text-[13px] text-[#374151]">
            {item.placements_used ?? 0} / {item.placements_total ?? 0}
          </span>
        ),
      },
      {
        key: "campaign_end",
        header: "Ends",
        render: (item: SponsorRow) => (
          <span className="text-[12px] text-[#6b7280]">
            {item.campaign_end
              ? new Date(item.campaign_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "—"}
          </span>
        ),
      },
    ],
    []
  );

  const recentActive = useMemo(
    () => sponsors.filter((s) => s.status === "active").slice(0, 10),
    [sponsors]
  );

  return (
    <>
      <PortalTopbar
        title="Revenue Overview"
        actions={
          <Link
            href="/admin/sponsors"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
          >
            Manage Sponsors
          </Link>
        }
      />
      <div className="p-8 max-[899px]:pt-16 space-y-6">
        {/* Stat Cards */}
        <StatGrid columns={4}>
          <StatCard
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
          />
          <StatCard
            label="Active Revenue"
            value={formatCurrency(stats.activeRevenue)}
            badge={stats.activeRevenue > 0 ? { text: "Live", variant: "green" } : undefined}
          />
          <StatCard
            label="Active Sponsors"
            value={stats.activeSponsors}
            subtitle={`of ${stats.totalSponsors} total`}
          />
          <StatCard
            label="Active Ad Flights"
            value={stats.activeFlights}
          />
        </StatGrid>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/sponsors"
            className="flex items-center gap-3 bg-white border border-[#e5e5e5] p-4 hover:bg-[#fafafa] transition-colors"
          >
            <Users size={18} className="text-[#6b7280]" />
            <div>
              <p className="text-[13px] font-semibold text-black">Sponsors</p>
              <p className="text-[11px] text-[#6b7280]">{stats.totalSponsors} total</p>
            </div>
          </Link>
          <Link
            href="/admin/ad-placements"
            className="flex items-center gap-3 bg-white border border-[#e5e5e5] p-4 hover:bg-[#fafafa] transition-colors"
          >
            <Megaphone size={18} className="text-[#6b7280]" />
            <div>
              <p className="text-[13px] font-semibold text-black">Ad Slots</p>
              <p className="text-[11px] text-[#6b7280]">{stats.totalPlacements} placements</p>
            </div>
          </Link>
          <Link
            href="/admin/newsletters"
            className="flex items-center gap-3 bg-white border border-[#e5e5e5] p-4 hover:bg-[#fafafa] transition-colors"
          >
            <Mail size={18} className="text-[#6b7280]" />
            <div>
              <p className="text-[13px] font-semibold text-black">Newsletter</p>
              <p className="text-[11px] text-[#6b7280]">{stats.sponsoredNewsletters} sponsored</p>
            </div>
          </Link>
        </div>

        {/* Active Sponsors Table */}
        <div>
          <h2 className="font-display text-[18px] font-semibold text-black mb-3">
            Active Sponsors
          </h2>
          <AdminDataTable
            columns={columns}
            data={recentActive}
            emptyMessage="No active sponsors."
          />
        </div>
      </div>
    </>
  );
}
