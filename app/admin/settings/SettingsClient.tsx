"use client";

import { useState } from "react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { TabNav } from "@/components/portal/TabNav";
import { FormGroup } from "@/components/portal/FormGroup";
import { FormInput } from "@/components/portal/FormInput";
import { FormTextarea } from "@/components/portal/FormTextarea";
import { ToggleSwitch } from "@/components/portal/ToggleSwitch";

/* ============================================================
   SETTINGS — 3 tabs: General, SEO, Integrations
   ============================================================ */

const TABS = [
  { label: "General", key: "general" },
  { label: "SEO", key: "seo" },
  { label: "Integrations", key: "integrations" },
];

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState("general");

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
      <div className="p-8 max-[899px]:pt-16 space-y-6">
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
