# FurEver Privacy Policy — Draft

**Version:** `privacy-v1.0.0`
**Proposed effective date:** `2026-11-01`
**Status:** Owner and legal review only; not approved or in effect.

> **Draft notice.** This draft is not a legal opinion or a compliance certification. Do not publish it or collect production consent against it. FurEver's legal operator, privacy contact, controller/processor roles, deployed hosting regions, regulatory permissions, and final deletion behavior remain to be confirmed. See the [owner and counsel review register](README.md).

## 1. Who is responsible

The controller or other legally responsible entity for each processing activity will be identified here before publication. Its legal name, registered address, privacy contact, and any required Egyptian representative have not been provided. “FurEver,” “we,” “us,” and “our” refer to that entity only after it is identified in the approved version.

Some clinic-related processing may be carried out by a clinic under its own instructions and responsibility. The role of FurEver and each clinic must be determined for each activity and documented in clinic agreements before those functions are enabled. This draft does not designate a clinic or FurEver as controller where that has not been decided.

## 2. Scope and product status

This notice concerns personal data processed through the current D02 account, profile, consent, clinic-invitation, and access-control functions. It does not claim that future pet passports, veterinary records, appointments, payments, messaging, or user file uploads are live. Before any such function is enabled, the operator must update this notice, identify its data flows and recipients, obtain any required permissions or consent, and publish the applicable retention rules.

The actual production feature and provider configuration must be checked at publication. Local development email is handled by a local Mailpit catcher and is not an external delivery provider. Do not infer from that test service that production email delivery has been configured.

## 3. Personal data we process

Depending on your use of enabled features, the current D02 implementation may process:

- **Account and identity data:** email address, authentication user identifier, password credentials handled by Supabase Auth, identity-provider identifiers if a provider is enabled, and session/security metadata. FurEver does not need or intend to retain raw passwords, access tokens, refresh tokens, or one-time codes in application audit records.
- **Profile data:** name, email, optional phone number, selected city, avatar path if enabled, language, theme, and notification preferences.
- **Consent evidence:** document type and version, account reference, acceptance timestamp, and evidence needed to verify the recorded acceptance.
- **Clinic access data:** clinic and staff identifiers, invitation email, invited role, inviter, invitation status and timestamps, and membership role. Clinic names and city information are also processed.
- **Security and service records:** account status, audit events, recent-auth verification result, deletion-request state and processing stages, device push token and platform/locale when push registration is enabled, and technical logs needed to operate and secure the service.
- **Support information:** information you choose to submit through an enabled support channel. No specific support channel or contact has been supplied for this draft.

We do not currently represent that analytics, advertising profiles, payment-card data, pet health records, or uploaded medical documents are collected by the D02 product. If enabled later, the notice must be updated before collection. Authentication and delivery vendors may process the data necessary to provide those services; their actual names and locations must be listed in the final version.

## 4. Why we use data

We may process the categories above, as applicable and subject to the legal basis approved for each purpose, to:

1. create and secure accounts, authenticate users, and maintain sessions;
2. create and maintain profiles, language/theme settings, and notification preferences;
3. display and record acceptance of the applicable Terms and Privacy Policy;
4. create and manage clinic staff invitations, memberships, and role-based permissions;
5. prevent abuse, investigate security events, apply account status controls, and maintain audit evidence;
6. receive and process account-deletion requests and carry out eligible cleanup when the complete workflow is approved and operational;
7. maintain, troubleshoot, and protect the service; and
8. comply with applicable legal obligations and respond to valid legal requests.

The operator and counsel must map every purpose to the applicable legal basis and required authorization. A privacy notice does not itself create consent or cure a missing legal basis.

## 5. Consent and your choices

Where consent is the applicable basis, we will ask for it clearly and separately where required, record the document version and time, and provide a way to withdraw it where required by law. Withdrawal does not make earlier processing unlawful and may not stop processing that has another valid legal basis. The owner and counsel must confirm the exact consent and withdrawal workflow before production.

You may update profile fields through available settings. You may sign out and may request deletion using the in-app account flow when available or the final contact channel. You may also exercise rights available under applicable law, subject to verification, legal exceptions, and the final approved procedure.

## 6. Sharing and service providers

The current product specification does not describe a data-sale feature; the operator must confirm its policy before publication. Data may be made available only as approved for the purposes above, to:

- **Supabase** for authentication, database, and related hosted infrastructure when used by the deployed environment;
- an email delivery provider for invitations and account messages if configured;
- push-notification services if push delivery is enabled;
- clinics and their authorized staff for information made available to those roles by the service; and
- public authorities, courts, or other recipients where disclosure is required or permitted by applicable law.

