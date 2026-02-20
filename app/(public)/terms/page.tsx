import Link from "next/link";
import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/ui/LegalPageLayout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for using ATL Vibes & Views, Atlanta's local media platform.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Terms & Conditions",
    description: "Terms and conditions for using ATL Vibes & Views, Atlanta's local media platform.",
  },
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" lastUpdated="February 10, 2026">
      <h2>1. Introduction</h2>
      <p>
        These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your use of
        atlvibesandviews.com (the &ldquo;Site&rdquo;), operated by AVV Media dba
        ATL Vibes &amp; Views. By accessing or using the Site, you agree to be
        bound by these Terms. If you do not agree with any part of these Terms,
        please do not use the Site.
      </p>

      <h2>2. Use of the Site</h2>
      <p>
        The Site provides information about Atlanta neighborhoods, businesses,
        events, and local culture. All content is for informational purposes
        only. You agree not to use the Site for any unlawful purpose or in any
        way that could damage, disable, or impair the Site. You may not attempt
        to gain unauthorized access to any part of the Site, its servers, or any
        connected systems.
      </p>

      <h2>3. User-Submitted Content</h2>
      <p>
        Users may submit business listings, events, reviews, and other content
        to the Site. You retain ownership of any content you submit. By
        submitting content, you grant AVV Media a non-exclusive, royalty-free,
        worldwide license to use, display, reproduce, and distribute your
        content on the platform and in related marketing materials.
      </p>
      <p>
        AVV Media reserves the right to review, edit, or remove any
        user-submitted content at its sole discretion, including content that
        violates these Terms or is deemed inappropriate.
      </p>

      <h2>4. Business Listings</h2>
      <p>
        Business information displayed on the Site is provided for informational
        purposes. AVV Media does not guarantee the accuracy of business hours,
        prices, menus, or availability. Business owners may claim and update
        their listings through our submission process. Featured and sponsored
        listings are clearly identified as such.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        All original content, design, graphics, logos, and branding on the Site
        are owned by AVV Media and protected by applicable intellectual property
        laws. You may not reproduce, distribute, modify, or create derivative
        works from any content on the Site without prior written permission from
        AVV Media. Atlanta neighborhood data, maps, guides, and curated content
        are proprietary.
      </p>

      <h2>6. Third-Party Links</h2>
      <p>
        The Site may contain links to external websites and services not operated
        by AVV Media. We are not responsible for the content, privacy practices,
        or availability of any third-party sites. Inclusion of a link does not
        imply endorsement.
      </p>

      <h2>7. Newsletter &amp; Communications</h2>
      <p>
        By subscribing to our newsletters, you consent to receive email
        communications from ATL Vibes &amp; Views. You can unsubscribe at any
        time via the unsubscribe link included in every email. Newsletter content
        may include sponsored mentions and advertisements, which will be clearly
        identified.
      </p>

      <h2>8. Sponsored Content</h2>
      <p>
        Some articles, stories, and listings on the Site may include sponsored
        content or paid placements. Sponsored content is always clearly
        identified with appropriate labels. Sponsorship does not influence our
        editorial judgment or the integrity of our coverage.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        The Site and its content are provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo; without warranties of any kind, either express or
        implied. AVV Media shall not be liable for any direct, indirect,
        incidental, consequential, or special damages arising from your use of
        the Site. AVV Media is not responsible for any decisions made based on
        information found on the Site.
      </p>

      <h2>10. Changes to Terms</h2>
      <p>
        AVV Media may update these Terms at any time. The &ldquo;Last
        updated&rdquo; date at the top of this page will reflect any changes.
        Your continued use of the Site after modifications constitutes
        acceptance of the updated Terms. Users will be notified of significant
        changes via email or a notice on the Site.
      </p>

      <h2>11. Contact</h2>
      <p>
        If you have questions about these Terms, please contact us at{" "}
        <a href="mailto:hello@atlvibesandviews.com">
          hello@atlvibesandviews.com
        </a>
        .
      </p>
      <p>
        See also our{" "}
        <Link href="/privacy">Privacy Policy</Link>,{" "}
        <Link href="/cookies">Cookie Policy</Link>, and{" "}
        <Link href="/disclaimer">Disclaimer</Link>.
      </p>
    </LegalPageLayout>
  );
}
