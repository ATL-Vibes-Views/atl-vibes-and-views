# SUPABASE REAL SCHEMA — Exported Feb 15, 2026
# 79 tables — THIS IS THE ONLY SOURCE OF TRUTH
# Do NOT use lib/types.ts as schema reference.

---

## SECTION 1: ALL TABLES AND COLUMNS

```sql
CREATE TABLE public.ad_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sponsor_id uuid NOT NULL,
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    budget numeric,
    status text DEFAULT 'draft'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ad_campaigns_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'paused'::text, 'completed'::text])))
);
```

```sql
CREATE TABLE public.ad_creatives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    creative_type text NOT NULL,
    headline character varying(100),
    body character varying(300),
    cta_text character varying(50),
    target_url text NOT NULL,
    image_url text,
    media_asset_id uuid,
    alt_text text,
    utm_campaign text,
    utm_source text,
    utm_medium text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ad_creatives_creative_type_check CHECK ((creative_type = ANY (ARRAY['image'::text, 'html'::text, 'native'::text])))
);
```

```sql
CREATE TABLE public.ad_flights (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    placement_id uuid NOT NULL,
    campaign_id uuid NOT NULL,
    creative_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    priority integer DEFAULT 0,
    share_of_voice integer DEFAULT 100,
    cap_impressions integer,
    cap_clicks integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    area_id uuid,
    neighborhood_id uuid,
    category_id uuid,
    CONSTRAINT ad_flights_share_of_voice_check CHECK (((share_of_voice >= 0) AND (share_of_voice <= 100))),
    CONSTRAINT ad_flights_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'active'::text, 'paused'::text, 'ended'::text])))
);
```

```sql
CREATE TABLE public.ad_placements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    channel text NOT NULL,
    placement_key text NOT NULL,
    page_type text,
    dimensions text,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ad_placements_channel_check CHECK ((channel = ANY (ARRAY['web'::text, 'newsletter'::text]))),
    CONSTRAINT ad_placements_page_type_check CHECK (((page_type IS NULL) OR (page_type = ANY (ARRAY['home'::text, 'blog'::text, 'neighborhood'::text, 'events'::text, 'directory'::text, 'newsletter'::text, 'all'::text]))))
);
```

```sql
CREATE TABLE public.amenities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    amenity_group text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.areas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    city_id uuid NOT NULL,
    description text,
    tagline text,
    hero_image_url text,
    map_center_lat numeric,
    map_center_lng numeric,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.authors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    bio text,
    avatar_url text,
    email text,
    website text,
    instagram text,
    twitter text,
    role text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT authors_role_check CHECK (((role IS NULL) OR (role = ANY (ARRAY['editor'::text, 'staff_writer'::text, 'guest_contributor'::text, 'sponsored'::text]))))
);
```

```sql
CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    token_name text,
    content_html text,
    content_md text,
    excerpt text,
    type text,
    pillar_id uuid,
    category_id uuid,
    neighborhood_id uuid,
    author_id uuid,
    is_sponsored boolean DEFAULT false NOT NULL,
    sponsor_business_id uuid,
    featured_image_url text,
    featured_image_source text,
    featured_image_credit text,
    featured_image_notes text,
    meta_title text,
    meta_description text,
    seo_keywords text,
    canonical_url text,
    word_count integer,
    status text DEFAULT 'draft'::text NOT NULL,
    scheduled_publish_date timestamp with time zone,
    published_at timestamp with time zone,
    content_source text,
    source_url text,
    google_doc_url text,
    tokens_used integer,
    content_index_record_id uuid,
    is_featured boolean DEFAULT false NOT NULL,
    byline_override text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    content_type text,
    CONSTRAINT blog_posts_content_source_check CHECK (((content_source IS NULL) OR (content_source = ANY (ARRAY['automation_pipeline'::text, 'manual'::text, 'guest_submission'::text])))),
    CONSTRAINT blog_posts_content_type_check CHECK ((content_type = ANY (ARRAY['news'::text, 'guide'::text]))),
    CONSTRAINT blog_posts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'ready_for_review'::text, 'scheduled'::text, 'published'::text, 'archived'::text]))),
    CONSTRAINT blog_posts_type_check CHECK (((type IS NULL) OR (type = ANY (ARRAY['news'::text, 'roundup'::text, 'evergreen_seo'::text, 'sponsor_feature'::text, 'neighborhood_guide'::text]))))
);
```

```sql
CREATE TABLE public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_name text NOT NULL,
    brand_logo text,
    brand_website text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.business_amenities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    amenity_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.business_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    contact_name text NOT NULL,
    contact_title text,
    contact_email text,
    contact_phone text,
    is_primary boolean DEFAULT false NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.business_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    day_of_week text NOT NULL,
    open_time time without time zone,
    close_time time without time zone,
    is_closed boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT business_hours_day_of_week_check CHECK ((day_of_week = ANY (ARRAY['monday'::text, 'tuesday'::text, 'wednesday'::text, 'thursday'::text, 'friday'::text, 'saturday'::text, 'sunday'::text])))
);
```

```sql
CREATE TABLE public.business_identities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    identity_option_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.business_identity_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.business_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    image_url text NOT NULL,
    media_asset_id uuid,
    caption text,
    alt_text text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.business_listings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_name text NOT NULL,
    tagline character varying(80),
    description character varying(1500),
    slug text NOT NULL,
    street_address text NOT NULL,
    street_address_2 text,
    state text NOT NULL,
    zip_code text NOT NULL,
    neighborhood_id uuid NOT NULL,
    latitude numeric,
    longitude numeric,
    phone text,
    email text,
    website text,
    primary_link text,
    primary_link_label text,
    instagram text,
    facebook text,
    tiktok text,
    x_twitter text,
    logo text,
    video_url text,
    category_id uuid,
    price_range text,
    display_identity_publicly boolean DEFAULT false NOT NULL,
    certified_diversity_program boolean DEFAULT false NOT NULL,
    special_offers text,
    is_featured boolean DEFAULT false NOT NULL,
    featured_on_map boolean DEFAULT false NOT NULL,
    tier text DEFAULT 'Free'::text NOT NULL,
    previous_tier text,
    tier_start_date date,
    tier_expires_at date,
    grace_period_end date,
    tier_auto_downgraded boolean DEFAULT false NOT NULL,
    map_pin_style text DEFAULT 'gray'::text NOT NULL,
    parent_brand_id uuid,
    claimed boolean DEFAULT false NOT NULL,
    claimed_by uuid,
    claimed_at timestamp with time zone,
    claim_status text DEFAULT 'unclaimed'::text NOT NULL,
    claim_verification_method text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    city_id uuid NOT NULL,
    order_online_url text,
    is_founding_member boolean DEFAULT false,
    CONSTRAINT business_listings_claim_status_check CHECK ((claim_status = ANY (ARRAY['unclaimed'::text, 'pending_verification'::text, 'verified'::text, 'rejected'::text]))),
    CONSTRAINT business_listings_claim_verification_method_check CHECK (((claim_verification_method IS NULL) OR (claim_verification_method = ANY (ARRAY['email_match'::text, 'manual_review'::text])))),
    CONSTRAINT business_listings_map_pin_style_check CHECK ((map_pin_style = ANY (ARRAY['gray'::text, 'standard'::text, 'premium'::text]))),
    CONSTRAINT business_listings_previous_tier_check CHECK (((previous_tier IS NULL) OR (previous_tier = ANY (ARRAY['Free'::text, 'Standard'::text, 'Premium'::text])))),
    CONSTRAINT business_listings_price_range_check CHECK (((price_range IS NULL) OR (price_range = ANY (ARRAY['$'::text, '$$'::text, '$$$'::text, '$$$$'::text])))),
    CONSTRAINT business_listings_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'pending_review'::text, 'active'::text, 'suspended'::text, 'expired'::text]))),
    CONSTRAINT business_listings_tier_check CHECK ((tier = ANY (ARRAY['Free'::text, 'Standard'::text, 'Premium'::text])))
);
```

