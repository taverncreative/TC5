import { ProductForm } from "@/components/admin/product-form";
import { getTemplates } from "@/lib/db/templates";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const templates = await getTemplates();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
        Create Product
      </h1>
      <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
        Link a product to a template and set pricing.
      </p>
      <div className="mt-6">
        <ProductForm templates={templates} />
      </div>
    </div>
  );
}
