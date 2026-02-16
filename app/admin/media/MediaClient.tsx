"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateMediaItem } from "@/app/admin/actions";
import { Modal } from "@/components/portal/Modal";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { Pagination } from "@/components/portal/Pagination";

interface MediaRow {
  id: string;
  title: string;
  slug: string;
  media_type: string;
  source_type: string;
  embed_url: string | null;
  thumbnail_url: string | null;
  status: string;
  is_featured: boolean;
  neighborhood_id: string | null;
  published_at: string | null;
  created_at: string;
  neighborhoods: { name: string } | null;
}

interface MediaClientProps {
  media: MediaRow[];
}

const ITEMS_PER_PAGE = 25;

const statusBadgeMap: Record<string, "green" | "gray" | "blue" | "yellow"> = {
  published: "green",
  draft: "yellow",
  scheduled: "blue",
  archived: "gray",
};

export function MediaClient({ media }: MediaClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editModal, setEditModal] = useState<MediaRow | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const openEditModal = useCallback((item: MediaRow) => {
    setEditTitle(item.title);
    setEditStatus(item.status);
    setEditModal(item);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editModal) return;
    setSaving(true);
    const result = await updateMediaItem(editModal.id, { title: editTitle, status: editStatus });
    setSaving(false);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    setEditModal(null);
    router.refresh();
  }, [editModal, editTitle, editStatus, router]);

  const filtered = useMemo(() => {
    let items = media;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((m) => m.title.toLowerCase().includes(q));
    }
    if (statusFilter) items = items.filter((m) => m.status === statusFilter);
    if (typeFilter) items = items.filter((m) => m.media_type === typeFilter);
    return items;
  }, [media, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") setStatusFilter(value);
    if (key === "type") setTypeFilter(value);
    setPage(1);
  };

  const columns = [
    {
      key: "thumb",
      header: "",
      width: "60px",
      render: (item: MediaRow) => (
        <div className="w-[48px] h-[32px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center overflow-hidden">
          {item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt={item.title || "Media thumbnail"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[9px] text-[#6b7280]">No img</span>
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Title",
      width: "30%",
      render: (item: MediaRow) => (
        <span className="font-display text-[14px] font-semibold text-black">
          {item.title}
        </span>
      ),
    },
    {
      key: "media_type",
      header: "Type",
      render: (item: MediaRow) => (
        <span className="text-[13px]">{item.media_type}</span>
      ),
    },
    {
      key: "source_type",
      header: "Source",
      render: (item: MediaRow) => (
        <span className="text-[13px]">{item.source_type}</span>
      ),
    },
    {
      key: "neighborhood",
      header: "Neighborhood",
      render: (item: MediaRow) => (
        <span className="text-[13px]">{item.neighborhoods?.name ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: MediaRow) => (
        <StatusBadge variant={statusBadgeMap[item.status] ?? "gray"}>
          {item.status}
        </StatusBadge>
      ),
    },
    {
      key: "is_featured",
      header: "Featured",
      render: (item: MediaRow) => (
        <span className="text-[13px]">{item.is_featured ? "Yes" : "—"}</span>
      ),
    },
    {
      key: "published_at",
      header: "Published",
      render: (item: MediaRow) => (
        <span className="text-[12px] text-[#6b7280]">
          {item.published_at ? new Date(item.published_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      <PortalTopbar
        title="Media"
        actions={
          <Link
            href="/admin/media/new"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
          >
            + Add Media
          </Link>
        }
      />
      <div className="p-8 max-[899px]:pt-16 space-y-4">
        <FilterBar
          filters={[
            {
              key: "status",
              label: "All Status",
              value: statusFilter,
              options: [
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "scheduled", label: "Scheduled" },
                { value: "archived", label: "Archived" },
              ],
            },
            {
              key: "type",
              label: "All Types",
              value: typeFilter,
              options: [
                { value: "video", label: "Video" },
                { value: "audio", label: "Audio" },
                { value: "podcast", label: "Podcast" },
                { value: "short", label: "Short" },
                { value: "image", label: "Image" },
              ],
            },
          ]}
          onFilterChange={handleFilterChange}
          searchPlaceholder="Search media..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
        />

        <AdminDataTable
          columns={columns}
          data={paginated}
          actions={(item) => (
            <button
              onClick={() => openEditModal(item)}
              className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Edit
            </button>
          )}
          emptyMessage="No media items found."
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit Media Item"
        footer={
          <>
            <button
              onClick={() => setEditModal(null)}
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        {editModal && (
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
