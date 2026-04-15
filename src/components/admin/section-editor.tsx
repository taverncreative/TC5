"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TemplateSection } from "@/lib/types/database";

interface SectionEditorProps {
  section: TemplateSection;
  onChange: (section: TemplateSection) => void;
  onRemove: () => void;
}

export function SectionEditor({ section, onChange, onRemove }: SectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  function update(path: string, value: unknown) {
    const updated = JSON.parse(JSON.stringify(section)) as TemplateSection;
    const keys = path.split(".");
    let target: Record<string, unknown> = updated as unknown as Record<string, unknown>;
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]] as Record<string, unknown>;
    }
    target[keys[keys.length - 1]] = value;
    onChange(updated);
  }

  return (
    <div className="border border-[var(--tc-gray-200)] rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-[var(--tc-gray-100)] transition-transform"
          >
            <svg
              className={`w-4 h-4 text-[var(--tc-gray-500)] transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--tc-sage-light)] text-[var(--tc-gray-700)]">
            {section.layout.sort_order ?? 0}
          </span>
          <Input
            id={`${section.id}-type`}
            value={section.type}
            onChange={(e) => update("type", e.target.value)}
            className="w-28 text-xs"
            placeholder="e.g. names"
          />
          <span className="text-sm font-medium text-[var(--tc-black)]">{section.label}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>

      {isExpanded && (
      <div className="mt-3">
      {/* Label, Help Text, Sort Order */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <Input
          id={`${section.id}-label`}
          label="Label"
          value={section.label}
          onChange={(e) => update("label", e.target.value)}
        />
        <Input
          id={`${section.id}-help`}
          label="Help Text"
          value={section.content.help_text || ""}
          onChange={(e) => update("content.help_text", e.target.value)}
          placeholder="Guidance for customer"
        />
        <Input
          id={`${section.id}-sort`}
          label="Sort Order"
          type="number"
          value={section.layout.sort_order ?? 0}
          onChange={(e) => update("layout.sort_order", Number(e.target.value))}
        />
      </div>

      {/* Position & Size */}
      <p className="text-xs font-medium text-[var(--tc-gray-500)] mb-2 mt-3">Layout</p>
      <div className="grid grid-cols-5 gap-3">
        <Input
          id={`${section.id}-x`}
          label="X (mm)"
          type="number"
          value={section.layout.x_mm}
          onChange={(e) => update("layout.x_mm", Number(e.target.value))}
        />
        <Input
          id={`${section.id}-y`}
          label="Y Offset (mm)"
          type="number"
          value={section.layout.y_mm ?? 0}
          onChange={(e) => update("layout.y_mm", Number(e.target.value))}
        />
        <Input
          id={`${section.id}-w`}
          label="Width (mm)"
          type="number"
          value={section.layout.width_mm}
          onChange={(e) => update("layout.width_mm", Number(e.target.value))}
        />
        <Input
          id={`${section.id}-h`}
          label="Max Height (mm)"
          type="number"
          value={section.layout.max_height_mm}
          onChange={(e) => update("layout.max_height_mm", Number(e.target.value))}
        />
        <Input
          id={`${section.id}-gap`}
          label="Gap After (mm)"
          type="number"
          value={section.layout.gap_after_mm ?? 5}
          onChange={(e) => update("layout.gap_after_mm", Number(e.target.value))}
        />
      </div>

      {/* Typography */}
      <p className="text-xs font-medium text-[var(--tc-gray-500)] mb-2 mt-3">Typography</p>
      <div className="grid grid-cols-4 gap-3">
        <Input
          id={`${section.id}-size`}
          label="Size (pt)"
          type="number"
          value={section.typography.size_pt}
          onChange={(e) => update("typography.size_pt", Number(e.target.value))}
        />
        <Input
          id={`${section.id}-weight`}
          label="Weight"
          type="number"
          value={section.typography.weight}
          onChange={(e) => update("typography.weight", Number(e.target.value))}
        />
        <Input
          id={`${section.id}-lh`}
          label="Line Height"
          type="number"
          step="0.1"
          value={section.typography.line_height}
          onChange={(e) => update("typography.line_height", Number(e.target.value))}
        />
        <Input
          id={`${section.id}-ls`}
          label="Letter Spacing"
          type="number"
          step="0.01"
          value={section.typography.letter_spacing}
          onChange={(e) => update("typography.letter_spacing", Number(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--tc-gray-700)]">Alignment</label>
          <select
            value={section.layout.alignment}
            onChange={(e) => update("layout.alignment", e.target.value)}
            className="block w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Centre</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--tc-gray-700)]">Transform</label>
          <select
            value={section.typography.transform}
            onChange={(e) => update("typography.transform", e.target.value)}
            className="block w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm"
          >
            <option value="none">None</option>
            <option value="uppercase">UPPERCASE</option>
            <option value="lowercase">lowercase</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--tc-gray-700)]">Font Key</label>
          <select
            value={section.typography.font_key}
            onChange={(e) => update("typography.font_key", e.target.value)}
            className="block w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm"
          >
            <option value="heading">Heading</option>
            <option value="body">Body</option>
          </select>
        </div>
      </div>

      {/* Content Rules */}
      <p className="text-xs font-medium text-[var(--tc-gray-500)] mb-2 mt-3">Content</p>
      <div className="grid grid-cols-4 gap-3">
        <Input
          id={`${section.id}-default`}
          label="Default Text"
          value={section.content.default_text}
          onChange={(e) => update("content.default_text", e.target.value)}
        />
        <Input
          id={`${section.id}-max`}
          label="Max Length"
          type="number"
          value={section.content.max_length}
          onChange={(e) => update("content.max_length", Number(e.target.value))}
        />
        <Input
          id={`${section.id}-maxlines`}
          label="Max Lines"
          type="number"
          value={section.content.max_lines}
          onChange={(e) => update("content.max_lines", Number(e.target.value))}
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--tc-gray-700)]">Colour Key</label>
          <select
            value={section.typography.color_key}
            onChange={(e) => update("typography.color_key", e.target.value)}
            className="block w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm"
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="accent">Accent</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6 mt-3">
        <label className="flex items-center gap-2 text-sm text-[var(--tc-gray-700)]">
          <input
            type="checkbox"
            checked={section.content.required ?? true}
            onChange={(e) => update("content.required", e.target.checked)}
            className="rounded"
          />
          Required
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--tc-gray-700)]">
          <input
            type="checkbox"
            checked={section.content.multiline}
            onChange={(e) => update("content.multiline", e.target.checked)}
            className="rounded"
          />
          Multiline
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--tc-gray-700)]">
          <input
            type="checkbox"
            checked={section.content.word_wrap ?? false}
            onChange={(e) => update("content.word_wrap", e.target.checked)}
            className="rounded"
          />
          Word Wrap
        </label>
      </div>
      </div>)}
    </div>
  );
}
