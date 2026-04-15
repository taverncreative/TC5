/**
 * Shared map of product slugs to background image paths.
 * Used by canvas-preview, render-print, and admin template-live-preview.
 *
 * New 5x7" designs use "No Text-01.png" as the background.
 * Legacy designs (original 4) use "{Name}-01.png".
 */

// Legacy designs (original folder structure)
const LEGACY_BACKGROUNDS: Record<string, string> = {
  "white-roses-invitation": "/Designs/Single Card Invitations/White Roses_Folder/White Roses-01.png",
  "wildflowers-invitation": "/Designs/Single Card Invitations/Wildflowers_Folder/Wildflowers-01.png",
  "wintry-invitation": "/Designs/Single Card Invitations/Wintry_Folder/Wintry-01.png",
  "wooded-autumn-invitation": "/Designs/Single Card Invitations/Wooded autumn_Folder/Wooded autumn-01.png",
};

// New 5x7" designs — folder name derived from slug
// e.g. "argyle-invitation" → "Argyle _Folder" → "/Designs/Single Card Invitations 5x7\"/Argyle _Folder/No Text-01.png"
const SLUG_TO_FOLDER: Record<string, string> = {};

// This will be populated by the template creation script.
// For now, build dynamically from known folder names.
const NEW_DESIGN_FOLDERS: string[] = [
  "Argyle _Folder", "Autumn_Folder", "Baby's Breath_Folder", "Blue Corner_Folder",
  "Blue Flowers 2_Folder", "Blue Ocean Watercolour_Folder", "Blue Roses_Folder",
  "Bouquet_Folder", "Calligraphy_Folder", "Confetti_Folder", "Destination_Folder",
  "Dreams_Folder", "Dried Flowers_Folder", "Eucalyptus_Folder", "Festive_Folder",
  "Frost_Folder", "Gold Floral_Folder", "Gold Spots_Folder",
  "Green Leaves Watercolour_Folder", "Green Leaves_Folder", "Greenery Eucalyptus_Folder",
  "Greys_Folder", "Lavender_Folder", "Lilac Floral_Folder", "Mauve Floral_Folder",
  "New York_Folder", "October_Folder", "Olive_Folder", "Palm_Folder",
  "Peach Floral_Folder", "Pink Glasses_Folder", "Pink Watercolour2 _Folder",
  "Pink Watercolour_Folder", "Purple & Pink_Folder", "Succulents_Folder",
  "Sunflowers_Folder", "The Season_Folder", "Tropical_Folder", "Violet_Folder",
  "Whimsical_Folder", "White Floral Roses_Folder", "White Roses_Folder",
  "Wildflowers_Folder", "Wintry_Folder", "Wooded autumn_Folder",
  "palm1_Folder", "pink floral_Folder",
];

// Explicit overrides where folder name doesn't derive cleanly to the DB slug
const SLUG_OVERRIDES: Record<string, string> = {
  "Baby's Breath_Folder": "babys-breath-invitation",
  "palm1_Folder": "palm-1-invitation",
  "Pink Watercolour2 _Folder": "pink-watercolour-2-invitation",
  "Purple & Pink_Folder": "purple-and-pink-invitation",
};

function folderToSlug(folder: string): string {
  if (SLUG_OVERRIDES[folder]) return SLUG_OVERRIDES[folder];
  const name = folder.replace(/_Folder$/, "").trim();
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") + "-invitation";
}

// Build the new design map
for (const folder of NEW_DESIGN_FOLDERS) {
  const slug = folderToSlug(folder);
  SLUG_TO_FOLDER[slug] = folder;
}

/**
 * Get the background image path for a product slug.
 * Returns undefined if no background image is configured.
 */
export function getBackgroundImagePath(slug: string): string | undefined {
  // Check legacy first
  if (LEGACY_BACKGROUNDS[slug]) return LEGACY_BACKGROUNDS[slug];

  // Check new designs
  const folder = SLUG_TO_FOLDER[slug];
  if (folder) {
    return `/Designs/Single Card Invitations 5x7"/${folder}/No Text-01.png`;
  }

  return undefined;
}

/**
 * Get the proof thumbnail path for an admin design reference.
 */
export function getProofThumbnailPath(slug: string): string | undefined {
  const folder = SLUG_TO_FOLDER[slug];
  if (folder) {
    return `/Designs/Single Card Invitations 5x7"/${folder}/proof-1.png`;
  }

  // Legacy proof paths
  const legacyProofs: Record<string, string> = {
    "white-roses-invitation": "/Designs/Single Card Invitations/White Roses_Folder/proof-1.png",
    "wildflowers-invitation": "/Designs/Single Card Invitations/Wildflowers_Folder/proof-1.png",
    "wintry-invitation": "/Designs/Single Card Invitations/Wintry_Folder/proof-1.png",
    "wooded-autumn-invitation": "/Designs/Single Card Invitations/Wooded autumn_Folder/proof-1.png",
  };
  return legacyProofs[slug];
}

/** Get the folder name for a slug (for server-side file access) */
export function getDesignFolder(slug: string): string | undefined {
  return SLUG_TO_FOLDER[slug];
}
