import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllProducts } from "@/lib/db/products";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
            Products
          </h1>
          <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
            Purchasable items linked to templates.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>New Product</Button>
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {products.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <p className="text-[var(--tc-gray-400)]">No products yet.</p>
              <Link href="/admin/products/new" className="mt-2 inline-block text-sm font-medium text-[var(--tc-sage)] hover:underline">
                Create your first product
              </Link>
            </div>
          </Card>
        )}
        {products.map((product) => (
          <Link key={product.id} href={`/admin/products/${product.id}`}>
            <Card className="hover:border-[var(--tc-sage)] transition-colors cursor-pointer mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[var(--tc-black)]">
                    {product.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--tc-gray-500)]">
                    {formatPrice(product.price_pence)} &middot; {product.template?.category || "—"} &middot; {product.template?.name || "No template"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {product.featured && <Badge variant="sage">Featured</Badge>}
                  <Badge variant={product.status === "active" ? "success" : "default"}>
                    {product.status}
                  </Badge>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
