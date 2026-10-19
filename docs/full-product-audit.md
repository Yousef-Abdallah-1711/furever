# FurEver — Full Product Audit (read-only)

> **⚠ Historical snapshot — superseded.** This report describes the repository as it stood on **2026-10-18,
> before that day's sign-in method change and the documentation-sync pass that followed it**. Both of
> those happened later the same day. In particular: every mention of **Twilio**, **SMS/phone sign-in**,
> and the task numbers/counts cited throughout this report (`tasks.md`'s 380 tasks, D02's 79 tasks, etc.)
> reflect the **pre-change** state and are **no longer current**. The body below is left exactly as
> written and is **not updated** — treat it as a point-in-time record, not a live reference. For current
> state, read `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, and `tasks.md` directly.

**Date**: 2026-10-18. **Scope**: every statement below cites the file and section it came from, or says
"not found." Lines marked **Recommendation** are my judgment, not a fact from a file. Nothing in the repo
was modified to produce this report.

---

## 1. Inventory

### Files read

| File | Size | Last modified | Notes |
| --- | --- | --- | --- |
| `.specify/memory/constitution.md` | 10,233 B | 2026-10-18 04:33 | Version **1.1.0**, Ratified 2026-10-18, Last Amended 2026-10-18 (file's own footer) |
| `FurEver — PRD (Mobile + Web Dashboard + Backend) (1).md` (root) | 106,085 B | 2026-10-18 03:52 | The only PRD copy that exists on disk |
| `docs/PRD.md` | — | — | **Not found.** `plan.md` (Project Structure) and `tasks.md` (T010/T078) both describe this path as the canonical PRD location, to be populated by copying the root file and then amending it — neither step has happened yet. |
| `docs/future-phases.md` | 8,656 B | 2026-10-18 04:47 | Phase 2-4 content extracted from `spec.md` |
| `specs/001-furever-platform/spec.md` | 52,501 B | 2026-10-18 04:53 | |
| `specs/001-furever-platform/plan.md` | 37,494 B | 2026-10-18 17:18 | |
| `specs/001-furever-platform/research.md` | 15,891 B | 2026-10-18 05:11 | |
| `specs/001-furever-platform/data-model.md` | 14,086 B | 2026-10-18 05:13 | **Stale relative to `tasks.md`** — see §4 |
| `specs/001-furever-platform/contracts/rpc-functions.md` | 13,136 B | 2026-10-18 05:14 | **Stale relative to `tasks.md`** — see §4 |
| `specs/001-furever-platform/contracts/edge-functions.md` | 2,577 B | 2026-10-18 05:01 | |
| `specs/001-furever-platform/contracts/rest-endpoints.md` | 3,774 B | 2026-10-18 05:02 | |
| `specs/001-furever-platform/contracts/error-codes.md` | 1,456 B | 2026-10-18 05:02 | |
| `specs/001-furever-platform/quickstart.md` | 4,256 B | 2026-10-18 05:02 | |
| `specs/001-furever-platform/tasks.md` | 64,153 B | 2026-10-18 17:16 | |
| `specs/001-furever-platform/checklists/requirements.md` | 2,354 B | 2026-10-18 04:54 | 16/16 checked |
| `design/system/` | — | — | **Not found.** Still at the original path `FurEver Design System/` at the repo root; `plan.md` and `tasks.md` (T011) describe copying it to `design/system/`, which has not happened. |
| `FurEver Design System/readme.md`, `SKILL.md`, `styles.css`, `_adherence.oxlintrc.json`, `_ds_manifest.json`, `_ds_bundle.js` | 4,762 / 947 / 178 / 13,285 / 14,575 / 21,541 B | 2026-10-18 04:18 | |
| `FurEver Design System/guidelines/*.md`, `*.card.html` (9 files) | 1.0-4.9 KB each | 2026-10-18 04:18 | screen-inventory, handoff, entry-prototype-notes, flows, colors×2, spacing, type, rtl |
| `FurEver Design System/tokens/*.css` (4 files) | 178 B - 5.9 KB | 2026-10-18 04:18 | colors, components, fonts, spacing, typography |
| `FurEver Design System/components/{core,domain}/*` (18 components × 3 files) | 79 B - 2.9 KB each | 2026-10-18 04:18 | `.d.ts` + `.jsx` + `.prompt.md` per component |
| `FurEver Design System/ui_kits/mobile/*.babel` (6 files) | 3.3-18.5 KB | 2026-10-18 04:18 | kit-app, kit-auth, kit-booking, kit-home, kit-later, kit-shell |
| `FurEver Design System/ui_kits/mobile-entry/*.babel` (6 files) | 4.6-17.3 KB | 2026-10-18 04:18 | e-app, e-auth, e-core, e-home, e-onboard1, e-onboard2 |
| `FurEver Design System/ui_kits/dashboard/*.babel` (4 files) | 4.7-9.5 KB | 2026-10-18 04:18 | kit-admin, kit-app, kit-chrome, kit-clinic |
| `FurEver Design System/uploads/FurEver - PRD...md` | 106,085 B | 2026-10-18 04:18 | **Byte-identical** to the root PRD (same size) |

**Repo state fact**: `git status --short` shows no `backend/`, `mobile/`, `web/`, or `packages/` directory
exists anywhere in the repo. Every delivery-phase document (`plan.md`, `tasks.md`) describes work that has
**not started** — this audit is of planning artifacts only, not of running code.

### Counts

| Metric | Count | Source |
| --- | --- | --- |
| Constitution version | 1.1.0 | `.specify/memory/constitution.md` footer |
| User stories, Phase 1 | 59 | `spec.md` body (counted: AUTH×10, PET×9, CLN×3, BKG×6, QUE×3, REV×1, EMG×1, NTF×3, CS×10, AD×9, PLT×4) and `spec.md`'s own "Count check" lines |
| User stories, Phase 2-4 | 13 | `docs/future-phases.md` (SHP×4, COM×5, PAY×3, VID×1) |
| Functional requirements, Phase 1 | 59 numbered (FR-001 to FR-059; FR-060 intentionally removed, see §4) | `spec.md` |
| Functional requirements, Phase 2-4 | 13 (FR-061 to FR-073) | `docs/future-phases.md` |
| Key entities, Phase 1 | 18 | `spec.md` "Key Entities" section |
| Key entities, Phase 2-4 | 9 (Product, Order, Address, Listing, Match request, Conversation, Payment, Subscription, Video session) | `docs/future-phases.md` |
| Tables, Phase 1 (per `data-model.md`) | 26 | `data-model.md` (counted by section: 6 reference + 5 identity incl. `otp_attempts` + 4 pets/health + 9 clinics/booking + 3 platform — note: `tasks.md`'s later revision adds no new tables beyond these 26, only reorders creation order; see §4) |
| Enums, Phase 1 | 14 | `data-model.md` "Enums" table |
| RPC/function table rows, Phase 1 | 20 rows naming 23 distinct functions (one row bundles 3 RLS-helper functions; one row is a trigger) | `contracts/rpc-functions.md` |
| Edge Functions, Phase 1 | 8 (`app-config`, `verify-otp-guard`, `send-push`, `admin-create-staff`, `admin-set-user-status`, `admin-broadcast`, `delete-account`, `export-my-data`) | `contracts/edge-functions.md` |
| Cron jobs, Phase 1 | 3 named (`generate_vaccination_reminders`, `appointment_reminders`, `mark_no_shows`) + `send-push` itself is cron-invoked | `plan.md` D04/D06 deliverables, `contracts/rpc-functions.md` |
| Realtime channels | 3 (`queue:clinic:{id}`, `queue:doctor:{id}:{date}`, `notifications:{user_id}`) | `contracts/rest-endpoints.md` |
| Notification kinds | 7 (`vaccination_due`, `booking_confirmed`, `booking_reminder`, `queue_next`, `booking_cancelled`, `review_prompt`, `broadcast`) | `contracts/rest-endpoints.md` |
| Error codes | 13 | `contracts/error-codes.md` |
| Screens, Phase 1 | **70** per `plan.md`'s Coverage Table (owner mobile 41, clinic dashboard 12, admin dashboard 17); **spec.md's own Screen Coverage still lists 69** | `plan.md` "Screens (70/70 mapped — was 69...)"; `spec.md` Screen Coverage section — **unresolved mismatch, see §4** |
| Screens, Phase 2-4 | Not a clean count — `docs/future-phases.md`'s Screen Coverage uses consolidated rows (e.g. one row lists 7 sub-screens for Shop). Rows: 7 owner-mobile + 1 clinic + 3 admin = 11 rows, not 11 screens. | `docs/future-phases.md` |
| Tasks per delivery phase | D00: 80, D01: 39, D02: 79, D03: 16, D04: 29, D05: 33, D06: 37, D07: 39, D08: 28. **Total 380** (T001-T380, contiguous, no duplicates — mechanically verified) | `tasks.md` |
| Checklist (`requirements.md`) | 16/16 items checked | `specs/001-furever-platform/checklists/requirements.md` |
| Open Decisions remaining in `spec.md` | 6 numbered items (none marked `[NEEDS CLARIFICATION]` — all 3 original markers were resolved in the Clarifications session) | `spec.md` "Open Decisions" |
| Open Questions in `plan.md` | 2 (owner-reschedule-window assumption; the Setup Summary screen gap) | `plan.md` "Open Questions" |

### What matches across files, what doesn't

- **Matches**: 59 stories (spec.md ↔ plan.md ↔ tasks.md all agree); 380 tasks sum correctly in `tasks.md`'s
  own table; FR-001 to FR-059 Phase 1 / FR-061 to FR-073 Phase 2-4 split is consistent between `spec.md` and
  `docs/future-phases.md`.
- **Does not match**: screen count. `plan.md` says 70 (and explains why — the Setup Summary gap found
  during `tasks.md` generation). `spec.md`'s own Screen Coverage table was never edited to add that 70th
  row, so it still says 69. This is a known, explicitly-flagged gap (`plan.md` "Open Questions" item 1
  says so directly), not a silent error — but it means `spec.md` and `plan.md` currently disagree on a
  basic count.
- **Does not match**: `data-model.md` and `contracts/rpc-functions.md` do not reflect `tasks.md`'s most
  recent revision (the FK-order pass that moved `clinics`/`clinic_staff`/`audit_logs` into D02, and the new
  `write_audit_log()` generic mechanism). `plan.md`'s prose was updated for this; the two artifacts that
  should be the structural source of truth for the schema and the function contracts were not. Full detail
  in §4.

---

## 2. Product map by phase

### Phase 1 — Core

| Area | Stories | FRs | Entities/tables | Contracts | Screens (plan.md count) | Design status | Plan phase | Tasks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Account/onboarding | AUTH-01..10 | FR-001..010 | profiles, consents, push_tokens, otp_attempts, cities | `verify-otp-guard`, `admin-create-staff` (invite), `admin-set-user-status`, `delete-account`, `export-my-data`, `custom_access_token_hook` | 17 (incl. new Setup Summary) | Mostly Built (kit `mobile-entry`); a few Spec (Edit profile, Help, About, Legal, Force-update, Maintenance) | D02 | T120-T198 (79) |
| Pets/passport | PET-01..09 | FR-011..019 | pets, breeds, vaccinations, health_records, record_attachments, vaccine_types | `delete_pet` | 11 (4 in D03 + 7 in D04) | Mostly Built; Edit pet, Add record, Document viewer are Spec | D03/D04 | T199-T243 (45) |
| Clinics/booking/queue | CLN-01..03, BKG-01..06, QUE-01..03, REV-01, EMG-01 | FR-020..033 | clinics, doctors, services, doctor_schedules, schedule_exceptions, appointments, queue_tickets, reviews, specialties | `nearby_clinics`, `get_available_slots`, `book_appointment`, `cancel_appointment`, `reschedule_appointment`, `check_in_appointment`, `call_next_ticket`, `complete_appointment`, `get_queue_status`, `recompute_clinic_rating` (trigger); Realtime queue channels | 22 (11 in D05 + 11 in D06 + part of D07) | Booking steps/Clinics/Clinic detail/Emergency Built; Doctor, calendar views Spec | D05/D06/D07 | T244-T352 (109) |
| Notifications | NTF-01..03 | FR-034..036 | notifications, notification_outbox | `generate_vaccination_reminders`, `send-push` | 1 (Inbox) + cross-cutting | Built | D04 | within T215-T243 |
| Clinic staff ops | CS-01..10 | FR-037..046 | clinic_staff, doctors, services, doctor_schedules | `set_schedule_exception` | 11 across D02/D05/D07 | Services/Profile/Staff/Queue board Built; Patients, Doctors+schedule editor, Reports Spec | D02/D05/D07 | spread |
| Admin ops | AD-01..09 | FR-047..055 | audit_logs, feature_flags, app_config, reference tables | `set_clinic_status`, `admin_get_pet`, `admin_get_pet_timeline`, `admin-broadcast` | 17 across D02/D05/D06/D07 | Overview/Users/Clinics/Reference-data/Broadcast/Flags/Audit-log Built; detail views Spec | D02/D05/D06/D07 | spread |
| Platform/quality | PLT-01..04 (PLT-05 moved to constitution) | FR-056..059 (FR-060 removed, see §4) | — | `app-config` Edge Function | Splash, Force-update, Maintenance | Spec/Built mix | D02 build, D08 verify | T172, T187-T188, T353-T354 |

### What the design kits contain for Phase 2-4

Source: `FurEver Design System/ui_kits/mobile/kit-later.babel` (3,533 B, read in full) and
`FurEver Design System/ui_kits/dashboard/kit-admin.babel` (grepped for the locked-stub pattern).

- **Shop** (`Shop()` component, Built): tab header "Shop" with a cart icon badge; 4 category chips (Food,
  Litter, Toys, Care — first one active); one promo banner placeholder; a 2-column grid of 4 product cards
  (Cat food 2 kg · 420 EGP, Clumping litter · 180 EGP, Dog chew toy · 95 EGP, Shampoo · 140 EGP), each with
  an "Add to cart" button. A `<Tag/>` banner reading "Later phase · Not part of the MVP. Hidden until its
  feature flag is on." appears at the top. **Implied product rule**: prices shown as plain integers + "EGP"
  (consistent with the Phase 1 pattern already in `data-model.md`'s `price_minor`/`currency`).
- **Community / Adoption and Mating** (`Community()`, Built): header "Adoption and Mating"; two tabs
  (Adoption active, Mating); a "Verified only" filter chip with a shield icon; 2 listing cards (Luna · Cat ·
  1 year · Giza; Rex · Dog · 2 years · Cairo), each showing both a "Verified" and a "Vaccinated" status
  badge. **Implied product rule**: listings surface species, age, and city, and show vaccination status
  alongside verification — consistent with `docs/future-phases.md`'s COM-01 description, but the kit
  additionally implies the vaccination-status badge is shown on the listing card itself, which
  `docs/future-phases.md`'s text does not explicitly say.
- **Video pre-join** (`Prejoin()`, Built): header "Video consultation"; a camera-preview placeholder; a
  3-row checklist (Camera, Microphone, Network, each marked "OK"); a disabled primary button reading
  **"Join opens 10 min before"** (Arabic: "الدخول قبل الميعاد بـ 10 دقايق"). **Implied product rule**: a
  specific 10-minute pre-join window — this exact number does **not** appear anywhere in `docs/PRD.md`'s
  source text, `docs/future-phases.md`, or `spec.md`; it exists only in this kit file's copy.
- **Payments / Subscriptions**: **not found** as a distinct screen anywhere in the kit files searched
  (`kit-later.babel`, `kit-admin.babel`, `kit-clinic.babel`). The only Phase-4-payments-related UI the kit
  shows at all is the `PaymentMethodSelector` slot referenced in `spec.md`/`docs/future-phases.md`'s text,
  which is itself a Phase 1 booking-summary component, not a separate screen — **not found** as a built or
  spec'd screen in the design kit.
- **Admin locked stubs** (`kit-admin.babel`, `LaterPage({name, phase})`): a single generic, reused
  component — a lock icon, "Not part of the MVP," and "This screen ships in a later phase and stays hidden
  until its flag is on" — parameterized by `name`/`phase`. This is **not** three separately designed
  screens for Products/Orders, Listings, and Payments/Refunds; it is one placeholder pattern reused three
  times. The `Audit` screen's sample data row (`['17/10 17:05','super@furever.app','flag.update','shop_enabled']`,
  `['18/10 08:40','admin@furever.app','pet.read','Milo']`) is itself evidence the kit's own designer assumed
  admin pet reads are audited — consistent with what `tasks.md` later built (`admin_get_pet` → `audit_logs`).
- **Clinic dashboard, Phase 4**: `docs/future-phases.md`'s Screen Coverage lists `/clinic/payouts` and "the
  video schedule screen" for Phase 4. Searching `kit-clinic.babel` for "payout" or "video" returns **zero
  matches** — these two screens are named in the spec documents but **not found** anywhere in the actual
  design kit, not even as a locked stub (unlike the admin side, which does have a generic stub pattern for
  its three Phase 2-4 areas).

---

## 3. Information gaps for Phases 2-4

None of these are answered in any file read. Each row: options / trade-offs, **Recommendation** (my
default, not a fact), what it blocks, who should decide.

### Shop (Phase 2)

| Question | Options / trade-offs | Recommendation | Blocks | Decider |
| --- | --- | --- | --- | --- |
| Stock and fulfillment model | Clinic-fulfilled vs. FurEver-owned warehouse vs. drop-ship from suppliers | Start clinic-fulfilled (lowest capital, matches the existing clinic-partner relationship) | `products`/`inventory` schema, SHP-04 | Business |
| Delivery zones and fees | Flat fee, free-over-threshold, per-zone, courier-integrated | Flat fee by city, revisit after launch data | Checkout UX, `addresses` schema | Business |
| VAT and invoices | VAT-inclusive pricing (Egypt standard), per-order invoice generation, B2B invoicing | VAT-inclusive display; defer formal invoicing to a lawyer/accountant review | Pricing display, `orders` schema | Legal/Business |
| Returns and refunds | No returns (perishables-adjacent), time-boxed returns, exchange-only | Needs a lawyer/business call — Egyptian consumer-protection rules on returns are not something to default | PAY-02's scope overlap with shop refunds | Legal/Business |
| Product reviews | None, unmoderated, moderated like clinic reviews | Reuse the existing clinic-review moderation pattern (`is_hidden`, admin moderation) | SHP schema, admin screens | Product/Engineering |
| Promo codes | None at launch vs. a discount-code system from day one | Defer — not in any source document at all; treat as a Phase 2.1, not blocking Phase 2's MVP | Checkout RPC design | Business |

### Community — Adoption and Mating (Phase 3)

| Question | Options / trade-offs | Recommendation | Blocks | Decider |
| --- | --- | --- | --- | --- |
| Listing eligibility | Any pet vs. only pets with a complete passport (already stated: `docs/future-phases.md` COM-01 requires a complete passport + proof documents) | Already decided in `docs/future-phases.md` — no new decision needed here | — | — |
| Minimum age for mating listings | Not found anywhere | Needs a vet/business call (breed-specific maturity varies) | COM-01's validation rules | Business/Design |
| Listing fees | Free vs. paid listing vs. commission on successful adoption | Free at launch (adoption/rescue platforms typically don't charge); revisit for mating | Revenue model (already an open spec.md item) | Business |
| Listing expiry | Never expires vs. auto-expire after N days vs. manual renew | Auto-expire at 60-90 days with a renew action (prevents stale listings) | COM-01 schema | Product |
| Moderation SLA | Same-day, 48h, best-effort | Needs a staffing decision — the PRD doesn't say who moderates | COM-02's admin queue design | Business/Ops |
| Chat retention | Forever, time-boxed, deleted after listing closes | Needs a legal read given Egypt's PDPL (Law No. 151/2020) already flagged in `spec.md` → Launch readiness | COM-04 schema | Legal |
| Minors and safety | Age-gating who can list/request, identity verification depth | Needs a legal/safety call — adoption/mating platforms carry real-world safety risk (in-person meetups) | COM-01/COM-03 flow design | Legal/Business |

### Payments, refunds, payouts, subscriptions (Phase 4)

| Question | Options / trade-offs | Recommendation | Blocks | Decider |
| --- | --- | --- | --- | --- |
| Payment methods and gateway | PRD section 5 names Paymob or Fawry as candidates (`docs/PRD.md` source text, carried into the original PRD read) | Needs a direct cost/integration comparison — not decidable from documents alone | PAY-01 schema, `payments` table design | Business/Engineering |
| Who pays commission | Owner, clinic, or split | Needs the same revenue-model decision already open in `spec.md`'s Open Decisions (item 7, revenue model) | PAY-01/PAY-02 | Business |
| Payout schedule to clinics | Weekly, bi-weekly, monthly, on-demand | Weekly, consistent with typical marketplace norms — not sourced from any file, a clean-slate recommendation | `/clinic/payouts` screen (which doesn't exist in the design kit at all — see §2) | Business |
| Failed-payment rules | Retry, cancel booking, hold slot briefly then release | Hold the slot for a short grace window then release — mirrors the existing `SLOT_IN_PAST`/idempotency patterns already in Phase 1 | PAY-01 RPC design | Product/Engineering |
| Subscription intervals (auto-delivery) | Weekly/bi-weekly/monthly, fixed vs. owner-adjustable | Owner-adjustable within a fixed set (weekly/bi-weekly/monthly) — the PRD text (section on Phase 4) only says "choose an interval" without listing allowed values | PAY-03 schema | Product |
| Refund rules (shop vs. booking) | Full-only, partial, store-credit option | Needs the legal/business call above (shared with Shop's returns question) | PAY-02 | Legal/Business |

### Video (Phase 4)

| Question | Options / trade-offs | Recommendation | Blocks | Decider |
| --- | --- | --- | --- | --- |
| Video provider | Twilio Video, Agora, Daily.co, WebRTC self-hosted | Needs a cost/compliance comparison — not in any document | VID-01 Edge Function design (`video-create-room`, `video-token` — reserved names only, `contracts/edge-functions.md`) | Engineering/Business |
| Join window | **The design kit says 10 minutes before** (`kit-later.babel`, see §2) — no spec document states this | Adopt the kit's 10-minute figure as the working default since it's the only sourced number that exists | VID-01 acceptance criteria | Product (confirm the kit's number is intentional, not a placeholder) |
| Recording | Recorded (liability/quality) vs. never recorded (privacy) | Needs a legal call — recording a medical consultation has consent implications under Egypt's PDPL | VID-01 data model (would need a `video_sessions.recording_path` column, not currently planned anywhere) | Legal |
| Emergency use | Can a video consult ever substitute for the in-person emergency directory (EMG-01)? | No — keep video and the emergency directory fully separate; emergencies need in-person care | Product messaging, not a schema blocker | Product |
| Refunds on no-show/drop | Doctor no-show, owner no-show, technical failure — each needs a different rule | Needs the same payment-refund decision above; no default recommended without the payment gateway chosen first | PAY-02/VID-01 interaction | Business |

### Egypt-specific legal/compliance questions (for a lawyer — not answered here)

- Egypt's Personal Data Protection Law (Law No. 151 of 2020): is a non-Egyptian Supabase region acceptable
  for cross-border storage of health data (pets) and personal data (owners)? (Already flagged in `spec.md`
  → Launch readiness, carried here because it also affects Phase 3's chat retention and Phase 4's video
  recording.)
- Consumer protection rules for Shop returns/refunds and for marketplace commission disclosure.
- Any licensing requirement for listing veterinary services for booking (already a Phase 1 open item in
  `spec.md` Open Decisions, item 11 implicitly — doctor verification is not decided).
- Age-of-majority and safety requirements for Community listings involving in-person meetups.
- Recording-consent requirements for Phase 4 video consultations.

---

## 4. Conflicts and inconsistencies

Each row: the conflict, the exact locations, and which source wins under the constitution's precedence
rule (Constitution > PRD > design, per `.specify/memory/constitution.md` "Precedence and Source of Truth").

| # | Conflict | Locations | Winner under precedence |
| --- | --- | --- | --- |
| 1 | Screen count: 69 vs. 70 | `spec.md` Screen Coverage (69, unedited) vs. `plan.md` Coverage Table ("70/70... was 69") | Neither is "the constitution" — this is a spec-vs-plan gap, not a precedence case. `plan.md`'s Open Questions item 1 already documents the fix needed: `spec.md` should gain the Setup Summary row. Until then, **`spec.md` is stale** on this specific count. |
| 2 | `audit_logs`, `clinics`, `clinic_staff` creation phase | `data-model.md` (no phase annotation, implicitly described in the original PRD-table style as belonging wherever `plan.md` D05/D07 used to put them) vs. `contracts/rpc-functions.md` (still describes `admin_get_pet`/`admin_get_pet_timeline` as writing "its own `audit_logs` row," with no mention of a shared helper) vs. `tasks.md` (latest revision: these three tables move to D02, plus a new `write_audit_log()` function, plus triggers on `feature_flags`/`app_config`/reference tables) vs. `plan.md` (prose updated to match `tasks.md`) | `tasks.md` + `plan.md`'s updated prose are the newer, more specific source. `data-model.md` and `contracts/rpc-functions.md` were **not updated** in the same pass and are now **stale** — they don't mention `write_audit_log()` at all, and don't show the FK-driven creation-order fix. |
| 3 | `clinics` table shape | `data-model.md` describes one `clinics` row with the full column list (location, hours, media, rating — everything) as if created once. `tasks.md`'s latest revision splits this into a "slim" D02 creation + a D05 "extends" step. `data-model.md` was not split to match. | `tasks.md`/`plan.md` (newer); `data-model.md` is stale on this specific table's creation sequencing (its column list is still accurate as an end-state, just not phase-split). |
| 4 | Table/column creation order for `breeds`/`pets`, `vaccine_types`/`vaccinations`, `specialties`/`doctors` | `data-model.md` lists these without an explicit creation order; `tasks.md`'s first revision had `pets` before `breeds` and `vaccinations` before `vaccine_types` and `doctors` before `specialties` (all FK-backwards); the latest `tasks.md` revision fixed the order. `plan.md`'s "Table creation order" note (end of `tasks.md`, informally referenced from `plan.md`) documents the fix. | `tasks.md` (latest revision) is correct; this is resolved, just not mirrored into `data-model.md`'s own prose. |
| 5 | PLT-05 and FR-060 | `spec.md` explicitly removed both ("moved to constitution") in an earlier revision — the constitution's Quality Gates/Engineering Standards principles now own CI/merge-gate content. | Correctly resolved already; constitution wins, as designed. No open issue — listed here only because a naive count of "FR-001 to FR-073" would wrongly expect FR-060 to exist. |
| 6 | PRD staleness on 9 named points | `plan.md`'s "PRD amendments" section lists 9 specific items (queue ticket shape, `#6B6B6B` vs `#737373`, verification lockout, cancellation policy, onboarding flow, Apple sign-in platform, design-system-as-source-of-truth, clinic-verified edit rights, Phase 4 hooks) where the root PRD file is out of date relative to `spec.md`'s Clarifications and `plan.md`'s own decisions. | Constitution's precedence rule puts the Constitution and `spec.md`/`plan.md` ahead of the PRD for behavior/data — these 9 points are correctly treated as amendments, not bugs. The problem is operational: `docs/PRD.md` (the file meant to carry the amended text) **does not exist yet** (`tasks.md` T010/T078 describe creating and then amending it; neither has run). |
| 7 | `/clinic/payouts` and the video schedule screen | Named in `docs/future-phases.md`'s Screen Coverage and in `plan.md`'s Delivery Phase D07/elsewhere, but **not found** anywhere in `FurEver Design System/ui_kits/dashboard/kit-clinic.babel` — not Built, not a locked stub (unlike the admin side, which does have a generic `LaterPage` stub for its three Phase 2-4 areas). | Design is silent here, not conflicting — but it means these two screens have **zero design reference** to build from when Phase 4 starts, unlike every other Phase 2-4 screen which at least has a locked-stub placeholder. |
| 8 | 10-minute video join window | Appears only in `kit-later.babel`'s `Prejoin()` copy string; absent from the root PRD text, `spec.md`, and `docs/future-phases.md`. | Not a conflict between sources that disagree — a fact that exists in exactly one source and nowhere else. Flagged in §3 as a product question to confirm, not override. |
| 9 | Security-mode documentation drift | `contracts/rpc-functions.md`'s header still says "validated against the same Zod schemas... security mode is stated explicitly per function below" and does document `security definer`/`security invoker` per function — this part is accurate and current. The drift is narrower than "the whole file is wrong": only the **new functions from the latest `tasks.md` revision** (`write_audit_log`, the audit triggers) are the ones missing from this file. | `tasks.md` is ahead; `contracts/rpc-functions.md` needs the same functions added, not a full rewrite. |

**Recommendation**: before `/speckit-tasks` generates D02's actual implementation tasks are executed, run
a short sync pass updating `data-model.md` and `contracts/rpc-functions.md` to match `tasks.md`'s latest
revision (write_audit_log, the triggers, the clinics/clinic_staff/audit_logs phase move, the creation-order
fix) — otherwise the two documents that are supposed to be the schema/contract source of truth will
silently diverge further from the task list that will actually get implemented.

---

## 5. Tasks assessment

| Phase | Tasks | Categories present | Missing / too coarse | Ordering/dependency problems found | Manual/human tasks |
| --- | --- | --- | --- | --- | --- |
| D00 | 80 | repo tooling, backend init, packages/tokens/i18n, design extraction, app shells/RTL/observability, Docker, CI/docs | None found | None found — this phase was not touched by the later FK-order pass and has no table-creation tasks of its own (only a rollback-scoped test fixture) | 10 items in the end-of-D00g manual-prerequisites checklist, several explicitly marked "blocks D02" |
| D01 | 39 | component ports (consolidated 1 task/component across both platforms — a disclosed simplification, not an oversight), dashboard shell, gallery, prop-drift check | None found | None found | None |
| D02 | 79 | migrations (now FK-ordered), audit mechanism, RPCs, Edge Functions, Supabase clients, route guards, onboarding orchestration, screens (23), E2E | None found after the FK-order pass | Resolved in the latest revision (was the single biggest source of problems before this audit — clinics/clinic_staff/audit_logs forward-referenced, cities-after-profiles) | EAS dev build (T166) depends on manual EAS account setup; Twilio/OAuth/SMTP/push-credential prerequisites all gate this phase |
| D03 | 16 | migrations, shared attachment components, pgTAP, screens, E2E | **Too coarse**: `tasks.md` itself notes T214 bundles an E2E task and the phase Checkpoint into one line — functionally fine (both conditions are stated), but it is the one task in the file that doesn't follow the "one concern each" rule as cleanly as every other Checkpoint | breeds-before-pets fixed | None |
| D04 | 29 | migrations (vaccine_types-before-vaccinations fixed), push registration, notification routing, passport-share generation, pgTAP, screens | None found | Fixed in latest revision | Push credentials (FCM/APNs) gate T223 specifically, not the whole phase |
| D05 | 33 | migrations (specialties-before-doctors fixed, clinics now "extends" not "creates"), RPCs, pgTAP (incl. new reference-data audit-trigger test), demo seed data, screens, E2E | None found | Fixed in latest revision | None beyond D00's checklist |
| D06 | 37 | blocking reschedule-rule confirmation (T277), migrations, RPCs, cross-phase extensions (delete_pet, set_clinic_status, set_schedule_exception), pgTAP (incl. the new direct-write-revoked test), screens, E2E | None found | **T277 is itself a dependency-order item**: it's a human decision gating T282 (`reschedule_appointment`), correctly sequenced first in the phase — this is working as intended, not a problem, but worth tracking since no automated check can confirm T277 was actually resolved correctly | T277 (reschedule-rule decision) is a human decision, not a mechanical task |
| D07 | 39 | RPCs incl. QR check-in validation, Realtime channels, rating trigger, admin audit RPCs, pgTAP (incl. the new hidden-review visibility test), screens, E2E/load | `audit_logs` creation correctly removed (moved to D02) — this phase's tasks correctly say "already exists from D02" | None found | None beyond D00's checklist |
| D08 | 28 | platform verification, accessibility (5), performance (8), k6 (3), security review (4), store readiness (3), PITR, beta | None — this phase was explicitly split from 10 to 28 tasks per the one-target-per-task instruction and is now the most granular phase in the file | None found | Store accounts, pilot-clinic agreements (business-side, not code) |

**Standing CI gate**: T168 (`check-policy-coverage.ts`, created in D02) is described in `tasks.md` as "a
standing CI gate from here through D08" — meaning every later phase's Checkpoint implicitly depends on it
continuing to pass, but no later phase's Checkpoint text explicitly re-states that dependency. **Not a
bug**, but worth knowing: if a later phase adds an RLS policy without a matching pgTAP test, T168's gate is
what catches it, not that phase's own named Checkpoint wording.

**Overall**: the FK/ordering problems that would have been the most serious finding in this section were
already identified and fixed in the most recent `tasks.md` revision (per its own "this revision's fixes"
note at the top of the file). What remains incomplete is the **documentation sync** described in §4, not
the task sequencing itself.

---

## 6. External dependencies and costs

From `tasks.md`'s manual-prerequisites checklists (D00g, D02, D08) and `research.md`. No prices are stated
in any source document — none are invented here.

| Dependency | Needed for | Blocks | Cost driver (qualitative, source-stated only) |
| --- | --- | --- | --- |
| Expo/EAS account + org | Dev builds (Google/Apple sign-in need a native build, not Expo Go) | D02 | EAS has paid build-minute tiers — `tasks.md` doesn't state a price, only that EAS Build is "mandatory for any iOS binary" (`plan.md` Technical Context) |
| Supabase staging + production projects | Real environments beyond local | D08 cutover | Supabase project tiers scale with compute/storage — not quantified in any source |
| Twilio Verify (Egypt Geo Permission = Allow) | Phone OTP delivery | D02 | Per-verification SMS cost — `research.md` §4 flags Twilio's fraud-prevention posture changes but states no price |
| Google Cloud OAuth clients (Web/Android/iOS) | AUTH-02 | D02 | No direct cost noted |
| Apple Developer account + SIWA | AUTH-03 | D02 | Apple Developer Program has an annual fee — not stated in any source document |
| Google Play Console account | Store submission | D08 | One-time registration fee — not stated in any source |
| Supabase SMTP/email provider | Staff invite emails, password reset | D02 (T137, T164) | Not quantified |
| Push credentials (FCM, APNs) | Push notifications | D04 (T223) | Not quantified |
| Sentry + PostHog projects | Observability, product analytics | D02 (functionally; tests need *some* key present) | Both have free tiers at low volume — not quantified beyond that in any source |
| GitHub repo secrets (all of the above + Supabase service-role keys per environment) | Real CI runs | D00g | N/A (no direct cost, just setup) |
| 2-3 pilot clinics (business agreement, not a technical dependency) | D08 beta | D08 | Not a cost in the technical sense — a business relationship `tasks.md`/`plan.md` both note as a manual prerequisite |

**Not found anywhere**: a payment gateway account (Paymob/Fawry, named only as PRD-text candidates), a
video provider account, or an SMS-aggregator fallback account (mentioned as a documented fallback option in
`research.md` §4 if Twilio's Egypt pricing/delivery is unacceptable) — none of these are set up or costed
in any source, consistent with them being Phase 4/contingency items, not Phase 1 blockers.

---

## 7. Scope options

| | Option A — Phase 1 only | Option B — Phase 1 + Shop | Option C — all four phases |
| --- | --- | --- | --- |
| **Already specified** | Full: 59 stories, 59 FRs, 26 tables, 70 screens (one gap, §4), 20 RPC rows, 8 Edge Functions, 380 tasks across D00-D08 | Phase 1 fully specified; Shop has 4 stories/4 FRs/3 entities in `docs/future-phases.md`, but no data model, no RPC contracts, no delivery-phase tasks, no screen-by-screen Spec/Built breakdown beyond the kit's one Built "Shop home" screen | Same as B, plus Community (5 stories) and Payments/Video (4 stories) at the same shallow `docs/future-phases.md` depth — no data model, no contracts, no tasks for any of them |
| **Still needs decisions** | The 6 remaining Open Decisions in `spec.md` + 2 Open Questions in `plan.md` (reschedule rule, Setup Summary) + the §4 documentation-sync gap | Everything in A, plus every Shop question in §3 (stock model, delivery zones, VAT, returns, reviews, promo codes) | Everything in B, plus every Community/Payments/Video question in §3, plus all Egypt legal questions listed |
| **Must be added to spec/plan/tasks** | Nothing new — just the sync work already identified | A full `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` pass for Shop: data model, RPC contracts, screen coverage (the kit has only 1 of ~8 Shop screens Built), delivery-phase slotting | The same full pass for Community and Payments/Video on top of B — video in particular has zero schema work done anywhere (no `video_sessions` table exists even as a stub in `data-model.md`, only the enum value and the reserved function names) |
| **Rough size** | — (already built out; remaining work is documentation sync + actual implementation of the 380 tasks) | **M** — Shop's product questions (§3) are the most self-contained of the three later phases, and the kit already has real screens/copy to port from, but the data model and 8-ish screens are entirely unbuilt | **L** — Community and Payments/Video each carry real legal/compliance open questions (safety, recording consent, payment licensing) that Shop doesn't, on top of the same unbuilt-schema problem, multiplied across three feature areas |
| **Main risks** | Documentation drift (§4) if the sync doesn't happen before implementation starts | Shop's returns/refunds/VAT questions are genuinely legal, not just product — risk of building the wrong checkout flow before that's answered | Community's safety/moderation and Payments' gateway/licensing questions are higher-stakes than Shop's; Video has the thinnest design coverage of all four areas (one screen, no payouts/schedule screen even as a stub) |

**Video as a reserved hook vs. a separate feature vs. dropped**: `docs/future-phases.md` and the
constitution (VI) already treat it as a reserved-but-inert hook (enum value, function-name reservations, a
`video_enabled` flag defaulting false) layered into Phase 1's own tables — this costs almost nothing in
Phase 1 (a few inert columns/enum values) and is already paid for. **Recommendation**: keep it a reserved
hook through Phase 1-3, and treat "build it" as its own fifth decision point once Payments (which it
depends on for monetizing a consult) is actually underway — not because video is low-value, but because its
design coverage is the thinnest of the four later areas (§2) and its legal question (recording consent) is
unresolved, so committing engineering time to it before Payments exists would be building on an
unconfirmed foundation twice.

---

## 8. Recommended next steps, in order

1. **Documentation sync** (§4): update `data-model.md` and `contracts/rpc-functions.md` to match
   `tasks.md`'s latest revision (`write_audit_log()`, the audit triggers, the clinics/clinic_staff/
   audit_logs phase move, the creation-order fix). Low effort, prevents the drift from compounding once D02
   implementation actually starts.
2. **Resolve `plan.md`'s 2 Open Questions** (reschedule rule, Setup Summary) — both are already scoped as
   blocking a specific task (T277, and the `spec.md` row that still needs adding for Setup Summary).
3. **Place `docs/PRD.md` and `design/system/`** at their canonical paths (currently missing — `tasks.md`
   T010/T011/T078 describe this but it hasn't run) before D00 execution actually starts, since multiple
   later documents already assume those paths exist.
4. **Decide Phase 1 vs. B vs. C scope** (§7) — this is the highest-leverage decision outstanding, since it
   determines whether any Shop/Community/Payments/Video specification work should start at all right now,
   or wait until Phase 1 ships.
5. **If B or C is chosen**: route every unresolved product question in §3 to its named decider before
   running `/speckit-specify` on that phase — specifying against an unanswered legal question (returns,
   recording consent, minors/safety) would produce a spec that has to be redone.
6. **Begin D00 execution** (if Option A, or in parallel with the scope decision) — this is pure
   infrastructure work that doesn't depend on any of the open product questions.

### Ranked by what they block

| Rank | Decision | Blocks |
| --- | --- | --- |
| 1 | Scope: A, B, or C | Whether any `/speckit-specify` work on Phase 2-4 should happen at all |
| 2 | Reschedule-rule confirmation (`plan.md` Open Questions #2) | D06's `reschedule_appointment` task (T277→T282) |
| 3 | Revenue model (`spec.md` Open Decisions item 3) | Phase 4's entire payment design, and Shop/Community's fee questions in §3 |
| 4 | Clinic onboarding model (`spec.md` Open Decisions item 1) | Whether a self-service clinic-application flow needs to be added to AD-02's scope |
| 5 | Documentation sync (§4) | Nothing blocks *starting* implementation, but risk compounds the longer it's deferred |
| 6 | Egypt legal review (PDPL region, Community safety, video recording consent) | Launch readiness (Phase 1) and all of Phase 3/4's specification work |

---

## Open decisions checklist

- [ ] Scope: Phase 1 only / Phase 1 + Shop / all four phases.
  Decision: _______________________________________________

- [ ] Owner reschedule window: same 2-hour rule as cancellation, or different.
  Decision: _______________________________________________

- [ ] Add the Setup Summary screen row to `spec.md`'s Screen Coverage (currently only in `plan.md`).
  Decision: _______________________________________________

- [ ] Revenue model (commission / subscription / shop margin / mix).
  Decision: _______________________________________________

- [ ] Clinic onboarding model (admin-created only, or self-service application allowed).
  Decision: _______________________________________________

- [ ] Shop: stock/fulfillment model.
  Decision: _______________________________________________

- [ ] Shop: returns/refunds/VAT approach (needs legal input).
  Decision: _______________________________________________

- [ ] Community: moderation staffing/SLA.
  Decision: _______________________________________________

- [ ] Community: chat retention period (needs legal input re: PDPL).
  Decision: _______________________________________________

- [ ] Community: minors/safety policy for in-person meetups (needs legal input).
  Decision: _______________________________________________

- [ ] Payments: gateway choice (Paymob vs. Fawry vs. other).
  Decision: _______________________________________________

- [ ] Payments: payout schedule to clinics.
  Decision: _______________________________________________

- [ ] Video: provider choice.
  Decision: _______________________________________________

- [ ] Video: confirm or change the kit's 10-minute join-window default.
  Decision: _______________________________________________

- [ ] Video: recording policy (needs legal input re: consent).
  Decision: _______________________________________________

- [ ] Video: keep as reserved hook / promote to active feature / drop — and when to revisit.
  Decision: _______________________________________________

- [ ] Supabase data region vs. Egypt PDPL cross-border storage (needs legal input).
  Decision: _______________________________________________

- [ ] Documentation sync: who/when updates `data-model.md` + `contracts/rpc-functions.md` to match
  `tasks.md`.
  Decision: _______________________________________________
