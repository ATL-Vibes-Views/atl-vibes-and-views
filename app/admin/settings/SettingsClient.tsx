"use client";

import { useState, useCallback, useEffect } from "react";
import { ImageIcon, X } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { TabNav } from "@/components/portal/TabNav";
import { FormGroup } from "@/components/portal/FormGroup";
import { FormInput } from "@/components/portal/FormInput";
import { FormTextarea } from "@/components/portal/FormTextarea";
import { FormSelect } from "@/components/portal/FormSelect";
import { ToggleSwitch } from "@/components/portal/ToggleSwitch";
import { ButtonBar } from "@/components/portal/ButtonBar";
import { MediaPicker } from "@/components/admin/MediaPicker";
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
  const [settings] = useState<SiteSetting[]>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  function openModal(key: string) { setActiveGroup(key); }
  function closeModal() { setActiveGroup(null); setSaveSuccess(false); }

  const activeGroupLabel = PAGE_GROUPS.find((g) => g.key === activeGroup)?.label ?? "";

  /* Media cache — preloaded on mount so card thumbnails show current hero images */
  type MediaCacheEntry = { id: string; file_url: string; file_name: string; mime_type: string; title: string | null };
  const [mediaCache, setMediaCache] = useState<Record<string, MediaCacheEntry>>({});

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

  /* Per-group hero state — keyed by group key */
  const [heroTypes, setHeroTypes] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    PAGE_GROUPS.forEach(({ key }) => {
      init[key] = getVal(initialSettings, `${key}_content_type`) || "image";
    });
    return init;
  });
  const [heroMedia, setHeroMedia] = useState<Record<string, { id: string; url: string } | null>>(() => {
    const init: Record<string, { id: string; url: string } | null> = {};
    PAGE_GROUPS.forEach(({ key }) => {
      const mediaId = getVal(initialSettings, `${key}_media_id`);
      const mediaUrl = getVal(initialSettings, `${key}_video_url`) || getVal(initialSettings, `${key}_image_url`);
      init[key] = mediaId && mediaUrl ? { id: mediaId, url: mediaUrl } : null;
    });
    return init;
  });
  const [heroPosts, setHeroPosts] = useState<Record<string, { id: string; title: string } | null>>(() => {
    const init: Record<string, { id: string; title: string } | null> = {};
    PAGE_GROUPS.forEach(({ key }) => {
      const postId = getVal(initialSettings, `${key}_featured_post_id`);
      init[key] = postId ? { id: postId, title: "Loading…" } : null;
    });
    return init;
  });
  const [heroFallbacks, setHeroFallbacks] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    PAGE_GROUPS.forEach(({ key }) => {
      init[key] = getVal(initialSettings, `${key}_video_url`);
    });
    return init;
  });

  const handleSaveGroup = useCallback(async () => {
    if (!activeGroup) return;
    setSaving(true);
    const key = activeGroup;
    const updates: Record<string, unknown>[] = [];
    const typeRow = settings.find((s) => s.key === `${key}_content_type`);
    const mediaRow = settings.find((s) => s.key === `${key}_media_id`);
    const postRow = settings.find((s) => s.key === `${key}_featured_post_id`);
    const urlRow = settings.find((s) => s.key === `${key}_video_url`);
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
    }
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); closeModal(); }, 1000);
  }, [activeGroup, settings, heroTypes, heroMedia, heroPosts, heroFallbacks]);

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
                const contentType = heroTypes[key] || null;
                const mediaSetting = settings.find(
                  (s) => s.key === `${key}_media_id`
                );
                const currentMedia = mediaSetting?.value_media_id
                  ? mediaCache[mediaSetting.value_media_id as string] ?? null
                  : null;
                /* Also fall back to in-memory heroMedia url if picker was used this session */
                const thumbUrl = currentMedia?.file_url ?? heroMedia[key]?.url ?? null;
                const thumbLabel = currentMedia
                  ? (currentMedia.title ?? currentMedia.file_name)
                  : heroMedia[key]?.url?.split("/").pop() ?? null;
                return (
                  <div key={key} className="bg-white border border-[#e5e5e5] p-4 flex gap-4 items-start">
                    {/* Thumbnail */}
                    <div className="w-24 h-16 shrink-0 bg-[#f5f5f5] border border-[#e5e5e5] overflow-hidden">
                      {thumbUrl ? (
                        <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
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
                        {contentType && contentType !== "image" ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f5] text-gray-500 capitalize">
                            {contentType}
                          </span>
                        ) : thumbUrl ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f5] text-gray-500 capitalize">
                            image
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#fff3f3] text-[#c1121f]">
                            Not Set
                          </span>
                        )}
                      </div>
                      {thumbLabel && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{thumbLabel}</p>
                      )}
                      {contentType === "post" && heroPosts[key] && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {heroPosts[key]!.title}
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
