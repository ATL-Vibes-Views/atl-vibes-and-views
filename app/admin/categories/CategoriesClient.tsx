"use client";

import { useMemo, useState } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";

/* ============================================================
   CATEGORIES — Taxonomy management
   ============================================================ */

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  applies_to: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface CategoriesClientProps {
  categories: CategoryRow[];
  usageMap: Record<string, number>;
}

export function CategoriesClient({ categories, usageMap }: CategoriesClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    let items = categories;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
      );
    }
    if (statusFilter === "active") items = items.filter((c) => c.is_active);
    if (statusFilter === "inactive") items = items.filter((c) => !c.is_active);
    return items;
  }, [categories, search, statusFilter]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Category",
        width: "25%",
        render: (item: CategoryRow) => (
          <div>
            <span className="font-display text-[14px] font-semibold text-black">{item.name}</span>
            <span className="block text-[11px] text-[#9ca3af] font-mono">/{item.slug}</span>
          </div>
        ),
      },
      {
        key: "applies_to",
        header: "Applies To",
        render: (item: CategoryRow) => (
          <div className="flex flex-wrap gap-1">
            {item.applies_to.map((a) => (
              <span key={a} className="inline-block px-2 py-0.5 text-[10px] bg-[#f5f5f5] text-[#374151] rounded-full">
                {a}
              </span>
            ))}
          </div>
        ),
      },
      {
        key: "usage",
        header: "Usage",
        render: (item: CategoryRow) => (
          <span className="text-[13px] text-[#374151]">{usageMap[item.id] ?? 0} items</span>
        ),
      },
      {
        key: "sort_order",
        header: "Order",
        render: (item: CategoryRow) => (
          <span className="text-[13px] text-[#6b7280]">{item.sort_order}</span>
        ),
      },
      {
        key: "is_active",
        header: "Status",
        render: (item: CategoryRow) => (
          <StatusBadge variant={item.is_active ? "green" : "gray"}>
            {item.is_active ? "Active" : "Inactive"}
          </StatusBadge>
        ),
      },
      {
        key: "description",
        header: "Description",
        render: (item: CategoryRow) => (
          <span className="text-[12px] text-[#6b7280] line-clamp-1">{item.description ?? "—"}</span>
        ),
      },
    ],
    [usageMap]
  );

  return (
    <>
      <PortalTopbar
        title="Categories"
        actions={
          <button
            onClick={() => console.log("Create category")}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
          >
            + New Category
          </button>
        }
      />
      <div className="p-8 space-y-4">
        <FilterBar
          filters={[
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
            if (key === "status") setStatusFilter(value);
          }}
          searchPlaceholder="Search categories..."
          onSearch={(q) => setSearch(q)}
        />

        <AdminDataTable
          columns={columns}
          data={filtered}
          actions={(item) => (
            <button
              onClick={() => console.log("Edit category:", item.id)}
              className="text-[#c1121f] text-xs font-semibold hover:underline"
            >
              Edit
            </button>
          )}
          emptyMessage="No categories found."
        />
      </div>
    </>
  );
}
