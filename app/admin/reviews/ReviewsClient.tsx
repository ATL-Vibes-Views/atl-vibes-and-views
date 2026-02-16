"use client";

import { useMemo, useState } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Pagination } from "@/components/portal/Pagination";

/* ============================================================
   REVIEWS — Moderation queue + stats
   ============================================================ */

interface ReviewRow {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  is_verified_visit: boolean;
  helpful_count: number;
  reported_count: number;
  auto_flagged: boolean;
  created_at: string;
}

interface ReviewsClientProps {
  reviews: ReviewRow[];
  businesses: { id: string; business_name: string }[];
  users: { id: string; email: string; display_name: string | null }[];
}

const ITEMS_PER_PAGE = 25;

const statusBadgeMap: Record<string, "green" | "gold" | "gray" | "red" | "orange"> = {
  approved: "green",
  pending_review: "gold",
  rejected: "red",
  flagged: "orange",
  removed: "gray",
};

export function ReviewsClient({ reviews, businesses, users }: ReviewsClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const bizMap = useMemo(() => {
    const map: Record<string, string> = {};
    businesses.forEach((b) => { map[b.id] = b.business_name; });
    return map;
  }, [businesses]);

  const userMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => { map[u.id] = u.display_name ?? u.email; });
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    let items = reviews;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.body?.toLowerCase().includes(q) ||
          bizMap[r.business_id]?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) items = items.filter((r) => r.status === statusFilter);
    return items;
  }, [reviews, search, statusFilter, bizMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const pendingCount = reviews.filter((r) => r.status === "pending_review").length;
  const flaggedCount = reviews.filter((r) => r.auto_flagged).length;

  const columns = useMemo(
    () => [
      {
        key: "business",
        header: "Business",
        width: "20%",
        render: (item: ReviewRow) => (
          <span className="font-display text-[14px] font-semibold text-black">
            {bizMap[item.business_id] ?? "Unknown"}
          </span>
        ),
      },
      {
        key: "rating",
        header: "Rating",
        render: (item: ReviewRow) => (
          <span className="text-[13px] text-[#374151]">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</span>
        ),
      },
      {
        key: "title",
        header: "Review",
        width: "25%",
        render: (item: ReviewRow) => (
          <div>
            <span className="text-[13px] text-[#374151] font-medium">{item.title ?? "No title"}</span>
            {item.body && (
              <span className="block text-[11px] text-[#6b7280] line-clamp-1">{item.body}</span>
            )}
          </div>
        ),
      },
      {
        key: "user",
        header: "User",
        render: (item: ReviewRow) => (
          <span className="text-[12px] text-[#6b7280]">{userMap[item.user_id] ?? "—"}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (item: ReviewRow) => (
          <div className="flex items-center gap-1">
            <StatusBadge variant={statusBadgeMap[item.status] ?? "gray"}>
              {item.status}
            </StatusBadge>
            {item.auto_flagged && (
              <StatusBadge variant="red">Flagged</StatusBadge>
            )}
          </div>
        ),
      },
      {
        key: "created_at",
        header: "Date",
        render: (item: ReviewRow) => (
          <span className="text-[12px] text-[#6b7280]">
            {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        ),
      },
    ],
    [bizMap, userMap]
  );

  return (
    <>
      <PortalTopbar title="Reviews" />
      <div className="p-8 max-[899px]:pt-16 space-y-4">
        <StatGrid columns={4}>
          <StatCard label="Total Reviews" value={reviews.length} />
          <StatCard
            label="Pending"
            value={pendingCount}
            badge={pendingCount > 0 ? { text: "Action", variant: "red" } : undefined}
          />
          <StatCard
            label="Flagged"
            value={flaggedCount}
            badge={flaggedCount > 0 ? { text: "Review", variant: "orange" } : undefined}
          />
          <StatCard
            label="Avg Rating"
            value={reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—"}
          />
        </StatGrid>

        <FilterBar
          filters={[
            {
              key: "status",
              label: "All Status",
              value: statusFilter,
              options: [
                { value: "pending_review", label: "Pending Review" },
                { value: "approved", label: "Approved" },
                { value: "flagged", label: "Flagged" },
                { value: "rejected", label: "Rejected" },
                { value: "removed", label: "Removed" },
              ],
            },
          ]}
          onFilterChange={(key, value) => {
            if (key === "status") setStatusFilter(value);
            setPage(1);
          }}
          searchPlaceholder="Search reviews..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
        />

        <AdminDataTable
          columns={columns}
          data={paginated}
          actions={(item) => (
            <div className="flex gap-2">
              <button
                onClick={() => console.log("Approve review:", item.id)}
                className="text-[#16a34a] text-xs font-semibold hover:underline"
              >
                Approve
              </button>
              <button
                onClick={() => console.log("Reject review:", item.id)}
                className="text-[#c1121f] text-xs font-semibold hover:underline"
              >
                Reject
              </button>
            </div>
          )}
          emptyMessage="No reviews found."
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
