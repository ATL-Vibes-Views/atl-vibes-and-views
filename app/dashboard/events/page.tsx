import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Events | Dashboard | ATL Vibes & Views",
  description: "Manage events hosted at or organized by your business.",
  robots: { index: false, follow: false },
};

interface EventRow {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  venue_name: string | null;
  status: string;
  is_free: boolean;
  ticket_price_min: number | null;
  ticket_price_max: number | null;
  description: string | null;
  neighborhood_id: string | null;
}

export default async function EventsPage() {
  const owner = getMockBusinessOwner();
  const businessId = owner.business_id!;
  const supabase = createServerClient();

  const { data: events } = (await supabase
    .from("events")
    .select("id, title, slug, start_date, start_time, end_date, end_time, venue_name, status, is_free, ticket_price_min, ticket_price_max, description, neighborhood_id")
    .or(`venue_business_id.eq.${businessId},organizer_business_id.eq.${businessId}`)
    .order("start_date", { ascending: false })) as { data: EventRow[] | null };

  // Get neighborhood names for events
  const neighborhoodIds = [...new Set((events ?? []).map((e) => e.neighborhood_id).filter(Boolean))] as string[];
  const neighborhoodMap: Record<string, string> = {};
  if (neighborhoodIds.length > 0) {
    const { data: neighborhoods } = (await supabase
      .from("neighborhoods")
      .select("id, name")
      .in("id", neighborhoodIds)) as { data: { id: string; name: string }[] | null };
    if (neighborhoods) {
      for (const n of neighborhoods) {
        neighborhoodMap[n.id] = n.name;
      }
    }
  }

  const eventsWithNeighborhood = (events ?? []).map((e) => ({
    ...e,
    neighborhood_name: e.neighborhood_id ? neighborhoodMap[e.neighborhood_id] ?? null : null,
  }));

  return <EventsClient events={eventsWithNeighborhood} />;
}
