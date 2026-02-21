"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ExternalLink } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { Pagination } from "@/components/portal/Pagination";
import { Modal } from "@/components/portal/Modal";
import { unpublishBlogPost, unpublishBlogPostReverseCredit, getSponsorNameByBusinessId } from "@/app/admin/actions";

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
  is_sponsored: boolean;
  sponsor_business_id: string | null;
  categories: { name: string } | null;
  post_neighborhoods: { neighborhoods: { name: string } | null }[] | null;
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
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [unpublishing, setUnpublishing] = useState<string | null>(null);
  const [sponsoredUnpublishModal, setSponsoredUnpublishModal] = useState<PostRow | null>(null);
  const [sponsorName, setSponsorName] = useState<string>("");

  const handleUnpublish = useCallback(async (post: PostRow) => {
    // Version B — Sponsored posts: show modal
    if (post.is_sponsored && post.sponsor_business_id) {
      const sponsor = await getSponsorNameByBusinessId(post.sponsor_business_id);
      setSponsorName(sponsor?.sponsor_name ?? "Unknown Sponsor");
      setSponsoredUnpublishModal(post);
      return;
    }
    // Version A — Non-sponsored posts: existing behavior unchanged
    if (!confirm("Unpublish this post? It will be removed from the public site.")) return;
    setUnpublishing(post.id);
    const result = await unpublishBlogPost(post.id);
    setUnpublishing(null);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    router.refresh();
  }, [router]);

  const handleSponsoredUnpublishKeep = useCallback(async () => {
    if (!sponsoredUnpublishModal) return;
    setUnpublishing(sponsoredUnpublishModal.id);
    setSponsoredUnpublishModal(null);
    const result = await unpublishBlogPost(sponsoredUnpublishModal.id);
    setUnpublishing(null);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    router.refresh();
  }, [sponsoredUnpublishModal, router]);

  const handleSponsoredUnpublishReverse = useCallback(async () => {
    if (!sponsoredUnpublishModal) return;
    setUnpublishing(sponsoredUnpublishModal.id);
    setSponsoredUnpublishModal(null);
    const result = await unpublishBlogPostReverseCredit(sponsoredUnpublishModal.id);
    setUnpublishing(null);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    router.refresh();
  }, [sponsoredUnpublishModal, router]);

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
        <div className="flex items-center gap-2">
          {item.status === "published" ? (
            <>
              <a
                href={`/stories/${item.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-[14px] font-semibold text-black hover:text-[#c1121f] cursor-pointer transition-colors"
              >
                {item.title}
                <ExternalLink size={11} className="inline ml-1 opacity-40" />
              </a>
              <button
                onClick={() => router.push(`/admin/posts/${item.id}`)}
                className="flex-shrink-0 p-1 text-[#6b7280] hover:text-black transition-colors"
                title="Edit post"
              >
                <Pencil size={13} />
              </button>
            </>
          ) : (
            <span
              className="font-display text-[14px] font-semibold text-black hover:text-[#c1121f] cursor-pointer transition-colors"
              onClick={() => router.push(`/admin/posts/${item.id}`)}
            >
              {item.title}
            </span>
          )}
        </div>
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
        <span className="text-[13px]">{item.post_neighborhoods?.[0]?.neighborhoods?.name ?? "—"}</span>
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
      <div className="p-8 space-y-4">
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/admin/posts/${item.id}`)}
                className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
              >
                Edit
              </button>
              {item.status === "published" && (
                <button
                  onClick={() => handleUnpublish(item)}
                  disabled={unpublishing === item.id}
                  className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#c1121f] hover:border-[#c1121f] transition-colors disabled:opacity-50"
                >
                  {unpublishing === item.id ? "..." : "Unpublish"}
                </button>
              )}
            </div>
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

      {/* Sponsored Unpublish Modal — Version B */}
      <Modal
        isOpen={!!sponsoredUnpublishModal}
        onClose={() => setSponsoredUnpublishModal(null)}
        title="Unpublish Post"
        maxWidth="520px"
        footer={
          <>
            <button
              onClick={() => setSponsoredUnpublishModal(null)}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSponsoredUnpublishKeep}
              disabled={!!unpublishing}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-50"
            >
              Unpublish — Keep Credit
            </button>
            <button
              onClick={handleSponsoredUnpublishReverse}
              disabled={!!unpublishing}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold bg-[#c1121f] text-white hover:bg-[#a10e1a] transition-colors disabled:opacity-50"
            >
              Unpublish — Reverse Credit
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-[13px] text-[#374151]">
            Unpublish this post? It will be removed from the public site.
          </p>
          <p className="text-[13px] text-[#374151]">
            This post is linked to <strong>{sponsorName}</strong>. Should the fulfillment credit be reversed?
          </p>
        </div>
      </Modal>
    </>
  );
}
