import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import ListingClient from "./ListingClient";

export const metadata: Metadata = {
  title: "My Listing | Dashboard | ATL Vibes & Views",
  description: "Manage your business listing details, hours, contact info, photos, and tags.",
  robots: { index: false, follow: false },
};

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function ListingPage() {
  const owner = getMockBusinessOwner();
  const businessId = owner.business_id!;
  const supabase = createServerClient();

  // Fetch business listing
  const { data: business } = (await supabase
    .from("business_listings")
    .select("*")
    .eq("id", businessId)
    .single()) as { data: any };

  // Fetch categories for select options
  const { data: categories } = (await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order")) as { data: { id: string; name: string }[] | null };

  // Fetch neighborhood name
  const { data: neighborhood } = business?.neighborhood_id
    ? ((await supabase
        .from("neighborhoods")
        .select("name")
        .eq("id", business.neighborhood_id)
        .single()) as { data: { name: string } | null })
    : { data: null };

  // Fetch business hours
  const { data: hours } = (await supabase
    .from("business_hours")
    .select("*")
    .eq("business_id", businessId)
    .order("day_of_week")) as {
    data: {
      id: string;
      day_of_week: string;
      open_time: string | null;
      close_time: string | null;
      is_closed: boolean;
    }[] | null;
  };

  // Fetch contacts
  const { data: contacts } = (await supabase
    .from("business_contacts")
    .select("*")
    .eq("business_id", businessId)) as {
    data: {
      id: string;
      contact_name: string;
      contact_title: string | null;
      contact_email: string | null;
      contact_phone: string | null;
      is_primary: boolean;
    }[] | null;
  };

  // Fetch images
  const { data: images } = (await supabase
    .from("business_images")
    .select("*")
    .eq("business_id", businessId)
    .order("sort_order")) as {
    data: {
      id: string;
      image_url: string;
      alt_text: string | null;
      is_primary: boolean;
      sort_order: number;
    }[] | null;
  };

  // Fetch amenities with selection state
  const { data: allAmenities } = (await supabase
    .from("amenities")
    .select("id, name, amenity_group")
    .order("amenity_group")
    .order("name")) as {
    data: { id: string; name: string; amenity_group: string | null }[] | null;
  };

  const { data: businessAmenities } = (await supabase
    .from("business_amenities")
    .select("amenity_id")
    .eq("business_id", businessId)) as { data: { amenity_id: string }[] | null };

  const selectedAmenityIds = new Set(businessAmenities?.map((ba) => ba.amenity_id) ?? []);
  const amenitiesWithSelection = (allAmenities ?? []).map((a) => ({
    ...a,
    selected: selectedAmenityIds.has(a.id),
  }));

  // Fetch identity options with selection state
  const { data: allIdentityOptions } = (await supabase
    .from("business_identity_options")
    .select("id, name, slug")
    .order("sort_order")) as {
    data: { id: string; name: string; slug: string }[] | null;
  };

  const { data: businessIdentities } = (await supabase
    .from("business_identities")
    .select("identity_option_id")
    .eq("business_id", businessId)) as { data: { identity_option_id: string }[] | null };

  const selectedIdentityIds = new Set(
    businessIdentities?.map((bi) => bi.identity_option_id) ?? []
  );
  const identityOptionsWithSelection = (allIdentityOptions ?? []).map((io) => ({
    ...io,
    selected: selectedIdentityIds.has(io.id),
  }));

  // Fetch tags with selection state
  const { data: allTags } = (await supabase
    .from("tags")
    .select("id, name")
    .eq("is_active", true)
    .order("name")) as { data: { id: string; name: string }[] | null };

  const { data: businessTags } = (await supabase
    .from("business_tags")
    .select("tag_id")
    .eq("business_id", businessId)) as { data: { tag_id: string }[] | null };

  const selectedTagIds = new Set(businessTags?.map((bt) => bt.tag_id) ?? []);
  const tagsWithSelection = (allTags ?? []).map((t) => ({
    ...t,
    selected: selectedTagIds.has(t.id),
  }));

  return (
    <ListingClient
      business={business}
      categories={categories ?? []}
      neighborhoodName={neighborhood?.name ?? null}
      hours={hours ?? []}
      contacts={contacts ?? []}
      images={images ?? []}
      amenities={amenitiesWithSelection}
      identityOptions={identityOptionsWithSelection}
      tags={tagsWithSelection}
    />
  );
}
