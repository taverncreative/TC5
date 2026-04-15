import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types/database";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
      <div className="aspect-[3/4] rounded-lg overflow-hidden border border-[var(--tc-gray-200)] group-hover:border-[var(--tc-sage)] transition-colors bg-[var(--tc-gray-50)]">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={product.name}
            width={600}
            height={800}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
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
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-[var(--tc-black)] group-hover:text-[var(--tc-sage)] transition-colors leading-snug">
            {product.name}
          </h3>
          <span className="text-sm font-semibold text-[var(--tc-black)] ml-2 whitespace-nowrap">
            from {formatPrice(product.price_pence)}
          </span>
        </div>
        <Badge variant="sage">{categoryLabel}</Badge>
      </div>
    </Link>
  );
}
