"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePicker } from "@/components/portal/ImagePicker";
import { uploadImage } from "@/lib/supabase-storage";
import type {
  EventFormData,
  Category,
  City,
  NeighborhoodGrouped,
  Tag,
} from "@/lib/types";

interface EventFormProps {
  data: EventFormData;
  onChange: (data: EventFormData) => void;
  categories: Category[];
  neighborhoods: NeighborhoodGrouped[];
  cities: City[];
  tags: Tag[];
  submitterName: string;
  submitterEmail: string;
  onSubmitterNameChange: (v: string) => void;
  onSubmitterEmailChange: (v: string) => void;
}

const EVENT_TYPES = [
  { value: "festival", label: "Festival" },
  { value: "concert", label: "Concert" },
  { value: "food_drink", label: "Food & Drink" },
  { value: "market", label: "Market" },
  { value: "community", label: "Community" },
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
  { value: "wellness", label: "Wellness" },
  { value: "nightlife", label: "Nightlife" },
  { value: "family", label: "Family" },
  { value: "pop_up", label: "Pop-Up" },
  { value: "networking", label: "Networking" },
  { value: "other", label: "Other" },
];

const RECURRENCE_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

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
  min,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  min?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      min={min}
      className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors"
    />
  );
}

function NeighborhoodField({
  neighborhoods,
  value,
  onChange,
}: {
  neighborhoods: NeighborhoodGrouped[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [overriding, setOverriding] = useState(false);
  const [search, setSearch] = useState("");

  const flat = neighborhoods.flatMap((g) =>
    g.neighborhoods.map((n) => ({ ...n, area: g.area_name }))
  );
  const selected = flat.find((n) => n.id === value);
  const filtered = search.trim()
    ? flat.filter((n) =>
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        n.area.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (!value && !overriding) {
    return (
      <p className="text-[13px] text-gray-400 italic">
        Auto-detected from address — enter a street address above.
      </p>
    );
  }

  if (!overriding) {
    return (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded text-[13px] text-[#166534] font-medium">
          ✓ {selected?.name ?? "Detected"}
          {selected?.area ? (
            <span className="text-[11px] text-[#4ade80] font-normal">· {selected.area}</span>
          ) : null}
        </span>
        <button
          type="button"
          onClick={() => { setOverriding(true); setSearch(""); }}
          className="text-[12px] text-[#6b7280] underline hover:text-[#1a1a1a] transition-colors"
        >
          Not right? Change it
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        autoFocus
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search neighborhoods…"
        className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors"
      />
      {search.trim() && (
        <div className="border border-gray-200 border-t-0 max-h-48 overflow-y-auto bg-white">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-gray-400">No results</p>
          ) : (
            filtered.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => { onChange(n.id); setOverriding(false); setSearch(""); }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-gray-dark hover:bg-[#fafafa] border-b border-gray-100 last:border-0"
              >
                {n.name}
                <span className="text-[11px] text-gray-400 ml-1.5">{n.area}</span>
              </button>
            ))
          )}
        </div>
      )}
      {value && !search.trim() && (
        <button
          type="button"
          onClick={() => setOverriding(false)}
          className="mt-1 text-[12px] text-[#6b7280] underline hover:text-[#1a1a1a] transition-colors"
        >
          ← Keep detected: {selected?.name}
        </button>
      )}
    </div>
  );
}

export function EventForm({
  data,
  onChange,
  categories,
  neighborhoods,
  cities,
  tags,
  submitterName,
  submitterEmail,
  onSubmitterNameChange,
  onSubmitterEmailChange,
}: EventFormProps) {
  const streetAddressRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; });

  const update = <K extends keyof EventFormData>(
    key: K,
    val: EventFormData[K]
  ) => {
    onChange({ ...data, [key]: val });
  };

  /* ── Google Places autocomplete ── */
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
        if (lat !== null && lng !== null) {
          import("@/lib/supabase").then(({ createBrowserClient }) => {
            const sb = createBrowserClient() as any;
            sb.rpc("find_neighborhood_by_point", { p_lat: lat, p_lng: lng })
              .then(({ data: rows }: { data: any }) => {
                if (rows?.length) {
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-2">
      {/* Section 1: Contact Info */}
      <SectionHeading>Contact Info (who&rsquo;s submitting)</SectionHeading>
      <p className="text-xs text-gray-mid mb-4">
        Your contact info — not displayed publicly on the event listing.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="submitter_name" required>Your Name</Label>
          <Input
            id="submitter_name"
            value={submitterName}
            onChange={onSubmitterNameChange}
            placeholder="Your full name"
            required
          />
        </div>
        <div>
          <Label htmlFor="submitter_email" required>Your Email</Label>
          <Input
            id="submitter_email"
            value={submitterEmail}
            onChange={onSubmitterEmailChange}
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      {/* Section 2: Event Basics */}
      <SectionHeading>Event Basics</SectionHeading>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" required>
            Event Title
          </Label>
          <Input
            id="title"
            value={data.title}
            onChange={(v) => update("title", v)}
            placeholder="e.g., Atlanta Food & Wine Festival 2026"
            required
          />
        </div>
        <div>
          <Label htmlFor="event_type">Event Type</Label>
          <select
            id="event_type"
            value={data.event_type}
            onChange={(e) => update("event_type", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors bg-white"
          >
            <option value="">Select a type…</option>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="event_category_id">Category</Label>
            <select
              id="event_category_id"
              value={data.category_id}
              onChange={(e) => update("category_id", e.target.value)}
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
            <Label>Tags (select up to 2)</Label>
            <select
              disabled={(data.tag_ids ?? []).length >= 2}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const current = data.tag_ids ?? [];
                if (current.includes(val) || current.length >= 2) return;
                update("tag_ids", [...current, val]);
                e.target.value = "";
              }}
              className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors bg-white"
            >
              <option value="">Select a tag…</option>
              {["activities","cuisine","drinks","experience","identity","news","vibe"].map((group) => (
                <optgroup key={group} label={group.charAt(0).toUpperCase() + group.slice(1)}>
                  {tags.filter(t => t.tag_group === group).map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="flex gap-2 mt-2 flex-wrap">
              {(data.tag_ids ?? []).map((id) => {
                const tag = tags.find(t => t.id === id);
                if (!tag) return null;
                return (
                  <span key={id} className="inline-flex items-center gap-1 px-3 py-1 bg-[#1a1a1a] text-white text-[12px] rounded-full">
                    {tag.name}
                    <button type="button" onClick={() => update("tag_ids", (data.tag_ids ?? []).filter(i => i !== id))}>×</button>
                  </span>
                );
              })}
            </div>
            {(data.tag_ids ?? []).length >= 2 && (
              <p className="text-[11px] text-gray-400 mt-1">Maximum 2 tags selected</p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="event_tagline">Tagline</Label>
          <Input
            id="event_tagline"
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
          <Label htmlFor="event_description">Description</Label>
          <textarea
            id="event_description"
            value={data.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Tell us about this event…"
            maxLength={2000}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors resize-y"
          />
          <p className="text-xs text-gray-mid mt-1">
            {data.description.length}/2000 characters
          </p>
        </div>
      </div>

      {/* Section 3: Date & Time */}
      <SectionHeading>Date &amp; Time</SectionHeading>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date" required>
              Start Date
            </Label>
            <Input
              id="start_date"
              type="date"
              value={data.start_date}
              onChange={(v) => update("start_date", v)}
              min={today}
              required
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={data.end_date}
              onChange={(v) => update("end_date", v)}
              min={data.start_date || today}
            />
          </div>
          <div>
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              type="time"
              value={data.start_time}
              onChange={(v) => update("start_time", v)}
            />
          </div>
          <div>
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              type="time"
              value={data.end_time}
              onChange={(v) => update("end_time", v)}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer">
          <input
            type="checkbox"
            checked={data.is_recurring}
            onChange={(e) => update("is_recurring", e.target.checked)}
            className="w-4 h-4 accent-[#c1121f]"
          />
          This is a recurring event
        </label>
        {data.is_recurring && (
          <div>
            <Label htmlFor="recurrence_rule">Recurrence Pattern</Label>
            <select
              id="recurrence_rule"
              value={data.recurrence_rule}
              onChange={(e) => update("recurrence_rule", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors bg-white"
            >
              <option value="">Select pattern…</option>
              {RECURRENCE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Section 4: Location */}
      <SectionHeading>Location</SectionHeading>
      <div className="space-y-4">
        <div>
          <Label htmlFor="venue_name">Venue Name</Label>
          <Input
            id="venue_name"
            value={data.venue_name}
            onChange={(v) => update("venue_name", v)}
            placeholder="e.g., Piedmont Park, The Fox Theatre"
          />
        </div>
        <div>
          <Label htmlFor="event_street_address">Street Address</Label>
          <input
            id="event_street_address"
            ref={streetAddressRef}
            type="text"
            value={data.street_address}
            onChange={(e) => update("street_address", e.target.value)}
            placeholder="123 Peachtree St NE"
            className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#c1121f] transition-colors"
          />
        </div>
        <div>
          <Label htmlFor="event_street_address_2">Suite / Unit</Label>
          <Input
            id="event_street_address_2"
            value={data.street_address_2}
            onChange={(v) => update("street_address_2", v)}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2 md:col-span-1">
            <Label htmlFor="event_city_id">City</Label>
            <select
              id="event_city_id"
              value={data.city_id}
              onChange={(e) => update("city_id", e.target.value)}
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
            <Label htmlFor="event_state">State</Label>
            <Input
              id="event_state"
              value={data.state}
              onChange={(v) => update("state", v)}
              maxLength={2}
            />
          </div>
          <div>
            <Label htmlFor="event_zip_code">ZIP Code</Label>
            <Input
              id="event_zip_code"
              value={data.zip_code}
              onChange={(v) => update("zip_code", v)}
              placeholder="30303"
              maxLength={5}
            />
          </div>
        </div>
        <div>
          <Label>Neighborhood</Label>
          <NeighborhoodField
            neighborhoods={neighborhoods}
            value={data.neighborhood_id}
            onChange={(v) => update("neighborhood_id", v)}
          />
        </div>
      </div>

      {/* Section 5: Tickets & Pricing */}
      <SectionHeading>Tickets &amp; Pricing</SectionHeading>
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm text-gray-dark cursor-pointer">
          <input
            type="checkbox"
            checked={data.is_free}
            onChange={(e) => update("is_free", e.target.checked)}
            className="w-4 h-4 accent-[#c1121f]"
          />
          This event is free
        </label>
        {!data.is_free && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticket_price_min">Ticket Price Min ($)</Label>
                <Input
                  id="ticket_price_min"
                  type="number"
                  value={data.ticket_price_min}
                  onChange={(v) => update("ticket_price_min", v)}
                  placeholder="0.00"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="ticket_price_max">
                  Ticket Price Max ($)
                </Label>
                <Input
                  id="ticket_price_max"
                  type="number"
                  value={data.ticket_price_max}
                  onChange={(v) => update("ticket_price_max", v)}
                  placeholder="0.00"
                  min="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ticket_url">Ticket URL</Label>
              <Input
                id="ticket_url"
                type="url"
                value={data.ticket_url}
                onChange={(v) => update("ticket_url", v)}
                placeholder="https://tickets.example.com"
              />
            </div>
          </>
        )}
      </div>

      {/* Section 6: Organizer */}
      <SectionHeading>Organizer</SectionHeading>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="organizer_name">Organizer Name</Label>
            <Input
              id="organizer_name"
              value={data.organizer_name}
              onChange={(v) => update("organizer_name", v)}
            />
          </div>
          <div>
            <Label htmlFor="organizer_url">Organizer Website</Label>
            <Input
              id="organizer_url"
              type="url"
              value={data.organizer_url}
              onChange={(v) => update("organizer_url", v)}
              placeholder="https://…"
            />
          </div>
        </div>
      </div>

      {/* Section 7: Logo & Photos & Video */}
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
          <Label>Featured Image</Label>
          <ImagePicker
            value={data.featured_image_url ?? ""}
            onChange={(url) => update("featured_image_url", url)}
            folder="submissions/images"
            label="Upload featured image"
            hint="JPG, PNG, WebP up to 10MB"
          />
        </div>
        <div>
          <Label>Additional Photos (up to 15)</Label>
          <p className="text-[12px] text-gray-400 mb-2">JPG, PNG, WebP — max 10MB each</p>
          {(data.photo_urls ?? []).length < 15 && (
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded cursor-pointer hover:border-[#1a1a1a] transition-colors">
              <span className="text-[13px] text-gray-400">Click to select photos (multiple allowed)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []);
                  const current = data.photo_urls ?? [];
                  const remaining = 15 - current.length;
                  const toUpload = files.slice(0, remaining);
                  const urls: string[] = [];
                  for (const file of toUpload) {
                    const result = await uploadImage(file, "submissions/photos");
                    if (!("error" in result)) urls.push(result.url);
                  }
                  update("photo_urls", [...current, ...urls]);
                  e.target.value = "";
                }}
              />
            </label>
          )}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(data.photo_urls ?? []).map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="w-full h-24 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => update("photo_urls", (data.photo_urls ?? []).filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-[11px] flex items-center justify-center"
                >×</button>
              </div>
            ))}
          </div>
          {(data.photo_urls ?? []).length >= 15 && (
            <p className="text-[11px] text-gray-400 mt-1">Maximum 15 photos reached</p>
          )}
        </div>
        <div>
          <Label>Video</Label>
          <ImagePicker
            value={data.video_url ?? ""}
            onChange={(url) => update("video_url", url)}
            folder="submissions/videos"
            label="Upload a video"
            hint="MP4, MOV up to 50MB"
          />
        </div>
      </div>

      {/* Section 8: Links */}
      <SectionHeading>Links</SectionHeading>
      <div>
        <Label htmlFor="event_website">Event Website</Label>
        <Input
          id="event_website"
          type="url"
          value={data.website}
          onChange={(v) => update("website", v)}
          placeholder="https://…"
        />
      </div>
    </div>
  );
}
