"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Newspaper } from "lucide-react";
import { updateEvent } from "@/app/admin/actions";
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
import { UploadZone } from "@/components/portal/UploadZone";
import { AdminDataTable } from "@/components/portal/AdminDataTable";

interface ImageRow { id: string; image_url: string; caption: string | null; alt_text: string | null; sort_order: number; is_primary: boolean }
interface TagRow { id: string; name: string; slug: string }
interface RelatedPost { id: string; title: string; status: string; published_at: string | null }

interface EventDetailClientProps {
  event: Record<string, unknown> | null;
  isNew: boolean;
  eventImages: ImageRow[];
  tags: TagRow[];
  activeTagIds: string[];
  relatedPosts: RelatedPost[];
  categories: { id: string; name: string }[];
  neighborhoods: { id: string; name: string }[];
  cities: { id: string; name: string }[];
  businesses: { value: string; label: string }[];
}

const TABS = [
  { label: "Basic Info", key: "basic" },
  { label: "Date & Time", key: "datetime" },
  { label: "Venue & Location", key: "venue" },
  { label: "Tickets & Pricing", key: "tickets" },
  { label: "Tags & Media", key: "tags" },
];

const statusBadgeMap: Record<string, "green" | "blue" | "gray" | "yellow"> = {
  active: "green",
  draft: "blue",
  completed: "gray",
  published: "green",
  pending: "yellow",
};

