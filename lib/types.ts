/* ============================================================
   DATABASE TYPES — Matched to live Supabase schema
   Last synced: 2026-02-07
   ============================================================ */

export type Database = {
  public: {
    Tables: {
      areas: { Row: Area; Insert: Partial<Area>; Update: Partial<Area> };
      neighborhoods: { Row: Neighborhood; Insert: Partial<Neighborhood>; Update: Partial<Neighborhood> };
      blog_posts: { Row: BlogPost; Insert: Partial<BlogPost>; Update: Partial<BlogPost> };
      authors: { Row: Author; Insert: Partial<Author>; Update: Partial<Author> };
      business_listings: { Row: BusinessListing; Insert: Partial<BusinessListing>; Update: Partial<BusinessListing> };
      events: { Row: EventItem; Insert: Partial<EventItem>; Update: Partial<EventItem> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      cities: { Row: City; Insert: Partial<City>; Update: Partial<City> };
      stories: { Row: Story; Insert: Partial<Story>; Update: Partial<Story> };
      tags: { Row: Tag; Insert: Partial<Tag>; Update: Partial<Tag> };
      featured_slots: { Row: FeaturedSlot; Insert: Partial<FeaturedSlot>; Update: Partial<FeaturedSlot> };
      content_index: { Row: ContentIndex; Insert: Partial<ContentIndex>; Update: Partial<ContentIndex> };
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> };
    };
  };
};

/* --- Core content tables --- */

