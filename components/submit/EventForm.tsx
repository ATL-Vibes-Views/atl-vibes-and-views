"use client";

import { NeighborhoodSelect } from "./NeighborhoodSelect";
import type {
  EventFormData,
  Category,
  NeighborhoodGrouped,
} from "@/lib/types";

interface EventFormProps {
  data: EventFormData;
  onChange: (data: EventFormData) => void;
  categories: Category[];
  neighborhoods: NeighborhoodGrouped[];
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

export function EventForm({
  data,
  onChange,
  categories,
  neighborhoods,
}: EventFormProps) {
  const update = <K extends keyof EventFormData>(
    key: K,
    val: EventFormData[K]
  ) => {
    onChange({ ...data, [key]: val });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-2">
      {/* Section 1: Contact Info */}
      <SectionHeading>Contact Info (who&rsquo;s submitting)</SectionHeading>
      <p className="text-xs text-gray-mid mb-4">
        Your contact info — not displayed publicly on the event listing.
      </p>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Input
            id="event_street_address"
            value={data.street_address}
            onChange={(v) => update("street_address", v)}
            placeholder="123 Peachtree St NE"
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
            <Label htmlFor="event_city">City</Label>
            <Input
              id="event_city"
              value={data.city}
              onChange={(v) => update("city", v)}
            />
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
          <NeighborhoodSelect
            groups={neighborhoods}
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
          <Label htmlFor="event_logo_url">Logo URL</Label>
          <Input
            id="event_logo_url"
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
          <Label htmlFor="featured_image_url">Featured Image URL</Label>
          <Input
            id="featured_image_url"
            type="url"
            value={data.featured_image_url}
            onChange={(v) => update("featured_image_url", v)}
            placeholder="https://… (JPG, PNG, WebP — max 10MB)"
          />
        </div>
        <div>
          <Label>Additional Photos</Label>
          <p className="text-xs text-gray-mid mb-2">
            Photo uploads coming soon. Photos can be added after submission via
            the admin panel.
          </p>
          <p className="text-xs text-gray-mid">
            Up to 15 photos. JPG, PNG, WebP — max 10MB each.
          </p>
        </div>
        <div>
          <Label htmlFor="event_video_url">Video URL</Label>
          <Input
            id="event_video_url"
            type="url"
            value={data.video_url}
            onChange={(v) => update("video_url", v)}
            placeholder="Paste a YouTube or Vimeo link"
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
