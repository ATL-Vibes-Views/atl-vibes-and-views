"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Store, Map } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { TabNav } from "@/components/portal/TabNav";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { FormGroup } from "@/components/portal/FormGroup";
import { FormRow } from "@/components/portal/FormRow";
import { FormInput } from "@/components/portal/FormInput";
import { FormTextarea } from "@/components/portal/FormTextarea";
import { ToggleSwitch } from "@/components/portal/ToggleSwitch";
import { ButtonBar } from "@/components/portal/ButtonBar";
import { AdminDataTable } from "@/components/portal/AdminDataTable";

interface BusinessRow { id: string; business_name: string; status: string; tier: string }
interface AreaRow { id: string; name: string; slug: string }

interface CityDetailClientProps {
  city: Record<string, unknown> | null;
  isNew: boolean;
  businesses: BusinessRow[];
  areas: AreaRow[];
}

const TABS = [
  { label: "Details", key: "details" },
  { label: "Related Content", key: "related" },
];

const statusBadgeMap: Record<string, "green" | "blue" | "gray" | "gold"> = {
  active: "green",
  draft: "blue",
  inactive: "gray",
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

export function CityDetailClient({ city, isNew, businesses, areas }: CityDetailClientProps) {
  const [activeTab, setActiveTab] = useState("details");

  const title = isNew ? "New City" : `${field(city, "name", "City")}${field(city, "state") ? `, ${field(city, "state")}` : ""}`;

  return (
    <>
      <PortalTopbar title={title} />
      <div className="p-8 max-[899px]:pt-16 space-y-6">
        <Link href="/admin/beyond-atl" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Beyond ATL Cities
        </Link>

        {!isNew && (
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[24px] font-bold text-black">{field(city, "name")}{field(city, "state") ? `, ${field(city, "state")}` : ""}</h1>
            <StatusBadge variant={fieldBool(city, "is_active") ? "green" : "gray"}>{fieldBool(city, "is_active") ? "Active" : "Inactive"}</StatusBadge>
          </div>
        )}

        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab 1 — Details */}
        {activeTab === "details" && (
          <div className="space-y-4">
            <FormGroup label="Name"><FormInput defaultValue={field(city, "name")} /></FormGroup>
            <FormGroup label="Slug"><FormInput defaultValue={field(city, "slug")} readOnly className="bg-[#f5f5f5]" /></FormGroup>
            <FormRow columns={2}>
              <FormGroup label="State"><FormInput defaultValue={field(city, "state")} /></FormGroup>
              <FormGroup label="Metro Area"><FormInput defaultValue={field(city, "metro_area")} /></FormGroup>
            </FormRow>
            <FormGroup label="Tagline"><FormInput defaultValue={field(city, "tagline")} /></FormGroup>
            <FormGroup label="Description"><FormTextarea defaultValue={field(city, "description")} rows={5} /></FormGroup>
            <FormGroup label="Hero Image URL"><FormInput defaultValue={field(city, "hero_image_url")} /></FormGroup>
            {field(city, "hero_image_url") && (
              <div className="w-full max-w-[400px] aspect-[16/9] border border-[#e5e5e5] overflow-hidden">
                <img src={field(city, "hero_image_url")} alt={`${field(city, "name", "City")} hero image`} className="w-full h-full object-cover" />
              </div>
            )}
            <FormGroup label="Logo URL"><FormInput defaultValue={field(city, "logo_url")} /></FormGroup>
            <FormRow columns={2}>
              <FormGroup label="Latitude"><FormInput type="number" defaultValue={field(city, "latitude")} /></FormGroup>
              <FormGroup label="Longitude"><FormInput type="number" defaultValue={field(city, "longitude")} /></FormGroup>
            </FormRow>
            <FormGroup label="Population"><FormInput type="number" defaultValue={field(city, "population")} /></FormGroup>
            <ToggleSwitch label="Active" checked={fieldBool(city, "is_active")} onChange={() => console.log("Toggle active")} />
            <ButtonBar>
              <button onClick={() => console.log("Save city")} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors">Save Changes</button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 2 — Related Content */}
        {activeTab === "related" && (
          <div className="space-y-6">
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

            <h3 className="font-display text-[16px] font-semibold text-black">Areas</h3>
            {areas.length > 0 ? (
              <AdminDataTable
                columns={[
                  { key: "name", header: "Name", render: (a: AreaRow) => <Link href={`/admin/areas/${a.id}`} className="text-[13px] font-semibold text-black hover:text-[#c1121f]">{a.name}</Link> },
                  { key: "slug", header: "Slug", render: (a: AreaRow) => <span className="text-[13px] font-mono">{a.slug}</span> },
                ]}
                data={areas}
              />
            ) : (
              <div className="flex flex-col items-center py-8 text-[#6b7280]"><Map size={24} className="mb-1" /><span className="text-[12px]">No areas</span></div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
