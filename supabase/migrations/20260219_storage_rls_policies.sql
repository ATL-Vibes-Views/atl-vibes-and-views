-- Storage RLS policies for Supabase Storage buckets
--
-- business-media: public SELECT + INSERT (anonymous business owners submitting listings)
-- All other managed buckets: public SELECT only; INSERT/UPDATE/DELETE require service role
--   (site-images, blog-media, social-assets, team-assets, ad-creatives, misc)
--
-- Uploads to restricted buckets go through /api/admin/upload-asset which runs server-side
-- with the service role key and therefore bypasses RLS entirely.

-- ── Enable RLS on storage.objects (idempotent) ──────────────────────────────
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Drop existing policies for these buckets so this migration
-- is safe to re-run (idempotent).
-- ============================================================

DO $$
DECLARE
  buckets text[] := ARRAY[
    'business-media',
    'site-images',
    'blog-media',
    'social-assets',
    'team-assets',
    'ad-creatives',
    'misc'
  ];
  b text;
BEGIN
  FOREACH b IN ARRAY buckets LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_public_select');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_public_insert');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_anon_insert');
  END LOOP;
END $$;

-- ============================================================
-- business-media — public SELECT + anonymous INSERT
-- ============================================================

CREATE POLICY "business-media_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'business-media');

CREATE POLICY "business-media_anon_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'business-media');

-- ============================================================
-- site-images — public SELECT only
-- ============================================================

CREATE POLICY "site-images_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');

-- ============================================================
-- blog-media — public SELECT only
-- ============================================================

CREATE POLICY "blog-media_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-media');

-- ============================================================
-- social-assets — public SELECT only
-- ============================================================

CREATE POLICY "social-assets_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'social-assets');

-- ============================================================
-- team-assets — public SELECT only
-- ============================================================

CREATE POLICY "team-assets_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-assets');

-- ============================================================
-- ad-creatives — public SELECT only
-- ============================================================

CREATE POLICY "ad-creatives_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ad-creatives');

-- ============================================================
-- misc — public SELECT only
-- ============================================================

CREATE POLICY "misc_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'misc');
