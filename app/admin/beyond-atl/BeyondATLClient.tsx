"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { AdminDataTable } from "@/components/portal/AdminDataTable";

interface CityRow {
  id: string;
  name: string;
  slug: string;
  state: string;
  is_active: boolean;
  business_count: number;
  story_count: number;
}

interface BeyondATLClientProps {
  cities: CityRow[];
}

export function BeyondATLClient({ cities }: BeyondATLClientProps) {
  const columns = [
    {
      key: "name",
      header: "City",
      width: "25%",
      render: (item: CityRow) => (
        <Link
          href={`/admin/beyond-atl/${item.id}`}
          className="font-display text-[14px] font-semibold text-black hover:text-[#c1121f] transition-colors"
        >
          {item.name}
        </Link>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      render: (item: CityRow) => (
        <span className="text-[13px] font-mono">{item.slug}</span>
      ),
    },
    {
      key: "business_count",
      header: "Businesses",
      render: (item: CityRow) => (
        <span className="text-[13px]">{item.business_count}</span>
      ),
    },
    {
      key: "story_count",
      header: "Stories",
      render: (item: CityRow) => (
        <span className="text-[13px]">{item.story_count}</span>
      ),
    },
    {
      key: "is_active",
      header: "Active",
      render: (item: CityRow) =>
        item.is_active
          ? <StatusBadge variant="green">Yes</StatusBadge>
          : <StatusBadge variant="gray">No</StatusBadge>,
    },
  ];

  return (
    <>
      <PortalTopbar
        title="Beyond ATL Cities"
        actions={
          <Link
            href="/admin/beyond-atl/new"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors"
          >
            + Add City
          </Link>
        }
      />
      <div className="p-8 space-y-4">
        <AdminDataTable
          columns={columns}
          data={cities}
          actions={(item) => (
            <Link
              href={`/admin/beyond-atl/${item.id}`}
              className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Edit
            </Link>
          )}
          emptyMessage="No cities found"
        />

        {cities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[#6b7280]">
            <Globe size={32} className="mb-2" />
            <span className="text-[13px]">No cities found</span>
          </div>
        )}
      </div>
    </>
  );
}
