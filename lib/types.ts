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
      amenities: { Row: Amenity; Insert: Partial<Amenity>; Update: Partial<Amenity> };
      business_amenities: { Row: BusinessAmenity; Insert: Partial<BusinessAmenity>; Update: Partial<BusinessAmenity> };
      business_contacts: { Row: BusinessContact; Insert: Partial<BusinessContact>; Update: Partial<BusinessContact> };
      business_hours: { Row: BusinessHours; Insert: Partial<BusinessHours>; Update: Partial<BusinessHours> };
      business_identities: { Row: BusinessIdentity; Insert: Partial<BusinessIdentity>; Update: Partial<BusinessIdentity> };
      business_identity_options: { Row: IdentityOption; Insert: Partial<IdentityOption>; Update: Partial<IdentityOption> };
      business_images: { Row: BusinessImage; Insert: Partial<BusinessImage>; Update: Partial<BusinessImage> };
      business_tags: { Row: BusinessTag; Insert: Partial<BusinessTag>; Update: Partial<BusinessTag> };
      post_businesses: { Row: PostBusiness; Insert: Partial<PostBusiness>; Update: Partial<PostBusiness> };
      subscriptions: { Row: Subscription; Insert: Partial<Subscription>; Update: Partial<Subscription> };
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
      scripts: { Row: Script; Insert: Partial<Script>; Update: Partial<Script> };
      published_content: { Row: PublishedContent; Insert: Partial<PublishedContent>; Update: Partial<PublishedContent> };
      media_items: { Row: MediaItem; Insert: Partial<MediaItem>; Update: Partial<MediaItem> };
      newsletters: { Row: Newsletter; Insert: Partial<Newsletter>; Update: Partial<Newsletter> };
      submissions: { Row: Submission; Insert: Partial<Submission>; Update: Partial<Submission> };
      sponsors: { Row: Sponsor; Insert: Partial<Sponsor>; Update: Partial<Sponsor> };
      script_batches: { Row: ScriptBatch; Insert: Partial<ScriptBatch>; Update: Partial<ScriptBatch> };
      content_calendar: { Row: ContentCalendar; Insert: Partial<ContentCalendar>; Update: Partial<ContentCalendar> };
      pillars: { Row: Pillar; Insert: Partial<Pillar>; Update: Partial<Pillar> };
      event_images: { Row: EventImage; Insert: Partial<EventImage>; Update: Partial<EventImage> };
      event_tags: { Row: EventTag; Insert: Partial<EventTag>; Update: Partial<EventTag> };
      post_events: { Row: PostEvent; Insert: Partial<PostEvent>; Update: Partial<PostEvent> };
      post_neighborhoods: { Row: PostNeighborhood; Insert: Partial<PostNeighborhood>; Update: Partial<PostNeighborhood> };
      event_tier_pricing: { Row: EventTierPricing; Insert: Partial<EventTierPricing>; Update: Partial<EventTierPricing> };
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
  street_address: string;
  street_address_2?: string;
  city_id: string;
  state: string;
  zip_code: string;
  neighborhood_id: string;
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
  display_identity_publicly: boolean;
  certified_diversity_program: boolean;
  special_offers?: string;
  is_featured: boolean;
  featured_on_map: boolean;
  tier: string;
  previous_tier?: string;
  tier_start_date?: string;
  tier_expires_at?: string;
  grace_period_end?: string;
  tier_auto_downgraded: boolean;
  map_pin_style: string;
  parent_brand_id?: string;
  claimed: boolean;
  claimed_by?: string;
  claimed_at?: string;
  claim_status: string;
  claim_verification_method?: string;
  order_online_url?: string;
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
  is_featured: boolean;
  featured_on_map: boolean;
  tier: string;
  submitted_by?: string;
  status: string;
  created_at: string;
  updated_at: string;
  city_id: string;
  venue_business_id?: string;
  organizer_business_id?: string;
  listing_price_cents?: number;
  price_override_cents?: number;
  pricing_source?: string;
  is_comped: boolean;
  payment_status: string;
  stripe_payment_intent_id?: string;
  featured_until?: string;
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
  priority: string;
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
  ingested_at: string;
  created_at: string;
  updated_at: string;
  score?: number;
  tier?: string;
  neighborhood_id?: string;
  angle_summary?: string;
  expires_at?: string;
  banked_at?: string;
  reuse_eligible_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  is_active?: boolean;
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
  anchor_suggestions?: Record<string, unknown>;
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
  user_id: string;
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
  cities?: { name: string };
}

