"use client";

import { useState, useCallback, useEffect } from "react";
import { ImageIcon, X, Video } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { TabNav } from "@/components/portal/TabNav";
import { FormGroup } from "@/components/portal/FormGroup";
import { FormInput } from "@/components/portal/FormInput";
import { FormTextarea } from "@/components/portal/FormTextarea";
import { FormSelect } from "@/components/portal/FormSelect";
import { ToggleSwitch } from "@/components/portal/ToggleSwitch";
import { ButtonBar } from "@/components/portal/ButtonBar";
import { MediaPicker, type MediaAssetValue } from "@/components/admin/MediaPicker";
import { PostPicker } from "@/components/admin/PostPicker";

/* ============================================================
   SETTINGS — 4 tabs: General, SEO, Integrations, Page Images
   ============================================================ */

const TABS = [
  { label: "General", key: "general" },
  { label: "SEO", key: "seo" },
  { label: "Integrations", key: "integrations" },
  { label: "Page Images", key: "page_images" },
];

/* Page groups shown in the Page Images tab */
const PAGE_GROUPS = [
  { key: "home", label: "Homepage" },
  { key: "stories", label: "Stories" },
  { key: "city_watch", label: "City Watch" },
  { key: "hub_atlanta_guide", label: "Atlanta Guide" },
  { key: "hub_businesses", label: "Hub — Businesses" },
  { key: "hub_eats", label: "Hub — Eats & Drinks" },
  { key: "hub_things", label: "Hub — Things To Do" },
  { key: "hub_events", label: "Hub — Events" },
  { key: "areas_landing", label: "Areas Landing" },
  { key: "neighborhoods_landing", label: "Neighborhoods Landing" },
  { key: "beyond_atl", label: "Beyond ATL Landing" },
  { key: "media_page", label: "Media" },
  { key: "newsletters", label: "Newsletters" },
  { key: "newsletters_archive", label: "Newsletter Archive" },
];

type SiteSetting = Record<string, unknown>;

interface SettingsClientProps {
  initialSettings: SiteSetting[];
}

