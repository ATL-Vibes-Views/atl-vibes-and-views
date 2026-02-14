import { Metadata } from "next";
import {
  LayoutDashboard,
  Store,
  BarChart3,
  CreditCard,
  Star,
  Newspaper,
  Calendar,
  Settings,
} from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { createServerClient } from "@/lib/supabase";
import { getMockBusinessOwner } from "@/lib/mock-auth";

export const metadata: Metadata = {
  title: "Dashboard | ATL Vibes & Views",
  description: "Business owner dashboard for managing your listing on ATL Vibes & Views.",
  robots: { index: false, follow: false },
};

const navGroups = [
  {
    items: [
      { label: "Overview", path: "/dashboard", icon: <LayoutDashboard size={16} /> },
      { label: "My Listing", path: "/dashboard/listing", icon: <Store size={16} /> },
      { label: "Analytics", path: "/dashboard/analytics", icon: <BarChart3 size={16} /> },
      { label: "Plan & Billing", path: "/dashboard/billing", icon: <CreditCard size={16} /> },
      { label: "Reviews", path: "/dashboard/reviews", icon: <Star size={16} /> },
      { label: "Press & Stories", path: "/dashboard/stories", icon: <Newspaper size={16} /> },
      { label: "Events", path: "/dashboard/events", icon: <Calendar size={16} /> },
      { label: "Settings", path: "/dashboard/settings", icon: <Settings size={16} /> },
    ],
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = getMockBusinessOwner();
  const supabase = createServerClient();

  const { data: business } = await supabase
    .from("business_listings")
    .select("business_name, status, tier")
    .eq("id", owner.business_id!)
    .single() as { data: { business_name: string; status: string; tier: string } | null };

  const businessCard = business
    ? {
        name: business.business_name,
        status: business.status,
        tier: business.tier,
      }
    : { name: "My Business", status: "active", tier: "Free" };

  return (
    <PortalLayout
      sidebar={
        <PortalSidebar
          theme="light"
          brandLabel="ATL Vibes & Views"
          subLabel="Business Dashboard"
          navGroups={navGroups}
          activePath="/dashboard"
          businessCard={businessCard}
        />
      }
    >
      {children}
    </PortalLayout>
  );
}
