import { Metadata } from "next";
import { getMockBusinessOwner } from "@/lib/mock-auth";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings | Dashboard | ATL Vibes & Views",
  description: "Manage your account settings and notification preferences.",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const owner = getMockBusinessOwner();

  return (
    <SettingsClient
      user={{
        name: owner.name,
        email: owner.email,
        phone: null,
        avatar_url: owner.avatar_url ?? null,
        bio: null,
      }}
    />
  );
}
