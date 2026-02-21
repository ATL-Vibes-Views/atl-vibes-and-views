"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { updateArea } from "@/app/admin/actions";
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
import { AdminDataTable } from "@/components/portal/AdminDataTable";
import { MediaPicker, type MediaAssetValue } from "@/components/admin/MediaPicker";
import { PostPicker } from "@/components/admin/PostPicker";

interface NeighborhoodRow { id: string; name: string; slug: string; is_active: boolean }

interface AreaDetailClientProps {
  area: Record<string, unknown> | null;
  isNew: boolean;
  neighborhoods: NeighborhoodRow[];
  cities: { id: string; name: string }[];
}

const TABS = [
  { label: "Details", key: "details" },
  { label: "Hero", key: "hero" },
  { label: "Neighborhoods", key: "neighborhoods" },
];

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

export function AreaDetailClient({ area, isNew, neighborhoods, cities }: AreaDetailClientProps) {
  const router = useRouter();
  const areaId = area?.id as string | undefined;
  const [activeTab, setActiveTab] = useState("details");
  const [saving, setSaving] = useState(false);

  /* ── Hero tab state ── */
  const [heroContentType, setHeroContentType] = useState<"image" | "video" | "featured_post">(field(area, "hero_content_type") as "image" | "video" | "featured_post" || "image");
  const [heroMedia, setHeroMedia] = useState<MediaAssetValue | null>(() => {
    const mediaId = field(area, "hero_media_id");
    const mediaUrl = field(area, "hero_image_url");
    return mediaId && mediaUrl ? { id: mediaId, url: mediaUrl, title: null, alt_text: null, mime_type: "image/jpeg" } : null;
  });
  const [heroPost, setHeroPost] = useState<{ id: string; title: string } | null>(
    field(area, "hero_featured_post_id") ? { id: field(area, "hero_featured_post_id"), title: "Loading…" } : null
  );
  const [heroFallbackUrl, setHeroFallbackUrl] = useState(field(area, "hero_image_url"));

  const handleSaveHero = useCallback(async () => {
    if (!areaId) return;
    setSaving(true);
    const result = await updateArea(areaId, {
      hero_content_type: heroContentType,
      hero_media_id: heroMedia?.id || null,
      hero_featured_post_id: heroPost?.id || null,
      hero_image_url: heroFallbackUrl || null,
    });
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [areaId, heroContentType, heroMedia, heroPost, heroFallbackUrl, router]);

  const handleToggle = useCallback(async (fieldName: string, currentValue: boolean) => {
    if (!areaId) return;
    setSaving(true);
    const result = await updateArea(areaId, { [fieldName]: !currentValue });
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [areaId, router]);

  const handleSaveDetails = useCallback(async () => {
    if (!areaId) return;
    const form = document.querySelector('[data-tab="details"]') as HTMLElement | null;
    if (!form) return;
    const inputs = form.querySelectorAll("input, textarea, select");
    const labels = ["name", "slug", "city_id", "tagline", "description", "hero_image_url", "map_center_lat", "map_center_lng"];
    const data: Record<string, unknown> = {};
    inputs.forEach((el, i) => { if (labels[i]) data[labels[i]] = (el as HTMLInputElement).value || null; });
    if (data.map_center_lat) data.map_center_lat = parseFloat(data.map_center_lat as string);
    if (data.map_center_lng) data.map_center_lng = parseFloat(data.map_center_lng as string);
    setSaving(true);
    const result = await updateArea(areaId, data);
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [areaId, router]);

  const title = isNew ? "New Area" : field(area, "name", "Area");

  return (
    <>
      <PortalTopbar title={title} />
      <div className="p-8 space-y-6">
        <Link href="/admin/areas" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Areas
        </Link>

        {!isNew && (
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[24px] font-bold text-black">{field(area, "name")}</h1>
            <StatusBadge variant={fieldBool(area, "is_active") ? "green" : "gray"}>{fieldBool(area, "is_active") ? "Active" : "Inactive"}</StatusBadge>
          </div>
        )}

        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab 1 — Details */}
        {activeTab === "details" && (
          <div className="space-y-4" data-tab="details">
            <FormGroup label="Name"><FormInput defaultValue={field(area, "name")} /></FormGroup>
            <FormGroup label="Slug"><FormInput defaultValue={field(area, "slug")} readOnly className="bg-[#f5f5f5]" /></FormGroup>
            <FormGroup label="City">
              <FormSelect options={cities.map((c) => ({ value: c.id, label: c.name }))} defaultValue={field(area, "city_id")} placeholder="Select city" />
            </FormGroup>
            <FormGroup label="Tagline"><FormInput defaultValue={field(area, "tagline")} /></FormGroup>
            <FormGroup label="Description"><FormTextarea defaultValue={field(area, "description")} rows={5} /></FormGroup>
            <FormGroup label="Hero Image URL"><FormInput defaultValue={field(area, "hero_image_url")} /></FormGroup>
            {field(area, "hero_image_url") && (
              <div className="w-full max-w-[400px] aspect-[16/9] border border-[#e5e5e5] overflow-hidden">
                <img src={field(area, "hero_image_url")} alt={`${field(area, "name", "Area")} hero image`} className="w-full h-full object-cover" />
              </div>
            )}
            <FormRow columns={2}>
              <FormGroup label="Map Center Lat"><FormInput type="number" defaultValue={field(area, "map_center_lat")} /></FormGroup>
              <FormGroup label="Map Center Lng"><FormInput type="number" defaultValue={field(area, "map_center_lng")} /></FormGroup>
            </FormRow>
            <ToggleSwitch label="Active" checked={fieldBool(area, "is_active")} onChange={() => handleToggle("is_active", fieldBool(area, "is_active"))} />
            <ButtonBar>
              <button onClick={handleSaveDetails} disabled={saving} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save Changes"}</button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 2 — Hero */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <div className="flex justify-end mb-4">
              <a
                href={`/areas/${field(area, "slug")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#6b7280] border border-[#e5e7eb] rounded hover:text-black hover:border-black transition-colors"
              >
                View Page ↗
              </a>
            </div>
            <FormGroup label="Hero Content Type">
              <FormSelect
                options={[
                  { value: "image", label: "Image" },
                  { value: "video", label: "Video" },
                  { value: "featured_post", label: "Featured Blog Post" },
                ]}
                value={heroContentType}
                onChange={(e) => setHeroContentType(e.target.value as "image" | "video" | "featured_post")}
              />
            </FormGroup>

            {(heroContentType === "image" || heroContentType === "video") && (
              <FormGroup label={heroContentType === "video" ? "Video Asset" : "Hero Image"}>
                <MediaPicker
                  value={heroMedia}
                  onChange={setHeroMedia}
                  allowedTypes={heroContentType === "video" ? ["video"] : ["image"]}
                />
              </FormGroup>
            )}

            {(heroContentType === "image" || heroContentType === "video") && (
              <FormGroup label="Fallback URL (if no asset selected)">
                <FormInput
                  value={heroFallbackUrl}
                  onChange={(e) => setHeroFallbackUrl(e.target.value)}
                  placeholder="https://..."
                />
              </FormGroup>
            )}

            {heroContentType === "featured_post" && (
              <FormGroup label="Featured Post">
                <PostPicker value={heroPost} onChange={setHeroPost} />
              </FormGroup>
            )}

            <ButtonBar>
              <button
                onClick={handleSaveHero}
                disabled={saving}
                className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Hero"}
              </button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 3 — Neighborhoods */}
        {activeTab === "neighborhoods" && (
          <div className="space-y-4">
            <h3 className="font-display text-[16px] font-semibold text-black">
              {neighborhoods.length} Neighborhoods in {field(area, "name", "this area")}
            </h3>
            {neighborhoods.length > 0 ? (
              <AdminDataTable
                columns={[
                  { key: "name", header: "Name", render: (n: NeighborhoodRow) => <Link href={`/admin/neighborhoods/${n.id}`} className="text-[13px] font-semibold text-black hover:text-[#c1121f]">{n.name}</Link> },
                  { key: "slug", header: "Slug", render: (n: NeighborhoodRow) => <span className="text-[13px] font-mono">{n.slug}</span> },
                  { key: "is_active", header: "Active", render: (n: NeighborhoodRow) => n.is_active ? <StatusBadge variant="green">Yes</StatusBadge> : <StatusBadge variant="gray">No</StatusBadge> },
                ]}
                data={neighborhoods}
              />
            ) : (
              <div className="flex flex-col items-center py-8 text-[#6b7280]">
                <MapPin size={24} className="mb-1" />
                <span className="text-[12px]">No neighborhoods assigned to this area</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
