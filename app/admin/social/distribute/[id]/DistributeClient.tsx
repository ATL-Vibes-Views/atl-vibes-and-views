"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, ChevronDown, ChevronUp, AlertTriangle, Info } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { ToggleSwitch } from "@/components/portal/ToggleSwitch";

interface FilmingScriptData {
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
  stories: {
    headline: string;
    source_name: string | null;
    score: number | null;
    tier: string | null;
    category_id: string | null;
    categories: { name: string } | null;
  } | null;
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
  filmingScript: FilmingScriptData | null;
  captions: CaptionRow[];
}

const PLATFORM_ORDER = ["instagram", "tiktok", "facebook", "linkedin", "x", "youtube"] as const;
type PlatformKey = typeof PLATFORM_ORDER[number];

const PLATFORM_CONFIG: Record<PlatformKey, { label: string; icon: string; color: string; charLimit: number }> = {
  instagram: { label: "Instagram", icon: "IG", color: "#E1306C", charLimit: 2200 },
  tiktok: { label: "TikTok", icon: "TT", color: "#000000", charLimit: 2200 },
  facebook: { label: "Facebook", icon: "f", color: "#1877F2", charLimit: 2500 },
  linkedin: { label: "LinkedIn", icon: "in", color: "#0A66C2", charLimit: 3000 },
  x: { label: "X", icon: "X", color: "#000000", charLimit: 280 },
  youtube: { label: "YouTube", icon: "\u25B6", color: "#FF0000", charLimit: 5000 },
};

const PLATFORM_ACCOUNTS: { platform: string; name: string; handle: string }[] = [
  { platform: "instagram", name: "Instagram", handle: "@atlvibesandviews" },
  { platform: "tiktok", name: "TikTok", handle: "@atlvibesandviews" },
  { platform: "youtube", name: "YouTube", handle: "Living in Atlanta with Mellanda Reese" },
  { platform: "facebook", name: "Facebook", handle: "Atlanta Vibes & Views" },
  { platform: "linkedin", name: "LinkedIn", handle: "ATL Vibes & Views + Mellanda Reese" },
  { platform: "x", name: "X", handle: "@atlvibes_views" },
];

type TabKey = "all" | PlatformKey;

