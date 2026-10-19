# Handoff note

## Decisions
- Tokens, type, radii and button specs follow PRD section 12 exactly. Light helper text uses #6B6B6B (PRD contrast note).
- Later-phase screens carry a dashed "Later phase" tag in the header and an info banner; dashboard nav shows P2/P3/P4 chips and locked pages.
- Dark theme uses PRD proposed values; status badges use color-mix tints of the semantic color on the surface.
- RTL: logical properties only; back arrow and chevrons flip; phone, check, stars, logos, charts do not; phones, codes, times, prices wrapped LTR. Dashboard sidebar sits at inline-start (right in Arabic).
- Restricted states: receptionist cannot Start/Complete visits; non-managers see Services read-only and a lock page for Staff; only super admin sees Flags.

## Assumptions
- Egyptian Arabic copy is draft and needs native review.
- Photos, pet illustrations and QR are placeholders. No logo supplied; wordmark is plain type.
- Dates in the kit are examples around 18-25 Oct 2026.

## Missing or to confirm
- Logo, brand illustrations, app icon, splash artwork.
- Cancellation policy text and cutoff (kit shows "2 hours", marked to be confirmed).
- Estimated wait calculation shown on the live queue card.
- Queue ticket format (A-14) and whether tickets are per doctor.
- Which fields vets can edit on pet records and how clinic-verified is displayed on shared passports.
- Reschedule flow screen, doctor schedule editor layout, calendar day/week styling.
- Dark palette values are PRD proposals; run WCAG AA checks in the design tool.
- Whether Arabic numerals should ever be offered (PRD default is Western digits).
- Fonts load from Google Fonts; provide files if offline bundling is needed.
- Deliverable is HTML UI kits, not a Figma file; no Figma tooling is available here.
