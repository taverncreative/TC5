"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Template, Product } from "@/lib/types/database";
import { PAPER_STOCKS, PRINT_QUANTITIES } from "@/lib/constants";

interface ProductFormProps {
  templates: Template[];
  initialData?: Product;
}

export function ProductForm({ templates, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [templateId, setTemplateId] = useState(initialData?.template_id || templates[0]?.id || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [pricePence, setPricePence] = useState(initialData?.price_pence || 19500);
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [quantities, setQuantities] = useState<number[]>(
    initialData?.print_options?.quantities || [25, 50, 75, 100]
  );
  const [paperStocks, setPaperStocks] = useState<string[]>(
    initialData?.print_options?.paper_stocks || ["cotton-350gsm"]
  );

  function handleNameChange(value: string) {
    setName(value);
    if (!isEdit) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }

  function togglePaperStock(stockId: string) {
    if (paperStocks.includes(stockId)) {
      if (paperStocks.length > 1) {
        setPaperStocks(paperStocks.filter((s) => s !== stockId));
      }
    } else {
      setPaperStocks([...paperStocks, stockId]);
    }
  }

  function toggleQuantity(qty: number) {
    if (quantities.includes(qty)) {
      if (quantities.length > 1) {
        setQuantities(quantities.filter((q) => q !== qty));
      }
    } else {
      setQuantities([...quantities, qty].sort((a, b) => a - b));
    }
  }

  async function handleSave() {
    setError("");
    setSaving(true);

    const productData = {
      name,
      slug,
      template_id: templateId,
      description: description || null,
      price_pence: pricePence,
      print_options: { quantities, paper_stocks: paperStocks },
      is_digital_only: false,
      featured,
      sort_order: 0,
      status,
    };

    try {
      const url = isEdit ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(String(err));
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-4">Product Details</h3>
        <div className="space-y-4">
          <Input
            id="name"
            label="Product Name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Sage Botanical Invitation Suite"
            required
          />
          <Input
            id="slug"
            label="Slug (URL)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="sage-botanical-invitation"
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--tc-gray-700)]">Template</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="block w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm"
            >
              {templates.length === 0 && (
                <option value="">No templates available - create one first</option>
              )}
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--tc-gray-700)]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm resize-none"
              placeholder="Product description..."
            />
          </div>
          <Input
            id="price"
            label="Base Price (pence)"
            type="number"
            value={pricePence}
            onChange={(e) => setPricePence(Number(e.target.value))}
            min={100}
          />
          <p className="text-xs text-[var(--tc-gray-400)]">
            {pricePence > 0 ? `£${(pricePence / 100).toFixed(2)}` : "—"}
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-4">Print Options</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[var(--tc-gray-700)] mb-2">Quantities</p>
            <div className="flex flex-wrap gap-2">
              {PRINT_QUANTITIES.map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => toggleQuantity(qty)}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    quantities.includes(qty)
                      ? "bg-[var(--tc-black)] text-white"
                      : "border border-[var(--tc-gray-300)] text-[var(--tc-gray-600)]"
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--tc-gray-700)] mb-2">Paper Stocks</p>
            <div className="space-y-2">
              {PAPER_STOCKS.map((ps) => (
                <label key={ps.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={paperStocks.includes(ps.id)}
                    onChange={() => togglePaperStock(ps.id)}
                    className="rounded"
                  />
                  <span className="text-[var(--tc-gray-700)]">{ps.label}</span>
                  <span className="text-[var(--tc-gray-400)]">— {ps.description}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-4">Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--tc-gray-700)]">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm text-[var(--tc-gray-700)]">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded"
              />
              Featured product
            </label>
          </div>
        </div>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button onClick={handleSave} loading={saving}>
          {isEdit ? "Save Changes" : "Create Product"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
