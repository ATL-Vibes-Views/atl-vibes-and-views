"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Send } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";

interface ScriptData {
  id: string;
  title: string;
  script_text: string | null;
  script_batch_id: string | null;
  story_id: string | null;
  platform: string;
  format: string;
  status: string;
  hashtags: string | null;
  call_to_action: string | null;
  scheduled_date: string | null;
  created_at: string;
  script_batches: { batch_name: string | null } | null;
  stories: { headline: string; tier: number | null; source_name: string | null } | null;
}

interface CaptionRow {
  id: string;
  story_id: string | null;
  platform: string;
  caption: string | null;
  description: string | null;
  tags: string | null;
  hashtags: string | null;
  status: string;
}

interface DistributeClientProps {
  script: ScriptData | null;
  captions: CaptionRow[];
}

const PLATFORM_ORDER = ["youtube", "instagram", "tiktok", "linkedin", "facebook", "x"];

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "border-l-[#FF0000]",
  instagram: "border-l-[#E4405F]",
  tiktok: "border-l-[#000000]",
  linkedin: "border-l-[#0A66C2]",
  facebook: "border-l-[#1877F2]",
  x: "border-l-[#1DA1F2]",
};

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  x: "X (Twitter)",
};

export function DistributeClient({ script, captions }: DistributeClientProps) {
  const sortedCaptions = useMemo(() => {
    return [...captions].sort(
      (a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform)
    );
  }, [captions]);

  if (!script) {
    return (
      <>
        <PortalTopbar title="Script Not Found" />
        <div className="p-8 max-[899px]:pt-16">
          <Link href="/admin/social" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
            <ArrowLeft size={14} /> Back to Social Queue
          </Link>
          <div className="bg-white border border-[#e5e5e5] p-8 text-center mt-4">
            <p className="text-[13px] text-[#6b7280]">Script not found.</p>
          </div>
        </div>
      </>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => console.log("Copy failed"));
  };

  return (
    <>
      <PortalTopbar
        title={`Distribute — ${script.title}`}
        actions={
          <span className="text-[12px] text-[#6b7280]">
            Review captions and distribute to platforms
          </span>
        }
      />
      <div className="p-8 max-[899px]:pt-16 space-y-6">
        <Link href="/admin/social" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Social Queue
        </Link>

        {/* Script Overview */}
        <div className="bg-white border border-[#e5e5e5]">
          <div className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-[20px] font-bold text-black">
                  {script.title}
                </h2>
                {script.stories?.headline && (
                  <p className="text-[13px] text-[#6b7280] mt-1">
                    Story: {script.stories.headline}
                    {script.stories.tier !== null && ` (Tier ${script.stories.tier})`}
                  </p>
                )}
              </div>
              <StatusBadge variant="green">{script.status}</StatusBadge>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              {script.script_batches?.batch_name && (
                <span className="text-[12px] text-[#6b7280]">
                  Batch: {script.script_batches.batch_name}
                </span>
              )}
              {script.scheduled_date && (
                <span className="text-[12px] text-[#6b7280]">
                  Scheduled: {new Date(script.scheduled_date).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Filming script text */}
            {script.script_text && (
              <div className="mt-4 bg-[#f5f5f5] border border-[#e5e5e5] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold text-[#374151]">Filming Script</span>
                  <button
                    onClick={() => copyToClipboard(script.script_text!)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#6b7280] hover:text-black transition-colors"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
                <p className="text-[13px] text-[#374151] whitespace-pre-wrap leading-relaxed">
                  {script.script_text}
                </p>
              </div>
            )}

            {/* Hashtags and CTA */}
            {script.hashtags && (
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-[#6b7280]">Hashtags</span>
                <p className="text-[12px] text-[#374151] mt-0.5">{script.hashtags}</p>
              </div>
            )}
            {script.call_to_action && (
              <div className="mt-2">
                <span className="text-[11px] font-semibold text-[#6b7280]">Call to Action</span>
                <p className="text-[12px] text-[#374151] mt-0.5">{script.call_to_action}</p>
              </div>
            )}
          </div>
        </div>

        {/* Platform Caption Cards */}
        <div>
          <h3 className="font-display text-[18px] font-semibold text-black mb-3">
            Platform Captions ({sortedCaptions.length}/6)
          </h3>

          {sortedCaptions.length === 0 ? (
            <div className="bg-white border border-[#e5e5e5] p-8 text-center">
              <p className="text-[13px] text-[#6b7280]">Awaiting caption generation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sortedCaptions.map((cap) => (
                <div
                  key={cap.id}
                  className={`bg-white border border-[#e5e5e5] border-l-4 ${PLATFORM_COLORS[cap.platform] ?? "border-l-[#e5e5e5]"}`}
                >
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display text-[14px] font-semibold text-black">
                        {PLATFORM_LABELS[cap.platform] ?? cap.platform}
                      </span>
                      <StatusBadge variant={cap.caption ? "green" : "gray"}>
                        {cap.caption ? "Ready" : "Pending"}
                      </StatusBadge>
                    </div>

                    {/* Caption */}
                    <div className="mb-3">
                      <span className="text-[11px] font-semibold text-[#6b7280]">Caption</span>
                      {cap.caption ? (
                        <div className="mt-1 bg-[#fafafa] border border-[#e5e5e5] p-3">
                          <p className="text-[12px] text-[#374151] whitespace-pre-wrap">
                            {cap.caption}
                          </p>
                          <button
                            onClick={() => copyToClipboard(cap.caption!)}
                            className="inline-flex items-center gap-1 text-[10px] text-[#6b7280] hover:text-black transition-colors mt-2"
                          >
                            <Copy size={10} /> Copy caption
                          </button>
                        </div>
                      ) : (
                        <p className="text-[12px] text-[#9ca3af] mt-1 italic">
                          Awaiting caption generation.
                        </p>
                      )}
                    </div>

                    {/* YouTube-specific: description + tags */}
                    {cap.platform === "youtube" && (
                      <>
                        <div className="mb-3">
                          <span className="text-[11px] font-semibold text-[#6b7280]">Description</span>
                          {cap.description ? (
                            <div className="mt-1 bg-[#fafafa] border border-[#e5e5e5] p-3">
                              <p className="text-[12px] text-[#374151] whitespace-pre-wrap">
                                {cap.description}
                              </p>
                              <button
                                onClick={() => copyToClipboard(cap.description!)}
                                className="inline-flex items-center gap-1 text-[10px] text-[#6b7280] hover:text-black transition-colors mt-2"
                              >
                                <Copy size={10} /> Copy description
                              </button>
                            </div>
                          ) : (
                            <p className="text-[12px] text-[#9ca3af] mt-1 italic">
                              Awaiting description generation.
                            </p>
                          )}
                        </div>
                        <div className="mb-3">
                          <span className="text-[11px] font-semibold text-[#6b7280]">Tags</span>
                          {cap.tags ? (
                            <div className="mt-1 bg-[#fafafa] border border-[#e5e5e5] p-3">
                              <p className="text-[12px] text-[#374151]">{cap.tags}</p>
                              <button
                                onClick={() => copyToClipboard(cap.tags!)}
                                className="inline-flex items-center gap-1 text-[10px] text-[#6b7280] hover:text-black transition-colors mt-2"
                              >
                                <Copy size={10} /> Copy tags
                              </button>
                            </div>
                          ) : (
                            <p className="text-[12px] text-[#9ca3af] mt-1 italic">
                              Awaiting tags generation.
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Hashtags (for non-YouTube platforms) */}
                    {cap.platform !== "youtube" && cap.hashtags && (
                      <div className="mb-3">
                        <span className="text-[11px] font-semibold text-[#6b7280]">Hashtags</span>
                        <div className="mt-1 bg-[#fafafa] border border-[#e5e5e5] p-3">
                          <p className="text-[12px] text-[#374151]">{cap.hashtags}</p>
                          <button
                            onClick={() => copyToClipboard(cap.hashtags!)}
                            className="inline-flex items-center gap-1 text-[10px] text-[#6b7280] hover:text-black transition-colors mt-2"
                          >
                            <Copy size={10} /> Copy hashtags
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Distribute button */}
                    <button
                      onClick={() => console.log("Distribute to", cap.platform, cap.id)}
                      disabled={!cap.caption}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                        cap.caption
                          ? "bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d]"
                          : "bg-[#e5e5e5] text-[#9ca3af] cursor-not-allowed"
                      }`}
                    >
                      <Send size={12} />
                      Distribute to {PLATFORM_LABELS[cap.platform] ?? cap.platform}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribute All */}
        {sortedCaptions.length > 0 && sortedCaptions.some((c) => c.caption) && (
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => console.log("Distribute all for script:", script.id)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors"
            >
              <Send size={14} />
              Distribute to All Platforms
            </button>
          </div>
        )}
      </div>
    </>
  );
}