```sql
CREATE TABLE public.business_organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    membership_status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT business_organizations_membership_status_check CHECK (((membership_status IS NULL) OR (membership_status = ANY (ARRAY['active'::text, 'pending'::text, 'expired'::text]))))
);
```

```sql
CREATE TABLE public.business_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    applies_to text[] DEFAULT ARRAY[]::text[] NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.cities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    state text NOT NULL,
    description text,
    tagline text,
    hero_image_url text,
    logo_url text,
    latitude numeric,
    longitude numeric,
    population integer,
    metro_area text,
    is_primary boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.claims (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    user_id uuid NOT NULL,
    claim_status text DEFAULT 'pending'::text NOT NULL,
    verification_method text,
    submitted_proof text,
    reviewer_notes text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT claims_claim_status_check CHECK ((claim_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'expired'::text]))),
    CONSTRAINT claims_verification_method_check CHECK (((verification_method IS NULL) OR (verification_method = ANY (ARRAY['email_match'::text, 'manual_review'::text, 'document_upload'::text]))))
);
```

```sql
CREATE TABLE public.content_calendar (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid,
    post_id uuid,
    tier text,
    scheduled_date date NOT NULL,
    status text DEFAULT 'scheduled'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_calendar_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'published'::text, 'expired'::text]))),
    CONSTRAINT content_calendar_tier_check CHECK ((tier = ANY (ARRAY['script'::text, 'blog'::text, 'social'::text])))
);
```

```sql
CREATE TABLE public.content_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid NOT NULL,
    post_id uuid,
    tier text,
    angle_summary text,
    category_id uuid,
    neighborhood_id uuid,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_history_tier_check CHECK ((tier = ANY (ARRAY['script'::text, 'blog'::text, 'social'::text])))
);
```

```sql
CREATE TABLE public.content_index (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token_name text NOT NULL,
    target_type text NOT NULL,
    target_id uuid,
    active_url text,
    anchor_suggestions jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    page_title text,
    page_intro text,
    page_body text,
    hero_image_url text,
    hero_video_url text,
    seo_title text,
    meta_description text,
    CONSTRAINT content_index_target_type_check CHECK ((target_type = ANY (ARRAY['neighborhood'::text, 'city'::text, 'area'::text, 'business'::text, 'event'::text, 'blog_post'::text, 'pillar_page'::text, 'external'::text])))
);
```

```sql
CREATE TABLE public.content_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    published_content_id uuid NOT NULL,
    impressions integer DEFAULT 0,
    reach integer DEFAULT 0,
    interactions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    shares integer DEFAULT 0,
    saves integer DEFAULT 0,
    video_views integer,
    avg_watch_time_seconds integer,
    watch_time_total_seconds integer,
    audience_retention_pct numeric,
    watched_full_pct numeric,
    page_views integer,
    unique_visitors integer,
    avg_time_on_page_seconds integer,
    bounce_rate numeric,
    newsletter_opens integer,
    newsletter_clicks integer,
    newsletter_open_rate numeric,
    newsletter_click_rate numeric,
    follower_delta integer,
    profile_visits integer,
    analytics_source text NOT NULL,
    measured_at timestamp with time zone NOT NULL,
    period_start timestamp with time zone,
    period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_performance_analytics_source_check CHECK ((analytics_source = ANY (ARRAY['meta_api'::text, 'youtube_api'::text, 'tiktok_api'::text, 'linkedin_api'::text, 'x_api'::text, 'hubspot_api'::text])))
);
```

```sql
CREATE TABLE public.event_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    image_url text NOT NULL,
    media_asset_id uuid,
    caption text,
    alt_text text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.event_map_pin_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tier text NOT NULL,
    pin_style text NOT NULL,
    pin_color text,
    clickable boolean DEFAULT true NOT NULL,
    shows_preview boolean DEFAULT false NOT NULL,
    shows_photo boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_map_pin_rules_tier_check CHECK ((tier = ANY (ARRAY['Free'::text, 'Standard'::text, 'Premium'::text])))
);
```

```sql
CREATE TABLE public.event_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.event_tier_pricing (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tier text NOT NULL,
    default_price_cents integer DEFAULT 0 NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_tier_pricing_tier_check CHECK ((tier = ANY (ARRAY['Free'::text, 'Standard'::text, 'Premium'::text])))
);
```

```sql
CREATE TABLE public.event_tier_visibility_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tier text NOT NULL,
    field_name text NOT NULL,
    visible boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    max_items integer,
    CONSTRAINT event_tier_visibility_rules_tier_check CHECK ((tier = ANY (ARRAY['Free'::text, 'Standard'::text, 'Premium'::text])))
);
```

```sql
CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    tagline character varying(80),
    description character varying(3000),
    event_type text,
    start_date date NOT NULL,
    start_time time without time zone,
    end_date date,
    end_time time without time zone,
    is_recurring boolean DEFAULT false NOT NULL,
    recurrence_rule text,
    venue_name text,
    street_address text,
    street_address_2 text,
    state text,
    zip_code text,
    neighborhood_id uuid,
    latitude numeric,
    longitude numeric,
    organizer_name text,
    organizer_url text,
    ticket_url text,
    ticket_price_min numeric,
    ticket_price_max numeric,
    is_free boolean DEFAULT false NOT NULL,
    category_id uuid,
    pillar_id uuid,
    featured_image_url text,
    website text,
    is_featured boolean DEFAULT false NOT NULL,
    featured_on_map boolean DEFAULT false NOT NULL,
    tier text DEFAULT 'Free'::text NOT NULL,
    submitted_by uuid,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    venue_business_id uuid,
    organizer_business_id uuid,
    listing_price_cents integer,
    price_override_cents integer,
    pricing_source text,
    is_comped boolean DEFAULT false NOT NULL,
    payment_status text DEFAULT 'unpaid'::text NOT NULL,
    stripe_payment_intent_id text,
    featured_until timestamp with time zone,
    city_id uuid NOT NULL,
    CONSTRAINT events_event_type_check CHECK (((event_type IS NULL) OR (event_type = ANY (ARRAY['festival'::text, 'concert'::text, 'food_drink'::text, 'market'::text, 'community'::text, 'sports'::text, 'arts'::text, 'wellness'::text, 'nightlife'::text, 'family'::text, 'pop_up'::text, 'networking'::text, 'other'::text])))),
    CONSTRAINT events_payment_status_check CHECK ((payment_status = ANY (ARRAY['unpaid'::text, 'paid'::text, 'invoiced'::text, 'comped'::text]))),
    CONSTRAINT events_pricing_source_check CHECK (((pricing_source IS NULL) OR (pricing_source = ANY (ARRAY['default'::text, 'override'::text, 'package'::text, 'comped'::text])))),
    CONSTRAINT events_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'pending_review'::text, 'active'::text, 'canceled'::text, 'completed'::text, 'expired'::text]))),
    CONSTRAINT events_tier_check CHECK ((tier = ANY (ARRAY['Free'::text, 'Standard'::text, 'Premium'::text])))
);
```

