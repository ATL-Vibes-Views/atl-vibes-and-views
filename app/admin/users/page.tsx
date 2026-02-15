import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { UsersClient } from "./UsersClient";

export const metadata: Metadata = {
  title: "Users | Admin CMS | ATL Vibes & Views",
  description: "Manage platform users.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  phone: string | null;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
}

export default async function UsersPage() {
  const supabase = createServerClient();

  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, display_name, avatar_url, role, phone, is_active, email_verified, last_login_at, created_at")
    .order("created_at", { ascending: false })
    .returns<UserRow[]>();

  if (error) {
    console.error("Failed to fetch users:", error);
  }
  if (!users || users.length === 0) {
    console.warn("[admin/users] Query returned empty. error:", error, "data:", users);
  }

  return <UsersClient users={users ?? []} />;
}
