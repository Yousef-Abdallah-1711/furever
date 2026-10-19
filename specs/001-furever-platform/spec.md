# Feature Specification: FurEver Platform

**Feature Branch**: `001-furever-platform`

**Created**: 2026-10-18

**Status**: Draft

**Input**: User description: "Feature: FurEver Platform, the complete product specification. Write ONE umbrella
specification for the whole FurEver product, covering every screen, role, and user story across all four
phases. Phase 1 is built now; Phases 2-4 are fully specified but ship dark behind flags and MUST NOT be built
or routed until their phase starts (constitution VI). Sources: docs/PRD.md and design/system/ (screen
inventory, handoff notes, entry-prototype notes, UI kits) plus .specify/memory/constitution.md. Includes
priorities (P1/P2/P3), all user story IDs with Given/When/Then acceptance scenarios, a Screen coverage
section, functional requirements, key entities, edge cases, success criteria, out-of-scope items, and an
Open Decisions section (at most 3 marked NEEDS CLARIFICATION)."

FurEver is a bilingual (Arabic RTL / English LTR) pet-care product for Egypt, light and dark themes
throughout: a mobile app for pet owners, a web dashboard with a clinic portal and an admin portal, and one
shared backend. Owners keep a digital health passport per pet, get vaccination reminders, find clinics, book
appointments, follow a live queue, reach emergency clinics, and review visits. Clinics run their schedule,
services, and queue. Admins onboard clinics and operate the platform. Only Phase 1 is built now; Phases 2-4
are specified here so later work is additive, not a redesign.

## Clarifications

### Session 2026-10-18

- Q: What is the final cancellation policy text and window for BKG-04? → A: Free cancellation until 2 hours
  before the visit; after that the Cancel button is replaced by a message and a Call clinic button
  ("Free cancellation is available until 2 hours before your visit. After that, please call the clinic.");
  Arabic wording is draft pending native review. A clinic may cancel at any time with a required reason,
  and the owner is notified.
- Q: What is the lockout rule after repeated wrong verification codes for AUTH-01? → A: After 5 wrong
  attempts on a code, that code is cancelled and the user must request a new one (available after the
  60-second resend wait). After 3 cancelled codes within 60 minutes for the same phone number, that number
  is locked for 15 minutes with a clear message and the unlock time. The lock is scoped per phone number.
  The exact limits must be checked against the chosen authentication provider's supported capabilities
  during planning. **Superseded 2026-10-18** (see "Sign-in method change" below) — the 5-attempt /
  3-cancellation / 15-minute shape is unchanged, but the identifier is now the email address, not a phone
  number; this entry is kept for history, not as the current rule.
- Q: How is the estimated wait on the live queue card (QUE-02) calculated? → A: People ahead of the owner in
  that doctor's queue, multiplied by the average duration of their booked services, shown as a rounded
  range in minutes (e.g., "about 15 to 25 minutes"). If nobody is ahead, show "You are next." If the
  calculation is not possible, show only the number of people ahead. Never show an exact minute count.
- Q: Who can edit clinic-verified records and how are they labeled (PET-09, CS-08)? → A: Clinic vets and
  managers can add records/vaccinations only for pets with an appointment at their clinic, and can edit
  only entries their own clinic created. Owners cannot edit clinic entries; clinics cannot edit owner
  entries. Clinic entries display "Verified by <clinic name>" with the date; owner entries display
  "Added by you"; shared passports use the same labels.
- Q: Is Sign in with Apple shown on Android? → A: No — shown on iOS only, hidden entirely on Android.

### Documentation sync, 2026-10-18