```sql
CREATE TABLE public.featured_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    placement_key text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    label text,
    start_date date,
    end_date date,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT featured_slots_entity_type_check CHECK ((entity_type = ANY (ARRAY['business'::text, 'event'::text, 'blog_post'::text, 'neighborhood'::text, 'area'::text])))
);
```

```sql
CREATE TABLE public.headline_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    variant_number integer,
    headline_text text NOT NULL,
    is_selected boolean DEFAULT false,
    performance_score integer,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT headline_variants_variant_number_check CHECK ((variant_number = ANY (ARRAY[1, 2, 3])))
);
```

```sql
CREATE TABLE public.map_pin_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tier text NOT NULL,
    pin_style text NOT NULL,
    pin_color text,
    clickable boolean DEFAULT true NOT NULL,
    shows_preview boolean DEFAULT false NOT NULL,
    shows_photo boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT map_pin_rules_tier_check CHECK ((tier = ANY (ARRAY['Free'::text, 'Standard'::text, 'Premium'::text])))
);
```

```sql
CREATE TABLE public.media_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    file_url text NOT NULL,
    file_name text NOT NULL,
    file_type text NOT NULL,
    mime_type text,
    file_size integer,
    width integer,
    height integer,
    duration_seconds integer,
    alt_text text,
    caption text,
    source text,
    credit text,
    tags jsonb,
    uploaded_by uuid,
    folder text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT media_assets_file_type_check CHECK ((file_type = ANY (ARRAY['image'::text, 'video'::text, 'document'::text, 'other'::text]))),
    CONSTRAINT media_assets_source_check CHECK (((source IS NULL) OR (source = ANY (ARRAY['original'::text, 'stock'::text, 'ai_generated'::text, 'auto_scraped'::text, 'user_uploaded'::text]))))
);
```

```sql
CREATE TABLE public.media_item_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    media_item_id uuid NOT NULL,
    asset_id uuid NOT NULL,
    role text DEFAULT 'primary'::text NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT media_item_assets_role_check CHECK ((role = ANY (ARRAY['primary'::text, 'thumbnail'::text, 'gallery'::text, 'transcript'::text, 'other'::text])))
);
```

```sql
CREATE TABLE public.media_item_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    media_item_id uuid NOT NULL,
    target_type text NOT NULL,
    target_id uuid NOT NULL,
    is_primary_for_target boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT media_item_links_target_type_check CHECK ((target_type = ANY (ARRAY['city'::text, 'area'::text, 'neighborhood'::text, 'business'::text, 'event'::text, 'blog_post'::text, 'pillar_page'::text, 'external'::text, 'homepage'::text])))
);
```

```sql
CREATE TABLE public.media_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    description text,
    media_type text DEFAULT 'video'::text NOT NULL,
    source_type text DEFAULT 'embed'::text NOT NULL,
    embed_url text,
    status text DEFAULT 'draft'::text NOT NULL,
    published_at timestamp with time zone,
    is_featured boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    seo_title text,
    meta_description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    thumbnail_url text,
    CONSTRAINT media_items_media_type_check CHECK ((media_type = ANY (ARRAY['video'::text, 'audio'::text, 'podcast'::text, 'short'::text]))),
    CONSTRAINT media_items_source_check CHECK ((((source_type = 'embed'::text) AND (embed_url IS NOT NULL)) OR (source_type = 'asset'::text))),
    CONSTRAINT media_items_source_type_check CHECK ((source_type = ANY (ARRAY['embed'::text, 'asset'::text]))),
    CONSTRAINT media_items_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'published'::text, 'archived'::text])))
);
```

```sql
CREATE TABLE public.neighborhoods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    area_id uuid NOT NULL,
    description text,
    tagline text,
    hero_image_url text,
    map_center_lat numeric,
    map_center_lng numeric,
    geojson_key text,
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.newsletter_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    newsletter_id uuid NOT NULL,
    post_id uuid NOT NULL,
    section_id uuid,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.newsletter_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    newsletter_id uuid NOT NULL,
    section_name text NOT NULL,
    section_blurb text,
    section_image_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.newsletter_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    frequency text NOT NULL,
    send_day text,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.newsletters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    issue_date date NOT NULL,
    issue_slug text NOT NULL,
    subject_line character varying(200) NOT NULL,
    preview_text character varying(150),
    editor_intro character varying(1500),
    html_body text,
    send_provider text DEFAULT 'hubspot'::text,
    hubspot_email_id text,
    hubspot_stats_json jsonb,
    sponsor_business_id uuid,
    ad_snapshot jsonb,
    status text DEFAULT 'planning'::text NOT NULL,
    is_public boolean DEFAULT true,
    open_rate numeric,
    click_rate numeric,
    send_count integer,
    google_doc_url text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    newsletter_type_id uuid NOT NULL,
    CONSTRAINT newsletters_send_provider_check CHECK (((send_provider IS NULL) OR (send_provider = ANY (ARRAY['hubspot'::text, 'other'::text])))),
    CONSTRAINT newsletters_status_check CHECK ((status = ANY (ARRAY['planning'::text, 'draft'::text, 'ready'::text, 'scheduled'::text, 'sent'::text, 'archived'::text])))
);
```

```sql
CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    website text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.pillars (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.platform_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform text NOT NULL,
    followers integer DEFAULT 0,
    followers_delta integer DEFAULT 0,
    subscribers integer DEFAULT 0,
    subscribers_delta integer DEFAULT 0,
    total_impressions integer DEFAULT 0,
    total_interactions integer DEFAULT 0,
    total_reach integer DEFAULT 0,
    sessions integer,
    new_contacts integer,
    total_watch_time_hours numeric,
    total_video_views integer,
    measured_at timestamp with time zone NOT NULL,
    period_start timestamp with time zone,
    period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT platform_performance_platform_check CHECK ((platform = ANY (ARRAY['instagram'::text, 'youtube'::text, 'tiktok'::text, 'facebook'::text, 'x'::text, 'linkedin'::text, 'website'::text])))
);
```

```sql
CREATE TABLE public.post_businesses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    business_id uuid NOT NULL,
    mention_type text DEFAULT 'mentioned'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT post_businesses_mention_type_check CHECK (((mention_type IS NULL) OR (mention_type = ANY (ARRAY['mentioned'::text, 'featured'::text, 'reviewed'::text]))))
);
```

