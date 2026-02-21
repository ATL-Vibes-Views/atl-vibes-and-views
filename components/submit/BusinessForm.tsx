"use client";

import { useEffect, useRef, useCallback } from "react";
import { NeighborhoodSelect } from "./NeighborhoodSelect";
import { ImagePicker } from "@/components/portal/ImagePicker";
import type {
  BusinessFormData,
  BusinessHoursEntry,
  BusinessContactEntry,
  Category,
  Amenity,
  IdentityOption,
  NeighborhoodGrouped,
  Tag,
} from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CERTIFICATIONS = [
  "8(a) Certification – SBA",
  "DBE – Disadvantaged Business Enterprise",
  "DOBE – Disability-Owned Business",
  "LGBTBE – LGBTQ+ Business Enterprise",
  "NMSDC Certified (Minority Business Enterprise)",
  "Veteran-Owned Certified",
  "WBENC Certified (Women's Business Enterprise)",
  "WOSB – Women-Owned Small Business",
  "Other (please specify)",
];

interface BusinessFormProps {
  data: BusinessFormData;
  onChange: (data: BusinessFormData) => void;
  categories: Category[];
  neighborhoods: NeighborhoodGrouped[];
  amenities: Amenity[];
  identityOptions: IdentityOption[];
  tier: string;
  submitterName: string;
  submitterEmail: string;
  onSubmitterNameChange: (v: string) => void;
  onSubmitterEmailChange: (v: string) => void;
  tags: Tag[];
}

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const TIME_OPTIONS = (() => {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hour = h % 12 || 12;
      const ampm = h < 12 ? "AM" : "PM";
      const label = `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
      const value = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      times.push(`${value}|${label}`);
    }
  }
  return times;
})();

const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-card-sm font-bold text-black mb-4 mt-8 first:mt-0">
      {children}
    </h3>
  );
}

function Label({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-gray-dark uppercase tracking-wide mb-1.5"
    >
      {children}
      {required && <span className="text-[#c1121f] ml-0.5">*</span>}
    </label>
  );
}

function Input({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  maxLength,
  prefix,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  prefix?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-mid text-sm">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors ${
          prefix ? "pl-8" : ""
        }`}
      />
    </div>
  );
}

