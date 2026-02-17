"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FilterBar } from "@/components/portal/FilterBar";
import { UploadZone } from "@/components/portal/UploadZone";
import { Pagination } from "@/components/portal/Pagination";
import { AlertTriangle, Play } from "lucide-react";
import { rejectSocialItem } from "@/app/admin/actions";

interface ScriptRow {
  id: string;
  title: string;
  story_id: string | null;
  status: string;
  platform: string | null;
  format: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  scheduled_date: string | null;
  created_at: string;
  script_batches: { batch_name: string | null } | null;
  stories: { headline: string; tier: string | null } | null;
}

interface SocialStory {
  id: string;
  headline: string;
  source_name: string | null;
  status: string;
  score: number | null;
  tier: string | null;
  category_id: string | null;
  created_at: string;
  categories: { name: string } | null;
}

interface SocialClientProps {
  scripts: ScriptRow[];
  socialStories: SocialStory[];
  captionPreviews: { story_id: string; platform: string; caption: string | null }[];
}

type SocialItem =
  | { kind: "script"; data: ScriptRow }
  | { kind: "story"; data: SocialStory };

const ITEMS_PER_PAGE = 15;

export function SocialClient({ scripts, socialStories, captionPreviews }: SocialClientProps) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  /* ── Caption preview map: story_id -> array of { platform, caption } ── */
  const captionMap = useMemo(() => {
    const map = new Map<string, { platform: string; caption: string }[]>();
    for (const cap of captionPreviews) {
      if (cap.story_id && cap.caption) {
        const existing = map.get(cap.story_id) ?? [];
        existing.push({ platform: cap.platform, caption: cap.caption });
        map.set(cap.story_id, existing);
      }
    }
    return map;
  }, [captionPreviews]);

  /* ── Unified item list ── */
  const allItems: SocialItem[] = useMemo(() => {
    const items: SocialItem[] = [];
    scripts.forEach((s) => items.push({ kind: "script", data: s }));
    socialStories.forEach((s) => items.push({ kind: "story", data: s }));
    return items;
  }, [scripts, socialStories]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let items = allItems;
    if (typeFilter === "script") items = items.filter((i) => i.kind === "script");
    if (typeFilter === "story") items = items.filter((i) => i.kind === "story");
    if (typeFilter === "needs_media")
      items = items.filter((i) => i.kind === "script" && !i.data.media_url);
    if (typeFilter === "ready")
      items = items.filter((i) => i.kind === "script" && !!i.data.media_url);
    return items;
  }, [allItems, typeFilter]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "type") setTypeFilter(value);
    setPage(1);
  };

  /* ── Reject handler ── */
  const handleReject = useCallback(
    async (id: string, kind: "script" | "story") => {
      if (!confirm("Are you sure you want to reject this item?")) return;
      const result = await rejectSocialItem(id, kind);
      if (result.error) alert("Error: " + result.error);
      else router.refresh();
    },
    [router],
  );

  /* ── Stats ── */
  const needsMediaCount = scripts.filter((s) => !s.media_url).length;

  return (
    <>
      <PortalTopbar
        title="Social Queue"
        actions={
          <span className="text-[12px] text-[#6b7280]">
            Approved scripts and social-tier stories ready for distribution
          </span>
        }
      />

      <div className="p-8 space-y-4">
        {/* ── Stat Cards ── */}
        <StatGrid columns={4}>
          <StatCard
            label="Approved Scripts"
            value={scripts.length}
            badge={scripts.length > 0 ? { text: "Ready", variant: "green" } : undefined}
          />
          <StatCard
            label="Social-Tier Stories"
            value={socialStories.length}
            badge={socialStories.length > 0 ? { text: "Social", variant: "gold" } : undefined}
          />
          <StatCard label="Total Queue" value={scripts.length + socialStories.length} />
          <StatCard
            label="Needs Media"
            value={needsMediaCount}
            badge={needsMediaCount > 0 ? { text: "Action", variant: "red" } : undefined}
          />
        </StatGrid>

        {/* ── Filter Bar ── */}
        <FilterBar
          filters={[
            {
              key: "type",
              label: "All Types",
              value: typeFilter,
              options: [
                { value: "script", label: "Scripts Only" },
                { value: "story", label: "Social Stories Only" },
                { value: "needs_media", label: "Needs Media" },
                { value: "ready", label: "Ready to Distribute" },
              ],
            },
          ]}
          onFilterChange={handleFilterChange}
        />

        {/* ── Cards ── */}
        <div className="space-y-3">
          {paginated.length === 0 && (
            <div className="bg-white border border-[#e5e5e5] p-8 text-center">
              <p className="text-[13px] text-[#6b7280]">No items in the social queue.</p>
            </div>
          )}

          {paginated.map((item) => {
            if (item.kind === "script") {
              const script = item.data;
              const hasMedia = !!script.media_url;
              const captions = script.story_id ? captionMap.get(script.story_id) ?? [] : [];
              const captionPlatforms = captions.map((c) => c.platform);

              return (
                <div
                  key={`script-${script.id}`}
                  className="bg-white border border-[#e5e5e5] border-l-4"
                  style={{ borderLeftColor: hasMedia ? "#16a34a" : "#c1121f" }}
                >
                  <div className="px-5 py-4">
                    {/* Title */}
                    <h3 className="font-display text-[16px] font-semibold text-black">
                      {script.title}
                    </h3>

                    {/* Badge row */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <StatusBadge variant="green">Script / Video</StatusBadge>
                      {script.script_batches?.batch_name && (
                        <StatusBadge variant="gray">
                          {script.script_batches.batch_name}
                        </StatusBadge>
                      )}
                      <StatusBadge variant="green">Approved</StatusBadge>
                    </div>

                    {/* Caption preview platforms */}
                    {captionPlatforms.length > 0 && (
                      <p className="text-[11px] text-[#6b7280] mt-2">
                        Captions:{" "}
                        {captionPlatforms.map((p, i) => (
                          <span key={p}>
                            <span className="font-semibold">{p}</span>
                            {i < captionPlatforms.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </p>
                    )}

                    {/* ── Has Media ── */}
                    {hasMedia && (
                      <>
                        {/* Video thumbnail + badge */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="relative flex items-center justify-center w-[100px] h-[56px] bg-[#1a1a1a] rounded overflow-hidden">
                            {script.thumbnail_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={script.thumbnail_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                            <Play
                              size={20}
                              className="absolute text-white/80"
                            />
                          </div>
                          <StatusBadge variant="green">Video Attached</StatusBadge>
                        </div>

                        {/* Platform tags */}
                        <p className="text-[11px] text-[#6b7280] mt-2">
                          Publishing to:{" "}
                          <span className="font-semibold">
                            Instagram Reel | TikTok | YT Shorts | Facebook
                          </span>
                        </p>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-3">
                          <Link
                            href={`/admin/social/distribute/${script.id}`}
                            className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
                          >
                            Edit Captions
                          </Link>
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
                          >
                            Preview
                          </button>
                          <Link
                            href={`/admin/social/distribute/${script.id}?mode=publish`}
                            className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors"
                          >
                            Publish Now
                          </Link>
                        </div>
                      </>
                    )}

                    {/* ── No Media ── */}
                    {!hasMedia && (
                      <>
                        <div className="mt-3">
                          <UploadZone
                            label="Upload Video or Images"
                            hint="Drag & drop or click to browse · MP4, MOV, JPG, PNG"
                            accept="video/mp4,video/quicktime,image/jpeg,image/png"
                            onUpload={() => {}}
                          />
                        </div>

                        {/* Warning */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <AlertTriangle size={14} className="text-[#c1121f]" />
                          <span className="text-[12px] text-[#c1121f] font-semibold">
                            Required before publishing
                          </span>
                        </div>

                        {/* Caption availability */}
                        {captionPlatforms.length > 0 && (
                          <p className="text-[11px] text-[#6b7280] mt-2">
                            Captions ready for:{" "}
                            <span className="font-semibold">
                              {captionPlatforms.join(", ")}
                            </span>
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-3">
                          <Link
                            href={`/admin/social/distribute/${script.id}`}
                            className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(script.id, "script")}
                            className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full border border-[#c1121f] text-[#c1121f] hover:bg-[#fee2e2] transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            }

            /* ── Story Card ── */
            const story = item.data;
            return (
              <div
                key={`story-${story.id}`}
                className="bg-white border border-[#e5e5e5] border-l-4 border-l-[#f59e0b]"
              >
                <div className="px-5 py-4">
                  {/* Title */}
                  <h3 className="font-display text-[16px] font-semibold text-black">
                    {story.headline}
                  </h3>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <StatusBadge variant="gold">Social Post</StatusBadge>
                    {story.source_name && (
                      <StatusBadge variant="gray">{story.source_name}</StatusBadge>
                    )}
                    {story.categories?.name && (
                      <StatusBadge variant="gray">{story.categories.name}</StatusBadge>
                    )}
                    {story.score !== null && (
                      <StatusBadge variant="blue">Score: {story.score}</StatusBadge>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(story.id, "story")}
                      className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full border border-[#c1121f] text-[#c1121f] hover:bg-[#fee2e2] transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Pagination ── */}
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
