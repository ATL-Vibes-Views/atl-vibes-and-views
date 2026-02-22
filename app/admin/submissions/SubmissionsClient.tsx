"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { FilterBar } from "@/components/portal/FilterBar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Pagination } from "@/components/portal/Pagination";
import { updateSubmissionStatus } from "@/app/admin/actions";

/* ============================================================
   SUBMISSIONS — Review queue for business & event submissions
   ============================================================ */

interface SubmissionRow {
  id: string;
  submission_type: string;
  submitter_name: string;
  submitter_email: string;
  status: string;
  tier: string | null;
  stripe_session_id: string | null;
  stripe_customer_id: string | null;
  created_record_id: string | null;
  created_at: string;
  updated_at: string;
  data: Record<string, unknown> | null;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

        <div className="bg-white border border-[#e5e5e5] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f5f5f5] border-b-2 border-[#e5e5e5]">
                <th className="text-left text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3.5 py-2.5">Type</th>
                <th className="text-left text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3.5 py-2.5" style={{ width: "20%" }}>Submitter</th>
                <th className="text-left text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3.5 py-2.5">Email</th>
                <th className="text-left text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3.5 py-2.5">Tier</th>
                <th className="text-left text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3.5 py-2.5">Status</th>
                <th className="text-left text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3.5 py-2.5">Date</th>
                <th className="text-right text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3.5 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3.5 py-10 text-center text-[13px] text-[#6b7280]">No submissions found.</td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr
                      className="border-b border-[#f0f0f0] transition-colors cursor-pointer hover:bg-[#fafafa]"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      <td className="px-3.5 py-2.5">
                        <StatusBadge variant={item.submission_type === "business" ? "blue" : "purple"}>
                          {item.submission_type}
                        </StatusBadge>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="text-[13px] font-semibold text-black">{item.submitter_name}</span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="text-[12px] text-[#6b7280]">{item.submitter_email}</span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        {item.tier === "premium" ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fee198] text-[#1a1a1a]">
                            premium
                          </span>
                        ) : item.tier === "standard" ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-700">
                            standard
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-500">
                            {item.tier ?? "free"}
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <StatusBadge variant={statusBadgeMap[item.status] ?? "gray"}>
                          {item.status.replace(/_/g, " ")}
                        </StatusBadge>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="text-[12px] text-[#6b7280]">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
                      </td>
                    </tr>
                    {expandedId === item.id && (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 bg-[#fafafa] border-t border-gray-100">
                          <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">Tier</span>
                              <p className="text-[13px] text-gray-dark mt-0.5">{item.tier ?? "free"}</p>
                            </div>
                            <div>
                              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">Updated</span>
                              <p className="text-[13px] text-gray-dark mt-0.5">{new Date(item.updated_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">Stripe Session</span>
                              <p className="text-[12px] text-gray-dark mt-0.5 break-all">{item.stripe_session_id ?? "—"}</p>
                            </div>
                            <div>
                              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">Stripe Customer</span>
                              <p className="text-[12px] text-gray-dark mt-0.5 break-all">{item.stripe_customer_id ?? "—"}</p>
                            </div>
                          </div>
                          {item.data && (
                            <div className="mt-4">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 block mb-3">
                                Submission Details
                              </span>
                              <div className="grid grid-cols-2 gap-3">
                                {Object.entries(item.data).map(([key, value]) => {
                                  if (!value) return null;

                                  if (typeof value === "string" && (key.includes("logo") || key.includes("image") || key.includes("photo")) && value.startsWith("http")) {
                                    return (
                                      <div key={key} className="col-span-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 block mb-1">
                                          {key.replace(/_/g, " ")}
                                        </span>
                                        <img src={value} alt={key} className="h-32 object-cover rounded border border-gray-200" />
                                      </div>
                                    );
                                  }

                                  if (key === "photo_urls" && Array.isArray(value)) {
                                    return (
                                      <div key={key} className="col-span-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 block mb-1">Photos</span>
                                        <div className="grid grid-cols-4 gap-2">
                                          {(value as string[]).map((url, i) => (
                                            <img key={i} src={url} alt="" className="h-24 w-full object-cover rounded border border-gray-200" />
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }

                                  if (Array.isArray(value) || typeof value === "object") return null;

                                  return (
                                    <div key={key}>
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 block">
                                        {key.replace(/_/g, " ")}
                                      </span>
                                      <p className="text-[13px] text-gray-800 mt-0.5">
                                        {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 block mb-1">
                                  Reviewer Notes
                                </label>
                                <textarea
                                  placeholder="Add notes..."
                                  className="w-full text-[13px] border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-[#e6c46d]"
                                  rows={2}
                                />
                              </div>

                              {item.created_record_id && (
                                <div className="mt-3">
                                  <a
                                    href={item.submission_type === "business"
                                      ? `/admin/businesses/${item.created_record_id}`
                                      : `/admin/events/${item.created_record_id}`}
                                    className="text-[12px] text-[#c1121f] font-semibold hover:underline"
                                    target="_blank"
                                  >
                                    View Created Record →
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

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
