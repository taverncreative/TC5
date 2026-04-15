@AGENTS.md

# TC5 Build Rules

## Non-negotiable build rules

- No placeholder UI
- No dummy data
- No fake functions
- No "TODO" comments
- No mock implementations

Every feature must:
- Be fully wired
- Use real data flow
- Be production-ready

## Safety rules

- Do not break existing functionality
- Do not remove working code unless replacing it
- Do not refactor unrelated areas

## Validation rules

Before completing any task:
- Confirm all imports resolve
- Confirm no runtime errors
- Confirm API routes are complete
- Confirm database queries are valid

If unsure:
- Choose the simplest working solution
- Do not guess complex logic

## Project context

- Wedding stationery platform replacing Shopify
- Owner: Tavern Creative, Kent UK
- Currency: GBP (pence for prices)
- Stack: Next.js 16 (Turbopack), React 19, Zustand, Supabase, pdf-lib, Stripe
- SCREEN_DPI = 150 (not 72) — defined in layout-engine.ts
- All designs are 5x7" (127x178mm) single card invitations
- Background images: `public/Designs/Single Card Invitations 5x7"/` with `No Text-01.png` per folder
- Fonts: `public/fonts/` — registered in `src/app/(editor)/editor/fonts.css`
- Templates and products stored in Supabase
- PDF generation: client-side canvas rasterisation at 300 DPI, server wraps in PDF with 3mm bleed + crop marks
- Layout engine is single source of truth for text positioning — both screen and print consume its output
- Reverse side: optional, up to 4 blocks (text/QR), white background, Montserrat font
