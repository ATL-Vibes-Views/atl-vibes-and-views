import { Metadata } from "next";
import { PortalTopbar } from "@/components/portal/PortalTopbar";

export const metadata: Metadata = {
  title: "Import / Export | Admin CMS | ATL Vibes & Views",
  description: "Bulk import and export data.",
  robots: { index: false, follow: false },
};

export default function ImportExportPage() {
  return (
    <>
      <PortalTopbar title="Import / Export" />
      <div className="p-8 max-[899px]:pt-16">
        <div className="bg-white border border-[#e5e5e5] p-12 text-center">
          <h2 className="font-display text-[20px] font-bold text-[#1a1a1a] mb-2">Import / Export</h2>
          <p className="text-[13px] text-[#6b7280] max-w-md mx-auto">
            Bulk import businesses, events, and content. Export data for reporting. This page is under development.
          </p>
        </div>
      </div>
    </>
  );
}
