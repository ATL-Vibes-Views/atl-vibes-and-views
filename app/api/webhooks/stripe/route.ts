import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/**
 * Required env vars:
 *   STRIPE_SECRET_KEY        — Stripe API secret key
 *   STRIPE_WEBHOOK_SECRET    — Webhook signing secret (whsec_...)
 *   NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (for server-side writes)
 */

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    console.error("Stripe webhook: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });

  /* ── Verify webhook signature ── */
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  /* ── Supabase client (service role for writes) ── */
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Stripe webhook: missing Supabase env vars");
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  /* ── Handle events ── */
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { submission_id, submission_type, tier } = session.metadata || {};

      if (!submission_id) {
        console.warn("checkout.session.completed: no submission_id in metadata");
        break;
      }

      // Update submission status to approved
      await supabase
        .from("submissions")
        .update({
          status: "approved",
          tier: tier || "free",
          stripe_session_id: session.id,
          stripe_customer_id: session.customer as string,
        })
        .eq("id", submission_id);

      console.log(`Checkout completed: submission=${submission_id}, type=${submission_type}, tier=${tier}`);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Downgrade any businesses linked to this customer
      await supabase
        .from("business_listings")
        .update({ tier: "Free", map_pin_style: "gray" })
        .eq("stripe_customer_id", customerId);

      console.log(`Subscription deleted for customer=${customerId}`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Mark subscription as past_due (grace period)
      await supabase
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("stripe_customer_id", customerId)
        .eq("status", "active");

      console.log(`Payment failed for customer=${customerId}`);
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