- Note (not a Q&A — a discovered gap, closed): the mobile-entry design kit's onboarding flow includes a
  review-your-setup **Setup Summary** screen (`e-onboard2.babel`'s `Summary()`, between the health-passport
  step and the Permissions primer) that had no row in this spec's Screen Coverage. Added as
  `/onboarding/summary`, Phase 1, Built, serving AUTH-01 (it is part of the onboarding sequence) and PET-01
  (it displays the pet step's entered data with an Edit-and-return action). Screen Coverage's owner-mobile
  total is now 41 (was 40); the Phase 1 total across all three portals is now 70 (was 69).

### Sign-in method change, 2026-10-18

- Q: What replaces phone/SMS sign-in for owners? → A: Google (all platforms), email with a 6-digit code
  (all platforms), and Sign in with Apple (iOS only, unchanged). Phone/SMS sign-in is removed from Phase 1
  entirely. Dashboard sign-in for clinic staff and admins is unaffected — it stays email + password, with
  TOTP for admins.
- Q: How does the email-code flow work? → A: the owner enters an email address, the app requests a code, an
  email containing a typed 6-digit code is sent through a custom SMTP provider, and the owner types that
  code into the app — no magic link, no deep link. Code expiry is 10 minutes (a configurable default, not
  a hard constraint). Resend is available after 60 seconds.
- Q: What is the lockout rule under the new identifier? → A: unchanged in shape from the superseded phone
  rule above, but keyed by email address instead of phone number: 5 wrong attempts on one code cancel that
  code (a new code is required, after the 60-second resend wait); 3 cancelled codes within 60 minutes for
  the same email address lock that address for 15 minutes with the unlock time shown. Sending codes is
  additionally throttled per email address and per IP address, and the send-code response is identical
  whether or not the email already has an account, so a sender cannot enumerate which emails are
  registered.
- Q: What happens to the phone number field? → A: it becomes an optional, unverified contact field on the
  profile (Complete profile and Edit profile), keeping the existing Egyptian-number validation for that
  field only. Clinic staff still see it only for owners with an appointment at their clinic (unchanged
  visibility rule). Whether a phone number should be required at booking time is a new Open Decision below.
- Q: How does account linking work now? → A: the same verified email across the email-code method and
  Google resolves to one account (Supabase Auth's automatic-linking behavior for a verified email shared
  across providers — confirm the exact mechanics in `research.md`). Apple's private-relay email is a
  separate identity from a real Gmail/other address, even if a person "is" the same human — Apple does not
  share the real address, so no automatic link to it is possible. AUTH-06 now links Google or email instead
  of phone.

## User Scenarios & Testing *(mandatory)*

Priority tiers (per the request): **P1** = the end-to-end booking journey (AUTH-01/02/03/04/05; PET-01/04/07;
CLN-01/02/03; BKG-01 to 05; QUE-01 to 03; CS-01 to 07; AD-01/02/04; PLT-01). **P2** = every other Phase 1
story. Phase 2-4 stories are specified separately in `docs/future-phases.md` and are not part of this
spec's P1/P2 scope — see "Later phases" below. Every story is accepted only once it works in Arabic and
English, light and dark (constitution II).

### Epic A — Account and onboarding (owner) · Phase 1

**Why this priority**: Nobody reaches a pet, a clinic, or a booking without an account. AUTH-01 to 05 are P1
because they gate the entire booking journey; AUTH-06 to 10 are P2 account-management stories that matter but
don't block the first booking.

**Independent Test**: A new email address can go from Welcome to a completed profile and land on Home
without touching any other epic.

- **AUTH-01** (P1) — Email sign-in with a code. **Given** a new or returning owner enters their email
  address, **When** they request a code, **Then** a 6-digit code is emailed and a session/profile is
  created (or the existing account is found) once the code is entered correctly, continuing to Complete
  Profile (new accounts) or Home (existing accounts). **Given** the code is wrong, **When** they submit it,
  **Then** an inline error allows retry; **Given** 5 wrong attempts on the same code, **When** the 5th
  wrong attempt is submitted, **Then** that code is cancelled and the user must request a new one
  (available after the 60-second resend wait). **Given** 3 codes are cancelled this way within 60 minutes
  for the same email address, **When** the 3rd cancellation happens, **Then** that email address is locked
  for 15 minutes with a clear message stating the unlock time.
  **Enforcement note (added 2026-10-19, `/speckit-analyze` finding C2)**: this lockout guarantee holds
  for a client that goes through `verify-otp-guard` as intended. Supabase Auth's own email-OTP endpoints
  are reachable directly with the project's (non-secret) anon key, so the guarantee is **fully enforced
  only once** the guard-enforceability decision in `research.md` section 17 is made and built (`tasks.md`
  T120/T138/T139). Until then, treat it as guaranteed for compliant clients, not as a security boundary —
  see Open Decisions item 12.
- **AUTH-02** (P1) — Google sign-in. **Given** an owner taps Continue with Google, **When** they pick an
  account, **Then** a session and profile exist on success. **Given** they cancel the picker, **When** they
  return, **Then** Sign in is shown with no error toast.
- **AUTH-03** (P1) — Apple sign-in (iOS only). **Given** an iOS build, **When** the owner continues with
  Apple, **Then** the name shared on first sign-in is saved and a hidden (private-relay) email is accepted
  as the account's email. **Given** an Android build, **When** Sign in is shown, **Then** the Apple option
  does not appear at all.
- **AUTH-04** (P1) — Complete profile. **Given** a session with no completed profile, **When** the owner
  submits name, city, and Terms/Privacy acceptance, **Then** the profile is saved with the acceptance version
  and time, and Home becomes reachable; **When** name or city is missing, **Then** Home stays unreachable.
  **Given** the owner also enters a phone number, **When** it doesn't match the Egyptian format, **Then**
  an inline error blocks saving that field only — the phone number itself is optional and never blocks
  reaching Home.
- **AUTH-05** (P1) — Language and theme. **Given** an owner picks Arabic or English, **When** the choice is
  made, **Then** layout direction flips, the choice persists across launches, and no screen shows mixed
  direction. **Given** a theme choice, **When** set, **Then** it follows the system by default or can be
  forced to light/dark.
- **AUTH-06** (P2) — Link sign-in methods. **Given** a signed-in owner, **When** they link Google or add an
  email/code sign-in to a Google-only account (or vice versa), **Then** the identity attaches to the same
  account and a second account is never created; a conflicting identity shows a clear message.
- **AUTH-07** (P2) — Log out. **Given** a signed-in owner, **When** they log out, **Then** the session and
  this device's push token are removed and Welcome is shown.
- **AUTH-08** (P2) — Delete account. **Given** a signed-in owner, **When** they re-authenticate and confirm
  deletion, **Then** pets, files, tokens, and profile data are removed, past appointments/reviews are
  anonymized, and the user is signed out, reachable in under 3 taps from Profile.
- **AUTH-09** (P2) — Export data. **Given** a signed-in owner, **When** they request an export, **Then** a
  shareable JSON file with profile, pets, records, and bookings is produced.
- **AUTH-10** (P2) — Suspended users blocked. **Given** a profile marked suspended, **When** that user tries
  to refresh a session or call the API, **Then** the request is rejected and a support message is shown.

### Epic B — Pets and health passport (owner) · Phase 1

**Why this priority**: PET-01 (add a pet) and PET-04/07 (record and get reminded about vaccinations) are P1
because booking requires a pet and the core health-passport value proposition is reminders. The rest are P2.

**Independent Test**: A pet can be added, a vaccination recorded, and a reminder scheduled, independent of
any clinic or booking flow.

- **PET-01** (P1) — Add pet. **Given** an owner on Add pet, **When** they submit name, species, and gender
  (breed, birth date or age, weight, photo optional), **Then** the pet appears immediately in My Pets.
- **PET-02** (P2) — Edit pet. **Given** an existing pet, **When** the owner changes details, **Then**
  changes show without a restart and weight changes are kept in the timeline.
- **PET-03** (P2) — Delete pet. **Given** an existing pet, **When** the owner confirms deletion, **Then**
  the pet disappears from lists, its upcoming appointments are cancelled with a warning, and its data is
  purged after 30 days.
- **PET-04** (P1) — Record a vaccination. **Given** a pet profile, **When** the owner picks a vaccine type
  and date given, **Then** the next-due date is proposed from the vaccine interval (editable) and the entry
  appears in Vaccinations and Timeline.
- **PET-05** (P2) — Attach documents. **Given** a vaccination or record, **When** the owner attaches an
  image or PDF up to 10 MB, **Then** it uploads privately with progress, survives a failed retry, and opens
  only for the owner and permitted clinic staff.
- **PET-06** (P2) — Health timeline. **Given** a pet with entries from multiple sources, **When** the owner
  opens Timeline, **Then** entries are sorted by date, clinic-added items carry a Verified badge, and the
  list scrolls infinitely.
- **PET-07** (P1) — Vaccination reminders. **Given** a vaccine's next-due date, **When** it is 7 days away, 1
  day away, or due, **Then** a push and inbox item fire once each (no duplicates even if the job runs twice),
  respecting notification preferences, and opens the pet's Vaccinations tab.
- **PET-08** (P2) — Share passport. **Given** a pet profile, **When** the owner taps Share, **Then** an image
  or PDF with pet details and vaccination status in the current language is sent through the system share
  sheet.
- **PET-09** (P2) — Clinic-verified entries. **Given** a record or vaccination added by a vet or manager at
  a clinic with an appointment for that pet, **When** anyone views it (owner, that clinic, or a shared
  passport), **Then** it displays "Verified by <clinic name>" with the date and cannot be edited by the
  owner or by any other clinic. **Given** an entry the owner added, **When** anyone views it, **Then** it
  displays "Added by you" and cannot be edited by any clinic.

### Epic C — Clinics, booking, and the live queue (owner) · Phase 1

**Why this priority**: This epic is the product's core transaction. CLN-01/02/03 (discovery), BKG-01 to 05
(book/cancel/reschedule safely), and QUE-01 to 03 (live queue) are P1. REV-01 and EMG-01 are P2 — valuable,
not required for the first booking.

**Independent Test**: An owner can find a clinic, book a slot, check in, watch the queue update, and the
whole path can be demonstrated without touching Shop, Community, or Payments.

- **CLN-01** (P1) — Nearby clinics. **Given** location permission is granted, **When** Clinics opens,
  **Then** results sort by distance; **Given** permission is denied, **When** Clinics opens, **Then** results
  sort by the saved city; in both cases only active clinics appear.
- **CLN-02** (P1) — Search and filter. **Given** a search term in Arabic or English, **When** typed,
  **Then** matching clinics appear; **Given** a filter (open now, 24h, emergency, species, rating), **When**
  applied, **Then** results update within 1 second.
- **CLN-03** (P1) — Clinic details. **Given** a clinic page, **When** opened, **Then** services with prices,
  doctors, hours, rating, and reviews are shown and Call/WhatsApp/Directions open the right apps.
- **BKG-01** (P1) — Book an appointment. **Given** service, doctor, time, and pet are chosen, **When** the
  owner confirms, **Then** the booking completes in at most 5 steps, a confirmation screen and inbox item
  appear, and it is visible under Upcoming.
- **BKG-02** (P1) — Slot conflict. **Given** two owners book the same slot at once, **When** both submit,
  **Then** exactly one succeeds and the other sees a "slot taken" message with a refreshed slot list; no
  double booking is ever possible.
- **BKG-03** (P1) — Safe retry. **Given** a booking request is repeated after a dropped connection with the
  same retry key, **When** it reaches the server again, **Then** exactly one appointment is created.
- **BKG-04** (P1) — Cancel. **Given** a booking more than 2 hours before the visit, **When** the owner taps
  Cancel, **Then** the slot frees and the clinic is notified; **Given** a booking within 2 hours of the
  visit, **When** the owner opens it, **Then** the Cancel button is replaced by the message "Free
  cancellation is available until 2 hours before your visit. After that, please call the clinic." and a
  Call clinic button. **Given** any booking at any time, **When** clinic staff cancel with a required
  reason, **Then** the owner is notified.
- **BKG-05** (P1) — Reschedule. **Given** an existing booking, **When** the owner picks a new slot, **Then**
  the old slot releases and the new one reserves together, or nothing changes if either step would fail.
- **BKG-06** (P2) — Visit reminders. **Given** a confirmed booking, **When** 24 hours and 2 hours before the
  visit arrive (Cairo local time), **Then** a reminder notification fires once at each point.
- **QUE-01** (P1) — Check in. **Given** an owner arrives at the clinic, **When** they show the QR code or tap
  Check in, **Then** a queue ticket is created with the next number for that doctor and day.
- **QUE-02** (P1) — Live queue view. **Given** a checked-in booking, **When** the owner opens it, **Then** a
  card shows their number, the number being served, people ahead, and an estimated wait — people ahead
  multiplied by the average duration of their booked services, shown as a rounded minute range (e.g., "about
  15 to 25 minutes"), or "You are next" when nobody is ahead, or just the people-ahead count when the
  calculation cannot be made — updating within 3 seconds of a change, without exposing any other owner's
  data. **Then** an exact minute count is never shown.
- **QUE-03** (P1) — "You are next" push. **Given** a ticket is called or two places away, **When** that
  happens, **Then** the owner receives a push notification.
- **REV-01** (P2) — Rate a visit. **Given** a completed appointment, **When** the owner submits 1-5 stars and
  an optional comment, **Then** the review is saved once and the clinic's rating updates.
- **EMG-01** (P2) — Emergency directory. **Given** the owner taps Emergency from Home, **When** the list
  loads, **Then** 24-hour and emergency clinics sort by distance (or saved city without location permission)
  with one-tap Call.

### Epic D — Notifications · Phase 1

**Why this priority**: All P2 — notifications support the P1 journeys (reminders, queue pushes) but the
inbox, preferences, and device registration are supporting infrastructure, not the critical path themselves.

**Independent Test**: The inbox, preference toggles, and device-token lifecycle can be verified without a
live booking, using seeded notifications.

- **NTF-01** (P2) — Inbox. **Given** notifications exist, **When** the owner opens the inbox, **Then** items
  list newest-first with unread state, tapping one routes to its target, and Mark all as read clears the
  badge to match.
- **NTF-02** (P2) — Preferences. **Given** notification settings, **When** the owner toggles vaccination
  reminders, booking updates, or offers, **Then** the backend stops or resumes sending that category.
- **NTF-03** (P2) — Device registration. **Given** a login or logout, **When** it occurs, **Then** the
  device's push token is upserted or removed respectively; tokens Expo reports as invalid are deleted.

### Epic E — Clinic staff (web) · Phase 1

**Why this priority**: CS-01 to 07 are P1 because a clinic cannot take or run a booking without accepting an
invite, having doctors/services/schedules configured, seeing appointments, and running the queue. CS-08 to 10
(records, reports, staff management) are P2.

**Independent Test**: A clinic manager can accept an invite, configure a doctor and service, and run a full
check-in-to-complete queue cycle without needing the admin portal.

- **CS-01** (P1) — Accept invite and sign in. **Given** an invite email, **When** the invitee sets a
  password, **Then** they land in the clinic portal and see only their own clinic.
- **CS-02** (P1) — Clinic profile. **Given** a manager, **When** they edit names, contacts, address, hours,
  or media, **Then** changes are visible in the app within a minute; status cannot be changed from here.
- **CS-03** (P1) — Doctors. **Given** a manager, **When** they add, edit, or deactivate a doctor, **Then**
  deactivated doctors keep history but cannot be booked going forward.
- **CS-04** (P1) — Schedules and days off. **Given** a manager sets working hours or an exception day,
  **When** saved, **Then** available slots in the app reflect the change immediately, and any existing
  booking inside a newly closed period is flagged for action.
- **CS-05** (P1) — Services and prices. **Given** a manager, **When** they edit duration, price, species, or
  active state, **Then** inactive services disappear from the app immediately.
- **CS-06** (P1) — Appointments. **Given** staff viewing the day/week calendar, **When** they open an
  appointment and confirm, reschedule, or cancel with a reason, **Then** the owner is notified.
- **CS-07** (P1) — Run the live queue. **Given** a checked-in ticket, **When** staff check in, call next,
  start, complete, skip, or mark no-show, **Then** owners see the change within 3 seconds and two staff
  acting on the same ticket never leave it in an inconsistent state.
- **CS-08** (P2) — Records and vaccinations. **Given** a pet with an appointment at their clinic, **When** a
  vet or manager adds a record or vaccination with attachments, **Then** it is labeled "Verified by <clinic
  name>" with the date, linked to that clinic, appears in the owner's timeline, and can be edited only by
  staff at that same clinic (not by the owner, and not by any other clinic).
- **CS-09** (P2) — Reports. **Given** a manager picks a date range, **When** Reports loads, **Then** bookings
  per day, no-show rate, busiest hours, and top services are shown and exportable as CSV.
- **CS-10** (P2) — Staff management. **Given** a manager, **When** they invite, change the level of, or
  remove a staff member, **Then** access changes immediately.

### Epic F — Admin (web) · Phase 1

**Why this priority**: AD-01 (secure sign-in), AD-02 (onboard clinics), and AD-04 (reference data) are P1
because without them no clinic exists for owners to book and no breeds/vaccine types exist for pets. AD-03 and
AD-05 to 09 are P2 operational and oversight tooling.

**Independent Test**: An admin can sign in with MFA, create and approve one clinic end to end, and seed
reference data, independent of any owner-side flow.

- **AD-01** (P1) — Secure sign-in. **Given** an admin account, **When** they sign in, **Then** email,
  password, and a TOTP code are required; without an enrolled factor they are forced to enroll before any
  admin page is reachable.
- **AD-02** (P1) — Onboard and approve clinics. **Given** a new clinic and its first manager, **When** an
  admin creates it, **Then** it stays Pending and invisible in the app until Approved; Suspend hides it and
  blocks new bookings while keeping history.
- **AD-03** (P2) — Manage users. **Given** a user, **When** an admin suspends (with reason), restores, or
  forces sign-out, **Then** the action is written to the audit log.
- **AD-04** (P1) — Reference data. **Given** breeds, vaccine types, cities, or specialties, **When** an admin
  adds or edits bilingual entries, **Then** the change appears in the app without a release.
- **AD-05** (P2) — KPIs. **Given** the Overview page, **When** it loads, **Then** it renders in under 2
  seconds and the numbers match the underlying data within the refresh interval.
- **AD-06** (P2) — Broadcast. **Given** a composed message in both languages and a chosen segment, **When**
  an admin sends or schedules it, **Then** users receive it in their own language and delivery counts are
  shown.
- **AD-07** (P2) — Flags and config. **Given** a super admin, **When** they toggle a flag or change the
  minimum app version/maintenance mode, **Then** it takes effect on the next config fetch.
- **AD-08** (P2) — Audit trail. **Given** any admin write or any admin read of health data, **When** it
  happens, **Then** it is logged with actor, time, and entity, and the log cannot be edited.
- **AD-09** (P2) — Moderate reviews. **Given** a review, **When** an admin hides or restores it with a
  reason, **Then** the clinic's rating recalculates.

### Epic G — Platform and quality · Phase 1

**Why this priority**: PLT-01 (force update) is P1 because an unsafe old version must never be allowed to
run against live data. PLT-02 to 04 are P2 platform guarantees that apply across every other epic.

**Independent Test**: Each platform behavior (force update, maintenance mode, offline handling, RTL) can be
verified with a seeded config flag, independent of any feature epic.

- **PLT-01** (P1) — Force update. **Given** the running app version is below the configured minimum,
  **When** it checks in, **Then** only the Force Update screen is reachable.
- **PLT-02** (P2) — Maintenance mode. **Given** the maintenance flag is on, **When** any client checks in,
  **Then** mobile shows the maintenance screen and the dashboard shows a banner.
- **PLT-03** (P2) — Offline behavior. **Given** no connection, **When** the owner opens a cached list,
  **Then** it still renders with an explanatory banner, and actions needing the network are disabled with a
  reason rather than silently queued.
- **PLT-04** (P2) — Full RTL. **Given** Arabic is active, **When** any screen renders, **Then** layout,
  direction-sensitive icons, lists, tabs, and animations mirror correctly with no clipped or overlapping
  text.
- **PLT-05** — moved to constitution (merge/CI quality gates are governed by the constitution's Quality
  Gates and Engineering Standards principles, not restated here as a product story).

### Later phases

Phase 2 (Shop), Phase 3 (Community), and Phase 4 (Payments and video) are fully specified, verbatim, in
[docs/future-phases.md](../../docs/future-phases.md) — their stories, functional requirements, key entities,
and screen rows are preserved there so they can be restored into this spec when each phase starts. They
**MUST NOT** be built or routed before their phase starts and its flag is enabled (constitution VI).

### Edge Cases

- **Double booking of the same slot** — exactly one of two simultaneous requests succeeds; the other is told
  the slot is taken and shown a refreshed slot list (BKG-02).
- **Retry after network loss** — a repeated booking request with the same retry key produces exactly one
  appointment, never a duplicate (BKG-03).
- **Cancellation after the window** — inside 2 hours of the visit, the owner's Cancel button is replaced by
  the policy message and a Call clinic button rather than being silently applied or silently blocked with no
  explanation; the clinic can still cancel at any time with a reason.
- **Clinic suspended with upcoming bookings** — the clinic disappears from discovery and cannot take new
  bookings, but existing upcoming bookings and their owners are notified so the visit can be handled
  (reschedule or cancellation), not silently dropped.
- **Doctor day off added over existing bookings** — the schedule change is saved but bookings that now fall
  inside the closed period are flagged for staff action rather than silently cancelled.
- **Owner deletes a pet with upcoming bookings** — the owner is warned before deleting, and any upcoming
  bookings for that pet are cancelled with a notice to the clinic.
- **Suspended user with a live session** — the next API call or session refresh is rejected; the client
  shows a support message rather than letting the session continue to work.
- **Expired or wrong verification code** — a wrong code shows an inline retryable error; an expired code is
  distinguished from a wrong one; the 5th consecutive wrong attempt cancels that code and requires a new
  one; the 3rd cancelled code within 60 minutes for the same email address locks that address for 15
  minutes with the unlock time shown.
- **Code email not arriving** — the resend control is available after 60 seconds; the screen shows a hint
  to check the spam/junk folder; a "change email" action lets the owner correct a typo without starting
  over from Welcome.
- **Mistyped email address** — basic format validation catches an obviously invalid address before a send
  is attempted; a well-formed but wrong address still "succeeds" at the send step (no account enumeration,
  see AUTH-01/FR-001) so the owner only discovers the mistake when no code arrives — covered by the
  "change email" action above.
- **Same person signs in with email code and with Google** — if both use the same verified email address,
  they resolve to one account, not two (AUTH-06).
- **Apple hidden (private-relay) email** — the relay address is treated as that account's real email for
  sign-in purposes; it is a distinct identity from any other address the same person might also use with
  email-code or Google sign-in (no automatic link between them is possible, since Apple never shares the
  real address).
- **User without a phone number** — every owner-facing flow (booking, queue, profile) works fully with no
  phone number on file; nothing blocks on its absence since the field is optional.
- **Lost connection during upload** — the attachment upload shows progress and can resume or be retried
  without losing the record it is attached to.
- **Arabic text inside English UI and the reverse** — mixed-direction content (a clinic's Arabic name inside
  an English sentence, for example) renders without breaking the surrounding layout direction.
- **Daylight saving changes** — because Egypt has changed DST rules before, all appointment math uses the
  named `Africa/Cairo` zone, not a fixed offset, so a schedule or reminder never shifts by an hour across a
  DST boundary.
- **Two staff acting on the same queue ticket** — the second action (e.g., both tapping Complete) is rejected
  or no-ops rather than corrupting the ticket's state; the queue board reflects one consistent outcome.
- **User without location permission** — nearby-clinics and emergency-directory features fall back to the
  owner's saved city instead of failing or showing an empty list.
- **User without notification permission** — reminders and queue updates still appear in the in-app inbox;
  only the push channel is unavailable, and the app explains this rather than silently losing the reminder.

## Requirements *(mandatory)*

### Functional Requirements

Each requirement is tagged with its story ID(s), priority, and phase.

**Epic A — Account and onboarding**

- **FR-001** (AUTH-01, P1, Ph1): System MUST let a new or returning owner sign in with an email address and
  a time-limited 6-digit code sent to that address (no magic link, no deep link — the code is typed into
  the app), resolve to a new or existing account as appropriate, cancel that code after 5 consecutive wrong
  attempts (requiring a new code, available after the 60-second resend wait), and lock that email address
  for 15 minutes, with the unlock time shown, after 3 cancelled codes within 60 minutes. System MUST
  throttle code sends per email address and per IP address, and MUST return an identical response whether
  or not the email already has an account (no account enumeration). Exact limits MUST be checked against
  the chosen authentication provider's supported capabilities during planning. **Enforcement note (added
  2026-10-19)**: these MUSTs describe the intended behavior; whether they hold against a client that
  bypasses the app's own guard and calls the provider's endpoints directly depends on a still-open
  decision (`research.md` section 17, Open Decisions item 12) — see AUTH-01's own note above.
- **FR-002** (AUTH-02, P1, Ph1): System MUST let an owner sign in with a Google account in one step and
  create a profile on first use, without creating a duplicate account on a second sign-in with the same
  identity.
- **FR-003** (AUTH-03, P1, Ph1): System MUST offer Sign in with Apple on iOS only (hidden entirely on
  Android) and persist the name shared on first sign-in.
- **FR-004** (AUTH-04, P1, Ph1): System MUST require name, city, and a recorded Terms/Privacy acceptance
  (with version and time) before an owner can reach Home; System MUST accept an optional phone number on
  this screen, validating the Egyptian format only when a value is entered, and MUST NOT block reaching
  Home on that field being empty.
- **FR-005** (AUTH-05, P1, Ph1): System MUST let an owner choose Arabic or English and light, dark, or
  system theme, and persist both choices across app launches.
- **FR-006** (AUTH-06, P2, Ph1): System MUST let an owner link an additional sign-in method (email/code or
  Google) to their existing account without creating a second account.
- **FR-007** (AUTH-07, P2, Ph1): System MUST end the session and remove the current device's push
  registration when an owner logs out.
- **FR-008** (AUTH-08, P2, Ph1): System MUST let an owner delete their account after re-authentication,
  removing their pets, files, tokens, and profile while anonymizing appointments/reviews that clinics must
  retain, reachable within 3 taps from Profile.
- **FR-009** (AUTH-09, P2, Ph1): System MUST let an owner export their own data (profile, pets, records,
  bookings) as a downloadable file.
- **FR-010** (AUTH-10, P2, Ph1): System MUST block a suspended user from using any authenticated feature and
  show a support message.

**Epic B — Pets and health passport**

- **FR-011** (PET-01, P1, Ph1): System MUST let an owner add a pet with at minimum a name, species, and
  gender.
- **FR-012** (PET-02, P2, Ph1): System MUST let an owner edit a pet's details and preserve prior weight
  values in its history.
- **FR-013** (PET-03, P2, Ph1): System MUST let an owner delete a pet with a confirmation step, cancel its
  upcoming bookings with a warning, and remove its data after a 30-day grace period.
- **FR-014** (PET-04, P1, Ph1): System MUST let an owner record a vaccination with a proposed, editable
  next-due date derived from the vaccine's interval.
- **FR-015** (PET-05, P2, Ph1): System MUST let an owner attach an image or PDF (up to 10 MB) to a
  vaccination or health record, stored privately and visible only to the owner and clinic staff with a
  relevant appointment.
- **FR-016** (PET-06, P2, Ph1): System MUST show a pet's health entries from all sources in one
  chronologically sorted, infinitely scrollable timeline, with clinic-added entries labeled Verified.
- **FR-017** (PET-07, P1, Ph1): System MUST send a vaccination reminder (push and inbox) 7 days before, 1 day
  before, and on the due date, exactly once per occasion regardless of how many times the reminder job runs.
- **FR-018** (PET-08, P2, Ph1): System MUST let an owner share a read-only summary of a pet's passport
  (details and vaccination status) as an image or PDF in the current language.
- **FR-019** (PET-09, P2, Ph1): System MUST label a clinic-created entry "Verified by <clinic name>" with
  its date and an owner-created entry "Added by you," identically on the owner's view and on a shared
  passport, and MUST prevent an owner from editing a clinic-created entry.

**Epic C — Clinics, booking, and the live queue**

- **FR-020** (CLN-01, P1, Ph1): System MUST list only active clinics, sorted by distance when location
  permission is available and by the owner's saved city otherwise.
- **FR-021** (CLN-02, P1, Ph1): System MUST support bilingual search and filtering (open now, 24-hour,
  emergency, species, rating) with results updating within 1 second of a change.
- **FR-022** (CLN-03, P1, Ph1): System MUST show a clinic's services with prices, doctors, hours, rating, and
  reviews, with working Call, WhatsApp, and Directions actions.
- **FR-023** (BKG-01, P1, Ph1): System MUST let an owner complete a booking (service, doctor, time, pet,
  confirmation) in at most 5 steps and immediately reflect it under Upcoming.
- **FR-024** (BKG-02, P1, Ph1): System MUST prevent two bookings from ever occupying the same doctor slot;
  exactly one of two simultaneous attempts MUST succeed.
- **FR-025** (BKG-03, P1, Ph1): System MUST treat a repeated booking submission carrying the same retry key
  as the original request, never creating a second appointment.
- **FR-026** (BKG-04, P1, Ph1): System MUST let an owner cancel for free up to 2 hours before the visit,
  freeing the slot and notifying the clinic; within 2 hours of the visit it MUST replace the Cancel action
  with the policy message and a Call clinic action instead of cancelling. System MUST let clinic staff
  cancel any booking at any time with a required reason, notifying the owner.
- **FR-027** (BKG-05, P1, Ph1): System MUST reschedule a booking as a single all-or-nothing change (old slot
  released and new slot reserved together, or neither).
- **FR-028** (BKG-06, P2, Ph1): System MUST send a reminder 24 hours and a reminder 2 hours before a
  confirmed visit, in the clinic's local (Cairo) time, each exactly once.
- **FR-029** (QUE-01, P1, Ph1): System MUST create a queue ticket with the next sequential number for that
  doctor and day when an owner checks in (by QR or code).
- **FR-030** (QUE-02, P1, Ph1): System MUST show a checked-in owner their ticket number, the number currently
  served, the count ahead of them, and an estimated wait computed as the count ahead multiplied by the
  average duration of their booked services, presented as a rounded minute range (never an exact minute
  count); it MUST show "You are next" when nobody is ahead, and MUST fall back to showing only the
  people-ahead count when the calculation cannot be made. All of this MUST refresh within 3 seconds of any
  change, without exposing any other owner's queue data.
- **FR-031** (QUE-03, P1, Ph1): System MUST notify an owner by push when their ticket is called or is two
  places away.
- **FR-032** (REV-01, P2, Ph1): System MUST let an owner rate a completed visit exactly once (1-5 stars,
  optional comment) and recalculate the clinic's rating.
- **FR-033** (EMG-01, P2, Ph1): System MUST surface 24-hour and emergency clinics sorted by distance (or
  saved city) within one tap from Home, with a one-tap call action.

**Epic D — Notifications**

- **FR-034** (NTF-01, P2, Ph1): System MUST present notifications newest-first with unread state, route a
  tap to its target, and support marking all as read with the badge count kept in sync.
- **FR-035** (NTF-02, P2, Ph1): System MUST respect per-category notification preferences (vaccination
  reminders, booking updates, offers) when deciding whether to send.
- **FR-036** (NTF-03, P2, Ph1): System MUST register a device's push token on sign-in, remove it on sign-out,
  and delete tokens reported as invalid by the push provider.

**Epic E — Clinic staff**

- **FR-037** (CS-01, P1, Ph1): System MUST let an invited staff member set a password from the invite link
  and see only the clinic(s) they belong to after signing in.
- **FR-038** (CS-02, P1, Ph1): System MUST let a clinic manager edit their clinic's profile fields (names,
  contacts, address, hours, media) without being able to change the clinic's approval status, with changes
  visible in the app within a minute.
