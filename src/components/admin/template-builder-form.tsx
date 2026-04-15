"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SectionEditor } from "./section-editor";
import { PaletteEditor } from "./palette-editor";
import { FontOptionEditor } from "./font-option-editor";
import { TemplateLivePreview } from "./template-live-preview";
import type { Template, TemplateSection, ColorPalette, FontOption } from "@/lib/types/database";
import { TEMPLATE_DIMENSIONS, PRODUCT_CATEGORIES } from "@/lib/constants";
import { getDefaultSections, defaultColorPalettes, defaultFontOptions } from "@/lib/templates/defaults";

const DESIGN_THUMBNAILS: Record<string, string> = {
  "white-roses": "/Designs/Single Card Invitations/White Roses_Folder/proof-1.png",
  "wildflowers": "/Designs/Single Card Invitations/Wildflowers_Folder/proof-1.png",
  "wintry": "/Designs/Single Card Invitations/Wintry_Folder/proof-1.png",
  "wooded-autumn": "/Designs/Single Card Invitations/Wooded autumn_Folder/proof-1.png",
};

interface TemplateBuilderFormProps {
  initialData?: Template;
}

export function TemplateBuilderForm({ initialData }: TemplateBuilderFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Basic fields
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [category, setCategory] = useState(initialData?.category || "invitation");
  const [dimensionKey, setDimensionKey] = useState<string>(() => {
    if (!initialData) return "A5";
    const dims = initialData.dimensions;
    const match = Object.entries(TEMPLATE_DIMENSIONS).find(
      ([, v]) => v.width_mm === dims.width_mm && v.height_mm === dims.height_mm
    );
    return match ? match[0] : "A5";
  });
  const [bleedMm, setBleedMm] = useState(initialData?.dimensions.bleed_mm ?? 3);
  const [status, setStatus] = useState(initialData?.status || "draft");

  // Background
  const [bgType, setBgType] = useState<"color" | "image">(initialData?.background?.type || "color");
  const [bgColor, setBgColor] = useState(initialData?.background?.color || "#fafafa");

  // Sections
  const [sections, setSections] = useState<TemplateSection[]>(
    initialData?.sections?.length ? initialData.sections : getDefaultSections(category)
  );

  // Palettes
  const [palettes, setPalettes] = useState<ColorPalette[]>(
    initialData?.color_palettes?.length ? initialData.color_palettes : defaultColorPalettes
  );

  // Font options
  const [fontOptions, setFontOptions] = useState<FontOption[]>(
    initialData?.font_options?.length ? initialData.font_options : defaultFontOptions
  );

  // Text area controls
  const [textAreaYStart, setTextAreaYStart] = useState(initialData?.text_area?.y_start_mm ?? 30);
  const [textAreaYOffset, setTextAreaYOffset] = useState(initialData?.text_area?.y_offset_mm ?? 0);
  const [textAreaMaxHeight, setTextAreaMaxHeight] = useState(initialData?.text_area?.max_height_mm ?? 140);

  function handleNameChange(value: string) {
    setName(value);
    if (!isEdit) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    if (!isEdit && sections.length === 0) {
      setSections(getDefaultSections(value));
    }
  }

  function addSection() {
    const maxOrder = sections.reduce((max, s) => Math.max(max, s.layout.sort_order ?? 0), 0);
    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      type: "custom",
      label: "New Section",
      layout: {
        x_mm: 15,
        width_mm: 97,
        max_height_mm: 20,
        gap_after_mm: 5,
        alignment: "center",
        sort_order: maxOrder + 10,
      },
      typography: {
        font_key: "body",
        size_pt: 8,
        weight: 600,
        line_height: 2.5,
        letter_spacing: 0.1,
        color_key: "primary",
        transform: "uppercase", // Body text always uppercase
      },
      content: {
        default_text: "New text section",
        required: true,
        max_length: 200,
        multiline: true,
        max_lines: 5,
        word_wrap: true,
      },
    };
    setSections([...sections, newSection]);
  }

  function removeSection(index: number) {
    setSections(sections.filter((_, i) => i !== index));
  }

  function updateSection(index: number, updated: TemplateSection) {
    const newSections = [...sections];
    newSections[index] = updated;
    setSections(newSections);
  }

  async function handleSave() {
    setError("");
    setSaving(true);

    const saveDims = TEMPLATE_DIMENSIONS[dimensionKey as keyof typeof TEMPLATE_DIMENSIONS];
    const templateData = {
      name,
      slug,
      category,
      dimensions: { width_mm: saveDims.width_mm, height_mm: saveDims.height_mm, bleed_mm: bleedMm },
      sections,
      color_palettes: palettes,
      font_options: fontOptions,
      background: { type: bgType, color: bgType === "color" ? bgColor : undefined },
      text_area: { y_start_mm: textAreaYStart, y_offset_mm: textAreaYOffset, max_height_mm: textAreaMaxHeight },
      status,
    };

    try {
      const url = isEdit ? `/api/admin/templates/${initialData.id}` : "/api/admin/templates";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/templates");
      router.refresh();
    } catch (err) {
      setError(String(err));
      setSaving(false);
    }
  }

  const dims = TEMPLATE_DIMENSIONS[dimensionKey as keyof typeof TEMPLATE_DIMENSIONS];
  const currentDimensions = { width_mm: dims.width_mm, height_mm: dims.height_mm, bleed_mm: bleedMm };
  const currentBackground = { type: bgType as "color" | "image", color: bgType === "color" ? bgColor : undefined };
  const currentTextArea = { y_start_mm: textAreaYStart, y_offset_mm: textAreaYOffset, max_height_mm: textAreaMaxHeight };

  return (
    <div className="flex gap-8">
      {/* Left: Form */}
      <div className="flex-1 space-y-6 min-w-0">
      {/* Basic Info */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="name"
            label="Template Name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Sage Botanical Invitation"
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
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--tc-gray-700)]">Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="block w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--tc-gray-700)]">Dimensions</label>
            <select
              value={dimensionKey}
              onChange={(e) => setDimensionKey(e.target.value)}
              className="block w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm"
            >
              {Object.entries(TEMPLATE_DIMENSIONS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
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
        </div>
      </Card>

      {/* Background */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-4">Background</h3>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBgType("color")}
              className={`px-3 py-1.5 text-sm rounded-md ${bgType === "color" ? "bg-[var(--tc-black)] text-white" : "border border-[var(--tc-gray-300)]"}`}
            >
              Colour
            </button>
            <button
              type="button"
              onClick={() => setBgType("image")}
              className={`px-3 py-1.5 text-sm rounded-md ${bgType === "image" ? "bg-[var(--tc-black)] text-white" : "border border-[var(--tc-gray-300)]"}`}
            >
              Image
            </button>
          </div>
          {bgType === "color" && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-8 w-8 rounded border border-[var(--tc-gray-300)] cursor-pointer"
              />
              <Input
                id="bgColor"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                placeholder="#fafafa"
                className="w-28"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Text Area Controls */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-4">Text Area</h3>
        <p className="text-xs text-[var(--tc-gray-400)] mb-3">Controls the vertical position and limits of all text sections as a group.</p>
        <div className="grid grid-cols-3 gap-4">
          <Input
            id="ta-ystart"
            label="Start Y (mm)"
            type="number"
            value={textAreaYStart}
            onChange={(e) => setTextAreaYStart(Number(e.target.value))}
          />
          <Input
            id="ta-yoffset"
            label="Y Offset (mm)"
            type="number"
            value={textAreaYOffset}
            onChange={(e) => setTextAreaYOffset(Number(e.target.value))}
          />
          <Input
            id="ta-maxheight"
            label="Max Height (mm)"
            type="number"
            value={textAreaMaxHeight}
            onChange={(e) => setTextAreaMaxHeight(Number(e.target.value))}
          />
        </div>
      </Card>

      {/* Sections */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--tc-black)]">
            Sections ({sections.length})
          </h3>
          <Button variant="outline" size="sm" onClick={addSection}>
            Add Section
          </Button>
        </div>
        <div className="space-y-4">
          {sections
            .map((section, i) => ({ section, i }))
            .sort((a, b) => (a.section.layout.sort_order ?? 0) - (b.section.layout.sort_order ?? 0))
            .map(({ section, i }) => (
            <SectionEditor
              key={section.id}
              section={section}
              onChange={(updated) => updateSection(i, updated)}
              onRemove={() => removeSection(i)}
            />
          ))}
          {sections.length === 0 && (
            <p className="text-sm text-[var(--tc-gray-400)] text-center py-4">
              No sections yet. Add one to define the stationery structure.
            </p>
          )}
        </div>
      </Card>

      {/* Colour Palettes */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-4">Colour Palettes</h3>
        <PaletteEditor palettes={palettes} onChange={setPalettes} />
      </Card>

      {/* Font Options */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-4">Font Options</h3>
        <FontOptionEditor fontOptions={fontOptions} onChange={setFontOptions} />
      </Card>

      {/* Save */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <div className="flex gap-3">
        <Button onClick={handleSave} loading={saving}>
          {isEdit ? "Save Changes" : "Create Template"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/admin/templates")}>
          Cancel
        </Button>
      </div>
      </div>

      {/* Right: Live Preview */}
      <div className="w-[400px] flex-shrink-0">
        <TemplateLivePreview
          name={name}
          slug={slug}
          category={category}
          dimensions={currentDimensions}
          sections={sections}
          colorPalettes={palettes}
          fontOptions={fontOptions}
          background={currentBackground}
          textArea={currentTextArea}
          thumbnailUrl={DESIGN_THUMBNAILS[slug] || initialData?.thumbnail_url || null}
        />
      </div>
    </div>
  );
}
