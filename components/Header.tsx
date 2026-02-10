"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Youtube, Instagram, User, Search, Menu, X, ChevronDown, ChevronRight } from "lucide-react";

const TikTokIcon = ({ size = 14, ...props }: { size?: number; [key: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z" />
  </svg>
);

/* === Explore ATL data shape (passed from server) === */
interface ExploreGroup {
  area_name: string;
  area_slug: string;
  neighborhoods: { id: string; name: string; slug: string }[];
}

const MAX_NEIGHBORHOODS = 12;

const HUB_ITEMS = [
  { name: "Businesses", slug: "businesses", image: "https://placehold.co/200x120/1a1a1a/e6c46d?text=Businesses" },
  { name: "Eats & Drinks", slug: "eats-and-drinks", image: "https://placehold.co/200x120/c1121f/ffffff?text=Eats" },
  { name: "Events", slug: "events", image: "https://placehold.co/200x120/4a4a4a/ffffff?text=Events" },
  { name: "Things to Do", slug: "things-to-do", image: "https://placehold.co/200x120/e6c46d/1a1a1a?text=Things+To+Do" },
  { name: "Atlanta Guide", slug: "atlanta-guide", image: "https://placehold.co/200x120/1a1a1a/fee198?text=Guide" },
];

/* === BEYOND ATL — cities dropdown === */
const BEYOND_ATL_CITIES = [
  { name: "Decatur", slug: "decatur" },
  { name: "Marietta", slug: "marietta" },
  { name: "Alpharetta", slug: "alpharetta" },
  { name: "Sandy Springs", slug: "sandy-springs" },
];

const SOCIAL_LINKS = [
  { icon: Facebook, label: "Facebook", count: "56K", href: "https://facebook.com/atlvibesandviews", hoverClass: "group-hover:text-[#1877F2]" },
  { icon: Twitter, label: "X", count: "1K", href: "https://x.com/atlvibes_views", hoverClass: "group-hover:text-black" },
  { icon: Youtube, label: "YouTube", count: "2K", href: "https://www.youtube.com/@livinginAtlanta-MellandaReese", hoverClass: "group-hover:text-[#FF0000]" },
  { icon: Instagram, label: "Instagram", count: "29K", href: "https://instagram.com/atlvibesandviews", hoverClass: "group-hover:text-[#E4405F]" },
  { icon: TikTokIcon, label: "TikTok", count: "25K", href: "https://tiktok.com/@atlvibesandviews", hoverClass: "group-hover:text-black" },
];

const DRAWER_STORIES = [
  { slug: "atlanta-hidden-rooftop-bars", title: "Atlanta\u2019s Best Hidden Rooftop Bars", image: "https://placehold.co/80x80/c1121f/ffffff?text=1" },
  { slug: "neighborhood-guide-old-fourth-ward", title: "Neighborhood Guide: Old Fourth Ward", image: "https://placehold.co/80x80/4a4a4a/ffffff?text=2" },
  { slug: "best-weekend-brunch-spots", title: "The Best Weekend Brunch Spots in the City", image: "https://placehold.co/80x80/e6c46d/1a1a1a?text=3" },
];

interface HeaderProps {
  exploreData?: ExploreGroup[];
}

export function Header({ exploreData = [] }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [beyondSubmenuOpen, setBeyondSubmenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [closeSpinning, setCloseSpinning] = useState(false);
  /* Desktop: which area is hovered in the Explore ATL flyout */
  const [hoveredAreaSlug, setHoveredAreaSlug] = useState<string | null>(null);
  /* Mobile drawer sub-menus */
  const [mobileAreasOpen, setMobileAreasOpen] = useState(false);
  const [mobileExploreAreaSlug, setMobileExploreAreaSlug] = useState<string | null>(null);
  const [mobileHubOpen, setMobileHubOpen] = useState(false);
  const [mobileBeyondOpen, setMobileBeyondOpen] = useState(false);
  const [mobileCitiesOpen, setMobileCitiesOpen] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  /* Auto-select first area when Explore dropdown opens */
  const firstAreaSlug = exploreData[0]?.area_slug ?? null;

  useEffect(() => {
    const handleClick = () => { setActiveDropdown(null); setBeyondSubmenuOpen(false); };
    if (activeDropdown) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [activeDropdown]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleDropdownEnter = (name: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(name);
    if (name === "areas") setHoveredAreaSlug(firstAreaSlug);
    if (name !== "beyond") setBeyondSubmenuOpen(false);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => { setActiveDropdown(null); setBeyondSubmenuOpen(false); setHoveredAreaSlug(null); }, 200);
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    requestAnimationFrame(() => { requestAnimationFrame(() => { setDrawerVisible(true); }); });
  };

  const closeDrawer = () => {
    setCloseSpinning(true);
    setTimeout(() => {
      setDrawerVisible(false);
      setTimeout(() => { setDrawerOpen(false); setCloseSpinning(false); }, 400);
    }, 250);
  };

  /* Find active area group for desktop flyout */
  const activeAreaGroup = exploreData.find((g) => g.area_slug === hoveredAreaSlug) ?? null;

  return (
    <header className="w-full bg-white sticky top-0 z-50 border-b border-gray-200">
      {/* ROW 1 — Brand bar */}
      <div className="border-b border-gray-100">
        <div className="site-container flex items-center justify-between h-[84px]">
          <div className="hidden md:flex items-center gap-5">
            {SOCIAL_LINKS.map(({ icon: Icon, label, count, href, hoverClass }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 group" aria-label={label}>
                <span className={`text-gray-400 transition-colors duration-200 ${hoverClass}`}><Icon size={15} strokeWidth={1.5} /></span>
                <span className="text-xs font-medium text-gray-400">{count}</span>
              </a>
            ))}
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="font-logo text-xl md:text-2xl font-bold tracking-wide text-black leading-none">ATL VIBES &amp; VIEWS</div>
            <div className="text-[10px] md:text-xs tracking-[0.15em] text-gray-mid mt-1.5 uppercase">The City. The Culture. The Conversation.</div>
          </Link>

          <div className="flex items-center gap-3 ml-auto">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2.5 rounded-full transition-colors duration-200 text-[#e6c46d] hover:text-black" aria-label="Search"><Search size={20} strokeWidth={1.5} /></button>
            <Link href="/login" className="p-2.5 rounded-full transition-colors duration-200 text-[#e6c46d] hover:text-black" aria-label="Sign in"><User size={20} strokeWidth={1.5} /></Link>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="border-b border-gray-100 bg-gray-50">
          <div className="site-container py-4">
            <div className="flex items-center gap-3 max-w-xl mx-auto">
              <Search size={18} className="text-gray-mid shrink-0" />
              <input type="text" placeholder="Search stories, neighborhoods, businesses..." className="w-full bg-transparent text-sm outline-none placeholder:text-gray-mid" autoFocus />
              <button onClick={() => setSearchOpen(false)} className="p-1 hover:bg-white rounded-full transition-colors"><X size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {/* ROW 2 — Navigation */}
      <div className="site-container flex items-center justify-between h-[60px]">
        <button onClick={openDrawer} className="p-2.5 -ml-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Open menu"><Menu size={22} strokeWidth={1.5} /></button>

        <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          <NavLink href="/">Home</NavLink>

          {/* EXPLORE ATL — hierarchical areas → neighborhoods flyout */}
          <div className="relative" onMouseEnter={() => handleDropdownEnter("areas")} onMouseLeave={handleDropdownLeave}>
            <NavDropdownTriggerLink href="/areas" active={activeDropdown === "areas"}>Explore ATL</NavDropdownTriggerLink>
            {activeDropdown === "areas" && exploreData.length > 0 && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-100 shadow-lg z-50 flex" style={{ minWidth: 520 }}>
                {/* Left — Area list */}
                <div className="w-[200px] border-r border-gray-100 py-3">
                  {exploreData.map((group) => (
                    <Link
                      key={group.area_slug}
                      href={`/areas/${group.area_slug}`}
                      className={`flex items-center justify-between px-5 py-2.5 text-sm font-medium transition-colors ${
                        hoveredAreaSlug === group.area_slug
                          ? "bg-[#f8f5f0] text-[#1a1a1a]"
                          : "text-[#1a1a1a] hover:bg-[#f8f5f0]"
                      }`}
                      onMouseEnter={() => setHoveredAreaSlug(group.area_slug)}
                    >
                      <span>{group.area_name}</span>
                      <ChevronRight size={14} className="text-gray-400" />
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2 px-5">
                    <Link href="/neighborhoods" className="text-[#c1121f] text-sm font-semibold hover:underline">
                      All Neighborhoods &rarr;
                    </Link>
                  </div>
                </div>
                {/* Right — Neighborhoods for hovered area */}
                <div className="flex-1 py-3 min-w-[300px]">
                  {activeAreaGroup ? (
                    <>
                      <div className="px-5 pb-2 mb-1 border-b border-gray-100">
                        <span className="text-[10px] font-semibold uppercase tracking-eyebrow text-[#c1121f]">
                          {activeAreaGroup.area_name}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2">
                        {activeAreaGroup.neighborhoods.slice(0, MAX_NEIGHBORHOODS).map((n) => (
                          <Link
                            key={n.slug}
                            href={`/neighborhoods/${n.slug}`}
                            className="block px-5 py-2 text-sm text-gray-600 hover:text-[#1a1a1a] hover:bg-[#f8f5f0] transition-colors"
                          >
                            {n.name}
                          </Link>
                        ))}
                      </div>
                      {activeAreaGroup.neighborhoods.length > MAX_NEIGHBORHOODS && (
                        <div className="px-5 pt-2 mt-1 border-t border-gray-100">
                          <Link
                            href={`/neighborhoods?area=${activeAreaGroup.area_slug}`}
                            className="text-[#c1121f] text-sm font-semibold hover:underline"
                          >
                            See All Neighborhoods &rarr;
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-5 py-4 text-sm text-gray-mid">
                      Hover an area to see neighborhoods
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* THE HUB — mega menu */}
          <div className="relative" onMouseEnter={() => handleDropdownEnter("hub")} onMouseLeave={handleDropdownLeave}>
            <NavDropdownTriggerLink href="/hub" active={activeDropdown === "hub"}>The Hub</NavDropdownTriggerLink>
            {activeDropdown === "hub" && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#1a1a1a] shadow-2xl z-50 w-[700px] p-6">
                <div className="grid grid-cols-5 gap-4">
                  {HUB_ITEMS.map((item) => (
                    <Link key={item.slug} href={`/hub/${item.slug}`} className="group block text-center">
                      <div className="relative aspect-[5/3] overflow-hidden mb-2"><Image src={item.image} alt={item.name} fill unoptimized className="object-cover group-hover:scale-110 transition-transform duration-300" /></div>
                      <div className="text-white text-xs font-semibold group-hover:text-gold-light transition-colors">{item.name}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Beyond ATL */}
          <div className="relative" onMouseEnter={() => handleDropdownEnter("beyond")} onMouseLeave={handleDropdownLeave}>
            <NavDropdownTrigger active={activeDropdown === "beyond"}>Beyond ATL</NavDropdownTrigger>
            {activeDropdown === "beyond" && (
              <DropdownPanel>
                <div
                  className="relative"
                  onMouseEnter={() => setBeyondSubmenuOpen(true)}
                  onMouseLeave={() => setBeyondSubmenuOpen(false)}
                >
                  <button className="flex items-center justify-between w-full px-5 py-2.5 text-sm text-gray-dark hover:bg-gray-50 hover:text-black transition-colors">
                    <span>Cities</span>
                    <ChevronRight size={14} className="text-gray-400" />
                  </button>
                  {beyondSubmenuOpen && (
                    <div className="absolute left-full top-0 w-48 bg-white border border-gray-100 shadow-lg py-2 z-50 -ml-px">
                      {BEYOND_ATL_CITIES.map((city) => (
                        <DropdownLink key={city.slug} href={`/beyond-atl/${city.slug}`}>{city.name}</DropdownLink>
                      ))}
                    </div>
                  )}
                </div>
                <DropdownLink href="/beyond-atl/relocation">Relocation</DropdownLink>
              </DropdownPanel>
            )}
          </div>

          <NavLink href="/city-watch">City Watch</NavLink>
          <NavLink href="/media">Media</NavLink>
        </nav>

        <Link href="/submit" className="hidden md:inline-flex items-center px-5 py-2 bg-[#e6c46d] text-black text-xs font-semibold uppercase tracking-eyebrow rounded-full hover:bg-black hover:text-[#fee198] transition-colors">Submit Listing</Link>
      </div>

      {/* ===== CHRONICLE-STYLE DRAWER ===== */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-50 transition-opacity duration-400"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", opacity: drawerVisible ? 1 : 0 }}
            onClick={closeDrawer}
          />
          <div
            className="fixed top-0 left-0 w-[340px] h-full bg-[#1a1a1a] z-50 overflow-y-auto flex flex-col"
            style={{
              transform: drawerVisible ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Top — Logo + Close */}
            <div className="flex items-start justify-between p-8 pb-0">
              <Link href="/" onClick={closeDrawer} className="block">
                <div className="font-logo text-2xl font-bold tracking-wide text-white leading-none">ATL VIBES &amp; VIEWS</div>
                <div className="text-[10px] tracking-[0.15em] text-white/40 mt-2 uppercase">The City. The Culture. The Conversation.</div>
              </Link>
              <button
                onClick={closeDrawer}
                className="p-1 text-white/50 hover:text-white transition-all mt-1"
                style={{
                  transform: closeSpinning ? "rotate(90deg) scale(0.7)" : "rotate(0deg) scale(1)",
                  opacity: closeSpinning ? 0 : 1,
                  transition: "transform 250ms ease-in-out, opacity 250ms ease-in-out",
                }}
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Spacer */}
            <div className="px-8 pt-4 pb-2" />

            {/* ===== MOBILE VERSION — Full nav menu (< lg) ===== */}
            <div className="lg:hidden px-8 flex-1">
              <nav className="space-y-1">
                {/* Submit CTA */}
                <div className="pb-4 mb-2 border-b border-white/10">
                  <Link href="/submit" onClick={closeDrawer} className="block w-full text-center bg-[#fee198] text-[#1a1a1a] text-xs font-semibold uppercase tracking-eyebrow px-5 py-3 hover:bg-[#f5d87a] transition-colors">
                    Submit a Listing
                  </Link>
                </div>

                <MobileNavLink href="/" onClick={closeDrawer}>Home</MobileNavLink>

                {/* Explore ATL — accordion with areas → neighborhoods */}
                <div>
                  <button onClick={() => setMobileAreasOpen(!mobileAreasOpen)} className="flex items-center justify-between w-full py-3 text-white text-[15px] font-semibold hover:text-gold-light transition-colors">
                    <span>Explore ATL</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${mobileAreasOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileAreasOpen && (
                    <div className="pl-4 pb-2 space-y-0.5">
                      {exploreData.map((group) => (
                        <div key={group.area_slug}>
                          {/* Area row — tap to expand neighborhoods */}
                          <button
                            onClick={() =>
                              setMobileExploreAreaSlug(
                                mobileExploreAreaSlug === group.area_slug ? null : group.area_slug
                              )
                            }
                            className="flex items-center justify-between w-full py-2 text-white/70 text-sm font-medium hover:text-gold-light transition-colors"
                          >
                            <span>{group.area_name}</span>
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-200 ${
                                mobileExploreAreaSlug === group.area_slug ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {/* Neighborhoods sub-list */}
                          {mobileExploreAreaSlug === group.area_slug && (
                            <div className="pl-4 pb-1 space-y-0.5">
                              <Link
                                href={`/areas/${group.area_slug}`}
                                onClick={closeDrawer}
                                className="block py-1.5 text-[#c1121f] text-sm font-semibold hover:text-gold-light transition-colors"
                              >
                                View {group.area_name} &rarr;
                              </Link>
                              {group.neighborhoods.slice(0, MAX_NEIGHBORHOODS).map((n) => (
                                <Link
                                  key={n.slug}
                                  href={`/neighborhoods/${n.slug}`}
                                  onClick={closeDrawer}
                                  className="block py-1.5 text-white/50 text-sm hover:text-gold-light transition-colors"
                                >
                                  {n.name}
                                </Link>
                              ))}
                              {group.neighborhoods.length > MAX_NEIGHBORHOODS && (
                                <Link
                                  href={`/neighborhoods?area=${group.area_slug}`}
                                  onClick={closeDrawer}
                                  className="block py-1.5 text-[#c1121f] text-sm font-semibold hover:text-gold-light transition-colors"
                                >
                                  See All Neighborhoods &rarr;
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <Link href="/neighborhoods" onClick={closeDrawer} className="block py-2 text-white text-sm font-semibold hover:text-gold-light transition-colors">
                        Explore All Neighborhoods
                      </Link>
                    </div>
                  )}
                </div>

                {/* The Hub — expandable */}
                <div>
                  <button onClick={() => setMobileHubOpen(!mobileHubOpen)} className="flex items-center justify-between w-full py-3 text-white text-[15px] font-semibold hover:text-gold-light transition-colors">
                    <span>The Hub</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${mobileHubOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileHubOpen && (
                    <div className="pl-4 pb-2 space-y-0.5">
                      {HUB_ITEMS.map((item) => (
                        <Link key={item.slug} href={`/hub/${item.slug}`} onClick={closeDrawer} className="block py-2 text-white/60 text-sm hover:text-gold-light transition-colors">{item.name}</Link>
                      ))}
                      <Link href="/hub" onClick={closeDrawer} className="block py-2 text-red-brand text-sm font-semibold hover:text-gold-light transition-colors">View All</Link>
                    </div>
                  )}
                </div>

                {/* Beyond ATL — expandable with cities sub */}
                <div>
                  <button onClick={() => setMobileBeyondOpen(!mobileBeyondOpen)} className="flex items-center justify-between w-full py-3 text-white text-[15px] font-semibold hover:text-gold-light transition-colors">
                    <span>Beyond ATL</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${mobileBeyondOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileBeyondOpen && (
                    <div className="pl-4 pb-2 space-y-0.5">
                      <button onClick={() => setMobileCitiesOpen(!mobileCitiesOpen)} className="flex items-center justify-between w-full py-2 text-white/60 text-sm hover:text-gold-light transition-colors">
                        <span>Cities</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${mobileCitiesOpen ? "rotate-180" : ""}`} />
                      </button>
                      {mobileCitiesOpen && (
                        <div className="pl-4 pb-1 space-y-0.5">
                          {BEYOND_ATL_CITIES.map((city) => (
                            <Link key={city.slug} href={`/beyond-atl/${city.slug}`} onClick={closeDrawer} className="block py-1.5 text-white/50 text-sm hover:text-gold-light transition-colors">{city.name}</Link>
                          ))}
                        </div>
                      )}
                      <Link href="/beyond-atl/relocation" onClick={closeDrawer} className="block py-2 text-white/60 text-sm hover:text-gold-light transition-colors">Relocation</Link>
                    </div>
                  )}
                </div>

                <MobileNavLink href="/city-watch" onClick={closeDrawer}>City Watch</MobileNavLink>
                <MobileNavLink href="/media" onClick={closeDrawer}>Media</MobileNavLink>
              </nav>
            </div>

            {/* ===== DESKTOP/TABLET VERSION — What's Shaping Atlanta (>= lg) ===== */}
            <div className="hidden lg:block px-8 flex-1">
              <p className="text-[#c1121f] text-[10px] font-semibold uppercase tracking-eyebrow mb-1">Stories</p>
              <h3 className="font-display text-lg font-semibold text-white mb-6">What&rsquo;s Shaping Atlanta</h3>
              <div className="space-y-7">
                {DRAWER_STORIES.map((story) => (
                  <Link key={story.slug} href={`/stories/${story.slug}`} onClick={closeDrawer} className="flex items-center gap-5 group">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-white/10">
                      <Image src={story.image} alt={story.title} fill unoptimized className="object-cover" />
                    </div>
                    <h4 className="text-white text-[15px] font-bold leading-snug group-hover:text-gold-light transition-colors">{story.title}</h4>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom — Social + Copyright */}
            <div className="px-8 pb-10 pt-16 mt-auto">
              <div className="border-t border-white/10 pt-8">
                <div className="flex items-center gap-5 mb-6">
                  {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gold-light transition-colors" aria-label={label}><Icon size={18} /></a>
                  ))}
                </div>
                <p className="text-white/30 text-xs">&copy; {new Date().getFullYear()} ATL Vibes &amp; Views. All Rights Reserved.</p>
                <a href="https://avv-media.com" target="_blank" rel="noopener noreferrer" className="text-[#e6c46d] text-xs hover:text-[#fee198] transition-colors mt-1.5 inline-block">
                  Website by AVV Media
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

/* ============================================================
   HELPER COMPONENTS
   ============================================================ */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="text-[13px] font-semibold uppercase tracking-eyebrow text-black hover:text-red-brand transition-colors py-1">{children}</Link>;
}

function NavDropdownTriggerLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-1 text-[13px] font-semibold uppercase tracking-eyebrow py-1 transition-colors ${active ? "text-red-brand" : "text-black hover:text-red-brand"}`}>
      {children}<ChevronDown size={12} className={`transition-transform duration-200 ${active ? "rotate-180" : ""}`} />
    </Link>
  );
}

function NavDropdownTrigger({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <button className={`flex items-center gap-1 text-[13px] font-semibold uppercase tracking-eyebrow py-1 transition-colors ${active ? "text-red-brand" : "text-black hover:text-red-brand"}`}>
      {children}<ChevronDown size={12} className={`transition-transform duration-200 ${active ? "rotate-180" : ""}`} />
    </button>
  );
}

function DropdownPanel({ children }: { children: React.ReactNode }) {
  return <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white border border-gray-100 shadow-lg py-2 z-50">{children}</div>;
}

function DropdownLink({ href, children, highlight }: { href: string; children: React.ReactNode; highlight?: boolean }) {
  return <Link href={href} className={`block px-5 py-2.5 text-sm transition-colors ${highlight ? "text-red-brand font-semibold hover:bg-gray-50" : "text-gray-dark hover:bg-gray-50 hover:text-black"}`}>{children}</Link>;
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return <Link href={href} onClick={onClick} className="block py-3 text-white text-[15px] font-semibold hover:text-gold-light transition-colors">{children}</Link>;
}