- **FR-039** (CS-03, P1, Ph1): System MUST let a manager add, edit, or deactivate a doctor; a deactivated
  doctor keeps history but cannot receive new bookings.
- **FR-040** (CS-04, P1, Ph1): System MUST let a manager set weekly hours and day-specific exceptions, apply
  the result to available slots immediately, and flag any existing booking that falls inside a newly closed
  period for staff action.
- **FR-041** (CS-05, P1, Ph1): System MUST let a manager edit services, prices, and active state, removing
  inactive services from the app immediately.
- **FR-042** (CS-06, P1, Ph1): System MUST let staff view, confirm, reschedule, or cancel (with reason) an
  appointment, notifying the owner of the outcome.
- **FR-043** (CS-07, P1, Ph1): System MUST let staff check in, call next, start, complete, skip, or mark
  no-show on a queue ticket, propagate the change to the owner within 3 seconds, and resolve two staff
  actions on the same ticket to one consistent outcome.
- **FR-044** (CS-08, P2, Ph1): System MUST let a vet or manager add records and vaccinations (with
  attachments) only for pets with an appointment at their clinic, label them "Verified by <clinic name>,"
  and let only that same clinic's staff edit them afterward — never the owner, never a different clinic.
- **FR-045** (CS-09, P2, Ph1): System MUST provide a manager with bookings-per-day, no-show rate, busiest
  hours, and top-services reporting for a chosen date range, exportable as CSV.
