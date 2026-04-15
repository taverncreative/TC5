import { requireProfile } from "@/lib/db/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Orders" };

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    printing: "At Print",
    completed: "Completed",
    cancelled: "Cancelled",
    payment_complete: "Pending",
    in_production: "At Print",
    shipped: "Dispatched",
    delivered: "Delivered",
  };
  return map[status] || status;
}

function statusVariant(status: string): "default" | "sage" | "blush" | "blue" | "success" | "warning" {
  if (["printing", "in_production"].includes(status)) return "blue";
  if (["completed", "delivered", "shipped"].includes(status)) return "success";
  if (status === "cancelled") return "warning";
  return "default";
}

export default async function OrdersPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
          Orders
        </h1>
        <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
          Your order history and tracking
        </p>
      </div>

      {(!orders || orders.length === 0) ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-sm text-[var(--tc-gray-500)]">
              No orders yet. Once you order prints, they&apos;ll appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-[var(--tc-black)]">
                      {order.order_number || `Order ${order.id.slice(0, 8)}`}
                    </p>
                    <Badge variant={statusVariant(order.status)}>
                      {formatStatus(order.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--tc-gray-400)] mt-1">
                    Placed {new Date(order.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--tc-black)]">
                  {formatPrice(order.total_pence)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
