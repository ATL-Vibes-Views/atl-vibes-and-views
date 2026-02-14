import { PartnerHeader } from "@/components/partner/PartnerHeader";
import { PartnerFooter } from "@/components/partner/PartnerFooter";
import { MediaKitProvider } from "@/components/partner/MediaKitModal";

/* ============================================================
   Partner Microsite Layout
   Wraps all /partner/* routes with custom header/footer.
   The global Header/Footer are hidden via CSS :has() selector
   defined in globals.css.
   ============================================================ */

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MediaKitProvider>
      <div data-partner-layout className="flex flex-col min-h-screen">
        <PartnerHeader />
        <div className="flex-1">{children}</div>
        <PartnerFooter />
      </div>
    </MediaKitProvider>
  );
}
