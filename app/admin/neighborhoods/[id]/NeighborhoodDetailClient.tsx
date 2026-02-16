"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Store, Newspaper, Calendar, Map } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { TabNav } from "@/components/portal/TabNav";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FormGroup } from "@/components/portal/FormGroup";
import { FormRow } from "@/components/portal/FormRow";
import { FormInput } from "@/components/portal/FormInput";
import { FormTextarea } from "@/components/portal/FormTextarea";
import { FormSelect } from "@/components/portal/FormSelect";
import { ToggleSwitch } from "@/components/portal/ToggleSwitch";
import { ButtonBar } from "@/components/portal/ButtonBar";
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { AdminDataTable } from "@/components/portal/AdminDataTable";

interface BusinessRow { id: string; business_name: string; status: string; tier: string }
interface StoryRow { id: string; title: string; status: string; published_at: string | null }
interface EventRow { id: string; title: string; start_date: string; status: string }

interface NeighborhoodDetailClientProps {
  neighborhood: (Record<string, unknown> & { areas: { name: string } | null }) | null;
  businesses: BusinessRow[];
  stories: StoryRow[];
  events: EventRow[];
  areas: { id: string; name: string }[];
}

const TABS = [
  { label: "Details", key: "details" },
  { label: "Related Content", key: "related" },
  { label: "Map Data", key: "map" },
];

const statusBadgeMap: Record<string, "green" | "blue" | "gray" | "gold"> = {
  active: "green",
  draft: "blue",
  inactive: "gray",
  published: "green",
  completed: "gray",
  premium: "gold",
  featured: "green",
  standard: "gray",
  free: "gray",
};

