"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ImageIcon } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { TabNav } from "@/components/portal/TabNav";
import { FormGroup } from "@/components/portal/FormGroup";
import { FormInput } from "@/components/portal/FormInput";
import { FormTextarea } from "@/components/portal/FormTextarea";
import { FormSelect } from "@/components/portal/FormSelect";
import { FormRow } from "@/components/portal/FormRow";
import { UploadZone } from "@/components/portal/UploadZone";

/* ---------------------------------------------------------- */
/* Types                                                      */
/* ---------------------------------------------------------- */

interface BusinessListing {
  id: string;
  business_name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  category_id: string | null;
  price_range: string | null;
  street_address: string;
  street_address_2: string | null;
  state: string;
  zip_code: string;
  neighborhood_id: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  primary_link: string | null;
  primary_link_label: string | null;
  order_online_url: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  x_twitter: string | null;
  logo: string | null;
  video_url: string | null;
  display_identity_publicly: boolean;
  [key: string]: unknown;
}

interface Category {
  id: string;
  name: string;
}

interface BusinessHour {
  id: string;
  day_of_week: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

interface BusinessContact {
  id: string;
  contact_name: string;
  contact_title: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_primary: boolean;
}

interface BusinessImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

interface AmenityOption {
  id: string;
  name: string;
  amenity_group: string | null;
  selected: boolean;
}

interface IdentityOption {
  id: string;
  name: string;
  slug: string;
  selected: boolean;
}

interface TagOption {
  id: string;
  name: string;
  selected: boolean;
}

interface ListingClientProps {
  business: BusinessListing | null;
  categories: Category[];
  neighborhoodName: string | null;
  hours: BusinessHour[];
  contacts: BusinessContact[];
  images: BusinessImage[];
  amenities: AmenityOption[];
  identityOptions: IdentityOption[];
  tags: TagOption[];
}

/* ---------------------------------------------------------- */
/* Tabs                                                       */
/* ---------------------------------------------------------- */

const TABS = [
  { label: "Basic Info", key: "basic" },
  { label: "Location & Hours", key: "location" },
  { label: "Contact & Social", key: "contact" },
  { label: "Photos & Media", key: "photos" },
  { label: "Tags & Identity", key: "tags" },
];

const PRICE_OPTIONS = [
  { value: "$", label: "$" },
  { value: "$$", label: "$$" },
  { value: "$$$", label: "$$$" },
  { value: "$$$$", label: "$$$$" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/* ---------------------------------------------------------- */
/* Component                                                  */
/* ---------------------------------------------------------- */

export default function ListingClient({
  business,
  categories,
  neighborhoodName,
  hours,
  contacts,
  images,
  amenities,
  identityOptions,
  tags,
}: ListingClientProps) {
  const [activeTab, setActiveTab] = useState("basic");

  const biz = business ?? ({} as Partial<BusinessListing>);

  const handleSave = (section: string) => {
    console.log(`Save clicked — ${section}`, biz);
  };

  const listingSlug = business?.slug ?? "blandtown-boxing";

  return (
    <>
      <PortalTopbar
        title="My Listing"
        actions={
          <Link
            href={`/businesses/${listingSlug}`}
            className="text-[13px] font-body font-semibold text-[#c1121f] hover:underline"
          >
            View Live Listing &rarr;
          </Link>
        }
      />
      <div className="p-8 max-[899px]:pt-16">
        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === "basic" && (
            <BasicInfoTab
              biz={biz}
              categories={categories}
              onSave={() => handleSave("basic")}
            />
          )}
          {activeTab === "location" && (
            <LocationTab
              biz={biz}
              neighborhoodName={neighborhoodName}
              hours={hours}
              onSave={() => handleSave("location")}
            />
          )}
          {activeTab === "contact" && (
            <ContactTab
              biz={biz}
              contacts={contacts}
              onSave={() => handleSave("contact")}
            />
          )}
          {activeTab === "photos" && (
            <PhotosTab
              biz={biz}
              images={images}
              onSave={() => handleSave("photos")}
            />
          )}
          {activeTab === "tags" && (
            <TagsTab
              biz={biz}
              amenities={amenities}
              identityOptions={identityOptions}
              tags={tags}
              onSave={() => handleSave("tags")}
            />
          )}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------- */
/* Save Button                                                */
/* ---------------------------------------------------------- */

function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
      >
        Save Changes
      </button>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Tab 1: Basic Info                                          */
/* ---------------------------------------------------------- */

function BasicInfoTab({
  biz,
  categories,
  onSave,
}: {
  biz: Partial<BusinessListing>;
  categories: Category[];
  onSave: () => void;
}) {
  return (
    <div className="max-w-[640px]">
      <FormGroup label="Business Name" htmlFor="business_name" required>
        <FormInput id="business_name" defaultValue={biz.business_name ?? ""} />
      </FormGroup>

      <FormGroup label="Tagline" htmlFor="tagline">
        <FormInput id="tagline" defaultValue={biz.tagline ?? ""} placeholder="A short tagline for your business" />
      </FormGroup>

      <FormGroup label="Description" htmlFor="description">
        <FormTextarea id="description" defaultValue={biz.description ?? ""} placeholder="Tell visitors about your business..." />
      </FormGroup>

      <FormRow>
        <FormGroup label="Category" htmlFor="category_id">
          <FormSelect
            id="category_id"
            defaultValue={biz.category_id ?? ""}
            placeholder="Select a category"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </FormGroup>

        <FormGroup label="Price Range" htmlFor="price_range">
          <FormSelect
            id="price_range"
            defaultValue={biz.price_range ?? ""}
            placeholder="Select price range"
            options={PRICE_OPTIONS}
          />
        </FormGroup>
      </FormRow>

      <SaveButton onClick={onSave} />
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Tab 2: Location & Hours                                    */
/* ---------------------------------------------------------- */

function LocationTab({
  biz,
  neighborhoodName,
  hours,
  onSave,
}: {
  biz: Partial<BusinessListing>;
  neighborhoodName: string | null;
  hours: BusinessHour[];
  onSave: () => void;
}) {
  // Build hours map by day name
  const hoursByDay: Record<string, BusinessHour> = {};
  for (const h of hours) {
    hoursByDay[h.day_of_week] = h;
  }

  return (
    <div className="max-w-[640px]">
      <FormGroup label="Street Address" htmlFor="street_address" required>
        <FormInput id="street_address" defaultValue={biz.street_address ?? ""} />
      </FormGroup>

      <FormRow>
        <FormGroup label="Suite / Unit" htmlFor="street_address_2">
          <FormInput id="street_address_2" defaultValue={biz.street_address_2 ?? ""} />
        </FormGroup>

        <FormGroup label="State" htmlFor="state">
          <FormInput id="state" defaultValue={biz.state ?? ""} />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup label="ZIP Code" htmlFor="zip_code">
          <FormInput id="zip_code" defaultValue={biz.zip_code ?? ""} />
        </FormGroup>

        <FormGroup label="Neighborhood" htmlFor="neighborhood">
          <FormInput
            id="neighborhood"
            defaultValue={neighborhoodName ?? ""}
            readOnly
            className="bg-[#f5f5f5] cursor-not-allowed"
          />
        </FormGroup>
      </FormRow>

      {/* Hours grid */}
      <div className="mt-6 mb-2">
        <h3 className="font-display text-[18px] font-semibold text-black mb-4">Business Hours</h3>
        <div className="border border-[#e5e5e5] divide-y divide-[#e5e5e5]">
          <div className="grid grid-cols-4 gap-2 px-4 py-2 bg-[#f5f5f5]">
            <span className="text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280]">Day</span>
            <span className="text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280]">Open</span>
            <span className="text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280]">Close</span>
            <span className="text-[10px] uppercase tracking-[0.05em] font-semibold text-[#6b7280]">Closed</span>
          </div>
          {DAYS.map((day) => {
            const h = hoursByDay[day];
            return (
              <div key={day} className="grid grid-cols-4 gap-2 px-4 py-2.5 items-center">
                <span className="text-[13px] font-body font-medium text-[#374151]">{day}</span>
                <input
                  type="time"
                  defaultValue={h?.open_time ?? ""}
                  className="text-[13px] font-body border border-[#e5e5e5] px-2 py-1.5"
                  disabled={h?.is_closed}
                />
                <input
                  type="time"
                  defaultValue={h?.close_time ?? ""}
                  className="text-[13px] font-body border border-[#e5e5e5] px-2 py-1.5"
                  disabled={h?.is_closed}
                />
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    defaultChecked={h?.is_closed ?? false}
                    className="h-4 w-4 accent-[#1a1a1a]"
                  />
                  <span className="text-[12px] text-[#6b7280]">Closed</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <SaveButton onClick={onSave} />
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Tab 3: Contact & Social                                    */
/* ---------------------------------------------------------- */

function ContactTab({
  biz,
  contacts,
  onSave,
}: {
  biz: Partial<BusinessListing>;
  contacts: BusinessContact[];
  onSave: () => void;
}) {
  return (
    <div className="max-w-[640px]">
      <FormRow>
        <FormGroup label="Phone" htmlFor="phone">
          <FormInput id="phone" type="tel" defaultValue={biz.phone ?? ""} />
        </FormGroup>
        <FormGroup label="Email" htmlFor="email">
          <FormInput id="email" type="email" defaultValue={biz.email ?? ""} />
        </FormGroup>
      </FormRow>

      <FormGroup label="Website" htmlFor="website">
        <FormInput id="website" type="url" defaultValue={biz.website ?? ""} />
      </FormGroup>

      <FormRow>
        <FormGroup label="Primary Link" htmlFor="primary_link">
          <FormInput id="primary_link" type="url" defaultValue={biz.primary_link ?? ""} />
        </FormGroup>
        <FormGroup label="Link Label" htmlFor="primary_link_label">
          <FormInput id="primary_link_label" defaultValue={biz.primary_link_label ?? ""} placeholder="e.g. Book Now" />
        </FormGroup>
      </FormRow>

      <FormGroup label="Order Online URL" htmlFor="order_online_url">
        <FormInput id="order_online_url" type="url" defaultValue={biz.order_online_url ?? ""} />
      </FormGroup>

      <h3 className="font-display text-[18px] font-semibold text-black mt-6 mb-4">Social Media</h3>

      <FormRow>
        <FormGroup label="Instagram" htmlFor="instagram">
          <FormInput id="instagram" defaultValue={biz.instagram ?? ""} placeholder="@handle" />
        </FormGroup>
        <FormGroup label="Facebook" htmlFor="facebook">
          <FormInput id="facebook" defaultValue={biz.facebook ?? ""} placeholder="URL or handle" />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup label="TikTok" htmlFor="tiktok">
          <FormInput id="tiktok" defaultValue={biz.tiktok ?? ""} placeholder="@handle" />
        </FormGroup>
        <FormGroup label="X / Twitter" htmlFor="x_twitter">
          <FormInput id="x_twitter" defaultValue={biz.x_twitter ?? ""} placeholder="@handle" />
        </FormGroup>
      </FormRow>

      {/* Contacts list */}
      {contacts.length > 0 && (
        <>
          <h3 className="font-display text-[18px] font-semibold text-black mt-6 mb-4">Business Contacts</h3>
          <div className="border border-[#e5e5e5] divide-y divide-[#e5e5e5]">
            {contacts.map((c) => (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-semibold text-black">{c.contact_name}</span>
                  {c.contact_title && (
                    <span className="text-[12px] text-[#6b7280] ml-2">{c.contact_title}</span>
                  )}
                  <div className="text-[12px] text-[#6b7280] mt-0.5">
                    {c.contact_email && <span>{c.contact_email}</span>}
                    {c.contact_email && c.contact_phone && <span className="mx-1.5">&middot;</span>}
                    {c.contact_phone && <span>{c.contact_phone}</span>}
                  </div>
                </div>
                {c.is_primary && (
                  <span className="inline-flex items-center rounded-full bg-[#fee198] px-2.5 py-0.5 text-[11px] font-semibold text-[#1a1a1a]">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <SaveButton onClick={onSave} />
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Tab 4: Photos & Media                                      */
/* ---------------------------------------------------------- */

function PhotosTab({
  biz,
  images,
  onSave,
}: {
  biz: Partial<BusinessListing>;
  images: BusinessImage[];
  onSave: () => void;
}) {
  return (
    <div className="max-w-[640px]">
      <h3 className="font-display text-[18px] font-semibold text-black mb-4">Logo</h3>
      {biz.logo ? (
        <div className="border border-[#e5e5e5] p-4 mb-4 flex items-center gap-4">
          <img src={biz.logo} alt="Business logo" className="w-16 h-16 object-contain" />
          <span className="text-[12px] text-[#6b7280]">Current logo</span>
        </div>
      ) : (
        <UploadZone
          onUpload={(files) => console.log("Logo upload", files)}
          accept="image/*"
          label="Upload your business logo"
          hint="PNG or JPG, recommended 400×400px"
        />
      )}

      <h3 className="font-display text-[18px] font-semibold text-black mt-6 mb-4">Photo Gallery</h3>
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {images.map((img) => (
            <div key={img.id} className="relative border border-[#e5e5e5] group">
              <img
                src={img.image_url}
                alt={img.alt_text ?? "Business photo"}
                className="w-full h-[120px] object-cover"
              />
              {img.is_primary && (
                <span className="absolute top-2 left-2 inline-flex items-center rounded-full bg-[#fee198] px-2 py-0.5 text-[10px] font-semibold text-[#1a1a1a]">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => console.log("Delete image", img.id)}
                className="absolute top-2 right-2 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete photo"
              >
                <Trash2 size={14} className="text-[#c1121f]" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-[#e5e5e5] p-8 text-center mb-4">
          <ImageIcon size={32} className="mx-auto mb-2 text-[#d1d5db]" />
          <p className="text-[13px] text-[#6b7280]">No photos uploaded yet</p>
        </div>
      )}

      <UploadZone
        onUpload={(files) => console.log("Photo upload", files)}
        accept="image/*"
        label="Add more photos"
        hint="PNG, JPG up to 5MB each"
      />

      <h3 className="font-display text-[18px] font-semibold text-black mt-6 mb-4">Video</h3>
      <FormGroup label="Video URL" htmlFor="video_url" hint="YouTube or Vimeo link">
        <FormInput id="video_url" type="url" defaultValue={biz.video_url ?? ""} />
      </FormGroup>

      <SaveButton onClick={onSave} />
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Tab 5: Tags & Identity                                     */
/* ---------------------------------------------------------- */

function TagsTab({
  biz,
  amenities,
  identityOptions,
  tags,
  onSave,
}: {
  biz: Partial<BusinessListing>;
  amenities: AmenityOption[];
  identityOptions: IdentityOption[];
  tags: TagOption[];
  onSave: () => void;
}) {
  // Group amenities by amenity_group
  const grouped: Record<string, AmenityOption[]> = {};
  for (const a of amenities) {
    const group = a.amenity_group ?? "Other";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(a);
  }

  return (
    <div className="max-w-[640px]">
      {/* Amenities */}
      <h3 className="font-display text-[18px] font-semibold text-black mb-4">Amenities</h3>
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.05em] font-semibold text-[#6b7280] mb-2">{group}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {items.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-[13px] font-body text-[#374151]">
                <input
                  type="checkbox"
                  defaultChecked={a.selected}
                  className="h-4 w-4 accent-[#1a1a1a]"
                />
                {a.name}
              </label>
            ))}
          </div>
        </div>
      ))}

      {amenities.length === 0 && (
        <p className="text-[13px] text-[#6b7280] mb-4">No amenities configured yet.</p>
      )}

      {/* Identity Options */}
      <h3 className="font-display text-[18px] font-semibold text-black mt-6 mb-4">Identity Options</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {identityOptions.map((io) => (
          <button
            key={io.id}
            type="button"
            onClick={() => console.log("Toggle identity", io.id)}
            className={[
              "inline-flex items-center px-4 py-2 rounded-full text-[12px] font-semibold transition-colors border",
              io.selected
                ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                : "bg-white text-[#374151] border-[#e5e5e5] hover:border-[#d1d5db]",
            ].join(" ")}
          >
            {io.name}
          </button>
        ))}
        {identityOptions.length === 0 && (
          <p className="text-[13px] text-[#6b7280]">No identity options configured yet.</p>
        )}
      </div>

      {/* Display identity toggle */}
      <label className="flex items-center gap-2 mb-6 mt-2">
        <input
          type="checkbox"
          defaultChecked={biz.display_identity_publicly ?? false}
          className="h-4 w-4 accent-[#1a1a1a]"
        />
        <span className="text-[13px] font-body text-[#374151]">Display identity publicly on listing</span>
      </label>

      {/* Tags */}
      <h3 className="font-display text-[18px] font-semibold text-black mt-6 mb-4">Tags</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => console.log("Toggle tag", t.id)}
            className={[
              "inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors border",
              t.selected
                ? "bg-[#fee198] text-[#1a1a1a] border-[#fee198]"
                : "bg-white text-[#6b7280] border-[#e5e5e5] hover:border-[#d1d5db]",
            ].join(" ")}
          >
            {t.name}
          </button>
        ))}
        {tags.length === 0 && (
          <p className="text-[13px] text-[#6b7280]">No tags available.</p>
        )}
      </div>

      <SaveButton onClick={onSave} />
    </div>
  );
}
