"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useEditorStore } from "@/lib/editor/store";
import { computeLayout, SCREEN_DPI } from "@/lib/editor/layout-engine";
import { formatWeddingDate, parseWeddingDate } from "@/lib/editor/date-format";
import { PalettePicker } from "./palette-picker";
import { FontPicker } from "./font-picker";
import { AccentColorPicker } from "./accent-color-picker";

/** Date picker sub-component for event_date sections */
function DatePickerField({
  value,
  onChange,
  onFocus,
  onBlur,
}: {
  value: string; // formatted string e.g. "SATURDAY 21ST SEPTEMBER 2029"
  onChange: (formatted: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  // Try to reverse-parse the current formatted value to seed the date picker
  const [rawDate, setRawDate] = useState(() => parseWeddingDate(value) || "");

  return (
    <input
      type="date"
      value={rawDate}
      onChange={(e) => {
        const iso = e.target.value;
        setRawDate(iso);
        if (iso) {
          onChange(formatWeddingDate(iso));
        }
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent"
    />
  );
}

export function EditPanel() {
  const template = useEditorStore((s) => s.template);
  const sectionTexts = useEditorStore((s) => s.sectionTexts);
  const setSectionText = useEditorStore((s) => s.setSectionText);
  const selectedPaletteId = useEditorStore((s) => s.selectedPaletteId);
  const selectedFontId = useEditorStore((s) => s.selectedFontId);
  const activeSection = useEditorStore((s) => s.activeSection);
  const setActiveSection = useEditorStore((s) => s.setActiveSection);
  const nameLayout = useEditorStore((s) => s.nameLayout);
  const setNameLayout = useEditorStore((s) => s.setNameLayout);
  const accentConnector = useEditorStore((s) => s.accentConnector);
  const setAccentConnector = useEditorStore((s) => s.setAccentConnector);
  const accentSingleLine = useEditorStore((s) => s.accentSingleLine);
  const setAccentSingleLine = useEditorStore((s) => s.setAccentSingleLine);
  const currentSide = useEditorStore((s) => s.currentSide);
  const setCurrentSide = useEditorStore((s) => s.setCurrentSide);
  const reverseEnabled = useEditorStore((s) => s.reverseEnabled);
  const setReverseEnabled = useEditorStore((s) => s.setReverseEnabled);
  const reverseBlocks = useEditorStore((s) => s.reverseBlocks);
  const addReverseBlock = useEditorStore((s) => s.addReverseBlock);
  const removeReverseBlock = useEditorStore((s) => s.removeReverseBlock);
  const updateReverseBlock = useEditorStore((s) => s.updateReverseBlock);
  const accentColor = useEditorStore((s) => s.accentColor);

  // Track last valid texts to revert on overflow
  const lastValidTexts = useRef<Record<string, string>>({});

  const wouldOverflow = useCallback(
    (sectionId: string, newText: string): boolean => {
      if (!template) return false;

      // Build a test state with the proposed text
      const testTexts = { ...sectionTexts, [sectionId]: newText };

      const layout = computeLayout({
        template,
        sectionTexts: testTexts,
        selectedPaletteId,
        selectedFontId,
        targetDPI: SCREEN_DPI,
        nameLayout,
      });

      // Check if any section overflows
      return layout.sections.some((s) => s.overflow);
    },
    [template, sectionTexts, selectedPaletteId, selectedFontId, nameLayout]
  );

  // Auto-switch names to three-line if single-line text exceeds section width
  useEffect(() => {
    if (!template || nameLayout !== "single-line") return;
    const namesSection = template.sections.find((s) => s.type === "names");
    if (!namesSection) return;
    const namesText = sectionTexts[namesSection.id] || "";
    if (!namesText) return;

    // Estimate if text exceeds the section width at original font size
    const typography = namesSection.typography;
    const fontSize_px = (typography.size_pt / 72) * SCREEN_DPI;
    const letterSpacing_px = fontSize_px * typography.letter_spacing;
    const widthPx = (namesSection.layout.width_mm / 25.4) * SCREEN_DPI;
    const displayText = typography.transform === "uppercase" ? namesText.toUpperCase() : namesText;

    // Simple width estimate: measure each character
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const fontOption = template.font_options.find((f) => f.id === (selectedFontId || template.font_options[0]?.id));
    const font = fontOption?.fonts[typography.font_key];
    const fontFamily = font?.family || "Montserrat";
    ctx.font = `${typography.weight} ${fontSize_px}px "${fontFamily}"`;

    let textWidth = 0;
    for (const char of displayText) {
      textWidth += ctx.measureText(char).width + letterSpacing_px;
    }
    textWidth -= letterSpacing_px;

    // If text exceeds width at full size, switch to three lines
    if (textWidth > widthPx) {
      const match = namesText.match(/^(.+?)\s*(&)\s*(.+)$/);
      if (match) {
        setSectionText(namesSection.id, `${match[1].trim()}\n${match[2]}\n${match[3].trim()}`);
      } else {
        setSectionText(namesSection.id, `${namesText}\n&\n`);
      }
      setNameLayout("three-line");
    }
  }, [template, sectionTexts, selectedPaletteId, selectedFontId, nameLayout, setSectionText, setNameLayout]);

  function handleTextChange(sectionId: string, newText: string) {
    // Always allow deletion (shorter text)
    const currentText = sectionTexts[sectionId] || "";
    if (newText.length <= currentText.length) {
      setSectionText(sectionId, newText);
      lastValidTexts.current[sectionId] = newText;
      return;
    }

    // Only block if THIS change causes new overflow (not if already overflowing)
    if (!wouldOverflow(sectionId, currentText) && wouldOverflow(sectionId, newText)) {
      return;
    }

    setSectionText(sectionId, newText);
    lastValidTexts.current[sectionId] = newText;
  }

  if (!template) return null;

  // Split sections into required (shown) and optional (collapsed at bottom)
  const allSections = template.sections
    .filter((s) => s.content.required || s.content.editable)
    .sort((a, b) => (a.layout.sort_order ?? 0) - (b.layout.sort_order ?? 0));
  const requiredSections = allSections.filter((s) => s.content.required);
  const optionalSections = allSections.filter((s) => !s.content.required);

  const [optionalExpanded, setOptionalExpanded] = useState(false);

  // When a section is activated (e.g. from canvas click), auto-expand optional if needed
  useEffect(() => {
    if (activeSection && optionalSections.some((s) => s.id === activeSection)) {
      setOptionalExpanded(true);
    }
  }, [activeSection, optionalSections]);

  return (
    <div className="h-full overflow-y-auto bg-white border-r border-[var(--tc-gray-200)]">
      <div className="p-5 border-b border-[var(--tc-gray-200)]">
        <h2 className="font-heading text-lg font-semibold text-[var(--tc-black)]">
          Personalise Your Design
        </h2>
        <p className="mt-1 text-xs text-[var(--tc-gray-500)]">
          Edit the text below. Your changes appear instantly.
        </p>
      </div>

      {/* Section fields (front side only) */}
      <div className="p-5 space-y-5" style={{ display: currentSide === "front" ? undefined : "none" }}>
        {requiredSections.map((section) => {
          const text = sectionTexts[section.id] || "";
          const isActive = activeSection === section.id;
          const charCount = text.length;
          const maxLength = section.content.max_length;
          const isOverLimit = charCount > maxLength;

          // At limit = next character would overflow BUT current text does not
          const currentOverflows = charCount > 0 && wouldOverflow(section.id, text);
          const atLimit = !currentOverflows && charCount > 0 && wouldOverflow(section.id, text + "W");

          return (
            <div
              id={`section-${section.id}`}
              key={section.id}
              className={`rounded-lg border p-4 transition-colors ${
                atLimit
                  ? "border-amber-300 bg-amber-50/30"
                  : isActive
                    ? "border-[var(--tc-sage)] bg-[var(--tc-sage-light)]/20"
                    : "border-[var(--tc-gray-200)]"
              }`}
            >
              <label className="block text-sm font-medium text-[var(--tc-black)] mb-1.5">
                {section.label}
              </label>

              {section.content.help_text && (
                <p className="text-xs text-[var(--tc-gray-400)] mb-2">
                  {section.content.help_text}
                </p>
              )}

              {/* Names section: single-line or structured 3-line input */}
              {section.type === "names" ? (() => {
                const parts = text.split("\n");
                const name1 = parts[0] || "";
                const connector = parts[1] || "&";
                const name2 = parts[2] || "";

                // Check if merged text would be too wide for single-line
                const wouldBeTooWide = (() => {
                  if (nameLayout === "single-line") return false;
                  const merged = [name1, connector, name2].filter(Boolean).join(" ");
                  const typo = section.typography;
                  const fSize = (typo.size_pt / 72) * SCREEN_DPI;
                  const ls = fSize * typo.letter_spacing;
                  const wPx = (section.layout.width_mm / 25.4) * SCREEN_DPI;
                  const display = typo.transform === "uppercase" ? merged.toUpperCase() : merged;
                  const cvs = document.createElement("canvas");
                  const cx = cvs.getContext("2d");
                  if (!cx) return false;
                  const fo = template!.font_options.find((f) => f.id === selectedFontId) || template!.font_options[0];
                  const ff = fo?.fonts[typo.font_key]?.family || "Montserrat";
                  cx.font = `${typo.weight} ${fSize}px "${ff}"`;
                  let tw = 0;
                  for (const ch of display) { tw += cx.measureText(ch).width + ls; }
                  tw -= ls;
                  return tw > wPx;
                })();

                function updateNames(n1: string, conn: string, n2: string) {
                  handleTextChange(section.id, `${n1}\n${conn}\n${n2}`);
                }

                function handleLayoutChange(layout: "single-line" | "three-line") {
                  if (layout === nameLayout) return;

                  if (layout === "single-line" && wouldBeTooWide) {
                    // Don't switch — names are too long
                    return;
                  }

                  setNameLayout(layout);

                  if (layout === "single-line") {
                    // Merge 3 lines into one: "Name1 & Name2"
                    const merged = [name1, connector, name2]
                      .filter(Boolean)
                      .join(" ");
                    handleTextChange(section.id, merged);
                  } else {
                    // Split single line back into 3: try to find connector
                    const singleLine = name1; // in single-line mode, everything is in parts[0]
                    const ampMatch = singleLine.match(/^(.+?)\s*(&)\s*(.+)$/);
                    if (ampMatch) {
                      handleTextChange(section.id, `${ampMatch[1].trim()}\n${ampMatch[2]}\n${ampMatch[3].trim()}`);
                    } else {
                      handleTextChange(section.id, `${singleLine}\n&\n`);
                    }
                  }
                }

                return (
                  <div className="space-y-3">
                    {/* Layout toggle */}
                    <div className="flex rounded-md border border-[var(--tc-gray-300)] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleLayoutChange("single-line")}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                          nameLayout === "single-line"
                            ? "bg-[var(--tc-sage)] text-white"
                            : "bg-white text-[var(--tc-gray-500)] hover:bg-[var(--tc-gray-100)]"
                        }`}
                      >
                        One line
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLayoutChange("three-line")}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors border-l border-[var(--tc-gray-300)] ${
                          nameLayout === "three-line"
                            ? "bg-[var(--tc-sage)] text-white"
                            : "bg-white text-[var(--tc-gray-500)] hover:bg-[var(--tc-gray-100)]"
                        }`}
                      >
                        Three lines
                      </button>
                    </div>

                    {wouldBeTooWide && nameLayout === "three-line" && (
                      <p className="text-xs text-amber-600">
                        Reduce text length before switching to one line
                      </p>
                    )}

                    {nameLayout === "single-line" ? (
                      /* Single-line: one text input + optional accent for full line */
                      <>
                        <input
                          type="text"
                          value={text}
                          onChange={(e) => handleTextChange(section.id, e.target.value)}
                          onFocus={() => setActiveSection(section.id)}
                          onBlur={() => setActiveSection(null)}
                          className="w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent"
                          placeholder="e.g. Elaine & Marcus"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-[var(--tc-gray-500)]">
                          <input
                            type="checkbox"
                            checked={accentSingleLine}
                            onChange={(e) => setAccentSingleLine(e.target.checked)}
                            className="rounded"
                          />
                          Accent colour
                        </label>
                      </>
                    ) : (
                      /* Three-line: structured inputs */
                      <>
                        <input
                          type="text"
                          value={name1}
                          onChange={(e) => updateNames(e.target.value, connector, name2)}
                          onFocus={() => setActiveSection(section.id)}
                          onBlur={() => setActiveSection(null)}
                          className="w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent"
                          placeholder="First name(s)"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={connector}
                            onChange={(e) => updateNames(name1, e.target.value, name2)}
                            className="w-16 rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent"
                            placeholder="&"
                          />
                          <label className="flex items-center gap-1.5 text-xs text-[var(--tc-gray-500)]">
                            <input
                              type="checkbox"
                              checked={accentConnector}
                              onChange={(e) => setAccentConnector(e.target.checked)}
                              className="rounded"
                            />
                            Accent colour
                          </label>
                        </div>
                        <input
                          type="text"
                          value={name2}
                          onChange={(e) => updateNames(name1, connector, e.target.value)}
                          onFocus={() => setActiveSection(section.id)}
                          onBlur={() => setActiveSection(null)}
                          className="w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent"
                          placeholder="Second name(s)"
                        />
                      </>
                    )}
                  </div>
                );
              })() : section.type === "event_date" ? (
                <DatePickerField
                  value={text}
                  onChange={(formatted) => handleTextChange(section.id, formatted)}
                  onFocus={() => setActiveSection(section.id)}
                  onBlur={() => setActiveSection(null)}
                />
              ) : section.content.multiline ? (
                <textarea
                  value={text}
                  onChange={(e) => handleTextChange(section.id, e.target.value)}
                  onFocus={() => setActiveSection(section.id)}
                  onBlur={() => setActiveSection(null)}
                  rows={Math.min(section.content.max_lines, 5)}
                  className="w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent resize-none"
                  placeholder={section.content.default_text}
                />
              ) : (
                <input
                  type="text"
                  value={text}
                  onChange={(e) => handleTextChange(section.id, e.target.value)}
                  onFocus={() => setActiveSection(section.id)}
                  onBlur={() => setActiveSection(null)}
                  className="w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent"
                  placeholder={section.content.default_text}
                />
              )}

              {/* Status line */}
              <div className="mt-1.5 flex justify-between items-center">
                {atLimit && (
                  <span className="text-xs text-amber-600">
                    Design limit reached
                  </span>
                )}
                <span
                  className={`text-xs ml-auto ${
                    isOverLimit
                      ? "text-red-500 font-medium"
                      : atLimit
                        ? "text-amber-600"
                        : "text-[var(--tc-gray-400)]"
                  }`}
                >
                  {charCount}/{maxLength}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional sections - collapsed at bottom (front side only) */}
      {optionalSections.length > 0 && currentSide === "front" && (
        <div className="border-t border-[var(--tc-gray-200)]">
          <button
            type="button"
            onClick={() => setOptionalExpanded(!optionalExpanded)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm text-[var(--tc-gray-500)] hover:bg-[var(--tc-gray-50)] transition-colors"
          >
            <span className="font-medium">Optional fields ({optionalSections.length})</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${optionalExpanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {optionalExpanded && (
            <div className="px-5 pb-5 space-y-5">
              {optionalSections.map((section) => {
                const text = sectionTexts[section.id] || "";
                const isActive = activeSection === section.id;
                const charCount = text.length;
                const maxLength = section.content.max_length;
                const isOverLimit = charCount > maxLength;
                const atLimit = charCount > 0 && wouldOverflow(section.id, text + "W");

                return (
                  <div
                    key={section.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      atLimit
                        ? "border-amber-300 bg-amber-50/30"
                        : isActive
                          ? "border-[var(--tc-sage)] bg-[var(--tc-sage-light)]/20"
                          : "border-[var(--tc-gray-200)]"
                    }`}
                  >
                    <label className="block text-sm font-medium text-[var(--tc-black)] mb-1.5">
                      {section.label}
                    </label>
                    {section.content.help_text && (
                      <p className="text-xs text-[var(--tc-gray-400)] mb-2">
                        {section.content.help_text}
                      </p>
                    )}
                    {section.content.multiline ? (
                      <textarea
                        value={text}
                        onChange={(e) => handleTextChange(section.id, e.target.value)}
                        onFocus={() => setActiveSection(section.id)}
                        onBlur={() => setActiveSection(null)}
                        rows={Math.min(section.content.max_lines, 5)}
                        className="w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent resize-none"
                        placeholder={section.content.default_text}
                      />
                    ) : (
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => handleTextChange(section.id, e.target.value)}
                        onFocus={() => setActiveSection(section.id)}
                        onBlur={() => setActiveSection(null)}
                        className="w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent"
                        placeholder={section.content.default_text}
                      />
                    )}
                    <div className="mt-1.5 flex justify-end">
                      <span className={`text-xs ${isOverLimit ? "text-red-500 font-medium" : "text-[var(--tc-gray-400)]"}`}>
                        {charCount}/{maxLength}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Reverse button (when not yet enabled) */}
      {!reverseEnabled && currentSide === "front" && (
        <>
          <div className="border-t border-[var(--tc-gray-200)]" />
          <div className="p-5">
            <button
              type="button"
              onClick={() => {
                setReverseEnabled(true);
                addReverseBlock("text");
                setCurrentSide("back");
              }}
              className="w-full rounded-lg border-2 border-dashed border-[var(--tc-gray-300)] p-4 text-sm text-[var(--tc-gray-500)] hover:border-[var(--tc-sage)] hover:text-[var(--tc-sage)] transition-colors"
            >
              Add Reverse Side (+23p per card)
            </button>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="border-t border-[var(--tc-gray-200)]" />

      {/* Style Options (front side only) */}
      {currentSide === "front" && (
        <div className="p-5 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--tc-black)]">
            Style Options
          </h3>

          <AccentColorPicker />
          <PalettePicker />
          <FontPicker />
        </div>
      )}

      {/* Back side block editor */}
      {currentSide === "back" && reverseEnabled && (
        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--tc-black)]">
              Reverse Side
            </h3>
            <span className="text-xs text-[var(--tc-gray-400)]">
              {reverseBlocks.length}/4 blocks
            </span>
          </div>

          {reverseBlocks.map((block) => (
            <div
              key={block.id}
              className="rounded-lg border border-[var(--tc-gray-200)] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--tc-gray-500)] uppercase">
                  {block.type === "qr" ? "QR Code" : "Text Block"}
                </span>
                <button
                  type="button"
                  onClick={() => removeReverseBlock(block.id)}
                  className="text-xs text-[var(--tc-gray-400)] hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>

              <input
                type="text"
                value={block.header}
                onChange={(e) => updateReverseBlock(block.id, { header: e.target.value })}
                className="w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent"
                placeholder="Header (e.g. WHERE TO STAY)"
              />

              {block.type === "qr" ? (
                <>
                  <input
                    type="url"
                    value={block.qrUrl || ""}
                    onChange={(e) => updateReverseBlock(block.id, { qrUrl: e.target.value })}
                    className="w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent"
                    placeholder="URL (e.g. https://yourwebsite.com/rsvp)"
                  />
                  <input
                    type="text"
                    value={block.body}
                    onChange={(e) => updateReverseBlock(block.id, { body: e.target.value })}
                    className="w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent"
                    placeholder="Label (e.g. Please scan QR to RSVP)"
                  />
                </>
              ) : (
                <textarea
                  value={block.body}
                  onChange={(e) => updateReverseBlock(block.id, { body: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tc-sage)] focus:border-transparent resize-none"
                  placeholder="Body text..."
                />
              )}
            </div>
          ))}

          {reverseBlocks.length < 4 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addReverseBlock("text")}
                className="flex-1 rounded-md border border-dashed border-[var(--tc-gray-300)] py-2 text-xs text-[var(--tc-gray-500)] hover:border-[var(--tc-sage)] hover:text-[var(--tc-sage)] transition-colors"
              >
                + Text Block
              </button>
              <button
                type="button"
                onClick={() => addReverseBlock("qr")}
                className="flex-1 rounded-md border border-dashed border-[var(--tc-gray-300)] py-2 text-xs text-[var(--tc-gray-500)] hover:border-[var(--tc-sage)] hover:text-[var(--tc-sage)] transition-colors"
              >
                + QR Code
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