- **FR-046** (CS-10, P2, Ph1): System MUST let a manager invite, change the level of, or remove staff, with
  access changes taking effect immediately.

**Epic F — Admin**

- **FR-047** (AD-01, P1, Ph1): System MUST require a second authentication factor for every admin and
  super-admin sign-in, blocking admin pages until a factor is enrolled.
- **FR-048** (AD-02, P1, Ph1): System MUST keep a newly created clinic invisible to owners until an admin
  approves it, and MUST block new bookings (while preserving history) once a clinic is suspended.
- **FR-049** (AD-03, P2, Ph1): System MUST let an admin suspend (with a required reason), restore, or force
  sign-out on a user, recording each action to the audit log.
- **FR-050** (AD-04, P1, Ph1): System MUST let an admin manage bilingual reference data (breeds, vaccine
  types, cities, specialties) and make changes available in the apps without a release.
- **FR-051** (AD-05, P2, Ph1): System MUST load the admin overview's KPIs in under 2 seconds and keep them
  consistent with underlying data within the stated refresh interval.
- **FR-052** (AD-06, P2, Ph1): System MUST let an admin compose a bilingual broadcast, target a segment,
  preview it, and send or schedule it, reporting delivery counts.
- **FR-053** (AD-07, P2, Ph1): System MUST let a super admin toggle feature flags and platform configuration
  (minimum app version, maintenance mode) and apply the change on the next client config fetch.
