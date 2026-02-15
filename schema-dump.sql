--
-- PostgreSQL database dump
--

\restrict xdTSPCA3Qfnx6arWYYXHB5ezXKlHh9zKMMvBb8uqIylgwaHhzxjnouBhkobfl1x

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: cap_scripts_at_five(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cap_scripts_at_five() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  overflow_count INTEGER;
BEGIN
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC) as rank
    FROM stories
    WHERE assigned_script = true AND used_in_script = false
  )
  UPDATE stories 
  SET status = 'banked',
      assigned_script = false,
      tier = NULL,
      banked_at = now()
  WHERE id IN (SELECT id FROM ranked WHERE rank > 5);
  
  GET DIAGNOSTICS overflow_count = ROW_COUNT;
  RETURN overflow_count;
END;
$$;


ALTER FUNCTION public.cap_scripts_at_five() OWNER TO postgres;

--
-- Name: get_media_with_thumbnails(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_media_with_thumbnails(item_limit integer DEFAULT 3) RETURNS TABLE(id uuid, title text, slug text, embed_url text, thumbnail_url text, alt_text text)
    LANGUAGE sql STABLE
    AS $$
  SELECT mi.id, mi.title, mi.slug, mi.embed_url, mi.thumbnail_url, NULL::text as alt_text
  FROM media_items mi
  WHERE mi.status = 'published'
  ORDER BY mi.created_at DESC
  LIMIT item_limit;
$$;


ALTER FUNCTION public.get_media_with_thumbnails(item_limit integer) OWNER TO postgres;

--
-- Name: get_user_role(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_role() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  select role from public.users
  where id = auth.uid()
  limit 1;
$$;


ALTER FUNCTION public.get_user_role() OWNER TO postgres;

--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
    and role = 'admin'
  );
$$;


ALTER FUNCTION public.is_admin() OWNER TO postgres;

--
-- Name: is_admin_or_editor(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_admin_or_editor() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'editor')
  );
$$;


ALTER FUNCTION public.is_admin_or_editor() OWNER TO postgres;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ad_campaigns; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.ad_campaigns OWNER TO postgres;

--
-- Name: ad_creatives; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.ad_creatives OWNER TO postgres;

--
-- Name: ad_flights; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.ad_flights OWNER TO postgres;

--
-- Name: ad_placements; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.ad_placements OWNER TO postgres;

--
-- Name: amenities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.amenities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    amenity_group text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.amenities OWNER TO postgres;

--
-- Name: areas; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.areas OWNER TO postgres;

--
-- Name: authors; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.authors OWNER TO postgres;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.blog_posts OWNER TO postgres;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_name text NOT NULL,
    brand_logo text,
    brand_website text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: business_amenities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_amenities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    amenity_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.business_amenities OWNER TO postgres;

--
-- Name: business_contacts; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.business_contacts OWNER TO postgres;

--
-- Name: business_hours; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.business_hours OWNER TO postgres;

--
-- Name: business_identities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_identities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    identity_option_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.business_identities OWNER TO postgres;

--
-- Name: business_identity_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_identity_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.business_identity_options OWNER TO postgres;

--
-- Name: business_images; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.business_images OWNER TO postgres;

--
-- Name: business_listings; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.business_listings OWNER TO postgres;

--
-- Name: business_organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    membership_status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT business_organizations_membership_status_check CHECK (((membership_status IS NULL) OR (membership_status = ANY (ARRAY['active'::text, 'pending'::text, 'expired'::text]))))
);


ALTER TABLE public.business_organizations OWNER TO postgres;

--
-- Name: business_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.business_tags OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: cities; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.cities OWNER TO postgres;

--
-- Name: claims; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.claims OWNER TO postgres;

--
-- Name: content_calendar; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.content_calendar OWNER TO postgres;

--
-- Name: content_history; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.content_history OWNER TO postgres;

--
-- Name: content_index; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.content_index OWNER TO postgres;

--
-- Name: content_performance; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.content_performance OWNER TO postgres;

--
-- Name: event_images; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.event_images OWNER TO postgres;

--
-- Name: event_map_pin_rules; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.event_map_pin_rules OWNER TO postgres;

--
-- Name: event_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.event_tags OWNER TO postgres;

--
-- Name: event_tier_pricing; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.event_tier_pricing OWNER TO postgres;

--
-- Name: event_tier_visibility_rules; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.event_tier_visibility_rules OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: featured_slots; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.featured_slots OWNER TO postgres;

--
-- Name: headline_variants; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.headline_variants OWNER TO postgres;

--
-- Name: map_pin_rules; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.map_pin_rules OWNER TO postgres;

--
-- Name: media_assets; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.media_assets OWNER TO postgres;

--
-- Name: media_item_assets; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.media_item_assets OWNER TO postgres;

--
-- Name: media_item_links; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.media_item_links OWNER TO postgres;

--
-- Name: media_items; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.media_items OWNER TO postgres;

--
-- Name: neighborhoods; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.neighborhoods OWNER TO postgres;

--
-- Name: newsletter_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.newsletter_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    newsletter_id uuid NOT NULL,
    post_id uuid NOT NULL,
    section_id uuid,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.newsletter_posts OWNER TO postgres;

--
-- Name: newsletter_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.newsletter_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    newsletter_id uuid NOT NULL,
    section_name text NOT NULL,
    section_blurb text,
    section_image_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.newsletter_sections OWNER TO postgres;

--
-- Name: newsletter_types; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.newsletter_types OWNER TO postgres;

--
-- Name: newsletters; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.newsletters OWNER TO postgres;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    website text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: pillars; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.pillars OWNER TO postgres;

--
-- Name: platform_performance; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.platform_performance OWNER TO postgres;

--
-- Name: post_businesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_businesses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    business_id uuid NOT NULL,
    mention_type text DEFAULT 'mentioned'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT post_businesses_mention_type_check CHECK (((mention_type IS NULL) OR (mention_type = ANY (ARRAY['mentioned'::text, 'featured'::text, 'reviewed'::text]))))
);


ALTER TABLE public.post_businesses OWNER TO postgres;

--
-- Name: post_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    category_id uuid NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.post_categories OWNER TO postgres;

--
-- Name: post_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    event_id uuid NOT NULL,
    mention_type text DEFAULT 'mentioned'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT post_events_mention_type_check CHECK (((mention_type IS NULL) OR (mention_type = ANY (ARRAY['mentioned'::text, 'featured'::text, 'preview'::text, 'recap'::text]))))
);


ALTER TABLE public.post_events OWNER TO postgres;

--
-- Name: post_images; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.post_images OWNER TO postgres;

--
-- Name: post_neighborhoods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_neighborhoods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    neighborhood_id uuid NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.post_neighborhoods OWNER TO postgres;

--
-- Name: post_source_stories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_source_stories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    story_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.post_source_stories OWNER TO postgres;

--
-- Name: post_sponsors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_sponsors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    sponsor_id uuid NOT NULL,
    tier text,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT post_sponsors_tier_check CHECK ((tier = ANY (ARRAY['script'::text, 'blog'::text, 'social'::text])))
);


ALTER TABLE public.post_sponsors OWNER TO postgres;

--
-- Name: post_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.post_tags OWNER TO postgres;

--
-- Name: published_content; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.published_content OWNER TO postgres;

--
-- Name: redirects; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.redirects OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: saved_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT saved_items_entity_type_check CHECK ((entity_type = ANY (ARRAY['business'::text, 'event'::text, 'blog_post'::text, 'neighborhood'::text])))
);


ALTER TABLE public.saved_items OWNER TO postgres;

--
-- Name: script_batches; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.script_batches OWNER TO postgres;

--
-- Name: scripts; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.scripts OWNER TO postgres;

--
-- Name: seo_content_calendar; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.seo_content_calendar OWNER TO postgres;

--
-- Name: sponsor_deliverables; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.sponsor_deliverables OWNER TO postgres;

--
-- Name: TABLE sponsor_deliverables; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.sponsor_deliverables IS 'Per-sponsor fulfillment tracking. Each row = one deliverable type owed for a specific sponsor contract.';


--
-- Name: COLUMN sponsor_deliverables.deliverable_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.sponsor_deliverables.deliverable_type IS 'Must match a type from sponsor_packages.deliverables: reel, story_boost, newsletter_mention, blog_feature, website_ad, podcast_segment, directory_boost, pinned_post';


--
-- Name: COLUMN sponsor_deliverables.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.sponsor_deliverables.status IS 'active, completed, paused';


--
-- Name: sponsor_fulfillment_log; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.sponsor_fulfillment_log OWNER TO postgres;

--
-- Name: TABLE sponsor_fulfillment_log; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.sponsor_fulfillment_log IS 'Chronological log of every fulfilled deliverable with links to actual content';


--
-- Name: sponsor_packages; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.sponsor_packages OWNER TO postgres;

--
-- Name: TABLE sponsor_packages; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.sponsor_packages IS 'Package templates defining what deliverables are owed when a sponsor signs up';


--
-- Name: COLUMN sponsor_packages.deliverables; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.sponsor_packages.deliverables IS 'JSONB array of deliverable line items with type, label, quantity_per_month or quantity_per_contract, channel, and optional note';


--
-- Name: sponsors; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.sponsors OWNER TO postgres;

--
-- Name: COLUMN sponsors.package_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.sponsors.package_id IS 'Links to sponsor_packages template. The package_type text column still exists for backward compat but package_id is the source of truth going forward.';


--
-- Name: stories; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.stories OWNER TO postgres;

--
-- Name: story_businesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.story_businesses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid NOT NULL,
    business_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.story_businesses OWNER TO postgres;

--
-- Name: story_neighborhoods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.story_neighborhoods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid NOT NULL,
    neighborhood_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_primary boolean DEFAULT false
);


ALTER TABLE public.story_neighborhoods OWNER TO postgres;

--
-- Name: submissions; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.submissions OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.system_logs OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: tier_changes; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.tier_changes OWNER TO postgres;

--
-- Name: tier_visibility_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tier_visibility_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tier text NOT NULL,
    field_name text NOT NULL,
    visible boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tier_visibility_rules_tier_check CHECK ((tier = ANY (ARRAY['Free'::text, 'Standard'::text, 'Premium'::text])))
);


ALTER TABLE public.tier_visibility_rules OWNER TO postgres;

--
-- Name: trending_topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trending_topics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    keyword text NOT NULL,
    mention_count integer DEFAULT 1,
    first_seen timestamp with time zone DEFAULT now(),
    last_seen timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.trending_topics OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: watchlist; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.watchlist OWNER TO postgres;

--
-- Name: watchlist_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watchlist_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    watchlist_id uuid NOT NULL,
    post_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.watchlist_posts OWNER TO postgres;

--
-- Name: watchlist_stories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watchlist_stories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    watchlist_id uuid NOT NULL,
    story_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.watchlist_stories OWNER TO postgres;

--
-- Name: ad_campaigns ad_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_pkey PRIMARY KEY (id);


--
-- Name: ad_creatives ad_creatives_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_creatives
    ADD CONSTRAINT ad_creatives_pkey PRIMARY KEY (id);


--
-- Name: ad_flights ad_flights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_flights
    ADD CONSTRAINT ad_flights_pkey PRIMARY KEY (id);


--
-- Name: ad_placements ad_placements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_placements
    ADD CONSTRAINT ad_placements_pkey PRIMARY KEY (id);


--
-- Name: amenities amenities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amenities
    ADD CONSTRAINT amenities_pkey PRIMARY KEY (id);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: business_amenities business_amenities_business_id_amenity_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_amenities
    ADD CONSTRAINT business_amenities_business_id_amenity_id_key UNIQUE (business_id, amenity_id);


--
-- Name: business_amenities business_amenities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_amenities
    ADD CONSTRAINT business_amenities_pkey PRIMARY KEY (id);


--
-- Name: business_contacts business_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_contacts
    ADD CONSTRAINT business_contacts_pkey PRIMARY KEY (id);


--
-- Name: business_hours business_hours_business_id_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_hours
    ADD CONSTRAINT business_hours_business_id_day_of_week_key UNIQUE (business_id, day_of_week);


--
-- Name: business_hours business_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_hours
    ADD CONSTRAINT business_hours_pkey PRIMARY KEY (id);


--
-- Name: business_identities business_identities_business_id_identity_option_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_identities
    ADD CONSTRAINT business_identities_business_id_identity_option_id_key UNIQUE (business_id, identity_option_id);


--
-- Name: business_identities business_identities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_identities
    ADD CONSTRAINT business_identities_pkey PRIMARY KEY (id);


--
-- Name: business_identity_options business_identity_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_identity_options
    ADD CONSTRAINT business_identity_options_pkey PRIMARY KEY (id);


--
-- Name: business_images business_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_images
    ADD CONSTRAINT business_images_pkey PRIMARY KEY (id);


--
-- Name: business_listings business_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_listings
    ADD CONSTRAINT business_listings_pkey PRIMARY KEY (id);


--
-- Name: business_organizations business_organizations_business_id_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_organizations
    ADD CONSTRAINT business_organizations_business_id_organization_id_key UNIQUE (business_id, organization_id);


--
-- Name: business_organizations business_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_organizations
    ADD CONSTRAINT business_organizations_pkey PRIMARY KEY (id);


--
-- Name: business_tags business_tags_business_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_tags
    ADD CONSTRAINT business_tags_business_id_tag_id_key UNIQUE (business_id, tag_id);


--
-- Name: business_tags business_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_tags
    ADD CONSTRAINT business_tags_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: claims claims_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_pkey PRIMARY KEY (id);


--
-- Name: content_calendar content_calendar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_calendar
    ADD CONSTRAINT content_calendar_pkey PRIMARY KEY (id);


--
-- Name: content_history content_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_history
    ADD CONSTRAINT content_history_pkey PRIMARY KEY (id);


--
-- Name: content_index content_index_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_index
    ADD CONSTRAINT content_index_pkey PRIMARY KEY (id);


--
-- Name: content_performance content_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_performance
    ADD CONSTRAINT content_performance_pkey PRIMARY KEY (id);


