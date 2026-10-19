# Plan to Link the FurEver Design to Spec Kit

Oct 18, 2026 · @Yousef Abdallah

I read the whole zip (98 files): the tokens, the 18 components with `.d.ts` and `.prompt.md`, the lint rules, and the guidelines, and I browsed the mobile and dashboard kit code. The kits are large, and I read their structure and parts of them, not every line.

## The most important fact: the design is a web mockup, not app code

This design is a web mockup, so it can't be copied into the app as-is — it has to be turned into a written contract before Spec Kit builds on it.

- The components are React-for-browser (`className`, `div`, CSS variables), so they can't be copied into Expo. They need to be **ported** with the same props.
- The tint colors are written with `color-mix()`, which doesn't work in React Native, so the generator has to compute them as fixed hex values for each theme.
- The text is inline in the form `t('English','Arabic')` with no translation keys.
- Many screens are "Built," but many others are "Spec" only (not yet designed).

## The three layers

"The plan runs off the design" means the design has to become a 3-layer contract.

| Layer | Action |
| --- | --- |
| Tokens | Copy `tokens/*.css` as-is into `design/system/`, and a script generates `packages/design-tokens` from it (Tailwind/NativeWind for mobile and CSS variables for web). If the design changes, we regenerate, so there's no drift. |
| Components | The `.d.ts` files are the contract (prop names and variants like `variant`, `size`, `block`, `loading`), the `.prompt.md` is for usage, and the `.jsx` is a visual reference. We make an RN version for mobile, and a shadcn-based panel with the same CSS variables for web. The `_adherence.oxlintrc.json` rules (no raw hex or px, and specific props only) get turned into a CI check. |
| Screens | Each screen gets a `design/screens/<ID>.md` file containing the route, its source in the kit, the states (loading, empty, error), the components, the translation keys, and the validation. Along with that, one `screen-map` table links the screen ID to the route, the kit file, the feature, and the task. |

There's also a script that pulls the `t('EN','AR')` pairs from the kits and produces `en.json` and `ar.json` with keys, so the agent never writes hard-coded text.

## Gaps that need closing before Spec Kit

- **Screens that are "Spec" only in Phase 1:** edit pet, add medical record, doctor screen, reschedule, the calendar and schedule editor, patients and reports in the clinic, user details and clinic creation in admin, and the side auth screens. These need to be designed, or written as "assemble it from components following the pattern of screen X."
- **10 missing components:** PhoneInput, OtpInput, SearchBar, Select, DateField, CategoryCard, DoctorCard, ListRow, Toast, ScreenHeader. These should be the first task before any screen, built from the local code in the kits.
- **Pending decisions in the handoff:** the queue ticket format (the design uses `A-14` per doctor, the PRD uses a plain number), the cancellation text and window (the kit uses two hours), how expected wait time is calculated, the lockout duration after 3 wrong OTP attempts, and what a doctor can edit and how "Verified" is shown.
- **Onboarding conflict:** `mobile-entry` merges adding a pet into onboarding, while the PRD keeps them separate. Need to decide which one is the source of truth.
- **Missing:** logo, icon, splash screen, illustrations, and font files. The Arabic text is a draft that needs review by a native speaker.
- **PRD sync:** the version in the zip may be older than the current one. We'll export the current version to `docs/PRD.md` and update the `text-secondary` value in it to `#6B6B6B`.

## What each Spec Kit command will take

Command names are as far as I know, so confirm them with `specify --help`.

| Command | Content |
| --- | --- |
| `/speckit.constitution` | The baseline: no raw hex or px allowed, must match the screen file, logical properties only, every screen with its four states, RLS and migrations only, and phases behind flags |
| `/speckit.specify` | A spec per sprint from the PRD (foundations, auth, pets, vaccinations, clinics, booking, queue, hardening), with every spec referencing screen IDs and user stories instead of describing the look |
| `/speckit.clarify` | The gaps above and the open questions in the PRD |
| `/speckit.plan` | A "Design contract" section with the mandatory paths, and the stack from section 5 of the PRD |
| `/speckit.tasks` | First tasks: tokens, then the UI kit, then translation/theme/RTL, then the screens — each task referencing its screen file |
| `/speckit.analyze` | Confirms every ID in the inventory has a task |
| `/speckit.implement` | An acceptance gate before a screen is considered done |

## A warning about visual comparison, and the next step

Pixel-by-pixel image comparison between an HTML mockup and a React Native app isn't realistic, so it's better to check the tokens and props structurally across all screens.

- **Dashboard:** compare close-up screenshots, since it's web.
- **Mobile:** side-by-side review across the four combinations (Arabic or English × light or dark).

**Next step:** I'll produce the extracted `design/` package (tokens, screen-map, screen files, and translation keys from the kits), and then ready-to-use Spec Kit command text in order. The decisions that need to be closed first: the approved onboarding flow and the queue ticket format.
