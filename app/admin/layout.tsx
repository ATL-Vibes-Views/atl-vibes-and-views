import { Metadata } from "next";
import {
  LayoutDashboard,
  Inbox,
  Rocket,
  FileText,
  Film,
  Share2,
  Video,
  RefreshCw,
  CalendarDays,
  Store,
  PartyPopper,
  Building2,
  Map,
  MapPin,
  FolderOpen,
  Tag,
  DollarSign,
  Megaphone,
  Mail,
  Star,
  Users,
  ClipboardList,
  BarChart3,
  Globe,
  Zap,
  ArrowUpDown,
  Settings,
} from "lucide-react";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { createServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Admin | ATL Vibes & Views",
  description: "Admin CMS for ATL Vibes & Views.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();

  // Fetch count badges in parallel — 11 badges total
  const counts = (await Promise.all([
    supabase.from("stories").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "scheduled"),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("scripts").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("scripts").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("media_items").select("*", { count: "exact", head: true }),
    supabase.from("stories").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase.from("business_listings").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ])) as unknown as { count: number | null }[];

  const contentInbox = counts[0].count ?? 0;
  const publishingQueue = counts[1].count ?? 0;
  const draftPosts = counts[2].count ?? 0;
  const draftScripts = counts[3].count ?? 0;
  const socialQueue = counts[4].count ?? 0;
  const mediaCount = counts[5].count ?? 0;
  const pipelineCount = counts[6].count ?? 0;
  const businessCount = counts[7].count ?? 0;
  const eventCount = counts[8].count ?? 0;
  const pendingReviews = counts[9].count ?? 0;
  const pendingSubmissions = counts[10].count ?? 0;

  const navGroups = [
    {
      label: "Content",
      items: [
        { label: "Dashboard", path: "/admin", icon: <LayoutDashboard size={16} /> },
        { label: "Content Inbox", path: "/admin/inbox", icon: <Inbox size={16} />, ...(contentInbox > 0 ? { count: contentInbox } : {}) },
        { label: "Publishing Queue", path: "/admin/publishing", icon: <Rocket size={16} />, ...(publishingQueue > 0 ? { count: publishingQueue } : {}) },
        { label: "Blog Posts", path: "/admin/posts", icon: <FileText size={16} />, ...(draftPosts > 0 ? { count: draftPosts } : {}) },
        { label: "Scripts", path: "/admin/scripts", icon: <Film size={16} />, ...(draftScripts > 0 ? { count: draftScripts } : {}) },
        { label: "Social Queue", path: "/admin/social", icon: <Share2 size={16} />, ...(socialQueue > 0 ? { count: socialQueue } : {}) },
        { label: "Media", path: "/admin/media", icon: <Video size={16} />, ...(mediaCount > 0 ? { count: mediaCount } : {}) },
        { label: "Pipeline", path: "/admin/pipeline", icon: <RefreshCw size={16} />, ...(pipelineCount > 0 ? { count: pipelineCount } : {}) },
        { label: "Content Calendar", path: "/admin/calendar", icon: <CalendarDays size={16} /> },
      ],
    },
    {
      label: "Directory",
      items: [
        { label: "Businesses", path: "/admin/businesses", icon: <Store size={16} />, ...(businessCount > 0 ? { count: businessCount } : {}) },
        { label: "Events", path: "/admin/events", icon: <PartyPopper size={16} />, ...(eventCount > 0 ? { count: eventCount } : {}) },
        { label: "Neighborhoods", path: "/admin/neighborhoods", icon: <Building2 size={16} /> },
        { label: "Areas", path: "/admin/areas", icon: <Map size={16} /> },
        { label: "Beyond ATL", path: "/admin/beyond-atl", icon: <MapPin size={16} /> },
      ],
    },
    {
      label: "Taxonomy",
      items: [
        { label: "Categories", path: "/admin/categories", icon: <FolderOpen size={16} /> },
        { label: "Tags", path: "/admin/tags", icon: <Tag size={16} /> },
      ],
    },
    {
      label: "Revenue",
      items: [
        { label: "Sponsors", path: "/admin/sponsors", icon: <DollarSign size={16} /> },
        { label: "Ad Slots", path: "/admin/ads", icon: <Megaphone size={16} /> },
        { label: "Newsletter", path: "/admin/newsletter", icon: <Mail size={16} /> },
      ],
    },
    {
      label: "Community",
      items: [
        { label: "Reviews", path: "/admin/reviews", icon: <Star size={16} />, ...(pendingReviews > 0 ? { count: pendingReviews } : {}) },
        { label: "Users", path: "/admin/users", icon: <Users size={16} /> },
        { label: "Submissions", path: "/admin/submissions", icon: <ClipboardList size={16} />, ...(pendingSubmissions > 0 ? { count: pendingSubmissions } : {}) },
      ],
    },
    {
      label: "System",
      items: [
        { label: "Analytics", path: "/admin/analytics", icon: <BarChart3 size={16} /> },
        { label: "Maps", path: "/admin/maps", icon: <Globe size={16} /> },
        { label: "Automation", path: "/admin/automation", icon: <Zap size={16} /> },
        { label: "Import/Export", path: "/admin/import-export", icon: <ArrowUpDown size={16} /> },
        { label: "Settings", path: "/admin/settings", icon: <Settings size={16} /> },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen">
      <PortalSidebar
        theme="dark"
        brandLabel="ATL Vibes & Views"
        subLabel="Admin CMS"
        navGroups={navGroups}
        activePath="/admin"
      />
      <main className="flex-1 min-[900px]:ml-[240px] max-[899px]:ml-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
