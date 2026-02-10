import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // TODO (Developer):
  // 1. Verify Stripe webhook signature using STRIPE_WEBHOOK_SECRET
  //    const sig = request.headers.get('stripe-signature');
  //    const body = await request.text();
  //    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  //
  // 2. Handle 'checkout.session.completed' event:
  //    a. Extract metadata (submission_id, submission_type, tier)
  //    b. Create record in business_listings or events table from submissions.data JSONB
  //    c. Create subscription record in subscriptions table
  //    d. Update submissions row: status = 'approved', created_record_id = new record id
  //    e. Send confirmation email to submitter
  //
  // 3. Handle 'customer.subscription.deleted' event:
  //    a. Downgrade business tier to 'Free' or deactivate event
  //    b. Update map_pin_style to 'gray'
  //
  // 4. Handle 'invoice.payment_failed' event:
  //    a. Update subscription status to 'past_due'
  //    b. Start grace period

  console.log("Stripe webhook received — stub handler");

  return NextResponse.json({ received: true });
}
