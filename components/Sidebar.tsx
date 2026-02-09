import Link from "next/link";
import { Facebook, Twitter, Youtube, Instagram, CalendarPlus } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";

/* ============================================================
   SIDEBAR — Modular Widget System
   ============================================================ */

/* --- Sidebar Container --- */
export function Sidebar({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="w-full lg:w-sidebar space-y-8" role="complementary">
      {children || <DefaultSidebarContent />}
    </aside>
  );
}

/* Default sidebar content when no children are passed */
function DefaultSidebarContent() {
  return (
    <>
      <NewsletterWidget />
      <AdPlacement slot="sidebar_top" />
      <NeighborhoodsWidget
        neighborhoods={[
          { name: "Virginia-Highland", slug: "virginia-highland" },
          { name: "Inman Park", slug: "inman-park" },
          { name: "Old Fourth Ward", slug: "old-fourth-ward" },
          { name: "Grant Park", slug: "grant-park" },
          { name: "Decatur", slug: "decatur" },
        ]}
      />
      <SubmitCTA />
    </>
  );
}

/* --- Widget Wrapper (consistent card styling) --- */
export function SidebarWidget({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-gray-100 p-5 ${className}`}>
      {children}
    </div>
  );
}

/* --- Widget Title --- */
export function WidgetTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h4 className={`font-display text-card-sm font-semibold mb-4 ${className}`}>
      {children}
    </h4>
  );
}

/* ============================================================
   NEWSLETTER WIDGET (Sidebar A)
   — compact=true: arrow only, no "Subscribe" text
   — arrow hover → #fee198
   ============================================================ */
export function NewsletterWidget({
  title = "Stay in the Loop",
  description = "Get the latest on Atlanta's neighborhoods, events, and culture delivered to your inbox.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <SidebarWidget className="bg-gold-light border-none">
      <WidgetTitle>{title}</WidgetTitle>
      <p className="text-sm text-gray-dark mb-4">{description}</p>
      <NewsletterForm compact />
    </SidebarWidget>
  );
}

/* ============================================================
   AD PLACEMENT WIDGET
   ============================================================ */
export function AdPlacement({
  slot,
  className = "",
}: {
  slot: "sidebar_top" | "sidebar_mid";
  className?: string;
}) {
  const href = slot === "sidebar_top" ? "/hub/businesses" : "/hub/events";
  return (
    <Link href={href} className={`block bg-gray-light hover:bg-gray-100 transition-colors ${className}`}>
      <div className="w-[300px] h-[250px] flex items-center justify-center border border-dashed border-gray-mid/30 hover:border-gold-dark transition-colors mx-auto">
        <div className="text-center">
          <span className="text-xs text-gray-mid uppercase tracking-eyebrow">
            Advertise Here
          </span>
          <p className="text-[10px] text-gray-400 mt-1">Reach Atlanta locals</p>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   NEIGHBORHOODS WIDGET (Sidebar A)
   — heading color → #c1121f
   ============================================================ */
interface NeighborhoodLink {
  name: string;
  slug: string;
  postCount?: number;
}

export function NeighborhoodsWidget({
  title = "Neighborhoods",
  neighborhoods,
}: {
  title?: string;
  neighborhoods: NeighborhoodLink[];
}) {
  return (
    <SidebarWidget>
      <WidgetTitle className="text-[#c1121f]">{title}</WidgetTitle>
      <ul className="space-y-1.5">
        {neighborhoods.map((n) => (
          <li key={n.slug}>
            <Link
              href={`/neighborhoods/${n.slug}`}
              className="flex items-center justify-between text-sm text-gray-dark hover:text-black transition-colors py-1"
            >
              <span>{n.name}</span>
              {n.postCount !== undefined && (
                <span className="text-xs text-gray-mid">{n.postCount}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/neighborhoods"
        className="inline-block mt-4 text-xs font-semibold uppercase tracking-eyebrow text-red-brand hover:text-black transition-colors"
      >
        See All Neighborhoods →
      </Link>
    </SidebarWidget>
  );
}

/* ============================================================
   SUBMIT CTA WIDGET (Sidebar A)
   — hover: white bg + black text
   ============================================================ */
export function SubmitCTA({
  heading = "Own a Business?",
  description = "Get your business in front of thousands of Atlantans.",
  buttonText = "Get Listed",
  href = "/submit",
}: {
  heading?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}) {
  return (
    <SidebarWidget className="bg-[#1a1a1a] border-none text-white">
      <WidgetTitle className="text-white">{heading}</WidgetTitle>
      <p className="text-sm text-white/70 mb-4">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center px-4 py-2 bg-gold-light text-black text-xs font-semibold uppercase tracking-eyebrow hover:bg-white hover:text-black transition-colors"
      >
        {buttonText}
      </Link>
    </SidebarWidget>
  );
}

/* ============================================================
   SOCIAL FOLLOW WIDGET (Sidebar B)
   — Lightweight, breathing room, credibility focused
   ============================================================ */

const TikTokIcon = ({ size = 16, ...props }: { size?: number; [key: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z" />
  </svg>
);

const SIDEBAR_SOCIALS = [
  { icon: Facebook, label: "Facebook", count: "56K", href: "https://facebook.com/atlvibesandviews", hoverColor: "hover:text-[#1877F2]" },
  { icon: Twitter, label: "X / Twitter", count: "1K", href: "https://x.com/atlvibes_views", hoverColor: "hover:text-black" },
  { icon: Youtube, label: "YouTube", count: "2K", href: "https://www.youtube.com/@livinginAtlanta-MellandaReese", hoverColor: "hover:text-[#FF0000]" },
  { icon: Instagram, label: "Instagram", count: "29K", href: "https://instagram.com/atlvibesandviews", hoverColor: "hover:text-[#E4405F]" },
  { icon: TikTokIcon, label: "TikTok", count: "25K", href: "https://tiktok.com/@atlvibesandviews", hoverColor: "hover:text-black" },
];

export function SocialFollowWidget() {
  return (
    <SidebarWidget className="border-none bg-transparent px-0">
      <WidgetTitle className="text-[#c1121f]">Follow Us</WidgetTitle>
      <div className="space-y-4 pt-2">
        {SIDEBAR_SOCIALS.map(({ icon: Icon, label, count, href, hoverColor }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-4 group text-gray-dark ${hoverColor} transition-colors`}
          >
            <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Icon size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold">{label}</span>
            </div>
            <span className="text-xs text-gray-mid font-medium">{count}</span>
          </a>
        ))}
      </div>
    </SidebarWidget>
  );
}

/* ============================================================
   SUBMIT EVENT CTA (Sidebar B)
   ============================================================ */
export function SubmitEventCTA() {
  return (
    <SidebarWidget className="bg-[#f8f5f0] border-none">
      <div className="flex items-center gap-3 mb-3">
        <CalendarPlus size={20} className="text-[#c1121f]" />
        <WidgetTitle className="!mb-0">Submit Your Event</WidgetTitle>
      </div>
      <p className="text-sm text-gray-mid mb-4">
        Have an upcoming event in Atlanta? Get it in front of our audience.
      </p>
      <Link
        href="/submit"
        className="inline-flex items-center px-5 py-2.5 bg-[#fee198] text-black text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-black hover:text-[#fee198] transition-colors"
      >
        Submit Event
      </Link>
    </SidebarWidget>
  );
}