export interface EventItemWithNeighborhood extends EventItem {
  neighborhoods?: Neighborhood;
  categories?: Category;
  cities?: { name: string };
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
  thumbnail_url: string | null;
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

/* --- Published content tracking --- */

export interface PublishedContent {
  id: string;
  source_story_id?: string;
  post_id?: string;
  media_item_id?: string;
  platform: string;
  content_format: string;
  platform_post_id?: string;
  title?: string;
  published_url?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

/* --- Newsletter structured content tables --- */

export interface NewsletterSection {
  id: string;
  newsletter_id: string;
  section_name: string;
  section_blurb: string | null;
  section_image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface NewsletterPost {
  id: string;
  newsletter_id: string;
  post_id: string;
  section_id: string | null;
  position: number;
  created_at: string;
}

/* --- Submission types --- */

export interface Submission {
  id: string;
  submission_type: "business" | "event";
  submitted_by?: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone?: string;
  data: Record<string, unknown>;
  status: "pending" | "under_review" | "approved" | "rejected" | "needs_info";
  reviewer_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_record_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Amenity {
  id: string;
  name: string;
  slug: string;
  amenity_group?: string;
  sort_order: number;
  created_at: string;
}

export interface IdentityOption {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

/* --- Newsletter tables --- */

export interface Newsletter {
  id: string;
  name: string;
  slug: string;
  issue_date: string;
  issue_slug: string;
  subject_line: string;
  preview_text?: string;
  editor_intro?: string;
  html_body?: string;
  send_provider?: string;
  hubspot_email_id?: string;
  hubspot_stats_json?: Record<string, unknown>;
  sponsor_business_id?: string;
  ad_snapshot?: Record<string, unknown>;
  status: string;
  is_public?: boolean;
  open_rate?: number;
  click_rate?: number;
  send_count?: number;
  google_doc_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  newsletter_type_id: string;
}

export interface NewsletterType {
  id: string;
  name: string;
  slug: string;
  frequency: string;
  send_day?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

/* --- Ad system tables --- */

export interface AdCampaign {
  id: string;
  sponsor_id: string;
  name: string;
  start_date: string;
  end_date: string;
  budget?: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AdCreative {
  id: string;
  campaign_id: string;
  creative_type: string;
  headline?: string;
  body?: string;
  cta_text?: string;
  target_url: string;
  image_url?: string;
  media_asset_id?: string;
  alt_text?: string;
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdFlight {
  id: string;
  placement_id: string;
  campaign_id: string;
  creative_id: string;
  start_date: string;
  end_date: string;
  status: string;
  priority?: number;
  share_of_voice?: number;
  cap_impressions?: number;
  cap_clicks?: number;
  created_at: string;
  updated_at: string;
}

export interface AdPlacement {
  id: string;
  name: string;
  channel: string;
  placement_key: string;
  page_type?: string;
  dimensions?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

/* --- Business-related tables --- */

export interface Brand {
  id: string;
  brand_name: string;
  brand_logo?: string;
  brand_website?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessContact {
  id: string;
  business_id: string;
  contact_name: string;
  contact_title?: string;
  contact_email?: string;
  contact_phone?: string;
  is_primary: boolean;
  is_public: boolean;
  notes?: string;
  created_at: string;
}

export interface BusinessHours {
  id: string;
  business_id: string;
  day_of_week: string;
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
  notes?: string;
  created_at: string;
}

export interface BusinessImage {
  id: string;
  business_id: string;
  image_url: string;
  media_asset_id?: string;
  caption?: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Claim {
  id: string;
  business_id: string;
  user_id: string;
  claim_status: string;
  verification_method?: string;
  submitted_proof?: string;
  reviewer_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

/* --- Content pipeline tables --- */

export interface ContentCalendar {
  id: string;
  story_id?: string;
  post_id?: string;
  tier?: string;
  scheduled_date: string;
  status?: string;
  created_at?: string;
}

export interface ContentHistory {
  id: string;
  story_id: string;
  post_id?: string;
  tier?: string;
  angle_summary?: string;
  category_id?: string;
  neighborhood_id?: string;
  published_at?: string;
  created_at?: string;
}

export interface ContentPerformance {
  id: string;
  post_id: string;
  page_views?: number;
  unique_visitors?: number;
  shares?: number;
  clicks?: number;
  avg_time_on_page?: number;
  bounce_rate?: number;
  newsletter_opens?: number;
  newsletter_clicks?: number;
  measured_at?: string;
  created_at?: string;
}

/* --- Event-related tables --- */

export interface EventImage {
  id: string;
  event_id: string;
  image_url: string;
  media_asset_id?: string;
  caption?: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface EventMapPinRule {
  id: string;
  tier: string;
  pin_style: string;
  pin_color?: string;
  clickable: boolean;
  shows_preview: boolean;
  shows_photo: boolean;
  notes?: string;
  created_at: string;
}

export interface EventTierPricing {
  id: string;
  tier: string;
  default_price_cents: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventTierVisibilityRule {
  id: string;
  tier: string;
  field_name: string;
  visible: boolean;
  notes?: string;
  created_at: string;
  max_items?: number;
}

/* --- Content tables --- */

export interface HeadlineVariant {
  id: string;
  post_id: string;
  variant_number?: number;
  headline_text: string;
  is_selected?: boolean;
  performance_score?: number;
  created_at?: string;
}

export interface MapPinRule {
  id: string;
  tier: string;
  pin_style: string;
  pin_color?: string;
  clickable: boolean;
  shows_preview: boolean;
  shows_photo: boolean;
  notes?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  website?: string;
  description?: string;
  created_at: string;
}

export interface Pillar {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  media_asset_id?: string;
  caption?: string;
  alt_text?: string;
  credit?: string;
  image_role?: string;
  sort_order: number;
  created_at: string;
}

export interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  is_active: boolean;
  hit_count: number;
  notes?: string;
  created_at: string;
}

export interface SavedItem {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

export interface ScriptBatch {
  id: string;
  week_of: string;
  batch_name?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Script {
  id: string;
  script_batch_id?: string;
  story_id?: string;
  title: string;
  script_text?: string;
  platform?: string;
  format?: string;
  pillar_id?: string;
  neighborhood_id?: string;
  hashtags?: string;
  call_to_action?: string;
  status: string;
  scheduled_date?: string;
  posted_at?: string;
  post_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SeoContentCalendar {
  id: string;
  title_idea: string;
  token_name?: string;
  type?: string;
  category_id?: string;
  pillar_id?: string;
  neighborhood_id?: string;
  target_keywords?: string;
  seasonality?: string;
  best_publish_months?: unknown;
  status: string;
  post_id?: string;
  content_index_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Sponsor {
  id: string;
  business_id?: string;
  sponsor_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  campaign_name?: string;
  campaign_start?: string;
  campaign_end?: string;
  campaign_value?: number;
  placement?: unknown;
  talking_points?: string;
  content_index_id?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  package_type?: string;
  placements_total?: number;
  placements_used?: number;
  category_focus?: string;
  neighborhood_focus?: string;
  is_active?: boolean;
}

export interface Subscription {
  id: string;
  business_id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan: string;
  price_monthly?: number;
  billing_cycle?: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  grace_period_days?: number;
  downgrade_scheduled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TierChange {
  id: string;
  business_id: string;
  subscription_id?: string;
  change_type: string;
  from_tier: string;
  to_tier: string;
  reason?: string;
  triggered_by: string;
  admin_user_id?: string;
  notes?: string;
  created_at: string;
}

export interface TierVisibilityRule {
  id: string;
  tier: string;
  field_name: string;
  visible: boolean;
  notes?: string;
  created_at: string;
}

export interface TrendingTopic {
  id: string;
  keyword: string;
  mention_count?: number;
  first_seen?: string;
  last_seen?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  role: string;
  phone?: string;
  bio?: string;
  city_id?: string;
  neighborhood_id?: string;
  email_verified: boolean;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Watchlist {
  id: string;
  project_name: string;
  slug: string;
  location?: string;
  neighborhood_id?: string;
  city_id?: string;
  status: string;
  developer?: string;
  project_type?: unknown;
  units?: number;
  square_feet?: number;
  estimated_cost?: number;
  timeline?: string;
  description?: string;
  last_update?: string;
  next_milestone?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

/* --- Join / bridge tables --- */

export interface BusinessAmenity {
  id: string;
  business_id: string;
  amenity_id: string;
  created_at: string;
}

export interface BusinessIdentity {
  id: string;
  business_id: string;
  identity_option_id: string;
  created_at: string;
}

export interface BusinessOrganization {
  id: string;
  business_id: string;
  organization_id: string;
  membership_status?: string;
  created_at: string;
}

export interface BusinessTag {
  id: string;
  business_id: string;
  tag_id: string;
  created_at: string;
}

export interface EventTag {
  id: string;
  event_id: string;
  tag_id: string;
  created_at: string;
}

export interface PostBusiness {
  id: string;
  post_id: string;
  business_id: string;
  mention_type?: string;
  created_at: string;
}

export interface PostCategory {
  id: string;
  post_id: string;
  category_id: string;
  is_primary: boolean;
  created_at: string;
}

export interface PostEvent {
  id: string;
  post_id: string;
  event_id: string;
  mention_type?: string;
  created_at: string;
}

export interface PostNeighborhood {
  id: string;
  post_id: string;
  neighborhood_id: string;
  is_primary: boolean;
  created_at: string;
}

export interface PostSourceStory {
  id: string;
  post_id: string;
  story_id: string;
  created_at: string;
}

export interface PostSponsor {
  id: string;
  post_id: string;
  sponsor_id: string;
  tier?: string;
  published_at?: string;
  created_at?: string;
}

export interface PostTag {
  id: string;
  post_id: string;
  tag_id: string;
  created_at: string;
}

export interface StoryBusiness {
  id: string;
  story_id: string;
  business_id: string;
  created_at?: string;
}

export interface StoryNeighborhood {
  id: string;
  story_id: string;
  neighborhood_id: string;
  created_at: string;
  is_primary?: boolean;
}

export interface WatchlistPost {
  id: string;
  watchlist_id: string;
  post_id: string;
  created_at: string;
}

export interface WatchlistStory {
  id: string;
  watchlist_id: string;
  story_id: string;
  created_at: string;
}

/* --- UI helper types (not DB tables) --- */

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
  city_id: string;
  city_text: string;
  state: string;
  zip_code: string;
  neighborhood_id: string;
  latitude: number | null;
  longitude: number | null;
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
  certifications: string[];
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
  city_id: string;
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
