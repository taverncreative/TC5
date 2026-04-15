import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/db/auth";
import { formatPrice } from "@/lib/utils";
import { OrderStatusControls } from "./status-controls";

interface AdminOrderPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  await requireAdmin();
  const { orderId } = await params;
  const admin = await createServiceClient();

  const { data } = await admin
    .from("orders")
    .select(
      "id, order_number, status, total_pence, created_at, shipping_address, print_config, stripe_payment_intent_id, stripe_checkout_session_id, customer:profiles(email, full_name, partner_name_1, partner_name_2, phone, wedding_date), product:products(name, slug)"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!data) notFound();

  type OrderDetail = {
    id: string;
    order_number: string | null;
    status: string;
    total_pence: number;
    created_at: string;
    shipping_address: {
      name?: string;
      phone?: string | null;
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    } | null;
    print_config: {
      productSlug?: string;
      quantity?: number;
      paperStock?: string;
      includeSample?: boolean;
      design?: { name?: string; id?: string };
    } | null;
    stripe_payment_intent_id: string | null;
    stripe_checkout_session_id: string | null;
    customer: {
      email: string;
      full_name: string | null;
      partner_name_1: string | null;
      partner_name_2: string | null;
      phone: string | null;
      wedding_date: string | null;
    } | null;
    product: { name: string; slug: string } | null;
  };
  const order = data as unknown as OrderDetail;

  // Load order events
  const { data: eventsRaw } = await admin
    .from("order_events")
    .select("id, event_type, metadata, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  const events = eventsRaw || [];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs text-[var(--tc-gray-500)] hover:text-[var(--tc-black)]"
          >
            &larr; All orders
          </Link>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-[var(--tc-black)]">
            {order.order_number || order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
            {order.product?.name || "—"} ·{" "}
            {new Date(order.created_at).toLocaleString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Badge variant={statusVariant(order.status)}>
          {formatStatus(order.status)}
        </Badge>
      </div>

      {/* Status controls */}
      <Card>
        <h2 className="text-sm font-semibold text-[var(--tc-black)] mb-3">
          Update Status
        </h2>
        <OrderStatusControls orderId={order.id} currentStatus={order.status} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer */}
        <Card>
          <h2 className="text-sm font-semibold text-[var(--tc-black)] mb-3">
            Customer
          </h2>
          <dl className="space-y-2 text-sm">
            {order.customer?.partner_name_1 && order.customer?.partner_name_2 && (
              <div>
                <dt className="text-xs text-[var(--tc-gray-400)] uppercase tracking-wide">
                  Couple
                </dt>
                <dd className="text-[var(--tc-black)]">
                  {order.customer.partner_name_1} &amp;{" "}
                  {order.customer.partner_name_2}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-[var(--tc-gray-400)] uppercase tracking-wide">
                Email
              </dt>
              <dd className="text-[var(--tc-black)]">
                {order.customer?.email}
              </dd>
            </div>
            {(order.shipping_address?.phone || order.customer?.phone) && (
              <div>
                <dt className="text-xs text-[var(--tc-gray-400)] uppercase tracking-wide">
                  Phone
                </dt>
                <dd className="text-[var(--tc-black)]">
                  {order.shipping_address?.phone || order.customer?.phone}
                </dd>
              </div>
            )}
            {order.customer?.wedding_date && (
              <div>
                <dt className="text-xs text-[var(--tc-gray-400)] uppercase tracking-wide">
                  Wedding Date
                </dt>
                <dd className="text-[var(--tc-black)]">
                  {new Date(order.customer.wedding_date).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Shipping Address */}
        <Card>
          <h2 className="text-sm font-semibold text-[var(--tc-black)] mb-3">
            Shipping Address
          </h2>
          {order.shipping_address ? (
            <address className="text-sm not-italic text-[var(--tc-black)] space-y-0.5">
              <p>{order.shipping_address.name}</p>
              <p>{order.shipping_address.line1}</p>
              {order.shipping_address.line2 && (
                <p>{order.shipping_address.line2}</p>
              )}
              <p>
                {order.shipping_address.city}
                {order.shipping_address.state
                  ? `, ${order.shipping_address.state}`
                  : ""}
              </p>
              <p>{order.shipping_address.postal_code}</p>
              <p>{order.shipping_address.country}</p>
            </address>
          ) : (
            <p className="text-xs text-[var(--tc-gray-400)]">
              No shipping address captured
            </p>
          )}
        </Card>
      </div>

      {/* Print Spec */}
      <Card>
        <h2 className="text-sm font-semibold text-[var(--tc-black)] mb-3">
          Print Specification
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs text-[var(--tc-gray-400)] uppercase tracking-wide">
              Quantity
            </dt>
            <dd className="text-[var(--tc-black)] font-medium">
              {order.print_config?.quantity ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--tc-gray-400)] uppercase tracking-wide">
              Paper Stock
            </dt>
            <dd className="text-[var(--tc-black)]">
              {order.print_config?.paperStock || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--tc-gray-400)] uppercase tracking-wide">
              Sample
            </dt>
            <dd className="text-[var(--tc-black)]">
              {order.print_config?.includeSample ? "Yes" : "No"}
            </dd>
          </div>
        </dl>
        {order.print_config?.design?.id && order.product?.slug && (
          <div className="mt-4 pt-4 border-t border-[var(--tc-gray-100)]">
            <Link
              href={`/editor/${order.product.slug}?design=${order.print_config.design.id}`}
              className="text-xs font-medium text-[var(--tc-sage)] hover:underline"
              target="_blank"
            >
              Open design in editor &rarr;
            </Link>
          </div>
        )}
      </Card>

      {/* Payment */}
      <Card>
        <h2 className="text-sm font-semibold text-[var(--tc-black)] mb-3">
          Payment
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-[var(--tc-gray-400)] uppercase tracking-wide">
              Total
            </dt>
            <dd className="text-[var(--tc-black)] font-medium">
              {formatPrice(order.total_pence)}
            </dd>
          </div>
          {order.stripe_payment_intent_id && (
            <div>
              <dt className="text-xs text-[var(--tc-gray-400)] uppercase tracking-wide">
                Stripe Payment
              </dt>
              <dd className="text-[var(--tc-black)] font-mono text-xs">
                {order.stripe_payment_intent_id}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Timeline */}
      {events.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-[var(--tc-black)] mb-3">
            Timeline
          </h2>
          <ul className="space-y-3">
            {events.map((event) => {
              const meta = event.metadata as Record<string, unknown> | null;
              return (
                <li key={event.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[var(--tc-sage)] mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[var(--tc-black)]">
                      {formatEventType(event.event_type, meta)}
                    </p>
                    <p className="text-xs text-[var(--tc-gray-400)] mt-0.5">
                      {new Date(event.created_at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

function formatEventType(
  type: string,
  meta: Record<string, unknown> | null
): string {
  if (type === "order_placed") return "Order placed";
  if (type === "status_changed") {
    const from = formatStatus(String(meta?.from ?? ""));
    const to = formatStatus(String(meta?.to ?? ""));
    return `Status changed: ${from} → ${to}`;
  }
  return type;
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    payment_complete: "Pending",
    printing: "At Print",
    in_production: "At Print",
    completed: "Completed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] || status;
}

function statusVariant(
  status: string
): "default" | "sage" | "blush" | "blue" | "success" | "warning" {
  if (["printing", "in_production"].includes(status)) return "blue";
  if (["completed", "delivered", "shipped"].includes(status)) return "success";
  if (status === "cancelled") return "warning";
  return "default";
}
