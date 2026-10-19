# Design overrides: sign-in method change (2026-10-18)

**Purpose**: `design/system/` (the ported kit, once D00a copies it from the root-level `FurEver Design
System/` folder) is the visual source of truth and is **not edited** for this change — it still shows the
original phone/SMS sign-in flow because the kit itself was never updated. This file lists every place
where the built screens must deviate from the kit, so that `tasks.md`'s design-extraction scripts
(`extract-built`/`extract-i18n`, D00d) read this file and generate `design/screens/<ID>.md` stubs and
`packages/i18n` keys using the **overridden** copy below, not the kit's literal phone/SMS text.

This file does not change screen counts, story IDs, or FR numbers. It only changes what five existing
screens say and collect. All Arabic strings below are **draft** and require native review (`spec.md` Open
Decision 11) before shipping.

## Components: what's kept, what's new

- **`PhoneInput` is kept as-is.** It is no longer used for sign-in, but it still backs: the optional
  `phone` field on Complete profile (`/complete-profile`) and Edit profile (`/profile/account`), and the
  clinic-side phone/WhatsApp fields on `/clinic/profile`. No new component is needed for it.
- **No new "EmailInput" component is needed.** The email-entry field on `/sign-in` is the existing generic
  `Input` component (`type="email"`, `keyboardType="email-address"`, `autoCapitalize="none"`), the same one
  already used for text fields elsewhere in the kit. Only its label, placeholder, and validation message
  change.
- **`OtpInput` is kept as-is** for the 6-digit code entry on `/otp` — the component itself (6 boxes,
  auto-advance, paste support) is identical whether the code arrived by SMS or email; only the screen's
  surrounding copy changes (see below).

## Screen-by-screen overrides

### `/welcome`

| | Kit (phone era) | Override (email era) |
| --- | --- | --- |
| Primary CTA | "Get Started" → phone entry | "Get Started" → `/sign-in` (unchanged label, new destination) |
| Secondary CTA | "I Have an Account" → phone entry | "I Have an Account" → `/sign-in` (same screen serves both; AUTH-01) |
| Sub-copy (EN) | "Sign up with your phone number" | "Sign in with email, Google, or Apple" |
| Sub-copy (AR, draft) | "سجّل باستخدام رقم هاتفك" | "سجّل الدخول بالبريد الإلكتروني أو Google أو Apple" *(draft)* |

### `/sign-in` (replaces the kit's phone-entry screen)