- **FR-054** (AD-08, P2, Ph1): System MUST write an immutable audit entry for every admin write and every
  admin read of health data, capturing actor, time, and entity.
- **FR-055** (AD-09, P2, Ph1): System MUST let an admin hide or restore a review with a reason and
  recalculate the affected clinic's rating.

**Epic G — Platform and quality**

- **FR-056** (PLT-01, P1, Ph1): System MUST restrict the app to the Force Update screen when its version is
  below the configured minimum.
- **FR-057** (PLT-02, P2, Ph1): System MUST show a maintenance screen (mobile) or banner (dashboard) when
  maintenance mode is on.
- **FR-058** (PLT-03, P2, Ph1): System MUST keep cached lists readable while offline, clearly disable
  network-dependent actions with a reason, and never silently queue a write that needs the network.
- **FR-059** (PLT-04, P2, Ph1): System MUST render every screen correctly mirrored in Arabic (layout,
  direction-sensitive icons, lists, tabs, animation) with no clipped or overlapping text.
- **FR-060** — moved to constitution (CI/merge quality gates; see constitution VII Quality Gates and X
  Engineering Standards).

Functional requirements for Phase 2-4 (FR-061 to FR-073, covering SHP/COM/PAY/VID) are specified, verbatim,
in [docs/future-phases.md](../../docs/future-phases.md).