export interface Area {
  id: string;
  name: string;
  slug: string;
  city_id: string;
  description?: string;
  tagline?: string;
  hero_image_url?: string;
  map_center_lat?: number;
  map_center_lng?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  area_id: string;
  description?: string;
  tagline?: string;
  hero_image_url?: string;
  map_center_lat?: number;
  map_center_lng?: number;
  geojson_key?: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  token_name?: string;
  content_html?: string;
  content_md?: string;
  excerpt?: string;
  type?: string;
  pillar_id?: string;
  category_id?: string;
  neighborhood_id?: string;
  author_id?: string;
  is_sponsored: boolean;
  sponsor_business_id?: string;
  featured_image_url?: string;
  featured_image_source?: string;
  featured_image_credit?: string;
  featured_image_notes?: string;
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string;
  canonical_url?: string;
  word_count?: number;
  status: string;
  scheduled_publish_date?: string;
  published_at?: string;
  content_type?: string;
  content_source?: string;
  source_url?: string;
  google_doc_url?: string;
  tokens_used?: number;
  content_index_record_id?: string;
  is_featured: boolean;
  byline_override?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  role?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessListing {
  id: string;
  business_name: string;
  tagline?: string;
  description?: string;
  slug: string;
  street_address?: string;
  street_address_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  neighborhood_id?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  primary_link?: string;
  primary_link_label?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  x_twitter?: string;
  logo?: string;
  video_url?: string;
  category_id?: string;
  price_range?: string;
  display_identity_publicly?: boolean;
  certified_diversity_program?: boolean;
  special_offers?: string;
  is_featured: boolean;
  featured_on_map?: boolean;
  tier?: string;
  previous_tier?: string;
  tier_start_date?: string;
  tier_expires_at?: string;
  grace_period_end?: string;
  tier_auto_downgraded?: boolean;
  map_pin_style?: string;
  parent_brand_id?: string;
  claimed?: boolean;
  claimed_by?: string;
  claimed_at?: string;
  claim_status?: string;
  claim_verification_method?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  description?: string;
  event_type?: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  venue_name?: string;
  street_address?: string;
  street_address_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  neighborhood_id?: string;
  latitude?: number;
  longitude?: number;
  organizer_name?: string;
  organizer_url?: string;
  ticket_url?: string;
  ticket_price_min?: number;
  ticket_price_max?: number;
  is_free: boolean;
  category_id?: string;
  pillar_id?: string;
  featured_image_url?: string;
  website?: string;
  is_featured?: boolean;
  featured_on_map?: boolean;
  tier?: string;
  submitted_by?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  applies_to: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  description?: string;
  tagline?: string;
  hero_image_url?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  metro_area?: string;
  is_primary: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  headline: string;
  source_url?: string;
  source_name?: string;
  summary?: string;
  pillar_id?: string;
  city_id?: string;
  category_id?: string;
  priority?: string;
  image_url?: string;
  eligible_for_blog: boolean;
  eligible_for_script: boolean;
  assigned_blog: boolean;
  assigned_script: boolean;
  used_in_blog: boolean;
  used_in_script: boolean;
  used_in_blog_at?: string;
  used_in_script_at?: string;
  status: string;
  published_at?: string;
  ingested_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface FeaturedSlot {
  id: string;
  placement_key: string;
  entity_type: string;
  entity_id: string;
  label?: string;
  start_date?: string;
  end_date?: string;
  sort_order: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentIndex {
  id: string;
  token_name: string;
  target_type: string;
  target_id: string | null;
  active_url: string | null;
  page_title: string | null;
  page_intro: string | null;
  page_body: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  seo_title: string | null;
  meta_description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  user_id?: string;
  rating: number;
  title?: string;
  body?: string;
  visit_date?: string;
  photos?: Record<string, unknown>;
  status: string;
  moderation_notes?: string;
  moderated_by?: string;
  moderated_at?: string;
  rejection_reason?: string;
  is_verified_visit: boolean;
  helpful_count: number;
  reported_count: number;
  auto_flagged: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

/* --- Join / helper types for queries with embedded relations --- */

export interface BlogPostWithAuthor extends BlogPost {
  authors?: Author;
  categories?: Category;
}

export interface BusinessListingWithNeighborhood extends BusinessListing {
  neighborhoods?: Neighborhood;
  categories?: Category;
}

export interface EventItemWithNeighborhood extends EventItem {
  neighborhoods?: Neighborhood;
  categories?: Category;
}

export interface NeighborhoodWithArea extends Neighborhood {
  areas?: Area;
}

export interface BlogPostFull extends BlogPost {
  authors?: Author;
  categories?: Category;
  neighborhoods?: NeighborhoodWithArea;
}

/* --- Media tables --- */

export interface MediaItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  media_type: "video" | "audio" | "podcast" | "short";
  source_type: "embed" | "asset";
  embed_url: string | null;
  status: string;
  published_at: string | null;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  seo_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  alt_text: string | null;
  caption: string | null;
  source: string | null;
  credit: string | null;
  tags: Record<string, unknown> | null;
  uploaded_by: string | null;
  folder: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaItemAsset {
  id: string;
  media_item_id: string;
  asset_id: string;
  role: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MediaItemLink {
  id: string;
  media_item_id: string;
  target_type: string;
  target_id: string;
  is_primary_for_target: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/* --- Submission types --- */

export interface Submission {
  id: string;
  submission_type: "business" | "event";
  submitter_name: string;
  submitter_email: string;
  data: Record<string, unknown>;
  status: "pending" | "under_review" | "approved" | "rejected" | "needs_info";
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_record_id?: string;
}

export interface Amenity {
  id: string;
  name: string;
  amenity_group: string;
  sort_order?: number;
}

export interface IdentityOption {
  id: string;
  name: string;
  sort_order?: number;
}

export interface NeighborhoodGrouped {
  area_name: string;
  area_slug: string;
  neighborhoods: { id: string; name: string; slug: string }[];
}

/* Form data shapes stored in submissions.data JSONB */

export interface BusinessHoursEntry {
  day_of_week: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  notes: string;
}

export interface BusinessContactEntry {
  contact_name: string;
  contact_title: string;
  contact_email: string;
  contact_phone: string;
  is_primary: boolean;
  is_public: boolean;
}

export interface ImageEntry {
  image_url: string;
  caption: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}

export interface BusinessFormData {
  tier: string;
  business_name: string;
  category_id: string;
  tagline: string;
  description: string;
  price_range: string;
  street_address: string;
  street_address_2: string;
  city: string;
  state: string;
  zip_code: string;
  neighborhood_id: string;
  phone: string;
  email: string;
  website: string;
  primary_link: string;
  primary_link_label: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  x_twitter: string;
  logo_url: string;
  video_url: string;
  special_offers: string;
  is_owner: boolean;
  display_identity_publicly: boolean;
  certified_diversity_program: boolean;
  hours: BusinessHoursEntry[];
  contacts: BusinessContactEntry[];
  images: ImageEntry[];
  amenity_ids: string[];
  identity_option_ids: string[];
}

export interface EventFormData {
  tier: string;
  title: string;
  event_type: string;
  category_id: string;
  tagline: string;
  description: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule: string;
  venue_name: string;
  venue_business_id: string;
  street_address: string;
  street_address_2: string;
  city: string;
  state: string;
  zip_code: string;
  neighborhood_id: string;
  is_free: boolean;
  ticket_price_min: string;
  ticket_price_max: string;
  ticket_url: string;
  organizer_name: string;
  organizer_url: string;
  organizer_business_id: string;
  website: string;
  logo_url: string;
  featured_image_url: string;
  video_url: string;
  images: ImageEntry[];
}