function getVal(settings: SiteSetting[], key: string): string {
  const row = settings.find((s) => s.key === key);
  if (!row) return "";
  return String(row.value_text ?? row.value_media_id ?? row.value_post_id ?? "");
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<SiteSetting[]>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  function openModal(key: string) { setActiveGroup(key); }
  function closeModal() { setActiveGroup(null); setSaveSuccess(false); }

  const activeGroupLabel = PAGE_GROUPS.find((g) => g.key === activeGroup)?.label ?? "";

  /* Media cache — preloaded on mount so card thumbnails show current hero images */
  type MediaCacheEntry = { id: string; file_url: string; file_name: string; mime_type: string; title: string | null };
  type PostCacheEntry = { id: string; title: string; featured_image_url: string | null };
  const [mediaCache, setMediaCache] = useState<Record<string, MediaCacheEntry>>({});
  const [postCache, setPostCache] = useState<Record<string, PostCacheEntry>>({});

  useEffect(() => {
    const ids = settings
      .map((s) => s.value_media_id)
      .filter(Boolean) as string[];
    if (!ids.length) return;
    fetch(`/api/admin/media-assets?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((assets: MediaCacheEntry[]) => {
        const cache: Record<string, MediaCacheEntry> = {};
        assets.forEach((a) => (cache[a.id] = a));
        setMediaCache(cache);
      })
      .catch(() => {});
  }, [settings]);

  useEffect(() => {
    const postIds = settings
      .map((s) => s.value_post_id)
      .filter(Boolean) as string[];
    if (!postIds.length) return;
    fetch(`/api/admin/posts?ids=${postIds.join(",")}`)
      .then((r) => r.json())
      .then((posts: PostCacheEntry[]) => {
        const cache: Record<string, PostCacheEntry> = {};
        posts.forEach((p) => (cache[p.id] = p));
        setPostCache(cache);
      })
      .catch(() => {});
  }, [settings]);

  /* Per-group hero state — keyed by group key */
  const [heroTypes, setHeroTypes] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    PAGE_GROUPS.forEach(({ key }) => {
      init[key] = getVal(initialSettings, `${key}_hero_content_type`) || "image";
    });
    return init;
  });
  const [heroMedia, setHeroMedia] = useState<Record<string, MediaAssetValue | null>>(() => {
    const init: Record<string, MediaAssetValue | null> = {};
    PAGE_GROUPS.forEach(({ key }) => {
      const mediaId = getVal(initialSettings, `${key}_hero_media_id`);
      const mediaUrl = getVal(initialSettings, `${key}_hero_video_url`) || getVal(initialSettings, `${key}_hero_image_url`);
      init[key] = mediaId && mediaUrl ? { id: mediaId, url: mediaUrl, title: null, alt_text: null, mime_type: "image/jpeg" } : null;
    });
    return init;
  });
  const [heroPosts, setHeroPosts] = useState<Record<string, { id: string; title: string } | null>>(() => {
    const init: Record<string, { id: string; title: string } | null> = {};
    PAGE_GROUPS.forEach(({ key }) => {
      const postId = getVal(initialSettings, `${key}_hero_featured_post_id`);
      init[key] = postId ? { id: postId, title: "Loading…" } : null;
    });
    return init;
  });
  const [heroFallbacks, setHeroFallbacks] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    PAGE_GROUPS.forEach(({ key }) => {
      init[key] = getVal(initialSettings, `${key}_hero_video_url`);
    });
    return init;
  });

  const handleSaveGroup = useCallback(async () => {
    if (!activeGroup) return;
    setSaving(true);
    const key = activeGroup;
    const updates: Record<string, unknown>[] = [];
    const typeRow = settings.find((s) => s.key === `${key}_hero_content_type`);
    const mediaRow = settings.find((s) => s.key === `${key}_hero_media_id`);
    const postRow = settings.find((s) => s.key === `${key}_hero_featured_post_id`);
    const urlRow = settings.find((s) => s.key === `${key}_hero_video_url`);
    if (typeRow) updates.push({ id: typeRow.id, value_text: heroTypes[key] ?? "image" });
    if (mediaRow) updates.push({ id: mediaRow.id, value_media_id: heroMedia[key]?.id ?? null });
    if (postRow) updates.push({ id: postRow.id, value_post_id: heroPosts[key]?.id ?? null });
    if (urlRow) updates.push({ id: urlRow.id, value_text: heroFallbacks[key] ?? null });
    if (updates.length > 0) {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      setSettings((prev) =>
        prev.map((s) => {
          const match = updates.find((u) => u.id === s.id);
          if (!match) return s;
          return {
            ...s,
            value_text: (match.value_text as string) ?? s.value_text,
            value_media_id: (match.value_media_id as string) ?? s.value_media_id,
            value_post_id: (match.value_post_id as string) ?? s.value_post_id,
          };
        })
      );
    }
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); closeModal(); }, 1000);
  }, [activeGroup, settings, setSettings, heroTypes, heroMedia, heroPosts, heroFallbacks]);

  return (
    <>
      <PortalTopbar
        title="Settings"
        actions={
          <button
            onClick={() => console.log("Save settings")}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
          >
            Save Changes
          </button>
        }
      />
      <div className="p-8 space-y-6">
        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── General Tab ── */}
        {activeTab === "general" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
              <h3 className="font-display text-[16px] font-semibold text-black">Site Info</h3>
              <FormGroup label="Site Name">
                <FormInput defaultValue="ATL Vibes & Views" readOnly />
              </FormGroup>
              <FormGroup label="Site Tagline">
                <FormInput defaultValue="Atlanta's Hyperlocal Guide to Neighborhoods, Culture & Community" readOnly />
              </FormGroup>
              <FormGroup label="Contact Email">
                <FormInput defaultValue="hello@atlvibesandviews.com" readOnly />
              </FormGroup>
            </div>

            <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
              <h3 className="font-display text-[16px] font-semibold text-black">Content Settings</h3>
              <div className="space-y-3">
                <ToggleSwitch
                  checked={true}
                  onChange={(v) => console.log("Auto-publish:", v)}
                  label="Auto-publish scheduled posts"
                />
                <ToggleSwitch
                  checked={true}
                  onChange={(v) => console.log("Review moderation:", v)}
                  label="Require review moderation before publishing"
                />
                <ToggleSwitch
                  checked={false}
                  onChange={(v) => console.log("Maintenance mode:", v)}
                  label="Maintenance mode"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── SEO Tab ── */}
        {activeTab === "seo" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
              <h3 className="font-display text-[16px] font-semibold text-black">Default Meta</h3>
              <FormGroup label="Default Meta Title" hint="Used when pages don't have a custom title">
                <FormInput defaultValue="ATL Vibes & Views | Atlanta's Hyperlocal Guide" readOnly />
              </FormGroup>
              <FormGroup label="Default Meta Description" hint="150-160 characters recommended">
                <FormTextarea
                  defaultValue="Discover Atlanta's best neighborhoods, businesses, events, and culture with ATL Vibes & Views — your hyperlocal guide to the city."
                  readOnly
                  rows={3}
                />
              </FormGroup>
              <FormGroup label="Default OG Image URL">
                <FormInput defaultValue="" placeholder="https://..." readOnly />
              </FormGroup>
            </div>

            <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
              <h3 className="font-display text-[16px] font-semibold text-black">Verification</h3>
              <FormGroup label="Google Search Console" hint="HTML verification tag content">
                <FormInput defaultValue="" placeholder="google-site-verification=..." readOnly />
              </FormGroup>
              <FormGroup label="Bing Webmaster" hint="Content attribute value">
                <FormInput defaultValue="" placeholder="..." readOnly />
              </FormGroup>
            </div>
          </div>
        )}

        {/* ── Page Images Tab ── */}
        {activeTab === "page_images" && (
          <div className="space-y-5">
            <p className="text-[13px] text-[#6b7280]">
              Set the hero image, video, or featured post for each public page. Click Edit to configure a page.
            </p>

            {/* 2-column card grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAGE_GROUPS.map(({ key, label }) => {
                /* Resolve saved values from settings rows */
                const contentTypeSetting = settings.find((s) => s.key === `${key}_hero_content_type`);
                const mediaSetting = settings.find((s) => s.key === `${key}_hero_media_id`);
                const postSetting = settings.find((s) => s.key === `${key}_hero_featured_post_id`);

                const savedType = (contentTypeSetting?.value_text as string) || null;
                /* In-session edits take precedence over saved values */
                const contentType = heroTypes[key] || savedType || null;

                const savedMediaId = mediaSetting?.value_media_id as string | undefined;
                const currentMedia = savedMediaId ? (mediaCache[savedMediaId] ?? null) : null;

                const savedPostId = postSetting?.value_post_id as string | undefined;
                const currentPost = savedPostId ? (postCache[savedPostId] ?? null) : null;

                /* In-session picker selection overrides saved media */
                const sessionMedia = heroMedia[key] ?? null;
                const sessionPost = heroPosts[key] ?? null;

                return (
                  <div key={key} className="bg-white border border-[#e5e5e5] p-4 flex gap-4 items-start">
                    {/* Thumbnail */}
                    <div className="w-24 h-16 shrink-0 bg-[#f5f5f5] border border-[#e5e5e5] overflow-hidden">
                      {contentType === "post" && currentPost?.featured_image_url ? (
                        <img
                          src={currentPost.featured_image_url}
                          alt={currentPost.title}
                          className="w-full h-full object-cover"
                        />
                      ) : contentType === "video" ? (
                        <div className="w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center gap-1">
                          <Video size={18} className="text-white/70" />
                          {(currentMedia ?? sessionMedia) && (
                            <span className="text-[9px] text-white/50 truncate px-1 max-w-full">
                              {currentMedia?.file_name ?? sessionMedia?.url?.split("/").pop()}
                            </span>
                          )}
                        </div>
                      ) : (currentMedia?.file_url ?? sessionMedia?.url) ? (
                        <img
                          src={currentMedia?.file_url ?? sessionMedia?.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={20} className="text-[#d1d1d1]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#1a1a1a] leading-tight">{label}</p>
                      <div className="mt-1">
                        {contentType === "post" ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f5] text-gray-500">
                            Featured Post
                          </span>
                        ) : contentType === "video" ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f5] text-gray-500">
                            Video
                          </span>
                        ) : (currentMedia ?? sessionMedia) ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f5] text-gray-500">
                            Image
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#fff3f3] text-[#c1121f]">
                            Not Set
                          </span>
                        )}
                      </div>
                      {/* Subtitle */}
                      {contentType === "post" && (currentPost ?? sessionPost) && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {currentPost?.title ?? sessionPost?.title}
                        </p>
                      )}
                      {contentType !== "post" && (currentMedia ?? sessionMedia) && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {currentMedia ? (currentMedia.title ?? currentMedia.file_name) : sessionMedia?.url?.split("/").pop()}
                        </p>
                      )}
                    </div>

                    {/* Edit button */}
                    <button
                      onClick={() => openModal(key)}
                      className="shrink-0 text-xs font-semibold text-[#1a1a1a] border border-[#e5e5e5] px-3 py-1.5 hover:border-[#fee198] hover:bg-[#fffdf0] transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Edit Modal ── */}
        {activeGroup && (() => {
          const key = activeGroup;
          const hType = heroTypes[key] ?? "image";
          return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#e5e5e5]">
                  <h3 className="font-display text-[16px] font-semibold">{activeGroupLabel}</h3>
                  <button type="button" onClick={closeModal}>
                    <X size={18} className="text-gray-400 hover:text-black transition-colors" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  <FormGroup label="Hero Content Type">
                    <select
                      value={hType}
                      onChange={(e) => setHeroTypes((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full h-[38px] px-3 text-[14px] font-body border border-[#e5e5e5] focus:border-[#e6c46d] focus:ring-2 focus:ring-[#fee198]/30 focus:outline-none transition-colors bg-white"
                    >
                      <option value="">— None —</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="post">Featured Blog Post</option>
                    </select>
                  </FormGroup>

                  {(hType === "image" || hType === "video") && (
                    <FormGroup label={hType === "video" ? "Video Asset" : "Hero Image"}>
                      <MediaPicker
                        value={heroMedia[key] ?? null}
                        onChange={(asset) => setHeroMedia((prev) => ({ ...prev, [key]: asset }))}
                        allowedTypes={hType === "video" ? ["video"] : ["image"]}
                      />
                    </FormGroup>
                  )}

                  {(hType === "image" || hType === "video") && (
                    <FormGroup label="Fallback URL" hint="Used if no media asset is selected">
                      <FormInput
                        value={heroFallbacks[key] ?? ""}
                        onChange={(e) => setHeroFallbacks((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder="https://..."
                      />
                    </FormGroup>
                  )}

                  {hType === "post" && (
                    <FormGroup label="Featured Blog Post">
                      <PostPicker
                        value={heroPosts[key] ?? null}
                        onChange={(post) => setHeroPosts((prev) => ({ ...prev, [key]: post }))}
                      />
                    </FormGroup>
                  )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-[#e5e5e5] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGroup}
                    disabled={saving}
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors disabled:opacity-60"
                  >
                    {saving ? "Saving…" : saveSuccess ? "Saved!" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Integrations Tab ── */}
        {activeTab === "integrations" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
              <h3 className="font-display text-[16px] font-semibold text-black">Analytics</h3>
              <FormGroup label="Google Analytics 4 Measurement ID">
                <FormInput defaultValue="" placeholder="G-XXXXXXXXXX" readOnly />
              </FormGroup>
              <FormGroup label="Google Tag Manager ID">
                <FormInput defaultValue="" placeholder="GTM-XXXXXXX" readOnly />
              </FormGroup>
            </div>

            <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
              <h3 className="font-display text-[16px] font-semibold text-black">Email</h3>
              <FormGroup label="HubSpot API Key">
                <FormInput defaultValue="" placeholder="pat-..." type="password" readOnly />
              </FormGroup>
              <FormGroup label="HubSpot Portal ID">
                <FormInput defaultValue="" placeholder="12345678" readOnly />
              </FormGroup>
            </div>

            <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
              <h3 className="font-display text-[16px] font-semibold text-black">Payments</h3>
              <FormGroup label="Stripe Publishable Key">
                <FormInput defaultValue="" placeholder="pk_live_..." readOnly />
              </FormGroup>
              <FormGroup label="Stripe Webhook Secret">
                <FormInput defaultValue="" placeholder="whsec_..." type="password" readOnly />
              </FormGroup>
            </div>

            <div className="bg-white border border-[#e5e5e5] p-5 space-y-4">
              <h3 className="font-display text-[16px] font-semibold text-black">Maps</h3>
              <FormGroup label="Mapbox Access Token">
                <FormInput defaultValue="" placeholder="pk.eyJ1I..." readOnly />
              </FormGroup>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
