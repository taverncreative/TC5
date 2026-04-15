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
  // Quantity 0 represents a single personalised sample (instead of a full run)
  const [quantity, setQuantity] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSample = quantity === 0;
  const pricePence = INVITATION_PRICING[quantity] || 0;
  const totalPence = pricePence;

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
          isSample,
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
      {/* Sample or Full Run */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-1">
          Quantity
        </h3>
        <p className="text-xs text-[var(--tc-gray-500)] mb-3">
          Order a single personalised sample first, or commit to your full print run.
        </p>

        <button
          type="button"
          onClick={() => setQuantity(0)}
          className={`w-full text-left rounded-lg border p-4 transition-colors ${
            isSample
              ? "border-[var(--tc-black)] bg-[var(--tc-gray-50)]"
              : "border-[var(--tc-gray-200)] hover:border-[var(--tc-sage)] hover:bg-[var(--tc-gray-50)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--tc-black)]">
                Personalised sample
              </p>
              <p className="text-xs text-[var(--tc-gray-500)] mt-0.5">
                1 printed card so you can see and feel the real thing before committing
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-sm font-semibold text-[var(--tc-black)]">
                {formatPrice(INVITATION_PRICING[0] || 500)}
              </p>
            </div>
          </div>
        </button>

        <div className="mt-3">
          <p className="text-xs font-medium text-[var(--tc-gray-500)] uppercase tracking-wide mb-2">
            Or order your full print run
          </p>
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

      {/* Order Summary */}
      <Card className="bg-[var(--tc-gray-50)]">
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-3">
          Order Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-[var(--tc-gray-600)]">
            <span>
              {isSample ? "1 × personalised sample" : `${quantity} × invitations`}
            </span>
            <span>{formatPrice(pricePence)}</span>
          </div>
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
