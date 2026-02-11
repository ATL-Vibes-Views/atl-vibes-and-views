"use client";

import { NeighborhoodSelect } from "./NeighborhoodSelect";
import type {
  BusinessFormData,
  BusinessHoursEntry,
  BusinessContactEntry,
  Category,
  City,
  Amenity,
  IdentityOption,
  NeighborhoodGrouped,
} from "@/lib/types";

interface BusinessFormProps {
  data: BusinessFormData;
  onChange: (data: BusinessFormData) => void;
  categories: Category[];
  neighborhoods: NeighborhoodGrouped[];
  amenities: Amenity[];
  identityOptions: IdentityOption[];
  cities: City[];
  tier: string;
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
  cities,
  tier,
}: BusinessFormProps) {
  const update = <K extends keyof BusinessFormData>(
    key: K,
    val: BusinessFormData[K]
  ) => {
    onChange({ ...data, [key]: val });
  };

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
        {
          contact_name: "",
          contact_title: "",
          contact_email: "",
          contact_phone: "",
          is_primary: false,
          is_public: false,
        },
      ],
    });
  };

  const removeContact = (index: number) => {
    const contacts = data.contacts.filter((_, i) => i !== index);
    if (contacts.length > 0 && !contacts.some((c) => c.is_primary)) {
      contacts[0].is_primary = true;
    }
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
      {/* Section 1: Contact Info */}
      <SectionHeading>Contact Info (who&rsquo;s submitting)</SectionHeading>
      <p className="text-xs text-gray-mid mb-4">
        This is your contact info — not displayed publicly on the listing.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="submitter_name" required>
            Your Name
          </Label>
          <Input
            id="submitter_name"
            value={data.is_owner ? "" : ""}
            onChange={() => {}}
            placeholder=""
          />
          {/* Submitter name/email are in parent state, not here */}
        </div>
      </div>
      <div className="mt-2">
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
                className={`px-4 py-2 text-sm border transition-colors ${
                  data.price_range === pr
                    ? "border-[#c1121f] bg-red-50 text-[#c1121f] font-semibold"
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
          <Label htmlFor="street_address" required>
            Street Address
          </Label>
          <Input
            id="street_address"
            value={data.street_address}
            onChange={(v) => update("street_address", v)}
            placeholder="123 Peachtree St NE"
            required
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
            <Label htmlFor="city_id" required>
              City
            </Label>
            <select
              id="city_id"
              value={data.city_id}
              onChange={(e) => update("city_id", e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors bg-white"
            >
              <option value="">Select a city…</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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

      {/* Section 5: Contact People */}
      <SectionHeading>Contact People</SectionHeading>
      <p className="text-xs text-gray-mid mb-4">
        Add up to 3 contact people for your business.
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
          <Label htmlFor="logo_url">Logo URL</Label>
          <Input
            id="logo_url"
            type="url"
            value={data.logo_url}
            onChange={(v) => update("logo_url", v)}
            placeholder="https://… (JPG, PNG, SVG, WebP — max 5MB)"
          />
          <p className="text-xs text-gray-mid mt-1">
            Image upload coming soon. For now, paste a direct image URL.
          </p>
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

      {/* Section 10: Business Identity */}
      <SectionHeading>Identify Your Business</SectionHeading>
      <p className="text-xs text-gray-mid mb-4">
        Select all that apply. This helps our community discover and support
        diverse businesses.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
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
      <label className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer">
        <input
          type="checkbox"
          checked={data.display_identity_publicly}
          onChange={(e) =>
            update("display_identity_publicly", e.target.checked)
          }
          className="w-4 h-4 accent-[#c1121f]"
        />
        Display identity badges publicly on my listing
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer mt-2">
        <input
          type="checkbox"
          checked={data.certified_diversity_program}
          onChange={(e) =>
            update("certified_diversity_program", e.target.checked)
          }
          className="w-4 h-4 accent-[#c1121f]"
        />
        This business is certified through a recognized diversity program
      </label>

      {/* Section 11: Special Offers (Standard + Premium) */}
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
