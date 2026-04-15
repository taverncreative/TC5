import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient, createClient } from "@/lib/supabase/server";

interface CheckoutBody {
  productSlug: string;
  quantity: number;
  paperStock: string;
  totalPence: number;
  includeSample?: boolean;
  savedDesignId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const {
      productSlug,
      quantity,
      paperStock,
      totalPence,
      includeSample,
      savedDesignId,
    } = body;

    if (
      !productSlug ||
      !quantity ||
      !paperStock ||
      !totalPence ||
      !savedDesignId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the design exists, is for this product, and is approved
    const admin = await createServiceClient();
    const { data: design } = await admin
      .from("saved_designs")
      .select("id, status, product:products(slug, name)")
      .eq("id", savedDesignId)
      .maybeSingle();

    if (!design) {
      return NextResponse.json(
        { error: "Design not found" },
        { status: 404 }
      );
    }

    type DesignRow = {
      id: string;
      status: string;
      product: { slug: string; name: string } | null;
    };
    const designRow = design as unknown as DesignRow;

    if (designRow.product?.slug !== productSlug) {
      return NextResponse.json(
        { error: "Design does not belong to this product" },
        { status: 400 }
      );
    }
    if (designRow.status !== "approved") {
      return NextResponse.json(
        { error: "Design must be approved before ordering" },
        { status: 400 }
      );
    }

    // Attempt to associate the session with a signed-in customer for Stripe
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const customerEmail = user?.email;

    // Check if Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({
        url: null,
        message:
          "Stripe is not configured — set STRIPE_SECRET_KEY in .env.local",
      });
    }

    const { getStripe } = await import("@/lib/stripe/client");
    const stripe = getStripe();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const productName = designRow.product?.name || productSlug;
    const descriptionParts = [
      `${quantity} × invitations`,
      `Paper: ${paperStock}`,
    ];
    if (includeSample) descriptionParts.push("Includes personalised sample");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "gbp",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: totalPence,
            product_data: {
              name: `${productName} — ${quantity} copies`,
              description: descriptionParts.join(" · "),
            },
          },
          quantity: 1,
        },
      ],
      // Let Stripe collect the shipping address — covers UK by default
      shipping_address_collection: {
        allowed_countries: ["GB"],
      },
      phone_number_collection: {
        enabled: true,
      },
      // Fixed-rate UK shipping; free over a threshold could be added later
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "Royal Mail Tracked 48",
            type: "fixed_amount",
            fixed_amount: { amount: 500, currency: "gbp" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 2 },
              maximum: { unit: "business_day", value: 4 },
            },
          },
        },
        {
          shipping_rate_data: {
            display_name: "Royal Mail Tracked 24",
            type: "fixed_amount",
            fixed_amount: { amount: 750, currency: "gbp" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 2 },
            },
          },
        },
      ],
      metadata: {
        productSlug,
        quantity: String(quantity),
        paperStock,
        savedDesignId,
        includeSample: includeSample ? "true" : "false",
      },
      success_url: `${siteUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/order/${productSlug}/configure?design=${savedDesignId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
