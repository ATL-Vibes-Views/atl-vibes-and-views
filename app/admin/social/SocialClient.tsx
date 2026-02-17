"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { AlertTriangle, Play, Paperclip, Check, Loader2 } from "lucide-react";
import { rejectSocialItem, savePlatformCaption, uploadScriptMedia } from "@/app/admin/actions";
import { createBrowserClient } from "@/lib/supabase";

/* ──────────────────────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────────────────────── */

interface ScriptRow {
  id: string;
  title: string;
  story_id: string | null;
  script_batch_id: string | null;
  status: string;
  platform: string | null;
  format: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  platform_captions: Record<string, unknown> | null;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
  script_batches: { batch_name: string | null } | null;
}

interface SocialClientProps {
  scripts: ScriptRow[];
}

/* ──────────────────────────────────────────────────────────────
   PLATFORM CONFIG
   ────────────────────────────────────────────────────────────── */

type PlatformKey = "youtube" | "instagram" | "tiktok" | "facebook" | "linkedin" | "x";

const PLATFORM_ORDER: PlatformKey[] = ["youtube", "instagram", "tiktok", "facebook", "linkedin", "x"];

const PLATFORM_CONFIG: Record<PlatformKey, { label: string; charLimit: number; color: string }> = {
  youtube:   { label: "YouTube",   charLimit: 5000,  color: "#FF0000" },
  instagram: { label: "Instagram", charLimit: 2200,  color: "#E1306C" },
  tiktok:    { label: "TikTok",    charLimit: 4000,  color: "#000000" },
  facebook:  { label: "Facebook",  charLimit: 63206, color: "#1877F2" },
  linkedin:  { label: "LinkedIn",  charLimit: 3000,  color: "#0A66C2" },
  x:         { label: "X",         charLimit: 280,   color: "#000000" },
};

const YOUTUBE_CATEGORIES = [
  "Entertainment", "News & Politics", "People & Blogs",
  "Travel & Events", "Film & Animation", "Education",
];

const YOUTUBE_VISIBILITY = ["public", "unlisted", "private"];

/* ──────────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────────── */

/** JSONB keys to check for each display platform (automation writes youtube_short) */
const JSONB_KEYS: Record<string, string[]> = {
  youtube: ["youtube_short", "youtube"],
};

/** Unwrap double-encoded JSONB (string stored inside JSONB column) */
function parsePlatformCaptions(pc: unknown): Record<string, unknown> {
  if (!pc) return {};
  let parsed: unknown = pc;
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return {}; }
  }
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return {}; }
  }
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  return {};
}

function getCaptionData(pc: unknown, key: string): Record<string, string> {
  const parsed = parsePlatformCaptions(pc);
  const keysToTry = JSONB_KEYS[key] ?? [key];
  for (const k of keysToTry) {
    const val = parsed[k];
    if (typeof val === "string") {
      try {
        const inner = JSON.parse(val);
        if (inner && typeof inner === "object" && Object.keys(inner).length > 0) return inner as Record<string, string>;
      } catch { /* not JSON */ }
    }
    if (val && typeof val === "object" && Object.keys(val as object).length > 0) return val as Record<string, string>;
  }
  return {};
}

/* ──────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────── */

