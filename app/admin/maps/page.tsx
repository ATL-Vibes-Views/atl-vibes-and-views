import { Metadata } from "next";
import { PortalTopbar } from "@/components/portal/PortalTopbar";

export const metadata: Metadata = {
  title: "Maps | Admin CMS | ATL Vibes & Views",
  description: "Map configuration and featured pins.",
  robots: { index: false, follow: false },
};

export default function MapsPage() {
  return (
    <>
      <PortalTopbar title="Maps" />
      <div className="p-8 max-[899px]:pt-16">
        <div className="bg-white border border-[#e5e5e5] p-12 text-center">
          <h2 className="font-display text-[20px] font-bold text-[#1a1a1a] mb-2">Maps</h2>
          <p className="text-[13px] text-[#6b7280] max-w-md mx-auto">
            Map configuration, featured pins, and neighborhood boundaries will be available here. This page is under development.
          </p>
        </div>
      </div>
    </>
  );
}
