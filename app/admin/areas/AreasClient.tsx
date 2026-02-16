"use client";

import Link from "next/link";
import { Map } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { AdminDataTable } from "@/components/portal/AdminDataTable";

interface AreaRow {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  neighborhood_count: number;
  business_count: number;
}

interface AreasClientProps {
  areas: AreaRow[];
}

export function AreasClient({ areas }: AreasClientProps) {
  const columns = [
    {
      key: "name",
      header: "Name",
      width: "25%",
      render: (item: AreaRow) => (
        <Link
          href={`/admin/areas/${item.id}`}
          className="font-display text-[14px] font-semibold text-black hover:text-[#c1121f] transition-colors"
        >
          {item.name}
        </Link>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      render: (item: AreaRow) => (
        <span className="text-[13px] font-mono">{item.slug}</span>
      ),
    },
    {
      key: "neighborhood_count",
      header: "Neighborhoods",
      render: (item: AreaRow) => (
        <span className="text-[13px]">{item.neighborhood_count}</span>
      ),
    },
    {
      key: "business_count",
      header: "Businesses",
      render: (item: AreaRow) => (
        <span className="text-[13px]">{item.business_count}</span>
      ),
    },
    {
      key: "is_active",
      header: "Active",
      render: (item: AreaRow) =>
        item.is_active
          ? <StatusBadge variant="green">Yes</StatusBadge>
          : <StatusBadge variant="gray">No</StatusBadge>,
    },
  ];

  return (
    <>
      <PortalTopbar
        title="Areas"
        actions={
          <Link
            href="/admin/areas/new"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors"
          >
            + Add Area
          </Link>
        }
      />
      <div className="p-8 space-y-4">
        <AdminDataTable
          columns={columns}
          data={areas}
          actions={(item) => (
            <Link
              href={`/admin/areas/${item.id}`}
              className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Edit
            </Link>
          )}
          emptyMessage="No areas found"
        />

        {areas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[#6b7280]">
            <Map size={32} className="mb-2" />
            <span className="text-[13px]">No areas found</span>
          </div>
        )}
      </div>
    </>
  );
}
