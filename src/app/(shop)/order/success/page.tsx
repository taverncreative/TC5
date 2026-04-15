import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createServiceClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Order Confirmed" };

interface OrderSuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  // Try to load the order — may not exist yet if the webhook hasn't fired
  // (Stripe webhooks can take a few seconds). We'll show a graceful state.
  type OrderSummary = {
    id: string;
    order_number: string | null;
    total_pence: number;
    status: string;
    created_at: string;
    shipping_address: {
      name?: string;
      line1?: string;
      line2?: string;
      city?: string;
      postal_code?: string;
    } | null;
    product: { name: string } | null;
  };

  let order: OrderSummary | null = null;

  if (sessionId) {
    const admin = await createServiceClient();
    const { data } = await admin
      .from("orders")
      .select(
        "id, order_number, total_pence, status, created_at, shipping_address, product:products(name)"
      )
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();
    if (data) {
      order = data as unknown as OrderSummary;
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card padding="lg" className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--tc-sage-light)]/40">
          <svg
            className="h-8 w-8 text-[var(--tc-sage)]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mt-4 font-heading text-2xl font-semibold text-[var(--tc-black)]">
          Order Confirmed
        </h1>

        {order ? (
          <>
            <p className="mt-3 text-sm text-[var(--tc-gray-500)] leading-relaxed">
              Thank you{order.shipping_address?.name ? `, ${order.shipping_address.name.split(" ")[0]}` : ""} — your order is confirmed.
              We&apos;ll email you when production starts and again when it
              ships.
            </p>

            <div className="mt-6 rounded-lg border border-[var(--tc-gray-200)] bg-[var(--tc-gray-50)] p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--tc-gray-500)]">Order number</span>
                <span className="font-medium text-[var(--tc-black)]">
                  {order.order_number || order.id.slice(0, 8)}
                </span>
              </div>
              {order.product?.name && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--tc-gray-500)]">Product</span>
                  <span className="font-medium text-[var(--tc-black)]">
                    {order.product.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[var(--tc-gray-500)]">Total</span>
                <span className="font-medium text-[var(--tc-black)]">
                  {formatPrice(order.total_pence)}
                </span>
              </div>
              {order.shipping_address?.line1 && (
                <div className="pt-2 mt-2 border-t border-[var(--tc-gray-200)] text-xs text-[var(--tc-gray-500)]">
                  <p className="font-medium text-[var(--tc-gray-700)] mb-1">
                    Shipping to
                  </p>
                  <p>{order.shipping_address.name}</p>
                  <p>{order.shipping_address.line1}</p>
                  {order.shipping_address.line2 && (
                    <p>{order.shipping_address.line2}</p>
                  )}
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.postal_code}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-[var(--tc-gray-500)] leading-relaxed">
            Thank you for your order! Your confirmation is being processed —
            it should appear in your dashboard shortly. You&apos;ll also
            receive a confirmation email.
          </p>
        )}

        <div className="mt-8 space-y-3">
          <Link href="/dashboard/orders">
            <Button className="w-full">View My Orders</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
