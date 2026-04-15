import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types/database";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const categoryLabel =
    product.template?.category === "save-the-date"
      ? "Save the Date"
      : product.template?.category === "on-the-day"
        ? "On the Day"
        : product.template?.category === "thank-you"
          ? "Thank You"
          : "Invitation";

  const thumbnailUrl = product.template?.thumbnail_url;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white shadow-[var(--tc-shadow-sm)] group-hover:shadow-[var(--tc-shadow-md)] transition-all duration-300 ease-out motion-safe:group-hover:-translate-y-1">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={product.name}
            width={600}
            height={800}
            className="w-full h-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-[var(--tc-gray-50)]">
            <div className="text-center px-6">
              <p className="font-heading text-lg font-medium text-[var(--tc-gray-400)]">
                {product.name}
              </p>
              <p className="mt-2 text-xs text-[var(--tc-gray-300)]">
                Preview coming soon
              </p>
            </div>
          </div>
        )}

        {/* Hover reveal bar — gentle, editorial */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-4 pt-10 pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
          <div className="flex items-center justify-between text-white">
            <span className="text-xs font-medium tracking-wide">View design</span>
            <span aria-hidden className="text-sm transform translate-x-[-4px] group-hover:translate-x-0 transition-transform duration-300">
              →
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tc-gray-400)]">
          {categoryLabel}
        </p>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-base font-medium text-[var(--tc-black)] leading-snug">
            {product.name}
          </h3>
          <span className="text-sm font-semibold text-[var(--tc-black)] whitespace-nowrap">
            from {formatPrice(product.price_pence)}
          </span>
        </div>
        <p className="text-xs text-[var(--tc-gray-500)]">
          50 cards · envelopes included
        </p>
      </div>
    </Link>
  );
}