The production provider list, contracts, access controls, processing instructions, and locations are not yet established in this draft. Replace this general description with the actual provider names and purposes before publication. Any analytics or crash-reporting tools must also be listed if enabled.

## 7. Hosting and transfers outside Egypt

The product specification states that the planned Supabase region is outside Egypt, but the actual deployed region and providers have not been verified here. Data may therefore be stored or processed outside Egypt when the production configuration uses infrastructure abroad. Before launch, counsel and the operator must determine the requirements under Law No. 151 of 2020, its Executive Regulations, and current decisions or guidance for cross-border transfers, storage, licenses, permits, notices, and consent. No transfer authorization or compliance status is asserted by this draft.

## 8. Retention and deletion

The intended approach is to retain personal data only for purposes and periods approved for the deployed service and applicable law. The following is the owner's **proposed V1 engineering schedule**, not a final approved legal policy and not a claim about current automated system behavior:

| Category | Proposed period | Proposed treatment |
|---|---:|---|
| Consent evidence | 3 years after account deletion | Pseudonymize; retain document/version, timestamp, and acceptance evidence; remove direct identifiers |
| Standard security audit logs | 12 months after event | Pseudonymize; retain event, time, outcome, and non-reversible account reference |
| Privileged administrator audit logs | 3 years after event | Pseudonymize; retain action, resource category, authorization result, and necessary security evidence |
| Deletion-request/completion evidence | 3 years after completion | Pseudonymize; retain request/auth-freshness result, stages, completion time, and outcome |
| Failed deletion diagnostics | 90 days | Minimize and pseudonymize; exclude credentials and unnecessary identifiers |
| Successful cleanup diagnostics | 30 days | Remove temporary identifiers, errors, and retry details |
| Profile data | Remove when authorized cleanup begins | Subject to approved legal holds and technical sequencing |
| Authentication identity and sessions | Revoke refresh capability as soon as technically possible; remove identity during cleanup | Existing access tokens may remain cryptographically valid until expiry; protected application data is gated while valid cleanup controls operate |
| User-owned storage objects, when introduced | Target deletion within 30 days of request | Use the provider's deletion API, after ownership checks and subject to documented legal holds |
| Deletion mapping keys | Same as associated evidence, unless specifically necessary | Restrict access and destroy when the approved retention purpose expires |

The proposed service target is to complete eligible deletion within 30 days of the request. Under the proposal, an unresolved failure or legal hold would be documented and escalated rather than silently treated as successful deletion. A legal hold would suspend deletion only for specified records and would require documented authorization, scope, and review dates. These periods and practices are proposals pending legal review; they are not statements that Egyptian law sets those periods. At the date of this draft, D02 access blocking and request tracking exist, but a complete retryable cleanup worker, storage cleanup, Auth identity deletion, automatic retention purge, and operational monitoring are not complete. Do not promise that the proposed timetable is currently met.

## 9. Security

FurEver uses role-based access controls, database row-level security, service-side authorization, and audit mechanisms in parts of the current D02 system. No system can be guaranteed completely secure. Before publication, the operator must verify deployed controls, incident procedures, vendor safeguards, and applicable notification duties. We will handle a security incident and any required regulator or user notices in accordance with applicable law.

## 10. Your rights and requests

You may request to exercise rights available under the laws that apply to your data, which may include access to, correction of, or deletion of personal data, withdrawal of consent where consent is the basis, or objection/restriction where provided by law. We may request information needed to verify the request and may apply lawful exceptions. The available rights, response procedures, statutory deadlines, and complaint authority must be confirmed by Egyptian counsel against the current Arabic law, Executive Regulations, and implementing decisions before publication.

The final version must provide a working privacy-request channel and identify any applicable regulator or complaint route. No contact details have been supplied, so this draft does not invent an email address, telephone number, or regulator contact.

## 11. Children

The service's minimum user age and handling of data relating to children have not been decided. Do not allow or solicit children's personal data under this draft. Before any child-related functionality is enabled, the operator must obtain legal advice and implement required parental authorization, age-appropriate notices, consent, safeguards, and data minimization.

## 12. Changes to this Policy

The proposed version is `privacy-v1.0.0`, with a proposed effective date of `2026-11-01`. Neither is approved or effective. We will publish the final policy through the app and provide any renewed notice or consent required for material changes. The final process must identify prior versions and preserve only the consent evidence permitted by the approved retention schedule.

## 13. Contact

The operator's legal name, postal address, privacy contact, Data Protection Officer details if required, and complaint channel are missing. They must be completed and verified before this Policy is published or shown for consent.
