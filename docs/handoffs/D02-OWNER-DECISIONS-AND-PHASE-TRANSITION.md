# D02 Owner Decisions and Phase Transition

**Date:** 2026-10-27
**Status:** Proposal for owner review; no D03 work authorized or started.

## OTP architecture verdict

**Verdict: the approved Option C flow is unsupported with the current contract and remains blocked.**

Supabase `verifyOtp` exchanges a Supabase-issued email/SMS OTP or token hash and returns an Auth session. A separately verified code from an external verifier is not a Supabase OTP, so submitting it through `verifyOtp` is not a supported bridge. `generateLink` creates Auth links/tokens; it does not establish that an independently verified code can be exchanged for a normal refreshable session. The Custom Access Token Hook runs when Supabase Auth issues a token and can modify claims, but it is not a verification interceptor for arbitrary public OTP endpoints. Third-party Auth accepts an externally issued JWT for requests; it does not produce a Supabase-managed refresh-token session. These paths do not solve the requirement to preserve the approved lockout while establishing a refreshable Supabase Auth session.

**Recommendation:** retain Supabase Auth as the sole session issuer and use its OTP verification/attempt controls, or ask the owner to approve a revised authentication product contract (provider, lockout semantics, and supported session lifecycle). Do not add a custom JWT, trust client verification, or weaken public-endpoint lockout.

