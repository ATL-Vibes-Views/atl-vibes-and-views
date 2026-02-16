"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { Pagination } from "@/components/portal/Pagination";

interface NeighborhoodRow {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  areas: { name: string } | null;
  business_count: number;
  story_count: number;
}

interface NeighborhoodsClientProps {
  neighborhoods: NeighborhoodRow[];
  areas: { id: string; name: string }[];
}

const ITEMS_PER_PAGE = 25;

export function NeighborhoodsClient({ neighborhoods, areas }: NeighborhoodsClientProps) {
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = neighborhoods;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((n) => n.name.toLowerCase().includes(q));
    }
    if (areaFilter) {
      const areaName = areas.find((a) => a.id === areaFilter)?.name;
      items = items.filter((n) => n.areas?.name === areaName);
    }
    return items;
  }, [neighborhoods, search, areaFilter, areas]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const columns = [
    {
      key: "name",
      header: "Name",
      width: "30%",
      render: (item: NeighborhoodRow) => (
        <Link
          href={`/admin/neighborhoods/${item.id}`}
          className="font-display text-[14px] font-semibold text-black hover:text-[#c1121f] transition-colors"
        >
          {item.name}
        </Link>
      ),
    },
    {
      key: "area",
      header: "Area",
      render: (item: NeighborhoodRow) => (
        <span className="text-[13px]">{item.areas?.name ?? "—"}</span>
      ),
    },
    {
      key: "business_count",
      header: "Businesses",
      render: (item: NeighborhoodRow) => (
        <span className="text-[13px]">{item.business_count}</span>
      ),
    },
    {
      key: "story_count",
      header: "Stories",
      render: (item: NeighborhoodRow) => (
        <span className="text-[13px]">{item.story_count}</span>
      ),
    },
    {
      key: "is_active",
      header: "Active",
      render: (item: NeighborhoodRow) => {
        if (item.is_active && item.business_count === 0 && item.story_count === 0) {
          return <StatusBadge variant="yellow">Thin</StatusBadge>;
        }
        return item.is_active
          ? <StatusBadge variant="green">Yes</StatusBadge>
          : <StatusBadge variant="gray">No</StatusBadge>;
      },
    },
  ];

  return (
    <>
      <PortalTopbar
        title="Neighborhoods"
        actions={
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-[#e5e5e5] text-[#6b7280]">
            {neighborhoods.length} total
          </span>
        }
      />
      <div className="p-8 space-y-4">
        <FilterBar
          filters={[
            {
              key: "area",
              label: "All Areas",
              value: areaFilter,
              options: areas.map((a) => ({ value: a.id, label: a.name })),
            },
          ]}
          onFilterChange={(key, value) => { if (key === "area") setAreaFilter(value); setPage(1); }}
          searchPlaceholder="Search neighborhoods..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
        />

        <AdminDataTable
          columns={columns}
          data={paginated}
          actions={(item) => (
            <Link
              href={`/admin/neighborhoods/${item.id}`}
              className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Edit
            </Link>
          )}
          emptyMessage="No neighborhoods found"
        />

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[#6b7280]">
            <MapPin size={32} className="mb-2" />
            <span className="text-[13px]">No neighborhoods found</span>
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
