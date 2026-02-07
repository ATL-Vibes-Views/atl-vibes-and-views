/* ============================================================
   DATABASE TYPES — Matched to live Supabase schema
   Last synced: 2026-02-07
   ============================================================ */

export type Database = {
  public: {
    Tables: {
      areas: { Row: Area };
      neighborhoods: { Row: Neighborhood };
      blog_posts: { Row: BlogPost };
      authors: { Row: Author };
      business_listings: { Row: BusinessListing };
      events: { Row: EventItem };
      categories: { Row: Category };
      cities: { Row: City };
      stories: { Row: Story };
      tags: { Row: Tag };
      featured_slots: { Row: FeaturedSlot };
      content_index: { Row: ContentIndex };
      reviews: { Row: Review };
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
  target_id: string;
  active_url?: string;
  anchor_suggestions?: Record<string, unknown>;
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