```sql
CREATE TABLE public.post_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    category_id uuid NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.post_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    event_id uuid NOT NULL,
    mention_type text DEFAULT 'mentioned'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT post_events_mention_type_check CHECK (((mention_type IS NULL) OR (mention_type = ANY (ARRAY['mentioned'::text, 'featured'::text, 'preview'::text, 'recap'::text]))))
);
```

```sql
CREATE TABLE public.post_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    image_url text NOT NULL,
    media_asset_id uuid,
    caption text,
    alt_text text,
    credit text,
    image_role text DEFAULT 'inline'::text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT post_images_image_role_check CHECK (((image_role IS NULL) OR (image_role = ANY (ARRAY['inline'::text, 'gallery'::text, 'infographic'::text, 'map'::text]))))
);
```

```sql
CREATE TABLE public.post_neighborhoods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    neighborhood_id uuid NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.post_source_stories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    story_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.post_sponsors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    sponsor_id uuid NOT NULL,
    tier text,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT post_sponsors_tier_check CHECK ((tier = ANY (ARRAY['script'::text, 'blog'::text, 'social'::text])))
);
```

```sql
CREATE TABLE public.post_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.published_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_story_id uuid,
    post_id uuid,
    media_item_id uuid,
    platform text NOT NULL,
    content_format text NOT NULL,
    platform_post_id text,
    title text,
    published_url text,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT published_content_content_format_check CHECK ((content_format = ANY (ARRAY['reel'::text, 'video'::text, 'short'::text, 'blog_post'::text, 'carousel'::text, 'social_post'::text, 'story'::text, 'live'::text, 'newsletter'::text]))),
    CONSTRAINT published_content_platform_check CHECK ((platform = ANY (ARRAY['instagram'::text, 'youtube'::text, 'tiktok'::text, 'facebook'::text, 'x'::text, 'linkedin'::text, 'website'::text])))
);
```

```sql
CREATE TABLE public.redirects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_path text NOT NULL,
    to_path text NOT NULL,
    status_code integer DEFAULT 301 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    hit_count integer DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT redirects_status_code_check CHECK ((status_code = ANY (ARRAY[301, 302])))
);
```

```sql
CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    title text,
    body character varying(2000),
    visit_date date,
    photos jsonb,
    status text DEFAULT 'pending_review'::text NOT NULL,
    moderation_notes text,
    moderated_by uuid,
    moderated_at timestamp with time zone,
    rejection_reason text,
    is_verified_visit boolean DEFAULT false NOT NULL,
    helpful_count integer DEFAULT 0 NOT NULL,
    reported_count integer DEFAULT 0 NOT NULL,
    auto_flagged boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    owner_response text,
    owner_response_at timestamp with time zone,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT reviews_status_check CHECK ((status = ANY (ARRAY['pending_review'::text, 'approved'::text, 'flagged'::text, 'rejected'::text, 'removed'::text])))
);
```

```sql
CREATE TABLE public.saved_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT saved_items_entity_type_check CHECK ((entity_type = ANY (ARRAY['business'::text, 'event'::text, 'blog_post'::text, 'neighborhood'::text])))
);
```

```sql
CREATE TABLE public.script_batches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    week_of date NOT NULL,
    batch_name text,
    status text DEFAULT 'planning'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT script_batches_status_check CHECK ((status = ANY (ARRAY['planning'::text, 'active'::text, 'completed'::text])))
);
```

```sql
CREATE TABLE public.scripts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    script_batch_id uuid,
    story_id uuid,
    title text NOT NULL,
    script_text text,
    platform text,
    format text,
    pillar_id uuid,
    neighborhood_id uuid,
    hashtags text,
    call_to_action text,
    status text DEFAULT 'draft'::text NOT NULL,
    scheduled_date date,
    posted_at timestamp with time zone,
    post_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text,
    tags text,
    caption text,
    description text,
    CONSTRAINT scripts_format_check CHECK (((format IS NULL) OR (format = ANY (ARRAY['talking_head'::text, 'green_screen'::text, 'voiceover'::text, 'text_overlay'::text, 'b_roll'::text])))),
    CONSTRAINT scripts_platform_check CHECK (((platform IS NULL) OR (platform = ANY (ARRAY['reel'::text, 'tiktok'::text, 'youtube_short'::text, 'carousel'::text, 'static'::text, 'linkedin'::text, 'facebook'::text, 'x'::text, 'instagram'::text])))),
    CONSTRAINT scripts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'filmed'::text, 'posted'::text, 'killed'::text])))
);
```

```sql
CREATE TABLE public.seo_content_calendar (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_idea text NOT NULL,
    token_name text,
    type text,
    category_id uuid,
    pillar_id uuid,
    neighborhood_id uuid,
    target_keywords text,
    seasonality text,
    best_publish_months jsonb,
    status text DEFAULT 'idea'::text NOT NULL,
    post_id uuid,
    content_index_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT seo_content_calendar_status_check CHECK ((status = ANY (ARRAY['idea'::text, 'researched'::text, 'assigned'::text, 'written'::text, 'published'::text]))),
    CONSTRAINT seo_content_calendar_type_check CHECK (((type IS NULL) OR (type = ANY (ARRAY['best_of_listicle'::text, 'neighborhood_guide'::text, 'seasonal'::text, 'evergreen'::text, 'comparison'::text]))))
);
```

```sql
CREATE TABLE public.sponsor_deliverables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sponsor_id uuid NOT NULL,
    deliverable_type text NOT NULL,
    label text NOT NULL,
    channel text NOT NULL,
    quantity_owed integer DEFAULT 0 NOT NULL,
    quantity_delivered integer DEFAULT 0 NOT NULL,
    quantity_scheduled integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.sponsor_fulfillment_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sponsor_id uuid NOT NULL,
    deliverable_id uuid,
    deliverable_type text NOT NULL,
    title text NOT NULL,
    description text,
    channel text NOT NULL,
    platform text,
    content_url text,
    post_id uuid,
    newsletter_id uuid,
    media_item_id uuid,
    delivered_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.sponsor_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    price_display text NOT NULL,
    billing_cycle text DEFAULT 'monthly'::text NOT NULL,
    description text,
    deliverables jsonb DEFAULT '[]'::jsonb NOT NULL,
    effort_hours_monthly numeric,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.sponsors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid,
    sponsor_name text NOT NULL,
    contact_name text,
    contact_email text,
    contact_phone text,
    campaign_name text,
    campaign_start date,
    campaign_end date,
    campaign_value numeric,
    placement jsonb,
    talking_points text,
    content_index_id uuid,
    status text DEFAULT 'prospect'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    package_type text,
    placements_total integer,
    placements_used integer DEFAULT 0,
    category_focus uuid,
    neighborhood_focus uuid,
    is_active boolean DEFAULT true,
    package_id uuid,
    CONSTRAINT sponsors_package_type_check CHECK ((package_type = ANY (ARRAY['blog'::text, 'script'::text, 'social'::text, 'website_ad'::text, 'newsletter_ad'::text, 'combo'::text]))),
    CONSTRAINT sponsors_status_check CHECK ((status = ANY (ARRAY['prospect'::text, 'active'::text, 'paused'::text, 'completed'::text])))
);
```