--
-- Name: event_images event_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_images
    ADD CONSTRAINT event_images_pkey PRIMARY KEY (id);


--
-- Name: event_map_pin_rules event_map_pin_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_map_pin_rules
    ADD CONSTRAINT event_map_pin_rules_pkey PRIMARY KEY (id);


--
-- Name: event_map_pin_rules event_map_pin_rules_tier_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_map_pin_rules
    ADD CONSTRAINT event_map_pin_rules_tier_key UNIQUE (tier);


--
-- Name: event_tags event_tags_event_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_tags
    ADD CONSTRAINT event_tags_event_id_tag_id_key UNIQUE (event_id, tag_id);


--
-- Name: event_tags event_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_tags
    ADD CONSTRAINT event_tags_pkey PRIMARY KEY (id);


--
-- Name: event_tier_pricing event_tier_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_tier_pricing
    ADD CONSTRAINT event_tier_pricing_pkey PRIMARY KEY (id);


--
-- Name: event_tier_pricing event_tier_pricing_tier_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_tier_pricing
    ADD CONSTRAINT event_tier_pricing_tier_key UNIQUE (tier);


--
-- Name: event_tier_visibility_rules event_tier_visibility_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_tier_visibility_rules
    ADD CONSTRAINT event_tier_visibility_rules_pkey PRIMARY KEY (id);


--
-- Name: event_tier_visibility_rules event_tier_visibility_rules_tier_field_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_tier_visibility_rules
    ADD CONSTRAINT event_tier_visibility_rules_tier_field_name_key UNIQUE (tier, field_name);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: featured_slots featured_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.featured_slots
    ADD CONSTRAINT featured_slots_pkey PRIMARY KEY (id);


--
-- Name: headline_variants headline_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.headline_variants
    ADD CONSTRAINT headline_variants_pkey PRIMARY KEY (id);


--
-- Name: headline_variants headline_variants_post_id_variant_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.headline_variants
    ADD CONSTRAINT headline_variants_post_id_variant_number_key UNIQUE (post_id, variant_number);


--
-- Name: map_pin_rules map_pin_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_pin_rules
    ADD CONSTRAINT map_pin_rules_pkey PRIMARY KEY (id);


--
-- Name: map_pin_rules map_pin_rules_tier_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.map_pin_rules
    ADD CONSTRAINT map_pin_rules_tier_key UNIQUE (tier);


--
-- Name: media_assets media_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_pkey PRIMARY KEY (id);


--
-- Name: media_item_assets media_item_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_item_assets
    ADD CONSTRAINT media_item_assets_pkey PRIMARY KEY (id);


--
-- Name: media_item_assets media_item_assets_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_item_assets
    ADD CONSTRAINT media_item_assets_unique UNIQUE (media_item_id, asset_id);


--
-- Name: media_item_links media_item_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_item_links
    ADD CONSTRAINT media_item_links_pkey PRIMARY KEY (id);


--
-- Name: media_item_links media_item_links_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_item_links
    ADD CONSTRAINT media_item_links_unique UNIQUE (media_item_id, target_type, target_id);


--
-- Name: media_items media_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_items
    ADD CONSTRAINT media_items_pkey PRIMARY KEY (id);


--
-- Name: media_items media_items_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_items
    ADD CONSTRAINT media_items_slug_unique UNIQUE (slug);


--
-- Name: neighborhoods neighborhoods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT neighborhoods_pkey PRIMARY KEY (id);


--
-- Name: newsletter_posts newsletter_posts_newsletter_id_post_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_posts
    ADD CONSTRAINT newsletter_posts_newsletter_id_post_id_key UNIQUE (newsletter_id, post_id);


--
-- Name: newsletter_posts newsletter_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_posts
    ADD CONSTRAINT newsletter_posts_pkey PRIMARY KEY (id);


--
-- Name: newsletter_sections newsletter_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_sections
    ADD CONSTRAINT newsletter_sections_pkey PRIMARY KEY (id);


--
-- Name: newsletter_types newsletter_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_types
    ADD CONSTRAINT newsletter_types_pkey PRIMARY KEY (id);


--
-- Name: newsletter_types newsletter_types_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_types
    ADD CONSTRAINT newsletter_types_slug_unique UNIQUE (slug);


--
-- Name: newsletters newsletters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: pillars pillars_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pillars
    ADD CONSTRAINT pillars_pkey PRIMARY KEY (id);


--
-- Name: platform_performance platform_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_performance
    ADD CONSTRAINT platform_performance_pkey PRIMARY KEY (id);


--
-- Name: post_businesses post_businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_businesses
    ADD CONSTRAINT post_businesses_pkey PRIMARY KEY (id);


--
-- Name: post_businesses post_businesses_post_id_business_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_businesses
    ADD CONSTRAINT post_businesses_post_id_business_id_key UNIQUE (post_id, business_id);


--
-- Name: post_categories post_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT post_categories_pkey PRIMARY KEY (id);


--
-- Name: post_categories post_categories_post_id_category_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT post_categories_post_id_category_id_key UNIQUE (post_id, category_id);


--
-- Name: post_events post_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_events
    ADD CONSTRAINT post_events_pkey PRIMARY KEY (id);


--
-- Name: post_events post_events_post_id_event_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_events
    ADD CONSTRAINT post_events_post_id_event_id_key UNIQUE (post_id, event_id);


--
-- Name: post_images post_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_images
    ADD CONSTRAINT post_images_pkey PRIMARY KEY (id);


--
-- Name: post_neighborhoods post_neighborhoods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_neighborhoods
    ADD CONSTRAINT post_neighborhoods_pkey PRIMARY KEY (id);


--
-- Name: post_neighborhoods post_neighborhoods_post_id_neighborhood_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_neighborhoods
    ADD CONSTRAINT post_neighborhoods_post_id_neighborhood_id_key UNIQUE (post_id, neighborhood_id);


--
-- Name: post_source_stories post_source_stories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_source_stories
    ADD CONSTRAINT post_source_stories_pkey PRIMARY KEY (id);


--
-- Name: post_source_stories post_source_stories_post_id_story_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_source_stories
    ADD CONSTRAINT post_source_stories_post_id_story_id_key UNIQUE (post_id, story_id);


--
-- Name: post_sponsors post_sponsors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_sponsors
    ADD CONSTRAINT post_sponsors_pkey PRIMARY KEY (id);


--
-- Name: post_tags post_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_pkey PRIMARY KEY (id);


--
-- Name: post_tags post_tags_post_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_post_id_tag_id_key UNIQUE (post_id, tag_id);


--
-- Name: published_content published_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.published_content
    ADD CONSTRAINT published_content_pkey PRIMARY KEY (id);


