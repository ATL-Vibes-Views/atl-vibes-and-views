// lib/email.ts — Email notification helpers via Make.com webhook

const WEBHOOK_URL = process.env.MAKE_EMAIL_WEBHOOK_URL;

interface WebhookPayload {
  type: "confirmation" | "admin_alert";
  to_email: string;
  submitter_name: string;
  submission_type: string;
}

/**
 * Fire a payload to the Make.com email webhook.
 * Resolves silently on failure so the calling submission flow is never blocked.
 */
async function postToWebhook(payload: WebhookPayload): Promise<void> {
  if (!WEBHOOK_URL) {
    console.warn(
      "MAKE_EMAIL_WEBHOOK_URL is not configured — skipping email notification"
    );
    return;
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `Email webhook responded with ${response.status}: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Email webhook request failed:", error);
  }
}

/**
 * Send a confirmation email to the person who submitted the form.
 *
 * Failures are logged but never thrown — the submission should succeed
 * regardless of whether the email is delivered.
 */
export async function sendSubmissionConfirmation(
  email: string,
  name: string,
  submissionType: string
): Promise<void> {
  await postToWebhook({
    type: "confirmation",
    to_email: email,
    submitter_name: name,
    submission_type: submissionType,
  });
}

/**
 * Send an alert email to the site admins when a new submission arrives.
 *
 * Failures are logged but never thrown — the submission should succeed
 * regardless of whether the notification is delivered.
 */
export async function sendAdminNotification(
  submissionType: string,
  submitterName: string,
  submitterEmail: string
): Promise<void> {
  await postToWebhook({
    type: "admin_alert",
    to_email: submitterEmail, // Make.com scenario handles routing to admin inbox
    submitter_name: submitterName,
    submission_type: submissionType,
  });
}
