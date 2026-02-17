"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, ChevronDown, ChevronUp, AlertTriangle, Info, Play } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { ToggleSwitch } from "@/components/portal/ToggleSwitch";
import { Modal } from "@/components/portal/Modal";
import { distributeScript, saveDraftDistribution, uploadScriptMedia } from "@/app/admin/actions";
import { createBrowserClient } from "@/lib/supabase";

/* ──────────────────────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────────────────────── */

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
  media_url: string | null;
  thumbnail_url: string | null;
  platform_captions: Record<string, unknown> | null;
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

/* ──────────────────────────────────────────────────────────────
   PLATFORM CONFIG
   ────────────────────────────────────────────────────────────── */

const PLATFORM_ORDER = ["instagram", "tiktok", "facebook", "linkedin", "x", "youtube"] as const;
type PlatformKey = (typeof PLATFORM_ORDER)[number];

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

/* ──────────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────────── */

function extractFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").pop() ?? url;
  } catch {
    return url.split("/").pop() ?? url;
  }
}

function initPlatformCaptions(
  captions: CaptionRow[],
  platformCaptionsJson: Record<string, unknown> | null
): Record<PlatformKey, string> {
  const result = {} as Record<PlatformKey, string>;
  for (const p of PLATFORM_ORDER) {
    // Prefer saved platform_captions from the script record
    const saved = platformCaptionsJson?.[p] as Record<string, string> | undefined;
    if (saved?.caption) {
      result[p] = saved.caption;
    } else {
      // Fall back to caption rows
      const row = captions.find((c) => c.platform === p);
      result[p] = row?.caption ?? "";
    }
  }
  return result;
}

function initPlatformHashtags(
  captions: CaptionRow[],
  platformCaptionsJson: Record<string, unknown> | null
): Record<PlatformKey, string> {
  const result = {} as Record<PlatformKey, string>;
  for (const p of PLATFORM_ORDER) {
    const saved = platformCaptionsJson?.[p] as Record<string, string> | undefined;
    if (saved?.hashtags) {
      result[p] = saved.hashtags;
    } else {
      const row = captions.find((c) => c.platform === p);
      result[p] = row?.hashtags ?? "";
    }
  }
  return result;
}

/* ──────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────── */