| | Kit (phone era) | Override (email era) |
| --- | --- | --- |
| Field | Phone number (`PhoneInput`, Egyptian-format validation) | Email address (`Input`, `type="email"`, format validation only — no Egyptian-number rule applies) |
| Primary button (EN) | "Send code" | "Send code" (unchanged label, now sends to email via `verify-otp-guard`'s `send-code` action) |
| Primary button (AR, draft) | "إرسال الرمز" | "إرسال الرمز" *(unchanged, draft)* |
| Below the field (EN) | — | "Or continue with" → Google button, and (iOS only) Apple button |
| Below the field (AR, draft) | — | "أو الاستمرار باستخدام" *(draft)* |
| Helper text (EN) | "We'll text you a verification code" | "We'll email you a 6-digit code" |
| Helper text (AR, draft) | "سنرسل لك رمز تحقق برسالة نصية" | "سنرسل لك رمزًا مكونًا من 6 أرقام بالبريد الإلكتروني" *(draft)* |
| Validation error (EN) | "Enter a valid Egyptian mobile number" | "Enter a valid email address" |
| Validation error (AR, draft) | "أدخل رقم هاتف مصري صالح" | "أدخل بريدًا إلكترونيًا صالحًا" *(draft)* |

### `/otp` (same component, new surrounding copy)

| | Kit (phone era) | Override (email era) |
| --- | --- | --- |
| Title (EN) | "Verify your phone" | "Verify your email" |
| Title (AR, draft) | "تحقق من هاتفك" | "تحقق من بريدك الإلكتروني" *(draft)* |
| Sub-copy (EN) | "Enter the code sent to {phone}" | "Enter the code sent to {email}" |
| Sub-copy (AR, draft) | "أدخل الرمز المرسل إلى {phone}" | "أدخل الرمز المرسل إلى {email}" *(draft)* |
| Resend (EN) | "Resend code" (60s cooldown, unchanged) | "Resend code" (60s cooldown, unchanged) |
| New: "code not arriving" link (EN) | — | "Didn't get it? Check spam, or try again in a minute." (spec.md Edge Cases) |
| New: "code not arriving" link (AR, draft) | — | "لم يصلك الرمز؟ تحقّق من البريد غير المرغوب فيه، أو أعد المحاولة بعد دقيقة." *(draft)* |
| `CODE_CANCELLED` message (EN) | "Too many wrong attempts. Request a new code." | unchanged |
| `OTP_LOCKED` message (EN) | "This phone number is temporarily locked. Try again at {time}." | "This email address is temporarily locked. Try again at {time}." |
| `OTP_LOCKED` message (AR, draft) | "تم قفل رقم الهاتف مؤقتًا. حاول مرة أخرى في {time}." | "تم قفل البريد الإلكتروني مؤقتًا. حاول مرة أخرى في {time}." *(draft)* |

### `/complete-profile`

| | Kit (phone era) | Override (email era) |
| --- | --- | --- |
| Phone field | Required, Egyptian-format validated | **Optional** (`PhoneInput`, same Egyptian-format validation applied only if a value is entered — FR-004) |
| Field label (EN) | "Phone number" | "Phone number (optional)" |
| Field label (AR, draft) | "رقم الهاتف" | "رقم الهاتف (اختياري)" *(draft)* |
| Helper text (EN) | — | "We'll only use this if a clinic needs to reach you about an appointment." |
| Helper text (AR, draft) | — | "سنستخدمه فقط إذا احتاجت العيادة للتواصل معك بخصوص موعدك." *(draft)* |

### `/profile/account`

| | Kit (phone era) | Override (email era) |
| --- | --- | --- |
| Section | "Phone number" (verified badge, tap to change triggers re-verify) | "Phone number (optional)" (no verified badge — it is never verified; tap to change is a plain edit, no OTP flow) |
| Linked accounts row | "Phone" listed as a sign-in method | "Phone" removed from linked sign-in methods; Google and "Email code" shown instead (AUTH-06) |
| New action (EN) | — | "Add Google account" button, shown only when Google isn't already linked |
| New action (AR, draft) | — | "إضافة حساب Google" *(draft)* |
| New action (EN) | — | "Add email sign-in" button, shown only when email/code isn't already linked (e.g. a Google-only account) |
| New action (AR, draft) | — | "إضافة تسجيل الدخول بالبريد الإلكتروني" *(draft)* |
| Conflict message (EN) *(new, 2026-10-19, `IDENTITY_ALREADY_LINKED`)* | — | "This account is already linked to a different FurEver profile. Sign in with it directly instead." |
| Conflict message (AR, draft) | — | "هذا الحساب مرتبط بالفعل بملف تعريف آخر على FurEver. سجّل الدخول به مباشرة بدلاً من ذلك." *(draft)* |

### Onboarding copy (summary/progress strings, not a single screen)

| | Kit (phone era) | Override (email era) |
| --- | --- | --- |
| Progress step label (EN) | "Phone" | "Email" |
| Progress step label (AR, draft) | "الهاتف" | "البريد الإلكتروني" *(draft)* |

## How this file is consumed

- `tasks.md` T185-T191 (D02 screens, Splash through Complete profile) and T168-T170 (route guards/
  onboarding orchestration) implement the rows above directly; T182's Zod schemas encode "phone optional,
  Egyptian-format check applied only when present." The new Account-screen rows above (Add Google/Add
  email sign-in/conflict message) are implemented by T195 (Account screen), T174-T176 (linking logic,
  conflict mapping, E2E test). *(Numbers current as of the 2026-10-19 remediation pass; see `tasks.md`'s
  header for the full renumbering history.)*
- D00d's `extract-built`/`extract-i18n` scripts, when they run, must treat this file as the override source
  for the five screens and the onboarding-copy row listed above: any kit-sourced string for those exact
  screens is replaced by the row in this file before being written to `design/screens/<ID>.md` or
  `packages/i18n`. Every other screen continues to extract from the kit unchanged.
- `design/system/` itself is never edited to reflect this change — it continues to show the original
  phone/SMS kit screens as historical reference material.