function field(obj: Record<string, unknown> | null, key: string, fallback = ""): string {
  if (!obj) return fallback;
  const v = obj[key];
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function fieldBool(obj: Record<string, unknown> | null, key: string): boolean {
  if (!obj) return false;
  return obj[key] === true;
}

export function NeighborhoodDetailClient({ neighborhood: n, businesses, stories, events, areas }: NeighborhoodDetailClientProps) {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <>
      <PortalTopbar title={field(n, "name", "Neighborhood")} />
      <div className="p-8 max-[899px]:pt-16 space-y-6">
        <Link href="/admin/neighborhoods" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Neighborhoods
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="font-display text-[24px] font-bold text-black">{field(n, "name")}</h1>
          <StatusBadge variant={fieldBool(n, "is_active") ? "green" : "gray"}>{fieldBool(n, "is_active") ? "Active" : "Inactive"}</StatusBadge>
        </div>
        <p className="text-[13px] text-[#6b7280]">{n?.areas?.name ?? "—"}</p>

        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab 1 — Details */}
        {activeTab === "details" && (
          <div className="space-y-4">
            <FormGroup label="Name"><FormInput defaultValue={field(n, "name")} /></FormGroup>
            <FormGroup label="Slug"><FormInput defaultValue={field(n, "slug")} readOnly className="bg-[#f5f5f5]" /></FormGroup>
            <FormGroup label="Area">
              <FormSelect options={areas.map((a) => ({ value: a.id, label: a.name }))} defaultValue={field(n, "area_id")} placeholder="Select area" />
            </FormGroup>
            <FormGroup label="Tagline"><FormInput defaultValue={field(n, "tagline")} /></FormGroup>
            <FormGroup label="Description"><FormTextarea defaultValue={field(n, "description")} rows={5} /></FormGroup>
            <FormGroup label="Hero Image URL"><FormInput defaultValue={field(n, "hero_image_url")} /></FormGroup>
            {field(n, "hero_image_url") && (
              <div className="w-full max-w-[400px] aspect-[16/9] border border-[#e5e5e5] overflow-hidden">
                <img src={field(n, "hero_image_url")} alt={`${field(n, "name", "Neighborhood")} hero image`} className="w-full h-full object-cover" />
              </div>
            )}
            <FormRow columns={2}>
              <FormGroup label="Map Center Lat"><FormInput type="number" defaultValue={field(n, "map_center_lat")} /></FormGroup>
              <FormGroup label="Map Center Lng"><FormInput type="number" defaultValue={field(n, "map_center_lng")} /></FormGroup>
            </FormRow>
            <ToggleSwitch label="Active" checked={fieldBool(n, "is_active")} onChange={() => console.log("Toggle active")} />
            <ToggleSwitch label="Featured" checked={fieldBool(n, "is_featured")} onChange={() => console.log("Toggle featured")} />
            <ButtonBar>
              <button onClick={() => console.log("Save neighborhood")} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors">Save Changes</button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 2 — Related Content */}
        {activeTab === "related" && (
          <div className="space-y-6">
            <StatGrid columns={3}>
              <StatCard label="Businesses" value={businesses.length} />
              <StatCard label="Stories" value={stories.length} />
              <StatCard label="Events" value={events.length} />
            </StatGrid>

            <h3 className="font-display text-[16px] font-semibold text-black">Businesses</h3>
            {businesses.length > 0 ? (
              <AdminDataTable
                columns={[
                  { key: "business_name", header: "Name", render: (b: BusinessRow) => <Link href={`/admin/businesses/${b.id}`} className="text-[13px] font-semibold text-black hover:text-[#c1121f]">{b.business_name}</Link> },
                  { key: "status", header: "Status", render: (b: BusinessRow) => <StatusBadge variant={statusBadgeMap[b.status] ?? "gray"}>{b.status}</StatusBadge> },
                  { key: "tier", header: "Tier", render: (b: BusinessRow) => <StatusBadge variant={statusBadgeMap[b.tier] ?? "gray"}>{b.tier}</StatusBadge> },
                ]}
                data={businesses}
              />
            ) : (
              <div className="flex flex-col items-center py-8 text-[#6b7280]"><Store size={24} className="mb-1" /><span className="text-[12px]">No businesses</span></div>
            )}

            <h3 className="font-display text-[16px] font-semibold text-black">Stories</h3>
            {stories.length > 0 ? (
              <AdminDataTable
                columns={[
                  { key: "title", header: "Title", render: (s: StoryRow) => <Link href={`/admin/posts/${s.id}`} className="text-[13px] font-semibold text-black hover:text-[#c1121f]">{s.title}</Link> },
                  { key: "status", header: "Status", render: (s: StoryRow) => <StatusBadge variant={statusBadgeMap[s.status] ?? "gray"}>{s.status}</StatusBadge> },
                  { key: "published_at", header: "Published", render: (s: StoryRow) => <span className="text-[12px] text-[#6b7280]">{s.published_at ? new Date(s.published_at).toLocaleDateString() : "—"}</span> },
                ]}
                data={stories}
              />
            ) : (
              <div className="flex flex-col items-center py-8 text-[#6b7280]"><Newspaper size={24} className="mb-1" /><span className="text-[12px]">No stories</span></div>
            )}

            <h3 className="font-display text-[16px] font-semibold text-black">Events</h3>
            {events.length > 0 ? (
              <AdminDataTable
                columns={[
                  { key: "title", header: "Title", render: (e: EventRow) => <Link href={`/admin/events/${e.id}`} className="text-[13px] font-semibold text-black hover:text-[#c1121f]">{e.title}</Link> },
                  { key: "start_date", header: "Date", render: (e: EventRow) => <span className="text-[12px] text-[#6b7280]">{new Date(e.start_date + "T00:00:00").toLocaleDateString()}</span> },
                  { key: "status", header: "Status", render: (e: EventRow) => <StatusBadge variant={statusBadgeMap[e.status] ?? "gray"}>{e.status}</StatusBadge> },
                ]}
                data={events}
              />
            ) : (
              <div className="flex flex-col items-center py-8 text-[#6b7280]"><Calendar size={24} className="mb-1" /><span className="text-[12px]">No events</span></div>
            )}
          </div>
        )}

        {/* Tab 3 — Map Data */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <FormGroup label="GeoJSON Key"><FormInput defaultValue={field(n, "geojson_key")} readOnly className="bg-[#f5f5f5]" /></FormGroup>
            <div className="border border-[#e5e5e5] p-6 flex items-center gap-3 text-[#6b7280]">
              <Map size={20} />
              <span className="text-[13px]">Map boundary editing will be available after Mapbox integration.</span>
            </div>
            <ButtonBar>
              <button onClick={() => console.log("Save map data")} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors">Save Changes</button>
            </ButtonBar>
          </div>
        )}
      </div>
    </>
  );
}