export function DistributeClient({ filmingScript, captions }: DistributeClientProps) {
  const router = useRouter();

  /* ── UI state ─────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [scriptExpanded, setScriptExpanded] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("later");
  const [scheduleDate, setScheduleDate] = useState(
    filmingScript?.scheduled_date
      ? filmingScript.scheduled_date.split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [distributing, setDistributing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [distributeStatus, setDistributeStatus] = useState<"idle" | "success" | "error">("idle");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  /* ── Platform toggles ─────────────────────────────────────── */
  const [platformToggles, setPlatformToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(PLATFORM_ACCOUNTS.map((p) => [p.platform, true]))
  );

  /* ── Caption state ────────────────────────────────────────── */
  const savedCaptions = filmingScript?.platform_captions ?? null;
  const sharedSaved = savedCaptions?.shared as Record<string, string> | undefined;

  const [sharedCaption, setSharedCaption] = useState(
    sharedSaved?.caption ?? captions.find((c) => c.platform === "instagram")?.caption ?? ""
  );
  const [sharedHashtags, setSharedHashtags] = useState(
    sharedSaved?.hashtags ?? captions.find((c) => c.platform === "instagram")?.hashtags ?? ""
  );
  const [platformCaptions, setPlatformCaptions] = useState<Record<PlatformKey, string>>(
    () => initPlatformCaptions(captions, savedCaptions)
  );
  const [platformHashtags, setPlatformHashtags] = useState<Record<PlatformKey, string>>(
    () => initPlatformHashtags(captions, savedCaptions)
  );
  const [detachedPlatforms, setDetachedPlatforms] = useState<Set<PlatformKey>>(new Set());

  /* ── TikTok settings ──────────────────────────────────────── */
  const savedTiktok = savedCaptions?.tiktok as Record<string, boolean> | undefined;
  const [tiktokSettings, setTiktokSettings] = useState({
    allowComments: savedTiktok?.allow_comments ?? true,
    allowDuets: savedTiktok?.allow_duets ?? true,
    allowStitches: savedTiktok?.allow_stitches ?? true,
  });

  /* ── LinkedIn settings ────────────────────────────────────── */
  const savedLinkedin = savedCaptions?.linkedin as Record<string, boolean> | undefined;
  const [linkedinSettings, setLinkedinSettings] = useState({
    postToCompany: savedLinkedin?.post_to_company ?? true,
    postToPersonal: savedLinkedin?.post_to_personal ?? true,
  });

  /* ── YouTube settings ─────────────────────────────────────── */
  const savedYoutube = savedCaptions?.youtube as Record<string, string | boolean> | undefined;
  const ytCaptionRow = captions.find((c) => c.platform === "youtube");
  const [youtubeTitle, setYoutubeTitle] = useState(
    (savedYoutube?.title as string) ?? ytCaptionRow?.caption ?? ""
  );
  const [youtubeDescription, setYoutubeDescription] = useState(
    (savedYoutube?.description as string) ?? ytCaptionRow?.description ?? ""
  );
  const [youtubeTags, setYoutubeTags] = useState(
    (savedYoutube?.tags as string) ?? ytCaptionRow?.tags ?? ""
  );
  const [youtubePlaylist, setYoutubePlaylist] = useState(
    (savedYoutube?.playlist as string) ?? "Select a playlist"
  );
  const [youtubeCategory, setYoutubeCategory] = useState(
    (savedYoutube?.category as string) ?? "Select a category"
  );
  const [youtubeLanguage, setYoutubeLanguage] = useState(
    (savedYoutube?.language as string) ?? "English"
  );
  const [youtubeVisibility, setYoutubeVisibility] = useState(
    (savedYoutube?.visibility as string) ?? "Public"
  );
  const [youtubeLicense, setYoutubeLicense] = useState(
    (savedYoutube?.license as string) ?? "Standard YouTube License"
  );
  const [youtubeMadeForKids, setYoutubeMadeForKids] = useState(
    (savedYoutube?.made_for_kids as boolean) ?? false
  );
  const [youtubeAllowEmbedding, setYoutubeAllowEmbedding] = useState(
    (savedYoutube?.allow_embedding as boolean) ?? true
  );
  const [youtubeNotifySubscribers, setYoutubeNotifySubscribers] = useState(
    (savedYoutube?.notify_subscribers as boolean) ?? true
  );

  /* ── Caption map for data lookup ──────────────────────────── */
  const captionMap = useMemo(() => {
    const map = new Map<string, CaptionRow>();
    for (const cap of captions) {
      map.set(cap.platform, cap);
    }
    return map;
  }, [captions]);

  /* ── Active platform count ────────────────────────────────── */
  const activePlatformCount = useMemo(
    () => Object.values(platformToggles).filter(Boolean).length,
    [platformToggles]
  );

  /* ── Shared caption propagation ───────────────────────────── */
  const handleSharedCaptionChange = useCallback(
    (value: string) => {
      setSharedCaption(value);
      setPlatformCaptions((prev) => {
        const next = { ...prev };
        for (const p of PLATFORM_ORDER) {
          if (p !== "youtube" && !detachedPlatforms.has(p)) {
            next[p] = value;
          }
        }
        return next;
      });
    },
    [detachedPlatforms]
  );

  const handleSharedHashtagsChange = useCallback(
    (value: string) => {
      setSharedHashtags(value);
      setPlatformHashtags((prev) => {
        const next = { ...prev };
        for (const p of PLATFORM_ORDER) {
          if (p !== "youtube" && !detachedPlatforms.has(p)) {
            next[p] = value;
          }
        }
        return next;
      });
    },
    [detachedPlatforms]
  );

  const handlePlatformCaptionChange = useCallback(
    (platform: PlatformKey, value: string) => {
      setDetachedPlatforms((prev) => new Set(prev).add(platform));
      setPlatformCaptions((prev) => ({ ...prev, [platform]: value }));
    },
    []
  );

  const handlePlatformHashtagsChange = useCallback(
    (platform: PlatformKey, value: string) => {
      setDetachedPlatforms((prev) => new Set(prev).add(platform));
      setPlatformHashtags((prev) => ({ ...prev, [platform]: value }));
    },
    []
  );

  /* ── Build platform_captions JSONB ────────────────────────── */
  const buildPlatformCaptions = useCallback((): Record<string, unknown> => {
    return {
      shared: { caption: sharedCaption, hashtags: sharedHashtags },
      instagram: { caption: platformCaptions.instagram, hashtags: platformHashtags.instagram },
      tiktok: {
        caption: platformCaptions.tiktok,
        hashtags: platformHashtags.tiktok,
        allow_comments: tiktokSettings.allowComments,
        allow_duets: tiktokSettings.allowDuets,
        allow_stitches: tiktokSettings.allowStitches,
      },
      facebook: { caption: platformCaptions.facebook, hashtags: platformHashtags.facebook },
      linkedin: {
        caption: platformCaptions.linkedin,
        hashtags: platformHashtags.linkedin,
        post_to_company: linkedinSettings.postToCompany,
        post_to_personal: linkedinSettings.postToPersonal,
      },
      x: { caption: platformCaptions.x, hashtags: platformHashtags.x },
      youtube: {
        title: youtubeTitle,
        description: youtubeDescription,
        tags: youtubeTags,
        playlist: youtubePlaylist,
        category: youtubeCategory,
        language: youtubeLanguage,
        visibility: youtubeVisibility,
        license: youtubeLicense,
        made_for_kids: youtubeMadeForKids,
        allow_embedding: youtubeAllowEmbedding,
        notify_subscribers: youtubeNotifySubscribers,
      },
    };
  }, [
    sharedCaption, sharedHashtags,
    platformCaptions, platformHashtags,
    tiktokSettings, linkedinSettings,
    youtubeTitle, youtubeDescription, youtubeTags,
    youtubePlaylist, youtubeCategory, youtubeLanguage,
    youtubeVisibility, youtubeLicense, youtubeMadeForKids,
    youtubeAllowEmbedding, youtubeNotifySubscribers,
  ]);

  /* ── Distribute handler ───────────────────────────────────── */
  const handleDistribute = useCallback(async () => {
    if (!filmingScript) return;
    setDistributing(true);
    setDistributeStatus("idle");
    try {
      const activePlatforms = Object.entries(platformToggles)
        .filter(([, enabled]) => enabled)
        .map(([platform]) => platform);

      const scheduledDate =
        scheduleMode === "later"
          ? `${scheduleDate}T${scheduleTime}:00`
          : undefined;

      const result = await distributeScript(filmingScript.id, {
        platformCaptions: buildPlatformCaptions(),
        platforms: activePlatforms,
        scheduleMode,
        scheduledDate,
        storyId: filmingScript.story_id,
      });

      if (result.error) {
        setDistributeStatus("error");
      } else {
        setDistributeStatus("success");
        setTimeout(() => {
          router.push("/admin/social");
        }, 1200);
      }
    } catch {
      setDistributeStatus("error");
    } finally {
      setDistributing(false);
      setConfirmModalOpen(false);
    }
  }, [filmingScript, platformToggles, scheduleMode, scheduleDate, scheduleTime, buildPlatformCaptions, router]);

  /* ── Save Draft handler ───────────────────────────────────── */
  const handleSaveDraft = useCallback(async () => {
    if (!filmingScript) return;
    setSaving(true);
    try {
      const scheduledDate =
        scheduleMode === "later"
          ? `${scheduleDate}T${scheduleTime}:00`
          : undefined;

      const result = await saveDraftDistribution(filmingScript.id, {
        platformCaptions: buildPlatformCaptions(),
        scheduledDate,
      });

      if (result.error) {
        alert("Failed to save draft: " + result.error);
      } else {
        alert("Draft saved successfully.");
        router.refresh();
      }
    } catch {
      alert("Failed to save draft. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [filmingScript, scheduleMode, scheduleDate, scheduleTime, buildPlatformCaptions, router]);

  /* ── Upload file to Supabase Storage ─────────────────────── */
  const uploadToStorage = useCallback(async (file: File, folder: string): Promise<string | null> => {
    const supabase = createBrowserClient();
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${folder}/${filmingScript?.id ?? "unknown"}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("scripts-media").upload(path, file, { upsert: true });
    if (error) {
      alert("Upload failed: " + error.message);
      return null;
    }
    const { data: urlData } = supabase.storage.from("scripts-media").getPublicUrl(path);
    return urlData.publicUrl;
  }, [filmingScript?.id]);

  /* ── Replace Video handler ────────────────────────────────── */
  const handleReplaceVideo = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4,video/quicktime";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !filmingScript) return;
      const publicUrl = await uploadToStorage(file, "videos");
      if (publicUrl) {
        const result = await uploadScriptMedia(filmingScript.id, "media_url", publicUrl);
        if (result.error) {
          alert("Failed to save video URL: " + result.error);
        } else {
          router.refresh();
        }
      }
    };
    input.click();
  }, [filmingScript, uploadToStorage, router]);

  /* ── Add Thumbnail handler ────────────────────────────────── */
  const handleAddThumbnail = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !filmingScript) return;
      const publicUrl = await uploadToStorage(file, "thumbnails");
      if (publicUrl) {
        const result = await uploadScriptMedia(filmingScript.id, "thumbnail_url", publicUrl);
        if (result.error) {
          alert("Failed to save thumbnail URL: " + result.error);
        } else {
          router.refresh();
        }
      }
    };
    input.click();
  }, [filmingScript, uploadToStorage, router]);

  /* ── Copy to clipboard ────────────────────────────────────── */
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      /* silent fail */
    });
  }, []);

  /* ── Char count styling ───────────────────────────────────── */
  const getCharCountClass = (len: number, limit: number) => {
    if (len > limit) return "text-[#c1121f] font-semibold";
    if (len > limit * 0.9) return "text-[#ea580c]";
    return "text-[#6b7280]";
  };

  /* ══════════════════════════════════════════════════════════
     NULL GUARD
     ══════════════════════════════════════════════════════════ */

  if (!filmingScript) {
    return (
      <>
        <PortalTopbar title="Script Not Found" />
        <div className="p-8">
          <Link
            href="/admin/social"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors"
          >
            <ArrowLeft size={14} /> Back to Social Queue
          </Link>
          <div className="bg-white border border-[#e5e5e5] p-8 text-center mt-4">
            <p className="text-[13px] text-[#6b7280]">Script not found.</p>
          </div>
        </div>
      </>
    );
  }

  /* ══════════════════════════════════════════════════════════
     RENDER HELPERS
     ══════════════════════════════════════════════════════════ */

  const renderCaptionTextarea = (platform: PlatformKey) => {
    const config = PLATFORM_CONFIG[platform];
    const text = platformCaptions[platform];
    const hashtags = platformHashtags[platform];
    const len = text.length;

    return (
      <div className="space-y-3">
        {/* Detach warning */}
        {activeTab !== "all" && (
          <div className="bg-[#fef9c3] p-3 flex items-start gap-2">
            <AlertTriangle size={14} className="text-[#ea580c] flex-shrink-0 mt-0.5" />
            <span className="text-[12px] text-[#92400e]">
              Editing a platform-specific tab will detach it from the shared caption.
            </span>
          </div>
        )}

        <div>
          <label className="block text-[12px] font-semibold text-[#374151] mb-1">
            {config.label} Caption
            {detachedPlatforms.has(platform) && (
              <span className="ml-2 text-[11px] font-normal text-[#ea580c]">(detached from shared)</span>
            )}
          </label>
          <textarea
            className="w-full min-h-[100px] p-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] resize-vertical focus:outline-none focus:border-[#1a1a1a] transition-colors"
            value={text}
            onChange={(e) => handlePlatformCaptionChange(platform, e.target.value)}
            placeholder={`Enter ${config.label} caption...`}
          />
          <div className={`text-right text-[11px] mt-1 ${getCharCountClass(len, config.charLimit)}`}>
            {len.toLocaleString()} / {config.charLimit.toLocaleString()}
          </div>
        </div>

        {/* Platform-specific hashtags (non-YouTube) */}
        {platform !== "youtube" && (
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Hashtags</label>
            <input
              className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a] transition-colors"
              value={hashtags}
              onChange={(e) => handlePlatformHashtagsChange(platform, e.target.value)}
              placeholder="#atlanta #atlvibes"
            />
          </div>
        )}
      </div>
    );
  };

  const renderYouTubeTab = () => {
    return (
      <div className="space-y-4">
        {/* Detach warning */}
        <div className="bg-[#fef9c3] p-3 flex items-start gap-2">
          <AlertTriangle size={14} className="text-[#ea580c] flex-shrink-0 mt-0.5" />
          <span className="text-[12px] text-[#92400e]">
            YouTube uses its own title, description, and tags fields. Changes here do not affect other platforms.
          </span>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#374151] mb-1">
            Video Title <span className="font-normal text-[#6b7280]">(required)</span>
          </label>
          <input
            className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a] transition-colors"
            value={youtubeTitle}
            onChange={(e) => setYoutubeTitle(e.target.value)}
            placeholder="Enter video title..."
          />
          <div className={`text-right text-[11px] mt-1 ${getCharCountClass(youtubeTitle.length, 100)}`}>
            {youtubeTitle.length} / 100
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#374151] mb-1">
            Description <span className="font-normal text-[#6b7280]">(required)</span>
          </label>
          <textarea
            className="w-full min-h-[120px] p-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] resize-vertical focus:outline-none focus:border-[#1a1a1a] transition-colors"
            value={youtubeDescription}
            onChange={(e) => setYoutubeDescription(e.target.value)}
            placeholder="Enter video description..."
          />
          <div className={`text-right text-[11px] mt-1 ${getCharCountClass(youtubeDescription.length, 5000)}`}>
            {youtubeDescription.length.toLocaleString()} / 5,000
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Playlist</label>
            <select
              className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a] transition-colors"
              value={youtubePlaylist}
              onChange={(e) => setYoutubePlaylist(e.target.value)}
            >
              <option>Select a playlist</option>
              <option>Atlanta Quick Takes</option>
              <option>Neighborhood Spotlights</option>
              <option>Food &amp; Dining</option>
              <option>Development Updates</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Category</label>
            <select
              className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a] transition-colors"
              value={youtubeCategory}
              onChange={(e) => setYoutubeCategory(e.target.value)}
            >
              <option>Select a category</option>
              <option>Entertainment</option>
              <option>News &amp; Politics</option>
              <option>People &amp; Blogs</option>
              <option>Travel &amp; Events</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#374151] mb-1">
            Tags <span className="font-normal text-[#6b7280]">(comma separated)</span>
          </label>
          <input
            className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a] transition-colors"
            value={youtubeTags}
            onChange={(e) => setYoutubeTags(e.target.value)}
            placeholder="atlanta, atl vibes, news"
          />
          <div className={`text-right text-[11px] mt-1 ${getCharCountClass(youtubeTags.length, 500)}`}>
            {youtubeTags.length} / 500
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Language</label>
            <select
              className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a] transition-colors"
              value={youtubeLanguage}
              onChange={(e) => setYoutubeLanguage(e.target.value)}
            >
              <option>English</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">Visibility</label>
            <select
              className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a] transition-colors"
              value={youtubeVisibility}
              onChange={(e) => setYoutubeVisibility(e.target.value)}
            >
              <option>Public</option>
              <option>Unlisted</option>
              <option>Private</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#374151] mb-1">License</label>
          <select
            className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a] transition-colors"
            value={youtubeLicense}
            onChange={(e) => setYoutubeLicense(e.target.value)}
          >
            <option>Standard YouTube License</option>
            <option>Creative Commons</option>
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#374151] mb-2">Audience</label>
          <div className="flex gap-4">
            <label
              className="flex items-center gap-2 text-[13px] cursor-pointer"
              onClick={() => setYoutubeMadeForKids(true)}
            >
              <span
                className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                  youtubeMadeForKids ? "border-[#1a1a1a]" : "border-[#d4d4d4]"
                }`}
              >
                {youtubeMadeForKids && <span className="w-2 h-2 bg-[#1a1a1a] rounded-full" />}
              </span>
              Yes, it&apos;s made for kids
            </label>
            <label
              className="flex items-center gap-2 text-[13px] cursor-pointer"
              onClick={() => setYoutubeMadeForKids(false)}
            >
              <span
                className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                  !youtubeMadeForKids ? "border-[#1a1a1a]" : "border-[#d4d4d4]"
                }`}
              >
                {!youtubeMadeForKids && <span className="w-2 h-2 bg-[#1a1a1a] rounded-full" />}
              </span>
              No, it&apos;s not made for kids
            </label>
          </div>
        </div>

        <div className="border-t border-[#e5e5e5] pt-3 space-y-1">
          <ToggleSwitch
            label="Allow Embedding"
            checked={youtubeAllowEmbedding}
            onChange={(v) => setYoutubeAllowEmbedding(v)}
          />
          <ToggleSwitch
            label="Notify Subscribers"
            checked={youtubeNotifySubscribers}
            onChange={(v) => setYoutubeNotifySubscribers(v)}
          />
        </div>
      </div>
    );
  };

  const isVerticalFormat =
    filmingScript.format === "talking_head" || filmingScript.format === "green_screen";

  /* ══════════════════════════════════════════════════════════
     MAIN RENDER
     ══════════════════════════════════════════════════════════ */

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
        <Link
          href="/admin/social"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors"
        >
          <ArrowLeft size={14} /> Back to Social Queue
        </Link>

        {/* Workflow breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
          <span className="px-3 py-1 rounded-full bg-[#dcfce7] text-[#16a34a] border border-[#16a34a] font-semibold">
            Pipeline
          </span>
          <span className="text-[#d4d4d4]">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-[#dcfce7] text-[#16a34a] border border-[#16a34a] font-semibold">
            Scripts
          </span>
          <span className="text-[#d4d4d4]">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-[#dcfce7] text-[#16a34a] border border-[#16a34a] font-semibold">
            Social Queue
          </span>
          <span className="text-[#d4d4d4]">&rarr;</span>
          <span className="px-3 py-1 rounded-full bg-[#1a1a1a] text-white border border-[#1a1a1a] font-semibold">
            Distribute
          </span>
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
            {platformToggles.instagram && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ede9fe] text-[#7c3aed]">
                Instagram Reel
              </span>
            )}
            {platformToggles.tiktok && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#1a1a1a] text-white">
                TikTok
              </span>
            )}
            {platformToggles.youtube && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fee2e2] text-[#c1121f]">
                YouTube Shorts
              </span>
            )}
            {platformToggles.facebook && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#dbeafe] text-[#2563eb]">
                Facebook
              </span>
            )}
            {platformToggles.linkedin && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ccfbf1] text-[#0d9488]">
                LinkedIn
              </span>
            )}
            {platformToggles.x && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e5e5e5] text-[#374151]">
                X
              </span>
            )}
            {activePlatformCount === 0 && (
              <span className="text-[11px] text-[#c1121f] italic">No platforms selected</span>
            )}
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

        {/* ── Two-column layout ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            {/* Filming Script -- collapsible */}
            <div className="bg-white border border-[#e5e5e5]">
              <div
                className="px-5 py-3 flex items-center justify-between cursor-pointer"
                onClick={() => setScriptExpanded(!scriptExpanded)}
              >
                <h3 className="font-display text-[16px] font-semibold text-black">Filming Script</h3>
                <div className="flex items-center gap-2">
                  {filmingScript.script_text && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(filmingScript.script_text!);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-[#6b7280] hover:text-black transition-colors"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  )}
                  {scriptExpanded ? (
                    <ChevronUp size={14} className="text-[#6b7280]" />
                  ) : (
                    <ChevronDown size={14} className="text-[#6b7280]" />
                  )}
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

            {/* Media section (1C.6) */}
            <div className="bg-white border border-[#e5e5e5] p-5">
              <h3 className="font-display text-[18px] font-semibold text-black mb-4">Media</h3>

              <div className="w-full max-w-2xl mx-auto mb-3">
                {filmingScript.media_url ? (
                  <div className="space-y-3">
                    <div className={`relative w-full ${
                      isVerticalFormat
                        ? 'aspect-[9/16] max-w-sm mx-auto'
                        : 'aspect-video'
                    }`}>
                      <video
                        src={filmingScript.media_url}
                        controls
                        className="absolute inset-0 w-full h-full object-contain bg-black rounded"
                        poster={filmingScript.thumbnail_url || undefined}
                      />
                    </div>
                    <p className="text-[12px] text-[#6b7280]">
                      {extractFilename(filmingScript.media_url)}
                    </p>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <Play size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-400">No video uploaded</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleReplaceVideo}
                  className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
                >
                  Replace Video
                </button>
                <button
                  onClick={handleAddThumbnail}
                  className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
                >
                  Add Thumbnail
                </button>
              </div>
            </div>

            {/* Platform Captions -- Tabbed */}
            <div className="bg-white border border-[#e5e5e5]">
              <div className="px-5 pt-5">
                <h3 className="font-display text-[18px] font-semibold text-black mb-3">
                  Platform Captions
                </h3>
                {/* Info banner */}
                <div className="bg-[#dbeafe] p-3 flex items-start gap-2 mb-4">
                  <Info size={14} className="text-[#2563eb] flex-shrink-0 mt-0.5" />
                  <span className="text-[12px] text-[#1e40af]">
                    Captions were auto-generated by content automation. Edit any platform below before
                    publishing.
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
                      {detachedPlatforms.has(p) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" title="Detached from shared" />
                      )}
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
                        Shared Caption{" "}
                        <span className="font-normal text-[#6b7280]">
                          (edits here apply to all non-detached platforms)
                        </span>
                      </label>
                      <textarea
                        className="w-full min-h-[100px] p-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] resize-vertical focus:outline-none focus:border-[#1a1a1a] transition-colors"
                        value={sharedCaption}
                        onChange={(e) => handleSharedCaptionChange(e.target.value)}
                        placeholder="Enter shared caption for all platforms..."
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                        Hashtags{" "}
                        <span className="font-normal text-[#6b7280]">(applied to all non-detached platforms)</span>
                      </label>
                      <input
                        className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                        value={sharedHashtags}
                        onChange={(e) => handleSharedHashtagsChange(e.target.value)}
                        placeholder="#atlanta #atlvibes"
                      />
                    </div>
                    <div className="bg-[#fef9c3] p-3 flex items-start gap-2">
                      <AlertTriangle size={14} className="text-[#ea580c] flex-shrink-0 mt-0.5" />
                      <span className="text-[12px] text-[#92400e]">
                        Editing a platform-specific tab will detach it from the shared caption. Changes here
                        will not override platform-specific edits.
                      </span>
                    </div>
                    {detachedPlatforms.size > 0 && (
                      <div className="bg-[#f5f5f5] p-3 text-[12px] text-[#6b7280]">
                        <strong>Detached platforms:</strong>{" "}
                        {Array.from(detachedPlatforms)
                          .map((p) => PLATFORM_CONFIG[p].label)
                          .join(", ")}
                      </div>
                    )}
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
                        <ToggleSwitch
                          label="Allow Comments"
                          checked={tiktokSettings.allowComments}
                          onChange={(v) => setTiktokSettings((prev) => ({ ...prev, allowComments: v }))}
                        />
                        <ToggleSwitch
                          label="Allow Duets"
                          checked={tiktokSettings.allowDuets}
                          onChange={(v) => setTiktokSettings((prev) => ({ ...prev, allowDuets: v }))}
                        />
                        <ToggleSwitch
                          label="Allow Stitches"
                          checked={tiktokSettings.allowStitches}
                          onChange={(v) => setTiktokSettings((prev) => ({ ...prev, allowStitches: v }))}
                        />
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
                        <ToggleSwitch
                          label="ATL Vibes & Views"
                          checked={linkedinSettings.postToCompany}
                          onChange={(v) => setLinkedinSettings((prev) => ({ ...prev, postToCompany: v }))}
                        />
                        <ToggleSwitch
                          label="Mellanda Reese"
                          checked={linkedinSettings.postToPersonal}
                          onChange={(v) => setLinkedinSettings((prev) => ({ ...prev, postToPersonal: v }))}
                        />
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

          {/* RIGHT COLUMN -- Sidebar */}
          <div className="space-y-5">
            {/* Schedule card */}
            <div className="bg-white border border-[#e5e5e5] p-5">
              <h3 className="font-display text-[18px] font-semibold text-black mb-4">Schedule</h3>
              <div className="flex gap-4 mb-4">
                <label
                  className="flex items-center gap-2 text-[13px] cursor-pointer"
                  onClick={() => setScheduleMode("now")}
                >
                  <span
                    className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                      scheduleMode === "now" ? "border-[#1a1a1a]" : "border-[#d4d4d4]"
                    }`}
                  >
                    {scheduleMode === "now" && <span className="w-2 h-2 bg-[#1a1a1a] rounded-full" />}
                  </span>
                  Publish Now
                </label>
                <label
                  className="flex items-center gap-2 text-[13px] cursor-pointer"
                  onClick={() => setScheduleMode("later")}
                >
                  <span
                    className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                      scheduleMode === "later" ? "border-[#1a1a1a]" : "border-[#d4d4d4]"
                    }`}
                  >
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
                      <input
                        type="date"
                        className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                        Time (EST)
                      </label>
                      <input
                        type="time"
                        className="w-full h-[40px] px-3 text-[13px] border border-[#e5e5e5] bg-white text-[#374151] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
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
                  <div
                    key={acct.platform}
                    className="flex items-center justify-between py-2 border-b border-[#f5f5f5] last:border-b-0"
                  >
                    <div>
                      <span className="text-[13px] font-medium text-[#374151]">{acct.name}</span>
                      <p className="text-[11px] text-[#6b7280]">{acct.handle}</p>
                    </div>
                    <ToggleSwitch
                      label=""
                      checked={platformToggles[acct.platform] ?? true}
                      onChange={(v) =>
                        setPlatformToggles((prev) => ({ ...prev, [acct.platform]: v }))
                      }
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
                  <strong>Publishing fires Make.com S9.</strong> Content will be posted to all active
                  platforms. This cannot be undone.
                </span>
              </div>
              {distributeStatus === "success" && (
                <div className="bg-[#dcfce7] p-3 flex items-start gap-2 mb-2">
                  <span className="text-[12px] text-[#16a34a] font-semibold">
                    Distribution triggered successfully. Redirecting...
                  </span>
                </div>
              )}
              {distributeStatus === "error" && (
                <div className="bg-[#fee2e2] p-3 flex items-start gap-2 mb-2">
                  <AlertTriangle size={14} className="text-[#c1121f] flex-shrink-0 mt-0.5" />
                  <span className="text-[12px] text-[#c1121f]">
                    Distribution failed. Please try again or check server logs.
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  disabled={distributing || activePlatformCount === 0}
                  onClick={() => setConfirmModalOpen(true)}
                  className="w-full inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors disabled:opacity-50"
                >
                  {distributing
                    ? "Distributing\u2026"
                    : scheduleMode === "now"
                      ? "Distribute Now"
                      : "Schedule Distribution"}
                </button>
                <button
                  disabled={saving}
                  onClick={handleSaveDraft}
                  className="w-full inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving\u2026" : "Save Draft"}
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

      {/* ── Confirmation Modal ─────────────────────────────── */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Distribution"
        maxWidth="480px"
        footer={
          <>
            <button
              onClick={() => setConfirmModalOpen(false)}
              className="px-5 py-2 rounded-full text-sm font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={distributing}
              onClick={handleDistribute}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors disabled:opacity-50"
            >
              {distributing ? "Distributing\u2026" : "Confirm & Distribute"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fef9c3] flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-[#ea580c]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#1a1a1a]">
                ⚠ This will post to {activePlatformCount} active platform{activePlatformCount !== 1 ? "s" : ""}. This cannot be undone.
              </p>
              <p className="text-[13px] text-[#6b7280] mt-1">Continue?</p>
            </div>
          </div>

          <div className="bg-[#f5f5f5] border border-[#e5e5e5] p-3">
            <p className="text-[12px] font-semibold text-[#374151] mb-2">Platforms:</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(platformToggles)
                .filter(([, enabled]) => enabled)
                .map(([platform]) => {
                  const cfg = PLATFORM_CONFIG[platform as PlatformKey];
                  if (!cfg) return null;
                  return (
                    <span
                      key={platform}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-[#e5e5e5] text-[#374151]"
                    >
                      <span
                        className="w-3 h-3 flex items-center justify-center text-[8px] font-bold text-white"
                        style={{ background: cfg.color, borderRadius: 2 }}
                      >
                        {cfg.icon}
                      </span>
                      {cfg.label}
                    </span>
                  );
                })}
            </div>
          </div>

          {scheduleMode === "later" && (
            <div className="bg-[#f5f5f5] border border-[#e5e5e5] p-3">
              <p className="text-[12px] text-[#374151]">
                <strong>Scheduled for:</strong> {scheduleDate} at {scheduleTime} EST
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
