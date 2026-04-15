"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus, type OrderStatus } from "../actions";

interface StatusControlsProps {
  orderId: string;
  currentStatus: string;
}

const OPTIONS: { value: OrderStatus; label: string; helper: string }[] = [
  {
    value: "pending",
    label: "Pending",
    helper: "Paid — waiting to start",
  },
  {
    value: "printing",
    label: "At Print",
    helper: "Currently in production",
  },
  {
    value: "completed",
    label: "Completed",
    helper: "Dispatched to customer (sends email)",
  },
  { value: "cancelled", label: "Cancelled", helper: "Cancel this order" },
];

// Map legacy statuses to our simplified set
function normalise(status: string): OrderStatus {
  if (status === "payment_complete") return "pending";
  if (status === "in_production") return "printing";
  if (status === "shipped" || status === "delivered") return "completed";
  return status as OrderStatus;
}

export function OrderStatusControls({
  orderId,
  currentStatus,
}: StatusControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const active = normalise(currentStatus);

  function handleChange(next: OrderStatus) {
    if (next === active) return;
    if (next === "cancelled") {
      if (!window.confirm("Cancel this order? This cannot be undone.")) return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error || "Failed to update status");
      }
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {OPTIONS.map((option) => {
          const isActive = option.value === active;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange(option.value)}
              disabled={isPending || isActive}
              className={`text-left rounded-lg border p-3 transition-colors ${
                isActive
                  ? "border-[var(--tc-black)] bg-[var(--tc-gray-50)] cursor-default"
                  : "border-[var(--tc-gray-200)] hover:border-[var(--tc-sage)] hover:bg-[var(--tc-gray-50)] cursor-pointer"
              } disabled:opacity-60`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActive
                      ? "bg-[var(--tc-sage)]"
                      : "bg-[var(--tc-gray-300)]"
                  }`}
                />
                <span className="text-sm font-medium text-[var(--tc-black)]">
                  {option.label}
                </span>
              </div>
              <p className="text-xs text-[var(--tc-gray-500)] mt-1">
                {option.helper}
              </p>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