Evidence: [Supabase `verifyOtp`](https://supabase.com/docs/reference/javascript/auth-verifyotp), [Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook), [Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks), [Third-party Auth](https://supabase.com/docs/guides/auth/third-party/overview).

## Account deletion foundation delivered

The local implementation now records a service-only deletion request, marks the profile deleted, blocks authenticated access through D02 RLS policies, rejects refresh-token issuance for deleted users, and records the audit event. The endpoint verifies the bearer with Supabase Auth, requires a signed AMR event within five minutes, accepts no target user ID, then calls the service-only atomic RPC. A request can be cancelled before cleanup begins; cancellation reactivates the profile and the durable request row is reused on a later request.

This is an access-blocking request stage, not completed deletion. No worker removes Storage objects or deletes the Auth user. Existing access-token signatures remain valid until expiry, but the changed database policies prevent access to protected D02 rows even with that old token; the deletion session itself is signed out by rejecting its next data requests. Future D03+ data policies and any public/anonymous business data need the same `is_active_account()` gate before their tables ship. Owner policy is still needed for consent and audit retention and for retention of the request evidence.

## Owner decision register

| ID | Related tasks | Problem | Options | Recommendation | Risk | Blocking scope | Owner action |
|---|---|---|---|---|---|---|---|
| OD-01 | T120, T138, T139, T155, T194, T195, T213 | External Option C code cannot be exchanged for a supported refreshable Supabase session while proving lockout resistance. | Use Supabase-owned OTP and its controls; change the product/auth contract; approve a documented external identity provider. | Keep Supabase as session issuer; choose Supabase OTP or approve a revised provider/contract. | Custom session issuance or public verification bypass creates account takeover and refresh-token risks. | Option C sign-in/OTP, related native flows and T216. | Select one supported authentication contract and approve changed product behavior if applicable. |
| OD-02 | T128, T142, T196, T204 | Legal consent retention, withdrawal, and deletion interaction are unspecified. | Retain immutable consent evidence; retain minimum version/date evidence; delete/anonymize consent with account. | Retain the minimum immutable evidence required for compliance, with restricted access and an owner-approved retention period. | Deleting too much loses proof; retaining too much increases privacy exposure. | Final deletion worker and production profile completion. | Approve retention duration, withdrawal behavior, and treatment on account deletion. |
| OD-03 | T132, T142, T143 | Audit retention and actor anonymization after deletion are unspecified. | Retain immutable logs; redact direct identifiers; delete logs with account. | Retain security evidence under a defined retention schedule and pseudonymize where legally permitted. | Removal harms incident investigation; indefinite retention conflicts with minimization. | Final deletion worker and audit lifecycle. | Approve retention duration, access roles, and anonymization rules. |
| OD-04 | T142, T200 | Immediate JWT revocation is not provided by Auth-user deletion; D02 data is blocked by RLS after the request, while token may remain cryptographically valid until expiry. | Keep short token expiry plus RLS block; add an application-level revocation check to every future protected table; defer deletion until expiry. | Accept the implemented database access block as the immediate application revocation boundary, require every new table to use the active-account helper, then run cleanup asynchronously. | Any unguarded table, function, Storage policy, or external resource could remain accessible. | Complete deletion worker and T200 UI. | Approve the revocation boundary and require a table/policy inventory before production enablement. |
| OD-05 | T173, T196, T204 | Approved bilingual Terms/Privacy content and stable version IDs are absent. | Supply approved texts/IDs; leave profile completion fail-closed; use synthetic docs only in isolated tests. | Keep production completion disabled until owner/legal approval; continue local synthetic verification. | Unapproved text cannot establish informed consent. | Production T196/T204 and T216. | Provide both languages, versions, effective dates, and approval record. |
| OD-06 | T208 | Platform-admin invite, role change, MFA reset and removal contracts do not exist. | Implement audited service-only RPC/Edge Functions with recent MFA and dual approval for high-risk operations; limit to hosted dashboard; defer. | Define audited server-side contracts with active-actor and AAL2 checks before enabling lifecycle mutations. | Self-escalation, lockout, or unaudited privileged access. | T208 privileged lifecycle acceptance. | Approve eligible roles, break-glass procedure, and whether dual approval is required. |
| OD-07 | T147, T148, T150, T181, T184, T189, T214 | OAuth credentials, EAS/native build, Java/Android SDK/adb and Maestro are unavailable. | Supply prerequisites; defer provider/native acceptance; remove provider requirements from phase gate through formal amendment. | Supply prerequisites and retain the current gate; do not claim native verification. | Provider and native behaviors remain unverified. | OAuth and native D02 acceptance. | Provide credentials/build environment/device access or approve a documented gate amendment. |
| OD-08 | T216, T217–T237 | D02 exit gate fails, but owner may wish to start limited D03 work. | Path A: finish D02 gate first. Path B: explicitly amend the phase dependency for a restricted subset with safeguards. | Path A. If schedule pressure requires Path B, authorize only schema/model work and tests with no user-facing writes until T216 passes. | Premature app behavior could expose pet data without verified identity/ownership paths. | D03 start and all T216-gated work. | Explicitly approve or reject the Path B amendment before any D03 task begins. |

## Phase transition proposal

### Path A — complete D02 before D03 (recommended)

Resolve OD-01, obtain OD-05, close supported authenticated profile and invitation flows, finish account cleanup and retention design, obtain native/OAuth prerequisites or a formally amended gate, then execute the exact T216 exit checklist. Preserve D03 as not started until T216 passes.

### Path B — request a limited D03 amendment

No Path B work is authorized by this proposal. If the owner explicitly amends the dependency, the proposed restricted set is **T217 (breeds schema/seed), T218 (pets schema), and database-only ownership/RLS tests for T218**. T219–T237 remain prohibited until T216 passes. No pet creation UI, onboarding, uploads, health data, sharing, public access, or production migration is included.

Required safeguards: owner-scoped `auth.uid()` policies; active-account checks; no anonymous pet reads; service-only seed/admin writes; negative cross-owner and deleted-account tests; local-only disposable fixtures; no hosted deployment; feature branches and a reversible migration plan. Entry criteria: written owner amendment, reviewed schema/data classification, verified D02 access-block policy contract, and passing local RLS tests. Exit criteria: migration and tests reviewed, no user-facing pet path, D02 blockers still visible, and rollback documented. Rollback: revert the migration only before downstream data exists; otherwise ship a forward migration that removes the limited schema without discarding user data. Update `plan.md`, `tasks.md`, phase dependency notes, and this decision before starting.

## Current result

T216 remains **FAIL**. D03 remains **BLOCKED / NOT STARTED**. No task is newly marked complete from the failed authenticated invitation attempt or the account-deletion foundation.