--
-- Name: redirects redirects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redirects
    ADD CONSTRAINT redirects_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_business_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_business_id_user_id_key UNIQUE (business_id, user_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: saved_items saved_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_pkey PRIMARY KEY (id);


--
-- Name: saved_items saved_items_user_id_entity_type_entity_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_user_id_entity_type_entity_id_key UNIQUE (user_id, entity_type, entity_id);


--
-- Name: script_batches script_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.script_batches
    ADD CONSTRAINT script_batches_pkey PRIMARY KEY (id);


--
-- Name: scripts scripts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_pkey PRIMARY KEY (id);


--
-- Name: scripts scripts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_slug_unique UNIQUE (slug);


--
-- Name: seo_content_calendar seo_content_calendar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_content_calendar
    ADD CONSTRAINT seo_content_calendar_pkey PRIMARY KEY (id);


--
-- Name: sponsor_deliverables sponsor_deliverables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsor_deliverables
    ADD CONSTRAINT sponsor_deliverables_pkey PRIMARY KEY (id);


--
-- Name: sponsor_fulfillment_log sponsor_fulfillment_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsor_fulfillment_log
    ADD CONSTRAINT sponsor_fulfillment_log_pkey PRIMARY KEY (id);


--
-- Name: sponsor_packages sponsor_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsor_packages
    ADD CONSTRAINT sponsor_packages_pkey PRIMARY KEY (id);


--
-- Name: sponsor_packages sponsor_packages_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsor_packages
    ADD CONSTRAINT sponsor_packages_slug_key UNIQUE (slug);


--
-- Name: sponsors sponsors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_pkey PRIMARY KEY (id);


--
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (id);


--
-- Name: story_businesses story_businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_businesses
    ADD CONSTRAINT story_businesses_pkey PRIMARY KEY (id);


--
-- Name: story_businesses story_businesses_story_id_business_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_businesses
    ADD CONSTRAINT story_businesses_story_id_business_id_key UNIQUE (story_id, business_id);


--
-- Name: story_neighborhoods story_neighborhoods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_neighborhoods
    ADD CONSTRAINT story_neighborhoods_pkey PRIMARY KEY (id);


--
-- Name: story_neighborhoods story_neighborhoods_story_id_neighborhood_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_neighborhoods
    ADD CONSTRAINT story_neighborhoods_story_id_neighborhood_id_key UNIQUE (story_id, neighborhood_id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tier_changes tier_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_changes
    ADD CONSTRAINT tier_changes_pkey PRIMARY KEY (id);


--
-- Name: tier_visibility_rules tier_visibility_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_visibility_rules
    ADD CONSTRAINT tier_visibility_rules_pkey PRIMARY KEY (id);


--
-- Name: tier_visibility_rules tier_visibility_rules_tier_field_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_visibility_rules
    ADD CONSTRAINT tier_visibility_rules_tier_field_name_key UNIQUE (tier, field_name);


--
-- Name: trending_topics trending_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trending_topics
    ADD CONSTRAINT trending_topics_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: watchlist watchlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_pkey PRIMARY KEY (id);


--
-- Name: watchlist_posts watchlist_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist_posts
    ADD CONSTRAINT watchlist_posts_pkey PRIMARY KEY (id);


--
-- Name: watchlist_posts watchlist_posts_watchlist_id_post_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist_posts
    ADD CONSTRAINT watchlist_posts_watchlist_id_post_id_key UNIQUE (watchlist_id, post_id);


--
-- Name: watchlist_stories watchlist_stories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist_stories
    ADD CONSTRAINT watchlist_stories_pkey PRIMARY KEY (id);


--
-- Name: watchlist_stories watchlist_stories_watchlist_id_story_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist_stories
    ADD CONSTRAINT watchlist_stories_watchlist_id_story_id_key UNIQUE (watchlist_id, story_id);


--
-- Name: ad_campaigns_sponsor_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ad_campaigns_sponsor_idx ON public.ad_campaigns USING btree (sponsor_id);


--
-- Name: ad_campaigns_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ad_campaigns_status_idx ON public.ad_campaigns USING btree (status);


--
-- Name: ad_creatives_campaign_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ad_creatives_campaign_idx ON public.ad_creatives USING btree (campaign_id);


--
-- Name: ad_flights_dates_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ad_flights_dates_idx ON public.ad_flights USING btree (start_date, end_date);


--
-- Name: ad_flights_placement_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ad_flights_placement_idx ON public.ad_flights USING btree (placement_id);


--
-- Name: ad_flights_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ad_flights_status_idx ON public.ad_flights USING btree (status);


--
-- Name: ad_placements_key_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ad_placements_key_unique ON public.ad_placements USING btree (placement_key);


--
-- Name: amenities_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX amenities_slug_unique ON public.amenities USING btree (slug);


--
-- Name: areas_city_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX areas_city_id_idx ON public.areas USING btree (city_id);


--
-- Name: areas_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX areas_slug_unique ON public.areas USING btree (slug);


--
-- Name: authors_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX authors_slug_unique ON public.authors USING btree (slug);


--
-- Name: blog_posts_neighborhood_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blog_posts_neighborhood_idx ON public.blog_posts USING btree (neighborhood_id);


--
-- Name: blog_posts_pillar_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blog_posts_pillar_idx ON public.blog_posts USING btree (pillar_id);


--
-- Name: blog_posts_published_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blog_posts_published_at_idx ON public.blog_posts USING btree (published_at);


--
-- Name: blog_posts_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blog_posts_slug_unique ON public.blog_posts USING btree (slug);


--
-- Name: blog_posts_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blog_posts_status_idx ON public.blog_posts USING btree (status);


--
-- Name: blog_posts_token_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blog_posts_token_name_idx ON public.blog_posts USING btree (token_name);


--
-- Name: blog_posts_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blog_posts_type_idx ON public.blog_posts USING btree (type);


--
-- Name: business_identity_options_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX business_identity_options_slug_unique ON public.business_identity_options USING btree (slug);


--
-- Name: business_listings_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX business_listings_category_idx ON public.business_listings USING btree (category_id);


--
-- Name: business_listings_claimed_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX business_listings_claimed_idx ON public.business_listings USING btree (claimed);


--
-- Name: business_listings_is_featured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX business_listings_is_featured_idx ON public.business_listings USING btree (is_featured);


--
-- Name: business_listings_neighborhood_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX business_listings_neighborhood_idx ON public.business_listings USING btree (neighborhood_id);


--
-- Name: business_listings_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX business_listings_slug_unique ON public.business_listings USING btree (slug);


--
-- Name: business_listings_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX business_listings_status_idx ON public.business_listings USING btree (status);


--
-- Name: business_listings_tier_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX business_listings_tier_idx ON public.business_listings USING btree (tier);


--
-- Name: categories_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_active_idx ON public.categories USING btree (is_active);


--
-- Name: categories_applies_to_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_applies_to_gin ON public.categories USING gin (applies_to);


--
-- Name: categories_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_unique ON public.categories USING btree (slug);


--
-- Name: cities_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cities_slug_unique ON public.cities USING btree (slug);


--
-- Name: claims_business_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX claims_business_id_idx ON public.claims USING btree (business_id);


--
-- Name: claims_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX claims_status_idx ON public.claims USING btree (claim_status);


--
-- Name: content_index_target_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX content_index_target_type_idx ON public.content_index USING btree (target_type);


--
-- Name: content_index_token_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX content_index_token_unique ON public.content_index USING btree (token_name);


--
-- Name: events_featured_until_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX events_featured_until_idx ON public.events USING btree (featured_until);


--
-- Name: events_is_featured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX events_is_featured_idx ON public.events USING btree (is_featured);


--
-- Name: events_neighborhood_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX events_neighborhood_idx ON public.events USING btree (neighborhood_id);


--
-- Name: events_organizer_business_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX events_organizer_business_idx ON public.events USING btree (organizer_business_id);


--
-- Name: events_payment_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX events_payment_status_idx ON public.events USING btree (payment_status);


--
-- Name: events_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX events_slug_unique ON public.events USING btree (slug);


--
-- Name: events_start_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX events_start_date_idx ON public.events USING btree (start_date);


--
-- Name: events_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX events_status_idx ON public.events USING btree (status);


--
-- Name: events_tier_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX events_tier_idx ON public.events USING btree (tier);


--
-- Name: events_venue_business_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX events_venue_business_idx ON public.events USING btree (venue_business_id);


--
-- Name: featured_slots_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX featured_slots_active_idx ON public.featured_slots USING btree (is_active);


--
-- Name: featured_slots_placement_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX featured_slots_placement_idx ON public.featured_slots USING btree (placement_key);


--
-- Name: idx_ad_flights_area; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ad_flights_area ON public.ad_flights USING btree (area_id);


--
-- Name: idx_ad_flights_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ad_flights_category ON public.ad_flights USING btree (category_id);


--
-- Name: idx_ad_flights_neighborhood; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ad_flights_neighborhood ON public.ad_flights USING btree (neighborhood_id);


--
-- Name: idx_blog_posts_content_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_content_type ON public.blog_posts USING btree (content_type);


--
-- Name: idx_content_calendar_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_calendar_date ON public.content_calendar USING btree (scheduled_date, tier);


--
-- Name: idx_content_history_angle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_history_angle ON public.content_history USING btree (category_id, neighborhood_id, published_at);


--
-- Name: idx_content_performance_measured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_performance_measured ON public.content_performance USING btree (measured_at);


--
-- Name: idx_content_performance_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_performance_published ON public.content_performance USING btree (published_content_id);


--
-- Name: idx_fulfillment_log_delivered_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fulfillment_log_delivered_at ON public.sponsor_fulfillment_log USING btree (delivered_at DESC);


--
-- Name: idx_fulfillment_log_sponsor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fulfillment_log_sponsor_id ON public.sponsor_fulfillment_log USING btree (sponsor_id);


--
-- Name: idx_headline_variants_post; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_headline_variants_post ON public.headline_variants USING btree (post_id);


--
-- Name: idx_platform_performance_measured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_performance_measured ON public.platform_performance USING btree (measured_at);


--
-- Name: idx_platform_performance_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_performance_platform ON public.platform_performance USING btree (platform);


--
-- Name: idx_post_sponsors_post; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_sponsors_post ON public.post_sponsors USING btree (post_id);


--
-- Name: idx_post_sponsors_sponsor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_sponsors_sponsor ON public.post_sponsors USING btree (sponsor_id);


--
-- Name: idx_published_content_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_published_content_platform ON public.published_content USING btree (platform);


--
-- Name: idx_published_content_platform_post; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_published_content_platform_post ON public.published_content USING btree (platform_post_id);


--
-- Name: idx_published_content_source_story; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_published_content_source_story ON public.published_content USING btree (source_story_id);


--
-- Name: idx_sponsor_deliverables_sponsor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sponsor_deliverables_sponsor_id ON public.sponsor_deliverables USING btree (sponsor_id);


--
-- Name: idx_sponsor_deliverables_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sponsor_deliverables_type ON public.sponsor_deliverables USING btree (deliverable_type);


--
-- Name: idx_sponsors_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sponsors_active ON public.sponsors USING btree (is_active);


--
-- Name: idx_sponsors_package; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sponsors_package ON public.sponsors USING btree (package_type);


--
-- Name: idx_stories_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stories_expires ON public.stories USING btree (expires_at);


--
-- Name: idx_stories_neighborhood; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stories_neighborhood ON public.stories USING btree (neighborhood_id);


--
-- Name: idx_stories_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stories_score ON public.stories USING btree (score DESC);


--
-- Name: idx_stories_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stories_status ON public.stories USING btree (status);


--
-- Name: idx_stories_tier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stories_tier ON public.stories USING btree (tier);


--
-- Name: idx_story_businesses_biz; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_story_businesses_biz ON public.story_businesses USING btree (business_id);


--
-- Name: idx_story_businesses_story; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_story_businesses_story ON public.story_businesses USING btree (story_id);


--
-- Name: idx_system_logs_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_created ON public.system_logs USING btree (created_at);


--
-- Name: idx_system_logs_scenario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_scenario ON public.system_logs USING btree (scenario);


--
-- Name: idx_system_logs_severity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_severity ON public.system_logs USING btree (severity);


--
-- Name: idx_system_logs_unresolved; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_unresolved ON public.system_logs USING btree (resolved) WHERE (resolved = false);


--
-- Name: idx_trending_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trending_active ON public.trending_topics USING btree (is_active, mention_count DESC);


--
-- Name: media_assets_file_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_assets_file_type_idx ON public.media_assets USING btree (file_type);


--
-- Name: media_assets_folder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_assets_folder_idx ON public.media_assets USING btree (folder);


--
-- Name: media_item_assets_asset_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_item_assets_asset_idx ON public.media_item_assets USING btree (asset_id);


--
-- Name: media_item_assets_media_item_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_item_assets_media_item_idx ON public.media_item_assets USING btree (media_item_id);


--
-- Name: media_item_assets_one_primary_per_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX media_item_assets_one_primary_per_item ON public.media_item_assets USING btree (media_item_id) WHERE (is_primary = true);


--
-- Name: media_item_links_media_item_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_item_links_media_item_idx ON public.media_item_links USING btree (media_item_id);


--
-- Name: media_item_links_one_primary_per_target; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX media_item_links_one_primary_per_target ON public.media_item_links USING btree (target_type, target_id) WHERE (is_primary_for_target = true);


--
-- Name: media_item_links_target_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_item_links_target_idx ON public.media_item_links USING btree (target_type, target_id);


--
-- Name: media_items_featured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_items_featured_idx ON public.media_items USING btree (is_featured, published_at DESC);


--
-- Name: media_items_published_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_items_published_at_idx ON public.media_items USING btree (published_at DESC);


--
-- Name: media_items_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_items_status_idx ON public.media_items USING btree (status);


--
-- Name: neighborhoods_area_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX neighborhoods_area_id_idx ON public.neighborhoods USING btree (area_id);


--
-- Name: neighborhoods_is_featured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX neighborhoods_is_featured_idx ON public.neighborhoods USING btree (is_featured);


--
-- Name: neighborhoods_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX neighborhoods_slug_unique ON public.neighborhoods USING btree (slug);


--
-- Name: newsletters_issue_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX newsletters_issue_date_idx ON public.newsletters USING btree (issue_date);


--
-- Name: newsletters_issue_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX newsletters_issue_slug_unique ON public.newsletters USING btree (issue_slug);


--
-- Name: newsletters_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX newsletters_status_idx ON public.newsletters USING btree (status);


--
-- Name: organizations_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX organizations_slug_unique ON public.organizations USING btree (slug);


--
-- Name: pillars_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pillars_slug_unique ON public.pillars USING btree (slug);


--
-- Name: redirects_from_path_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX redirects_from_path_unique ON public.redirects USING btree (from_path);


--
-- Name: reviews_business_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_business_id_idx ON public.reviews USING btree (business_id);


--
-- Name: reviews_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_status_idx ON public.reviews USING btree (status);


--
-- Name: saved_items_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX saved_items_user_idx ON public.saved_items USING btree (user_id);


--
-- Name: scripts_batch_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX scripts_batch_idx ON public.scripts USING btree (script_batch_id);


--
-- Name: scripts_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX scripts_status_idx ON public.scripts USING btree (status);


--
-- Name: seo_calendar_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX seo_calendar_status_idx ON public.seo_content_calendar USING btree (status);


--
-- Name: sponsors_business_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sponsors_business_idx ON public.sponsors USING btree (business_id);


--
-- Name: sponsors_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sponsors_status_idx ON public.sponsors USING btree (status);


--
-- Name: stories_pillar_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stories_pillar_idx ON public.stories USING btree (pillar_id);


--
-- Name: stories_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stories_priority_idx ON public.stories USING btree (priority);


--
-- Name: submissions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX submissions_status_idx ON public.submissions USING btree (status);


--
-- Name: submissions_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX submissions_type_idx ON public.submissions USING btree (submission_type);


--
-- Name: subscriptions_business_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_business_id_idx ON public.subscriptions USING btree (business_id);


--
-- Name: subscriptions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_status_idx ON public.subscriptions USING btree (status);


--
-- Name: tags_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tags_slug_unique ON public.tags USING btree (slug);


--
-- Name: tier_changes_business_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tier_changes_business_id_idx ON public.tier_changes USING btree (business_id);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: watchlist_neighborhood_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX watchlist_neighborhood_idx ON public.watchlist USING btree (neighborhood_id);


--
-- Name: watchlist_slug_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX watchlist_slug_unique ON public.watchlist USING btree (slug);


--
-- Name: watchlist_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX watchlist_status_idx ON public.watchlist USING btree (status);


--
-- Name: ad_campaigns trg_ad_campaigns_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_ad_campaigns_updated_at BEFORE UPDATE ON public.ad_campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: ad_creatives trg_ad_creatives_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_ad_creatives_updated_at BEFORE UPDATE ON public.ad_creatives FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: ad_flights trg_ad_flights_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_ad_flights_updated_at BEFORE UPDATE ON public.ad_flights FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: areas trg_areas_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_areas_updated_at BEFORE UPDATE ON public.areas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: authors trg_authors_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_authors_updated_at BEFORE UPDATE ON public.authors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: blog_posts trg_blog_posts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: brands trg_brands_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: business_listings trg_business_listings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_business_listings_updated_at BEFORE UPDATE ON public.business_listings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: categories trg_categories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: cities trg_cities_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: claims trg_claims_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_claims_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: content_index trg_content_index_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_content_index_updated_at BEFORE UPDATE ON public.content_index FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: event_tier_pricing trg_event_tier_pricing_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_event_tier_pricing_updated_at BEFORE UPDATE ON public.event_tier_pricing FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: events trg_events_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: featured_slots trg_featured_slots_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_featured_slots_updated_at BEFORE UPDATE ON public.featured_slots FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: media_assets trg_media_assets_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_media_assets_updated_at BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: media_item_assets trg_media_item_assets_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_media_item_assets_updated_at BEFORE UPDATE ON public.media_item_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: media_item_links trg_media_item_links_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_media_item_links_updated_at BEFORE UPDATE ON public.media_item_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: media_items trg_media_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_media_items_updated_at BEFORE UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: neighborhoods trg_neighborhoods_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_neighborhoods_updated_at BEFORE UPDATE ON public.neighborhoods FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: newsletters trg_newsletters_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_newsletters_updated_at BEFORE UPDATE ON public.newsletters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: pillars trg_pillars_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_pillars_updated_at BEFORE UPDATE ON public.pillars FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: reviews trg_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: script_batches trg_script_batches_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_script_batches_updated_at BEFORE UPDATE ON public.script_batches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: scripts trg_scripts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_scripts_updated_at BEFORE UPDATE ON public.scripts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: seo_content_calendar trg_seo_calendar_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_seo_calendar_updated_at BEFORE UPDATE ON public.seo_content_calendar FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: sponsors trg_sponsors_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_sponsors_updated_at BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: stories trg_stories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_stories_updated_at BEFORE UPDATE ON public.stories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: submissions trg_submissions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: subscriptions trg_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: watchlist trg_watchlist_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_watchlist_updated_at BEFORE UPDATE ON public.watchlist FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: ad_campaigns ad_campaigns_sponsor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_campaigns
    ADD CONSTRAINT ad_campaigns_sponsor_id_fkey FOREIGN KEY (sponsor_id) REFERENCES public.sponsors(id) ON DELETE CASCADE;


--
-- Name: ad_creatives ad_creatives_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_creatives
    ADD CONSTRAINT ad_creatives_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.ad_campaigns(id) ON DELETE CASCADE;


--
-- Name: ad_creatives ad_creatives_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_creatives
    ADD CONSTRAINT ad_creatives_media_asset_id_fkey FOREIGN KEY (media_asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;


--
-- Name: ad_flights ad_flights_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_flights
    ADD CONSTRAINT ad_flights_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE SET NULL;


--
-- Name: ad_flights ad_flights_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_flights
    ADD CONSTRAINT ad_flights_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.ad_campaigns(id) ON DELETE CASCADE;


--
-- Name: ad_flights ad_flights_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_flights
    ADD CONSTRAINT ad_flights_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: ad_flights ad_flights_creative_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_flights
    ADD CONSTRAINT ad_flights_creative_id_fkey FOREIGN KEY (creative_id) REFERENCES public.ad_creatives(id) ON DELETE CASCADE;


--
-- Name: ad_flights ad_flights_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_flights
    ADD CONSTRAINT ad_flights_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id) ON DELETE SET NULL;


--
-- Name: ad_flights ad_flights_placement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_flights
    ADD CONSTRAINT ad_flights_placement_id_fkey FOREIGN KEY (placement_id) REFERENCES public.ad_placements(id) ON DELETE CASCADE;


--
-- Name: areas areas_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE SET NULL;


--
-- Name: blog_posts blog_posts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: blog_posts blog_posts_content_index_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_content_index_fkey FOREIGN KEY (content_index_record_id) REFERENCES public.content_index(id) ON DELETE SET NULL;


--
-- Name: blog_posts blog_posts_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id) ON DELETE SET NULL;


--
-- Name: blog_posts blog_posts_pillar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pillar_id_fkey FOREIGN KEY (pillar_id) REFERENCES public.pillars(id) ON DELETE SET NULL;


--
-- Name: blog_posts blog_posts_sponsor_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_sponsor_business_id_fkey FOREIGN KEY (sponsor_business_id) REFERENCES public.business_listings(id) ON DELETE SET NULL;


--
-- Name: business_amenities business_amenities_amenity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_amenities
    ADD CONSTRAINT business_amenities_amenity_id_fkey FOREIGN KEY (amenity_id) REFERENCES public.amenities(id) ON DELETE CASCADE;


--
-- Name: business_amenities business_amenities_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_amenities
    ADD CONSTRAINT business_amenities_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: business_contacts business_contacts_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_contacts
    ADD CONSTRAINT business_contacts_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: business_hours business_hours_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_hours
    ADD CONSTRAINT business_hours_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: business_identities business_identities_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_identities
    ADD CONSTRAINT business_identities_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: business_identities business_identities_identity_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_identities
    ADD CONSTRAINT business_identities_identity_option_id_fkey FOREIGN KEY (identity_option_id) REFERENCES public.business_identity_options(id) ON DELETE CASCADE;


--
-- Name: business_images business_images_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_images
    ADD CONSTRAINT business_images_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: business_images business_images_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_images
    ADD CONSTRAINT business_images_media_asset_id_fkey FOREIGN KEY (media_asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;


--
-- Name: business_listings business_listings_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_listings
    ADD CONSTRAINT business_listings_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: business_listings business_listings_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_listings
    ADD CONSTRAINT business_listings_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: business_listings business_listings_claimed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_listings
    ADD CONSTRAINT business_listings_claimed_by_fkey FOREIGN KEY (claimed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: business_listings business_listings_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_listings
    ADD CONSTRAINT business_listings_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id) ON DELETE RESTRICT;


--
-- Name: business_listings business_listings_parent_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_listings
    ADD CONSTRAINT business_listings_parent_brand_id_fkey FOREIGN KEY (parent_brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: business_organizations business_organizations_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_organizations
    ADD CONSTRAINT business_organizations_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: business_organizations business_organizations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_organizations
    ADD CONSTRAINT business_organizations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: business_tags business_tags_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_tags
    ADD CONSTRAINT business_tags_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: business_tags business_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_tags
    ADD CONSTRAINT business_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: claims claims_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: claims claims_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: claims claims_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: content_calendar content_calendar_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_calendar
    ADD CONSTRAINT content_calendar_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id);


--
-- Name: content_calendar content_calendar_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_calendar
    ADD CONSTRAINT content_calendar_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id);


--
-- Name: content_history content_history_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_history
    ADD CONSTRAINT content_history_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: content_history content_history_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_history
    ADD CONSTRAINT content_history_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id);