function field(ev: Record<string, unknown> | null, key: string, fallback = ""): string {
  if (!ev) return fallback;
  const v = ev[key];
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function fieldBool(ev: Record<string, unknown> | null, key: string): boolean {
  if (!ev) return false;
  return ev[key] === true;
}

export function EventDetailClient({
  event: ev,
  isNew,
  eventImages,
  tags,
  activeTagIds,
  relatedPosts,
  categories,
  neighborhoods,
  cities,
  businesses,
}: EventDetailClientProps) {
  const router = useRouter();
  const evId = ev?.id as string | undefined;
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [localTags, setLocalTags] = useState<string[]>(activeTagIds);

  const title = isNew ? "New Event" : field(ev, "title", "Event");

  const handleToggle = useCallback(async (fieldName: string, currentValue: boolean) => {
    if (!evId) return;
    setSaving(true);
    const result = await updateEvent(evId, { [fieldName]: !currentValue });
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [evId, router]);

  const handleSaveBasic = useCallback(async () => {
    if (!evId) return;
    const form = document.querySelector('[data-tab="basic"]') as HTMLElement | null;
    if (!form) return;
    const inputs = form.querySelectorAll("input, textarea, select");
    const labels = ["title", "slug", "tagline", "event_type", "description", "category_id", "status", "featured_image_url", "website"];
    const data: Record<string, unknown> = {};
    inputs.forEach((el, i) => { if (labels[i]) data[labels[i]] = (el as HTMLInputElement).value || null; });
    setSaving(true);
    const result = await updateEvent(evId, data);
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [evId, router]);

  const handleSaveDatetime = useCallback(async () => {
    if (!evId) return;
    const form = document.querySelector('[data-tab="datetime"]') as HTMLElement | null;
    if (!form) return;
    const inputs = form.querySelectorAll("input");
    const labels = ["start_date", "start_time", "end_date", "end_time"];
    const data: Record<string, unknown> = {};
    inputs.forEach((el, i) => { if (labels[i]) data[labels[i]] = el.value || null; });
    // include recurrence_rule if visible
    const extraInputs = form.querySelectorAll('input');
    if (extraInputs.length > 4) data.recurrence_rule = (extraInputs[4] as HTMLInputElement).value || null;
    setSaving(true);
    const result = await updateEvent(evId, data);
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [evId, router]);

  const handleSaveVenue = useCallback(async () => {
    if (!evId) return;
    const form = document.querySelector('[data-tab="venue"]') as HTMLElement | null;
    if (!form) return;
    const inputs = form.querySelectorAll("input, select");
    const labels = ["venue_name", "venue_business_id", "organizer_business_id", "organizer_name", "organizer_url", "street_address", "street_address_2", "state", "zip_code", "neighborhood_id", "latitude", "longitude", "city_id"];
    const data: Record<string, unknown> = {};
    inputs.forEach((el, i) => { if (labels[i]) data[labels[i]] = (el as HTMLInputElement).value || null; });
    if (data.latitude) data.latitude = parseFloat(data.latitude as string);
    if (data.longitude) data.longitude = parseFloat(data.longitude as string);
    setSaving(true);
    const result = await updateEvent(evId, data);
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [evId, router]);

  const handleSaveTickets = useCallback(async () => {
    if (!evId) return;
    const form = document.querySelector('[data-tab="tickets"]') as HTMLElement | null;
    if (!form) return;
    const inputs = form.querySelectorAll("input:not([type=checkbox]), select");
    const labels = ["ticket_price_min", "ticket_price_max", "ticket_url", "tier", "listing_price_cents", "payment_status", "pricing_source"];
    const data: Record<string, unknown> = {};
    inputs.forEach((el, i) => { if (labels[i]) data[labels[i]] = (el as HTMLInputElement).value || null; });
    if (data.ticket_price_min) data.ticket_price_min = parseFloat(data.ticket_price_min as string);
    if (data.ticket_price_max) data.ticket_price_max = parseFloat(data.ticket_price_max as string);
    if (data.listing_price_cents) data.listing_price_cents = parseInt(data.listing_price_cents as string);
    setSaving(true);
    const result = await updateEvent(evId, data);
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [evId, router]);

  return (
    <>
      <PortalTopbar title={title} />
      <div className="p-8 max-[899px]:pt-16 space-y-6">
        <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Events
        </Link>

        {!isNew && (
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[24px] font-bold text-black">{field(ev, "title")}</h1>
            <StatusBadge variant={statusBadgeMap[field(ev, "status")] ?? "gray"}>{field(ev, "status")}</StatusBadge>
          </div>
        )}
        {!isNew && <p className="text-[13px] text-[#6b7280]">{field(ev, "slug")}</p>}

        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab 1 — Basic Info */}
        {activeTab === "basic" && (
          <div className="space-y-4" data-tab="basic">
            <FormGroup label="Title"><FormInput defaultValue={field(ev, "title")} /></FormGroup>
            <FormGroup label="Slug"><FormInput defaultValue={field(ev, "slug")} readOnly className="bg-[#f5f5f5]" /></FormGroup>
            <FormRow columns={2}>
              <FormGroup label="Tagline"><FormInput defaultValue={field(ev, "tagline")} /></FormGroup>
              <FormGroup label="Event Type">
                <FormSelect options={[{ value: "festival", label: "Festival" }, { value: "concert", label: "Concert" }, { value: "pop-up", label: "Pop-up" }, { value: "workshop", label: "Workshop" }, { value: "networking", label: "Networking" }, { value: "food-drink", label: "Food & Drink" }, { value: "sports", label: "Sports" }, { value: "other", label: "Other" }]} defaultValue={field(ev, "event_type")} placeholder="Select type" />
              </FormGroup>
            </FormRow>
            <FormGroup label="Description"><FormTextarea defaultValue={field(ev, "description")} rows={5} /></FormGroup>
            <FormRow columns={2}>
              <FormGroup label="Category">
                <FormSelect options={categories.map((c) => ({ value: c.id, label: c.name }))} defaultValue={field(ev, "category_id")} placeholder="Select category" />
              </FormGroup>
              <FormGroup label="Status">
                <FormSelect options={[{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "completed", label: "Completed" }]} defaultValue={field(ev, "status")} />
              </FormGroup>
            </FormRow>
            <FormGroup label="Featured Image URL"><FormInput defaultValue={field(ev, "featured_image_url")} /></FormGroup>
            <FormGroup label="Website"><FormInput defaultValue={field(ev, "website")} /></FormGroup>
            <FormRow columns={2}>
              <ToggleSwitch label="Featured" checked={fieldBool(ev, "is_featured")} onChange={() => handleToggle("is_featured", fieldBool(ev, "is_featured"))} />
              <ToggleSwitch label="Featured on Map" checked={fieldBool(ev, "featured_on_map")} onChange={() => handleToggle("featured_on_map", fieldBool(ev, "featured_on_map"))} />
            </FormRow>
            <ButtonBar>
              <button onClick={handleSaveBasic} disabled={saving} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save Changes"}</button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 2 — Date & Time */}
        {activeTab === "datetime" && (
          <div className="space-y-4" data-tab="datetime">
            <FormRow columns={2}>
              <FormGroup label="Start Date"><FormInput type="date" defaultValue={field(ev, "start_date")} /></FormGroup>
              <FormGroup label="Start Time"><FormInput type="time" defaultValue={field(ev, "start_time")} /></FormGroup>
            </FormRow>
            <FormRow columns={2}>
              <FormGroup label="End Date"><FormInput type="date" defaultValue={field(ev, "end_date")} /></FormGroup>
              <FormGroup label="End Time"><FormInput type="time" defaultValue={field(ev, "end_time")} /></FormGroup>
            </FormRow>
            <ToggleSwitch label="Recurring Event" checked={fieldBool(ev, "is_recurring")} onChange={() => handleToggle("is_recurring", fieldBool(ev, "is_recurring"))} />
            {fieldBool(ev, "is_recurring") && (
              <FormGroup label="Recurrence Rule"><FormInput defaultValue={field(ev, "recurrence_rule")} /></FormGroup>
            )}
            <ButtonBar>
              <button onClick={handleSaveDatetime} disabled={saving} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save Changes"}</button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 3 — Venue & Location */}
        {activeTab === "venue" && (
          <div className="space-y-4" data-tab="venue">
            <FormGroup label="Venue Name"><FormInput defaultValue={field(ev, "venue_name")} /></FormGroup>
            <FormGroup label="Venue Business">
              <FormSelect options={businesses} defaultValue={field(ev, "venue_business_id")} placeholder="Link to existing business" />
            </FormGroup>
            <FormGroup label="Organizer Business">
              <FormSelect options={businesses} defaultValue={field(ev, "organizer_business_id")} placeholder="Link to existing business" />
            </FormGroup>
            <FormRow columns={2}>
              <FormGroup label="Organizer Name"><FormInput defaultValue={field(ev, "organizer_name")} /></FormGroup>
              <FormGroup label="Organizer URL"><FormInput defaultValue={field(ev, "organizer_url")} /></FormGroup>
            </FormRow>
            <FormRow columns={2}>
              <FormGroup label="Street Address"><FormInput defaultValue={field(ev, "street_address")} /></FormGroup>
              <FormGroup label="Suite/Unit"><FormInput defaultValue={field(ev, "street_address_2")} /></FormGroup>
            </FormRow>
            <FormRow columns={3}>
              <FormGroup label="State"><FormInput defaultValue={field(ev, "state")} /></FormGroup>
              <FormGroup label="Zip Code"><FormInput defaultValue={field(ev, "zip_code")} /></FormGroup>
              <FormGroup label="Neighborhood">
                <FormSelect options={neighborhoods.map((n) => ({ value: n.id, label: n.name }))} defaultValue={field(ev, "neighborhood_id")} placeholder="Select" />
              </FormGroup>
            </FormRow>
            <FormRow columns={2}>
              <FormGroup label="Latitude"><FormInput type="number" defaultValue={field(ev, "latitude")} /></FormGroup>
              <FormGroup label="Longitude"><FormInput type="number" defaultValue={field(ev, "longitude")} /></FormGroup>
            </FormRow>
            <FormGroup label="City">
              <FormSelect options={cities.map((c) => ({ value: c.id, label: c.name }))} defaultValue={field(ev, "city_id")} placeholder="Select city" />
            </FormGroup>
            <ButtonBar>
              <button onClick={handleSaveVenue} disabled={saving} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save Changes"}</button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 4 — Tickets & Pricing */}
        {activeTab === "tickets" && (
          <div className="space-y-4" data-tab="tickets">
            <ToggleSwitch label="Free Event" checked={fieldBool(ev, "is_free")} onChange={() => handleToggle("is_free", fieldBool(ev, "is_free"))} />
            {!fieldBool(ev, "is_free") && (
              <>
                <FormRow columns={2}>
                  <FormGroup label="Min Ticket Price"><FormInput type="number" defaultValue={field(ev, "ticket_price_min")} /></FormGroup>
                  <FormGroup label="Max Ticket Price"><FormInput type="number" defaultValue={field(ev, "ticket_price_max")} /></FormGroup>
                </FormRow>
                <FormGroup label="Ticket URL"><FormInput defaultValue={field(ev, "ticket_url")} /></FormGroup>
              </>
            )}

            <h3 className="font-display text-[16px] font-semibold text-black mt-6">Listing Payment</h3>
            <FormRow columns={3}>
              <FormGroup label="Tier">
                <FormSelect options={[{ value: "free", label: "Free" }, { value: "standard", label: "Standard" }, { value: "premium", label: "Premium" }, { value: "featured", label: "Featured" }]} defaultValue={field(ev, "tier")} />
              </FormGroup>
              <FormGroup label="Listing Price (cents)"><FormInput type="number" defaultValue={field(ev, "listing_price_cents")} readOnly className="bg-[#f5f5f5]" /></FormGroup>
              <FormGroup label="Payment Status">
                <FormSelect options={[{ value: "unpaid", label: "Unpaid" }, { value: "paid", label: "Paid" }, { value: "comped", label: "Comped" }, { value: "refunded", label: "Refunded" }]} defaultValue={field(ev, "payment_status")} />
              </FormGroup>
            </FormRow>
            <FormRow columns={2}>
              <ToggleSwitch label="Comped" checked={fieldBool(ev, "is_comped")} onChange={() => handleToggle("is_comped", fieldBool(ev, "is_comped"))} />
              <FormGroup label="Pricing Source"><FormInput defaultValue={field(ev, "pricing_source")} readOnly className="bg-[#f5f5f5]" /></FormGroup>
            </FormRow>
            <ButtonBar>
              <button onClick={handleSaveTickets} disabled={saving} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save Changes"}</button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 5 — Tags & Media */}
        {activeTab === "tags" && (
          <div className="space-y-6">
            <h3 className="font-display text-[16px] font-semibold text-black">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isActive = localTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => setLocalTags((prev) => isActive ? prev.filter((t) => t !== tag.id) : [...prev, tag.id])}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${
                      isActive ? "bg-[#fee198] text-[#1a1a1a]" : "border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db]"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>

            <h3 className="font-display text-[16px] font-semibold text-black">Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {eventImages.map((img) => (
                <div key={img.id} className="border border-[#e5e5e5] overflow-hidden">
                  <div className="aspect-[4/3] relative">
                    <img src={img.image_url} alt={img.alt_text ?? ""} className="w-full h-full object-cover" />
                    {img.is_primary && (
                      <span className="absolute top-1 right-1 text-[#fee198]"><Star size={16} fill="currentColor" /></span>
                    )}
                  </div>
                  <div className="px-2 py-1.5">
                    {img.caption && <p className="text-[11px] text-[#6b7280] truncate">{img.caption}</p>}
                    <span className="text-[10px] text-[#9ca3af]">#{img.sort_order}</span>
                  </div>
                </div>
              ))}
            </div>
            <UploadZone onUpload={() => { /* event image upload — storage integration pending */ }} accept="image/*" label="Add event photos" />

            <h3 className="font-display text-[16px] font-semibold text-black">Related Blog Posts</h3>
            {relatedPosts.length > 0 ? (
              <AdminDataTable
                columns={[
                  { key: "title", header: "Title", render: (p: RelatedPost) => <Link href={`/admin/posts/${p.id}`} className="text-[13px] font-semibold text-black hover:text-[#c1121f]">{p.title}</Link> },
                  { key: "status", header: "Status", render: (p: RelatedPost) => <StatusBadge variant={statusBadgeMap[p.status] ?? "gray"}>{p.status}</StatusBadge> },
                  { key: "published_at", header: "Published", render: (p: RelatedPost) => <span className="text-[12px] text-[#6b7280]">{p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"}</span> },
                ]}
                data={relatedPosts}
              />
            ) : (
              <div className="flex flex-col items-center py-8 text-[#6b7280]"><Newspaper size={24} className="mb-1" /><span className="text-[12px]">No related blog posts</span></div>
            )}

            <ButtonBar>
              <button onClick={async () => {
                if (!evId) return;
                setSaving(true);
                // Save any event-level data; tags are managed via junction table separately
                const result = await updateEvent(evId, {});
                setSaving(false);
                if ("error" in result && result.error) { alert("Error: " + result.error); return; }
                router.refresh();
              }} disabled={saving} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save Changes"}</button>
            </ButtonBar>
          </div>
        )}
      </div>
    </>
  );
}
