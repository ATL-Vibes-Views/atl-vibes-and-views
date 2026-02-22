"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Newspaper, Calendar, MapPin } from "lucide-react";
import { updateBusiness, createBusinessSubmission } from "@/app/admin/actions";
import { BusinessForm } from "@/components/submit/BusinessForm";
import type { BusinessFormData, NeighborhoodGrouped, Amenity, IdentityOption, Tag } from "@/lib/types";
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
import { StatCard } from "@/components/portal/StatCard";
import { StatGrid } from "@/components/portal/StatGrid";
import { AdminDataTable } from "@/components/portal/AdminDataTable";

interface HoursRow { id: string; day_of_week: string; open_time: string | null; close_time: string | null; is_closed: boolean; notes: string | null }
interface ContactRow { id: string; contact_name: string; contact_title: string | null; contact_email: string | null; contact_phone: string | null; is_primary: boolean; is_public: boolean; notes: string | null }
interface ImageRow { id: string; image_url: string; caption: string | null; alt_text: string | null; sort_order: number; is_primary: boolean }
interface AmenityRow { id: string; name: string; amenity_group: string | null; sort_order: number }
interface IdentityRow { id: string; name: string; slug: string; sort_order: number }
interface TagRow { id: string; name: string; slug: string }
interface RelatedPost { id: string; title: string; slug: string; status: string; published_at: string | null; mention_type: string | null }
interface RelatedEvent { id: string; title: string; start_date: string; status: string }
interface RelatedReview { id: string; rating: number; body: string | null; status: string; created_at: string }

interface BusinessDetailClientProps {
  business: Record<string, unknown> | null;
  isNew: boolean;
  hours: HoursRow[];
  contacts: ContactRow[];
  images: ImageRow[];
  amenities: AmenityRow[];
  activeAmenityIds: string[];
  identityOptions: IdentityRow[];
  activeIdentityIds: string[];
  tags: TagRow[];
  activeTagIds: string[];
  relatedPosts: RelatedPost[];
  relatedEvents: RelatedEvent[];
  relatedReviews: RelatedReview[];
  categories: { id: string; name: string }[];
  neighborhoods: { id: string; name: string }[];
  neighborhoodsGrouped: NeighborhoodGrouped[];
  cities: { id: string; name: string }[];
}

const TABS = [
  { label: "Basic Info", key: "basic" },
  { label: "Location & Hours", key: "location" },
  { label: "Contact & Social", key: "contact" },
  { label: "Photos & Media", key: "photos" },
  { label: "Tags & Identity", key: "tags" },
  { label: "Admin & Tiers", key: "admin" },
  { label: "Related Content", key: "related" },
];

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const statusBadgeMap: Record<string, "green" | "blue" | "gray" | "yellow" | "red"> = {
  active: "green",
  draft: "blue",
  inactive: "gray",
  pending: "yellow",
  published: "green",
  completed: "gray",
  approved: "green",
  rejected: "red",
};

