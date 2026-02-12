-- Seed 9 Beyond ATL cities into the cities table.
-- Run this in the Supabase SQL Editor (project ref: qthjasdenjuwbvvomvdk).
-- These are INSERT ... ON CONFLICT so they're safe to run multiple times.

INSERT INTO cities (name, slug, state, is_primary, is_active, sort_order, metro_area, tagline, description)
VALUES
  ('Alpharetta', 'alpharetta', 'GA', false, true, 1, 'Atlanta',
   'Tech hub meets Southern charm',
   'Alpharetta blends a thriving tech corridor with charming downtown streets, family-friendly parks, and a growing food scene.'),
  ('Brookhaven', 'brookhaven', 'GA', false, true, 2, 'Atlanta',
   'Parks, patios, and Peachtree Creek',
   'Brookhaven offers leafy neighborhoods, the beloved Peachtree Creek Greenway, and a restaurant row that keeps growing.'),
  ('Chamblee', 'chamblee', 'GA', false, true, 3, 'Atlanta',
   'International flavors, local heart',
   'Chamblee is Atlanta''s international food corridor — Buford Highway runs through it — with a tight-knit community and creative energy.'),
  ('Decatur', 'decatur', 'GA', false, true, 4, 'Atlanta',
   'A city of festivals, food, and front porches',
   'Decatur packs award-winning restaurants, indie bookstores, craft breweries, and year-round festivals into its walkable downtown square.'),
  ('Doraville', 'doraville', 'GA', false, true, 5, 'Atlanta',
   'Diverse, delicious, and on the rise',
   'Doraville is a multicultural gem on Buford Highway, home to incredible Asian and Latin cuisine and a rapidly evolving arts scene.'),
  ('Fayetteville', 'fayetteville', 'GA', false, true, 6, 'Atlanta',
   'Small-town charm south of the city',
   'Fayetteville offers a historic downtown square, family-friendly living, and easy access to Pinewood Studios and southern Fayette County.'),
  ('Marietta', 'marietta', 'GA', false, true, 7, 'Atlanta',
   'History, art, and the Big Chicken',
   'Marietta''s vibrant square is lined with restaurants, theaters, and galleries, anchored by deep Civil War history and genuine Southern hospitality.'),
  ('Sandy Springs', 'sandy-springs', 'GA', false, true, 8, 'Atlanta',
   'Nature and nightlife north of the Perimeter',
   'Sandy Springs balances the Chattahoochee River trails with upscale dining, a new city center, and one of metro Atlanta''s most active nightlife strips.'),
  ('Smyrna', 'smyrna', 'GA', false, true, 9, 'Atlanta',
   'The Jonquil City — blooming with culture',
   'Smyrna''s Market Village anchors a walkable downtown with restaurants, shops, and community events, minutes from the Battery and SunTrust Park.')
ON CONFLICT (slug) DO UPDATE SET
  state = EXCLUDED.state,
  is_primary = EXCLUDED.is_primary,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  metro_area = EXCLUDED.metro_area,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description;

-- Verify:
-- SELECT id, name, slug, sort_order, is_primary, is_active, tagline FROM cities WHERE is_active = true ORDER BY sort_order;