export function SocialClient({ scripts }: SocialClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "needs_media" | "ready">("all");

  // Track which card has an active platform tag
  const [activeEditor, setActiveEditor] = useState<{ scriptId: string; platform: PlatformKey } | null>(null);

  // Inline caption editor state
  const [editorCaption, setEditorCaption] = useState("");
  const [editorHashtags, setEditorHashtags] = useState("");
  // YouTube-specific editor fields
  const [ytTitle, setYtTitle] = useState("");
  const [ytDescription, setYtDescription] = useState("");
  const [ytTags, setYtTags] = useState("");
  const [ytCategory, setYtCategory] = useState("");
  const [ytVisibility, setYtVisibility] = useState("public");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  /* ── Stats ── */
  const totalQueue = scripts.length;
  const readyToDistribute = scripts.filter((s) => !!s.media_url).length;
  const needsMedia = scripts.filter((s) => !s.media_url).length;

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    let items = scripts;
    if (filterMode === "needs_media") items = items.filter((s) => !s.media_url);
    if (filterMode === "ready") items = items.filter((s) => !!s.media_url);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((s) => s.title.toLowerCase().includes(q));
    }
    return items;
  }, [scripts, filterMode, search]);

  /* ── Open platform tag editor ── */
  const openEditor = useCallback((script: ScriptRow, platform: PlatformKey) => {
    // If same tag is already active, close it
    if (activeEditor?.scriptId === script.id && activeEditor.platform === platform) {
      setActiveEditor(null);
      return;
    }

    const pc = script.platform_captions;
    const data = getCaptionData(pc, platform);

    if (platform === "youtube") {
      setYtTitle(data.title ?? "");
      setYtDescription(data.description ?? "");
      setYtTags(data.tags ?? "");
      setYtCategory(data.category ?? "");
      setYtVisibility(data.visibility ?? "public");
    } else {
      setEditorCaption(data.caption ?? "");
      setEditorHashtags(data.hashtags ?? "");
    }

    setActiveEditor({ scriptId: script.id, platform });
    setSaveSuccess(null);
  }, [activeEditor]);

  /* ── Save caption ── */
  const handleSaveCaption = useCallback(async () => {
    if (!activeEditor) return;
    setSaving(true);
    setSaveSuccess(null);

    let captionData: Record<string, unknown>;
    if (activeEditor.platform === "youtube") {
      captionData = {
        title: ytTitle,
        description: ytDescription,
        tags: ytTags,
        category: ytCategory,
        visibility: ytVisibility,
      };
    } else {
      captionData = {
        caption: editorCaption,
        hashtags: editorHashtags,
      };
    }

    const result = await savePlatformCaption(activeEditor.scriptId, activeEditor.platform, captionData);
    setSaving(false);

    if (result.error) {
      alert("Failed to save: " + result.error);
    } else {
      setSaveSuccess(`${activeEditor.scriptId}-${activeEditor.platform}`);
      setTimeout(() => setSaveSuccess(null), 2000);
      router.refresh();
    }
  }, [activeEditor, editorCaption, editorHashtags, ytTitle, ytDescription, ytTags, ytCategory, ytVisibility, router]);

  /* ── Cancel editor ── */
  const handleCancelEditor = useCallback(() => {
    setActiveEditor(null);
  }, []);

  /* ── Reject handler ── */
  const handleReject = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to reject this script?")) return;
    setRejecting(id);
    const result = await rejectSocialItem(id, "script");
    setRejecting(null);
    if (result.error) alert("Error: " + result.error);
    else router.refresh();
  }, [router]);

  /* ── Upload handler ── */
  const handleUpload = useCallback((scriptId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4,video/quicktime,image/jpeg,image/png";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingId(scriptId);
      const supabase = createBrowserClient();
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `videos/${scriptId}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("scripts-media").upload(path, file, { upsert: true });
      if (error) {
        alert("Upload failed: " + error.message);
        setUploadingId(null);
        return;
      }
      const { data: urlData } = supabase.storage.from("scripts-media").getPublicUrl(path);
      const result = await uploadScriptMedia(scriptId, "media_url", urlData.publicUrl);
      setUploadingId(null);
      if (result.error) {
        alert("Failed to save media URL: " + result.error);
      } else {
        router.refresh();
      }
    };
    input.click();
  }, [router]);

  /* ── Char count helper ── */
  const charCountClass = (len: number, limit: number) => {
    if (len > limit) return "text-[#c1121f] font-semibold";
    if (len > limit * 0.9) return "text-[#ea580c]";
    return "text-gray-400";
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */

  return (
    <>
      <PortalTopbar
        title="Social Queue"
        actions={
          <span className="text-[12px] text-[#6b7280]">
            Approved scripts ready for distribution
          </span>
        }
      />

      <div className="p-8 space-y-4">
        {/* ── Stat Cards (3) ── */}
        <StatGrid columns={3}>
          <StatCard label="Total Queue" value={totalQueue} />
          <StatCard
            label="Ready to Distribute"
            value={readyToDistribute}
            badge={readyToDistribute > 0 ? { text: "Ready", variant: "green" } : undefined}
          />
          <StatCard
            label="Needs Media"
            value={needsMedia}
            badge={needsMedia > 0 ? { text: "Action", variant: "red" } : undefined}
          />
        </StatGrid>

        {/* ── Filter + Search ── */}
        <div className="flex items-center gap-3">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as typeof filterMode)}
            className="px-3 py-2 text-sm border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-[#1a1a1a]"
          >
            <option value="all">All</option>
            <option value="needs_media">Needs Media</option>
            <option value="ready">Ready to Distribute</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queue..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-[#1a1a1a]"
          />
        </div>

        {/* ── Cards ── */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-500">No items in the social queue.</p>
            </div>
          )}

          {filtered.map((script) => {
            const hasMedia = !!script.media_url;
            const isEditorOpen = activeEditor?.scriptId === script.id;
            const activePlatform = isEditorOpen ? activeEditor.platform : null;

            return (
              <div
                key={script.id}
                className="bg-white border border-gray-200 border-l-4 border-l-green-600"
              >
                <div className="px-5 py-4">
                  {/* Row 1 — Header */}
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className="text-xl font-semibold text-black"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {script.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          const slug = script.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          window.open('/hub/stories/' + slug, '_blank');
                        }}
                        className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
                      >
                        Preview
                      </button>
                      {hasMedia && (
                        <button
                          onClick={() => router.push(`/admin/social/distribute/${script.id}?mode=distribute`)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          🚀 Distribute
                        </button>
                      )}
                      <button
                        onClick={() => handleReject(script.id)}
                        disabled={rejecting === script.id}
                        className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full text-[#c1121f] hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {rejecting === script.id ? "…" : "× Reject"}
                      </button>
                    </div>
                  </div>

                  {/* Row 2 — Meta badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#dcfce7] text-[#166534]">
                      Script
                    </span>
                    {script.script_batches?.batch_name && (
                      <span className="text-sm text-gray-500">
                        {script.script_batches.batch_name}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      Approved {new Date(script.created_at).toLocaleDateString()}
                    </span>
                    {hasMedia ? (
                      <span className="text-sm text-[#16a34a] font-medium">
                        ✓ Video Attached
                      </span>
                    ) : (
                      <span className="text-sm text-[#c1121f] font-medium">
                        ⚠ Media Required
                      </span>
                    )}
                  </div>

                  {/* Row 3 — Media Section */}
                  <div className="mt-3">
                    {hasMedia ? (
                      <div className="flex items-center gap-3">
                        <div className="relative w-[120px] h-[80px] bg-black flex items-center justify-center overflow-hidden flex-shrink-0">
                          {script.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={script.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : null}
                          <Play size={24} className="absolute text-white/80" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">
                            {script.media_url!.split("/").pop() ?? "video"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Uploaded {new Date(script.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ) : uploadingId === script.id ? (
                      <div className="border-2 border-dashed border-[#e6c46d] bg-[#fefcf5] p-5 text-center">
                        <Loader2 size={20} className="mx-auto mb-1.5 text-gray-500 animate-spin" />
                        <p className="text-sm text-gray-600 font-medium">Uploading...</p>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleUpload(script.id)}
                        className="border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        <Paperclip size={20} className="mx-auto mb-1.5 text-gray-400" />
                        <p className="text-sm text-gray-600 font-medium">Upload Video or Images</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Drag &amp; drop or click to browse · MP4, MOV, JPG, PNG
                        </p>
                        <p className="text-xs text-[#c1121f] mt-1.5 font-medium">
                          ⚠ Required before distributing
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Row 4 — Platform Tags (Interactive) */}
                  <div className="mt-4">
                    <span className="text-sm font-semibold text-gray-500">Captions:</span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {PLATFORM_ORDER.map((p) => {
                        const cfg = PLATFORM_CONFIG[p];
                        const isActive = activePlatform === p;
                        const hasData = !!getCaptionData(script.platform_captions, p).caption || !!getCaptionData(script.platform_captions, p).title;
                        return (
                          <button
                            key={p}
                            onClick={() => openEditor(script, p)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                              isActive
                                ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                              style={{ backgroundColor: cfg.color }}
                            />
                            {cfg.label}
                            {hasData && !isActive && (
                              <Check size={10} className="text-green-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Caption Editor (appears below tags when one is active) */}
                  {isEditorOpen && activePlatform && (
                    <div className="bg-gray-50 border border-gray-200 p-4 mt-3">
                      {activePlatform === "youtube" ? (
                        /* YouTube special editor */
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                              <input
                                value={ytTitle}
                                onChange={(e) => setYtTitle(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 bg-white focus:outline-none focus:border-[#1a1a1a]"
                                placeholder="Video title..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                              <select
                                value={ytCategory}
                                onChange={(e) => setYtCategory(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 bg-white focus:outline-none focus:border-[#1a1a1a]"
                              >
                                <option value="">Select category</option>
                                {YOUTUBE_CATEGORIES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                            <textarea
                              value={ytDescription}
                              onChange={(e) => setYtDescription(e.target.value)}
                              className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-200 bg-white resize-vertical focus:outline-none focus:border-[#1a1a1a]"
                              placeholder="Video description..."
                            />
                            <div className={`text-right text-[11px] mt-0.5 ${charCountClass(ytDescription.length, 5000)}`}>
                              {ytDescription.length.toLocaleString()} / 5,000
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Tags</label>
                              <input
                                value={ytTags}
                                onChange={(e) => setYtTags(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 bg-white focus:outline-none focus:border-[#1a1a1a]"
                                placeholder="atlanta, vibes, news"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Visibility</label>
                              <select
                                value={ytVisibility}
                                onChange={(e) => setYtVisibility(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 bg-white focus:outline-none focus:border-[#1a1a1a]"
                              >
                                {YOUTUBE_VISIBILITY.map((v) => (
                                  <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={handleCancelEditor}
                              className="border border-gray-300 text-gray-500 rounded-full px-4 py-1.5 text-sm transition-colors hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveCaption}
                              disabled={saving}
                              className="bg-green-600 text-white rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-green-700 disabled:opacity-50"
                            >
                              {saving ? "Saving…" : "Save"}
                            </button>
                            {saveSuccess === `${script.id}-youtube` && (
                              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <Check size={12} /> Saved
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Standard platform editor */
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-gray-600">
                                {PLATFORM_CONFIG[activePlatform].label} Caption
                              </label>
                              <span className={`text-[11px] ${charCountClass(editorCaption.length, PLATFORM_CONFIG[activePlatform].charLimit)}`}>
                                {editorCaption.length.toLocaleString()} / {PLATFORM_CONFIG[activePlatform].charLimit.toLocaleString()}
                              </span>
                            </div>
                            {!editorCaption && !getCaptionData(script.platform_captions, activePlatform).caption && (
                              <p className="text-xs text-gray-400 italic mb-1">Awaiting caption generation</p>
                            )}
                            <textarea
                              value={editorCaption}
                              onChange={(e) => setEditorCaption(e.target.value)}
                              className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-200 bg-white resize-vertical focus:outline-none focus:border-[#1a1a1a]"
                              placeholder={`Enter ${PLATFORM_CONFIG[activePlatform].label} caption...`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Hashtags</label>
                            <input
                              value={editorHashtags}
                              onChange={(e) => setEditorHashtags(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-200 bg-white focus:outline-none focus:border-[#1a1a1a]"
                              placeholder="#atlanta #atlvibes"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={handleCancelEditor}
                              className="border border-gray-300 text-gray-500 rounded-full px-4 py-1.5 text-sm transition-colors hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveCaption}
                              disabled={saving}
                              className="bg-green-600 text-white rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-green-700 disabled:opacity-50"
                            >
                              {saving ? "Saving…" : "Save"}
                            </button>
                            {saveSuccess === `${script.id}-${activePlatform}` && (
                              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <Check size={12} /> Saved
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
