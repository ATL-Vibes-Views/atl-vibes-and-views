"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Pagination } from "@/components/portal/Pagination";
import { updateSubmissionStatus } from "@/app/admin/actions";

/* ============================================================
   SUBMISSIONS — Review queue for business & event submissions
   ============================================================ */

interface SubmissionRow {
  id: string;
  submission_type: "business" | "event";
  submitter_name: string;
  submitter_email: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "needs_info";
  reviewer_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 25;

const statusBadgeMap: Record<string, "green" | "gold" | "gray" | "red" | "blue" | "orange"> = {
  pending: "gold",
  under_review: "blue",
  approved: "green",
  rejected: "red",
  needs_info: "orange",
};

export function SubmissionsClient({ submissions }: { submissions: SubmissionRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState<string | null>(null);

  const handleSubmissionAction = useCallback(async (id: string, status: string) => {
    setActing(id);
    const result = await updateSubmissionStatus(id, status);
    setActing(null);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    router.refresh();
  }, [router]);

  const filtered = useMemo(() => {
    let items = submissions;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (s) =>
          s.submitter_name.toLowerCase().includes(q) ||
          s.submitter_email.toLowerCase().includes(q)
      );
    }
    if (statusFilter) items = items.filter((s) => s.status === statusFilter);
    if (typeFilter) items = items.filter((s) => s.submission_type === typeFilter);
    return items;
  }, [submissions, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const bizCount = submissions.filter((s) => s.submission_type === "business").length;
  const eventCount = submissions.filter((s) => s.submission_type === "event").length;

  const columns = useMemo(
    () => [
      {
        key: "submitter_name",
        header: "Submitter",
        width: "20%",
        render: (item: SubmissionRow) => (
          <div>
            <span className="text-[13px] font-semibold text-black">{item.submitter_name}</span>
            <span className="block text-[11px] text-[#6b7280]">{item.submitter_email}</span>
          </div>
        ),
      },
      {
        key: "submission_type",
        header: "Type",
        render: (item: SubmissionRow) => (
          <StatusBadge variant={item.submission_type === "business" ? "blue" : "purple"}>
            {item.submission_type}
          </StatusBadge>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (item: SubmissionRow) => (
          <StatusBadge variant={statusBadgeMap[item.status] ?? "gray"}>
            {item.status.replace("_", " ")}
          </StatusBadge>
        ),
      },
      {
        key: "reviewer_notes",
        header: "Notes",
        width: "25%",
        render: (item: SubmissionRow) => (
          <span className="text-[12px] text-[#6b7280] line-clamp-1">
            {item.reviewer_notes ?? "—"}
          </span>
        ),
      },
      {
        key: "created_at",
        header: "Submitted",
        render: (item: SubmissionRow) => (
          <span className="text-[12px] text-[#6b7280]">
            {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <>
      <PortalTopbar title="Submissions" />
      <div className="p-8 space-y-4">
        <StatGrid columns={4}>
          <StatCard label="Total Submissions" value={submissions.length} />
          <StatCard
            label="Pending"
            value={pendingCount}
            badge={pendingCount > 0 ? { text: "Action", variant: "red" } : undefined}
          />
          <StatCard label="Businesses" value={bizCount} />
          <StatCard label="Events" value={eventCount} />
        </StatGrid>

        <FilterBar
          filters={[
            {
              key: "status",
              label: "All Status",
              value: statusFilter,
              options: [
                { value: "pending", label: "Pending" },
                { value: "under_review", label: "Under Review" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "needs_info", label: "Needs Info" },
              ],
            },
            {
              key: "type",
              label: "All Types",
              value: typeFilter,
              options: [
                { value: "business", label: "Business" },
                { value: "event", label: "Event" },
              ],
            },
          ]}
          onFilterChange={(key, value) => {
            if (key === "status") setStatusFilter(value);
            if (key === "type") setTypeFilter(value);
            setPage(1);
          }}
          searchPlaceholder="Search submissions..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
        />

        <AdminDataTable
          columns={columns}
          data={paginated}
          actions={(item) => (
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmissionAction(item.id, "approved")}
                disabled={acting === item.id}
                className="text-[#16a34a] text-xs font-semibold hover:underline disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleSubmissionAction(item.id, "rejected")}
                disabled={acting === item.id}
                className="text-[#c1121f] text-xs font-semibold hover:underline disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}
          emptyMessage="No submissions found."
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
