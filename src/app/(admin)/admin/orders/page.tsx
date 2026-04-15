import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/db/auth";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  await requireAdmin();
  const admin = await createServiceClient();

  const { data: orders } = await admin
    .from("orders")
    .select(
      "id, order_number, status, total_pence, created_at, shipping_address, customer:profiles(email, full_name, partner_name_1, partner_name_2), product:products(name)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  type OrderRow = {
    id: string;
    order_number: string | null;
    status: string;
    total_pence: number;
    created_at: string;
    shipping_address: { name?: string } | null;
    customer: {
      email: string;
      full_name: string | null;
      partner_name_1: string | null;
      partner_name_2: string | null;
    } | null;
    product: { name: string } | null;
  };

  const rows = (orders || []) as unknown as OrderRow[];

  // Group by status for quick scan
  const pending = rows.filter((o) =>
    ["pending", "payment_complete"].includes(o.status)
  );
  const printing = rows.filter((o) =>
    ["printing", "in_production"].includes(o.status)
  );
  const completed = rows.filter((o) =>
    ["completed", "delivered", "shipped"].includes(o.status)
  );

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
            Orders
          </h1>
          <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
            {rows.length === 0
              ? "Orders will appear here once customers complete checkout"
              : `${rows.length} total · ${pending.length} pending · ${printing.length} at print · ${completed.length} completed`}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <Card className="mt-6">
          <div className="text-center py-12">
            <p className="text-sm text-[var(--tc-gray-400)]">No orders yet</p>
          </div>
        </Card>
      ) : (
        <div className="mt-6 space-y-8">
          {pending.length > 0 && (
            <OrderSection
              title="Pending — ready to start"
              subtitle="Orders that have been paid for and are awaiting print"
              orders={pending}
            />
          )}
          {printing.length > 0 && (
            <OrderSection
              title="At Print"
              subtitle="Currently in production"
              orders={printing}
            />
          )}
          {completed.length > 0 && (
            <OrderSection
              title="Completed"
              subtitle="Dispatched or delivered"
              orders={completed}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface OrderRowData {
  id: string;
  order_number: string | null;
  status: string;
  total_pence: number;
  created_at: string;
  shipping_address: { name?: string } | null;
  customer: {
    email: string;
    full_name: string | null;
    partner_name_1: string | null;
    partner_name_2: string | null;
  } | null;
  product: { name: string } | null;
}

function OrderSection({
  title,
  subtitle,
  orders,
}: {
  title: string;
  subtitle: string;
  orders: OrderRowData[];
}) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-[var(--tc-black)]">
          {title}{" "}
          <span className="font-normal text-[var(--tc-gray-400)]">
            ({orders.length})
          </span>
        </h2>
        <p className="text-xs text-[var(--tc-gray-400)] mt-0.5">{subtitle}</p>
      </div>
      <Card padding="none">
        <div className="divide-y divide-[var(--tc-gray-100)]">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block p-4 hover:bg-[var(--tc-gray-50)] transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--tc-black)]">
                      {order.order_number || order.id.slice(0, 8)}
                    </span>
                    <Badge variant={statusVariant(order.status)}>
                      {formatStatus(order.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--tc-gray-600)] mt-1 truncate">
                    {customerName(order)} · {order.product?.name || "—"}
                  </p>
                  <p className="text-xs text-[var(--tc-gray-400)] mt-0.5">
                    {new Date(order.created_at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--tc-black)]">
                    {formatPrice(order.total_pence)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

function customerName(order: OrderRowData): string {
  if (order.shipping_address?.name) return order.shipping_address.name;
  if (order.customer?.partner_name_1 && order.customer?.partner_name_2) {
    return `${order.customer.partner_name_1} & ${order.customer.partner_name_2}`;
  }
  return order.customer?.full_name || order.customer?.email || "Guest";
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
