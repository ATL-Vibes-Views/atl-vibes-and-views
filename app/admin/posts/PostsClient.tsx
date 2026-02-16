"use client";

import { useState, useMemo } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { Pagination } from "@/components/portal/Pagination";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  type: string | null;
  content_type: string | null;
  category_id: string | null;
  neighborhood_id: string | null;
  word_count: number | null;
  featured_image_url: string | null;
  published_at: string | null;
  created_at: string;
  categories: { name: string } | null;
  neighborhoods: { name: string } | null;
}

interface PostsClientProps {
  posts: PostRow[];
  categories: { id: string; name: string }[];
}

const ITEMS_PER_PAGE = 25;

const statusBadgeMap: Record<string, "green" | "gray" | "blue" | "yellow" | "red"> = {
  published: "green",
  draft: "gray",
  ready_for_review: "blue",
  scheduled: "yellow",
  archived: "red",
};

export function PostsClient({ posts, categories }: PostsClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = posts;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (statusFilter) items = items.filter((p) => p.status === statusFilter);
    if (typeFilter) items = items.filter((p) => p.type === typeFilter);
    if (categoryFilter) items = items.filter((p) => p.category_id === categoryFilter);
    return items;
  }, [posts, search, statusFilter, typeFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") setStatusFilter(value);
    if (key === "type") setTypeFilter(value);
    if (key === "category") setCategoryFilter(value);
    setPage(1);
  };

  const columns = [
    {
      key: "title",
      header: "Title",
      width: "30%",
      render: (item: PostRow) => (
        <span
          className="font-display text-[14px] font-semibold text-black hover:text-[#c1121f] cursor-pointer transition-colors"
          onClick={() => console.log("Open post:", item.id)}
        >
          {item.title}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: PostRow) => (
        <StatusBadge variant={statusBadgeMap[item.status] ?? "gray"}>
          {item.status}
        </StatusBadge>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item: PostRow) => (
        <span className="text-[13px]">{item.type ?? "—"}</span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item: PostRow) => (
        <span className="text-[13px]">{item.categories?.name ?? "—"}</span>
      ),
    },
    {
      key: "neighborhood",
      header: "Neighborhood",
      render: (item: PostRow) => (
        <span className="text-[13px]">{item.neighborhoods?.name ?? "—"}</span>
      ),
    },
    {
      key: "word_count",
      header: "Words",
      render: (item: PostRow) => (
        <span className="text-[13px]">{item.word_count ?? "—"}</span>
      ),
    },
    {
      key: "published_at",
      header: "Published",
      render: (item: PostRow) => (
        <span className="text-[12px] text-[#6b7280]">
          {item.published_at ? new Date(item.published_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      <PortalTopbar title="Blog Posts" />
      <div className="p-8 max-[899px]:pt-16 space-y-4">
        <FilterBar
          filters={[
            {
              key: "status",
              label: "All Status",
              value: statusFilter,
              options: [
                { value: "draft", label: "Draft" },
                { value: "ready_for_review", label: "Ready for Review" },
                { value: "scheduled", label: "Scheduled" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ],
            },
            {
              key: "type",
              label: "All Types",
              value: typeFilter,
              options: [
                { value: "news", label: "News" },
                { value: "guide", label: "Guide" },
                { value: "feature", label: "Feature" },
                { value: "review", label: "Review" },
                { value: "listicle", label: "Listicle" },
              ],
            },
            {
              key: "category",
              label: "All Categories",
              value: categoryFilter,
              options: categories.map((c) => ({ value: c.id, label: c.name })),
            },
          ]}
          onFilterChange={handleFilterChange}
          searchPlaceholder="Search posts..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
        />

        <AdminDataTable
          columns={columns}
          data={paginated}
          actions={(item) => (
            <button
              onClick={() => console.log("Edit post:", item.id)}
              className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Edit
            </button>
          )}
          emptyMessage="No posts found."
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
