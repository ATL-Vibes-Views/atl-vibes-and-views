import { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { getBusinessState } from "@/components/dashboard/TierBadge";

export const metadata: Metadata = {
  title: "Dashboard | ATL Vibes & Views",
  description:
    "Business owner dashboard for managing your listing on ATL Vibes & Views.",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = getMockBusinessOwner();
  const supabase = createServerClient();

  const { data: business } = (await supabase
    .from("business_listings")
    .select("business_name, slug, status, tier, is_founding_member")
    .eq("id", owner.business_id!)
    .single()) as {
    data: {
      business_name: string;
      slug: string;
      status: string;
      tier: string;
      is_founding_member: boolean;
    } | null;
  };

  const { data: sponsor } = (await supabase
    .from("sponsors")
    .select("is_active")
    .eq("business_id", owner.business_id!)
    .eq("is_active", true)
    .maybeSingle()) as {
    data: { is_active: boolean } | null;
  };

  const state = getBusinessState(business, sponsor);
  const listingSlug = business?.slug ?? "";

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <DashboardSidebar
        businessName={business?.business_name ?? "My Business"}
        businessState={state}
        isActive={business?.status === "active"}
      />
      <div className="flex-1 min-[900px]:ml-[240px] max-[899px]:ml-0">
        {/* Sticky top bar */}
        <header className="sticky top-0 z-50 bg-white border-b border-[#e5e5e5] flex items-center justify-between px-8 py-5 max-[899px]:mt-12">
          <h1 className="font-display text-[24px] font-bold text-[#1a1a1a]">
            Dashboard
          </h1>
          {listingSlug && (
            <Link
              href={`/businesses/${listingSlug}`}
              className="text-[13px] font-medium text-[#c1121f] hover:underline"
            >
              View Live Listing &rarr;
            </Link>
          )}
        </header>
        <main className="max-w-[1200px] px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
