import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories, getNeighborhoodsGrouped, getAmenities, getIdentityOptions, getCities } from "@/lib/queries";
import { SubmitClient } from "@/components/submit/SubmitClient";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Submit a Listing | ATL Vibes & Views",
  description:
    "List your Atlanta business or promote your event on ATL Vibes & Views. Free and paid options available.",
  openGraph: {
    title: "Submit a Listing | ATL Vibes & Views",
    description:
      "List your Atlanta business or promote your event on ATL Vibes & Views.",
    url: "https://atlvibesandviews.com/submit",
  },
};

async function SubmitPageContent() {
  const [categories, neighborhoods, amenities, identityOptions, cities] =
    await Promise.all([
      getCategories(),
      getNeighborhoodsGrouped(),
      getAmenities(),
      getIdentityOptions(),
      getCities(),
    ]);

  return (
    <>
      <div className="site-container px-6 pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Submit" },
          ]}
        />
      </div>
      <Suspense
        fallback={
          <div className="bg-white min-h-[60vh] flex items-center justify-center">
            Loading…
          </div>
        }
      >
        <SubmitClient
          categories={categories}
          neighborhoods={neighborhoods}
          amenities={amenities}
          identityOptions={identityOptions}
          cities={cities}
        />
      </Suspense>
    </>
  );
}

export default function SubmitPage() {
  return <SubmitPageContent />;
}
