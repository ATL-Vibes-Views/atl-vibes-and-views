"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { WorkflowBanner } from "@/components/portal/WorkflowBanner";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { UploadZone } from "@/components/portal/UploadZone";
import { Modal } from "@/components/portal/Modal";
import { Pagination } from "@/components/portal/Pagination";
import { AlertTriangle, Loader2 } from "lucide-react";
import { publishBlogPost, updateBlogPost, rejectDraftPost } from "@/app/admin/actions";
import { uploadImage } from "@/lib/supabase-storage";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  type: string | null;
  content_source: string | null;
  category_id: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  created_at: string;
  categories: { name: string } | null;
  post_neighborhoods: { neighborhoods: { name: string } | null }[] | null;
}

interface PublishingClientProps {
  posts: PostRow[];
}

const ITEMS_PER_PAGE = 10;

export function PublishingClient({ posts }: PublishingClientProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [publishModal, setPublishModal] = useState<PostRow | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handlePublish = useCallback(async () => {
    if (!publishModal) return;
    setPublishing(true);
    const result = await publishBlogPost(publishModal.id);
    setPublishing(false);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    setPublishModal(null);
    router.refresh();
  }, [publishModal, router]);

  const handleUpload = useCallback(async (postId: string, files: FileList) => {
    const file = files[0];
    if (!file) return;
    setUploadingId(postId);
    const result = await uploadImage(file, "blog-featured");
    if ("error" in result) {
      alert("Upload error: " + result.error);
      setUploadingId(null);
      return;
    }
    await updateBlogPost(postId, { featured_image_url: result.url });
    setUploadingId(null);
    router.refresh();
  }, [router]);

  const [rejecting, setRejecting] = useState<string | null>(null);
  const handleReject = useCallback(async (postId: string) => {
    if (!confirm("Reject this draft? The blog post will be archived and the story will return to the Pipeline.")) return;
    setRejecting(postId);
    const result = await rejectDraftPost(postId);
    setRejecting(null);
    if (result.error) {
      alert("Error: " + result.error);
      return;
    }
    router.refresh();
  }, [router]);

  // Stats — all posts here are drafts; split by whether they have media attached
  const needsMedia = posts.filter((p) => !p.featured_image_url).length;
  const readyToPublish = posts.filter((p) => !!p.featured_image_url).length;
  const publishedToday = 0; // Published posts live elsewhere

  const filtered = useMemo(() => {
    let items = posts;
    if (statusFilter === "needs_media") {
      items = items.filter((p) => !p.featured_image_url);
    } else if (statusFilter === "ready") {
      items = items.filter((p) => !!p.featured_image_url);
    }
    return items;
  }, [posts, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") setStatusFilter(value);
    setPage(1);
  };

  const isNeedsMedia = (post: PostRow) => !post.featured_image_url;

  const isReady = (post: PostRow) => !!post.featured_image_url;

  const workflowSteps = [
    { label: "Pipeline", status: "done" as const },
    { label: "Publishing Queue", status: "current" as const },
    { label: "Published", status: "future" as const },
  ];

  return (
    <>
      <PortalTopbar
        title="Publishing Queue"
        actions={
          <Link
            href="/admin/publishing/new"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
          >
            + Add Blog Post
          </Link>
        }
      />
      <div className="p-8 space-y-4">
        <WorkflowBanner steps={workflowSteps} />

        <StatGrid columns={3}>
          <StatCard label="Needs Media" value={needsMedia} badge={needsMedia > 0 ? { text: "Action", variant: "red" } : undefined} />
          <StatCard label="Ready to Publish" value={readyToPublish} badge={readyToPublish > 0 ? { text: "Ready", variant: "green" } : undefined} />
          <StatCard label="Published Today" value={publishedToday} />
        </StatGrid>

        <FilterBar
          filters={[
            {
              key: "status",
              label: "All Status",
              value: statusFilter,
              options: [
                { value: "needs_media", label: "Needs Media" },
                { value: "ready", label: "Ready to Publish" },
              ],
            },
          ]}
          onFilterChange={handleFilterChange}
        />

        {/* Cards */}
        <div className="space-y-3">
          {paginated.length === 0 && (
            <div className="bg-white border border-[#e5e5e5] p-8 text-center">
              <p className="text-[13px] text-[#6b7280]">No posts in the publishing queue.</p>
            </div>
          )}
          {paginated.map((post) => {
            const needMedia = isNeedsMedia(post);
            const ready = isReady(post);
            const borderColor = needMedia
              ? "border-l-[#c1121f]"
              : ready
                ? "border-l-[#16a34a]"
                : "border-l-[#e5e5e5]";

            return (
              <div key={post.id} className={`bg-white border border-[#e5e5e5] border-l-4 ${borderColor}`}>
                <div className="px-5 py-4">
                  <h3
                    className="font-display text-[16px] font-semibold text-black cursor-pointer hover:text-[#c1121f] transition-colors"
                    onClick={() => router.push(`/admin/posts/${post.id}?from=publishing`)}
                  >
                    {post.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <StatusBadge variant="blue">Blog Post</StatusBadge>
                    {post.categories?.name && (
                      <span className="text-[11px] text-[#6b7280]">{post.categories.name}</span>
                    )}
                    {post.post_neighborhoods?.[0]?.neighborhoods?.name && (
                      <span className="text-[11px] text-[#6b7280]">{post.post_neighborhoods[0].neighborhoods!.name}</span>
                    )}
                    {needMedia && <StatusBadge variant="red">Media Required</StatusBadge>}
                    {ready && <StatusBadge variant="green">Ready</StatusBadge>}
                    {post.status === "published" && <StatusBadge variant="green">Published</StatusBadge>}
                  </div>

                  {/* Upload zone for items needing media */}
                  {needMedia && (
                    <div className="mt-3">
                      {uploadingId === post.id ? (
                        <div className="border-2 border-dashed border-[#e6c46d] bg-[#fefcf5] p-6 text-center">
                          <Loader2 size={20} className="mx-auto mb-2 text-[#6b7280] animate-spin" />
                          <p className="text-[12px] text-[#6b7280]">Uploading...</p>
                        </div>
                      ) : (
                        <UploadZone
                          onUpload={(files) => handleUpload(post.id, files)}
                          accept="image/*"
                          label="Drop featured image here"
                          hint="PNG, JPG, WebP up to 10MB"
                        />
                      )}
                    </div>
                  )}

                  {/* Media preview for ready items */}
                  {ready && post.featured_image_url && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-[120px] h-[68px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center overflow-hidden">
                        <img src={post.featured_image_url} alt={post.title || "Featured image"} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] text-[#6b7280]">Featured image attached</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => window.open(`/stories/${post.slug}`, '_blank')}
                      className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => ready ? setPublishModal(post) : console.log("Publish disabled")}
                      disabled={!ready}
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                        ready
                          ? "bg-[#16a34a] text-white hover:bg-[#15803d]"
                          : "bg-[#e5e5e5] text-[#9ca3af] cursor-not-allowed"
                      }`}
                    >
                      Publish Now
                    </button>
                    <button
                      onClick={() => handleReject(post.id)}
                      disabled={rejecting === post.id}
                      className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#c1121f] hover:border-[#c1121f] transition-colors disabled:opacity-50"
                    >
                      {rejecting === post.id ? "..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </div>

      {/* Publish Confirmation Modal */}
      <Modal
        isOpen={!!publishModal}
        onClose={() => setPublishModal(null)}
        title="Confirm Publish"
        footer={
          <>
            <button
              onClick={() => setPublishModal(null)}
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors disabled:opacity-50"
            >
              {publishing ? "Publishing..." : "Yes, Publish Now"}
            </button>
          </>
        }
      >
        {publishModal && (
          <div className="space-y-4">
            <h3 className="font-display text-[18px] font-semibold text-black">
              {publishModal.title}
            </h3>
            <div className="flex items-center gap-2">
              <StatusBadge variant="blue">Blog Post</StatusBadge>
              {publishModal.categories?.name && (
                <span className="text-[12px] text-[#6b7280]">{publishModal.categories.name}</span>
              )}
            </div>

            {/* Warning banner */}
            <div className="bg-[#fef3c7] border border-[#f59e0b] p-3 flex items-start gap-2">
              <AlertTriangle size={16} className="text-[#b45309] flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#92400e]">
                This will publish the blog post immediately. This action cannot be undone.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
