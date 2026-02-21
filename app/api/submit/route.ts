import { createServiceRoleClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { withCors } from "@/lib/cors";
import { sendSubmissionConfirmation, sendAdminNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submission_type, submitter_name, submitter_email, data, tier } = body as {
      submission_type: string;
      submitter_name: string;
      submitter_email: string;
      data: Record<string, unknown>;
      tier?: string;
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

    const supabase = createServiceRoleClient();

    const { data: submission, error } = await supabase
      .from("submissions" as never)
      .insert({
        submission_type,
        submitter_name: submitter_name.trim(),
        submitter_email: submitter_email.trim().toLowerCase(),
        data,
        status: "pending",
        tier: tier || "free",
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

    // Fire-and-forget: send email notifications without blocking the response
    await Promise.all([
      sendSubmissionConfirmation(
        submitter_email.trim().toLowerCase(),
        submitter_name.trim(),
        submission_type
      ),
      sendAdminNotification(
        submission_type,
        submitter_name.trim(),
        submitter_email.trim().toLowerCase()
      ),
    ]);

    return withCors(NextResponse.json(submission, { status: 201 }), request);
  } catch (err) {
    console.error("Submit API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  return withCors(new NextResponse(null, { status: 204 }), request);
}
