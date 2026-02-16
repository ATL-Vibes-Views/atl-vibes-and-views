import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Price lookup: maps (submission_type, tier, billing_cycle) → Stripe Price ID.
 *
 * Directory listings (subscriptions):
 *   STRIPE_PRICE_BUSINESS_STANDARD_MONTHLY  → Standard Directory
 *   STRIPE_PRICE_BUSINESS_STANDARD_ANNUAL   → Standard Directory (annual)
 *   STRIPE_PRICE_BUSINESS_PREMIUM_MONTHLY   → Premium Directory
 *   STRIPE_PRICE_BUSINESS_PREMIUM_ANNUAL    → Premium Directory (annual)
 *
 * Event listings:
 *   STRIPE_PRICE_EVENT_PREMIUM              → Promoted event listing
 *
 * Sponsor / advertising packages:
 *   STRIPE_PRICE_SPONSOR_ATL_EXPERIENCE     → The ATL Experience
 *   STRIPE_PRICE_SPONSOR_MONTHLY_PUSH       → The Monthly Push
 *   STRIPE_PRICE_SPONSOR_FEATURE            → The Feature
 *   STRIPE_PRICE_SPONSOR_MEDIA_BUY_300      → Media Buy 300
 *   STRIPE_PRICE_SPONSOR_MEDIA_BUY_400      → Media Buy 400
 *   STRIPE_PRICE_SPONSOR_MEDIA_BUY_500      → Media Buy 500
 */
function lookupPriceId(
  submissionType: string,
  tier: string,
  billingCycle?: string
): string | null {
  if (submissionType === "business") {
    const key = `STRIPE_PRICE_BUSINESS_${tier.toUpperCase()}_${(billingCycle || "monthly").toUpperCase()}`;
    return process.env[key] || null;
  }
  if (submissionType === "event") {
    const key = `STRIPE_PRICE_EVENT_${tier.toUpperCase()}`;
    return process.env[key] || null;
  }
  if (submissionType === "sponsor") {
    // tier values: atl-experience, monthly-push, feature, media-buy-300, etc.
    const key = `STRIPE_PRICE_SPONSOR_${tier.toUpperCase().replace(/-/g, "_")}`;
    return process.env[key] || null;
  }
  return null;
}

export async function POST(request: Request) {
  /* ── Validate env ── */
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment." },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });

  /* ── Parse body ── */
  const body = await request.json();
  const {
    submission_type,
    tier,
    billing_cycle,
    submitter_email,
    submitter_name,
    submission_id,
  } = body as {
    submission_type: string;
    tier: string;
    billing_cycle?: string;
    submitter_email: string;
    submitter_name?: string;
    submission_id: string;
  };

  /* ── Look up price ── */
  const priceId = lookupPriceId(submission_type, tier, billing_cycle);
  if (!priceId) {
    return NextResponse.json(
      { error: `No Stripe price configured for ${submission_type}/${tier}/${billing_cycle || "one-time"}` },
      { status: 400 }
    );
  }

  /* ── Create or retrieve Stripe customer ── */
  const existingCustomers = await stripe.customers.list({
    email: submitter_email,
    limit: 1,
  });

  const customer =
    existingCustomers.data.length > 0
      ? existingCustomers.data[0]
      : await stripe.customers.create({
          email: submitter_email,
          name: submitter_name || undefined,
          metadata: { submission_id },
        });

  /* ── Determine mode ── */
  const isSubscription = submission_type === "business";
  const origin = request.headers.get("origin") || "https://atlvibesandviews.com";

  /* ── Create Checkout Session ── */
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: isSubscription ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/submit/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/submit/canceled`,
    metadata: {
      submission_id,
      submission_type,
      tier,
    },
  });

  return NextResponse.json({ url: session.url });
}
