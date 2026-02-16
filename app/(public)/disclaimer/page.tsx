import Link from "next/link";
import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/ui/LegalPageLayout";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Important disclaimers about content on ATL Vibes & Views, including business listings, events, and editorial content.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Disclaimer",
    description: "Important disclaimers about content on ATL Vibes & Views, including business listings, events, and editorial content.",
  },
};

export default function DisclaimerPage() {
  return (
    <LegalPageLayout title="Disclaimer" lastUpdated="February 10, 2026">
      <h2>1. General Disclaimer</h2>
      <p>
        Content on atlvibesandviews.com (the &ldquo;Site&rdquo;) is provided by
        AVV Media dba ATL Vibes &amp; Views for informational and entertainment
        purposes only. While we make reasonable efforts to provide accurate and
        up-to-date information, we do not guarantee the completeness, accuracy,
        or reliability of any content on the Site.
      </p>

      <h2>2. Business Information</h2>
      <p>
        Business hours, prices, menus, and availability displayed on the Site
        may change without notice. Always verify details directly with
        businesses before visiting. Ratings and reviews reflect individual
        opinions and experiences and should not be taken as objective
        assessments. AVV Media does not endorse any specific business unless
        explicitly stated.
      </p>

      <h2>3. Event Information</h2>
      <p>
        Event dates, times, locations, and ticket prices displayed on the Site
        are subject to change. Always verify event details with the organizer
        before attending. AVV Media is not responsible for event cancellations,
        postponements, or changes to event details.
      </p>

      <h2>4. Real Estate &amp; Neighborhood Information</h2>
      <p>
        Neighborhood descriptions, boundaries, and related data are provided for
        general informational purposes only and are not intended as real estate
        advice. Always consult qualified real estate professionals for property
        and relocation decisions. Neighborhood boundaries shown on the Site are
        approximate and may differ from official municipal designations.
      </p>

      <h2>5. Editorial &amp; Sponsored Content</h2>
      <p>
        Our editorial team produces original content based on research, local
        knowledge, and firsthand experience. Sponsored content and paid
        placements are clearly identified with appropriate labels. Sponsorship
        does not guarantee positive coverage or favorable reviews.
        &ldquo;Featured&rdquo; listings may be paid placements or editorial
        selections&mdash;context within the listing will indicate which.
      </p>

      <h2>6. External Links</h2>
      <p>
        The Site may contain links to third-party websites provided for your
        convenience. AVV Media does not control and is not responsible for the
        content, accuracy, or practices of external websites. Inclusion of a
        link does not imply endorsement or affiliation.
      </p>

      <h2>7. Professional Advice</h2>
      <p>
        Nothing on this Site constitutes legal, financial, medical, or other
        professional advice. Content is for general informational purposes only.
        Always consult qualified professionals for matters requiring specialized
        expertise.
      </p>

      <h2>8. Contact</h2>
      <p>
        If you have questions or concerns about any content on the Site, please
        contact us at{" "}
        <a href="mailto:hello@atlvibesandviews.com">
          hello@atlvibesandviews.com
        </a>
        .
      </p>
      <p>
        See also our{" "}
        <Link href="/terms">Terms &amp; Conditions</Link>,{" "}
        <Link href="/privacy">Privacy Policy</Link>, and{" "}
        <Link href="/cookies">Cookie Policy</Link>.
      </p>
    </LegalPageLayout>
  );
}