--
-- Name: content_history content_history_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_history
    ADD CONSTRAINT content_history_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id);


--
-- Name: content_history content_history_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_history
    ADD CONSTRAINT content_history_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: content_performance content_performance_published_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_performance
    ADD CONSTRAINT content_performance_published_content_id_fkey FOREIGN KEY (published_content_id) REFERENCES public.published_content(id) ON DELETE CASCADE;


--
-- Name: event_images event_images_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_images
    ADD CONSTRAINT event_images_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_images event_images_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_images
    ADD CONSTRAINT event_images_media_asset_id_fkey FOREIGN KEY (media_asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;


--
-- Name: event_tags event_tags_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_tags
    ADD CONSTRAINT event_tags_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_tags event_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_tags
    ADD CONSTRAINT event_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: events events_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: events events_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: events events_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id) ON DELETE SET NULL;


--
-- Name: events events_organizer_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_organizer_business_id_fkey FOREIGN KEY (organizer_business_id) REFERENCES public.business_listings(id) ON DELETE SET NULL;


--
-- Name: events events_pillar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pillar_id_fkey FOREIGN KEY (pillar_id) REFERENCES public.pillars(id) ON DELETE SET NULL;


--
-- Name: events events_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: events events_venue_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_venue_business_id_fkey FOREIGN KEY (venue_business_id) REFERENCES public.business_listings(id) ON DELETE SET NULL;


--
-- Name: featured_slots featured_slots_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.featured_slots
    ADD CONSTRAINT featured_slots_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: headline_variants headline_variants_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.headline_variants
    ADD CONSTRAINT headline_variants_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: media_assets media_assets_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: media_item_assets media_item_assets_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_item_assets
    ADD CONSTRAINT media_item_assets_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.media_assets(id) ON DELETE RESTRICT;


--
-- Name: media_item_assets media_item_assets_media_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_item_assets
    ADD CONSTRAINT media_item_assets_media_item_id_fkey FOREIGN KEY (media_item_id) REFERENCES public.media_items(id) ON DELETE CASCADE;


--
-- Name: media_item_links media_item_links_media_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_item_links
    ADD CONSTRAINT media_item_links_media_item_id_fkey FOREIGN KEY (media_item_id) REFERENCES public.media_items(id) ON DELETE CASCADE;


--
-- Name: neighborhoods neighborhoods_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT neighborhoods_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE CASCADE;


--
-- Name: newsletter_posts newsletter_posts_newsletter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_posts
    ADD CONSTRAINT newsletter_posts_newsletter_id_fkey FOREIGN KEY (newsletter_id) REFERENCES public.newsletters(id) ON DELETE CASCADE;


--
-- Name: newsletter_posts newsletter_posts_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_posts
    ADD CONSTRAINT newsletter_posts_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: newsletter_posts newsletter_posts_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_posts
    ADD CONSTRAINT newsletter_posts_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.newsletter_sections(id) ON DELETE SET NULL;


--
-- Name: newsletter_sections newsletter_sections_newsletter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_sections
    ADD CONSTRAINT newsletter_sections_newsletter_id_fkey FOREIGN KEY (newsletter_id) REFERENCES public.newsletters(id) ON DELETE CASCADE;


--
-- Name: newsletters newsletters_newsletter_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_newsletter_type_id_fkey FOREIGN KEY (newsletter_type_id) REFERENCES public.newsletter_types(id);


--
-- Name: newsletters newsletters_sponsor_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_sponsor_business_id_fkey FOREIGN KEY (sponsor_business_id) REFERENCES public.business_listings(id) ON DELETE SET NULL;


--
-- Name: post_businesses post_businesses_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_businesses
    ADD CONSTRAINT post_businesses_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: post_businesses post_businesses_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_businesses
    ADD CONSTRAINT post_businesses_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: post_categories post_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT post_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: post_categories post_categories_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_categories
    ADD CONSTRAINT post_categories_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: post_events post_events_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_events
    ADD CONSTRAINT post_events_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: post_events post_events_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_events
    ADD CONSTRAINT post_events_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: post_images post_images_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_images
    ADD CONSTRAINT post_images_media_asset_id_fkey FOREIGN KEY (media_asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;


--
-- Name: post_images post_images_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_images
    ADD CONSTRAINT post_images_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: post_neighborhoods post_neighborhoods_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_neighborhoods
    ADD CONSTRAINT post_neighborhoods_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id) ON DELETE CASCADE;


--
-- Name: post_neighborhoods post_neighborhoods_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_neighborhoods
    ADD CONSTRAINT post_neighborhoods_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: post_source_stories post_source_stories_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_source_stories
    ADD CONSTRAINT post_source_stories_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: post_source_stories post_source_stories_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_source_stories
    ADD CONSTRAINT post_source_stories_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: post_sponsors post_sponsors_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_sponsors
    ADD CONSTRAINT post_sponsors_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: post_sponsors post_sponsors_sponsor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_sponsors
    ADD CONSTRAINT post_sponsors_sponsor_id_fkey FOREIGN KEY (sponsor_id) REFERENCES public.sponsors(id) ON DELETE CASCADE;


--
-- Name: post_tags post_tags_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: post_tags post_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_tags
    ADD CONSTRAINT post_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: published_content published_content_media_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.published_content
    ADD CONSTRAINT published_content_media_item_id_fkey FOREIGN KEY (media_item_id) REFERENCES public.media_items(id);


--
-- Name: published_content published_content_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.published_content
    ADD CONSTRAINT published_content_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id);


--
-- Name: published_content published_content_source_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.published_content
    ADD CONSTRAINT published_content_source_story_id_fkey FOREIGN KEY (source_story_id) REFERENCES public.stories(id);


--
-- Name: reviews reviews_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_moderated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: saved_items saved_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: scripts scripts_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id) ON DELETE SET NULL;


--
-- Name: scripts scripts_pillar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_pillar_id_fkey FOREIGN KEY (pillar_id) REFERENCES public.pillars(id) ON DELETE SET NULL;


--
-- Name: scripts scripts_script_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_script_batch_id_fkey FOREIGN KEY (script_batch_id) REFERENCES public.script_batches(id) ON DELETE SET NULL;


--
-- Name: scripts scripts_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE SET NULL;


--
-- Name: seo_content_calendar seo_content_calendar_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_content_calendar
    ADD CONSTRAINT seo_content_calendar_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: seo_content_calendar seo_content_calendar_content_index_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_content_calendar
    ADD CONSTRAINT seo_content_calendar_content_index_id_fkey FOREIGN KEY (content_index_id) REFERENCES public.content_index(id) ON DELETE SET NULL;


--
-- Name: seo_content_calendar seo_content_calendar_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_content_calendar
    ADD CONSTRAINT seo_content_calendar_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id) ON DELETE SET NULL;


--
-- Name: seo_content_calendar seo_content_calendar_pillar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_content_calendar
    ADD CONSTRAINT seo_content_calendar_pillar_id_fkey FOREIGN KEY (pillar_id) REFERENCES public.pillars(id) ON DELETE SET NULL;


--
-- Name: seo_content_calendar seo_content_calendar_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_content_calendar
    ADD CONSTRAINT seo_content_calendar_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE SET NULL;


--
-- Name: sponsor_deliverables sponsor_deliverables_sponsor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsor_deliverables
    ADD CONSTRAINT sponsor_deliverables_sponsor_id_fkey FOREIGN KEY (sponsor_id) REFERENCES public.sponsors(id) ON DELETE CASCADE;


--
-- Name: sponsor_fulfillment_log sponsor_fulfillment_log_deliverable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsor_fulfillment_log
    ADD CONSTRAINT sponsor_fulfillment_log_deliverable_id_fkey FOREIGN KEY (deliverable_id) REFERENCES public.sponsor_deliverables(id) ON DELETE SET NULL;


--
-- Name: sponsor_fulfillment_log sponsor_fulfillment_log_media_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsor_fulfillment_log
    ADD CONSTRAINT sponsor_fulfillment_log_media_item_id_fkey FOREIGN KEY (media_item_id) REFERENCES public.media_items(id) ON DELETE SET NULL;


--
-- Name: sponsor_fulfillment_log sponsor_fulfillment_log_newsletter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsor_fulfillment_log
    ADD CONSTRAINT sponsor_fulfillment_log_newsletter_id_fkey FOREIGN KEY (newsletter_id) REFERENCES public.newsletters(id) ON DELETE SET NULL;


--
-- Name: sponsor_fulfillment_log sponsor_fulfillment_log_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsor_fulfillment_log
    ADD CONSTRAINT sponsor_fulfillment_log_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE SET NULL;


--
-- Name: sponsor_fulfillment_log sponsor_fulfillment_log_sponsor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsor_fulfillment_log
    ADD CONSTRAINT sponsor_fulfillment_log_sponsor_id_fkey FOREIGN KEY (sponsor_id) REFERENCES public.sponsors(id) ON DELETE CASCADE;


--
-- Name: sponsors sponsors_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE SET NULL;


--
-- Name: sponsors sponsors_category_focus_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_category_focus_fkey FOREIGN KEY (category_focus) REFERENCES public.categories(id);


--
-- Name: sponsors sponsors_content_index_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_content_index_id_fkey FOREIGN KEY (content_index_id) REFERENCES public.content_index(id) ON DELETE SET NULL;


--
-- Name: sponsors sponsors_neighborhood_focus_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_neighborhood_focus_fkey FOREIGN KEY (neighborhood_focus) REFERENCES public.neighborhoods(id);


--
-- Name: sponsors sponsors_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.sponsor_packages(id) ON DELETE SET NULL;


--
-- Name: stories stories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: stories stories_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE SET NULL;


--
-- Name: stories stories_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id);


--
-- Name: stories stories_pillar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pillar_id_fkey FOREIGN KEY (pillar_id) REFERENCES public.pillars(id) ON DELETE SET NULL;


--
-- Name: story_businesses story_businesses_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_businesses
    ADD CONSTRAINT story_businesses_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: story_businesses story_businesses_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_businesses
    ADD CONSTRAINT story_businesses_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: story_neighborhoods story_neighborhoods_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_neighborhoods
    ADD CONSTRAINT story_neighborhoods_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id) ON DELETE CASCADE;


--
-- Name: story_neighborhoods story_neighborhoods_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_neighborhoods
    ADD CONSTRAINT story_neighborhoods_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: submissions submissions_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: subscriptions subscriptions_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: system_logs system_logs_media_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_media_item_id_fkey FOREIGN KEY (media_item_id) REFERENCES public.media_items(id);


--
-- Name: system_logs system_logs_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id);


--
-- Name: system_logs system_logs_published_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_published_content_id_fkey FOREIGN KEY (published_content_id) REFERENCES public.published_content(id);


--
-- Name: system_logs system_logs_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id);


--
-- Name: tier_changes tier_changes_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_changes
    ADD CONSTRAINT tier_changes_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tier_changes tier_changes_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_changes
    ADD CONSTRAINT tier_changes_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_listings(id) ON DELETE CASCADE;


--
-- Name: tier_changes tier_changes_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tier_changes
    ADD CONSTRAINT tier_changes_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: users users_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE SET NULL;


--
-- Name: users users_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id) ON DELETE SET NULL;


--
-- Name: watchlist watchlist_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE SET NULL;


--
-- Name: watchlist watchlist_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id) ON DELETE SET NULL;


--
-- Name: watchlist_posts watchlist_posts_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist_posts
    ADD CONSTRAINT watchlist_posts_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: watchlist_posts watchlist_posts_watchlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist_posts
    ADD CONSTRAINT watchlist_posts_watchlist_id_fkey FOREIGN KEY (watchlist_id) REFERENCES public.watchlist(id) ON DELETE CASCADE;


