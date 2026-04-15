/**
 * Batch create all single card invitation designs.
 * Run with: node scripts/create-designs.mjs
 * Requires the dev server running at localhost:3000
 */

import { readFileSync } from "fs";

const API = "http://localhost:3000/api/admin";
const designs = JSON.parse(readFileSync("scripts/design-config.json", "utf-8"));

// Standardised gold accent
const GOLD = "#b8962e";

// Base sections (same structure as Wooded Autumn)
function makeSections(design) {
  const bodyTypo = {
    weight: 600, size_pt: 7, font_key: "body", color_key: "primary",
    transform: "uppercase", line_height: 2.5, letter_spacing: 0.12,
  };

  return [
    {
      id: "families", type: "invitation_line", label: "Family Line",
      layout: { x_mm: 15, y_mm: -1, width_mm: 98, alignment: "center", sort_order: 10, gap_after_mm: 4, max_height_mm: 10 },
      typography: { ...bodyTypo },
      content: { editable: true, required: false, help_text: "e.g. Together with their families", max_lines: 1, multiline: false, word_wrap: false, max_length: 60, default_text: "TOGETHER WITH THEIR FAMILIES" },
    },
    {
      id: "names", type: "names", label: "Names",
      layout: { x_mm: 19, y_mm: 0.5, width_mm: 89, alignment: "center", sort_order: 20, gap_after_mm: 0, max_height_mm: 35 },
      typography: { weight: 400, size_pt: 27, font_key: "heading", color_key: "primary", transform: design.namesTransform || "none", line_height: 1.3, letter_spacing: 0.05 },
      content: { required: true, help_text: "Enter both names", max_lines: 3, multiline: false, word_wrap: false, max_length: 50, default_text: "Oliver & Amelia" },
    },
    {
      id: "event_wording", type: "event_wording", label: "Invitation Wording",
      layout: { x_mm: 15, y_mm: 5, width_mm: 97, alignment: "center", sort_order: 30, gap_after_mm: 1, max_height_mm: 25 },
      typography: { ...bodyTypo },
      content: { editable: true, required: false, help_text: "Wording above the date and venue (optional)", max_lines: 4, multiline: true, word_wrap: false, max_length: 200, default_text: "REQUEST THE PLEASURE OF YOUR COMPANY\nTO CELEBRATE THEIR MARRIAGE" },
    },
    {
      id: "event_date", type: "event_date", label: "Date",
      layout: { x_mm: 15, y_mm: 4.2, width_mm: 97, alignment: "center", sort_order: 31, gap_after_mm: 1, max_height_mm: 10 },
      typography: { ...bodyTypo },
      content: { required: true, help_text: "Pick your wedding date", max_lines: 1, multiline: false, word_wrap: false, max_length: 60, default_text: "SATURDAY 28TH JULY 2035" },
    },
    {
      id: "event_time", type: "event_time", label: "Time",
      layout: { x_mm: 15, y_mm: 3.7, width_mm: 97, alignment: "center", sort_order: 32, gap_after_mm: 1, max_height_mm: 10 },
      typography: { ...bodyTypo },
      content: { editable: true, required: true, help_text: "e.g. AT 7PM, FROM 2PM", max_lines: 1, multiline: false, word_wrap: false, max_length: 30, default_text: "AT 1PM" },
    },
    {
      id: "event_venue", type: "event_venue", label: "Venue",
      layout: { x_mm: 15, y_mm: 2.8, width_mm: 97, alignment: "center", sort_order: 33, gap_after_mm: 0, max_height_mm: 20 },
      typography: { ...bodyTypo },
      content: { required: true, help_text: "Venue name and address", max_lines: 3, multiline: true, word_wrap: false, max_length: 150, default_text: "ROSEWOOD HALL\nLITTLE BENSFIELD, SURREY, GU4 8QT" },
    },
    {
      id: "schedule", type: "schedule", label: "Additional Info",
      layout: { x_mm: 15, y_mm: 7, width_mm: 97, alignment: "center", sort_order: 40, gap_after_mm: 5, max_height_mm: 15 },
      typography: { ...bodyTypo, color_key: "accent" },
      content: { required: true, help_text: "e.g. Carriages at midnight, Reception to follow", max_lines: 2, multiline: false, word_wrap: false, max_length: 100, default_text: "RECEPTION TO FOLLOW" },
    },
  ];
}

async function createDesign(design, index) {
  const templateSlug = design.slug.replace("-invitation", "");

  // Create template
  const template = {
    name: design.name,
    slug: templateSlug,
    category: "invitation",
    dimensions: { width_mm: 127, height_mm: 178, bleed_mm: 3 },
    background: { type: "color", color: "#faf9f6" },
    text_area: { y_start_mm: 42, y_offset_mm: 0, max_height_mm: 107 },
    sections: makeSections(design),
    color_palettes: [{
      id: "classic",
      name: "Classic",
      colors: {
        primary: "#1a1a1a",
        secondary: "#3d3d3d",
        accent: design.accentColor || GOLD,
        background: "#faf9f6",
      },
    }],
    font_options: [{
      id: "default",
      name: design.name,
      fonts: {
        body: { family: "Montserrat", weight: 600 },
        heading: { family: design.headingFont, weight: 400 },
      },
    }],
    thumbnail_url: null,
    status: "active",
  };

  try {
    const tRes = await fetch(`${API}/templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    });
    if (!tRes.ok) {
      const err = await tRes.text();
      console.error(`TEMPLATE FAIL ${design.name}: ${err}`);
      return;
    }
    const tData = await tRes.json();

    // Create product
    const product = {
      template_id: tData.id,
      name: `${design.name} Invitation`,
      slug: design.slug,
      description: `Beautiful ${design.name.toLowerCase()} wedding invitation design.`,
      price_pence: 150,
      print_options: { quantities: [10, 25, 50, 75, 100, 150], paper_stocks: ["Fedrigoni Old Mill 300gsm"] },
      is_digital_only: false,
      featured: false,
      sort_order: index + 1,
      status: "active",
    };

    const pRes = await fetch(`${API}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!pRes.ok) {
      const err = await pRes.text();
      console.error(`PRODUCT FAIL ${design.name}: ${err}`);
      return;
    }

    console.log(`OK: ${design.name} (template: ${tData.id})`);
  } catch (e) {
    console.error(`ERROR ${design.name}: ${e.message}`);
  }
}

async function main() {
  // Skip Wooded Autumn since it already exists
  const toCreate = designs.filter(d => d.slug !== "wooded-autumn-invitation");

  console.log(`Creating ${toCreate.length} designs...`);

  for (let i = 0; i < toCreate.length; i++) {
    await createDesign(toCreate[i], i);
  }

  console.log("Done!");
}

main();
