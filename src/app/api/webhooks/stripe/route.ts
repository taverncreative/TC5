import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail, orderConfirmationEmail } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    const { getStripe } = await import("@/lib/stripe/client");
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    } else {
      console.log(`Unhandled Stripe event: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    // Return 500 so Stripe retries
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const admin = await createServiceClient();

  const metadata = session.metadata || {};
  const savedDesignId = metadata.savedDesignId;
  const productSlug = metadata.productSlug;
  const quantity = parseInt(metadata.quantity || "0", 10);
  const paperStock = metadata.paperStock;
  const includeSample = metadata.includeSample === "true";

  if (!savedDesignId || !productSlug || !quantity) {
    console.error("Missing required metadata on checkout.session.completed", {
      sessionId: session.id,
      metadata,
    });
    return;
  }

  // Idempotency: if an order with this session_id already exists, do nothing
  const { data: existingOrder } = await admin
    .from("orders")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  if (existingOrder) {
    console.log(`Order already exists for session ${session.id}, skipping`);
    return;
  }

  // Load the saved_design to capture print_config and customer_id
  const { data: design } = await admin
    .from("saved_designs")
    .select("*")
    .eq("id", savedDesignId)
    .maybeSingle();

  if (!design) {
    console.error(`Saved design ${savedDesignId} not found`);
    return;
  }

  type DesignRow = {
    id: string;
    customer_id: string;
    product_id: string;
    name: string;
    sections_data: unknown;
    selected_palette: string;
    selected_fonts: string;
    accent_color: string | null;
    name_layout: string | null;
    accent_connector: boolean | null;
    accent_single_line: boolean | null;
    reverse_enabled: boolean | null;
    reverse_blocks: unknown;
  };
  const designRow = design as unknown as DesignRow;

  // Build print_config — a frozen snapshot of the design state for production
  const printConfig = {
    productSlug,
    quantity,
    paperStock,
    includeSample,
    design: {
      id: designRow.id,
      name: designRow.name,
      sections_data: designRow.sections_data,
      selected_palette: designRow.selected_palette,
      selected_fonts: designRow.selected_fonts,
      accent_color: designRow.accent_color,
      name_layout: designRow.name_layout,
      accent_connector: designRow.accent_connector,
      accent_single_line: designRow.accent_single_line,
      reverse_enabled: designRow.reverse_enabled,
      reverse_blocks: designRow.reverse_blocks,
    },
  };

  // Shipping details from Stripe (lives under collected_information in recent API)
  const shippingDetails = session.collected_information?.shipping_details;
  const shippingAddress = shippingDetails
    ? {
        name: shippingDetails.name,
        phone: session.customer_details?.phone || null,
        line1: shippingDetails.address?.line1,
        line2: shippingDetails.address?.line2,
        city: shippingDetails.address?.city,
        state: shippingDetails.address?.state,
        postal_code: shippingDetails.address?.postal_code,
        country: shippingDetails.address?.country,
      }
    : null;

  // Create the order
  const { data: newOrder, error: orderError } = await admin
    .from("orders")
    .insert({
      customer_id: designRow.customer_id,
      product_id: designRow.product_id,
      saved_design_id: designRow.id,
      customization_id: null,
      status: "pending",
      print_config: printConfig,
      total_pence: session.amount_total ?? 0,
      shipping_address: shippingAddress,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      include_reverse: designRow.reverse_enabled ?? false,
    })
    .select("id, order_number")
    .single();

  if (orderError || !newOrder) {
    console.error("Failed to create order:", orderError);
    throw new Error(orderError?.message || "Failed to create order");
  }

  // Lock the design
  const { error: lockError } = await admin
    .from("saved_designs")
    .update({ status: "locked" })
    .eq("id", savedDesignId);

  if (lockError) {
    console.error("Failed to lock design:", lockError);
    // Don't throw — order is created, the design lock is a soft-fail
  }

  // Log the order event
  await admin.from("order_events").insert({
    order_id: newOrder.id,
    event_type: "order_placed",
    metadata: {
      stripe_session_id: session.id,
      amount_pence: session.amount_total,
    },
  });

  // Send confirmation email (best-effort — don't fail the webhook on email error)
  try {
    const recipientEmail =
      session.customer_details?.email || session.customer_email;
    if (recipientEmail && process.env.RESEND_API_KEY) {
      const { data: productRow } = await admin
        .from("products")
        .select("name")
        .eq("id", designRow.product_id)
        .maybeSingle();
      const productName = (productRow?.name as string) || productSlug;

      await sendEmail({
        to: recipientEmail,
        subject: `Order confirmed — ${newOrder.order_number}`,
        html: orderConfirmationEmail({
          orderNumber: newOrder.order_number || newOrder.id,
          productName,
          quantity,
          totalPence: session.amount_total ?? 0,
        }),
      });
    }
  } catch (emailError) {
    console.error("Email send failed (non-fatal):", emailError);
  }

  console.log(
    `Order ${newOrder.order_number} created for session ${session.id}`
  );
}
