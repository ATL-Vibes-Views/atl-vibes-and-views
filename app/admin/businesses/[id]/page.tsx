import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { BusinessDetailClient } from "./BusinessDetailClient";

export const metadata: Metadata = {
  title: "Business Detail | Admin | ATL Vibes & Views",
  description: "Edit business listing details.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  const isNew = id === "new";

  // Main business
  let business = null;
  if (!isNew) {
    const { data, error } = (await supabase
      .from("business_listings")
      .select("*")
      .eq("id", id)
      .single()) as { data: Record<string, unknown> | null; error: unknown };
    if (error) console.error("Failed to fetch business:", error);
    business = data;
  }

  // Hours
  const { data: hours } = isNew ? { data: null } : (await supabase
    .from("business_hours")
    .select("*")
    .eq("business_id", id)
    .order("created_at")) as { data: { id: string; business_id: string; day_of_week: string; open_time: string | null; close_time: string | null; is_closed: boolean; notes: string | null }[] | null };

  // Contacts
  const { data: contacts } = isNew ? { data: null } : (await supabase
    .from("business_contacts")
    .select("*")
    .eq("business_id", id)
    .order("is_primary", { ascending: false })) as { data: { id: string; contact_name: string; contact_title: string | null; contact_email: string | null; contact_phone: string | null; is_primary: boolean; is_public: boolean; notes: string | null }[] | null };

  // Images
  const { data: images } = isNew ? { data: null } : (await supabase
    .from("business_images")
    .select("*")
    .eq("business_id", id)
    .order("sort_order")) as { data: { id: string; image_url: string; caption: string | null; alt_text: string | null; sort_order: number; is_primary: boolean }[] | null };

  // Amenities with junction status
  const { data: amenities } = (await supabase
    .from("amenities")
    .select("id, name, amenity_group, sort_order")
    .order("amenity_group")
    .order("sort_order")) as { data: { id: string; name: string; amenity_group: string | null; sort_order: number }[] | null };

  let activeAmenityIds: string[] = [];
  if (!isNew) {
    const { data: ba } = (await supabase
      .from("business_amenities")
      .select("amenity_id")
      .eq("business_id", id)) as { data: { amenity_id: string }[] | null };
    activeAmenityIds = (ba ?? []).map((a) => a.amenity_id);
  }

  // Identity options with junction status
  const { data: identityOptions } = (await supabase
    .from("business_identity_options")
    .select("id, name, slug, sort_order")
    .order("sort_order")) as { data: { id: string; name: string; slug: string; sort_order: number }[] | null };

  let activeIdentityIds: string[] = [];
  if (!isNew) {
    const { data: bi } = (await supabase
      .from("business_identities")
      .select("identity_option_id")
      .eq("business_id", id)) as { data: { identity_option_id: string }[] | null };
    activeIdentityIds = (bi ?? []).map((i) => i.identity_option_id);
  }

  // Tags with junction status
  const { data: tags } = (await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name")) as { data: { id: string; name: string; slug: string }[] | null };

  let activeTagIds: string[] = [];
  if (!isNew) {
    const { data: bt } = (await supabase
      .from("business_tags")
      .select("tag_id")
      .eq("business_id", id)) as { data: { tag_id: string }[] | null };
    activeTagIds = (bt ?? []).map((t) => t.tag_id);
  }

  // Related blog posts
  let relatedPosts: { id: string; title: string; slug: string; status: string; published_at: string | null; mention_type: string | null }[] = [];
  if (!isNew) {
    const { data: pb } = (await supabase
      .from("post_businesses")
      .select("mention_type, blog_posts(id, title, slug, status, published_at)")
      .eq("business_id", id)
      .limit(10)) as { data: { mention_type: string | null; blog_posts: { id: string; title: string; slug: string; status: string; published_at: string | null } | null }[] | null };
    relatedPosts = (pb ?? [])
      .filter((p) => p.blog_posts !== null)
      .map((p) => ({ ...p.blog_posts!, mention_type: p.mention_type }));
  }

  // Related events
  let relatedEvents: { id: string; title: string; start_date: string; status: string }[] = [];
  if (!isNew) {
    const { data: ev1 } = (await supabase
      .from("events")
      .select("id, title, start_date, status")
      .or(`venue_business_id.eq.${id},organizer_business_id.eq.${id}`)
      .order("start_date", { ascending: false })
      .limit(10)) as { data: { id: string; title: string; start_date: string; status: string }[] | null };
    relatedEvents = ev1 ?? [];
  }

  // Related reviews
  let relatedReviews: { id: string; rating: number; body: string | null; status: string; created_at: string }[] = [];
  if (!isNew) {
    const { data: rv } = (await supabase
      .from("reviews")
      .select("id, rating, body, status, created_at")
      .eq("business_id", id)
      .order("created_at", { ascending: false })
      .limit(10)) as { data: { id: string; rating: number; body: string | null; status: string; created_at: string }[] | null };
    relatedReviews = rv ?? [];
  }

  // Lookup data for dropdowns
  const [categoriesRes, neighborhoodsRes, citiesRes] = await Promise.all([
    supabase.from("categories").select("id, name").eq("is_active", true).order("name") as unknown as Promise<{ data: { id: string; name: string }[] | null }>,
    supabase.from("neighborhoods").select("id, name, slug, areas(id, name, slug)").order("name") as unknown as Promise<{ data: { id: string; name: string; slug: string; areas: { id: string; name: string; slug: string } | null }[] | null }>,
    supabase.from("cities").select("id, name").order("name") as unknown as Promise<{ data: { id: string; name: string }[] | null }>,
  ]);

  // Flat list for existing-business dropdowns
  const neighborhoodsFlat = (neighborhoodsRes.data ?? []).map((n) => ({ id: n.id, name: n.name }));

  // Grouped list for BusinessForm (isNew path)
  const neighborhoodsGroupedMap = new Map<string, { area_name: string; area_slug: string; neighborhoods: { id: string; name: string; slug: string }[] }>();
  for (const n of neighborhoodsRes.data ?? []) {
    const areaName = n.areas?.name ?? "Other";
    const areaSlug = n.areas?.slug ?? "other";
    if (!neighborhoodsGroupedMap.has(areaName)) {
      neighborhoodsGroupedMap.set(areaName, { area_name: areaName, area_slug: areaSlug, neighborhoods: [] });
    }
    neighborhoodsGroupedMap.get(areaName)!.neighborhoods.push({ id: n.id, name: n.name, slug: n.slug });
  }
  const neighborhoodsGrouped = Array.from(neighborhoodsGroupedMap.values());

  return (
    <BusinessDetailClient
      business={business}
      isNew={isNew}
      hours={hours ?? []}
      contacts={contacts ?? []}
      images={images ?? []}
      amenities={amenities ?? []}
      activeAmenityIds={activeAmenityIds}
      identityOptions={identityOptions ?? []}
      activeIdentityIds={activeIdentityIds}
      tags={tags ?? []}
      activeTagIds={activeTagIds}
      relatedPosts={relatedPosts}
      relatedEvents={relatedEvents}
      relatedReviews={relatedReviews}
      categories={categoriesRes.data ?? []}
      neighborhoods={neighborhoodsFlat}
      neighborhoodsGrouped={neighborhoodsGrouped}
      cities={citiesRes.data ?? []}
    />
  );
}
