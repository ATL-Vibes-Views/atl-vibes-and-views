"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Building2, Check } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { Pagination } from "@/components/portal/Pagination";

interface BusinessRow {
  id: string;
  business_name: string;
  slug: string;
  status: string;
  tier: string;
  claimed: boolean;
  claim_status: string;
  created_at: string;
  categories: { name: string } | null;
  neighborhoods: { name: string } | null;
}

interface BusinessesClientProps {
  businesses: BusinessRow[];
  categories: { id: string; name: string }[];
  neighborhoods: { id: string; name: string }[];
}

const ITEMS_PER_PAGE = 25;

const statusBadgeMap: Record<string, "green" | "blue" | "gray"> = {
  active: "green",
  draft: "blue",
  inactive: "gray",
};

const tierBadgeMap: Record<string, "gold" | "green" | "gray"> = {
  premium: "gold",
  featured: "green",
  standard: "gray",
  free: "gray",
};

export function BusinessesClient({ businesses, categories, neighborhoods }: BusinessesClientProps) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = businesses;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((b) => b.business_name.toLowerCase().includes(q));
    }
    if (tierFilter) items = items.filter((b) => b.tier === tierFilter);
    if (categoryFilter) items = items.filter((b) => {
      const catName = b.categories?.name ?? "";
      return categories.find((c) => c.id === categoryFilter)?.name === catName;
    });
    return items;
  }, [businesses, search, tierFilter, categoryFilter, categories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "tier") setTierFilter(value);
    if (key === "category") setCategoryFilter(value);
    setPage(1);
  };

  const columns = [
    {
      key: "business_name",
      header: "Business Name",
      width: "30%",
      render: (item: BusinessRow) => (
        <Link
          href={`/admin/businesses/${item.id}`}
          className="font-display text-[14px] font-semibold text-black hover:text-[#c1121f] transition-colors"
        >
          {item.business_name}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: BusinessRow) => (
        <StatusBadge variant={statusBadgeMap[item.status] ?? "gray"}>
          {item.status}
        </StatusBadge>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      render: (item: BusinessRow) => (
        <StatusBadge variant={tierBadgeMap[item.tier] ?? "gray"}>
          {item.tier}
        </StatusBadge>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item: BusinessRow) => (
        <span className="text-[13px]">{item.categories?.name ?? "—"}</span>
      ),
    },
    {
      key: "neighborhood",
      header: "Neighborhood",
      render: (item: BusinessRow) => (
        <span className="text-[13px]">{item.neighborhoods?.name ?? "—"}</span>
      ),
    },
    {
      key: "claimed",
      header: "Claimed",
      render: (item: BusinessRow) =>
        item.claimed ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#16a34a]">
            <Check size={14} /> Verified
          </span>
        ) : (
          <span className="text-[12px] text-[#d1d5db]">—</span>
        ),
    },
  ];

  return (
    <>
      <PortalTopbar
        title="Business Listings"
        actions={
          <Link
            href="/admin/businesses/new"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors"
          >
            + Add Business
          </Link>
        }
      />
      <div className="p-8 space-y-4">
        <FilterBar
          filters={[
            {
              key: "tier",
              label: "All Tiers",
              value: tierFilter,
              options: [
                { value: "free", label: "Free" },
                { value: "standard", label: "Standard" },
                { value: "premium", label: "Premium" },
              ],
            },
            {
              key: "category",
              label: "All Categories",
              value: categoryFilter,
              options: categories.map((c) => ({ value: c.id, label: c.name })),
            },
          ]}
          onFilterChange={handleFilterChange}
          searchPlaceholder="Search businesses..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
        />

        <AdminDataTable
          columns={columns}
          data={paginated}
          actions={(item) => (
            <Link
              href={`/admin/businesses/${item.id}`}
              className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Edit
            </Link>
          )}
          emptyMessage="No businesses found"
        />

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[#6b7280]">
            <Building2 size={32} className="mb-2" />
            <span className="text-[13px]">No businesses found</span>
          </div>
        )}

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