--
-- Name: watchlist_stories watchlist_stories_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist_stories
    ADD CONSTRAINT watchlist_stories_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: watchlist_stories watchlist_stories_watchlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist_stories
    ADD CONSTRAINT watchlist_stories_watchlist_id_fkey FOREIGN KEY (watchlist_id) REFERENCES public.watchlist(id) ON DELETE CASCADE;


--
-- Name: ad_campaigns Admin/editor full delete on ad_campaigns; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on ad_campaigns" ON public.ad_campaigns FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: ad_creatives Admin/editor full delete on ad_creatives; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on ad_creatives" ON public.ad_creatives FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: ad_flights Admin/editor full delete on ad_flights; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on ad_flights" ON public.ad_flights FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: ad_placements Admin/editor full delete on ad_placements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on ad_placements" ON public.ad_placements FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: amenities Admin/editor full delete on amenities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on amenities" ON public.amenities FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: areas Admin/editor full delete on areas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on areas" ON public.areas FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: authors Admin/editor full delete on authors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on authors" ON public.authors FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: blog_posts Admin/editor full delete on blog_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on blog_posts" ON public.blog_posts FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: brands Admin/editor full delete on brands; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on brands" ON public.brands FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: business_amenities Admin/editor full delete on business_amenities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on business_amenities" ON public.business_amenities FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: business_contacts Admin/editor full delete on business_contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on business_contacts" ON public.business_contacts FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: business_hours Admin/editor full delete on business_hours; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on business_hours" ON public.business_hours FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: business_identities Admin/editor full delete on business_identities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on business_identities" ON public.business_identities FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: business_identity_options Admin/editor full delete on business_identity_options; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on business_identity_options" ON public.business_identity_options FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: business_images Admin/editor full delete on business_images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on business_images" ON public.business_images FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: business_listings Admin/editor full delete on business_listings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on business_listings" ON public.business_listings FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: business_organizations Admin/editor full delete on business_organizations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on business_organizations" ON public.business_organizations FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: business_tags Admin/editor full delete on business_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on business_tags" ON public.business_tags FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: categories Admin/editor full delete on categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on categories" ON public.categories FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: cities Admin/editor full delete on cities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on cities" ON public.cities FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: claims Admin/editor full delete on claims; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on claims" ON public.claims FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: content_index Admin/editor full delete on content_index; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on content_index" ON public.content_index FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: event_images Admin/editor full delete on event_images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on event_images" ON public.event_images FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: event_map_pin_rules Admin/editor full delete on event_map_pin_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on event_map_pin_rules" ON public.event_map_pin_rules FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: event_tags Admin/editor full delete on event_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on event_tags" ON public.event_tags FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: event_tier_visibility_rules Admin/editor full delete on event_tier_visibility_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on event_tier_visibility_rules" ON public.event_tier_visibility_rules FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: events Admin/editor full delete on events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on events" ON public.events FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: featured_slots Admin/editor full delete on featured_slots; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on featured_slots" ON public.featured_slots FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: map_pin_rules Admin/editor full delete on map_pin_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on map_pin_rules" ON public.map_pin_rules FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: media_assets Admin/editor full delete on media_assets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on media_assets" ON public.media_assets FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: neighborhoods Admin/editor full delete on neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on neighborhoods" ON public.neighborhoods FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: newsletter_posts Admin/editor full delete on newsletter_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on newsletter_posts" ON public.newsletter_posts FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: newsletter_sections Admin/editor full delete on newsletter_sections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on newsletter_sections" ON public.newsletter_sections FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: newsletter_types Admin/editor full delete on newsletter_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on newsletter_types" ON public.newsletter_types FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: newsletters Admin/editor full delete on newsletters; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on newsletters" ON public.newsletters FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: organizations Admin/editor full delete on organizations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on organizations" ON public.organizations FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: pillars Admin/editor full delete on pillars; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on pillars" ON public.pillars FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: post_businesses Admin/editor full delete on post_businesses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on post_businesses" ON public.post_businesses FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: post_categories Admin/editor full delete on post_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on post_categories" ON public.post_categories FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: post_events Admin/editor full delete on post_events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on post_events" ON public.post_events FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: post_images Admin/editor full delete on post_images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on post_images" ON public.post_images FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: post_neighborhoods Admin/editor full delete on post_neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on post_neighborhoods" ON public.post_neighborhoods FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: post_source_stories Admin/editor full delete on post_source_stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on post_source_stories" ON public.post_source_stories FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: post_tags Admin/editor full delete on post_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on post_tags" ON public.post_tags FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: redirects Admin/editor full delete on redirects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on redirects" ON public.redirects FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: reviews Admin/editor full delete on reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on reviews" ON public.reviews FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: saved_items Admin/editor full delete on saved_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on saved_items" ON public.saved_items FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: script_batches Admin/editor full delete on script_batches; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on script_batches" ON public.script_batches FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: scripts Admin/editor full delete on scripts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on scripts" ON public.scripts FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: seo_content_calendar Admin/editor full delete on seo_content_calendar; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on seo_content_calendar" ON public.seo_content_calendar FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: sponsors Admin/editor full delete on sponsors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on sponsors" ON public.sponsors FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: stories Admin/editor full delete on stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on stories" ON public.stories FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: story_neighborhoods Admin/editor full delete on story_neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on story_neighborhoods" ON public.story_neighborhoods FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: submissions Admin/editor full delete on submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on submissions" ON public.submissions FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: subscriptions Admin/editor full delete on subscriptions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on subscriptions" ON public.subscriptions FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: tags Admin/editor full delete on tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on tags" ON public.tags FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: tier_changes Admin/editor full delete on tier_changes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on tier_changes" ON public.tier_changes FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: tier_visibility_rules Admin/editor full delete on tier_visibility_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on tier_visibility_rules" ON public.tier_visibility_rules FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: users Admin/editor full delete on users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on users" ON public.users FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: watchlist Admin/editor full delete on watchlist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on watchlist" ON public.watchlist FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: watchlist_posts Admin/editor full delete on watchlist_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on watchlist_posts" ON public.watchlist_posts FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: watchlist_stories Admin/editor full delete on watchlist_stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full delete on watchlist_stories" ON public.watchlist_stories FOR DELETE USING (public.is_admin_or_editor());


--
-- Name: ad_campaigns Admin/editor full insert on ad_campaigns; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on ad_campaigns" ON public.ad_campaigns FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: ad_creatives Admin/editor full insert on ad_creatives; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on ad_creatives" ON public.ad_creatives FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: ad_flights Admin/editor full insert on ad_flights; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on ad_flights" ON public.ad_flights FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: ad_placements Admin/editor full insert on ad_placements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on ad_placements" ON public.ad_placements FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: amenities Admin/editor full insert on amenities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on amenities" ON public.amenities FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: areas Admin/editor full insert on areas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on areas" ON public.areas FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: authors Admin/editor full insert on authors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on authors" ON public.authors FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: blog_posts Admin/editor full insert on blog_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on blog_posts" ON public.blog_posts FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: brands Admin/editor full insert on brands; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on brands" ON public.brands FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_amenities Admin/editor full insert on business_amenities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on business_amenities" ON public.business_amenities FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_contacts Admin/editor full insert on business_contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on business_contacts" ON public.business_contacts FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_hours Admin/editor full insert on business_hours; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on business_hours" ON public.business_hours FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_identities Admin/editor full insert on business_identities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on business_identities" ON public.business_identities FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_identity_options Admin/editor full insert on business_identity_options; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on business_identity_options" ON public.business_identity_options FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_images Admin/editor full insert on business_images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on business_images" ON public.business_images FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_listings Admin/editor full insert on business_listings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on business_listings" ON public.business_listings FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_organizations Admin/editor full insert on business_organizations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on business_organizations" ON public.business_organizations FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_tags Admin/editor full insert on business_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on business_tags" ON public.business_tags FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: categories Admin/editor full insert on categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: cities Admin/editor full insert on cities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on cities" ON public.cities FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: claims Admin/editor full insert on claims; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on claims" ON public.claims FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: content_index Admin/editor full insert on content_index; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on content_index" ON public.content_index FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: event_images Admin/editor full insert on event_images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on event_images" ON public.event_images FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: event_map_pin_rules Admin/editor full insert on event_map_pin_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on event_map_pin_rules" ON public.event_map_pin_rules FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: event_tags Admin/editor full insert on event_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on event_tags" ON public.event_tags FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: event_tier_visibility_rules Admin/editor full insert on event_tier_visibility_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on event_tier_visibility_rules" ON public.event_tier_visibility_rules FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: events Admin/editor full insert on events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on events" ON public.events FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: featured_slots Admin/editor full insert on featured_slots; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on featured_slots" ON public.featured_slots FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: map_pin_rules Admin/editor full insert on map_pin_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on map_pin_rules" ON public.map_pin_rules FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: media_assets Admin/editor full insert on media_assets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on media_assets" ON public.media_assets FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: neighborhoods Admin/editor full insert on neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on neighborhoods" ON public.neighborhoods FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: newsletter_posts Admin/editor full insert on newsletter_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on newsletter_posts" ON public.newsletter_posts FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: newsletter_sections Admin/editor full insert on newsletter_sections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on newsletter_sections" ON public.newsletter_sections FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: newsletter_types Admin/editor full insert on newsletter_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on newsletter_types" ON public.newsletter_types FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: newsletters Admin/editor full insert on newsletters; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on newsletters" ON public.newsletters FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: organizations Admin/editor full insert on organizations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on organizations" ON public.organizations FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: pillars Admin/editor full insert on pillars; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on pillars" ON public.pillars FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_businesses Admin/editor full insert on post_businesses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on post_businesses" ON public.post_businesses FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_categories Admin/editor full insert on post_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on post_categories" ON public.post_categories FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_events Admin/editor full insert on post_events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on post_events" ON public.post_events FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_images Admin/editor full insert on post_images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on post_images" ON public.post_images FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_neighborhoods Admin/editor full insert on post_neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on post_neighborhoods" ON public.post_neighborhoods FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_source_stories Admin/editor full insert on post_source_stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on post_source_stories" ON public.post_source_stories FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_tags Admin/editor full insert on post_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on post_tags" ON public.post_tags FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: redirects Admin/editor full insert on redirects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on redirects" ON public.redirects FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: reviews Admin/editor full insert on reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on reviews" ON public.reviews FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: saved_items Admin/editor full insert on saved_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on saved_items" ON public.saved_items FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: script_batches Admin/editor full insert on script_batches; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on script_batches" ON public.script_batches FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: scripts Admin/editor full insert on scripts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on scripts" ON public.scripts FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: seo_content_calendar Admin/editor full insert on seo_content_calendar; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on seo_content_calendar" ON public.seo_content_calendar FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: sponsors Admin/editor full insert on sponsors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on sponsors" ON public.sponsors FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: stories Admin/editor full insert on stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on stories" ON public.stories FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: story_neighborhoods Admin/editor full insert on story_neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on story_neighborhoods" ON public.story_neighborhoods FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: submissions Admin/editor full insert on submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on submissions" ON public.submissions FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: subscriptions Admin/editor full insert on subscriptions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: tags Admin/editor full insert on tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on tags" ON public.tags FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: tier_changes Admin/editor full insert on tier_changes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on tier_changes" ON public.tier_changes FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: tier_visibility_rules Admin/editor full insert on tier_visibility_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on tier_visibility_rules" ON public.tier_visibility_rules FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: users Admin/editor full insert on users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on users" ON public.users FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: watchlist Admin/editor full insert on watchlist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on watchlist" ON public.watchlist FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: watchlist_posts Admin/editor full insert on watchlist_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on watchlist_posts" ON public.watchlist_posts FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: watchlist_stories Admin/editor full insert on watchlist_stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full insert on watchlist_stories" ON public.watchlist_stories FOR INSERT WITH CHECK (public.is_admin_or_editor());


