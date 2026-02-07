import { NewsletterForm } from "./NewsletterForm";
import Link from "next/link";

/* ============================================================
   SIDEBAR — Modular Widget System
   
   Usage:
   <Sidebar>
     <NewsletterWidget />
     <AdPlacement slot="sidebar_top" />
     <NeighborhoodsWidget neighborhoods={data} />
     <SubmitCTA />
   </Sidebar>
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
          { name: "Virginia-Highland", slug: "virginia-highland", postCount: 24 },
          { name: "Inman Park", slug: "inman-park", postCount: 19 },
          { name: "Old Fourth Ward", slug: "old-fourth-ward", postCount: 17 },
          { name: "Grant Park", slug: "grant-park", postCount: 15 },
          { name: "Decatur", slug: "decatur", postCount: 12 },
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
export function WidgetTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-display text-card-sm font-semibold mb-4">
      {children}
    </h4>
  );
}

/* ============================================================
   NEWSLETTER WIDGET
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
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          placeholder="Your email address"
          className="w-full px-3 py-2.5 text-sm border border-black/10 bg-white outline-none focus:border-black transition-colors mb-3"
        />
        <button
          type="submit"
          className="w-full py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow hover:bg-gray-dark transition-colors"
        >
          Subscribe
        </button>
      </form>
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
   NEIGHBORHOODS WIDGET
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
      <WidgetTitle>{title}</WidgetTitle>
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
   FEATURED STORIES WIDGET
   ============================================================ */
interface FeaturedStory {
  title: string;
  slug: string;
  category?: string;
  imageUrl?: string;
}

export function FeaturedStoriesWidget({
  title = "Editor's Picks",
  stories,
}: {
  title?: string;
  stories: FeaturedStory[];
}) {
  return (
    <SidebarWidget>
      <WidgetTitle>{title}</WidgetTitle>
      <ul className="space-y-4">
        {stories.map((story, i) => (
          <li key={story.slug}>
            <Link
              href={`/blog/${story.slug}`}
              className="group flex gap-3"
            >
              {/* Thumbnail */}
              {story.imageUrl ? (
                <div className="w-16 h-16 shrink-0 bg-gray-light overflow-hidden">
                  <img
                    src={story.imageUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 shrink-0 bg-gray-light flex items-center justify-center">
                  <span className="font-display text-lg text-gray-mid">
                    {i + 1}
                  </span>
                </div>
              )}

              <div className="min-w-0">
                {story.category && (
                  <span className="eyebrow eyebrow-red text-[10px]">
                    {story.category}
                  </span>
                )}
                <h5 className="font-display text-sm font-semibold leading-tight group-hover:text-red-brand transition-colors line-clamp-2">
                  {story.title}
                </h5>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </SidebarWidget>
  );
}

/* ============================================================
   SUBMIT CTA WIDGET
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
      <WidgetTitle>{heading}</WidgetTitle>
      <p className="text-sm text-white/60 mb-4">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center px-4 py-2 bg-gold-light text-black text-xs font-semibold uppercase tracking-eyebrow hover:bg-gold-dark transition-colors"
      >
        {buttonText}
      </Link>
    </SidebarWidget>
  );
}

/* ============================================================
   GUIDE PROMO WIDGET
   ============================================================ */
export function GuidePromoWidget({
  title = "Atlanta Guide",
  description = "Your ultimate guide to the city — neighborhoods, eats, events, and more.",
  href = "/hub/atlanta-guide",
}: {
  title?: string;
  description?: string;
  href?: string;
}) {
  return (
    <SidebarWidget className="border-gold-dark border-2">
      <WidgetTitle>{title}</WidgetTitle>
      <p className="text-sm text-gray-dark mb-4">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center text-xs font-semibold uppercase tracking-eyebrow text-red-brand hover:text-black transition-colors"
      >
        Explore the Guide →
      </Link>
    </SidebarWidget>
  );
}