export function BusinessForm({
  data,
  onChange,
  categories,
  neighborhoods,
  amenities,
  identityOptions,
  tier,
  submitterName,
  submitterEmail,
  onSubmitterNameChange,
  onSubmitterEmailChange,
  tags,
}: BusinessFormProps) {
  const streetAddressRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; });

  const update = <K extends keyof BusinessFormData>(
    key: K,
    val: BusinessFormData[K]
  ) => {
    onChange({ ...data, [key]: val });
  };

  /* ── Google Places autocomplete (3C + 3D) ── */
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey || typeof window === "undefined") return;

    const initAutocomplete = () => {
      if (!streetAddressRef.current || !(window as any).google?.maps?.places) return;
      if (autocompleteRef.current) return;
      const ac = new (window as any).google.maps.places.Autocomplete(
        streetAddressRef.current,
        { types: ["address"], componentRestrictions: { country: "us" } }
      );
      autocompleteRef.current = ac;
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place.address_components) return;
        let streetNumber = "", route = "", city = "", state = "", zip = "";
        const lat: number | null = place.geometry?.location?.lat() ?? null;
        const lng: number | null = place.geometry?.location?.lng() ?? null;
        for (const comp of place.address_components as any[]) {
          const t: string[] = comp.types;
          if (t.includes("street_number")) streetNumber = comp.long_name;
          if (t.includes("route")) route = comp.long_name;
          if (t.includes("locality")) city = comp.long_name;
          if (t.includes("administrative_area_level_1")) state = comp.short_name;
          if (t.includes("postal_code")) zip = comp.long_name;
        }
        const street = streetNumber && route ? `${streetNumber} ${route}` : (place.formatted_address ?? "");
        const locationFields = { street_address: street, city_text: city, state, zip_code: zip, latitude: lat, longitude: lng };
        onChange({ ...dataRef.current, ...locationFields });
        /* 3D: neighborhood lookup via Supabase RPC */
        if (lat !== null && lng !== null) {
          import("@/lib/supabase").then(({ createBrowserClient }) => {
            const sb = createBrowserClient() as any;
            sb.rpc("find_neighborhood_by_point", { p_lat: lat, p_lng: lng })
              .then(({ data: rows }: { data: any }) => {
                if (rows?.length) {
                  /* Use dataRef to avoid stale closure overwriting address fields */
                  onChange({ ...dataRef.current, ...locationFields, neighborhood_id: rows[0].id });
                }
              });
          }).catch(() => {});
        }
      });
    };

    if ((window as any).google?.maps?.places) {
      initAutocomplete();
    } else {
      const scriptId = "google-places-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = initAutocomplete;
        document.head.appendChild(script);
      } else {
        document.getElementById(scriptId)!.addEventListener("load", initAutocomplete);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateHour = (
    index: number,
    field: keyof BusinessHoursEntry,
    val: string | boolean
  ) => {
    const hours = [...data.hours];
    hours[index] = { ...hours[index], [field]: val };
    onChange({ ...data, hours });
  };

  const copyHoursToAll = () => {
    const first = data.hours[0];
    const hours = data.hours.map((h) => ({
      ...h,
      open_time: first.open_time,
      close_time: first.close_time,
      is_closed: first.is_closed,
    }));
    onChange({ ...data, hours });
  };

  const updateContact = (
    index: number,
    field: keyof BusinessContactEntry,
    val: string | boolean
  ) => {
    const contacts = [...data.contacts];
    contacts[index] = { ...contacts[index], [field]: val };
    onChange({ ...data, contacts });
  };

  const addContact = () => {
    if (data.contacts.length >= 3) return;
    onChange({
      ...data,
      contacts: [
        ...data.contacts,
        { contact_name: "", contact_title: "", contact_email: "", contact_phone: "", is_primary: false, is_public: false },
      ],
    });
  };

  const removeContact = (index: number) => {
    const contacts = data.contacts.filter((_: BusinessContactEntry, i: number) => i !== index);
    if (contacts.length > 0 && !contacts.some((c: BusinessContactEntry) => c.is_primary)) contacts[0].is_primary = true;
    onChange({ ...data, contacts });
  };

  /* Group amenities by amenity_group */
  const amenityGroups = amenities.reduce<Record<string, Amenity[]>>(
    (acc, a) => {
      const g = a.amenity_group || "Other";
      if (!acc[g]) acc[g] = [];
      acc[g].push(a);
      return acc;
    },
    {}
  );

  const showSpecialOffers = tier === "standard" || tier === "premium";

  return (
    <div className="space-y-2">
      {/* Section 1: Contact Info (who's submitting) */}
      <SectionHeading>Contact Info (who&rsquo;s submitting)</SectionHeading>
      <p className="text-xs text-gray-mid mb-4">
        This is your contact info — not displayed publicly on the listing.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="submitter_name" required>Your Name</Label>
          <input
            id="submitter_name"
            type="text"
            value={submitterName}
            onChange={(e) => onSubmitterNameChange(e.target.value)}
            placeholder="Your full name"
            required
            className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors"
          />
        </div>
        <div>
          <Label htmlFor="submitter_email" required>Your Email</Label>
          <input
            id="submitter_email"
            type="email"
            value={submitterEmail}
            onChange={(e) => onSubmitterEmailChange(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors"
          />
        </div>
      </div>
      <div className="mb-2">
        <label className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer">
          <input
            type="checkbox"
            checked={data.is_owner}
            onChange={(e) => update("is_owner", e.target.checked)}
            className="w-4 h-4 accent-[#c1121f]"
          />
          I am the business owner
        </label>
      </div>

      {/* Section 2: Business Basics */}
      <SectionHeading>Business Basics</SectionHeading>
      <div className="space-y-4">
        <div>
          <Label htmlFor="business_name" required>
            Business Name
          </Label>
          <Input
            id="business_name"
            value={data.business_name}
            onChange={(v) => update("business_name", v)}
            placeholder="e.g., Sweet Auburn Coffee"
            required
          />
        </div>
        <div>
          <Label htmlFor="category_id" required>
            Category
          </Label>
          <select
            id="category_id"
            value={data.category_id}
            onChange={(e) => update("category_id", e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors bg-white"
          >
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={data.tagline}
            onChange={(v) => update("tagline", v)}
            placeholder="Short description (120 chars max)"
            maxLength={120}
          />
          <p className="text-xs text-gray-mid mt-1">
            {data.tagline.length}/120 characters
          </p>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={data.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Tell us about your business…"
            maxLength={2000}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors resize-y"
          />
          <p className="text-xs text-gray-mid mt-1">
            {data.description.length}/2000 characters
          </p>
        </div>
        <div>
          <Label>Price Range</Label>
          <div className="flex gap-2">
            {PRICE_RANGES.map((pr) => (
              <button
                key={pr}
                type="button"
                onClick={() =>
                  update("price_range", data.price_range === pr ? "" : pr)
                }
                className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                  data.price_range === pr
                    ? "border-[#fee198] bg-[#fff8e6] text-[#1a1a1a] font-semibold"
                    : "border-gray-200 text-gray-dark hover:border-gray-400"
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Location */}
      <SectionHeading>Location</SectionHeading>
      <div className="space-y-4">
        <div>
          <Label htmlFor="street_address" required>Street Address</Label>
          <input
            id="street_address"
            ref={streetAddressRef}
            type="text"
            value={data.street_address}
            onChange={(e) => update("street_address", e.target.value)}
            placeholder="123 Peachtree St NE — start typing for suggestions"
            required
            className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors"
          />
        </div>
        <div>
          <Label htmlFor="street_address_2">Suite / Unit</Label>
          <Input
            id="street_address_2"
            value={data.street_address_2}
            onChange={(v) => update("street_address_2", v)}
            placeholder="Suite 100"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2 md:col-span-1">
            <Label htmlFor="city_text" required>City</Label>
            <input
              id="city_text"
              type="text"
              value={data.city_text}
              onChange={(e) => update("city_text", e.target.value)}
              placeholder="Atlanta"
              required
              className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors"
            />
          </div>
          <div>
            <Label htmlFor="state" required>
              State
            </Label>
            <Input
              id="state"
              value={data.state}
              onChange={(v) => update("state", v)}
              maxLength={2}
              required
            />
          </div>
          <div>
            <Label htmlFor="zip_code" required>
              ZIP Code
            </Label>
            <Input
              id="zip_code"
              value={data.zip_code}
              onChange={(v) => update("zip_code", v)}
              placeholder="30303"
              maxLength={5}
              required
            />
          </div>
        </div>
        <div>
          <Label required>Neighborhood</Label>
          <NeighborhoodSelect
            groups={neighborhoods}
            value={data.neighborhood_id}
            onChange={(v) => update("neighborhood_id", v)}
            required
          />
        </div>
      </div>

      {/* Section 4: Business Hours */}
      <SectionHeading>Business Hours</SectionHeading>
      <div className="space-y-2">
        {DAYS.map((day, i) => (
          <div key={day} className="flex items-center gap-2 flex-wrap">
            <span className="w-24 text-sm font-medium text-gray-dark shrink-0">
              {DAY_LABELS[day]}
            </span>
            <select
              value={data.hours[i].open_time}
              onChange={(e) => updateHour(i, "open_time", e.target.value)}
              disabled={data.hours[i].is_closed}
              className="px-2 py-2 border border-gray-200 text-sm outline-none focus:border-[#c1121f] disabled:opacity-40 bg-white"
            >
              <option value="">--</option>
              {TIME_OPTIONS.map((t) => {
                const [val, label] = t.split("|");
                return (
                  <option key={val} value={val}>
                    {label}
                  </option>
                );
              })}
            </select>
            <span className="text-gray-mid text-sm">—</span>
            <select
              value={data.hours[i].close_time}
              onChange={(e) => updateHour(i, "close_time", e.target.value)}
              disabled={data.hours[i].is_closed}
              className="px-2 py-2 border border-gray-200 text-sm outline-none focus:border-[#c1121f] disabled:opacity-40 bg-white"
            >
              <option value="">--</option>
              {TIME_OPTIONS.map((t) => {
                const [val, label] = t.split("|");
                return (
                  <option key={val} value={val}>
                    {label}
                  </option>
                );
              })}
            </select>
            <label className="flex items-center gap-1.5 text-sm text-gray-dark cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={data.hours[i].is_closed}
                onChange={(e) => updateHour(i, "is_closed", e.target.checked)}
                className="w-4 h-4 accent-[#c1121f]"
              />
              Closed
            </label>
          </div>
        ))}
        <button
          type="button"
          onClick={copyHoursToAll}
          className="text-xs text-[#c1121f] font-semibold hover:text-black transition-colors mt-2"
        >
          Copy first row to all days
        </button>
        <div className="mt-3">
          <Label htmlFor="hours_notes">Hours Notes</Label>
          <Input
            id="hours_notes"
            value={data.hours[0]?.notes ?? ""}
            onChange={(v) => {
              const hours = [...data.hours];
              hours[0] = { ...hours[0], notes: v };
              onChange({ ...data, hours });
            }}
            placeholder="e.g., Happy hour 4-6pm weekdays"
          />
        </div>
      </div>

      {/* Section 5: Additional Contacts */}
      <SectionHeading>Additional Contacts</SectionHeading>
      <p className="text-xs text-gray-mid mb-4">
        Is there anyone else you&rsquo;d like us to contact about this listing? (Optional)
      </p>
      <div className="space-y-6">
        {data.contacts.map((contact, i) => (
          <div key={i} className="border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-dark uppercase tracking-wide">
                Contact {i + 1}
                {contact.is_primary && " (Primary)"}
              </span>
              {data.contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact(i)}
                  className="text-xs text-gray-mid hover:text-[#c1121f] transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`contact_name_${i}`} required>
                  Name
                </Label>
                <Input
                  id={`contact_name_${i}`}
                  value={contact.contact_name}
                  onChange={(v) => updateContact(i, "contact_name", v)}
                  required
                />
              </div>
              <div>
                <Label htmlFor={`contact_title_${i}`}>Title</Label>
                <Input
                  id={`contact_title_${i}`}
                  value={contact.contact_title}
                  onChange={(v) => updateContact(i, "contact_title", v)}
                  placeholder="e.g., Owner, Manager"
                />
              </div>
              <div>
                <Label htmlFor={`contact_email_${i}`}>Email</Label>
                <Input
                  id={`contact_email_${i}`}
                  type="email"
                  value={contact.contact_email}
                  onChange={(v) => updateContact(i, "contact_email", v)}
                />
              </div>
              <div>
                <Label htmlFor={`contact_phone_${i}`}>Phone</Label>
                <Input
                  id={`contact_phone_${i}`}
                  type="tel"
                  value={contact.contact_phone}
                  onChange={(v) => updateContact(i, "contact_phone", v)}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer mt-3">
              <input
                type="checkbox"
                checked={contact.is_public}
                onChange={(e) =>
                  updateContact(i, "is_public", e.target.checked)
                }
                className="w-4 h-4 accent-[#c1121f]"
              />
              Display publicly on listing
            </label>
          </div>
        ))}
        {data.contacts.length < 3 && (
          <button
            type="button"
            onClick={addContact}
            className="text-sm text-[#c1121f] font-semibold hover:text-black transition-colors"
          >
            + Add Another Contact
          </button>
        )}
      </div>

      {/* Section 6: Contact & Links (public-facing) */}
      <SectionHeading>Contact &amp; Links</SectionHeading>
      <p className="text-xs text-gray-mid mb-4">
        Public contact information displayed on your listing.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(v) => update("phone", v)}
            placeholder="(404) 555-1234"
          />
        </div>
        <div>
          <Label htmlFor="email">Business Email</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(v) => update("email", v)}
            placeholder="hello@yourbusiness.com"
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={data.website}
            onChange={(v) => update("website", v)}
            placeholder="https://yourbusiness.com"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label htmlFor="primary_link">Primary CTA Link</Label>
          <Input
            id="primary_link"
            type="url"
            value={data.primary_link}
            onChange={(v) => update("primary_link", v)}
            placeholder="https://order.yourbusiness.com"
          />
        </div>
        <div>
          <Label htmlFor="primary_link_label">CTA Label</Label>
          <Input
            id="primary_link_label"
            value={data.primary_link_label}
            onChange={(v) => update("primary_link_label", v)}
            placeholder="e.g., Order Online, Book Now"
          />
        </div>
      </div>

      {/* Section 7: Social Media */}
      <SectionHeading>Social Media</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={data.instagram}
            onChange={(v) => update("instagram", v.replace(/^@/, ""))}
            placeholder="yourhandle"
            prefix="@"
          />
        </div>
        <div>
          <Label htmlFor="tiktok">TikTok</Label>
          <Input
            id="tiktok"
            value={data.tiktok}
            onChange={(v) => update("tiktok", v.replace(/^@/, ""))}
            placeholder="yourhandle"
            prefix="@"
          />
        </div>
        <div>
          <Label htmlFor="x_twitter">X / Twitter</Label>
          <Input
            id="x_twitter"
            value={data.x_twitter}
            onChange={(v) => update("x_twitter", v.replace(/^@/, ""))}
            placeholder="yourhandle"
            prefix="@"
          />
        </div>
        <div>
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            type="url"
            value={data.facebook}
            onChange={(v) => update("facebook", v)}
            placeholder="https://facebook.com/yourbusiness"
          />
        </div>
      </div>

      {/* Section 8: Logo & Photos & Video */}
      <SectionHeading>Logo, Photos &amp; Video</SectionHeading>

      <div className="space-y-4">
        <div>
          <Label>Logo</Label>
          <ImagePicker
            value={data.logo_url ?? ""}
            onChange={(url) => update("logo_url", url)}
            folder="submissions/logos"
            label="Upload your logo"
            hint="PNG, JPG up to 5MB"
          />
        </div>

        <div>
          <Label>Photos</Label>
          <p className="text-xs text-gray-mid mb-2">
            Photo uploads coming soon. Photos can be added after submission via
            the admin panel.
          </p>
          <p className="text-xs text-gray-mid">
            Up to 15 photos. JPG, PNG, WebP — max 10MB each.
          </p>
        </div>

        <div>
          <Label htmlFor="video_url">Video URL</Label>
          <Input
            id="video_url"
            type="url"
            value={data.video_url}
            onChange={(v) => update("video_url", v)}
            placeholder="Paste a YouTube or Vimeo link"
          />
        </div>
      </div>

      {/* Section 9: Amenities */}
      <SectionHeading>Amenities</SectionHeading>
      <p className="text-xs text-gray-mid mb-4">
        Select all that apply to your business.
      </p>
      {Object.entries(amenityGroups).map(([group, items]) => (
        <div key={group} className="mb-4">
          <p className="text-xs font-semibold text-gray-dark uppercase tracking-wide mb-2">
            {group}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {items.map((a) => (
              <label
                key={a.id}
                className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={data.amenity_ids.includes(a.id)}
                  onChange={(e) => {
                    const ids = e.target.checked
                      ? [...data.amenity_ids, a.id]
                      : data.amenity_ids.filter((id) => id !== a.id);
                    update("amenity_ids", ids);
                  }}
                  className="w-4 h-4 accent-[#c1121f]"
                />
                {a.name}
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Section 10: Business Identity (3G) */}
      <SectionHeading>Tell us about your business identity</SectionHeading>
      <p className="text-xs text-gray-mid mb-4">
        We love celebrating Atlanta&rsquo;s diverse business community. Select all that apply.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
        {identityOptions.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer"
          >
            <input
              type="checkbox"
              checked={data.identity_option_ids.includes(opt.id)}
              onChange={(e) => {
                const ids = e.target.checked
                  ? [...data.identity_option_ids, opt.id]
                  : data.identity_option_ids.filter((id) => id !== opt.id);
                update("identity_option_ids", ids);
              }}
              className="w-4 h-4 accent-[#c1121f]"
            />
            {opt.name}
          </label>
        ))}
      </div>

      <p className="text-sm font-semibold text-gray-dark mb-2">
        Would you like your business identity displayed in the public directory?
      </p>
      <div className="flex gap-6 mb-6">
        <label className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer">
          <input
            type="radio"
            name="display_identity_publicly"
            checked={data.display_identity_publicly === true}
            onChange={() => update("display_identity_publicly", true)}
            className="w-4 h-4 accent-[#c1121f]"
          />
          Yes
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer">
          <input
            type="radio"
            name="display_identity_publicly"
            checked={data.display_identity_publicly === false}
            onChange={() => update("display_identity_publicly", false)}
            className="w-4 h-4 accent-[#c1121f]"
          />
          No
        </label>
      </div>

      <p className="text-sm font-semibold text-gray-dark mb-2">
        Is your business officially certified under any diversity or ownership program?
      </p>
      <div className="flex gap-6 mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer">
          <input
            type="radio"
            name="certified_diversity_program"
            checked={data.certified_diversity_program === true}
            onChange={() => update("certified_diversity_program", true)}
            className="w-4 h-4 accent-[#c1121f]"
          />
          Yes
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer">
          <input
            type="radio"
            name="certified_diversity_program"
            checked={data.certified_diversity_program === false}
            onChange={() => update("certified_diversity_program", false)}
            className="w-4 h-4 accent-[#c1121f]"
          />
          No
        </label>
      </div>
      {data.certified_diversity_program && (
        <div className="pl-4 border-l-2 border-[#fee198] space-y-2 mb-4">
          {CERTIFICATIONS.map((cert) => (
            <label key={cert} className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer">
              <input
                type="checkbox"
                checked={data.certifications.includes(cert)}
                onChange={(e) => {
                  const certs = e.target.checked
                    ? [...data.certifications, cert]
                    : data.certifications.filter((c) => c !== cert);
                  update("certifications", certs);
                }}
                className="w-4 h-4 accent-[#c1121f]"
              />
              {cert}
            </label>
          ))}
        </div>
      )}

      {/* Section 11: Tags */}
      <SectionHeading>Tags</SectionHeading>
      <div>
        <Label>Tags (select up to 2)</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => {
            const selected = (data.tag_ids ?? []).includes(tag.id);
            const maxReached = (data.tag_ids ?? []).length >= 2;
            return (
              <button
                key={tag.id}
                type="button"
                disabled={!selected && maxReached}
                onClick={() => {
                  const current = data.tag_ids ?? [];
                  update("tag_ids", selected
                    ? current.filter((id) => id !== tag.id)
                    : [...current, tag.id]
                  );
                }}
                className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-colors ${
                  selected
                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                    : maxReached
                    ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-600 border-gray-300 hover:border-[#1a1a1a]"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 12: Special Offers (Standard + Premium) */}
      {showSpecialOffers && (
        <>
          <SectionHeading>Special Offers</SectionHeading>
          <textarea
            id="special_offers"
            value={data.special_offers}
            onChange={(e) => update("special_offers", e.target.value)}
            placeholder="Current promotions, discounts, or deals for ATL Vibes & Views visitors"
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors resize-y"
          />
          <p className="text-xs text-gray-mid mt-1">
            {data.special_offers.length}/500 characters
          </p>
        </>
      )}
    </div>
  );
}