### Key Entities

- **Profile**: one record per person using the product; name, contact method(s) — **email is always
  present and is the sign-in identifier; phone is an optional, unverified contact field** — city,
  language/theme preference, role, and status (active/suspended).
- **Role**: the permission level attached to a profile — owner, clinic staff (manager/vet/receptionist),
  admin, or super admin — that determines what that person can see and do.
- **Pet**: an owner's animal; species, breed, gender, birth date or age, weight, photo, and ownership.
- **Vaccination**: a given or planned vaccine for a pet, with the date given, the next-due date, and who
  recorded it (owner or clinic).
- **Health record**: a timeline entry for a pet (visit, allergy, medication, surgery, lab, or note) with a
  date, description, and source.
- **Attachment**: a file (image or PDF) attached to a vaccination or health record.
- **Clinic**: a partner veterinary location; names (bilingual), contact details, location, hours, emergency
  availability, status (pending/active/suspended), and rating.
- **Doctor**: a vet at a clinic; name, specialty, bio, active state, and which services they offer.
- **Service**: something a clinic offers for booking; name, duration, price, and applicable species.
- **Schedule and exception**: a doctor's recurring weekly availability and date-specific overrides (closed
  days, special hours).
- **Appointment**: a booking linking an owner, pet, clinic, doctor, and service to a time slot, with a
  status and payment state.
- **Queue ticket**: the live-queue entry created at check-in for an appointment, with a per-doctor-per-day
  number and a status (waiting, called, in progress, done, skipped).
- **Review**: an owner's rating and optional comment for one completed appointment.
- **Notification**: an in-app inbox item describing an event and where it routes to.
- **Device token**: the push-notification address for one signed-in device.
- **Feature flag**: a named on/off switch controlling whether a not-yet-launched capability is reachable.
- **Audit entry**: an immutable record of an administrative action or an administrative read of health data.
- **Reference data**: shared lookup lists — cities, breeds, vaccine types, specialties — maintained by
  admins and consumed everywhere.

Phase 2-4 key entities (Product, Order, Address, Listing, Match request, Conversation, Payment, Subscription,
Video session) are specified, verbatim, in [docs/future-phases.md](../../docs/future-phases.md).

## Screen Coverage

Screen ID uses the route from the design system's screen inventory until `design/screen-map.md` exists
(constitution IX). Design status is **Built** (interactive in a UI kit) or **Spec** (covered by a component
pattern and a PRD row, not yet laid out as its own screen).

### Owner mobile

| Screen ID | Phase | Status | Serves |
| --- | --- | --- | --- |
| `/` Splash | 1 | Spec | PLT-01, PLT-02 |
| `/language` Language | 1 | Built | AUTH-05 |
| `/onboarding` Onboarding (3 slides) | 1 | Built | AUTH-01 (first-run flow) |
| `/welcome` Welcome | 1 | Built, design change needed (email instead of phone) | AUTH-01, AUTH-02, AUTH-03 |
| `/sign-in` Sign in | 1 | Built, design change needed (email instead of phone) | AUTH-01, AUTH-02, AUTH-03 |
| `/otp` Verify code | 1 | Built, design change needed (email instead of phone) | AUTH-01 |
| `/complete-profile` Complete profile | 1 | Built, design change needed (email instead of phone) | AUTH-04 |
| `/onboarding/summary` Setup Summary | 1 | Built | AUTH-01, PET-01 |
| `/permissions` Permissions primer | 1 | Built | NTF-03, CLN-01 |
| `/(tabs)/index` Home | 1 | Built | PET-07, BKG-06, EMG-01, CLN-01 |
| `/(tabs)/pets` My pets | 1 | Built | PET-01, PET-02, PET-03 |
| `/pets/new` Add pet (4 steps) | 1 | Built | PET-01 |
| `/pets/[id]` Pet passport | 1 | Built (partial) | PET-06, PET-09 |
| `/pets/[id]/edit` Edit pet | 1 | Spec | PET-02 |
| `/pets/[id]/vaccinations/new` Add vaccination | 1 | Built | PET-04 |
| `/pets/[id]/records/new` Add record | 1 | Spec | PET-06 |
| `/pets/[id]/passport` Passport share | 1 | Built | PET-08 |
| `/documents/[path]` Document viewer | 1 | Spec | PET-05 |
| `/clinics` Clinics | 1 | Built | CLN-01, CLN-02 |
| `/clinics/[id]` Clinic detail | 1 | Built | CLN-03 |
| `/clinics/[id]/doctors/[id]` Doctor | 1 | Spec | CLN-03, BKG-01 |
| `/book/service` Booking step 1 | 1 | Built | BKG-01 |
| `/book/doctor` Booking step 2 | 1 | Built | BKG-01 |
| `/book/time` Booking step 3 | 1 | Built | BKG-01, BKG-02 |
| `/book/details` Booking step 4 | 1 | Built | BKG-01 |
| `/book/summary` Booking step 5 | 1 | Built | BKG-01, BKG-03 |
| `/book/success` Confirmation | 1 | Built | BKG-01 |
| `/(tabs)/bookings` My bookings | 1 | Built | BKG-01, BKG-04, BKG-05 |
| `/bookings/[id]` Booking detail | 1 | Built | QUE-01, QUE-02, BKG-04, BKG-05 |
| `/bookings/[id]/review` Rate visit | 1 | Built | REV-01 |
| `/emergency` Emergency | 1 | Built | EMG-01 |
| `/notifications` Inbox | 1 | Built | NTF-01 |
| `/(tabs)/profile` Profile | 1 | Built | AUTH-05, AUTH-07 |
| `/profile/settings` Settings | 1 | Built | AUTH-05, NTF-02 |
| `/profile/account` Account | 1 | Built, design change needed (email instead of phone) | AUTH-06, AUTH-07, AUTH-08, AUTH-09 |
| `/profile/edit` Edit profile | 1 | Spec | AUTH-04 |
| `/profile/help` Help | 1 | Spec | — (support utility) |
| `/profile/about` About | 1 | Spec | — (app info) |
| `/legal/terms`, `/legal/privacy` Legal | 1 | Spec | AUTH-04 |
| `/force-update` System screen | 1 | Spec | PLT-01 |
| `/maintenance` System screen | 1 | Spec | PLT-02 |

