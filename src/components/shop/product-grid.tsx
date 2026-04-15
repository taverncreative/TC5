import Image from "next/image";
import type { Product } from "@/lib/types/database";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  /** When true, insert an editorial feature band after every 8 products */
  withFeatureBand?: boolean;
}

export function ProductGrid({
  products,
  withFeatureBand = false,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--tc-gray-500)]">
          No designs in this collection yet — check back soon.
        </p>
      </div>
    );
  }

  // Group products into chunks of 8 to interleave with feature bands
  const CHUNK = 8;
  const chunks: Product[][] = [];
  for (let i = 0; i < products.length; i += CHUNK) {
    chunks.push(products.slice(i, i + CHUNK));
  }

  return (
    <div className="space-y-14">
      {chunks.map((chunk, i) => (
        <div key={i}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12">
            {chunk.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {withFeatureBand && i < chunks.length - 1 && <FeatureBand />}
        </div>
      ))}
    </div>
  );
}

function FeatureBand() {
  return (
    <section className="relative mt-16 rounded-xl overflow-hidden aspect-[21/6] md:aspect-[21/5]">
      <Image
        src="/images/brand/feature-band.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-md pl-6 md:pl-12 text-white">
          <span className="tc-divider mb-3" />
          <p className="font-heading text-xl md:text-2xl font-medium leading-snug">
            An accent colour for every season.
          </p>
          <p className="mt-2 text-sm opacity-80 max-w-sm">
            Every design is available in our full palette — match your scheme in
            minutes.
          </p>
        </div>
      </div>
    </section>
  );
}