```sql
CREATE TABLE public.stories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    headline text NOT NULL,
    source_url text,
    source_name text,
    summary text,
    pillar_id uuid,
    city_id uuid,
    category_id uuid,
    priority text DEFAULT 'medium'::text NOT NULL,
    image_url text,
    eligible_for_blog boolean DEFAULT true NOT NULL,
    eligible_for_script boolean DEFAULT true NOT NULL,
    assigned_blog boolean DEFAULT false NOT NULL,
    assigned_script boolean DEFAULT false NOT NULL,
    used_in_blog boolean DEFAULT false NOT NULL,
    used_in_script boolean DEFAULT false NOT NULL,
    used_in_blog_at timestamp with time zone,
    used_in_script_at timestamp with time zone,
    status text DEFAULT 'new'::text NOT NULL,
    published_at timestamp with time zone,
    ingested_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    score integer DEFAULT 0,
    tier text,
    neighborhood_id uuid,
    angle_summary text,
    expires_at timestamp with time zone,
    banked_at timestamp with time zone,
    reuse_eligible_at timestamp with time zone,
    CONSTRAINT stories_priority_check CHECK ((priority = ANY (ARRAY['breaking'::text, 'high'::text, 'medium'::text, 'low'::text, 'evergreen'::text]))),
    CONSTRAINT stories_status_check CHECK ((status = ANY (ARRAY['new'::text, 'reviewed'::text, 'queued'::text, 'skipped'::text, 'assigned_blog'::text, 'assigned_script'::text, 'assigned_dual'::text, 'assigned_social'::text, 'draft_script'::text, 'draft_social'::text, 'banked'::text, 'used'::text, 'discarded'::text]))),
    CONSTRAINT stories_tier_check CHECK ((tier = ANY (ARRAY['script'::text, 'blog'::text, 'social'::text])))
);
```

```sql
CREATE TABLE public.story_businesses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid NOT NULL,
    business_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
```

```sql
CREATE TABLE public.story_neighborhoods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid NOT NULL,
    neighborhood_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_primary boolean DEFAULT false
);
```

```sql
CREATE TABLE public.submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    submission_type text NOT NULL,
    submitted_by uuid,
    submitter_name text NOT NULL,
    submitter_email text NOT NULL,
    submitter_phone text,
    data jsonb NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewer_notes text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    rejection_reason text,
    created_record_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT submissions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'under_review'::text, 'approved'::text, 'rejected'::text, 'needs_info'::text]))),
    CONSTRAINT submissions_submission_type_check CHECK ((submission_type = ANY (ARRAY['event'::text, 'business'::text])))
);
```

```sql
CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    user_id uuid NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    plan text NOT NULL,
    price_monthly numeric,
    billing_cycle text DEFAULT 'monthly'::text,
    status text DEFAULT 'active'::text NOT NULL,
    current_period_start date,
    current_period_end date,
    cancel_at_period_end boolean DEFAULT false NOT NULL,
    canceled_at timestamp with time zone,
    trial_start date,
    trial_end date,
    grace_period_days integer DEFAULT 7,
    downgrade_scheduled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT subscriptions_billing_cycle_check CHECK (((billing_cycle IS NULL) OR (billing_cycle = ANY (ARRAY['monthly'::text, 'annual'::text])))),
    CONSTRAINT subscriptions_plan_check CHECK ((plan = ANY (ARRAY['free'::text, 'standard'::text, 'premium'::text]))),
    CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'past_due'::text, 'canceled'::text, 'trialing'::text, 'paused'::text])))
);
```

```sql
CREATE TABLE public.system_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scenario text NOT NULL,
    severity text NOT NULL,
    message text NOT NULL,
    story_id uuid,
    post_id uuid,
    media_item_id uuid,
    published_content_id uuid,
    platform text,
    raw_error text,
    resolved boolean DEFAULT false,
    resolved_at timestamp with time zone,
    resolved_by text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT system_logs_platform_check CHECK ((platform = ANY (ARRAY['instagram'::text, 'youtube'::text, 'tiktok'::text, 'facebook'::text, 'x'::text, 'linkedin'::text, 'website'::text, 'hubspot'::text, 'make'::text, 'claude_api'::text, 'supabase'::text]))),
    CONSTRAINT system_logs_scenario_check CHECK ((scenario = ANY (ARRAY['s1_intake'::text, 's3_scoring'::text, 's4_blog_gen'::text, 's5_script_gen'::text, 's6_social_gen'::text, 's8_publish'::text, 's10_analytics'::text, 's11_health_check'::text, 'auth_refresh'::text, 'manual'::text]))),
    CONSTRAINT system_logs_severity_check CHECK ((severity = ANY (ARRAY['info'::text, 'warning'::text, 'error'::text, 'critical'::text])))
);
```

```sql
CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true
);
```

```sql
CREATE TABLE public.tier_changes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    subscription_id uuid,
    change_type text NOT NULL,
    from_tier text NOT NULL,
    to_tier text NOT NULL,
    reason text,
    triggered_by text NOT NULL,
    admin_user_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tier_changes_change_type_check CHECK ((change_type = ANY (ARRAY['upgrade'::text, 'downgrade'::text, 'auto_downgrade'::text, 'restore'::text, 'manual_override'::text]))),
    CONSTRAINT tier_changes_from_tier_check CHECK ((from_tier = ANY (ARRAY['Free'::text, 'Standard'::text, 'Premium'::text]))),
    CONSTRAINT tier_changes_reason_check CHECK (((reason IS NULL) OR (reason = ANY (ARRAY['payment_success'::text, 'payment_failed'::text, 'grace_expired'::text, 'manual_cancel'::text, 'admin_action'::text, 'resubscribe'::text])))),
    CONSTRAINT tier_changes_to_tier_check CHECK ((to_tier = ANY (ARRAY['Free'::text, 'Standard'::text, 'Premium'::text]))),
    CONSTRAINT tier_changes_triggered_by_check CHECK ((triggered_by = ANY (ARRAY['stripe_webhook'::text, 'admin'::text, 'system'::text, 'user'::text])))
);
```

```sql
CREATE TABLE public.tier_visibility_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tier text NOT NULL,
    field_name text NOT NULL,
    visible boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tier_visibility_rules_tier_check CHECK ((tier = ANY (ARRAY['Free'::text, 'Standard'::text, 'Premium'::text])))
);
```

```sql
CREATE TABLE public.trending_topics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    keyword text NOT NULL,
    mention_count integer DEFAULT 1,
    first_seen timestamp with time zone DEFAULT now(),
    last_seen timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);
```

```sql
CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    display_name text,
    avatar_url text,
    role text DEFAULT 'subscriber'::text NOT NULL,
    phone text,
    bio text,
    city_id uuid,
    neighborhood_id uuid,
    email_verified boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'editor'::text, 'business_owner'::text, 'contributor'::text, 'subscriber'::text])))
);
```

```sql
CREATE TABLE public.watchlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_name text NOT NULL,
    slug text NOT NULL,
    location text,
    neighborhood_id uuid,
    city_id uuid,
    status text DEFAULT 'proposed'::text NOT NULL,
    developer text,
    project_type jsonb,
    units integer,
    square_feet integer,
    estimated_cost numeric,
    timeline text,
    description text,
    last_update text,
    next_milestone text,
    latitude numeric,
    longitude numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT watchlist_status_check CHECK ((status = ANY (ARRAY['proposed'::text, 'filed'::text, 'under_review'::text, 'approved'::text, 'under_construction'::text, 'completed'::text, 'stalled'::text, 'killed'::text])))
);
```

