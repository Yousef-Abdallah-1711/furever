# Research: FurEver Platform (Phase 1)

**Date**: 2026-10-18 · **Feature**: [spec.md](./spec.md) · **Constitution**: v1.1.0

Every entry below follows Decision / Rationale / Alternatives considered. Findings were checked via web
search on 2026-10-18 against official and third-party sources; §1-2 (version pins) were found to rely on
non-official sources and are corrected below to defer the actual pin to D00a, which must use official
sources only. Sources are linked inline for every other finding.

## 1. Mobile runtime: Expo SDK / React Native / Reanimated / NativeWind version matrix

- **Decision**: **Do not pin version numbers during planning.** The first D00 task (D00a, see `plan.md`)
  independently verifies the current stable versions **directly from official sources only** —
  [expo.dev](https://expo.dev) (SDK changelogs and versioning docs), [reactnative.dev](https://reactnative.dev),
  [nativewind.dev](https://www.nativewind.dev) — builds a compatibility matrix (Expo SDK ↔ React Native ↔
  Reanimated ↔ NativeWind ↔ Node), and pins the exact versions in `package.json` before any other D00 work
  proceeds.
- **Rationale**: This research pass (2026-10-18) originally cited third-party blog posts (Medium, dev.to) to
  claim "SDK 54 is the newest stable" — that claim is already wrong: the official npm release feed for the
  `expo` package shows **SDK 56 and SDK 57 (57.0.x) as stable as of July 2026**, several trains ahead of
  what the blog sources described. Blog posts lag or misreport fast-moving release trains and are not a
  safe basis for a pin the entire monorepo depends on. The only way to get this right is to check the
  official source at the moment D00 actually runs, not at planning time.
- **Alternatives considered**: Pinning a specific number now (e.g. SDK 57) anyway — rejected, because by the
  time D00 executes, a newer SDK may already be GA, and the React Native/Reanimated/NativeWind/Node
  compatibility matrix needs verifying together as a set, not assumed from a document written weeks or
  months earlier.
- **Sources**: deliberately none — that is the point of this decision. D00a's own task output must record
  its sources (expo.dev, reactnative.dev, nativewind.dev) at execution time, not reuse this document's.

## 2. Web framework: Next.js version

- **Decision**: **Do not pin a version number during planning.** D00a verifies the current stable Next.js
  release directly from [nextjs.org](https://nextjs.org) (its own release notes/blog, not a third-party
  aggregator) as part of the same compatibility-matrix task, and pins the exact version alongside the
  matching React version.
- **Rationale**: Same reasoning as §1 — this plan previously cited "16.4" sourced from a dev.to tutorial and
  a third-party release-tracking aggregator (releasebot.io), neither an official source. Those citations are
  removed rather than carried forward as a version pin.
- **Alternatives considered**: None — this is a process correction, not a technology choice.
- **Sources**: none cited here; see D00a's own output for the sources it actually used.

## 3. Verification-code lockout (PRD amendment 3, rewritten 2026-10-18 for email — was phone)

- **Decision**: Supabase Auth's native email-OTP controls (60-second resend interval, configurable expiry,
  and — once custom SMTP is enabled — a default 30-new-auth-emails-per-hour project ceiling, raisable under
  Authentication > Rate Limits) are **not sufficient** to implement the spec's exact rule (cancel a code
  after 5 wrong attempts; lock an **email address** for 15 minutes after 3 cancelled codes in 60 minutes;
  throttle sends per email and per IP; identical response for known/unknown emails). GoTrue has no
  per-token failed-attempt limit today — the `GOTRUE_SMS_OTP_MAX_ATTEMPTS` proposal referenced in the prior
  revision of this section was SMS-specific and is moot now that Phase 1 has no SMS path at all; no
  equivalent per-email-OTP-attempt setting exists either, as of 2026-10-18. **Build a small Edge Function
  wrapper** (`verify-otp-guard`, exposing `send-code` and `verify-code` actions) in front of
  `auth.signInWithOtp`/`auth.verifyOtp` that tracks attempt count and cancellation count per normalized
  email **identifier** in the `otp_attempts` table, rejecting with `CODE_CANCELLED` / `OTP_LOCKED` /
  `OTP_SEND_RATE_LIMITED` before calling Supabase Auth once a threshold is hit, and expose the unlock time
  in the error payload. The guard also enforces the no-enumeration rule: `send-code` returns the same
  shape and status whether or not the email already has an account.
- **Rationale**: The spec's rule (Clarifications, 2026-10-18 "Sign-in method change") is a hard product
  requirement; the platform doesn't do it for us, so the deviation must be designed, not assumed away. This
  is recorded as a PRD amendment, not silently patched.
- **Alternatives considered**: Rely on Supabase's custom-SMTP rate ceiling alone — rejected, it's
  project-wide (new auth emails per hour), not per-email-address, and doesn't match the 5-attempt /
  3-cancellation / 15-minute shape or the no-enumeration requirement at all.
- Sources: [Supabase Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits), [GoTrue issue
  #2819: per-token failed-attempt limit proposal](https://github.com/supabase/auth/issues/2819) (SMS-era
  context, kept for history).

## 4. Email delivery (rewritten 2026-10-18, replaces the Twilio Verify geo-permissions section — Twilio is removed from Phase 1 entirely)

