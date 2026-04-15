"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/db/auth";
import { sendEmail, orderShippedEmail } from "@/lib/email/send";

export type OrderStatus =
  | "pending"
  | "printing"
  | "completed"
  | "cancelled"
  | "payment_complete"
  | "in_production"
  | "shipped"
  | "delivered";

const ALLOWED_STATUSES: OrderStatus[] = [
  "pending",
  "printing",
  "completed",
  "cancelled",
];

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ ok: boolean; error?: string }> {
  if (!ALLOWED_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status" };
  }

  // Verify caller is an admin (redirects if not)
  await requireAdmin();

  const admin = await createServiceClient();

  const { data: current, error: readErr } = await admin
    .from("orders")
    .select("id, order_number, status, shipping_address, stripe_checkout_session_id")
    .eq("id", orderId)
    .maybeSingle();

  if (readErr || !current) {
    return { ok: false, error: readErr?.message || "Order not found" };
  }

  const { error } = await admin
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { ok: false, error: error.message };

  // Log the event
  await admin.from("order_events").insert({
    order_id: orderId,
    event_type: "status_changed",
    metadata: { from: current.status, to: status },
  });

  // Send customer email when moving to "completed" (dispatched)
  if (status === "completed" && process.env.RESEND_API_KEY) {
    try {
      const { data: order } = await admin
        .from("orders")
        .select("id, order_number, customer:profiles(email)")
        .eq("id", orderId)
        .maybeSingle();

      type OrderWithEmail = {
        order_number: string | null;
        customer: { email: string } | null;
      };
      const orderRow = order as unknown as OrderWithEmail;
      const customerEmail = orderRow?.customer?.email;

      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: `Your order has shipped — ${orderRow.order_number}`,
          html: orderShippedEmail(orderRow.order_number || orderId),
        });
      }
    } catch (emailErr) {
      console.error("Dispatched email failed (non-fatal):", emailErr);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
  return { ok: true };
}