```sql
CREATE TABLE public.watchlist_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    watchlist_id uuid NOT NULL,
    post_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

```sql
CREATE TABLE public.watchlist_stories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    watchlist_id uuid NOT NULL,
    story_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

---

## SECTION 2: CHECK CONSTRAINTS

- `ad_campaigns_status_check`: `(status = ANY (ARRAY['draft', 'active', 'paused', 'completed']`
- `ad_creatives_creative_type_check`: `(creative_type = ANY (ARRAY['image', 'html', 'native']`
- `ad_flights_share_of_voice_check`: `((share_of_voice >= 0) AND (share_of_voice <= 100`
- `ad_flights_status_check`: `(status = ANY (ARRAY['scheduled', 'active', 'paused', 'ended']`
- `ad_placements_channel_check`: `(channel = ANY (ARRAY['web', 'newsletter']`
- `ad_placements_page_type_check`: `((page_type IS NULL) OR (page_type = ANY (ARRAY['home', 'blog', 'neighborhood', 'events', 'directory', 'newsletter', 'all']`
- `authors_role_check`: `((role IS NULL) OR (role = ANY (ARRAY['editor', 'staff_writer', 'guest_contributor', 'sponsored']`
- `blog_posts_content_source_check`: `((content_source IS NULL) OR (content_source = ANY (ARRAY['automation_pipeline', 'manual', 'guest_submission']`
- `blog_posts_content_type_check`: `(content_type = ANY (ARRAY['news', 'guide']`
- `blog_posts_status_check`: `(status = ANY (ARRAY['draft', 'ready_for_review', 'scheduled', 'published', 'archived']`
- `blog_posts_type_check`: `((type IS NULL) OR (type = ANY (ARRAY['news', 'roundup', 'evergreen_seo', 'sponsor_feature', 'neighborhood_guide']`
- `business_hours_day_of_week_check`: `(day_of_week = ANY (ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']`
- `business_listings_claim_status_check`: `(claim_status = ANY (ARRAY['unclaimed', 'pending_verification', 'verified', 'rejected']`
- `business_listings_claim_verification_method_check`: `((claim_verification_method IS NULL) OR (claim_verification_method = ANY (ARRAY['email_match', 'manual_review']`
- `business_listings_map_pin_style_check`: `(map_pin_style = ANY (ARRAY['gray', 'standard', 'premium']`
- `business_listings_previous_tier_check`: `((previous_tier IS NULL) OR (previous_tier = ANY (ARRAY['Free', 'Standard', 'Premium']`
- `business_listings_price_range_check`: `((price_range IS NULL) OR (price_range = ANY (ARRAY['$', '$$', '$$$', '$$$$']`
- `business_listings_status_check`: `(status = ANY (ARRAY['draft', 'pending_review', 'active', 'suspended', 'expired']`
- `business_listings_tier_check`: `(tier = ANY (ARRAY['Free', 'Standard', 'Premium']`
- `business_organizations_membership_status_check`: `((membership_status IS NULL) OR (membership_status = ANY (ARRAY['active', 'pending', 'expired']`
- `claims_claim_status_check`: `(claim_status = ANY (ARRAY['pending', 'approved', 'rejected', 'expired']`
- `claims_verification_method_check`: `((verification_method IS NULL) OR (verification_method = ANY (ARRAY['email_match', 'manual_review', 'document_upload']`
- `content_calendar_status_check`: `(status = ANY (ARRAY['scheduled', 'published', 'expired']`
- `content_calendar_tier_check`: `(tier = ANY (ARRAY['script', 'blog', 'social']`
- `content_history_tier_check`: `(tier = ANY (ARRAY['script', 'blog', 'social']`
- `content_index_target_type_check`: `(target_type = ANY (ARRAY['neighborhood', 'city', 'area', 'business', 'event', 'blog_post', 'pillar_page', 'external']`
- `content_performance_analytics_source_check`: `(analytics_source = ANY (ARRAY['meta_api', 'youtube_api', 'tiktok_api', 'linkedin_api', 'x_api', 'hubspot_api']`
- `event_map_pin_rules_tier_check`: `(tier = ANY (ARRAY['Free', 'Standard', 'Premium']`
- `event_tier_pricing_tier_check`: `(tier = ANY (ARRAY['Free', 'Standard', 'Premium']`
- `event_tier_visibility_rules_tier_check`: `(tier = ANY (ARRAY['Free', 'Standard', 'Premium']`
- `events_event_type_check`: `((event_type IS NULL) OR (event_type = ANY (ARRAY['festival', 'concert', 'food_drink', 'market', 'community', 'sports', 'arts', 'wellness', 'nightlife', 'family', 'pop_up', 'networking', 'other']`
- `events_payment_status_check`: `(payment_status = ANY (ARRAY['unpaid', 'paid', 'invoiced', 'comped']`
- `events_pricing_source_check`: `((pricing_source IS NULL) OR (pricing_source = ANY (ARRAY['default', 'override', 'package', 'comped']`
- `events_status_check`: `(status = ANY (ARRAY['draft', 'pending_review', 'active', 'canceled', 'completed', 'expired']`
- `events_tier_check`: `(tier = ANY (ARRAY['Free', 'Standard', 'Premium']`
- `featured_slots_entity_type_check`: `(entity_type = ANY (ARRAY['business', 'event', 'blog_post', 'neighborhood', 'area']`
- `headline_variants_variant_number_check`: `(variant_number = ANY (ARRAY[1, 2, 3]`
- `map_pin_rules_tier_check`: `(tier = ANY (ARRAY['Free', 'Standard', 'Premium']`
- `media_assets_file_type_check`: `(file_type = ANY (ARRAY['image', 'video', 'document', 'other']`
- `media_assets_source_check`: `((source IS NULL) OR (source = ANY (ARRAY['original', 'stock', 'ai_generated', 'auto_scraped', 'user_uploaded']`
- `media_item_assets_role_check`: `(role = ANY (ARRAY['primary', 'thumbnail', 'gallery', 'transcript', 'other']`
- `media_item_links_target_type_check`: `(target_type = ANY (ARRAY['city', 'area', 'neighborhood', 'business', 'event', 'blog_post', 'pillar_page', 'external', 'homepage']`
- `media_items_media_type_check`: `(media_type = ANY (ARRAY['video', 'audio', 'podcast', 'short']`
- `media_items_source_check`: `(((source_type = 'embed') AND (embed_url IS NOT NULL`
- `media_items_source_type_check`: `(source_type = ANY (ARRAY['embed', 'asset']`
- `media_items_status_check`: `(status = ANY (ARRAY['draft', 'scheduled', 'published', 'archived']`
- `newsletters_send_provider_check`: `((send_provider IS NULL) OR (send_provider = ANY (ARRAY['hubspot', 'other']`
- `newsletters_status_check`: `(status = ANY (ARRAY['planning', 'draft', 'ready', 'scheduled', 'sent', 'archived']`
- `platform_performance_platform_check`: `(platform = ANY (ARRAY['instagram', 'youtube', 'tiktok', 'facebook', 'x', 'linkedin', 'website']`
- `post_businesses_mention_type_check`: `((mention_type IS NULL) OR (mention_type = ANY (ARRAY['mentioned', 'featured', 'reviewed']`
- `post_events_mention_type_check`: `((mention_type IS NULL) OR (mention_type = ANY (ARRAY['mentioned', 'featured', 'preview', 'recap']`
- `post_images_image_role_check`: `((image_role IS NULL) OR (image_role = ANY (ARRAY['inline', 'gallery', 'infographic', 'map']`
- `post_sponsors_tier_check`: `(tier = ANY (ARRAY['script', 'blog', 'social']`
- `published_content_content_format_check`: `(content_format = ANY (ARRAY['reel', 'video', 'short', 'blog_post', 'carousel', 'social_post', 'story', 'live', 'newsletter']`
- `published_content_platform_check`: `(platform = ANY (ARRAY['instagram', 'youtube', 'tiktok', 'facebook', 'x', 'linkedin', 'website']`
- `redirects_status_code_check`: `(status_code = ANY (ARRAY[301, 302]`
- `reviews_rating_check`: `((rating >= 1) AND (rating <= 5`
- `reviews_status_check`: `(status = ANY (ARRAY['pending_review', 'approved', 'flagged', 'rejected', 'removed']`
- `saved_items_entity_type_check`: `(entity_type = ANY (ARRAY['business', 'event', 'blog_post', 'neighborhood']`
- `script_batches_status_check`: `(status = ANY (ARRAY['planning', 'active', 'completed']`
- `scripts_format_check`: `((format IS NULL) OR (format = ANY (ARRAY['talking_head', 'green_screen', 'voiceover', 'text_overlay', 'b_roll']`
- `scripts_platform_check`: `((platform IS NULL) OR (platform = ANY (ARRAY['reel', 'tiktok', 'youtube_short', 'carousel', 'static', 'linkedin', 'facebook', 'x', 'instagram']`
- `scripts_status_check`: `(status = ANY (ARRAY['draft', 'approved', 'filmed', 'posted', 'killed']`
- `seo_content_calendar_status_check`: `(status = ANY (ARRAY['idea', 'researched', 'assigned', 'written', 'published']`
- `seo_content_calendar_type_check`: `((type IS NULL) OR (type = ANY (ARRAY['best_of_listicle', 'neighborhood_guide', 'seasonal', 'evergreen', 'comparison']`
- `sponsors_package_type_check`: `(package_type = ANY (ARRAY['blog', 'script', 'social', 'website_ad', 'newsletter_ad', 'combo']`
- `sponsors_status_check`: `(status = ANY (ARRAY['prospect', 'active', 'paused', 'completed']`
- `stories_priority_check`: `(priority = ANY (ARRAY['breaking', 'high', 'medium', 'low', 'evergreen']`
- `stories_status_check`: `(status = ANY (ARRAY['new', 'reviewed', 'queued', 'skipped', 'assigned_blog', 'assigned_script', 'assigned_dual', 'assigned_social', 'draft_script', 'draft_social', 'banked', 'used', 'discarded']`
- `stories_tier_check`: `(tier = ANY (ARRAY['script', 'blog', 'social']`
- `submissions_status_check`: `(status = ANY (ARRAY['pending', 'under_review', 'approved', 'rejected', 'needs_info']`
- `submissions_submission_type_check`: `(submission_type = ANY (ARRAY['event', 'business']`
- `subscriptions_billing_cycle_check`: `((billing_cycle IS NULL) OR (billing_cycle = ANY (ARRAY['monthly', 'annual']`
- `subscriptions_plan_check`: `(plan = ANY (ARRAY['free', 'standard', 'premium']`
- `subscriptions_status_check`: `(status = ANY (ARRAY['active', 'past_due', 'canceled', 'trialing', 'paused']`
- `system_logs_platform_check`: `(platform = ANY (ARRAY['instagram', 'youtube', 'tiktok', 'facebook', 'x', 'linkedin', 'website', 'hubspot', 'make', 'claude_api', 'supabase']`
- `system_logs_scenario_check`: `(scenario = ANY (ARRAY['s1_intake', 's3_scoring', 's4_blog_gen', 's5_script_gen', 's6_social_gen', 's8_publish', 's10_analytics', 's11_health_check', 'auth_refresh', 'manual']`
- `system_logs_severity_check`: `(severity = ANY (ARRAY['info', 'warning', 'error', 'critical']`
- `tier_changes_change_type_check`: `(change_type = ANY (ARRAY['upgrade', 'downgrade', 'auto_downgrade', 'restore', 'manual_override']`
- `tier_changes_from_tier_check`: `(from_tier = ANY (ARRAY['Free', 'Standard', 'Premium']`
- `tier_changes_reason_check`: `((reason IS NULL) OR (reason = ANY (ARRAY['payment_success', 'payment_failed', 'grace_expired', 'manual_cancel', 'admin_action', 'resubscribe']`
- `tier_changes_to_tier_check`: `(to_tier = ANY (ARRAY['Free', 'Standard', 'Premium']`
- `tier_changes_triggered_by_check`: `(triggered_by = ANY (ARRAY['stripe_webhook', 'admin', 'system', 'user']`
- `tier_visibility_rules_tier_check`: `(tier = ANY (ARRAY['Free', 'Standard', 'Premium']`
- `users_role_check`: `(role = ANY (ARRAY['admin', 'editor', 'business_owner', 'contributor', 'subscriber']`
- `watchlist_status_check`: `(status = ANY (ARRAY['proposed', 'filed', 'under_review', 'approved', 'under_construction', 'completed', 'stalled', 'killed']`

