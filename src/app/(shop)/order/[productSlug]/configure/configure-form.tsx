"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { PRINT_QUANTITIES, INVITATION_PRICING } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ConfigureFormProps {
  productSlug: string;
  designId: string | null;
  productName: string;
  thumbnailUrl: string | null;
}

export function ConfigureForm({
  productSlug,
  designId,
  productName,
  thumbnailUrl,
}: ConfigureFormProps) {
  const searchParams = useSearchParams();
  const defaultToSample = searchParams.get("sample") === "1";

  // Quantity 0 represents a single personalised sample (instead of a full run)
  const [quantity, setQuantity] = useState<number>(defaultToSample ? 0 : 50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Respect updates to ?sample=1 after mount
  useEffect(() => {
    if (defaultToSample && quantity !== 0) setQuantity(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultToSample]);

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
    <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
      {/* Left column — configure */}
      <div className="space-y-6">
        {/* Quantity */}
        <Card elevated padding="lg">
          <h3 className="font-heading text-lg font-semibold text-[var(--tc-black)]">
            Choose your order
          </h3>
          <p className="text-sm text-[var(--tc-gray-500)] mt-1">
            Order a personalised sample first, or commit to your full print run.
          </p>

          <button
            type="button"
            onClick={() => setQuantity(0)}
            className={`mt-5 w-full text-left rounded-lg border p-5 transition-all duration-200 ${
              isSample
                ? "border-[var(--tc-black)] bg-[var(--tc-blush-light)]/30 shadow-[var(--tc-shadow-sm)]"
                : "border-[var(--tc-gray-200)] hover:border-[var(--tc-black)]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <SampleRadio active={isSample} />
                <div>
                  <p className="text-sm font-semibold text-[var(--tc-black)]">
                    Personalised sample
                  </p>
                  <p className="text-xs text-[var(--tc-gray-500)] mt-1 leading-relaxed">
                    1 printed card so you can see and feel the real thing before
                    committing.
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-[var(--tc-black)] whitespace-nowrap font-heading">
                {formatPrice(INVITATION_PRICING[0] || 500)}
              </p>
            </div>
          </button>

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-[var(--tc-gray-200)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tc-gray-400)]">
                Or full print run
              </span>
              <div className="h-px flex-1 bg-[var(--tc-gray-200)]" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {PRINT_QUANTITIES.map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setQuantity(qty)}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                    qty === quantity
                      ? "bg-[var(--tc-black)] text-white shadow-[var(--tc-shadow-sm)]"
                      : "border border-[var(--tc-gray-200)] text-[var(--tc-gray-600)] hover:border-[var(--tc-black)] hover:text-[var(--tc-black)]"
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>
            {!isSample && (
              <p className="text-xs text-[var(--tc-gray-500)] mt-3">
                {quantity} cards · {formatPrice(pricePence)} · works out at{" "}
                <span className="text-[var(--tc-gray-700)] font-medium">
                  {formatPrice(Math.round(pricePence / quantity))}
                </span>{" "}
                each
              </p>
            )}
          </div>
        </Card>

        {/* Card Stock */}
        <Card elevated padding="lg">
          <h3 className="font-heading text-lg font-semibold text-[var(--tc-black)]">
            Card stock
          </h3>
          <div className="mt-4 flex items-start gap-4 rounded-lg border border-[var(--tc-gray-200)] bg-[var(--tc-blush-light)]/20 p-4">
            <div className="w-12 h-12 rounded-md bg-white border border-[var(--tc-gray-300)] flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[var(--tc-black)]">
                300gsm Fedrigoni Old Mill Bianco
              </p>
              <p className="text-xs text-[var(--tc-gray-500)] mt-1 leading-relaxed">
                Lightly textured, off-white card. FSC certified and responsibly
                sourced.
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--tc-gray-500)]">
            Envelopes included with every order (133 × 184mm).
          </p>
        </Card>

        {/* Trust row */}
        <div className="grid grid-cols-3 gap-4 px-2">
          <TrustItem icon={<IconShield />} label="Secure checkout" sub="Powered by Stripe" />
          <TrustItem icon={<IconTruck />} label="UK dispatch" sub="Within 1 working day" />
          <TrustItem icon={<IconLeaf />} label="FSC paper" sub="Responsibly sourced" />
        </div>
      </div>

      {/* Right column — sticky summary */}
      <aside className="lg:sticky lg:top-24">
        <Card
          padding="lg"
          className="bg-white shadow-[var(--tc-shadow-lg)] ring-1 ring-[var(--tc-gold)]/30"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-[var(--tc-gray-100)]">
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <Image
                src={thumbnailUrl}
                alt=""
                width={80}
                height={108}
                className="w-16 h-20 object-cover rounded-md bg-[var(--tc-gray-100)]"
              />
            ) : (
              <div className="w-16 h-20 bg-[var(--tc-gray-100)] rounded-md" />
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tc-gray-500)]">
                Your design
              </p>
              <p className="text-sm font-medium text-[var(--tc-black)] truncate">
                {productName}
              </p>
              <p className="text-xs text-[var(--tc-sage)] mt-0.5">
                ✓ Proof approved
              </p>
            </div>
          </div>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--tc-gray-500)]">
            Order summary
          </h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-[var(--tc-gray-700)]">
              <span>
                {isSample
                  ? "1 × personalised sample"
                  : `${quantity} × invitations`}
              </span>
              <span className="font-medium">{formatPrice(pricePence)}</span>
            </div>
            <div className="flex justify-between text-[var(--tc-gray-600)]">
              <span>Envelopes</span>
              <span className="text-[var(--tc-sage)]">Included</span>
            </div>
            <div className="flex justify-between text-[var(--tc-gray-600)]">
              <span>Delivery</span>
              <span>At checkout</span>
            </div>
          </div>
          <div className="border-t border-[var(--tc-gray-200)] pt-3 mt-4 flex justify-between items-baseline">
            <span className="font-semibold text-[var(--tc-black)]">
              Subtotal
            </span>
            <span className="font-heading text-xl font-semibold text-[var(--tc-black)]">
              {formatPrice(totalPence)}
            </span>
          </div>

          {!designId && (
            <div className="mt-5 rounded-md bg-[var(--tc-blush-light)]/40 border border-[var(--tc-blush)] p-3">
              <p className="text-xs font-medium text-[var(--tc-black)]">
                No approved design
              </p>
              <p className="text-xs text-[var(--tc-gray-500)] mt-1">
                You&apos;ll need to approve a design before ordering.
              </p>
              <Link
                href="/dashboard/designs"
                className="mt-2 inline-block text-xs font-medium text-[var(--tc-black)] hover:underline"
              >
                Go to My Designs →
              </Link>
            </div>
          )}

          {error && (
            <div className="mt-5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <Button
            onClick={handleCheckout}
            loading={loading}
            disabled={!designId}
            className="w-full mt-5"
            size="lg"
          >
            {designId ? "Proceed to payment" : "Approve a design to continue"}
          </Button>

          <p className="mt-4 text-[11px] text-center text-[var(--tc-gray-400)] leading-relaxed">
            Shipping address and payment collected securely at checkout. All
            major cards and Apple Pay accepted.
          </p>
        </Card>
      </aside>
    </div>
  );
}

function SampleRadio({ active }: { active: boolean }) {
  return (
    <span
      className={`w-4 h-4 rounded-full flex-shrink-0 border-2 flex items-center justify-center mt-0.5 ${
        active ? "border-[var(--tc-black)]" : "border-[var(--tc-gray-300)]"
      }`}
    >
      {active && (
        <span className="w-2 h-2 rounded-full bg-[var(--tc-black)]" />
      )}
    </span>
  );
}

function TrustItem({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="text-center">
      <div className="text-[var(--tc-sage)] flex justify-center">{icon}</div>
      <p className="mt-2 text-xs font-medium text-[var(--tc-black)]">{label}</p>
      <p className="text-[11px] text-[var(--tc-gray-400)]">{sub}</p>
    </div>
  );
}

function IconShield() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="7" width="13" height="10" rx="1" />
      <path d="M14 10h5l3 3v4h-8" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function IconLeaf() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4c0 8-6 14-14 14 0-8 6-14 14-14z" />
      <path d="M6 18c2-3 5-6 9-9" />
    </svg>
  );
}