Phase 2-4 owner-mobile screens (Shop, Community, the `PaymentMethodSelector` slot, and Video) are specified,
verbatim, in [docs/future-phases.md](../../docs/future-phases.md).

### Clinic dashboard

| Screen ID | Phase | Status | Serves |
| --- | --- | --- | --- |
| `/login`, `/mfa` Sign in | 1 | Built | CS-01 |
| `/clinic` Today | 1 | Built | CS-06, CS-07 |
| `/clinic/queue` Live queue board | 1 | Built | CS-07, QUE-01, QUE-02, QUE-03 |
| `/clinic/appointments` Appointments (list/detail) | 1 | Built (calendar day/week: Spec) | CS-06 |
| `/clinic/services` Services | 1 | Built | CS-05 |
| `/clinic/profile` Clinic profile | 1 | Built | CS-02 |
| `/clinic/staff` Staff | 1 | Built | CS-10 |
| `/clinic/patients`, patient detail | 1 | Spec | CS-08 |
| `/clinic/doctors` + schedule editor | 1 | Spec | CS-03, CS-04 |
| `/clinic/reviews` | 1 | Spec | REV-01 (clinic view) |
| `/clinic/reports` | 1 | Spec | CS-09 |
| `/clinic/settings` | 1 | Spec | — (account utility) |

Phase 4 clinic-dashboard screens (`/clinic/payouts`, the video schedule screen) are specified, verbatim, in
[docs/future-phases.md](../../docs/future-phases.md).

### Admin dashboard

| Screen ID | Phase | Status | Serves |
| --- | --- | --- | --- |
| `/admin` Overview (KPIs, charts) | 1 | Built | AD-05 |
| `/admin/users` Users | 1 | Built | AD-03 |
| `/admin/clinics` Clinics (approve/suspend) | 1 | Built | AD-02 |
| `/admin/reference-data` Reference data | 1 | Built | AD-04 |
| `/admin/notifications` Broadcast composer | 1 | Built | AD-06 |
| `/admin/flags` Flags | 1 | Built | AD-07 |
| `/admin/audit-logs` Audit log (diff viewer: Spec) | 1 | Built | AD-08 |
| User detail | 1 | Spec | AD-03 |
| Pets (read-only support view) | 1 | Spec | AD-03 |
| Clinic detail and creation wizard | 1 | Spec | AD-02 |
| Appointments (admin view) | 1 | Spec | CS-06 (admin oversight) |
| Reviews moderation | 1 | Spec | AD-09 |
| Admin team | 1 | Spec | AD-01 |
| Settings | 1 | Spec | — (account utility) |
| `/accept-invite` | 1 | Spec | CS-01 |
| `/forgot-password` | 1 | Spec | — (auth utility) |
| `/no-access` | 1 | Spec | AD-01 |

Phase 2-4 admin-dashboard locked stubs (Products/orders, Listings, Payments/refunds) are specified, verbatim,
in [docs/future-phases.md](../../docs/future-phases.md).

### Design gaps

Every screen marked **Spec** above must be composed from existing design-system components, following the
pattern of the nearest **Built** screen in the same area, rather than designed from nothing:

- **Owner mobile**: Edit pet (follow Add pet), Add record (follow Add vaccination), Document viewer (follow
  the passport share pattern), Doctor (follow Clinic detail), Edit profile/Help/About/Legal (follow Profile),
  Force Update/Maintenance (follow the system-screen pattern implied by Splash).
- **Clinic dashboard**: Patients and patient detail, the doctor schedule editor, the appointments
  calendar (day/week), Reviews, Reports, Settings.
- **Admin dashboard**: User detail, the pets support view, the clinic detail/creation wizard, the admin
  appointments view, Reviews moderation, Admin team, Settings, and the three auth-edge screens
  (`/accept-invite`, `/forgot-password`, `/no-access`).
- **Verify code (`/otp`), design change needed**: the mobile-entry prototype's error and locked states are
  built around a 3-attempt limit; they must be reworked to match the product limit of 5 wrong attempts
  (AUTH-01), and its copy/inputs must change from an SMS-code screen to an email-code screen (resend timer,
  "change email" action, spam-folder hint) before this screen is considered Built against the current spec.
- **Sign in (`/sign-in`), design change needed**: the prototype shows the Apple button on every device; it
  must be hidden on Android builds so only iOS shows it, per AUTH-03. It also needs its phone-number entry
  field replaced with an email-address field (AUTH-01).
