export const dynamic = "force-dynamic";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submission Successful | ATL Vibes & Views",
  description:
    "Your submission to ATL Vibes & Views has been received. Thank you for contributing to Atlanta's local community.",
  openGraph: {
    title: "Submission Successful | ATL Vibes & Views",
    description:
      "Your submission to ATL Vibes & Views has been received. Thank you for contributing to Atlanta's local community.",
  },
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
