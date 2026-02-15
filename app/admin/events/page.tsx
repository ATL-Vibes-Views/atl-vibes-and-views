import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { EventsClient } from "./EventsClient";

export const metadata: Metadata = {
  title: "Events | Admin | ATL Vibes & Views",
  description: "Manage events in ATL Vibes & Views.",
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const supabase = createServerClient();

  const { data: events, error: evErr } = (await supabase
    .from("events")
    .select("id, title, slug, status, start_date, start_time, venue_name, is_free, ticket_price_min, tier, event_type, categories(name), neighborhoods(name)")
    .order("start_date", { ascending: false })) as {
    data: {
      id: string;
      title: string;
      slug: string;
      status: string;
      start_date: string;
      start_time: string | null;
      venue_name: string | null;
      is_free: boolean;
      ticket_price_min: number | null;
      tier: string;
      event_type: string | null;
      categories: { name: string } | null;
      neighborhoods: { name: string } | null;
    }[] | null;
    error: unknown;
  };
  if (evErr) console.error("Failed to fetch events:", evErr);

  const { data: categories } = (await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name")) as { data: { id: string; name: string }[] | null };

  const { data: neighborhoods } = (await supabase
    .from("neighborhoods")
    .select("id, name")
    .order("name")) as { data: { id: string; name: string }[] | null };

  return (
    <EventsClient
      events={events ?? []}
      categories={categories ?? []}
      neighborhoods={neighborhoods ?? []}
    />
  );
}