- **Decision**: Configure **custom SMTP** in Supabase for every Auth email (login code, staff invite,
  password reset) in staging and production. Supabase's built-in email service sends at most **2 emails
  per hour per project**, shared across every email type, and only delivers to addresses that are members
  of the project's own organization — it explicitly states it "is not meant for production use." Custom
  SMTP replaces that with a provider-managed send path and starts at a 30-new-auth-emails-per-hour default
  (raisable). **Provider comparison**, prices read directly from each provider's own pricing page on
  2026-10-18 (not invented, not from aggregator sites):
  | Provider | Free tier | Paid entry point (official page) |
  | --- | --- | --- |
  | [Resend](https://resend.com/pricing) | 3,000 emails/month (100/day cap) | $20/month for 50,000 emails |
  | [Amazon SES](https://aws.amazon.com/ses/pricing/) | none (pay-as-you-go) | Essentials tier: $0.16 per 1,000 emails (0-10M/month) |
  | [Postmark](https://postmarkapp.com/pricing) | 100 emails/month | Basic: $15/month for 10,000 emails |
  | [Brevo](https://www.brevo.com/products/transactional-email/) | 300 emails/day (~9,000/month) | Starter: $9/month |
  | [Mailgun](https://www.mailgun.com/pricing/) | limited free tier | Foundation: $35/month for 50,000 emails |
  | [SendGrid](https://www.twilio.com/en-us/products/email-api/pricing) | 100 emails/day, 60-day trial | Essentials: $19.95/month for 50,000-100,000 emails |
  No recommendation is made here — this is a business/engineering decision (`spec.md` Open Decisions item
  7) — the table exists so that decision can be made from real numbers instead of guesses.
- **Sender domain DNS**: whichever provider is chosen, add an **SPF** TXT record naming that provider
  (e.g. `v=spf1 include:_spf.<provider>.com ~all`), the **DKIM** TXT record(s) the provider generates, and
  a **DMARC** TXT record at `_dmarc.<domain>` starting at `p=none` (e.g.
  `v=DMARC1; p=none; rua=mailto:admin@<domain>`). Misconfigured or missing records risk the email landing
  in spam. DNS propagation can take minutes to 72 hours depending on the DNS host.
- **Bounce/complaint handling**: not detailed further here — each provider's own webhook/suppression-list
  mechanism should be wired once the provider is chosen; out of scope for this research pass.
- **Deliverability testing**: before launch, send test codes to real Gmail, Outlook, and Yahoo inboxes and
  confirm none land in spam — this is `spec.md`'s Launch readiness item 2.
- **Local development**: use Supabase's local email inbox (the CLI's built-in SMTP catcher) — no real email
  is sent from a developer machine; this is what D02's E2E tests read the code from.
- Sources: [Supabase custom SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp),
  [Resend pricing](https://resend.com/pricing), [Amazon SES pricing](https://aws.amazon.com/ses/pricing/),
  [Postmark pricing](https://postmarkapp.com/pricing),
  [Brevo transactional email](https://www.brevo.com/products/transactional-email/),
  [Mailgun pricing](https://www.mailgun.com/pricing/),
  [Twilio SendGrid Email API pricing](https://www.twilio.com/en-us/products/email-api/pricing).

## 5. Google and Apple sign-in on Expo: native modules and build requirements

- **Decision**: `@react-native-google-signin/google-signin` and `expo-apple-authentication` both require a
  **custom development build** (`expo-dev-client`) — neither works in Expo Go. Google: three OAuth clients
  (Web, Android with per-keystore SHA-1, iOS); the Web client ID is the `webClientId` passed to
  `GoogleSignin.configure()` and is also what's registered with Supabase's Google provider. Apple: a
  securely generated nonce is hashed and passed to `AppleAuthentication.signInAsync`, then the raw nonce
  accompanies `signInWithIdToken({ provider: 'apple', token, nonce })`.
- **Rationale**: This confirms PRD section 6's flow is current and sets a D00/D02 dependency: EAS
  development builds must exist before Google/Apple sign-in can be tested at all, so device-based testing
  of AUTH-02/03 cannot start on Expo Go.
- **Alternatives considered**: `expo-auth-session` generic OAuth — rejected for Google on native, since the
  PRD and current guidance both prefer the native one-tap library for a better UX and Play Integrity
  compatibility.
- Sources: [Expo Google authentication guide](https://docs.expo.dev/guides/google-authentication/),
  [react-native-google-signin](https://github.com/react-native-google-signin/google-signin).

## 6. Mobile session storage: the `expo-secure-store` size limit

- **Decision**: Use the hybrid pattern the PRD already specifies: generate a 32-byte AES key with
  `expo-crypto`, store the key in `expo-secure-store`, encrypt the Supabase session (access + refresh token
  + user object) with `aes-js`, and store the ciphertext in `AsyncStorage`. Add a one-time migration path
  (check SecureStore first, fall back to legacy AsyncStorage plaintext, re-save encrypted, delete plaintext)
  for any pre-hybrid test builds.
- **Rationale**: Multiple current sources confirm a Supabase session (access token + refresh token + user
  object) routinely exceeds what `expo-secure-store` can reliably hold on iOS, even though the hard
  "2048-byte" ceiling has been softened in Expo's own docs; the hybrid encryption pattern is the documented,
  widely-used workaround and matches what the PRD already specifies.
- **Alternatives considered**: Chunking the session into ≤2000-byte SecureStore slots — rejected as more
  complex than the hybrid pattern for no real benefit.
- Sources: [Expo SecureStore limits](https://www.shipnative.dev/blog/expo-secure-store), [LargeSecureStore
  issue discussion](https://github.com/focalstudio/focal-studio-app-template/issues/66).

## 7. Realtime live queue: Supabase private channels

- **Decision**: Use Supabase Realtime **private channels** (`channel(name, { config: { private: true } })`)
  for `queue:clinic:{clinic_id}` and `queue:doctor:{doctor_id}:{date}`, authorized by an RLS policy on
  `realtime.messages`, with the client calling `supabase.realtime.setAuth()` with the current JWT before
  subscribing. For the clinic board, subscribe to Postgres Changes on `queue_tickets` filtered by
  `clinic_id`; for the owner's per-doctor "waiting count" broadcast, use `realtime.broadcast_changes()` from
  a trigger as the PRD specifies.
- **Rationale**: This is the current, documented way to make Realtime respect RLS instead of trusting the
  client; it matches the PRD's intent exactly (owners must never see another owner's queue data).
- **Risk noted**: an open 2026-10 GitHub issue describes private broadcasts being dropped under client
  reconnect storms sharing an authorization-error breaker with server-side broadcasts. **Mitigation**: the
  PRD's existing graceful-degradation rule (poll every 15 seconds if Realtime drops) already covers this —
  no new design needed, just confirm the polling fallback is actually implemented, not merely documented.
- **Alternatives considered**: Public channels filtered client-side — rejected outright, it is the exact
  "owner sees another owner's data" leak the constitution and spec both forbid.
- Sources: [Realtime Broadcast and Presence Authorization changelog](https://supabase.com/changelog/22484-realtime-broadcast-and-presence-authorization),
  [Realtime authorization guide](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/realtime/authorization.mdx),
  [GitHub issue #2339: broadcast drops under reconnect storm](https://github.com/supabase/realtime/issues/2339).

## 8. Role claim in the JWT: Custom Access Token Hook

- **Decision**: Implement the Custom Access Token Hook as a `security definer` Postgres function that reads
  `profiles.role` and injects it as `user_role` via `jsonb_set` on the token's claims, matching PRD section
  6. RLS policies read it as `(select auth.jwt() ->> 'user_role')`.
- **Rationale**: This is exactly the currently documented Supabase pattern for RBAC; no deviation needed.
- **Alternatives considered**: A separate `user_roles` join table read per-request instead of a JWT claim —
  rejected, it costs a join per RLS-protected query at scale, which contradicts constitution V (fast RLS).
- Sources: [Supabase Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook),
  [Custom Claims & RBAC guide](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac).

## 9. pgTAP and `supabase test db`

- **Decision**: pgTAP ships by default as a Postgres extension in the Supabase local stack; tests live in
  `backend/supabase/tests/*.sql` and run with `supabase test db` (CLI minimum v1.11.4, pin the current patch
  at D00 start) both locally and in the GitHub Actions PR workflow via `supabase/setup-cli@v1` →
  `supabase start` → `supabase test db`.
- **Rationale**: Matches PRD section 14's testing strategy exactly; no deviation.
- Sources: [Supabase local testing overview](https://supabase.com/docs/guides/local-development/testing/overview),
  [Supabase CLI releases](https://github.com/supabase/cli/releases).

## 10. Docker on Windows: file watching and bind-mount performance

- **Decision**: Document two supported setups in `quickstart.md` and let the developer pick one:
  1. **Preferred** — clone the repo inside the WSL2 Linux filesystem (e.g., `\\wsl$\Ubuntu\home\<user>\furever`,
     not `H:\...`) and run Docker Desktop against that path, so bind mounts are native ext4 and get real
     `inotify` events (fast HMR, no polling needed).
  2. **Fallback** — keep the repo on the Windows drive (as this project currently is) and turn on
     polling-based watchers for every dev process that watches files inside a container: Next.js dev server
     with `WATCHPACK_POLLING=true`, and the Metro bundler service (if containerized) with Metro's
     `watchFolders`/polling config. Document the expected HMR latency hit so nobody files it as a bug.
  Use named Docker volumes for `node_modules` and the pnpm store either way — mixing a Windows bind mount
  for source with native volumes for `node_modules` is the standard fix for most of the remaining slowness.
- **Rationale**: Windows-drive bind mounts into WSL2 containers do not deliver `inotify` events at all,
  so without polling, file-save-triggered rebuilds simply won't fire; this project's actual working directory
  is `H:\Projects\Furever`, so the fallback path is the realistic default unless the team relocates the
  working copy.
- **Alternatives considered**: Mutagen or similar sync tools — rejected as unnecessary extra moving parts
  for a project of this size; polling is adequate.
- Sources: [Docker Desktop WSL2 best practices](https://docs.docker.com/desktop/features/wsl/best-practices/),
  [Docker bind mounts in WSL on Windows](https://snippets.therealvan.com/docker-bind-mounts-in-wsl-on-windows/),
  [WSL2 Docker dev container performance for monorepos](https://blog.eduonix.com/2026/09/unlock-peak-wsl2-docker-dev-containers-performance-for-js-ts-monorepos/).

## 11. Expo Metro bundler in a container

- **Decision**: Do not containerize the Metro bundler as the primary way to run mobile locally. Run
  `expo start` directly on the Windows host (Node installed natively via the pinned `.nvmrc` version) so the
  Android emulator (also host-side) and physical devices on the LAN can reach Metro without Docker's network
  layer in the way. Offer an *optional* `metro` service in `docker-compose.yml` behind a `tools` profile only
  for CI smoke-testing that the bundler starts, with `--tunnel` documented as the fallback when LAN access is
  blocked (corporate network, VPN).
  iOS builds cannot run locally at all (no macOS) — EAS Build is mandatory for any iOS binary, device or
  simulator.
- **Rationale**: Metro's file watching and the Android emulator's ADB networking are both easiest when
  nothing is virtualized between the developer's machine and the running app; Docker does not help here and
  adds failure modes for no benefit.
- **Alternatives considered**: Full containerized Metro with host networking — rejected: Windows Docker
  Desktop's host networking support is inconsistent enough that it isn't worth the setup complexity for a
  single-developer-machine workflow.

## 12. How Supabase email OTP works (new, 2026-10-18 sign-in method change)

- **Decision**: Configure the login-code email template to use `{{ .Token }}` (the 6-digit OTP Supabase
  generates), not `{{ .ConfirmationURL }}` (the magic-link variable) — e.g. "Your FurEver code is
  `{{ .Token }}`." This is what makes the flow "type a code," not "click a link," per the settled decision.
  Code length is fixed at 6 digits by Supabase; expiry is configurable (Auth settings or `config.toml`'s
  `[auth.email]` block) — default to 10 minutes per `spec.md`'s settled default. Email-send rate limiting
  (30/hour default once custom SMTP is enabled) is configured in Authentication > Rate Limits in the
  dashboard, or the equivalent `config.toml` keys for local/self-hosted. None of this requires touching
  Supabase Auth's source — it's configuration, not a fork.
- **Rationale**: Confirmed directly from Supabase's own docs — `{{ .Token }}` and `{{ .TokenHash }}` are
  documented, first-class template variables specifically for building an OTP flow instead of a magic-link
  flow.
- Sources: [Supabase Auth email templates](https://supabase.com/docs/guides/auth/auth-email-templates),
  [Passwordless email sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless).

## 13. Identity linking by verified email (updated, T121 spike, 2026-10-26)

- **Documented automatic behavior**: Supabase Auth documents automatic linking as the default strategy:
  when a new OAuth sign-in has an email matching an existing user, Supabase looks up the matching user
  and links the OAuth identity. The docs explain that unverified email identities are not safe linking
  targets and describe removing unconfirmed identities when a verified identity can be linked. This
  supports the intended same-verified-email email/Google case without enabling Manual Linking or calling
  `linkIdentity()` explicitly.
- **Local configuration observed for T121**: the host-side local Auth settings endpoint reported
  `email=true`, `google=false`, and `apple=false`. T121 also confirmed the historical config-file value
  was `[auth].enable_manual_linking = false`. T122 then changed only that setting to
  `true` in `backend/supabase/config.toml`; independent TOML parsing confirmed the file value. The local
  Auth container has not restarted, so runtime application of `true` is unconfirmed. No Google or Apple
  OAuth credentials are configured in the local project. Therefore the automatic email/Google behavior
  is documented, but FurEver cannot runtime-confirm it against the local project while Google is
  disabled. These are local observations; no staging or production project was accessed, so hosted
  settings remain unknown.
- **Explicit identity addition**: Supabase documents Manual Linking (currently marked beta) and
  `linkIdentity()` for linking OAuth identities. This is OAuth-specific. The current Identity Linking
  FAQ documents adding email/password auth to an OAuth account with `updateUser({ password })`; the
  same FAQ says email signup after OAuth with the same address is protected against account
  enumeration. Separately, the anonymous-conversion guide documents converting an anonymous account
  by setting an email with `updateUser({ email })` and completing email verification (OTP/link); this
  is not evidence for linking a second email identity to an established Google-only account. Manual
  Linking is disabled by default and must be enabled in project Auth configuration (or with
  `GOTRUE_SECURITY_MANUAL_LINKING_ENABLED=true` when self-hosting). T122 set the local config-file
  value to true, but the local Auth container has not restarted and runtime state is unconfirmed. If
  this feature ships, the equivalent hosted project toggle is also a prerequisite; the local setting
  does not change hosted projects.
- **T179 contract mismatch, unresolved**: T179 plans to let a signed-in Google-only owner attach an
  email-code identity using `verify-otp-guard`'s `send-code`/`verify-code` flow. The documented manual
  `linkIdentity()` path is OAuth-specific, and `updateUser({ password })` adds password authentication
  to an OAuth account. The `updateUser({ email })` plus verification example in the anonymous-conversion
  guide is for converting an anonymous account. These docs do not establish whether `updateUser({ email })`
  or any guarded code flow attaches a separate email identity to an established Google-only account.
  Implementation must confirm the owner-approved secure sequence and the T138/T139 contract; do not
  assume the guard flow is sufficient or substitute an undocumented API sequence. The T179 email-code
  linking contract remains unresolved; this research does not choose an implementation.
- **Conclusion**: Whether `updateUser({ email })` or a guarded code flow attaches a separate email
  identity to an established Google-only account remains unestablished; T179 stays unresolved.
- **Scope and alternatives**: This spike confirms the documented default and current local settings; it
  does not exercise OAuth locally or settle T179's email-code linking design. No custom account-merge
  behavior or linking API flow is selected here.
- **Official sources**: [Supabase Auth: Identity Linking](https://supabase.com/docs/guides/auth/auth-identity-linking),
  [Supabase Auth: Anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous),
  [JavaScript API reference: updateUser](https://supabase.com/docs/reference/javascript/auth-updateuser),
  [Supabase CLI config reference](https://supabase.com/docs/guides/local-development/cli/config).

## 14. Apple private relay email (new, 2026-10-18)

- **Decision**: Treat an Apple Sign in with Apple hidden-email response as a standalone identity. When a
  user chooses "Hide My Email," the app receives and stores a relay address
  (`<random>@privaterelay.appleid.com`, or the newer `private.icloud.com` domain) instead of the person's
  real address — Apple never shares the real one. This relay address is what FurEver stores as that
  account's email; it is **not** the same string as any Gmail/other address the same human might use
  elsewhere, so it cannot automatically link to an email-code or Google account the same way two matching
  real addresses would (§13). This matches the spec's settled decision exactly.
- **Rationale**: Confirmed from Apple's own developer-forum guidance and the relay domain documentation;
  this is Apple's documented design, not a Supabase limitation.
- Sources: [Apple Developer Forums: Private Relay Email](https://developer.apple.com/forums/thread/133707),
  [Apple Developer News: new private-relay domain](https://developer.apple.com/news/?id=sus6t6ab).
- **Addendum, this fix pass (2026-10-18) — the sending domain must be separately registered with Apple**:
  confirmed from Apple's own account documentation
  (`https://developer.apple.com/help/account/capabilities/configure-private-email-relay-service/`): email
  sent **to** a `@privaterelay.appleid.com`/`private.icloud.com` address is not automatically deliverable
  just because the recipient exists — Apple's relay only forwards mail from **registered** sources. This
  is a separate registration from the SPF/DKIM/DMARC work already planned in §4 for general deliverability
  (`spec.md` Launch readiness item 2); it is Apple-specific and done in a different place.
  - **Decision**: register FurEver's chosen sending domain (once T145 picks a provider) under **Certificates,
    Identifiers & Profiles → Services → "Sign in with Apple for Email Communication" → Configure** in the
    Apple Developer portal, *in addition to* the general SPF/DKIM/DMARC DNS records from §4. Apple
    validates the registered domain's SPF record (and/or DKIM, if the ESP signs with its own domain) and
    requires the envelope-sender domain to match the registered domain exactly.
  - **Consequence if skipped**: any login-code email sent to an Apple-hidden email (every user who chose
    "Hide My Email" during Sign in with Apple, iOS only) **bounces** rather than being delivered — those
    users could never complete email-code sign-in on an account first created via hidden-email Apple
    sign-in, even though the rest of the system treats their relay address as an ordinary email (§13/§14
    above). This only affects users who both (a) signed in with Apple and chose email hiding, and (b) later
    try the separate email-code method on that same relay address — a real but narrow edge case, not every
    Apple user.
  - **Action**: added as `spec.md` Launch readiness item 3 and as a new D08 consideration; this is a
    one-time Apple Developer portal configuration step, not a code change, and has no `tasks.md` task
    number of its own — it belongs with the other manual, non-code store/account setup already tracked in
    D00g/D02's manual prerequisites.
  - Sources: [Configure private email relay service](https://developer.apple.com/help/account/capabilities/configure-private-email-relay-service/).

## 15. Local email inbox for E2E tests (new, 2026-10-18)

- **Decision**: Maestro (mobile) and Playwright (web) E2E tests for the email-code flow read the code from
  Supabase's **local development email inbox** (the CLI's built-in mail catcher, exposed over HTTP on the
  local stack) rather than parsing a real inbox. Build one small shared test helper package used by both
  test runners to fetch the latest email to a given address and extract the 6-digit code from it.
- **Rationale**: No real email is sent locally (`plan.md` D00b/D02), so this is the only way an automated
  test can complete the flow without a live SMTP provider in CI; it also means CI never depends on
  third-party email deliverability.
- **Alternatives considered**: Mocking `auth.signInWithOtp` entirely in tests — rejected, it would skip
  testing the actual `verify-otp-guard` Edge Function path, which is the part most likely to have bugs.

## 16. App store login rule check (new, 2026-10-18)

- **Decision**: Re-verify Apple's **App Store Review Guideline 4.8** against its live text close to
  submission (not just at planning time). As read on 2026-10-18: an app that uses a third-party/social
  login (Google, in FurEver's case) to set up or authenticate the primary account must also offer an
  equivalent login meeting three conditions — collect only name and email, let the user keep the email
  private, and not track for ads without consent. **Sign in with Apple already satisfies all three**, so
  FurEver's current method set (Google + email-code + Apple) already complies — email-code sign-in itself
  is not a "third-party social login service" under this guideline at all, so it isn't the thing being
  checked; Google is, and Apple is already present as its equivalent.
- **Rationale**: This confirms the settled decision to keep Apple sign-in is not just a UX choice but
  closes a real App Store compliance requirement — recorded as `spec.md`'s Open Decision item 8 (re-verify
  the live guideline text near submission, since Apple does amend these).
- Sources: [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

## 17. Is the email-code guard bypassable? (new, this fix pass, 2026-10-18)

- **The question**: `verify-otp-guard` (Edge Function, §12/contracts/edge-functions.md) is where the
  5-wrong-attempt cancellation and 3-cancelled-code/15-minute lockout are enforced. But Supabase Auth's own
  email-OTP endpoints — `POST /auth/v1/otp` (send) and `POST /auth/v1/verify` (verify) — are public GoTrue
  endpoints reachable with the project's public **anon key**, the same key every mobile/web client already
  ships. Nothing stops a client (or anyone with the anon key, which is not secret) from calling those two
  endpoints directly and skipping `verify-otp-guard` entirely. If Supabase's own limits on those endpoints
  are looser than our rule, the guard's lockout is enforced only for traffic that politely goes through it.
- **T120 local development spike (2026-10-26; partial local observations)**:
  - **Delegated sandbox limitation**: the prior Codex dispatch could not access Docker, so its note
    incorrectly reported that the local stack and Auth endpoints could not be inspected. The host-side
    orchestration commands used for the observations below could access the running local Supabase stack.
  - **Observed facts**: the project-pinned Supabase CLI was version 2.121.0. Sanitized status reported
    API `http://127.0.0.1:54321` and Mailpit `http://127.0.0.1:54324`; local keys were present and were
    not printed. Using only a synthetic address (`t120-20261026@example.test`) and the local anon key,
    three direct `POST /auth/v1/otp` requests spaced 1.2 seconds apart each returned HTTP 200, and the
    local inbox contained three messages. Six direct `POST /auth/v1/verify` requests with the same
    deliberately invalid token each returned HTTP 403 with `error_code=otp_expired`.
  - **Limits and inference**: the three HTTP 200 responses show that the direct send endpoint accepted
    three requests for one synthetic test address. They do not establish that three codes were cancelled
    under the policy lockout; no wrong-code flow was completed. The six `otp_expired` responses do not
    provide evidence about the wrong-attempt counter, because the current local email template rendered a
    sign-in link rather than a visible numeric code. We could not test five wrong attempts followed by the
    correct code, or directly observe cancellation or reset of a valid code. Keep the direct verification
    portion of T120 open for retest after the OTP email template is configured.
  - **A+ coverage**: these observations do not test CAPTCHA or a longer OTP length and do not change the
    existing A/A+/B/C options or recommendation. No mitigation is chosen by this spike.
- **What Supabase Auth enforces natively on the direct path** (from the official rate-limits page):
  - `POST /auth/v1/otp` (send): default **60-second window per user** (i.e. per email address) before a
    new code can be requested for that address. Configurable, but there is **no concept of "3 cancelled
    codes locks this address for 15 minutes"** — Supabase will issue a fresh code for the same email every
    60 seconds, indefinitely, from any IP.
  - `POST /auth/v1/verify`: default **30 requests per 5 minutes per IP address**, with bursts up to 30.
    This is **per IP, not per email** — it does not track or limit wrong guesses against one specific
    email/code the way our "5 wrong attempts cancels the code" rule does, and an attacker can multiply
    total guesses by rotating IPs.
  - Email sending itself is capped at 2/hour only on Supabase's **built-in** email provider; once custom
    SMTP is configured (T147), that project-wide cap no longer applies and the per-user 60s send limit
    above is the only native throttle on sending.
  - **Conclusion**: Supabase's native limits are real but do not match our policy. A direct-path caller is
    not blocked by Supabase itself from repeatedly requesting new codes for a target email (defeating our
    3-cancelled-code lockout) or from guessing a code from several IPs in parallel (defeating our 5-wrong-
    attempt cancellation, up to Supabase's own 30/5min/IP verify ceiling per IP used).
- **Does a Send Email hook close this?** No. The official Send Email Hook
  (`https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook`) only replaces **where the email is
  sent from** — it receives Supabase's already-generated `token`/`token_hash` and lets a developer deliver
  it via their own provider. It has no effect on `/auth/v1/otp` or `/auth/v1/verify`'s public reachability
  or rate limits, and it cannot intercept or override the verify step at all. This option is useful for
  template/provider control (which this project already needs for bilingual templates, T147) but it is
  **not a mitigation** for the bypass question.
- **Does `auth.admin.generateLink()` close this?** Partially, and only for the send side.
  `supabase.auth.admin.generateLink()` is a **service-role-only** Admin API method
  (`https://supabase.com/docs/reference/javascript/auth-admin-generatelink`) that can mint a sign-in
  token/OTP server-side without the client ever calling the public `/auth/v1/otp` endpoint from
  `verify-otp-guard`'s own server-side call. But this does not stop a *different*, malicious caller from
  independently calling the public `/auth/v1/otp` and `/auth/v1/verify` endpoints for the same target email
  with their own anon-key client — those endpoints stay open regardless of how our own Edge Function
  chooses to generate codes, because Supabase does not expose a per-provider "disable the public send/verify
  endpoints, admin-callers only" switch. Using `generateLink` changes who issues *our* code; it does not
  close the public door.
- **The one design that fully closes it**: have `verify-otp-guard` **not use Supabase Auth's OTP
  primitives for the security-sensitive part at all**. The guard generates its own random 6-digit code
  server-side (service role), stores only its hash (plus expiry) — most naturally as new columns on
  `otp_attempts`, next to the existing lockout counters — sends it through the project's own SMTP
  configuration (T145) independently of `auth.signInWithOtp`, and verifies the user's input against that
  stored hash itself, inside the same Edge Function that already enforces the 5-attempt/3-cancellation
  rules. Only after that custom check succeeds does the guard mint a real Supabase session, using a
  service-role-only path (`auth.admin.generateLink()` to get a verified action link/token, immediately
  redeemed server-side, or an equivalent admin-only session-issuance call) that a public anon-key caller
  cannot reach. Under this design, Supabase's own `/auth/v1/otp`/`/auth/v1/verify` endpoints are simply
  **not part of the sign-in flow at all** — a bypasser calling them directly gets Supabase's native, unused
  OTP mechanism, not an account.
- **Option A+ (added 2026-10-19, `/speckit-analyze` finding C2 — two more options evaluated, from official
  docs, neither chosen)**:
  - **CAPTCHA protection**: Supabase Auth supports **hCaptcha** and **Cloudflare Turnstile**, toggled under
    Project Settings → Authentication → Bot and Abuse Protection, with `signInWithOtp()` and other auth
    calls accepting an optional `captchaToken`. The official docs and widget SDKs (`@hcaptcha/react-hcaptcha`,
    Turnstile's JS widget) are documented for **web** usage; nothing in the official Supabase or
    hCaptcha/Turnstile docs found during this research describes a first-party React Native integration —
    a mobile app would need to render the challenge inside a `WebView`, which is a real engineering cost
    and a UX departure from the current native-feeling screens, not a drop-in toggle. CAPTCHA also only
    gates `send-code`-equivalent calls that pass a token; it does not, by itself, add a per-email verify
    cap — it raises the cost of *automated* abuse, not of a scripted attacker willing to solve challenges.
  - **Longer OTP length**: `auth.email.otp_length` (dashboard: Authentication → Sign In / Providers → Email)
    defaults to **6** and accepts **6-10**. Raising it (e.g. to 8-10 digits) multiplies the search space
    10,000× per extra 2 digits, making a *successful* guess within Supabase's native 30/5min/IP verify
    ceiling astronomically less likely — but it does **not** close the structural gap §17 describes: the
    3-cancelled-lockout rule is still unenforced on the direct path, and an attacker can still request
    unlimited new codes for a target email every 60 seconds regardless of code length. It raises the cost
    of brute-forcing one code; it does not stop someone from skipping the guard's bookkeeping entirely.
  - **Where this leaves A+**: both are real, officially-documented mitigations worth doing regardless of
    which option is chosen — but **neither fully closes the bypass on its own**, same conclusion as A and
    B. They could be layered on top of Option C (defense in depth) or substituted for part of Option A if
    the owner judges the residual risk acceptable; that judgment call is exactly what stays undecided here.
- **Options and trade-offs** (no recommendation is final here — **this is an owner decision**, per the
  explicit instruction that produced this section):

  | Option | What it is | Closes the bypass? | Cost |
  | --- | --- | --- | --- |
  | A. Accept native limits | Do nothing extra; rely on 60s/email send + 30/5min/IP verify | **No** — does not enforce the 3-cancelled-lockout rule or a true per-email verify cap; a patient, IP-rotating attacker is not meaningfully slowed | None (already true today) |
  | A+. CAPTCHA and/or longer OTP length *(new)* | hCaptcha/Turnstile on send; `auth.email.otp_length` raised to 8-10 | **No** — raises attacker cost (automation, brute-force odds) but doesn't enforce the 3-cancelled-lockout rule or add a per-email verify cap | Low-Medium — CAPTCHA needs a `WebView` on mobile (no native SDK documented); OTP length is one dashboard setting |
  | B. Send Email hook / `generateLink` only | Control delivery and who *generates* our own code server-side | **No** — the public endpoints remain reachable for any email regardless | Low — useful for templates anyway (T145/T147), but not a security fix |
  | C. Custom-code design | Guard owns code generation, hashing, and verification; Supabase Auth OTP primitives unused for this flow; session minted via an admin-only path | **Yes** | Highest — new columns/logic in `otp_attempts`, a session-issuance path that doesn't exist yet, more surface to test (T138/T149) |
- **Recommendation (non-binding, for the owner to confirm or override)**: Option C, optionally layered with
  A+'s longer OTP length as cheap defense in depth. Option C is the only one of the four that actually
  enforces the policy `spec.md`/`research.md` §3 already commits to; A, A+, and B are real but partial and
  would leave the stated lockout rule unenforceable against a bypasser who knows the anon key is not
  secret. **`tasks.md` T120 evaluates A+ as part of the spike; T138 is a placeholder for whichever option
  the owner ultimately picks** — D02 should not proceed past it with the decision still open (see
  `plan.md`'s Open Question 3).
- Sources: [Supabase Auth: Rate Limits](https://supabase.com/docs/guides/auth/rate-limits),
  [Supabase Auth: Send Email Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook),
  [Supabase Auth: Enable CAPTCHA Protection](https://supabase.com/docs/guides/auth/auth-captcha),
  [Supabase CLI config reference (`auth.email.otp_length`)](https://supabase.com/docs/guides/local-development/cli/config),
  [JavaScript: signInWithOtp](https://supabase.com/docs/reference/javascript/auth-signinwithotp),
  [JavaScript: Auth Admin — generateLink](https://supabase.com/docs/reference/javascript/auth-admin-generatelink).

## Open Questions (not resolved here — recorded, not guessed)

- Not applicable — superseded by §1-2's decision to defer the version pin to D00a's own official-source
  verification, rather than treat it as an open question in this document.
- Not applicable (2026-10-18) — the Twilio Verify Egypt geo-permission question is removed: Twilio is no
  longer part of Phase 1 at all (§4 rewrite). Kept as a struck-through line, not deleted silently, so the
  removal itself is visible: ~~Whether Egypt's Twilio Verify Geo Permission is "Allow" or
  "Monitor"/"Disabled"~~ — moot, no SMS sign-in exists to need it.
- Which SMTP provider to commit to (`spec.md` Open Decisions item 7) — §4's comparison table gives real
  numbers but makes no recommendation; this is a business/engineering call, not something this research
  can settle on its own.
- Final Supabase project region (carried over from spec.md → Launch readiness; affects nothing in D00-D08
  technically, but affects latency targets in section 14 of the PRD).
- Whether `otp_attempts` (the table from finding §3, now keyed by email `identifier`) needs its own purge
  job alongside `purge_soft_deleted`, or a short TTL index — left for `data-model.md` review, not blocking
  planning.
- **One line, as requested**: phone/SMS sign-in is a possible later option — nothing in Phase 1's schema
  or the `verify-otp-guard` design (identifier-keyed, action-based `send-code`/`verify-code`) prevents
  adding a phone identifier type alongside email if the business revisits this; it is not committed to any
  phase (`spec.md` Open Decisions item 10).
- **Which of §17's options (A/A+/B/C) to build** for closing the direct-Auth-path bypass — an owner
  decision, not something research can settle; `spec.md` Open Decisions item 12 and `plan.md` Open
  Question 3 both record this as a blocking gate before D02 proceeds past `tasks.md` T138.
- **New (this fix pass)**: whether email sent to an Apple private-relay address (§14) needs the sending
  domain separately registered with Apple's Private Email Relay program — see §14's addendum below.

## 18. Approved owner decisions (2026-10-27)

- **T123 launch cities:** seed Cairo, Giza, and Alexandria only, with stable IDs and bilingual names.
- **T138 OTP security:** Option C is approved. The implementation must use custom random codes, keyed or
  salted verification storage, server-side attempts/expiry/lockout/throttling, no enumeration, and an
  authoritative path that cannot be bypassed through Supabase's public native OTP endpoints. No custom
  verification code may ship until a supported Supabase session-establishment mechanism is proven. The
  earlier local T120 observations remain partial and do not establish this property.
- **T140 invitations:** Option B is approved. Clinic managers may invite vets and receptionists within
  their clinic; only platform administrators may grant manager level.
- **T142 deletion:** the trusted backend must verify authentication within the prior five minutes. A
  client timestamp is not evidence of freshness; a supported step-up flow is required if the current
  session cannot prove it. **Implementation finding (2026-10-27):** Supabase's signed access-token `amr`
  claim contains method/timestamp entries for authentication events. `getClaims()` verifies the token;
  the MFA guide states AMR entries are newest-first and suitable for checking recent authentication.
  `iat` is not used because token refresh changes it. The pure backend freshness helper is implemented,
  but T142 remains open until safe account-data/storage/Auth deletion is coordinated transactionally.
  Sources: [JWT claim reference](https://supabase.com/docs/guides/auth/jwt-fields),
  [`getClaims()`](https://supabase.com/docs/reference/javascript/auth-getclaims),
  [MFA AMR guidance](https://supabase.com/docs/guides/auth/auth-mfa#how-do-i-check-when-a-user-went-through-mfa),
  [Auth token generation](https://github.com/supabase/auth/blob/master/internal/tokens/service.go).
- **T173 mobile guard:** suspended/deleted/missing or expired sessions route to `/welcome`; minimum
  supported version is `app_config.min_mobile_version` with `{ "version": "x.y.z" }`. Maintenance routes
  to the mobile maintenance screen. Unknown authorization/config state must not expose protected screens.
- **T183 maintenance:** authorized dashboard users retain their requested route and see a bilingual
  maintenance banner. Authentication and role checks remain mandatory; public maintenance behavior
  follows the app's public screen contract.
- **T186 CI/CD scope:** keep T074-T076 descoped. T186 is a local standalone checker only; no hosted CI
  gate is claimed.
- **T179 identity linking:** implement supported Google OAuth linking. Secondary email identity linking
  is deferred because its attachment to an existing Google-only account is unverified; do not advertise
  that action.
- **T187 phone validation:** accept Egyptian local mobile numbers with prefixes 010/011/012/015 and
  equivalent `+20` values, normalize to E.164, and reject other country codes, invalid lengths, and
  non-digit formatting.