---

## SECTION 3: FOREIGN KEY RELATIONSHIPS

| Source Table | Column | References | Foreign Column | On Delete |
|---|---|---|---|---|
| ad_campaigns | sponsor_id | sponsors | id | CASCADE |
| ad_creatives | campaign_id | ad_campaigns | id | CASCADE |
| ad_creatives | media_asset_id | media_assets | id | SET |
| ad_flights | area_id | areas | id | SET |
| ad_flights | campaign_id | ad_campaigns | id | CASCADE |
| ad_flights | category_id | categories | id | SET |
| ad_flights | creative_id | ad_creatives | id | CASCADE |
| ad_flights | neighborhood_id | neighborhoods | id | SET |
| ad_flights | placement_id | ad_placements | id | CASCADE |
| areas | city_id | cities | id | CASCADE |
| blog_posts | author_id | authors | id | SET |
| blog_posts | category_id | categories | id | SET |
| blog_posts | content_index_record_id | content_index | id | SET |
| blog_posts | neighborhood_id | neighborhoods | id | SET |
| blog_posts | pillar_id | pillars | id | SET |
| blog_posts | sponsor_business_id | business_listings | id | SET |
| business_amenities | amenity_id | amenities | id | CASCADE |
| business_amenities | business_id | business_listings | id | CASCADE |
| business_contacts | business_id | business_listings | id | CASCADE |
| business_hours | business_id | business_listings | id | CASCADE |
| business_identities | business_id | business_listings | id | CASCADE |
| business_identities | identity_option_id | business_identity_options | id | CASCADE |
| business_images | business_id | business_listings | id | CASCADE |
| business_images | media_asset_id | media_assets | id | SET |
| business_listings | category_id | categories | id | SET |
| business_listings | city_id | cities | id | NO ACTION |
| business_listings | claimed_by | users | id | SET |
| business_listings | neighborhood_id | neighborhoods | id | RESTRICT |
| business_listings | parent_brand_id | brands | id | SET |
| business_organizations | business_id | business_listings | id | CASCADE |
| business_organizations | organization_id | organizations | id | CASCADE |
| business_tags | business_id | business_listings | id | CASCADE |
| business_tags | tag_id | tags | id | CASCADE |
| claims | business_id | business_listings | id | CASCADE |
| claims | reviewed_by | users | id | SET |
| claims | user_id | users | id | CASCADE |
| content_calendar | post_id | blog_posts | id | NO ACTION |
| content_calendar | story_id | stories | id | NO ACTION |
| content_history | category_id | categories | id | NO ACTION |
| content_history | neighborhood_id | neighborhoods | id | NO ACTION |
| content_history | post_id | blog_posts | id | NO ACTION |
| content_history | story_id | stories | id | CASCADE |
| content_performance | published_content_id | published_content | id | CASCADE |
| event_images | event_id | events | id | CASCADE |
| event_images | media_asset_id | media_assets | id | SET |
| event_tags | event_id | events | id | CASCADE |
| event_tags | tag_id | tags | id | CASCADE |
| events | category_id | categories | id | SET |
| events | city_id | cities | id | NO ACTION |
| events | neighborhood_id | neighborhoods | id | SET |
| events | organizer_business_id | business_listings | id | SET |
| events | pillar_id | pillars | id | SET |
| events | submitted_by | users | id | SET |
| events | venue_business_id | business_listings | id | SET |
| featured_slots | created_by | users | id | SET |
| headline_variants | post_id | blog_posts | id | CASCADE |
| media_assets | uploaded_by | users | id | SET |
| media_item_assets | asset_id | media_assets | id | RESTRICT |
| media_item_assets | media_item_id | media_items | id | CASCADE |
| media_item_links | media_item_id | media_items | id | CASCADE |
| neighborhoods | area_id | areas | id | CASCADE |
| newsletter_posts | newsletter_id | newsletters | id | CASCADE |
| newsletter_posts | post_id | blog_posts | id | CASCADE |
| newsletter_posts | section_id | newsletter_sections | id | SET |
| newsletter_sections | newsletter_id | newsletters | id | CASCADE |
| newsletters | newsletter_type_id | newsletter_types | id | NO ACTION |
| newsletters | sponsor_business_id | business_listings | id | SET |
| post_businesses | business_id | business_listings | id | CASCADE |
| post_businesses | post_id | blog_posts | id | CASCADE |
| post_categories | category_id | categories | id | CASCADE |
| post_categories | post_id | blog_posts | id | CASCADE |
| post_events | event_id | events | id | CASCADE |
| post_events | post_id | blog_posts | id | CASCADE |
| post_images | media_asset_id | media_assets | id | SET |
| post_images | post_id | blog_posts | id | CASCADE |
| post_neighborhoods | neighborhood_id | neighborhoods | id | CASCADE |
| post_neighborhoods | post_id | blog_posts | id | CASCADE |
| post_source_stories | post_id | blog_posts | id | CASCADE |
| post_source_stories | story_id | stories | id | CASCADE |
| post_sponsors | post_id | blog_posts | id | CASCADE |
| post_sponsors | sponsor_id | sponsors | id | CASCADE |
| post_tags | post_id | blog_posts | id | CASCADE |
| post_tags | tag_id | tags | id | CASCADE |
| published_content | media_item_id | media_items | id | NO ACTION |
| published_content | post_id | blog_posts | id | NO ACTION |
| published_content | source_story_id | stories | id | NO ACTION |
| reviews | business_id | business_listings | id | CASCADE |
| reviews | moderated_by | users | id | SET |
| reviews | user_id | users | id | CASCADE |
| saved_items | user_id | users | id | CASCADE |
| scripts | neighborhood_id | neighborhoods | id | SET |
| scripts | pillar_id | pillars | id | SET |
| scripts | script_batch_id | script_batches | id | SET |
| scripts | story_id | stories | id | SET |
| seo_content_calendar | category_id | categories | id | SET |
| seo_content_calendar | content_index_id | content_index | id | SET |
| seo_content_calendar | neighborhood_id | neighborhoods | id | SET |
| seo_content_calendar | pillar_id | pillars | id | SET |
| seo_content_calendar | post_id | blog_posts | id | SET |
| sponsor_deliverables | sponsor_id | sponsors | id | CASCADE |
| sponsor_fulfillment_log | deliverable_id | sponsor_deliverables | id | SET |
| sponsor_fulfillment_log | media_item_id | media_items | id | SET |
| sponsor_fulfillment_log | newsletter_id | newsletters | id | SET |
| sponsor_fulfillment_log | post_id | blog_posts | id | SET |
| sponsor_fulfillment_log | sponsor_id | sponsors | id | CASCADE |
| sponsors | business_id | business_listings | id | SET |
| sponsors | category_focus | categories | id | NO ACTION |
| sponsors | content_index_id | content_index | id | SET |
| sponsors | neighborhood_focus | neighborhoods | id | NO ACTION |
| sponsors | package_id | sponsor_packages | id | SET |
| stories | category_id | categories | id | SET |
| stories | city_id | cities | id | SET |
| stories | neighborhood_id | neighborhoods | id | NO ACTION |
| stories | pillar_id | pillars | id | SET |
| story_businesses | business_id | business_listings | id | CASCADE |
| story_businesses | story_id | stories | id | CASCADE |
| story_neighborhoods | neighborhood_id | neighborhoods | id | CASCADE |
| story_neighborhoods | story_id | stories | id | CASCADE |
| submissions | reviewed_by | users | id | SET |
| submissions | submitted_by | users | id | SET |
| subscriptions | business_id | business_listings | id | CASCADE |
| subscriptions | user_id | users | id | CASCADE |
| system_logs | media_item_id | media_items | id | NO ACTION |
| system_logs | post_id | blog_posts | id | NO ACTION |
| system_logs | published_content_id | published_content | id | NO ACTION |
| system_logs | story_id | stories | id | NO ACTION |
| tier_changes | admin_user_id | users | id | SET |
| tier_changes | business_id | business_listings | id | CASCADE |
| tier_changes | subscription_id | subscriptions | id | SET |
| users | city_id | cities | id | SET |
| users | neighborhood_id | neighborhoods | id | SET |
| watchlist | city_id | cities | id | SET |
| watchlist | neighborhood_id | neighborhoods | id | SET |
| watchlist_posts | post_id | blog_posts | id | CASCADE |
| watchlist_posts | watchlist_id | watchlist | id | CASCADE |
| watchlist_stories | story_id | stories | id | CASCADE |
| watchlist_stories | watchlist_id | watchlist | id | CASCADE |