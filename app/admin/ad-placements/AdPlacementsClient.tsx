"use client";

import { useMemo, useState } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";

/* ============================================================
   AD PLACEMENTS — Manage placement slots and view flight status
   ============================================================ */

interface PlacementRow {
  id: string;
  name: string;
  channel: string;
  placement_key: string;
  page_type: string | null;
  dimensions: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface FlightRow {
  id: string;
  placement_id: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface AdPlacementsClientProps {
  placements: PlacementRow[];
  flights: FlightRow[];
}

export function AdPlacementsClient({ placements, flights }: AdPlacementsClientProps) {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // Flight counts per placement
  const flightMap = useMemo(() => {
    const map: Record<string, { total: number; active: number }> = {};
    flights.forEach((f) => {
      if (!map[f.placement_id]) map[f.placement_id] = { total: 0, active: 0 };
      map[f.placement_id].total++;
      if (f.status === "active" && f.start_date <= today && f.end_date >= today) {
        map[f.placement_id].active++;
      }
    });
    return map;
  }, [flights, today]);

  const filtered = useMemo(() => {
    let items = placements;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.placement_key.toLowerCase().includes(q) ||
          p.page_type?.toLowerCase().includes(q)
      );
    }
    if (channelFilter) items = items.filter((p) => p.channel === channelFilter);
    if (statusFilter === "active") items = items.filter((p) => p.is_active);
    if (statusFilter === "inactive") items = items.filter((p) => !p.is_active);
    return items;
  }, [placements, search, channelFilter, statusFilter]);

  const activePlacements = placements.filter((p) => p.is_active).length;
  const activeFlightsTotal = flights.filter(
    (f) => f.status === "active" && f.start_date <= today && f.end_date >= today
  ).length;

  const channels = useMemo(() => {
    const set = new Set(placements.map((p) => p.channel));
    return Array.from(set).sort();
  }, [placements]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Placement",
        width: "25%",
        render: (item: PlacementRow) => (
          <div>
            <span className="font-display text-[14px] font-semibold text-black">{item.name}</span>
            <span className="block text-[11px] text-[#9ca3af] font-mono">{item.placement_key}</span>
          </div>
        ),
      },
      {
        key: "channel",
        header: "Channel",
        render: (item: PlacementRow) => (
          <span className="text-[13px] text-[#374151]">{item.channel}</span>
        ),
      },
      {
        key: "page_type",
        header: "Page",
        render: (item: PlacementRow) => (
          <span className="text-[13px] text-[#374151]">{item.page_type ?? "—"}</span>
        ),
      },
      {
        key: "dimensions",
        header: "Size",
        render: (item: PlacementRow) => (
          <span className="text-[12px] text-[#6b7280] font-mono">{item.dimensions ?? "—"}</span>
        ),
      },
      {
        key: "flights",
        header: "Flights",
        render: (item: PlacementRow) => {
          const f = flightMap[item.id];
          return (
            <span className="text-[13px] text-[#374151]">
              {f ? `${f.active} active / ${f.total} total` : "0"}
            </span>
          );
        },
      },
      {
        key: "is_active",
        header: "Status",
        render: (item: PlacementRow) => (
          <StatusBadge variant={item.is_active ? "green" : "gray"}>
            {item.is_active ? "Active" : "Inactive"}
          </StatusBadge>
        ),
      },
    ],
    [flightMap]
  );

  return (
    <>
      <PortalTopbar
        title="Ad Placements"
        actions={
          <button
            onClick={() => console.log("Create placement")}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
          >
            + New Placement
          </button>
        }
      />
      <div className="p-8 max-[899px]:pt-16 space-y-4">
        <StatGrid columns={3}>
          <StatCard label="Total Placements" value={placements.length} />
          <StatCard
            label="Active Placements"
            value={activePlacements}
            badge={activePlacements > 0 ? { text: "Live", variant: "green" } : undefined}
          />
          <StatCard label="Active Flights" value={activeFlightsTotal} />
        </StatGrid>

        <FilterBar
          filters={[
            {
              key: "channel",
              label: "All Channels",
              value: channelFilter,
              options: channels.map((c) => ({ value: c, label: c })),
            },
            {
              key: "status",
              label: "All Status",
              value: statusFilter,
              options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
          ]}
          onFilterChange={(key, value) => {
            if (key === "channel") setChannelFilter(value);
            if (key === "status") setStatusFilter(value);
          }}
          searchPlaceholder="Search placements..."
          onSearch={(q) => setSearch(q)}
        />

        <AdminDataTable
          columns={columns}
          data={filtered}
          emptyMessage="No ad placements found."
        />
      </div>
    </>
  );
}
