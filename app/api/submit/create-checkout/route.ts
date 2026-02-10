import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  // body contains:
  // {
  //   submission_type: 'business' | 'event',
  //   tier: 'standard' | 'premium',          // never 'free' — free doesn't hit Stripe
  //   billing_cycle: 'monthly' | 'annual',    // business only
  //   submitter_email: string,
  //   submitter_name: string,
  //   form_data: { ... all form fields },
  //   submission_id: string                    // UUID of the submissions row (created before checkout)
  // }

  // TODO (Developer):
  // 1. Create or retrieve Stripe Customer by email
  // 2. Create Stripe Checkout Session with:
  //    - mode: 'subscription'
  //    - price: lookup from tier + billing_cycle
  //    - success_url: `${origin}/submit/success?session_id={CHECKOUT_SESSION_ID}`
  //    - cancel_url: `${origin}/submit/canceled`
  //    - metadata: { submission_id, submission_type, tier }
  // 3. Return { url: session.url }

  const { submission_type, tier, billing_cycle, submitter_email, submission_id } =
    body as {
      submission_type: string;
      tier: string;
      billing_cycle: string;
      submitter_email: string;
      submission_id: string;
    };

  console.log("Create checkout session:", {
    submission_type,
    tier,
    billing_cycle,
    submitter_email,
    submission_id,
  });

  // Stub response — developer replaces with Stripe Checkout Session URL
  return NextResponse.json({
    url: null,
    message:
      "Stripe integration pending. Replace this stub with actual Stripe Checkout Session creation.",
  });
}
