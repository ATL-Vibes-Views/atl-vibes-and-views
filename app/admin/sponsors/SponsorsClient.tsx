"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Pagination } from "@/components/portal/Pagination";

/* ============================================================
   SPONSORS LIST — All sponsors with filtering
   ============================================================ */

interface SponsorRow {
  id: string;
  sponsor_name: string;
  contact_name: string | null;
  contact_email: string | null;
  status: string;
  campaign_name: string | null;
  campaign_value: number | null;
  campaign_start: string | null;
  campaign_end: string | null;
  package_type: string | null;
  placements_total: number | null;
  placements_used: number | null;
  is_active: boolean | null;
  business_id: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 25;

const statusBadgeMap: Record<string, "green" | "gold" | "gray" | "blue" | "red"> = {
  active: "green",
  pending: "gold",
  completed: "gray",
  paused: "blue",
  cancelled: "red",
};

export function SponsorsClient({ sponsors }: { sponsors: SponsorRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = sponsors;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (s) =>
          s.sponsor_name.toLowerCase().includes(q) ||
          s.contact_name?.toLowerCase().includes(q) ||
          s.campaign_name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) items = items.filter((s) => s.status === statusFilter);
    return items;
  }, [sponsors, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const activeCount = sponsors.filter((s) => s.status === "active").length;
  const totalValue = sponsors.reduce((sum, s) => sum + (s.campaign_value ?? 0), 0);

  const columns = useMemo(
    () => [
      {
        key: "sponsor_name",
        header: "Sponsor",
        width: "25%",
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
        key: "contact_name",
        header: "Contact",
        render: (item: SponsorRow) => (
          <div>
            <span className="text-[13px] text-[#374151]">{item.contact_name ?? "—"}</span>
            {item.contact_email && (
              <span className="block text-[11px] text-[#6b7280]">{item.contact_email}</span>
            )}
          </div>
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
        key: "campaign_name",
        header: "Campaign",
        render: (item: SponsorRow) => (
          <span className="text-[13px] text-[#374151]">{item.campaign_name ?? "—"}</span>
        ),
      },
      {
        key: "package_type",
        header: "Package",
        render: (item: SponsorRow) => (
          <span className="text-[13px] text-[#374151]">{item.package_type ?? "—"}</span>
        ),
      },
      {
        key: "campaign_value",
        header: "Value",
        render: (item: SponsorRow) => (
          <span className="text-[13px] font-semibold text-[#374151]">
            {item.campaign_value
              ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(item.campaign_value)
              : "—"}
          </span>
        ),
      },
      {
        key: "campaign_end",
        header: "Ends",
        render: (item: SponsorRow) => (
          <span className="text-[12px] text-[#6b7280]">
            {item.campaign_end
              ? new Date(item.campaign_end).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "—"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <>
      <PortalTopbar
        title="Sponsors"
        actions={
          <button
            onClick={() => console.log("Create sponsor")}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
          >
            + New Sponsor
          </button>
        }
      />
      <div className="p-8 max-[899px]:pt-16 space-y-4">
        <StatGrid columns={3}>
          <StatCard label="Total Sponsors" value={sponsors.length} />
          <StatCard
            label="Active"
            value={activeCount}
            badge={activeCount > 0 ? { text: "Live", variant: "green" } : undefined}
          />
          <StatCard
            label="Total Value"
            value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(totalValue)}
          />
        </StatGrid>

        <FilterBar
          filters={[
            {
              key: "status",
              label: "All Status",
              value: statusFilter,
              options: [
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "completed", label: "Completed" },
                { value: "paused", label: "Paused" },
                { value: "cancelled", label: "Cancelled" },
              ],
            },
          ]}
          onFilterChange={(key, value) => {
            if (key === "status") setStatusFilter(value);
            setPage(1);
          }}
          searchPlaceholder="Search sponsors..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
        />

        <AdminDataTable
          columns={columns}
          data={paginated}
          actions={(item) => (
            <Link
              href={`/admin/sponsors/${item.id}`}
              className="text-[#c1121f] text-xs font-semibold hover:underline"
            >
              View
            </Link>
          )}
          emptyMessage="No sponsors found."
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}