function field(biz: Record<string, unknown> | null, key: string, fallback = ""): string {
  if (!biz) return fallback;
  const v = biz[key];
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function fieldBool(biz: Record<string, unknown> | null, key: string): boolean {
  if (!biz) return false;
  return biz[key] === true;
}

const EMPTY_BUSINESS: BusinessFormData = {
  tier: "free",
  business_name: "",
  category_id: "",
  tagline: "",
  description: "",
  price_range: "",
  street_address: "",
  street_address_2: "",
  city_id: "",
  city_text: "",
  state: "GA",
  zip_code: "",
  neighborhood_id: "",
  latitude: null,
  longitude: null,
  phone: "",
  email: "",
  website: "",
  primary_link: "",
  primary_link_label: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  x_twitter: "",
  logo_url: "",
  video_url: "",
  special_offers: "",
  is_owner: false,
  display_identity_publicly: false,
  certified_diversity_program: false,
  certifications: [],
  hours: [
    { day_of_week: "monday", open_time: "09:00", close_time: "17:00", is_closed: false, notes: "" },
    { day_of_week: "tuesday", open_time: "09:00", close_time: "17:00", is_closed: false, notes: "" },
    { day_of_week: "wednesday", open_time: "09:00", close_time: "17:00", is_closed: false, notes: "" },
    { day_of_week: "thursday", open_time: "09:00", close_time: "17:00", is_closed: false, notes: "" },
    { day_of_week: "friday", open_time: "09:00", close_time: "17:00", is_closed: false, notes: "" },
    { day_of_week: "saturday", open_time: "10:00", close_time: "17:00", is_closed: false, notes: "" },
    { day_of_week: "sunday", open_time: "", close_time: "", is_closed: true, notes: "" },
  ],
  contacts: [{ contact_name: "", contact_title: "", contact_email: "", contact_phone: "", is_primary: true, is_public: true }],
  images: [],
  amenity_ids: [],
  identity_option_ids: [],
  tag_ids: [],
  photo_urls: [],
};

export function BusinessDetailClient({
  business: biz,
  isNew,
  hours,
  contacts,
  images,
  amenities,
  activeAmenityIds,
  identityOptions,
  activeIdentityIds,
  tags,
  activeTagIds,
  relatedPosts,
  relatedEvents,
  relatedReviews,
  categories,
  neighborhoods,
  neighborhoodsGrouped,
  cities,
}: BusinessDetailClientProps) {
  const router = useRouter();
  const id = biz?.id as string | undefined;
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [localAmenities, setLocalAmenities] = useState<string[]>(activeAmenityIds);
  const [localIdentities, setLocalIdentities] = useState<string[]>(activeIdentityIds);
  const [localTags, setLocalTags] = useState<string[]>(activeTagIds);
  const [localContacts, setLocalContacts] = useState(contacts);

  // isNew form state
  const [newData, setNewData] = useState<BusinessFormData>(EMPTY_BUSINESS);
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleNewSubmit = useCallback(async () => {
    if (!newData.business_name.trim()) { setSubmitError("Business name is required."); return; }
    setSubmitError("");
    setSaving(true);
    const result = await createBusinessSubmission({ ...(newData as unknown as Record<string, unknown>), submitter_name: submitterName, submitter_email: submitterEmail });
    setSaving(false);
    if ("error" in result && result.error) { setSubmitError("Error: " + result.error); return; }
    router.push("/admin/submissions");
  }, [newData, router]);

  const sortedHours = [...hours].sort((a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week));

  const handleToggle = useCallback(async (fieldName: string, currentValue: boolean) => {
    if (!id) return;
    setSaving(true);
    const result = await updateBusiness(id, { [fieldName]: !currentValue });
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [id, router]);

  const handleSaveBasic = useCallback(async () => {
    if (!id) return;
    const form = document.querySelector('[data-tab="basic"]') as HTMLElement | null;
    if (!form) return;
    const inputs = form.querySelectorAll("input, textarea, select");
    const labels = ["business_name", "tagline", "slug", "description", "category_id", "price_range", "status", "city_id", "special_offers", "order_online_url"];
    const data: Record<string, unknown> = {};
    inputs.forEach((el, i) => {
      if (labels[i]) {
        data[labels[i]] = (el as HTMLInputElement).value || null;
      }
    });
    setSaving(true);
    const result = await updateBusiness(id, data);
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [id, router]);

  const handleSaveLocation = useCallback(async () => {
    if (!id) return;
    const form = document.querySelector('[data-tab="location"]') as HTMLElement | null;
    if (!form) return;
    const inputs = form.querySelectorAll("input:not([type=time]):not([type=checkbox]), select");
    const labels = ["street_address", "street_address_2", "state", "zip_code", "neighborhood_id", "latitude", "longitude"];
    const data: Record<string, unknown> = {};
    inputs.forEach((el, i) => {
      if (labels[i]) {
        const val = (el as HTMLInputElement).value;
        data[labels[i]] = val || null;
      }
    });
    if (data.latitude) data.latitude = parseFloat(data.latitude as string);
    if (data.longitude) data.longitude = parseFloat(data.longitude as string);
    setSaving(true);
    const result = await updateBusiness(id, data);
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [id, router]);

  const handleSaveContact = useCallback(async () => {
    if (!id) return;
    const form = document.querySelector('[data-tab="contact"]') as HTMLElement | null;
    if (!form) return;
    const inputs = form.querySelectorAll("input");
    const labels = ["phone", "email", "website", "primary_link", "primary_link_label", "instagram", "tiktok", "facebook", "x_twitter"];
    const data: Record<string, unknown> = {};
    inputs.forEach((el, i) => {
      if (labels[i]) data[labels[i]] = el.value || null;
    });
    setSaving(true);
    const result = await updateBusiness(id, data);
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [id, router]);

  const handleSaveAdmin = useCallback(async () => {
    if (!id) return;
    const form = document.querySelector('[data-tab="admin"]') as HTMLElement | null;
    if (!form) return;
    const selects = form.querySelectorAll("select");
    const dateInputs = form.querySelectorAll('input[type="date"]');
    const data: Record<string, unknown> = {};
    const selectLabels = ["tier", "map_pin_style", "claim_status"];
    selects.forEach((el, i) => { if (selectLabels[i]) data[selectLabels[i]] = el.value || null; });
    const dateLabels = ["tier_start_date", "tier_expires_at", "grace_period_end"];
    dateInputs.forEach((el, i) => { if (dateLabels[i]) data[dateLabels[i]] = (el as HTMLInputElement).value || null; });
    setSaving(true);
    const result = await updateBusiness(id, data);
    setSaving(false);
    if ("error" in result && result.error) { alert("Error: " + result.error); return; }
    router.refresh();
  }, [id, router]);

  const title = isNew ? "New Business" : field(biz, "business_name", "Business");

  const avgRating = relatedReviews.length > 0
    ? (relatedReviews.reduce((sum, r) => sum + r.rating, 0) / relatedReviews.length).toFixed(1)
    : "—";

  return (
    <>
      <PortalTopbar title={title} />
      <div className="p-8 space-y-6">
        {/* Back link */}
        <Link href="/admin/businesses" className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Businesses
        </Link>

        {/* Header */}
        {!isNew && (
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[24px] font-bold text-black">{field(biz, "business_name")}</h1>
            <StatusBadge variant={statusBadgeMap[field(biz, "status")] ?? "gray"}>{field(biz, "status")}</StatusBadge>
          </div>
        )}
        {!isNew && <p className="text-[13px] text-[#6b7280]">{field(biz, "slug")}</p>}

        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab 1 — Basic Info */}
        {activeTab === "basic" && !isNew && (
          <div className="space-y-4" data-tab="basic">
            <FormGroup label="Business Name"><FormInput defaultValue={field(biz, "business_name")} /></FormGroup>
            <FormGroup label="Tagline"><FormInput defaultValue={field(biz, "tagline")} /></FormGroup>
            <FormGroup label="Slug"><FormInput defaultValue={field(biz, "slug")} readOnly className="bg-[#f5f5f5]" /></FormGroup>
            <FormGroup label="Description"><FormTextarea defaultValue={field(biz, "description")} rows={5} /></FormGroup>
            <FormRow columns={2}>
              <FormGroup label="Category">
                <FormSelect options={categories.map((c) => ({ value: c.id, label: c.name }))} defaultValue={field(biz, "category_id")} placeholder="Select category" />
              </FormGroup>
              <FormGroup label="Price Range">
                <FormSelect options={[{ value: "$", label: "$" }, { value: "$$", label: "$$" }, { value: "$$$", label: "$$$" }, { value: "$$$$", label: "$$$$" }]} defaultValue={field(biz, "price_range")} placeholder="Select" />
              </FormGroup>
            </FormRow>
            <FormRow columns={2}>
              <FormGroup label="Status">
                <FormSelect options={[{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "inactive", label: "Inactive" }]} defaultValue={field(biz, "status")} />
              </FormGroup>
              <FormGroup label="City">
                <FormSelect options={cities.map((c) => ({ value: c.id, label: c.name }))} defaultValue={field(biz, "city_id")} placeholder="Select city" />
              </FormGroup>
            </FormRow>
            <FormGroup label="Special Offers"><FormTextarea defaultValue={field(biz, "special_offers")} rows={2} /></FormGroup>
            <FormGroup label="Order Online URL"><FormInput defaultValue={field(biz, "order_online_url")} /></FormGroup>
            <FormRow columns={2}>
              <ToggleSwitch label="Featured" checked={fieldBool(biz, "is_featured")} onChange={() => handleToggle("is_featured", fieldBool(biz, "is_featured"))} />
              <ToggleSwitch label="Featured on Map" checked={fieldBool(biz, "featured_on_map")} onChange={() => handleToggle("featured_on_map", fieldBool(biz, "featured_on_map"))} />
            </FormRow>
            <ButtonBar>
              <button onClick={handleSaveBasic} disabled={saving} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save Changes"}</button>
            </ButtonBar>
          </div>
        )}

        {/* isNew — tabs 1-5 rendered via BusinessForm (has Google Places + neighborhood detection built in) */}
        {isNew && activeTab !== "admin" && activeTab !== "related" && (
          <div className="pb-24">
            <BusinessForm
              data={newData}
              onChange={setNewData}
              categories={categories as unknown as import("@/lib/types").Category[]}
              neighborhoods={neighborhoodsGrouped}
              amenities={amenities as Amenity[]}
              identityOptions={identityOptions as IdentityOption[]}
              tier={newData.tier}
              submitterName={submitterName}
              submitterEmail={submitterEmail}
              onSubmitterNameChange={setSubmitterName}
              onSubmitterEmailChange={setSubmitterEmail}
              tags={tags as Tag[]}
              section={activeTab as "basic" | "location" | "contact" | "photos" | "tags"}
            />
          </div>
        )}

        {/* Tab 2 — Location & Hours */}
        {activeTab === "location" && !isNew && (
          <div className="space-y-4" data-tab="location">
            <FormRow columns={2}>
              <FormGroup label="Street Address"><FormInput defaultValue={field(biz, "street_address")} /></FormGroup>
              <FormGroup label="Suite/Unit"><FormInput defaultValue={field(biz, "street_address_2")} /></FormGroup>
            </FormRow>
            <FormRow columns={3}>
              <FormGroup label="State"><FormInput defaultValue={field(biz, "state")} /></FormGroup>
              <FormGroup label="Zip Code"><FormInput defaultValue={field(biz, "zip_code")} /></FormGroup>
              <FormGroup label="Neighborhood">
                <FormSelect options={neighborhoods.map((n) => ({ value: n.id, label: n.name }))} defaultValue={field(biz, "neighborhood_id")} placeholder="Select" />
              </FormGroup>
            </FormRow>
            <FormRow columns={2}>
              <FormGroup label="Latitude"><FormInput type="number" defaultValue={field(biz, "latitude")} /></FormGroup>
              <FormGroup label="Longitude"><FormInput type="number" defaultValue={field(biz, "longitude")} /></FormGroup>
            </FormRow>

            {/* Hours grid */}
            <div className="mt-6">
              <h3 className="font-display text-[16px] font-semibold text-black mb-3">Business Hours</h3>
              <div className="border border-[#e5e5e5] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f5f5f5] border-b border-[#e5e5e5]">
                      <th className="text-left text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3 py-2">Day</th>
                      <th className="text-left text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3 py-2">Open</th>
                      <th className="text-left text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3 py-2">Close</th>
                      <th className="text-left text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] px-3 py-2">Closed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAY_ORDER.map((day) => {
                      const h = sortedHours.find((hr) => hr.day_of_week === day);
                      return (
                        <tr key={day} className="border-b border-[#f0f0f0]">
                          <td className="px-3 py-2 text-[13px] font-semibold text-black">{day}</td>
                          <td className="px-3 py-2"><FormInput type="time" defaultValue={h?.open_time ?? ""} disabled={h?.is_closed} className="w-[120px]" /></td>
                          <td className="px-3 py-2"><FormInput type="time" defaultValue={h?.close_time ?? ""} disabled={h?.is_closed} className="w-[120px]" /></td>
                          <td className="px-3 py-2"><ToggleSwitch checked={h?.is_closed ?? false} onChange={() => { /* hours closed toggle — managed via business_hours table */ }} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <ButtonBar>
              <button onClick={handleSaveLocation} disabled={saving} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save Changes"}</button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 3 — Contact & Social */}
        {activeTab === "contact" && !isNew && (
          <div className="space-y-4" data-tab="contact">
            <FormRow columns={2}>
              <FormGroup label="Phone"><FormInput defaultValue={field(biz, "phone")} /></FormGroup>
              <FormGroup label="Email"><FormInput defaultValue={field(biz, "email")} /></FormGroup>
            </FormRow>
            <FormGroup label="Website"><FormInput defaultValue={field(biz, "website")} /></FormGroup>
            <FormRow columns={2}>
              <FormGroup label="Primary Link URL"><FormInput defaultValue={field(biz, "primary_link")} /></FormGroup>
              <FormGroup label="Primary Link Label"><FormInput defaultValue={field(biz, "primary_link_label")} /></FormGroup>
            </FormRow>

            <h3 className="font-display text-[16px] font-semibold text-black mt-6">Social Media</h3>
            <FormRow columns={2}>
              <FormGroup label="Instagram"><FormInput defaultValue={field(biz, "instagram")} /></FormGroup>
              <FormGroup label="TikTok"><FormInput defaultValue={field(biz, "tiktok")} /></FormGroup>
            </FormRow>
            <FormRow columns={2}>
              <FormGroup label="Facebook"><FormInput defaultValue={field(biz, "facebook")} /></FormGroup>
              <FormGroup label="X (Twitter)"><FormInput defaultValue={field(biz, "x_twitter")} /></FormGroup>
            </FormRow>

            <h3 className="font-display text-[16px] font-semibold text-black mt-6">Business Contacts</h3>
            {localContacts.map((c) => (
              <div key={c.id} className="border border-[#e5e5e5] p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-black">{c.contact_name}</span>
                  {c.is_primary && <StatusBadge variant="gold">Primary</StatusBadge>}
                </div>
                {c.contact_title && <p className="text-[12px] text-[#6b7280]">{c.contact_title}</p>}
                <div className="flex gap-4 text-[12px] text-[#6b7280]">
                  {c.contact_email && <span>{c.contact_email}</span>}
                  {c.contact_phone && <span>{c.contact_phone}</span>}
                </div>
                <ToggleSwitch label="Visible to Public" checked={c.is_public} onChange={() => { /* contact toggle - future enhancement */ }} />
                {c.notes && <p className="text-[11px] text-[#9ca3af] mt-1">{c.notes}</p>}
              </div>
            ))}
            <button onClick={() => { /* add contact — managed via business_contacts table */ }} className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold border border-[#e5e5e5] text-[#374151] hover:border-[#d1d5db] transition-colors">
              + Add Contact
            </button>
            <ButtonBar>
              <button onClick={handleSaveContact} disabled={saving} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save Changes"}</button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 4 — Photos & Media */}
        {activeTab === "photos" && !isNew && (
          <div className="space-y-4" data-tab="photos">
            <h3 className="font-display text-[16px] font-semibold text-black">Logo</h3>
            {field(biz, "logo") ? (
              <div className="w-[120px] h-[120px] border border-[#e5e5e5] overflow-hidden">
                <img src={field(biz, "logo")} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-[120px] h-[120px] border border-[#e5e5e5] flex items-center justify-center text-[11px] text-[#6b7280]">No logo</div>
            )}
            <UploadZone onUpload={() => { /* logo upload — storage integration pending */ }} accept="image/*" label="Upload new logo" hint="PNG, JPG up to 2MB" />

            <h3 className="font-display text-[16px] font-semibold text-black mt-6">Photo Gallery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="border border-[#e5e5e5] overflow-hidden">
                  <div className="aspect-[4/3] relative">
                    <img src={img.image_url} alt={img.alt_text ?? ""} className="w-full h-full object-cover" />
                    {img.is_primary && (
                      <span className="absolute top-1 right-1 text-[#fee198]"><Star size={16} fill="currentColor" /></span>
                    )}
                  </div>
                  <div className="px-2 py-1.5">
                    {img.caption && <p className="text-[11px] text-[#6b7280] truncate">{img.caption}</p>}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-[#9ca3af]">#{img.sort_order}</span>
                      <button onClick={() => { /* remove image — managed via business_images table */ }} className="text-[10px] text-[#c1121f] hover:underline">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <UploadZone onUpload={() => { /* photo upload — storage integration pending */ }} accept="image/*" label="Add photos" hint="PNG, JPG up to 5MB" />

            <FormGroup label="Video URL"><FormInput defaultValue={field(biz, "video_url")} /></FormGroup>
            <ButtonBar>
              <button onClick={async () => {
                if (!id) return;
                const form = document.querySelector('[data-tab="photos"]') as HTMLElement | null;
                if (!form) return;
                const videoInput = form.querySelector('input') as HTMLInputElement | null;
                setSaving(true);
                const result = await updateBusiness(id, { video_url: videoInput?.value || null });
                setSaving(false);
                if ("error" in result && result.error) { alert("Error: " + result.error); return; }
                router.refresh();
              }} disabled={saving} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save Changes"}</button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 5 — Tags & Identity */}
        {activeTab === "tags" && !isNew && (
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

            <h3 className="font-display text-[16px] font-semibold text-black">Amenities</h3>
            {Object.entries(
              amenities.reduce<Record<string, AmenityRow[]>>((groups, a) => {
                const g = a.amenity_group ?? "Other";
                if (!groups[g]) groups[g] = [];
                groups[g].push(a);
                return groups;
              }, {})
            ).map(([group, items]) => (
              <div key={group} className="space-y-1.5">
                <h4 className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-[0.05em]">{group}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {items.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 text-[13px] text-[#374151] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localAmenities.includes(a.id)}
                        onChange={() => setLocalAmenities((prev) => prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id])}
                        className="accent-[#fee198]"
                      />
                      {a.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <h3 className="font-display text-[16px] font-semibold text-black">Identity Options</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {identityOptions.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-[13px] text-[#374151] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localIdentities.includes(opt.id)}
                    onChange={() => setLocalIdentities((prev) => prev.includes(opt.id) ? prev.filter((x) => x !== opt.id) : [...prev, opt.id])}
                    className="accent-[#fee198]"
                  />
                  {opt.name}
                </label>
              ))}
            </div>

            <FormRow columns={2}>
              <ToggleSwitch label="Display Identity Publicly" checked={fieldBool(biz, "display_identity_publicly")} onChange={() => handleToggle("display_identity_publicly", fieldBool(biz, "display_identity_publicly"))} />
              <ToggleSwitch label="Certified Diversity Program" checked={fieldBool(biz, "certified_diversity_program")} onChange={() => handleToggle("certified_diversity_program", fieldBool(biz, "certified_diversity_program"))} />
            </FormRow>
            <ButtonBar>
              <button onClick={async () => {
                if (!id) return;
                setSaving(true);
                const result = await updateBusiness(id, {
                  display_identity_publicly: fieldBool(biz, "display_identity_publicly"),
                  certified_diversity_program: fieldBool(biz, "certified_diversity_program"),
                });
                setSaving(false);
                if ("error" in result && result.error) { alert("Error: " + result.error); return; }
                router.refresh();
              }} disabled={saving} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save Changes"}</button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 6 — Admin & Tiers */}
        {activeTab === "admin" && !isNew && (
          <div className="space-y-6" data-tab="admin">
            <StatGrid columns={3}>
              <StatCard label="Current Tier" value={field(biz, "tier", "—")} badge={{ text: field(biz, "tier", "free"), variant: field(biz, "tier") === "premium" ? "gold" : "gray" }} />
              <StatCard label="Claim Status" value={field(biz, "claim_status", "—")} badge={{ text: field(biz, "claim_status", "unclaimed"), variant: field(biz, "claim_status") === "verified" ? "green" : "yellow" }} />
              <StatCard label="Member Since" value={biz?.created_at ? new Date(biz.created_at as string).toLocaleDateString() : "—"} />
            </StatGrid>

            <h3 className="font-display text-[16px] font-semibold text-black">Tier Management</h3>
            <FormRow columns={3}>
              <FormGroup label="Current Tier">
                <FormSelect options={[{ value: "free", label: "Free" }, { value: "standard", label: "Standard" }, { value: "premium", label: "Premium" }, { value: "featured", label: "Featured" }]} defaultValue={field(biz, "tier")} />
              </FormGroup>
              <FormGroup label="Previous Tier"><FormInput defaultValue={field(biz, "previous_tier")} readOnly className="bg-[#f5f5f5]" /></FormGroup>
              <FormGroup label="Map Pin Style">
                <FormSelect options={[{ value: "basic", label: "Basic" }, { value: "enhanced", label: "Enhanced" }, { value: "premium", label: "Premium" }]} defaultValue={field(biz, "map_pin_style")} />
              </FormGroup>
            </FormRow>
            <FormRow columns={3}>
              <FormGroup label="Tier Start Date"><FormInput type="date" defaultValue={field(biz, "tier_start_date")} /></FormGroup>
              <FormGroup label="Tier Expires"><FormInput type="date" defaultValue={field(biz, "tier_expires_at")} /></FormGroup>
              <FormGroup label="Grace Period End"><FormInput type="date" defaultValue={field(biz, "grace_period_end")} /></FormGroup>
            </FormRow>
            <ToggleSwitch label="Tier Auto-Downgraded" checked={fieldBool(biz, "tier_auto_downgraded")} onChange={() => {}} />

            <h3 className="font-display text-[16px] font-semibold text-black mt-6">Claim & Verification</h3>
            <FormRow columns={2}>
              <ToggleSwitch label="Claimed" checked={fieldBool(biz, "claimed")} onChange={() => handleToggle("claimed", fieldBool(biz, "claimed"))} />
              <FormGroup label="Claim Status">
                <FormSelect options={[{ value: "unclaimed", label: "Unclaimed" }, { value: "pending", label: "Pending" }, { value: "verified", label: "Verified" }, { value: "rejected", label: "Rejected" }]} defaultValue={field(biz, "claim_status")} />
              </FormGroup>
            </FormRow>
            <FormRow columns={2}>
              <FormGroup label="Verification Method"><FormInput defaultValue={field(biz, "claim_verification_method")} readOnly className="bg-[#f5f5f5]" /></FormGroup>
              <FormGroup label="Claimed At"><FormInput defaultValue={biz?.claimed_at ? new Date(biz.claimed_at as string).toLocaleDateString() : ""} readOnly className="bg-[#f5f5f5]" /></FormGroup>
            </FormRow>
            <FormGroup label="Parent Brand"><FormInput defaultValue={field(biz, "parent_brand_id")} readOnly className="bg-[#f5f5f5]" /></FormGroup>

            <h3 className="font-display text-[16px] font-semibold text-black mt-6">Timestamps</h3>
            <FormRow columns={2}>
              <FormGroup label="Created"><FormInput defaultValue={biz?.created_at ? new Date(biz.created_at as string).toLocaleString() : "—"} readOnly className="bg-[#f5f5f5]" /></FormGroup>
              <FormGroup label="Updated"><FormInput defaultValue={biz?.updated_at ? new Date(biz.updated_at as string).toLocaleString() : "—"} readOnly className="bg-[#f5f5f5]" /></FormGroup>
            </FormRow>
            <ButtonBar>
              <button onClick={handleSaveAdmin} disabled={saving} className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save Changes"}</button>
            </ButtonBar>
          </div>
        )}

        {/* Tab 6 — Admin & Tiers (isNew) */}
        {activeTab === "admin" && isNew && (
          <div className="space-y-6">
            <h3 className="font-display text-[16px] font-semibold text-black">Tier</h3>
            <FormRow columns={2}>
              <FormGroup label="Tier">
                <FormSelect
                  options={[{ value: "free", label: "Free" }, { value: "standard", label: "Standard" }, { value: "premium", label: "Premium" }, { value: "featured", label: "Featured" }]}
                  value={newData.tier}
                  onChange={(e) => setNewData((p) => ({ ...p, tier: e.target.value }))}
                />
              </FormGroup>
              <FormGroup label="Map Pin Style">
                <FormSelect
                  options={[{ value: "basic", label: "Basic" }, { value: "enhanced", label: "Enhanced" }, { value: "premium", label: "Premium" }]}
                  value={((newData as unknown as Record<string, unknown>).map_pin_style as string) ?? "basic"}
                  onChange={(e) => setNewData((p) => ({ ...p, map_pin_style: e.target.value } as unknown as BusinessFormData))}
                />
              </FormGroup>
            </FormRow>
          </div>
        )}

        {/* Tab 7 — Related Content */}
        {activeTab === "related" && !isNew && (
          <div className="space-y-6">
            <StatGrid columns={3}>
              <StatCard label="Blog Posts" value={relatedPosts.length} />
              <StatCard label="Events" value={relatedEvents.length} />
              <StatCard label="Reviews" value={relatedReviews.length} subtitle={`Avg: ${avgRating}`} />
            </StatGrid>

            <h3 className="font-display text-[16px] font-semibold text-black">Blog Posts</h3>
            {relatedPosts.length > 0 ? (
              <AdminDataTable
                columns={[
                  { key: "title", header: "Title", render: (p: RelatedPost) => <Link href={`/admin/posts/${p.id}`} className="text-[13px] font-semibold text-black hover:text-[#c1121f]">{p.title}</Link> },
                  { key: "mention_type", header: "Mention Type", render: (p: RelatedPost) => <StatusBadge variant="blue">{p.mention_type ?? "—"}</StatusBadge> },
                  { key: "status", header: "Status", render: (p: RelatedPost) => <StatusBadge variant={statusBadgeMap[p.status] ?? "gray"}>{p.status}</StatusBadge> },
                  { key: "published_at", header: "Published", render: (p: RelatedPost) => <span className="text-[12px] text-[#6b7280]">{p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"}</span> },
                ]}
                data={relatedPosts}
              />
            ) : (
              <div className="flex flex-col items-center py-8 text-[#6b7280]"><Newspaper size={24} className="mb-1" /><span className="text-[12px]">No blog posts</span></div>
            )}

            <h3 className="font-display text-[16px] font-semibold text-black">Events</h3>
            {relatedEvents.length > 0 ? (
              <AdminDataTable
                columns={[
                  { key: "title", header: "Title", render: (e: RelatedEvent) => <Link href={`/admin/events/${e.id}`} className="text-[13px] font-semibold text-black hover:text-[#c1121f]">{e.title}</Link> },
                  { key: "start_date", header: "Date", render: (e: RelatedEvent) => <span className="text-[12px] text-[#6b7280]">{new Date(e.start_date).toLocaleDateString()}</span> },
                  { key: "status", header: "Status", render: (e: RelatedEvent) => <StatusBadge variant={statusBadgeMap[e.status] ?? "gray"}>{e.status}</StatusBadge> },
                ]}
                data={relatedEvents}
              />
            ) : (
              <div className="flex flex-col items-center py-8 text-[#6b7280]"><Calendar size={24} className="mb-1" /><span className="text-[12px]">No events</span></div>
            )}

            <h3 className="font-display text-[16px] font-semibold text-black">Reviews</h3>
            {relatedReviews.length > 0 ? (
              <div className="space-y-2">
                {relatedReviews.map((r) => (
                  <div key={r.id} className="border border-[#e5e5e5] p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} size={12} className={i < r.rating ? "text-[#fee198] fill-[#fee198]" : "text-[#e5e5e5]"} />
                        ))}
                      </div>
                      <StatusBadge variant={statusBadgeMap[r.status] ?? "gray"}>{r.status}</StatusBadge>
                      <span className="text-[11px] text-[#9ca3af]">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.body && <p className="text-[12px] text-[#374151] line-clamp-2">{r.body}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-[#6b7280]"><Star size={24} className="mb-1" /><span className="text-[12px]">No reviews</span></div>
            )}
          </div>
        )}
      </div>
      {isNew && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e5e5e5] px-8 py-4 flex items-center justify-between">
          {submitError ? (
            <p className="text-[13px] text-[#c1121f] font-medium">{submitError}</p>
          ) : (
            <p className="text-[13px] text-[#6b7280]">Fill in the details across all tabs, then submit to the review queue.</p>
          )}
          <button
            onClick={handleNewSubmit}
            disabled={saving}
            className="inline-flex items-center px-8 py-3 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#fdd870] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Submitting…" : "Submit to Queue"}
          </button>
        </div>
      )}
    </>
  );
}
