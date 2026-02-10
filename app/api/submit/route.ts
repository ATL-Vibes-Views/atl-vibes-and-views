import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submission_type, submitter_name, submitter_email, data } = body as {
      submission_type: string;
      submitter_name: string;
      submitter_email: string;
      data: Record<string, unknown>;
    };

    /* Basic validation */
    if (!submission_type || !submitter_name || !submitter_email || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["business", "event"].includes(submission_type)) {
      return NextResponse.json(
        { error: "Invalid submission type" },
        { status: 400 }
      );
    }

    if (!submitter_email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: submission, error } = await supabase
      .from("submissions" as never)
      .insert({
        submission_type,
        submitter_name: submitter_name.trim(),
        submitter_email: submitter_email.trim().toLowerCase(),
        data,
        status: "pending",
        updated_at: new Date().toISOString(),
      } as never)
      .select()
      .single();

    if (error) {
      console.error("Submission insert error:", error);
      return NextResponse.json(
        { error: "Failed to create submission" },
        { status: 500 }
      );
    }

    // TODO (Developer): Send confirmation email to submitter
    // TODO (Developer): Send admin alert email

    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    console.error("Submit API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
