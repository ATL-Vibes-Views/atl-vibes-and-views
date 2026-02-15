import { Metadata } from "next";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings | Admin CMS | ATL Vibes & Views",
  description: "Site configuration and integrations.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return <SettingsClient />;
}