--
-- Name: ad_campaigns Admin/editor full read on ad_campaigns; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on ad_campaigns" ON public.ad_campaigns FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: ad_creatives Admin/editor full read on ad_creatives; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on ad_creatives" ON public.ad_creatives FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: ad_flights Admin/editor full read on ad_flights; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on ad_flights" ON public.ad_flights FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: ad_placements Admin/editor full read on ad_placements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on ad_placements" ON public.ad_placements FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: amenities Admin/editor full read on amenities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on amenities" ON public.amenities FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: areas Admin/editor full read on areas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on areas" ON public.areas FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: authors Admin/editor full read on authors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on authors" ON public.authors FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: blog_posts Admin/editor full read on blog_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on blog_posts" ON public.blog_posts FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: brands Admin/editor full read on brands; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on brands" ON public.brands FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: business_amenities Admin/editor full read on business_amenities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on business_amenities" ON public.business_amenities FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: business_contacts Admin/editor full read on business_contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on business_contacts" ON public.business_contacts FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: business_hours Admin/editor full read on business_hours; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on business_hours" ON public.business_hours FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: business_identities Admin/editor full read on business_identities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on business_identities" ON public.business_identities FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: business_identity_options Admin/editor full read on business_identity_options; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on business_identity_options" ON public.business_identity_options FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: business_images Admin/editor full read on business_images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on business_images" ON public.business_images FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: business_listings Admin/editor full read on business_listings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on business_listings" ON public.business_listings FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: business_organizations Admin/editor full read on business_organizations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on business_organizations" ON public.business_organizations FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: business_tags Admin/editor full read on business_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on business_tags" ON public.business_tags FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: categories Admin/editor full read on categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on categories" ON public.categories FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: cities Admin/editor full read on cities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on cities" ON public.cities FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: claims Admin/editor full read on claims; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on claims" ON public.claims FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: content_index Admin/editor full read on content_index; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on content_index" ON public.content_index FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: event_images Admin/editor full read on event_images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on event_images" ON public.event_images FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: event_map_pin_rules Admin/editor full read on event_map_pin_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on event_map_pin_rules" ON public.event_map_pin_rules FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: event_tags Admin/editor full read on event_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on event_tags" ON public.event_tags FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: event_tier_visibility_rules Admin/editor full read on event_tier_visibility_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on event_tier_visibility_rules" ON public.event_tier_visibility_rules FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: events Admin/editor full read on events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on events" ON public.events FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: featured_slots Admin/editor full read on featured_slots; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on featured_slots" ON public.featured_slots FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: map_pin_rules Admin/editor full read on map_pin_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on map_pin_rules" ON public.map_pin_rules FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: media_assets Admin/editor full read on media_assets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on media_assets" ON public.media_assets FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: neighborhoods Admin/editor full read on neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on neighborhoods" ON public.neighborhoods FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: newsletter_posts Admin/editor full read on newsletter_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on newsletter_posts" ON public.newsletter_posts FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: newsletter_sections Admin/editor full read on newsletter_sections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on newsletter_sections" ON public.newsletter_sections FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: newsletter_types Admin/editor full read on newsletter_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on newsletter_types" ON public.newsletter_types FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: newsletters Admin/editor full read on newsletters; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on newsletters" ON public.newsletters FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: organizations Admin/editor full read on organizations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on organizations" ON public.organizations FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: pillars Admin/editor full read on pillars; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on pillars" ON public.pillars FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: post_businesses Admin/editor full read on post_businesses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on post_businesses" ON public.post_businesses FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: post_categories Admin/editor full read on post_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on post_categories" ON public.post_categories FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: post_events Admin/editor full read on post_events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on post_events" ON public.post_events FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: post_images Admin/editor full read on post_images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on post_images" ON public.post_images FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: post_neighborhoods Admin/editor full read on post_neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on post_neighborhoods" ON public.post_neighborhoods FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: post_source_stories Admin/editor full read on post_source_stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on post_source_stories" ON public.post_source_stories FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: post_tags Admin/editor full read on post_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on post_tags" ON public.post_tags FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: redirects Admin/editor full read on redirects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on redirects" ON public.redirects FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: reviews Admin/editor full read on reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on reviews" ON public.reviews FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: saved_items Admin/editor full read on saved_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on saved_items" ON public.saved_items FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: script_batches Admin/editor full read on script_batches; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on script_batches" ON public.script_batches FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: scripts Admin/editor full read on scripts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on scripts" ON public.scripts FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: seo_content_calendar Admin/editor full read on seo_content_calendar; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on seo_content_calendar" ON public.seo_content_calendar FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: sponsors Admin/editor full read on sponsors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on sponsors" ON public.sponsors FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: stories Admin/editor full read on stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on stories" ON public.stories FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: story_neighborhoods Admin/editor full read on story_neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on story_neighborhoods" ON public.story_neighborhoods FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: submissions Admin/editor full read on submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on submissions" ON public.submissions FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: subscriptions Admin/editor full read on subscriptions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on subscriptions" ON public.subscriptions FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: tags Admin/editor full read on tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on tags" ON public.tags FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: tier_changes Admin/editor full read on tier_changes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on tier_changes" ON public.tier_changes FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: tier_visibility_rules Admin/editor full read on tier_visibility_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on tier_visibility_rules" ON public.tier_visibility_rules FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: users Admin/editor full read on users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on users" ON public.users FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: watchlist Admin/editor full read on watchlist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on watchlist" ON public.watchlist FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: watchlist_posts Admin/editor full read on watchlist_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on watchlist_posts" ON public.watchlist_posts FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: watchlist_stories Admin/editor full read on watchlist_stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full read on watchlist_stories" ON public.watchlist_stories FOR SELECT USING (public.is_admin_or_editor());


--
-- Name: ad_campaigns Admin/editor full update on ad_campaigns; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on ad_campaigns" ON public.ad_campaigns FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: ad_creatives Admin/editor full update on ad_creatives; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on ad_creatives" ON public.ad_creatives FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: ad_flights Admin/editor full update on ad_flights; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on ad_flights" ON public.ad_flights FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: ad_placements Admin/editor full update on ad_placements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on ad_placements" ON public.ad_placements FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: amenities Admin/editor full update on amenities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on amenities" ON public.amenities FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: areas Admin/editor full update on areas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on areas" ON public.areas FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: authors Admin/editor full update on authors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on authors" ON public.authors FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: blog_posts Admin/editor full update on blog_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on blog_posts" ON public.blog_posts FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: brands Admin/editor full update on brands; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on brands" ON public.brands FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_amenities Admin/editor full update on business_amenities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on business_amenities" ON public.business_amenities FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_contacts Admin/editor full update on business_contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on business_contacts" ON public.business_contacts FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_hours Admin/editor full update on business_hours; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on business_hours" ON public.business_hours FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_identities Admin/editor full update on business_identities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on business_identities" ON public.business_identities FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_identity_options Admin/editor full update on business_identity_options; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on business_identity_options" ON public.business_identity_options FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_images Admin/editor full update on business_images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on business_images" ON public.business_images FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_listings Admin/editor full update on business_listings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on business_listings" ON public.business_listings FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_organizations Admin/editor full update on business_organizations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on business_organizations" ON public.business_organizations FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: business_tags Admin/editor full update on business_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on business_tags" ON public.business_tags FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: categories Admin/editor full update on categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on categories" ON public.categories FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: cities Admin/editor full update on cities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on cities" ON public.cities FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: claims Admin/editor full update on claims; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on claims" ON public.claims FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: content_index Admin/editor full update on content_index; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on content_index" ON public.content_index FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: event_images Admin/editor full update on event_images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on event_images" ON public.event_images FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: event_map_pin_rules Admin/editor full update on event_map_pin_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on event_map_pin_rules" ON public.event_map_pin_rules FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: event_tags Admin/editor full update on event_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on event_tags" ON public.event_tags FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: event_tier_visibility_rules Admin/editor full update on event_tier_visibility_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on event_tier_visibility_rules" ON public.event_tier_visibility_rules FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: events Admin/editor full update on events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on events" ON public.events FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: featured_slots Admin/editor full update on featured_slots; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on featured_slots" ON public.featured_slots FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: map_pin_rules Admin/editor full update on map_pin_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on map_pin_rules" ON public.map_pin_rules FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: media_assets Admin/editor full update on media_assets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on media_assets" ON public.media_assets FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: neighborhoods Admin/editor full update on neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on neighborhoods" ON public.neighborhoods FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: newsletter_posts Admin/editor full update on newsletter_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on newsletter_posts" ON public.newsletter_posts FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: newsletter_sections Admin/editor full update on newsletter_sections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on newsletter_sections" ON public.newsletter_sections FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: newsletter_types Admin/editor full update on newsletter_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on newsletter_types" ON public.newsletter_types FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: newsletters Admin/editor full update on newsletters; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on newsletters" ON public.newsletters FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: organizations Admin/editor full update on organizations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on organizations" ON public.organizations FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: pillars Admin/editor full update on pillars; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on pillars" ON public.pillars FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_businesses Admin/editor full update on post_businesses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on post_businesses" ON public.post_businesses FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_categories Admin/editor full update on post_categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on post_categories" ON public.post_categories FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_events Admin/editor full update on post_events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on post_events" ON public.post_events FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_images Admin/editor full update on post_images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on post_images" ON public.post_images FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_neighborhoods Admin/editor full update on post_neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on post_neighborhoods" ON public.post_neighborhoods FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_source_stories Admin/editor full update on post_source_stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on post_source_stories" ON public.post_source_stories FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: post_tags Admin/editor full update on post_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on post_tags" ON public.post_tags FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: redirects Admin/editor full update on redirects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on redirects" ON public.redirects FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: reviews Admin/editor full update on reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on reviews" ON public.reviews FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: saved_items Admin/editor full update on saved_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on saved_items" ON public.saved_items FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: script_batches Admin/editor full update on script_batches; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on script_batches" ON public.script_batches FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: scripts Admin/editor full update on scripts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on scripts" ON public.scripts FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: seo_content_calendar Admin/editor full update on seo_content_calendar; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on seo_content_calendar" ON public.seo_content_calendar FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: sponsors Admin/editor full update on sponsors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on sponsors" ON public.sponsors FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: stories Admin/editor full update on stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on stories" ON public.stories FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: story_neighborhoods Admin/editor full update on story_neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on story_neighborhoods" ON public.story_neighborhoods FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: submissions Admin/editor full update on submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on submissions" ON public.submissions FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: subscriptions Admin/editor full update on subscriptions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on subscriptions" ON public.subscriptions FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: tags Admin/editor full update on tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on tags" ON public.tags FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: tier_changes Admin/editor full update on tier_changes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on tier_changes" ON public.tier_changes FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: tier_visibility_rules Admin/editor full update on tier_visibility_rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on tier_visibility_rules" ON public.tier_visibility_rules FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: users Admin/editor full update on users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on users" ON public.users FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: watchlist Admin/editor full update on watchlist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on watchlist" ON public.watchlist FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: watchlist_posts Admin/editor full update on watchlist_posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on watchlist_posts" ON public.watchlist_posts FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: watchlist_stories Admin/editor full update on watchlist_stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin/editor full update on watchlist_stories" ON public.watchlist_stories FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());


--
-- Name: sponsor_deliverables Allow public read access on sponsor_deliverables; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read access on sponsor_deliverables" ON public.sponsor_deliverables FOR SELECT USING (true);


--
-- Name: sponsor_fulfillment_log Allow public read access on sponsor_fulfillment_log; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read access on sponsor_fulfillment_log" ON public.sponsor_fulfillment_log FOR SELECT USING (true);


--
-- Name: sponsor_packages Allow public read access on sponsor_packages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read access on sponsor_packages" ON public.sponsor_packages FOR SELECT USING (true);


--
-- Name: sponsors Allow public read access on sponsors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read access on sponsors" ON public.sponsors FOR SELECT USING (true);


--
-- Name: users Allow public read access on users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read access on users" ON public.users FOR SELECT USING (true);


--
-- Name: media_assets Allow public read on media_assets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read on media_assets" ON public.media_assets FOR SELECT USING (true);


--
-- Name: media_item_assets Allow public read on media_item_assets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read on media_item_assets" ON public.media_item_assets FOR SELECT USING (true);


--
-- Name: media_item_links Allow public read on media_item_links; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read on media_item_links" ON public.media_item_links FOR SELECT USING (true);


--
-- Name: media_items Allow public read on media_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read on media_items" ON public.media_items FOR SELECT USING (true);


--
-- Name: business_contacts Business owners can manage own contacts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Business owners can manage own contacts" ON public.business_contacts USING ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_contacts.business_id) AND (business_listings.claimed_by = auth.uid()) AND (business_listings.claim_status = 'verified'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_contacts.business_id) AND (business_listings.claimed_by = auth.uid()) AND (business_listings.claim_status = 'verified'::text)))));


--
-- Name: business_hours Business owners can manage own hours; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Business owners can manage own hours" ON public.business_hours USING ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_hours.business_id) AND (business_listings.claimed_by = auth.uid()) AND (business_listings.claim_status = 'verified'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_hours.business_id) AND (business_listings.claimed_by = auth.uid()) AND (business_listings.claim_status = 'verified'::text)))));


--
-- Name: business_images Business owners can manage own images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Business owners can manage own images" ON public.business_images USING ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_images.business_id) AND (business_listings.claimed_by = auth.uid()) AND (business_listings.claim_status = 'verified'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_images.business_id) AND (business_listings.claimed_by = auth.uid()) AND (business_listings.claim_status = 'verified'::text)))));


--
-- Name: business_listings Business owners can read own listing; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Business owners can read own listing" ON public.business_listings FOR SELECT USING ((claimed_by = auth.uid()));


--
-- Name: subscriptions Business owners can read own subscriptions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Business owners can read own subscriptions" ON public.subscriptions FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: tier_changes Business owners can read own tier changes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Business owners can read own tier changes" ON public.tier_changes FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = tier_changes.business_id) AND (business_listings.claimed_by = auth.uid())))));


--
-- Name: business_listings Business owners can update own listing; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Business owners can update own listing" ON public.business_listings FOR UPDATE USING (((claimed_by = auth.uid()) AND (claim_status = 'verified'::text))) WITH CHECK (((claimed_by = auth.uid()) AND (claim_status = 'verified'::text)));


--
-- Name: ad_creatives Public can read active ad creatives; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active ad creatives" ON public.ad_creatives FOR SELECT USING ((is_active = true));


--
-- Name: ad_flights Public can read active ad flights; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active ad flights" ON public.ad_flights FOR SELECT USING ((status = 'active'::text));


--
-- Name: ad_placements Public can read active ad placements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active ad placements" ON public.ad_placements FOR SELECT USING ((is_active = true));


--
-- Name: areas Public can read active areas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active areas" ON public.areas FOR SELECT USING ((is_active = true));


--
-- Name: authors Public can read active authors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active authors" ON public.authors FOR SELECT USING ((is_active = true));


--
-- Name: business_listings Public can read active business listings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active business listings" ON public.business_listings FOR SELECT USING ((status = 'active'::text));


--
-- Name: categories Public can read active categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active categories" ON public.categories FOR SELECT USING ((is_active = true));


--
-- Name: cities Public can read active cities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active cities" ON public.cities FOR SELECT USING ((is_active = true));


--
-- Name: content_index Public can read active content index; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active content index" ON public.content_index FOR SELECT USING ((is_active = true));


--
-- Name: events Public can read active events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active events" ON public.events FOR SELECT USING ((status = ANY (ARRAY['active'::text, 'completed'::text])));


--
-- Name: featured_slots Public can read active featured slots; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active featured slots" ON public.featured_slots FOR SELECT USING ((is_active = true));


--
-- Name: media_assets Public can read active media assets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active media assets" ON public.media_assets FOR SELECT USING ((is_active = true));


--
-- Name: neighborhoods Public can read active neighborhoods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active neighborhoods" ON public.neighborhoods FOR SELECT USING ((is_active = true));


--
-- Name: newsletter_types Public can read active newsletter types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active newsletter types" ON public.newsletter_types FOR SELECT USING ((is_active = true));


