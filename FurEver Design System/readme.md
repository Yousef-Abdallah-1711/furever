# FurEver Design System

FurEver is a bilingual (Arabic RTL / English LTR) pet-care product for Egypt: an owner mobile app (Expo), and a web dashboard (Next.js) with a clinic portal and an admin portal, on one Supabase backend. Brand: warm, trustworthy, user-friendly, pet-centric, built on the rose palette from the existing case study. Light and dark themes are first-class.

**Source:** `uploads/FurEver - PRD (Mobile + Web Dashboard + Backend) (1).md` (sections 9, 10, 12 define screens and tokens). No Figma, codebase, logo, or illustrations were provided.

## Index
- `styles.css` imports `tokens/` (fonts, colors, typography, spacing, components.css).
- `components/core/`: Icon, Button, IconButton, Input, Chip, StatusBadge, Card, PhaseTag, Banner, Skeleton, EmptyState, Avatar, Rating.
- `components/domain/`: Stepper, SlotChip, PetCard, ClinicCard, ConfirmSheet.
- `ui_kits/mobile/`: owner app click-through (26 screens, AR/EN, light/dark, list states, Later-phase screens).
- `ui_kits/dashboard/`: clinic portal (Today, Live queue, Appointments, Services, Staff, Profile) and admin portal (Overview, Users, Clinics, Reference data, Broadcast, Flags, Audit, Later-phase stubs), with role switcher.
- `guidelines/screen-inventory.md`: every PRD screen with phase and design status.
- `guidelines/handoff.md`: decisions, assumptions, open questions.
- `guidelines/flows.card.html`: core flow map.
- `SKILL.md`: Agent Skill entry point.

## Components
Avatar, Banner, Button, Card, Chip, ClinicCard, ConfirmSheet, EmptyState, Icon, IconButton, Input, PetCard, PhaseTag, Rating, SlotChip, Skeleton, StatusBadge, Stepper. Intentional additions beyond the PRD UI kit list: Icon (wraps Lucide), PhaseTag (labels Later-phase screens). PRD kit items not yet built as components: PhoneInput, OtpInput, SearchBar, Select, DateField, CategoryCard (use Card tint), DoctorCard, ListRow, Toast, ScreenHeader (kit-local Header).

## CONTENT FUNDAMENTALS
- Friendly, short, second person. "Welcome to FurEver!", "The best care for your fur family."
- Sentence case for buttons and titles: **Get Started**, **I Have an Account**, **Book now**.
- Arabic is natural Egyptian colloquial in UI copy ("يلا نبدأ", "مش دلوقتي", "حصلت مشكلة"); legal text stays formal. Arabic uses "حيوانات أليفة / عيلتك الصغيرة" warmth, never literal translation.
- Errors say what happened and offer **Retry**. Destructive sheets name the item ("Delete Milo?").
- No emoji. No exclamation beyond welcome moments.
- Western digits 0-9 in both languages; phones, codes, prices, times stay LTR inside Arabic (`.ltr` wrapper). Times shown in Cairo time. Currency: "250 EGP".

## VISUAL FOUNDATIONS
- **Color:** rose primary #A96062 (dark #D08A8C), blush secondary #EEDAD7, screen gradient #DAB7B5 to #FBF6F5. Semantic success/warning/danger/info. Text secondary uses #6B6B6B for AA. Dark mode: lighter surfaces for depth, no shadows.
- **Type:** Inter (EN), Cairo (AR, about +1px, line-height 1.55). H1 24 bold, H2 20 semibold, H3 18 semibold, body 14, button 16 medium, caption 12.
- **Spacing:** 4-pt scale 4 to 48. **Radii:** 8 chips, 12 buttons/inputs, 16 cards, 24 sheets, full avatars.
- **Cards:** white surface, 16 radius, 1px border #E6D3D0, very soft rose-tinted shadow (none in dark). Category cards: #EEDAD7 fill with #A96062 border.
- **Backgrounds:** flat background plus a top rose gradient on Home, Welcome, Language. No patterns or textures. Imagery slots use striped placeholders until real pet photos exist; warm, natural-light photography is the intended direction.
- **Motion:** 150-250 ms ease-out; sheets and pages use platform defaults; disabled under reduced motion. Skeleton shimmer on loading.
- **States:** hover brightness .95; pressed scale .98 and brightness .9; focus 2px primary outline; disabled 50% opacity; loading spinner replaces icon.
- **Overlay:** 40% black light, 60% dark. No blur. Sheets rise from the bottom with a grab handle.
- **Layout:** 44pt touch targets; sticky primary CTA at screen bottom; dashboard sidebar is inline-start (right in Arabic).

## ICONOGRAPHY
Lucide, 24px default, 1.75 stroke look, loaded from CDN (lucide-static 0.469) as masks tinted with currentColor, per the PRD. No icon font, no emoji, no unicode glyph icons. Directional icons (back, chevrons, progress) take `flip` to mirror in RTL; phone, play, check, logos, stars, charts never mirror. **No logo was provided**: "FurEver" is set in bold Inter in primary color wherever a mark is needed. Illustrations are placeholders; please supply brand illustrations.

## Font note
Inter and Cairo are loaded from Google Fonts via `@import` (no local font files provided). Please share licensed font files if you want them bundled.
