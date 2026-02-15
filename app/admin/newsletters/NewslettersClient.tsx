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
   NEWSLETTERS — Issue management + performance stats
   ============================================================ */

interface NewsletterRow {
  id: string;
  name: string;
  slug: string;
  issue_date: string;
  issue_slug: string;
  subject_line: string;
  status: string;
  is_public: boolean | null;
  open_rate: number | null;
  click_rate: number | null;
  send_count: number | null;
  newsletter_type_id: string;
  sponsor_business_id: string | null;
  created_at: string;
}

interface NewslettersClientProps {
  newsletters: NewsletterRow[];
  types: { id: string; name: string; slug: string; frequency: string }[];
}

const ITEMS_PER_PAGE = 25;

const statusBadgeMap: Record<string, "green" | "gold" | "gray" | "blue" | "purple"> = {
  sent: "green",
  draft: "gray",
  scheduled: "purple",
  sending: "blue",
  archived: "gray",
};

export function NewslettersClient({ newsletters, types }: NewslettersClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const typeMap = useMemo(() => {
    const map: Record<string, string> = {};
    types.forEach((t) => { map[t.id] = t.name; });
    return map;
  }, [types]);

  const filtered = useMemo(() => {
    let items = newsletters;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (n) =>
          n.subject_line.toLowerCase().includes(q) ||
          n.name.toLowerCase().includes(q)
      );
    }
    if (statusFilter) items = items.filter((n) => n.status === statusFilter);
    if (typeFilter) items = items.filter((n) => n.newsletter_type_id === typeFilter);
    return items;
  }, [newsletters, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const sentCount = newsletters.filter((n) => n.status === "sent").length;
  const avgOpenRate = (() => {
    const withRate = newsletters.filter((n) => n.open_rate != null);
    if (withRate.length === 0) return 0;
    return Math.round(withRate.reduce((s, n) => s + (n.open_rate ?? 0), 0) / withRate.length);
  })();

  const columns = useMemo(
    () => [
      {
        key: "subject_line",
        header: "Subject",
        width: "30%",
        render: (item: NewsletterRow) => (
          <div>
            <span className="font-display text-[14px] font-semibold text-black">{item.subject_line}</span>
            <span className="block text-[11px] text-[#9ca3af]">{typeMap[item.newsletter_type_id] ?? "—"}</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (item: NewsletterRow) => (
          <StatusBadge variant={statusBadgeMap[item.status] ?? "gray"}>
            {item.status}
          </StatusBadge>
        ),
      },
      {
        key: "issue_date",
        header: "Date",
        render: (item: NewsletterRow) => (
          <span className="text-[12px] text-[#6b7280]">
            {new Date(item.issue_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        ),
      },
      {
        key: "send_count",
        header: "Sent",
        render: (item: NewsletterRow) => (
          <span className="text-[13px] text-[#374151]">
            {item.send_count?.toLocaleString() ?? "—"}
          </span>
        ),
      },
      {
        key: "open_rate",
        header: "Open %",
        render: (item: NewsletterRow) => (
          <span className="text-[13px] text-[#374151]">
            {item.open_rate != null ? `${Math.round(item.open_rate)}%` : "—"}
          </span>
        ),
      },
      {
        key: "click_rate",
        header: "Click %",
        render: (item: NewsletterRow) => (
          <span className="text-[13px] text-[#374151]">
            {item.click_rate != null ? `${Math.round(item.click_rate)}%` : "—"}
          </span>
        ),
      },
      {
        key: "sponsored",
        header: "Sponsored",
        render: (item: NewsletterRow) => (
          <StatusBadge variant={item.sponsor_business_id ? "gold" : "gray"}>
            {item.sponsor_business_id ? "Yes" : "No"}
          </StatusBadge>
        ),
      },
    ],
    [typeMap]
  );

  return (
    <>
      <PortalTopbar title="Newsletters" />
      <div className="p-8 max-[899px]:pt-16 space-y-4">
        <StatGrid columns={4}>
          <StatCard label="Total Issues" value={newsletters.length} />
          <StatCard label="Sent" value={sentCount} />
          <StatCard label="Avg Open Rate" value={`${avgOpenRate}%`} />
          <StatCard label="Newsletter Types" value={types.length} />
        </StatGrid>

        <FilterBar
          filters={[
            {
              key: "status",
              label: "All Status",
              value: statusFilter,
              options: [
                { value: "sent", label: "Sent" },
                { value: "draft", label: "Draft" },
                { value: "scheduled", label: "Scheduled" },
              ],
            },
            {
              key: "type",
              label: "All Types",
              value: typeFilter,
              options: types.map((t) => ({ value: t.id, label: t.name })),
            },
          ]}
          onFilterChange={(key, value) => {
            if (key === "status") setStatusFilter(value);
            if (key === "type") setTypeFilter(value);
            setPage(1);
          }}
          searchPlaceholder="Search newsletters..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
        />

        {/* U11: HubSpot API limitation banner */}
        <div className="bg-[#fee198] px-4 py-3 text-[13px] text-[#1a1a1a] font-body">
          <span className="font-semibold">&#9888;&#65039; HubSpot API scope limitation</span> — newsletters assembled here, then copy HTML to paste into HubSpot for sending.
        </div>

        <AdminDataTable columns={columns} data={paginated} emptyMessage="No newsletters found." />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />

        {/* U10: Newsletter Templates section */}
        <div className="pt-4">
          <h3 className="font-display text-[18px] font-semibold text-black mb-3">Newsletter Templates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Weekly Brief", frequency: "Every Wednesday" },
              { name: "Atlanta Events", frequency: "Biweekly" },
              { name: "ON THE MENU", frequency: "Biweekly" },
              { name: "Development Brief", frequency: "Monthly" },
              { name: "Real Estate Snapshot", frequency: "Monthly" },
              { name: "Entrepreneurial Resources", frequency: "Monthly" },
            ].map((tpl) => (
              <div key={tpl.name} className="bg-white border border-[#e5e5e5] p-4">
                <p className="font-display text-[14px] font-bold text-black">{tpl.name}</p>
                <p className="text-[12px] text-[#6b7280] mt-0.5">{tpl.frequency}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