--
-- Name: pillars Public can read active pillars; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active pillars" ON public.pillars FOR SELECT USING ((is_active = true));


--
-- Name: redirects Public can read active redirects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active redirects" ON public.redirects FOR SELECT USING ((is_active = true));


--
-- Name: amenities Public can read all amenities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read all amenities" ON public.amenities FOR SELECT USING (true);


--
-- Name: brands Public can read all brands; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read all brands" ON public.brands FOR SELECT USING (true);


--
-- Name: business_identity_options Public can read all identity options; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read all identity options" ON public.business_identity_options FOR SELECT USING (true);


--
-- Name: organizations Public can read all organizations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read all organizations" ON public.organizations FOR SELECT USING (true);


--
-- Name: tags Public can read all tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read all tags" ON public.tags FOR SELECT USING (true);


--
-- Name: watchlist Public can read all watchlist projects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read all watchlist projects" ON public.watchlist FOR SELECT USING (true);


--
-- Name: business_amenities Public can read amenities for active businesses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read amenities for active businesses" ON public.business_amenities FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_amenities.business_id) AND (business_listings.status = 'active'::text)))));


--
-- Name: reviews Public can read approved reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read approved reviews" ON public.reviews FOR SELECT USING ((status = 'approved'::text));


--
-- Name: post_businesses Public can read business mentions in published posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read business mentions in published posts" ON public.post_businesses FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.blog_posts
  WHERE ((blog_posts.id = post_businesses.post_id) AND (blog_posts.status = 'published'::text)))));


--
-- Name: post_categories Public can read categories for published posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read categories for published posts" ON public.post_categories FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.blog_posts
  WHERE ((blog_posts.id = post_categories.post_id) AND (blog_posts.status = 'published'::text)))));


--
-- Name: event_map_pin_rules Public can read event map pin rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read event map pin rules" ON public.event_map_pin_rules FOR SELECT USING (true);


--
-- Name: post_events Public can read event mentions in published posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read event mentions in published posts" ON public.post_events FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.blog_posts
  WHERE ((blog_posts.id = post_events.post_id) AND (blog_posts.status = 'published'::text)))));


--
-- Name: event_tier_visibility_rules Public can read event tier visibility rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read event tier visibility rules" ON public.event_tier_visibility_rules FOR SELECT USING (true);


--
-- Name: business_hours Public can read hours for active businesses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read hours for active businesses" ON public.business_hours FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_hours.business_id) AND (business_listings.status = 'active'::text)))));


--
-- Name: business_identities Public can read identities for active businesses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read identities for active businesses" ON public.business_identities FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_identities.business_id) AND (business_listings.status = 'active'::text)))));


--
-- Name: business_images Public can read images for active businesses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read images for active businesses" ON public.business_images FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_images.business_id) AND (business_listings.status = 'active'::text)))));


--
-- Name: post_images Public can read images for published posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read images for published posts" ON public.post_images FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.blog_posts
  WHERE ((blog_posts.id = post_images.post_id) AND (blog_posts.status = 'published'::text)))));


--
-- Name: event_images Public can read images for visible events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read images for visible events" ON public.event_images FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.events
  WHERE ((events.id = event_images.event_id) AND (events.status = ANY (ARRAY['active'::text, 'completed'::text]))))));


--
-- Name: map_pin_rules Public can read map pin rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read map pin rules" ON public.map_pin_rules FOR SELECT USING (true);


--
-- Name: post_neighborhoods Public can read neighborhoods for published posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read neighborhoods for published posts" ON public.post_neighborhoods FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.blog_posts
  WHERE ((blog_posts.id = post_neighborhoods.post_id) AND (blog_posts.status = 'published'::text)))));


--
-- Name: business_organizations Public can read orgs for active businesses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read orgs for active businesses" ON public.business_organizations FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_organizations.business_id) AND (business_listings.status = 'active'::text)))));


--
-- Name: newsletter_posts Public can read posts in public newsletters; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read posts in public newsletters" ON public.newsletter_posts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.newsletters
  WHERE ((newsletters.id = newsletter_posts.newsletter_id) AND (newsletters.status = 'sent'::text) AND (newsletters.is_public = true)))));


--
-- Name: business_contacts Public can read public contacts for active businesses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read public contacts for active businesses" ON public.business_contacts FOR SELECT USING (((is_public = true) AND (EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_contacts.business_id) AND (business_listings.status = 'active'::text))))));


--
-- Name: blog_posts Public can read published blog posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read published blog posts" ON public.blog_posts FOR SELECT USING ((status = 'published'::text));


--
-- Name: newsletter_sections Public can read sections for public newsletters; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read sections for public newsletters" ON public.newsletter_sections FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.newsletters
  WHERE ((newsletters.id = newsletter_sections.newsletter_id) AND (newsletters.status = 'sent'::text) AND (newsletters.is_public = true)))));


--
-- Name: newsletters Public can read sent public newsletters; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read sent public newsletters" ON public.newsletters FOR SELECT USING (((status = 'sent'::text) AND (is_public = true)));


--
-- Name: business_tags Public can read tags for active businesses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read tags for active businesses" ON public.business_tags FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.business_listings
  WHERE ((business_listings.id = business_tags.business_id) AND (business_listings.status = 'active'::text)))));


--
-- Name: post_tags Public can read tags for published posts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read tags for published posts" ON public.post_tags FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.blog_posts
  WHERE ((blog_posts.id = post_tags.post_id) AND (blog_posts.status = 'published'::text)))));


--
-- Name: event_tags Public can read tags for visible events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read tags for visible events" ON public.event_tags FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.events
  WHERE ((events.id = event_tags.event_id) AND (events.status = ANY (ARRAY['active'::text, 'completed'::text]))))));


--
-- Name: tier_visibility_rules Public can read tier visibility rules; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read tier visibility rules" ON public.tier_visibility_rules FOR SELECT USING (true);


--
-- Name: watchlist_posts Public can read watchlist post links; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read watchlist post links" ON public.watchlist_posts FOR SELECT USING (true);


--
-- Name: watchlist_stories Public can read watchlist story links; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read watchlist story links" ON public.watchlist_stories FOR SELECT USING (true);


--
-- Name: script_batches Public read on script_batches; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read on script_batches" ON public.script_batches FOR SELECT USING (true);


--
-- Name: scripts Public read on scripts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read on scripts" ON public.scripts FOR SELECT USING (true);


--
-- Name: stories Public read on stories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read on stories" ON public.stories FOR SELECT USING (true);


--
-- Name: claims Users can create claims; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create claims" ON public.claims FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: saved_items Users can create own saved items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create own saved items" ON public.saved_items FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: reviews Users can create reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: submissions Users can create submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create submissions" ON public.submissions FOR INSERT WITH CHECK (((auth.uid() = submitted_by) OR (submitted_by IS NULL)));


--
-- Name: saved_items Users can delete own saved items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete own saved items" ON public.saved_items FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: claims Users can read own claims; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can read own claims" ON public.claims FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: users Users can read own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING ((auth.uid() = id));


--
-- Name: reviews Users can read own reviews regardless of status; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can read own reviews regardless of status" ON public.reviews FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: saved_items Users can read own saved items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can read own saved items" ON public.saved_items FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: submissions Users can read own submissions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can read own submissions" ON public.submissions FOR SELECT USING ((auth.uid() = submitted_by));


--
-- Name: reviews Users can update own pending reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own pending reviews" ON public.reviews FOR UPDATE USING (((auth.uid() = user_id) AND (status = 'pending_review'::text))) WITH CHECK ((auth.uid() = user_id));


--
-- Name: users Users can update own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: ad_campaigns; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_creatives; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_flights; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ad_flights ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_placements; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;

--
-- Name: amenities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

--
-- Name: areas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

--
-- Name: authors; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_posts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: brands; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

--
-- Name: business_amenities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.business_amenities ENABLE ROW LEVEL SECURITY;

--
-- Name: business_contacts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.business_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: business_hours; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

--
-- Name: business_identities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.business_identities ENABLE ROW LEVEL SECURITY;

--
-- Name: business_identity_options; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.business_identity_options ENABLE ROW LEVEL SECURITY;

--
-- Name: business_images; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.business_images ENABLE ROW LEVEL SECURITY;

--
-- Name: business_listings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.business_listings ENABLE ROW LEVEL SECURITY;

--
-- Name: business_organizations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.business_organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: business_tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.business_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: cities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

--
-- Name: claims; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

--
-- Name: content_calendar; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

--
-- Name: content_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.content_history ENABLE ROW LEVEL SECURITY;

--
-- Name: content_index; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.content_index ENABLE ROW LEVEL SECURITY;

--
-- Name: content_performance; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.content_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: event_images; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;

--
-- Name: event_map_pin_rules; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_map_pin_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: event_tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: event_tier_pricing; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_tier_pricing ENABLE ROW LEVEL SECURITY;

--
-- Name: event_tier_visibility_rules; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_tier_visibility_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: featured_slots; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.featured_slots ENABLE ROW LEVEL SECURITY;

--
-- Name: headline_variants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.headline_variants ENABLE ROW LEVEL SECURITY;

--
-- Name: map_pin_rules; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.map_pin_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: media_assets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

--
-- Name: media_item_assets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.media_item_assets ENABLE ROW LEVEL SECURITY;

--
-- Name: media_item_links; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.media_item_links ENABLE ROW LEVEL SECURITY;

--
-- Name: media_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

--
-- Name: neighborhoods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_posts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.newsletter_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_sections; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.newsletter_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_types; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.newsletter_types ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletters; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: pillars; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pillars ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_performance; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.platform_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: post_businesses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_businesses ENABLE ROW LEVEL SECURITY;

--
-- Name: post_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: post_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_events ENABLE ROW LEVEL SECURITY;

--
-- Name: post_images; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

--
-- Name: post_neighborhoods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_neighborhoods ENABLE ROW LEVEL SECURITY;

--
-- Name: post_source_stories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_source_stories ENABLE ROW LEVEL SECURITY;

--
-- Name: post_sponsors; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_sponsors ENABLE ROW LEVEL SECURITY;

--
-- Name: post_tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: published_content; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.published_content ENABLE ROW LEVEL SECURITY;

--
-- Name: redirects; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

--
-- Name: script_batches; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.script_batches ENABLE ROW LEVEL SECURITY;

--
-- Name: scripts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

--
-- Name: seo_content_calendar; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.seo_content_calendar ENABLE ROW LEVEL SECURITY;

--
-- Name: sponsors; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

--
-- Name: stories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

--
-- Name: story_businesses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.story_businesses ENABLE ROW LEVEL SECURITY;

--
-- Name: story_neighborhoods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.story_neighborhoods ENABLE ROW LEVEL SECURITY;

--
-- Name: submissions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

--
-- Name: tier_changes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tier_changes ENABLE ROW LEVEL SECURITY;

--
-- Name: tier_visibility_rules; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tier_visibility_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: trending_topics; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: watchlist; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