export function DistributeClient({ filmingScript, captions }: DistributeClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [scriptExpanded, setScriptExpanded] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("later");
  const [distributing, setDistributing] = useState(false);
  const [distributeStatus, setDistributeStatus] = useState<"idle" | "success" | "error">("idle");
  const [platformToggles, setPlatformToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(PLATFORM_ACCOUNTS.map((p) => [p.platform, true]))
  );

  const captionMap = useMemo(() => {
    const map = new Map<string, CaptionRow>();
    for (const cap of captions) {
      map.set(cap.platform, cap);
    }
    return map;
  }, [captions]);

  if (!filmingScript) {
    return (
      <>
        <PortalTopbar title="Script Not Found" />
        <div className="p-8">
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

  const getCharCountClass = (len: number, limit: number) => {
    if (len > limit) return "text-[#c1121f] font-semibold";
    if (len > limit * 0.9) return "text-[#ea580c]";
    return "text-[#6b7280]";
  };

  const renderCaptionTextarea = (platform: PlatformKey) => {
    const cap = captionMap.get(platform);
    const config = PLATFORM_CONFIG[platform];
    const text = cap?.caption ?? "";
    const len = text.length;

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-[12px] font-semibold text-[#374151] mb-1">
            {config.label} Caption
          </label>
          {text ? (
            <>
              <textarea
                readOnly
                className="w-full min-h-[100px] p-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] resize-vertical"
                defaultValue={text}
                onChange={(e) => console.log(`Social Queue: Edit ${platform} caption for ${filmingScript.id}`)}
              />
              <div className={`text-right text-[11px] mt-1 ${getCharCountClass(len, config.charLimit)}`}>
                {len.toLocaleString()} / {config.charLimit.toLocaleString()}
              </div>
            </>
          ) : (
            <p className="text-[12px] text-[#9ca3af] italic p-3 border border-[#e5e5e5] bg-[#fafafa]">
              Awaiting caption generation
            </p>
          )}
        </div>

        {/* Platform-specific hashtags (non-YouTube) */}
        {platform !== "youtube" && cap?.hashtags && (
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Hashtags</label>
            <input
              readOnly
              className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]"
              defaultValue={cap.hashtags}
            />
          </div>
        )}
      </div>
    );
  };

  const renderYouTubeTab = () => {
    const cap = captionMap.get("youtube");
    const titleText = cap?.caption ?? "";
    const descText = cap?.description ?? "";
    const tagsText = cap?.tags ?? "";

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-semibold text-[#374151] mb-1">
            Video Title <span className="font-normal text-[#6b7280]">(required)</span>
          </label>
          <input
            readOnly
            className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]"
            defaultValue={titleText}
          />
          <div className={`text-right text-[11px] mt-1 ${getCharCountClass(titleText.length, 100)}`}>
            {titleText.length} / 100
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[#374151] mb-1">
            Description <span className="font-normal text-[#6b7280]">(required)</span>
          </label>
          {descText ? (
            <>
              <textarea
                readOnly
                className="w-full min-h-[120px] p-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] resize-vertical"
                defaultValue={descText}
              />
              <div className={`text-right text-[11px] mt-1 ${getCharCountClass(descText.length, 5000)}`}>
                {descText.length.toLocaleString()} / 5,000
              </div>
            </>
          ) : (
            <p className="text-[12px] text-[#9ca3af] italic p-3 border border-[#e5e5e5] bg-[#fafafa]">
              Awaiting description generation
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Playlist</label>
            <select className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]">
              <option>Select a playlist</option>
              <option>Atlanta Quick Takes</option>
              <option>Neighborhood Spotlights</option>
              <option>Food & Dining</option>
              <option>Development Updates</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Category</label>
            <select className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]">
              <option>Select a category</option>
              <option>Entertainment</option>
              <option>News & Politics</option>
              <option>People & Blogs</option>
              <option>Travel & Events</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[#374151] mb-1">
            Tags <span className="font-normal text-[#6b7280]">(comma separated)</span>
          </label>
          <input
            readOnly
            className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]"
            defaultValue={tagsText}
          />
          <div className={`text-right text-[11px] mt-1 ${getCharCountClass(tagsText.length, 500)}`}>
            {tagsText.length} / 500
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Language</label>
            <select className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]">
              <option>English</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Visibility</label>
            <select className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]">
              <option>Public</option>
              <option>Unlisted</option>
              <option>Private</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[#374151] mb-1">License</label>
          <select className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]">
            <option>Standard YouTube License</option>
            <option>Creative Commons</option>
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[#374151] mb-2">Audience</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-[13px] cursor-pointer">
              <span className="w-4 h-4 border-2 border-[#d4d4d4] rounded-full" />
              Yes, it&apos;s made for kids
            </label>
            <label className="flex items-center gap-2 text-[13px] cursor-pointer">
              <span className="w-4 h-4 border-2 border-[#1a1a1a] rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-[#1a1a1a] rounded-full" />
              </span>
              No, it&apos;s not made for kids
            </label>
          </div>
        </div>
        <div className="border-t border-[#e5e5e5] pt-3 space-y-1">
          <ToggleSwitch label="Allow Embedding" checked={true} onChange={() => {}} />
          <ToggleSwitch label="Notify Subscribers" checked={true} onChange={() => {}} />
        </div>
      </div>
    );
  };

  return (
    <>
      <PortalTopbar
        title={`Distribute \u2014 ${filmingScript.title}`}
        actions={
          <span className="text-[12px] text-[#6b7280]">
            Review captions and distribute to platforms
          </span>
        }
      />
      <div className="p-8 space-y-5">
        {/* Back link */}
        <Link href="/admin/social" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Social Queue
        </Link>

        {/* Workflow breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
          <span className="px-3 py-1 rounded-full bg-[#dcfce7] text-[#16a34a] border border-[#16a34a] font-semibold">Pipeline</span>
          <span className="text-[#d4d4d4]">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-[#dcfce7] text-[#16a34a] border border-[#16a34a] font-semibold">Scripts</span>
          <span className="text-[#d4d4d4]">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-[#dcfce7] text-[#16a34a] border border-[#16a34a] font-semibold">Social Queue</span>
          <span className="text-[#d4d4d4]">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-[#1a1a1a] text-white border border-[#1a1a1a] font-semibold">Distribute</span>
        </div>

        {/* Page header */}
        <div>
          <h1 className="font-display text-[28px] font-bold text-black">
            Distribute &mdash; {filmingScript.title}
          </h1>
          <p className="text-[13px] text-[#6b7280] mt-1">
            Review captions and distribute to platforms
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <StatusBadge variant="yellow">Script / Video</StatusBadge>
            <StatusBadge variant="green">{filmingScript.status}</StatusBadge>
            {filmingScript.script_batches?.batch_name && (
              <span className="text-[12px] text-[#6b7280]">
                Batch: {filmingScript.script_batches.batch_name}
              </span>
            )}
            {filmingScript.scheduled_date && (
              <span className="text-[12px] text-[#6b7280]">
                {new Date(filmingScript.scheduled_date).toLocaleDateString()}
              </span>
            )}
          </div>
          {/* Platform tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-[12px] font-semibold text-[#374151]">Publishing to:</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ede9fe] text-[#7c3aed]">Instagram Reel</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#1a1a1a] text-white">TikTok</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fee2e2] text-[#c1121f]">YouTube Shorts</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#dbeafe] text-[#2563eb]">Facebook</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ccfbf1] text-[#0d9488]">LinkedIn</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e5e5e5] text-[#374151]">X</span>
          </div>
        </div>

        {/* Source Story card */}
        {filmingScript.stories && (
          <div className="bg-[#f8f5f0] border border-[#e5e5e5] p-4">
            <span className="text-[11px] uppercase tracking-wider text-[#6b7280]">Source Story</span>
            <h3 className="font-display text-[16px] font-semibold text-black mt-1">
              {filmingScript.stories.headline}
            </h3>
            <p className="text-[12px] text-[#6b7280] mt-1">
              {filmingScript.stories.score !== null && `Score: ${filmingScript.stories.score}`}
              {filmingScript.stories.source_name && ` \u00B7 ${filmingScript.stories.source_name}`}
              {filmingScript.stories.tier && ` \u00B7 Tier: ${filmingScript.stories.tier}`}
            </p>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* LEFT COLUMN — Main content */}
          <div className="space-y-5">
            {/* Filming Script — collapsible */}
            <div className="bg-white border border-[#e5e5e5]">
              <div
                className="px-5 py-3 flex items-center justify-between cursor-pointer"
                onClick={() => setScriptExpanded(!scriptExpanded)}
              >
                <h3 className="font-display text-[16px] font-semibold text-black">Filming Script</h3>
                <div className="flex items-center gap-2">
                  {filmingScript.script_text && (
                    <button
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(filmingScript.script_text!); }}
                      className="inline-flex items-center gap-1 text-[11px] text-[#6b7280] hover:text-black transition-colors"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  )}
                  {scriptExpanded ? <ChevronUp size={14} className="text-[#6b7280]" /> : <ChevronDown size={14} className="text-[#6b7280]" />}
                </div>
              </div>
              {scriptExpanded && filmingScript.script_text && (
                <div className="px-5 pb-4">
                  <div className="bg-[#f5f5f5] p-4 border-l-[3px] border-l-[#fee198]">
                    <p className="text-[13px] text-[#374151] whitespace-pre-wrap leading-relaxed">
                      {filmingScript.script_text}
                    </p>
                  </div>
                  {filmingScript.call_to_action && (
                    <div className="mt-3">
                      <span className="text-[11px] font-semibold text-[#6b7280]">Call to Action</span>
                      <p className="text-[12px] text-[#374151] mt-0.5">{filmingScript.call_to_action}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Media placeholder */}
            <div className="bg-white border border-[#e5e5e5] p-5">
              <h3 className="font-display text-[18px] font-semibold text-black mb-4">Media</h3>
              <div className="flex gap-4 items-start bg-[#f5f5f5] border border-[#e5e5e5] p-4">
                <div className="w-[200px] h-[112px] bg-[#e2d5c3] flex items-center justify-center text-[32px] flex-shrink-0">
                  &#9654;
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#374151]">Video file pending</p>
                  <p className="text-[12px] text-[#6b7280] mt-1">Upload video to continue</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors">
                  Replace Video
                </button>
                <button className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors">
                  Add Thumbnail
                </button>
              </div>
            </div>

            {/* Platform Captions — Tabbed */}
            <div className="bg-white border border-[#e5e5e5]">
              <div className="px-5 pt-5">
                <h3 className="font-display text-[18px] font-semibold text-black mb-3">Platform Captions</h3>
                {/* Info banner */}
                <div className="bg-[#dbeafe] p-3 flex items-start gap-2 mb-4">
                  <Info size={14} className="text-[#2563eb] flex-shrink-0 mt-0.5" />
                  <span className="text-[12px] text-[#1e40af]">
                    Captions were auto-generated by content automation. Edit any platform below before publishing.
                  </span>
                </div>
              </div>

              {/* Tab navigation */}
              <div className="flex border-b-2 border-[#e5e5e5] px-5 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2.5 text-[13px] whitespace-nowrap border-b-2 -mb-[2px] transition-colors ${
                    activeTab === "all"
                      ? "border-[#1a1a1a] text-[#1a1a1a] font-semibold"
                      : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
                  }`}
                >
                  All Networks
                </button>
                {PLATFORM_ORDER.map((p) => {
                  const cfg = PLATFORM_CONFIG[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setActiveTab(p)}
                      className={`px-3 py-2.5 text-[13px] whitespace-nowrap border-b-2 -mb-[2px] transition-colors flex items-center gap-1.5 ${
                        activeTab === p
                          ? "border-[#1a1a1a] text-[#1a1a1a] font-semibold"
                          : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
                      }`}
                    >
                      <span
                        className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: cfg.color, borderRadius: 3 }}
                      >
                        {cfg.icon}
                      </span>
                      {cfg.label}
                      <span className="text-[10px] text-[#6b7280] font-normal">{cfg.charLimit}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="p-5">
                {/* All Networks tab */}
                {activeTab === "all" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                        Shared Caption <span className="font-normal text-[#6b7280]">(edits here apply to all platforms)</span>
                      </label>
                      <textarea
                        readOnly
                        className="w-full min-h-[100px] p-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] resize-vertical"
                        defaultValue={captionMap.get("instagram")?.caption ?? ""}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                        Hashtags <span className="font-normal text-[#6b7280]">(applied to all platforms)</span>
                      </label>
                      <input
                        readOnly
                        className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]"
                        defaultValue={captionMap.get("instagram")?.hashtags ?? ""}
                      />
                    </div>
                    <div className="bg-[#fef9c3] p-3 flex items-start gap-2">
                      <AlertTriangle size={14} className="text-[#ea580c] flex-shrink-0 mt-0.5" />
                      <span className="text-[12px] text-[#92400e]">
                        Editing a platform-specific tab will detach it from the shared caption. Changes here will not override platform-specific edits.
                      </span>
                    </div>
                  </div>
                )}

                {/* Instagram tab */}
                {activeTab === "instagram" && renderCaptionTextarea("instagram")}

                {/* TikTok tab */}
                {activeTab === "tiktok" && (
                  <div className="space-y-4">
                    {renderCaptionTextarea("tiktok")}
                    <div className="border-t border-[#e5e5e5] pt-3">
                      <span className="text-[12px] font-semibold text-[#374151]">TikTok Settings</span>
                      <div className="mt-2 space-y-1">
                        <ToggleSwitch label="Allow Comments" checked={true} onChange={() => {}} />
                        <ToggleSwitch label="Allow Duets" checked={true} onChange={() => {}} />
                        <ToggleSwitch label="Allow Stitches" checked={true} onChange={() => {}} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Facebook tab */}
                {activeTab === "facebook" && renderCaptionTextarea("facebook")}

                {/* LinkedIn tab */}
                {activeTab === "linkedin" && (
                  <div className="space-y-4">
                    <div className="mb-3">
                      <span className="text-[12px] font-semibold text-[#374151]">Post To:</span>
                      <div className="mt-2 space-y-1">
                        <ToggleSwitch label="ATL Vibes & Views" checked={true} onChange={() => {}} />
                        <ToggleSwitch label="Mellanda Reese" checked={true} onChange={() => {}} />
                      </div>
                    </div>
                    {renderCaptionTextarea("linkedin")}
                  </div>
                )}

                {/* X tab */}
                {activeTab === "x" && renderCaptionTextarea("x")}

                {/* YouTube tab */}
                {activeTab === "youtube" && renderYouTubeTab()}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Sidebar */}
          <div className="space-y-5">
            {/* Schedule card */}
            <div className="bg-white border border-[#e5e5e5] p-5">
              <h3 className="font-display text-[18px] font-semibold text-black mb-4">Schedule</h3>
              <div className="flex gap-4 mb-4">
                <label
                  className="flex items-center gap-2 text-[13px] cursor-pointer"
                  onClick={() => setScheduleMode("now")}
                >
                  <span className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${scheduleMode === "now" ? "border-[#1a1a1a]" : "border-[#d4d4d4]"}`}>
                    {scheduleMode === "now" && <span className="w-2 h-2 bg-[#1a1a1a] rounded-full" />}
                  </span>
                  Publish Now
                </label>
                <label
                  className="flex items-center gap-2 text-[13px] cursor-pointer"
                  onClick={() => setScheduleMode("later")}
                >
                  <span className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${scheduleMode === "later" ? "border-[#1a1a1a]" : "border-[#d4d4d4]"}`}>
                    {scheduleMode === "later" && <span className="w-2 h-2 bg-[#1a1a1a] rounded-full" />}
                  </span>
                  Schedule for Later
                </label>
              </div>
              {scheduleMode === "later" && (
                <div className="bg-[#f5f5f5] border border-[#e5e5e5] p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#374151] mb-1">Date</label>
                      <input type="date" className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]" defaultValue="2026-02-15" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#374151] mb-1">Time (EST)</label>
                      <input type="time" className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151]" defaultValue="10:00" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#6b7280] mt-2">Your time zone: UTC-05:00</p>
                </div>
              )}
            </div>

            {/* Platforms card */}
            <div className="bg-white border border-[#e5e5e5] p-5">
              <h3 className="font-display text-[18px] font-semibold text-black mb-4">Platforms</h3>
              <div className="space-y-1">
                {PLATFORM_ACCOUNTS.map((acct) => (
                  <div key={acct.platform} className="flex items-center justify-between py-2 border-b border-[#f5f5f5] last:border-b-0">
                    <div>
                      <span className="text-[13px] font-medium text-[#374151]">{acct.name}</span>
                      <p className="text-[11px] text-[#6b7280]">{acct.handle}</p>
                    </div>
                    <ToggleSwitch
                      label=""
                      checked={platformToggles[acct.platform] ?? true}
                      onChange={(v) => setPlatformToggles((prev) => ({ ...prev, [acct.platform]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Publish Actions card */}
            <div className="bg-[#f8f5f0] border border-[#e5e5e5] p-5">
              <div className="bg-[#fef9c3] p-3 flex items-start gap-2 mb-4">
                <AlertTriangle size={14} className="text-[#ea580c] flex-shrink-0 mt-0.5" />
                <span className="text-[12px] text-[#92400e]">
                  <strong>Publishing fires Make.com S9.</strong> Content will be posted to all active platforms. This cannot be undone.
                </span>
              </div>
              {distributeStatus === "success" && (
                <div className="bg-[#dcfce7] p-3 flex items-start gap-2 mb-2">
                  <span className="text-[12px] text-[#16a34a] font-semibold">Distribution triggered successfully.</span>
                </div>
              )}
              {distributeStatus === "error" && (
                <div className="bg-[#fee2e2] p-3 flex items-start gap-2 mb-2">
                  <AlertTriangle size={14} className="text-[#c1121f] flex-shrink-0 mt-0.5" />
                  <span className="text-[12px] text-[#c1121f]">Distribution failed. Check Make.com webhook configuration.</span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  disabled={distributing}
                  onClick={async () => {
                    const webhookUrl = process.env.NEXT_PUBLIC_MAKE_S9_WEBHOOK_URL;
                    if (!webhookUrl) {
                      console.error("Make.com S9 webhook URL not configured (NEXT_PUBLIC_MAKE_S9_WEBHOOK_URL)");
                      setDistributeStatus("error");
                      return;
                    }
                    setDistributing(true);
                    setDistributeStatus("idle");
                    try {
                      const activePlatforms = Object.entries(platformToggles)
                        .filter(([, enabled]) => enabled)
                        .map(([platform]) => platform);

                      const payload = {
                        script_id: filmingScript.id,
                        title: filmingScript.title,
                        story_id: filmingScript.story_id,
                        platforms: activePlatforms,
                        schedule_mode: scheduleMode,
                        captions: Object.fromEntries(
                          captions
                            .filter((c) => activePlatforms.includes(c.platform))
                            .map((c) => [c.platform, { caption: c.caption, hashtags: c.hashtags, description: c.description, tags: c.tags }])
                        ),
                      };

                      const res = await fetch(webhookUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      });

                      if (res.ok) {
                        setDistributeStatus("success");
                      } else {
                        setDistributeStatus("error");
                      }
                    } catch {
                      setDistributeStatus("error");
                    } finally {
                      setDistributing(false);
                    }
                  }}
                  className="w-full inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors disabled:opacity-50"
                >
                  {distributing ? "Distributing…" : scheduleMode === "now" ? "Distribute Now" : "Schedule Distribution"}
                </button>
                <button
                  onClick={() => console.log(`Social Queue: Save draft ${filmingScript.id}`)}
                  className="w-full inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors"
                >
                  Save Draft
                </button>
                <Link
                  href="/admin/social"
                  className="w-full inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold border border-[#c1121f] text-[#c1121f] hover:bg-[#fee2e2] transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
