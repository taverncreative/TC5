import { notFound } from "next/navigation";
import { getProductById } from "@/lib/db/products";
import { getTemplates } from "@/lib/db/templates";
import { ProductForm } from "@/components/admin/product-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, templates] = await Promise.all([
    getProductById(id),
    getTemplates(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
        Edit Product
      </h1>
      <p className="mt-1 text-sm text-[var(--tc-gray-500)]">{product.name}</p>
      <div className="mt-6">
        <ProductForm templates={templates} initialData={product} />
      </div>
    </div>
  );
}
