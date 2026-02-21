import { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase";
import { SubmissionsClient } from "./SubmissionsClient";

export const metadata: Metadata = {
  title: "Submissions | Admin CMS | ATL Vibes & Views",
  description: "Review user submissions for businesses and events.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const supabase = createServiceRoleClient();

  const { data: submissions, error } = (await supabase
    .from("submissions")
    .select("id, submission_type, submitter_name, submitter_email, status, reviewer_notes, rejection_reason, created_at, updated_at, data")
    .order("created_at", { ascending: false })
  ) as {
    data: {
      id: string;
      submission_type: "business" | "event";
      submitter_name: string;
      submitter_email: string;
      status: "pending" | "under_review" | "approved" | "rejected" | "needs_info";
      reviewer_notes: string | null;
      rejection_reason: string | null;
      created_at: string;
      updated_at: string;
      data?: Record<string, unknown> | null;
    }[] | null;
    error: unknown;
  };
  if (error) console.error("Failed to fetch submissions:", error);

  return <SubmissionsClient submissions={submissions ?? []} />;
}
