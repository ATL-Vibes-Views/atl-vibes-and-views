"use client";

import { useMemo, useState } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Pagination } from "@/components/portal/Pagination";

/* ============================================================
   TAGS — Taxonomy management
   ============================================================ */

interface TagRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean | null;
  created_at: string;
}

interface TagsClientProps {
  tags: TagRow[];
  usageMap: Record<string, number>;
}

const ITEMS_PER_PAGE = 50;

export function TagsClient({ tags, usageMap }: TagsClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = tags;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
      );
    }
    if (statusFilter === "active") items = items.filter((t) => t.is_active !== false);
    if (statusFilter === "inactive") items = items.filter((t) => t.is_active === false);
    return items;
  }, [tags, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Tag",
        width: "25%",
        render: (item: TagRow) => (
          <div>
            <span className="font-display text-[14px] font-semibold text-black">{item.name}</span>
            <span className="block text-[11px] text-[#9ca3af] font-mono">/{item.slug}</span>
          </div>
        ),
      },
      {
        key: "usage",
        header: "Usage",
        render: (item: TagRow) => (
          <span className="text-[13px] text-[#374151]">{usageMap[item.id] ?? 0} items</span>
        ),
      },
      {
        key: "is_active",
        header: "Status",
        render: (item: TagRow) => (
          <StatusBadge variant={item.is_active !== false ? "green" : "gray"}>
            {item.is_active !== false ? "Active" : "Inactive"}
          </StatusBadge>
        ),
      },
      {
        key: "description",
        header: "Description",
        render: (item: TagRow) => (
          <span className="text-[12px] text-[#6b7280] line-clamp-1">{item.description ?? "—"}</span>
        ),
      },
      {
        key: "created_at",
        header: "Created",
        render: (item: TagRow) => (
          <span className="text-[12px] text-[#6b7280]">
            {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        ),
      },
    ],
    [usageMap]
  );

  return (
    <>
      <PortalTopbar
        title="Tags"
        actions={
          <button
            onClick={() => console.log("Create tag")}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
          >
            + New Tag
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
            setPage(1);
          }}
          searchPlaceholder="Search tags..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
        />

        <AdminDataTable
          columns={columns}
          data={paginated}
          actions={(item) => (
            <button
              onClick={() => console.log("Edit tag:", item.id)}
              className="text-[#c1121f] text-xs font-semibold hover:underline"
            >
              Edit
            </button>
          )}
          emptyMessage="No tags found."
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
