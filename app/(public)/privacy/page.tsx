import Link from "next/link";
import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/ui/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ATL Vibes & Views collects, uses, and protects your personal information.",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="February 10, 2026">
      <h2>1. Introduction</h2>
      <p>
        AVV Media dba ATL Vibes &amp; Views (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
        &ldquo;our&rdquo;) respects your privacy. This Privacy Policy explains
        what information we collect when you use atlvibesandviews.com (the
        &ldquo;Site&rdquo;), how we use it, and your rights regarding that
        information.
      </p>

      <h2>2. Information We Collect</h2>
      <h3>Information You Provide</h3>
      <ul>
        <li>Name and email address when subscribing to newsletters</li>
        <li>Business information when submitting listings</li>
        <li>Event details when submitting events</li>
        <li>Reviews, ratings, and comments</li>
        <li>Contact form submissions</li>
        <li>Account information if you create an account</li>
      </ul>

      <h3>Information Collected Automatically</h3>
      <ul>
        <li>
          Pages visited, time on page, and click patterns (via HubSpot
          analytics)
        </li>
        <li>Device type, browser, and operating system</li>
        <li>IP address and approximate geographic location</li>
        <li>Referring website</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>Deliver newsletter content you subscribed to</li>
        <li>Process business listing and event submissions</li>
        <li>Improve site content and user experience</li>
        <li>Analyze site traffic and content performance</li>
        <li>Send relevant communications about Atlanta content</li>
        <li>
          Match sponsored content to relevant topics (no personal data is shared
          with sponsors)
        </li>
      </ul>

      <h2>4. HubSpot Tracking</h2>
      <p>
        We use HubSpot for email marketing, contact management, and website
        analytics. HubSpot may set cookies on your device to track email opens,
        link clicks, and site visits. This data helps us understand what content
        resonates with our audience and improve our offerings. For more
        information, see{" "}
        <a
          href="https://legal.hubspot.com/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
        >
          HubSpot&rsquo;s Privacy Policy
        </a>
        .
      </p>

      <h2>5. Cookies</h2>
      <p>
        See our <Link href="/cookies">Cookie Policy</Link> for full details on
        the cookies we use. In summary, we use essential cookies for site
        functionality and analytics cookies via HubSpot to understand site
        usage. You can manage cookie preferences in your browser settings.
      </p>

      <h2>6. Data Sharing</h2>
      <p>
        We do not sell your personal information. We share data only with the
        following service providers who help us operate the Site:
      </p>
      <ul>
        <li>
          <strong>HubSpot</strong> &mdash; email marketing and analytics
          platform
        </li>
        <li>
          <strong>Vercel</strong> &mdash; website hosting
        </li>
        <li>
          <strong>Supabase</strong> &mdash; database hosting
        </li>
        <li>
          <strong>Mapbox</strong> &mdash; map functionality (no personal data
          shared)
        </li>
      </ul>
      <p>
        Sponsor reports contain only aggregate, anonymized data&mdash;never
        individual user information.
      </p>

      <h2>7. Data Retention</h2>
      <ul>
        <li>
          <strong>Newsletter subscriber data:</strong> retained until you
          unsubscribe
        </li>
        <li>
          <strong>Business listing data:</strong> retained while the listing is
          active
        </li>
        <li>
          <strong>Analytics data:</strong> retained per HubSpot&rsquo;s data
          retention policies
        </li>
        <li>
          <strong>Account data:</strong> retained until account deletion is
          requested
        </li>
      </ul>

      <h2>8. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>
          <strong>Access:</strong> request a copy of the personal data we hold
          about you
        </li>
        <li>
          <strong>Correction:</strong> request updates to inaccurate or
          incomplete data
        </li>
        <li>
          <strong>Deletion:</strong> request removal of your personal data
        </li>
        <li>
          <strong>Unsubscribe:</strong> opt out of email communications at any
          time
        </li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{" "}
        <a href="mailto:hello@atlvibesandviews.com">
          hello@atlvibesandviews.com
        </a>
        .
      </p>

      <h2>9. Children&rsquo;s Privacy</h2>
      <p>
        The Site is not directed at children under the age of 13. We do not
        knowingly collect personal information from children under 13. If you
        believe we have inadvertently collected such information, please contact
        us so we can promptly delete it.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically to reflect changes in our
        practices or applicable laws. The &ldquo;Last updated&rdquo; date at the
        top of this page will reflect any changes. Significant changes will be
        communicated via email to active subscribers.
      </p>

      <h2>11. Contact</h2>
      <p>
        If you have privacy-related questions or concerns, please contact us
        at{" "}
        <a href="mailto:hello@atlvibesandviews.com">
          hello@atlvibesandviews.com
        </a>
        .
      </p>
      <p>
        See also our{" "}
        <Link href="/terms">Terms &amp; Conditions</Link>,{" "}
        <Link href="/cookies">Cookie Policy</Link>, and{" "}
        <Link href="/disclaimer">Disclaimer</Link>.
      </p>
    </LegalPageLayout>
  );
}
