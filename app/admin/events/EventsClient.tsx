"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, Check } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { Pagination } from "@/components/portal/Pagination";

interface EventRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  start_date: string;
  start_time: string | null;
  venue_name: string | null;
  is_free: boolean;
  ticket_price_min: number | null;
  tier: string;
  event_type: string | null;
  categories: { name: string } | null;
  neighborhoods: { name: string } | null;
}

interface EventsClientProps {
  events: EventRow[];
  categories: { id: string; name: string }[];
  neighborhoods: { id: string; name: string }[];
}

const ITEMS_PER_PAGE = 25;

const statusBadgeMap: Record<string, "green" | "blue" | "gray"> = {
  active: "green",
  draft: "blue",
  completed: "gray",
};

export function EventsClient({ events, categories }: EventsClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = events;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((e) => e.title.toLowerCase().includes(q));
    }
    if (statusFilter) items = items.filter((e) => e.status === statusFilter);
    if (categoryFilter) items = items.filter((e) => {
      const catName = e.categories?.name ?? "";
      return categories.find((c) => c.id === categoryFilter)?.name === catName;
    });
    return items;
  }, [events, search, statusFilter, categoryFilter, categories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") setStatusFilter(value);
    if (key === "category") setCategoryFilter(value);
    setPage(1);
  };

  const columns = [
    {
      key: "title",
      header: "Title",
      width: "30%",
      render: (item: EventRow) => (
        <Link
          href={`/admin/events/${item.id}`}
          className="font-display text-[14px] font-semibold text-black hover:text-[#c1121f] transition-colors"
        >
          {item.title}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: EventRow) => (
        <StatusBadge variant={statusBadgeMap[item.status] ?? "gray"}>
          {item.status}
        </StatusBadge>
      ),
    },
    {
      key: "start_date",
      header: "Date",
      render: (item: EventRow) => (
        <span className="text-[13px]">
          {new Date(item.start_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      ),
    },
    {
      key: "venue_name",
      header: "Venue",
      render: (item: EventRow) => (
        <span className="text-[13px]">{item.venue_name ?? "—"}</span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item: EventRow) => (
        <span className="text-[13px]">{item.categories?.name ?? "—"}</span>
      ),
    },
    {
      key: "is_free",
      header: "Free?",
      render: (item: EventRow) =>
        item.is_free ? (
          <span className="text-[#16a34a]"><Check size={16} /></span>
        ) : (
          <span className="text-[13px]">{item.ticket_price_min != null ? `$${item.ticket_price_min}` : "—"}</span>
        ),
    },
  ];

  return (
    <>
      <PortalTopbar
        title="Events"
        actions={
          <Link
            href="/admin/events/new"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors"
          >
            + Create Event
          </Link>
        }
      />
      <div className="p-8 space-y-4">
        <FilterBar
          filters={[
            {
              key: "category",
              label: "All Categories",
              value: categoryFilter,
              options: categories.map((c) => ({ value: c.id, label: c.name })),
            },
            {
              key: "status",
              label: "All Status",
              value: statusFilter,
              options: [
                { value: "active", label: "Active" },
                { value: "draft", label: "Draft" },
                { value: "completed", label: "Completed" },
              ],
            },
          ]}
          onFilterChange={handleFilterChange}
          searchPlaceholder="Search events..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
        />

        <AdminDataTable
          columns={columns}
          data={paginated}
          actions={(item) => (
            <Link
              href={`/admin/events/${item.id}`}
              className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Edit
            </Link>
          )}
          emptyMessage="No events found"
        />

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[#6b7280]">
            <Calendar size={32} className="mb-2" />
            <span className="text-[13px]">No events found</span>
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