- **Welcome (`/welcome`), design change needed**: copy referencing a phone number (e.g., any "enter your
  phone to continue" framing) must be reworded to reference email instead.
- **Complete profile (`/complete-profile`), design change needed**: the phone field moves from required to
  optional, with its existing Egyptian-format validation kept only for when a value is entered.
- **Account (`/profile/account`), design change needed**: "linked sign-in methods" now shows email/code and
  Google (and Apple, read-only, where applicable) instead of phone and Google; the "Add phone" linking
  action is removed and phone becomes an edit on the profile's optional contact field instead.
- All five of the above, plus every new/changed string they need, are itemized with draft English and
  Arabic copy in [design/overrides.md](../../design/overrides.md) — `design/system/` itself is not edited.
- Phase 2-4 design gaps (Shop, Community, video, payouts, and the admin locked stubs) are tracked in
  [docs/future-phases.md](../../docs/future-phases.md).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 70% or more of owners who start onboarding reach a completed profile (AUTH-01 to 04).
- **SC-002**: Active owners average 1.3 or more pets added (PET-01).
- **SC-003**: 60% or more of owners who open a clinic page complete a booking (CLN-03 through BKG-01).
- **SC-004**: 35% or more of vaccination reminders are opened (PET-07).
- **SC-005**: Appointment no-show rate is 12% or lower (BKG-06, CS-06).
- **SC-006**: 20 partner clinics are live and bookable in the launch city at release (AD-02).
- **SC-007**: 99.5% or more of mobile sessions are crash-free.
- **SC-008**: A checked-in owner sees a queue change reflected on their screen in under 3 seconds (QUE-02).
- **SC-009**: A booking can be confirmed in 5 steps or fewer from clinic selection to confirmation (BKG-01).

## Out of Scope (first release)

- Online payments, video teleconsultation, Shop, and the Adoption/Mating hubs — fully specified in
  [docs/future-phases.md](../../docs/future-phases.md), none of it built or routed in this release.
- Phase 4 hooks stay reserved but inert in Phase 1: money columns (`price_minor`, `currency`), the
  `payment_status` state, the `video` appointment type, and a `PaymentMethodSelector` showing only "Pay at
  clinic" (constitution VI).
- Walk-in patients without the app (queue is app-booking-only in Phase 1; see Open Decisions).
- Tablet-optimized layouts (phone and desktop/laptop web widths only).
- AI features of any kind.

## Open Decisions

Recorded per the constitution's precedence rule: when a source is silent or two sources disagree, the gap is
recorded here rather than guessed. The 3 items originally marked `[NEEDS CLARIFICATION]` — the cancellation
policy (BKG-04), the verification lockout rule (AUTH-01), and the queue wait calculation (QUE-02) — along
with the clinic-verified-records question (PET-09, CS-08) and the Apple sign-in platform question (AUTH-03),
were resolved in Clarifications (Session 2026-10-18) and are reflected throughout this spec; they are no
longer listed here. The remaining items have a working default already in use elsewhere in this spec.

1. Clinic onboarding is assumed to be admin-created only for Phase 1 (AD-02, CS-01), per PRD open question
   3; no clinic self-application flow is in scope unless this assumption changes.
2. Whether Phase 1 needs a staff-created queue entry for walk-in patients without the app, or whether the
   queue is app-bookings-only, per PRD open question 5.
3. The platform's revenue model (commission, subscription, shop margin, or a mix) is undecided and shapes
   the Phase 4 payment design specified in `docs/future-phases.md` (PRD open question 6).
4. Arabic copy throughout the product is a draft and needs review by a native speaker before launch.
5. Logo, app icon, splash artwork, and pet illustrations have not been supplied; placeholders are in use.
6. The build order for Phases 2 to 4 (Shop, then Community, then Payments/Video is assumed per PRD open
   question 12) is not confirmed; see `docs/future-phases.md`.
7. **SMTP provider and sending domain** for the login-code, staff-invite, and password-reset emails is
   undecided; compare options (Resend, Amazon SES, Postmark, Brevo, Mailgun, SendGrid) from their official
   pricing/documentation pages — see `research.md` §4-rewrite — before committing.
8. **Apple sign-in guideline check**: Sign in with Apple is kept per the sign-in-method change (2026-10-18
   Clarifications), but the current App Store Review Guideline 4.8 (third-party/social login requires an
   equivalent privacy-respecting option) should be re-verified against Apple's live guidelines page close
   to submission, not just at planning time, since guideline text can change between now and launch.
9. **Phone required at booking?** The phone field is optional on the profile (AUTH-04); whether a clinic
   needs a verified contact number at booking time (BKG-01) to reach an owner is not decided — the current
   default is no, since the email used for sign-in is already a reachable contact channel.
10. **Phone/SMS sign-in as a future option**: removed from Phase 1 entirely (2026-10-18 Clarifications);
    `research.md` keeps one line noting the schema and the verification guard are written generically
    enough to support it later if the business decides to re-add it — this is not committed to any phase.
11. **Bilingual email template wording** (login code, staff invite, password reset) is draft and needs
    review by a native Arabic speaker before launch, the same as the rest of the product's Arabic copy
    (item 4 above) — called out separately because these templates are a new surface this change created.
12. **Which fix closes the email-code guard's bypassable gap (new, 2026-10-19, `/speckit-analyze` finding
    C2)**: `research.md` section 17 researched four options (Supabase's native rate limits as-is; a Send
    Email hook; CAPTCHA on the Auth endpoints; a longer OTP length) against official Supabase
    documentation and found none of them fully close the gap except a custom-code design where the app's
    own guard generates/hashes/verifies the code instead of using Supabase's OTP primitives for the
    security-sensitive part. **This gates D02**: `tasks.md` T120/T138 must not be skipped, and AUTH-01/
    FR-001's lockout guarantee (see the enforcement notes above) is not fully true until the owner picks
    one and it's built.
13. **Does disabling an NTF-02 notification category also hide the inbox item, or only the push? (new,
    2026-10-19, `/speckit-analyze` finding H1)**: NTF-02/FR-035 say "stops or resumes sending," which is
    ambiguous between the two. The default now implemented (`tasks.md` T226/T227/T288, T247) is
    **push-only suppression — the inbox item is always created**, since an owner who disabled push for a
    category may still want to see it later in the inbox. `booking_cancelled` (sent when a clinic
    cancels) is never suppressible by any preference, since it is a transactional notice, not a marketing
    or reminder category. Confirm or override this default before launch.

## Assumptions

- Owner onboarding follows the mobile-entry prototype flow, updated for the sign-in method change: Language
  → intro slides → Welcome (Get Started) → email → verify code → profile (name, city, Terms, optional
  phone) → pet species → pet basics → pet photo → health passport (upload/manual/skip) → notifications
  primer → Setup Summary → Home; returning users go Welcome (I Have an Account) → sign-in (email or Google)
  → verify (email path only) → Home. The pet step may be skipped, after which Home shows an "Add your first
  pet" card.
- Queue tickets are numbered per doctor per day with a one-letter doctor prefix (e.g., `A-14`); both owners
  and clinic staff see this same ticket identifier.
- Western digits (0-9) are used in both languages; all appointment and reminder times are computed and
  displayed in `Africa/Cairo`; currency is shown as "250 EGP" style.
- Email sign-in code resend is available after 60 seconds; a code expires after 10 minutes (a configurable
  default, not a hard constraint). A code is cancelled after 5 wrong attempts; an email address is locked
  for 15 minutes after 3 cancelled codes within 60 minutes (see Clarifications → Sign-in method change).
  Code sends are throttled per email and per IP, with identical responses for known and unknown emails
  (no account enumeration). Egyptian mobile-number validation (10 digits starting 10/11/12/15, leading 0
  accepted) is kept, but only applies to the now-optional phone field on the profile — it no longer gates
  sign-in. The design prototype's SMS-based flow and its 3-attempt limit are design gaps to fix — see
  Screen Coverage → Design gaps and `design/overrides.md`.
- Profile name requires at least 2 characters; city is required; Terms acceptance is required before Home is
  reachable.
- Vaccination status is **Overdue** once past its due date, **Due soon** within 14 days of it, and **Up to
  date** otherwise.
- The free cancellation window is 2 hours before the visit, resolved in Clarifications (see BKG-04).
- Technology choices (frameworks, libraries, infrastructure) are intentionally absent from this spec; they
  are governed by `docs/PRD.md` section 5 and by the constitution.
- **New, 2026-10-19 (`/speckit-analyze` finding C1)**: soft-deleted rows (`pets`, `profiles`) are hard-
  deleted 30 days after `deleted_at` by a daily purge job (`tasks.md` T217); `otp_attempts` rows are
  separately purged after **7 days** — an assumption, not a measured requirement, since no lock lasts
  longer than 15 minutes and nothing else reads that table once a verification cycle completes. Revisit
  if a future fraud-pattern-analysis need requires a longer retention window.

## Launch readiness

Items that do not block this spec or Phase 1 planning, but must be resolved before a production launch:

1. **Supabase data region and Egypt data-protection review** — is a non-Egyptian Supabase region (e.g.,
   Frankfurt) acceptable under Law No. 151 of 2020, and has a lawyer confirmed the cross-border storage and
   consent requirements before launch? (PRD open question 8; PRD section 14 Privacy and legal.)
2. **Sender domain DNS and deliverability test**: SPF, DKIM, and DMARC records for the chosen sending
   domain must be live and verified, and a deliverability test against Gmail, Outlook, and Yahoo inboxes
   must pass (not landing in spam) before launch — see `research.md`'s SMTP section.
3. **Apple private-relay sending-domain registration** (new, 2026-10-18): separately from item 2's general
   DNS work, the chosen sending domain must be registered with Apple under Certificates, Identifiers &
   Profiles → Services → "Sign in with Apple for Email Communication" before launch, or login-code emails
   sent to any `@privaterelay.appleid.com`/`private.icloud.com` address (owners who chose Apple sign-in
   with "Hide My Email," iOS only) will bounce instead of arriving — see `research.md` §14's addendum.
