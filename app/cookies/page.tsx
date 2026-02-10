import Link from "next/link";
import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/ui/LegalPageLayout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How ATL Vibes & Views uses cookies and similar tracking technologies.",
  robots: { index: true, follow: true },
};

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="February 10, 2026">
      <h2>1. What Are Cookies</h2>
      <p>
        Cookies are small text files stored on your device when you visit a
        website. They help the site remember your preferences and understand how
        you interact with the content. This Cookie Policy explains what cookies
        ATL Vibes &amp; Views uses and how you can manage them.
      </p>

      <h2>2. Cookies We Use</h2>

      <h3>Essential Cookies</h3>
      <p>
        These cookies are necessary for the Site to function properly. They
        handle session management and security tokens. Essential cookies cannot
        be disabled&mdash;they are required for core site functionality.
      </p>

      <h3>Analytics Cookies (HubSpot)</h3>
      <p>
        We use HubSpot analytics to understand how visitors use our Site. The
        following cookies may be set:
      </p>
      <ul>
        <li>
          <strong>__hstc</strong> &mdash; tracks visitor identity across
          sessions
        </li>
        <li>
          <strong>hubspotutk</strong> &mdash; tracks visitor identity for
          HubSpot forms
        </li>
        <li>
          <strong>__hssc</strong> &mdash; tracks session count and page views
          within a session
        </li>
        <li>
          <strong>__hssrc</strong> &mdash; determines if the visitor has
          restarted their browser
        </li>
      </ul>
      <p>
        These cookies help us understand which content and neighborhoods are
        most popular with our audience. Data is aggregated&mdash;we analyze
        trends and patterns, not individual behavior.
      </p>

      <h3>Email Tracking</h3>
      <p>
        HubSpot tracks newsletter email opens and link clicks. This helps us
        understand which content our subscribers find most valuable. You can
        disable image loading in your email client to prevent open tracking.
      </p>

      <h2>3. Managing Cookies</h2>
      <p>
        Most web browsers allow you to control cookies through their settings.
        You can delete existing cookies and configure your browser to block
        future cookies. Note that blocking cookies may affect some site
        functionality.
      </p>
      <p>Browser-specific cookie settings:</p>
      <ul>
        <li>
          <strong>Chrome:</strong> Settings &rarr; Privacy and Security &rarr;
          Cookies and other site data
        </li>
        <li>
          <strong>Safari:</strong> Preferences &rarr; Privacy
        </li>
        <li>
          <strong>Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr;
          Cookies and Site Data
        </li>
        <li>
          <strong>Edge:</strong> Settings &rarr; Cookies and site permissions
        </li>
      </ul>

      <h2>4. Third-Party Cookies</h2>
      <p>
        HubSpot may set cookies as described above for analytics and email
        tracking purposes. Mapbox may set cookies related to map functionality.
        We do not allow advertising networks to set cookies on our Site.
      </p>

      <h2>5. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy as our tracking tools or practices
        change. Please check this page periodically for updates. The &ldquo;Last
        updated&rdquo; date at the top will reflect any changes.
      </p>

      <h2>6. Contact</h2>
      <p>
        If you have questions about our use of cookies, please contact us at{" "}
        <a href="mailto:hello@atlvibesandviews.com">
          hello@atlvibesandviews.com
        </a>
        .
      </p>
      <p>
        See also our{" "}
        <Link href="/privacy">Privacy Policy</Link>,{" "}
        <Link href="/terms">Terms &amp; Conditions</Link>, and{" "}
        <Link href="/disclaimer">Disclaimer</Link>.
      </p>
    </LegalPageLayout>
  );
}
