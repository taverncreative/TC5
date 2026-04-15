"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { PRINT_QUANTITIES, INVITATION_PRICING } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ConfigureFormProps {
  productSlug: string;
  designId: string | null;
}

export function ConfigureForm({ productSlug, designId }: ConfigureFormProps) {
  const [quantity, setQuantity] = useState<number>(50);
  const [includeSample, setIncludeSample] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pricePence = INVITATION_PRICING[quantity] || 0;
  const samplePricePence = includeSample ? INVITATION_PRICING[0] || 500 : 0;
  const totalPence = pricePence + samplePricePence;

  async function handleCheckout() {
    if (!designId) {
      setError("Please open your design in the editor and approve it first");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          quantity,
          paperStock: "fedrigoni-old-mill-300gsm",
          totalPence,
          includeSample,
          savedDesignId: designId,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || data.message || "Checkout is not available");
        setLoading(false);
      }
    } catch {
      setError("Checkout failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Quantity */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-3">
          Quantity
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {PRINT_QUANTITIES.map((qty) => (
            <button
              key={qty}
              type="button"
              onClick={() => setQuantity(qty)}
              className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                qty === quantity
                  ? "bg-[var(--tc-black)] text-white"
                  : "border border-[var(--tc-gray-300)] text-[var(--tc-gray-600)] hover:bg-[var(--tc-gray-50)]"
              }`}
            >
              {qty}
            </button>
          ))}
        </div>
      </Card>

      {/* Card Stock */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-3">
          Card Stock
        </h3>
        <div className="border border-[var(--tc-sage)] bg-[var(--tc-sage-light)]/20 rounded-lg p-3">
          <p className="text-sm font-medium text-[var(--tc-black)]">
            300gsm Fedrigoni Old Mill Bianco
          </p>
          <p className="text-xs text-[var(--tc-gray-500)] mt-0.5">
            Lightly textured, off white card. FSC certified.
          </p>
        </div>
        <p className="mt-3 text-xs text-[var(--tc-gray-500)]">
          Envelopes included with every order (133 x 184mm).
        </p>
      </Card>

      {/* Personalised Sample */}
      <Card>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeSample}
            onChange={(e) => setIncludeSample(e.target.checked)}
            className="mt-0.5 rounded"
          />
          <div>
            <p className="text-sm font-medium text-[var(--tc-black)]">
              Add Personalised Sample (+{formatPrice(500)})
            </p>
            <p className="text-xs text-[var(--tc-gray-500)] mt-0.5">
              Receive a single printed sample before committing to your full order.
            </p>
          </div>
        </label>
      </Card>

      {/* Order Summary */}
      <Card className="bg-[var(--tc-gray-50)]">
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-3">
          Order Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-[var(--tc-gray-600)]">
            <span>{quantity} x invitations</span>
            <span>{formatPrice(pricePence)}</span>
          </div>
          {includeSample && (
            <div className="flex justify-between text-[var(--tc-gray-600)]">
              <span>Personalised sample</span>
              <span>{formatPrice(samplePricePence)}</span>
            </div>
          )}
          <div className="flex justify-between text-[var(--tc-gray-600)]">
            <span>Envelopes</span>
            <span className="text-[var(--tc-sage)]">Included</span>
          </div>
          <div className="flex justify-between text-[var(--tc-gray-600)]">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="border-t border-[var(--tc-gray-200)] pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-[var(--tc-black)]">Subtotal</span>
            <span className="font-semibold text-[var(--tc-black)]">
              {formatPrice(totalPence)}
            </span>
          </div>
        </div>
      </Card>

      {!designId && (
        <Card className="bg-[var(--tc-blush-light)]/20 border-[var(--tc-blush)]">
          <p className="text-sm font-medium text-[var(--tc-black)]">
            No approved design selected
          </p>
          <p className="text-xs text-[var(--tc-gray-500)] mt-1">
            You&apos;ll need to approve a design before ordering.
          </p>
          <Link
            href="/dashboard/designs"
            className="mt-2 inline-block text-xs font-medium text-[var(--tc-black)] hover:underline"
          >
            Go to My Designs &rarr;
          </Link>
        </Card>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      <Button
        onClick={handleCheckout}
        loading={loading}
        disabled={!designId}
        className="w-full"
        size="lg"
      >
        {designId ? "Proceed to Payment" : "Approve a design to continue"}
      </Button>

      <div className="text-xs text-center text-[var(--tc-gray-400)] space-y-1">
        <p>Shipping address and payment collected securely at checkout.</p>
        <p>Dispatched within 1 working day of order confirmation.</p>
      </div>
    </div>
  );
}