--
-- Name: watchlist_posts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.watchlist_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: watchlist_stories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.watchlist_stories ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION cap_scripts_at_five(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.cap_scripts_at_five() TO anon;
GRANT ALL ON FUNCTION public.cap_scripts_at_five() TO authenticated;
GRANT ALL ON FUNCTION public.cap_scripts_at_five() TO service_role;


--
-- Name: FUNCTION get_media_with_thumbnails(item_limit integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_media_with_thumbnails(item_limit integer) TO anon;
GRANT ALL ON FUNCTION public.get_media_with_thumbnails(item_limit integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_media_with_thumbnails(item_limit integer) TO service_role;


--
-- Name: FUNCTION get_user_role(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_user_role() TO anon;
GRANT ALL ON FUNCTION public.get_user_role() TO authenticated;
GRANT ALL ON FUNCTION public.get_user_role() TO service_role;


--
-- Name: FUNCTION is_admin(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_admin() TO anon;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_admin() TO service_role;


--
-- Name: FUNCTION is_admin_or_editor(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_admin_or_editor() TO anon;
GRANT ALL ON FUNCTION public.is_admin_or_editor() TO authenticated;
GRANT ALL ON FUNCTION public.is_admin_or_editor() TO service_role;


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;


--
-- Name: TABLE ad_campaigns; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ad_campaigns TO anon;
GRANT ALL ON TABLE public.ad_campaigns TO authenticated;
GRANT ALL ON TABLE public.ad_campaigns TO service_role;


--
-- Name: TABLE ad_creatives; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ad_creatives TO anon;
GRANT ALL ON TABLE public.ad_creatives TO authenticated;
GRANT ALL ON TABLE public.ad_creatives TO service_role;


--
-- Name: TABLE ad_flights; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ad_flights TO anon;
GRANT ALL ON TABLE public.ad_flights TO authenticated;
GRANT ALL ON TABLE public.ad_flights TO service_role;


--
-- Name: TABLE ad_placements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ad_placements TO anon;
GRANT ALL ON TABLE public.ad_placements TO authenticated;
GRANT ALL ON TABLE public.ad_placements TO service_role;


--
-- Name: TABLE amenities; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.amenities TO anon;
GRANT ALL ON TABLE public.amenities TO authenticated;
GRANT ALL ON TABLE public.amenities TO service_role;


--
-- Name: TABLE areas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.areas TO anon;
GRANT ALL ON TABLE public.areas TO authenticated;
GRANT ALL ON TABLE public.areas TO service_role;


--
-- Name: TABLE authors; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.authors TO anon;
GRANT ALL ON TABLE public.authors TO authenticated;
GRANT ALL ON TABLE public.authors TO service_role;


--
-- Name: TABLE blog_posts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.blog_posts TO anon;
GRANT ALL ON TABLE public.blog_posts TO authenticated;
GRANT ALL ON TABLE public.blog_posts TO service_role;


--
-- Name: TABLE brands; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.brands TO anon;
GRANT ALL ON TABLE public.brands TO authenticated;
GRANT ALL ON TABLE public.brands TO service_role;


--
-- Name: TABLE business_amenities; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_amenities TO anon;
GRANT ALL ON TABLE public.business_amenities TO authenticated;
GRANT ALL ON TABLE public.business_amenities TO service_role;


--
-- Name: TABLE business_contacts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_contacts TO anon;
GRANT ALL ON TABLE public.business_contacts TO authenticated;
GRANT ALL ON TABLE public.business_contacts TO service_role;


--
-- Name: TABLE business_hours; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_hours TO anon;
GRANT ALL ON TABLE public.business_hours TO authenticated;
GRANT ALL ON TABLE public.business_hours TO service_role;


--
-- Name: TABLE business_identities; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_identities TO anon;
GRANT ALL ON TABLE public.business_identities TO authenticated;
GRANT ALL ON TABLE public.business_identities TO service_role;


--
-- Name: TABLE business_identity_options; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_identity_options TO anon;
GRANT ALL ON TABLE public.business_identity_options TO authenticated;
GRANT ALL ON TABLE public.business_identity_options TO service_role;


--
-- Name: TABLE business_images; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_images TO anon;
GRANT ALL ON TABLE public.business_images TO authenticated;
GRANT ALL ON TABLE public.business_images TO service_role;


--
-- Name: TABLE business_listings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_listings TO anon;
GRANT ALL ON TABLE public.business_listings TO authenticated;
GRANT ALL ON TABLE public.business_listings TO service_role;


--
-- Name: TABLE business_organizations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_organizations TO anon;
GRANT ALL ON TABLE public.business_organizations TO authenticated;
GRANT ALL ON TABLE public.business_organizations TO service_role;


--
-- Name: TABLE business_tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_tags TO anon;
GRANT ALL ON TABLE public.business_tags TO authenticated;
GRANT ALL ON TABLE public.business_tags TO service_role;


--
-- Name: TABLE categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.categories TO anon;
GRANT ALL ON TABLE public.categories TO authenticated;
GRANT ALL ON TABLE public.categories TO service_role;


--
-- Name: TABLE cities; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cities TO anon;
GRANT ALL ON TABLE public.cities TO authenticated;
GRANT ALL ON TABLE public.cities TO service_role;


--
-- Name: TABLE claims; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.claims TO anon;
GRANT ALL ON TABLE public.claims TO authenticated;
GRANT ALL ON TABLE public.claims TO service_role;


--
-- Name: TABLE content_calendar; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.content_calendar TO anon;
GRANT ALL ON TABLE public.content_calendar TO authenticated;
GRANT ALL ON TABLE public.content_calendar TO service_role;


--
-- Name: TABLE content_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.content_history TO anon;
GRANT ALL ON TABLE public.content_history TO authenticated;
GRANT ALL ON TABLE public.content_history TO service_role;


--
-- Name: TABLE content_index; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.content_index TO anon;
GRANT ALL ON TABLE public.content_index TO authenticated;
GRANT ALL ON TABLE public.content_index TO service_role;


--
-- Name: TABLE content_performance; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.content_performance TO anon;
GRANT ALL ON TABLE public.content_performance TO authenticated;
GRANT ALL ON TABLE public.content_performance TO service_role;


--
-- Name: TABLE event_images; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_images TO anon;
GRANT ALL ON TABLE public.event_images TO authenticated;
GRANT ALL ON TABLE public.event_images TO service_role;


--
-- Name: TABLE event_map_pin_rules; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_map_pin_rules TO anon;
GRANT ALL ON TABLE public.event_map_pin_rules TO authenticated;
GRANT ALL ON TABLE public.event_map_pin_rules TO service_role;


--
-- Name: TABLE event_tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_tags TO anon;
GRANT ALL ON TABLE public.event_tags TO authenticated;
GRANT ALL ON TABLE public.event_tags TO service_role;


--
-- Name: TABLE event_tier_pricing; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_tier_pricing TO anon;
GRANT ALL ON TABLE public.event_tier_pricing TO authenticated;
GRANT ALL ON TABLE public.event_tier_pricing TO service_role;


--
-- Name: TABLE event_tier_visibility_rules; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_tier_visibility_rules TO anon;
GRANT ALL ON TABLE public.event_tier_visibility_rules TO authenticated;
GRANT ALL ON TABLE public.event_tier_visibility_rules TO service_role;


--
-- Name: TABLE events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.events TO anon;
GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;


--
-- Name: TABLE featured_slots; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.featured_slots TO anon;
GRANT ALL ON TABLE public.featured_slots TO authenticated;
GRANT ALL ON TABLE public.featured_slots TO service_role;


--
-- Name: TABLE headline_variants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.headline_variants TO anon;
GRANT ALL ON TABLE public.headline_variants TO authenticated;
GRANT ALL ON TABLE public.headline_variants TO service_role;


--
-- Name: TABLE map_pin_rules; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.map_pin_rules TO anon;
GRANT ALL ON TABLE public.map_pin_rules TO authenticated;
GRANT ALL ON TABLE public.map_pin_rules TO service_role;


--
-- Name: TABLE media_assets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.media_assets TO anon;
GRANT ALL ON TABLE public.media_assets TO authenticated;
GRANT ALL ON TABLE public.media_assets TO service_role;


--
-- Name: TABLE media_item_assets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.media_item_assets TO anon;
GRANT ALL ON TABLE public.media_item_assets TO authenticated;
GRANT ALL ON TABLE public.media_item_assets TO service_role;


--
-- Name: TABLE media_item_links; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.media_item_links TO anon;
GRANT ALL ON TABLE public.media_item_links TO authenticated;
GRANT ALL ON TABLE public.media_item_links TO service_role;


--
-- Name: TABLE media_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.media_items TO anon;
GRANT ALL ON TABLE public.media_items TO authenticated;
GRANT ALL ON TABLE public.media_items TO service_role;


--
-- Name: TABLE neighborhoods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.neighborhoods TO anon;
GRANT ALL ON TABLE public.neighborhoods TO authenticated;
GRANT ALL ON TABLE public.neighborhoods TO service_role;


--
-- Name: TABLE newsletter_posts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.newsletter_posts TO anon;
GRANT ALL ON TABLE public.newsletter_posts TO authenticated;
GRANT ALL ON TABLE public.newsletter_posts TO service_role;


--
-- Name: TABLE newsletter_sections; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.newsletter_sections TO anon;
GRANT ALL ON TABLE public.newsletter_sections TO authenticated;
GRANT ALL ON TABLE public.newsletter_sections TO service_role;


--
-- Name: TABLE newsletter_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.newsletter_types TO anon;
GRANT ALL ON TABLE public.newsletter_types TO authenticated;
GRANT ALL ON TABLE public.newsletter_types TO service_role;


--
-- Name: TABLE newsletters; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.newsletters TO anon;
GRANT ALL ON TABLE public.newsletters TO authenticated;
GRANT ALL ON TABLE public.newsletters TO service_role;


--
-- Name: TABLE organizations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.organizations TO anon;
GRANT ALL ON TABLE public.organizations TO authenticated;
GRANT ALL ON TABLE public.organizations TO service_role;


--
-- Name: TABLE pillars; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pillars TO anon;
GRANT ALL ON TABLE public.pillars TO authenticated;
GRANT ALL ON TABLE public.pillars TO service_role;


--
-- Name: TABLE platform_performance; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.platform_performance TO anon;
GRANT ALL ON TABLE public.platform_performance TO authenticated;
GRANT ALL ON TABLE public.platform_performance TO service_role;


--
-- Name: TABLE post_businesses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_businesses TO anon;
GRANT ALL ON TABLE public.post_businesses TO authenticated;
GRANT ALL ON TABLE public.post_businesses TO service_role;


--
-- Name: TABLE post_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_categories TO anon;
GRANT ALL ON TABLE public.post_categories TO authenticated;
GRANT ALL ON TABLE public.post_categories TO service_role;


--
-- Name: TABLE post_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_events TO anon;
GRANT ALL ON TABLE public.post_events TO authenticated;
GRANT ALL ON TABLE public.post_events TO service_role;


--
-- Name: TABLE post_images; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_images TO anon;
GRANT ALL ON TABLE public.post_images TO authenticated;
GRANT ALL ON TABLE public.post_images TO service_role;


--
-- Name: TABLE post_neighborhoods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_neighborhoods TO anon;
GRANT ALL ON TABLE public.post_neighborhoods TO authenticated;
GRANT ALL ON TABLE public.post_neighborhoods TO service_role;


--
-- Name: TABLE post_source_stories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_source_stories TO anon;
GRANT ALL ON TABLE public.post_source_stories TO authenticated;
GRANT ALL ON TABLE public.post_source_stories TO service_role;


--
-- Name: TABLE post_sponsors; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_sponsors TO anon;
GRANT ALL ON TABLE public.post_sponsors TO authenticated;
GRANT ALL ON TABLE public.post_sponsors TO service_role;


--
-- Name: TABLE post_tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.post_tags TO anon;
GRANT ALL ON TABLE public.post_tags TO authenticated;
GRANT ALL ON TABLE public.post_tags TO service_role;


--
-- Name: TABLE published_content; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.published_content TO anon;
GRANT ALL ON TABLE public.published_content TO authenticated;
GRANT ALL ON TABLE public.published_content TO service_role;


--
-- Name: TABLE redirects; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.redirects TO anon;
GRANT ALL ON TABLE public.redirects TO authenticated;
GRANT ALL ON TABLE public.redirects TO service_role;


--
-- Name: TABLE reviews; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.reviews TO anon;
GRANT ALL ON TABLE public.reviews TO authenticated;
GRANT ALL ON TABLE public.reviews TO service_role;


--
-- Name: TABLE saved_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.saved_items TO anon;
GRANT ALL ON TABLE public.saved_items TO authenticated;
GRANT ALL ON TABLE public.saved_items TO service_role;


--
-- Name: TABLE script_batches; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.script_batches TO anon;
GRANT ALL ON TABLE public.script_batches TO authenticated;
GRANT ALL ON TABLE public.script_batches TO service_role;


--
-- Name: TABLE scripts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.scripts TO anon;
GRANT ALL ON TABLE public.scripts TO authenticated;
GRANT ALL ON TABLE public.scripts TO service_role;


--
-- Name: TABLE seo_content_calendar; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.seo_content_calendar TO anon;
GRANT ALL ON TABLE public.seo_content_calendar TO authenticated;
GRANT ALL ON TABLE public.seo_content_calendar TO service_role;


--
-- Name: TABLE sponsor_deliverables; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sponsor_deliverables TO anon;
GRANT ALL ON TABLE public.sponsor_deliverables TO authenticated;
GRANT ALL ON TABLE public.sponsor_deliverables TO service_role;


--
-- Name: TABLE sponsor_fulfillment_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sponsor_fulfillment_log TO anon;
GRANT ALL ON TABLE public.sponsor_fulfillment_log TO authenticated;
GRANT ALL ON TABLE public.sponsor_fulfillment_log TO service_role;


--
-- Name: TABLE sponsor_packages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sponsor_packages TO anon;
GRANT ALL ON TABLE public.sponsor_packages TO authenticated;
GRANT ALL ON TABLE public.sponsor_packages TO service_role;


--
-- Name: TABLE sponsors; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sponsors TO anon;
GRANT ALL ON TABLE public.sponsors TO authenticated;
GRANT ALL ON TABLE public.sponsors TO service_role;


--
-- Name: TABLE stories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.stories TO anon;
GRANT ALL ON TABLE public.stories TO authenticated;
GRANT ALL ON TABLE public.stories TO service_role;


--
-- Name: TABLE story_businesses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.story_businesses TO anon;
GRANT ALL ON TABLE public.story_businesses TO authenticated;
GRANT ALL ON TABLE public.story_businesses TO service_role;


--
-- Name: TABLE story_neighborhoods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.story_neighborhoods TO anon;
GRANT ALL ON TABLE public.story_neighborhoods TO authenticated;
GRANT ALL ON TABLE public.story_neighborhoods TO service_role;


--
-- Name: TABLE submissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.submissions TO anon;
GRANT ALL ON TABLE public.submissions TO authenticated;
GRANT ALL ON TABLE public.submissions TO service_role;


--
-- Name: TABLE subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscriptions TO anon;
GRANT ALL ON TABLE public.subscriptions TO authenticated;
GRANT ALL ON TABLE public.subscriptions TO service_role;


--
-- Name: TABLE system_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.system_logs TO anon;
GRANT ALL ON TABLE public.system_logs TO authenticated;
GRANT ALL ON TABLE public.system_logs TO service_role;


--
-- Name: TABLE tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tags TO anon;
GRANT ALL ON TABLE public.tags TO authenticated;
GRANT ALL ON TABLE public.tags TO service_role;


--
-- Name: TABLE tier_changes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tier_changes TO anon;
GRANT ALL ON TABLE public.tier_changes TO authenticated;
GRANT ALL ON TABLE public.tier_changes TO service_role;


--
-- Name: TABLE tier_visibility_rules; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tier_visibility_rules TO anon;
GRANT ALL ON TABLE public.tier_visibility_rules TO authenticated;
GRANT ALL ON TABLE public.tier_visibility_rules TO service_role;


--
-- Name: TABLE trending_topics; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.trending_topics TO anon;
GRANT ALL ON TABLE public.trending_topics TO authenticated;
GRANT ALL ON TABLE public.trending_topics TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE watchlist; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.watchlist TO anon;
GRANT ALL ON TABLE public.watchlist TO authenticated;
GRANT ALL ON TABLE public.watchlist TO service_role;


--
-- Name: TABLE watchlist_posts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.watchlist_posts TO anon;
GRANT ALL ON TABLE public.watchlist_posts TO authenticated;
GRANT ALL ON TABLE public.watchlist_posts TO service_role;


--
-- Name: TABLE watchlist_stories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.watchlist_stories TO anon;
GRANT ALL ON TABLE public.watchlist_stories TO authenticated;
GRANT ALL ON TABLE public.watchlist_stories TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict xdTSPCA3Qfnx6arWYYXHB5ezXKlHh9zKMMvBb8uqIylgwaHhzxjnouBhkobfl1x

