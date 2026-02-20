"use client";

import { useState, useCallback } from "react";
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

  const handleSavePageImages = useCallback(async () => {
    setSaving(true);
    const updates: Record<string, unknown>[] = [];
    PAGE_GROUPS.forEach(({ key }) => {
      const typeRow = settings.find((s) => s.key === `${key}_content_type`);
      const mediaRow = settings.find((s) => s.key === `${key}_media_id`);
      const postRow = settings.find((s) => s.key === `${key}_featured_post_id`);
      const urlRow = settings.find((s) => s.key === `${key}_video_url`);
      if (typeRow) updates.push({ id: typeRow.id, value_text: heroTypes[key] ?? "image" });
      if (mediaRow) updates.push({ id: mediaRow.id, value_media_id: heroMedia[key]?.id ?? null });
      if (postRow) updates.push({ id: postRow.id, value_post_id: heroPosts[key]?.id ?? null });
      if (urlRow) updates.push({ id: urlRow.id, value_text: heroFallbacks[key] ?? null });
    });
    if (updates.length === 0) { setSaving(false); return; }
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setSaving(false);
  }, [settings, heroTypes, heroMedia, heroPosts, heroFallbacks]);

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
          <div className="space-y-8 max-w-2xl">
            <p className="text-[13px] text-[#6b7280]">
              Set the hero image, video, or featured post for each public page. Changes take effect immediately on save.
            </p>
            {PAGE_GROUPS.map(({ key, label }) => {
              const hType = heroTypes[key] ?? "image";
              return (
                <div key={key} className="bg-white border border-[#e5e5e5] p-5 space-y-4">
                  <h3 className="font-display text-[15px] font-semibold text-black">{label}</h3>
                  <FormGroup label="Hero Type">
                    <FormSelect
                      options={[
                        { value: "image", label: "Image" },
                        { value: "video", label: "Video" },
                        { value: "post", label: "Featured Blog Post" },
                      ]}
                      value={hType}
                      onChange={(e) => setHeroTypes((prev) => ({ ...prev, [key]: e.target.value }))}
                    />
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
                    <FormGroup label="Fallback URL">
                      <FormInput
                        value={heroFallbacks[key] ?? ""}
                        onChange={(e) => setHeroFallbacks((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder="https://..."
                      />
                    </FormGroup>
                  )}

                  {hType === "post" && (
                    <FormGroup label="Featured Post">
                      <PostPicker
                        value={heroPosts[key] ?? null}
                        onChange={(post) => setHeroPosts((prev) => ({ ...prev, [key]: post }))}
                      />
                    </FormGroup>
                  )}
                </div>
              );
            })}

            <ButtonBar>
              <button
                onClick={handleSavePageImages}
                disabled={saving}
                className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Page Images"}
              </button>
            </ButtonBar>
          </div>
        )}

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
