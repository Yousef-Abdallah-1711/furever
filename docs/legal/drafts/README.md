# FurEver legal drafts — owner and counsel review

**Status:** Drafts only. Not approved, not effective, and not for production consent collection.

These English and Arabic drafts were prepared at the owner's request for review, using the repository's current D02 implementation and product specification. They do not establish that FurEver or any vendor is legally compliant. Obtain Egyptian counsel's review of Law No. 151 of 2020 and Ministerial Decree No. 816 of 2025, the actual controller/processor roles, licensing/registration, cross-border processing, and the proposed retention policy before publication.

| Document | English | العربية | Version | Proposed effective date |
|---|---|---|---|---|
| Terms of Service | [terms-v1.0.0.en.md](terms-v1.0.0.en.md) | [terms-v1.0.0.ar.md](terms-v1.0.0.ar.md) | `terms-v1.0.0` | `2026-11-01` |
| Privacy Policy | [privacy-v1.0.0.en.md](privacy-v1.0.0.en.md) | [privacy-v1.0.0.ar.md](privacy-v1.0.0.ar.md) | `privacy-v1.0.0` | `2026-11-01` |

The date is proposed metadata only. Neither version should be recorded as accepted until the owner explicitly approves the final bilingual text, stable version IDs, and effective date. Production profile completion must remain fail-closed until that approval and the corresponding app configuration are in place. Do not mark T196, T204, or T216 complete based on these drafts.

## Owner and counsel decisions still required

1. Legal name, legal form, registered address, commercial registration and tax identifiers, and the entity that will operate FurEver.
2. Whether the operator is the controller for each data flow, when a clinic is an independent or joint controller, and required agreements with clinics and processors.
3. Privacy/DPO contact details, complaint channel, and any required representative, registration, license, permit, or PDPC filing under the applicable Egyptian rules.
4. Hosting region and every actual subprocessor, transfer destination, transfer mechanism, and required authorization. The PRD says the planned Supabase region is outside Egypt; confirm the deployed region and legal basis before publication.
5. Whether minors may use FurEver, minimum account age, parental authorization process, and whether the service will collect children's data.
6. Final account-deletion workflow and approved retention schedule. The owner's proposed V1 schedule is pending legal review; the deletion worker and hard deletion are not complete.
7. Current production feature inventory, including whether Google/Apple sign-in, push notifications, analytics, uploads, clinic workflows, account export, and external messaging are enabled at publication.
8. Copyright/licence position for app content, clinic-provided content, user material, and any third-party content; governing-law/dispute language; service scope and warranty/liability clauses.
9. Confirm that the proposed effective date is still appropriate and specify the publication URL and legally required notices.

## Drafting basis and implementation boundary

The drafts describe implemented D02 account/profile, consent, clinic invitation/staff, access control, and account-deletion-request behavior. They do not claim the D03 pet passport, medical record, appointment, payment, or file-upload features are live. A separate section explains that future features require an updated notice. Analytics and provider sign-in are described conditionally because their production enablement is not evidenced. The retention schedule is explicitly described as a proposal and not a legal requirement.

Sources consulted: [Egyptian State Information Service — Law No. 151 of 2020 announcement](https://sis.gov.eg/en/media-center/news/sisi-endorses-law-on-personal-data-protection/); [Official Legislation Portal record](https://www.cc.gov.eg/legislation_single?id=404869); [Executive Regulations, Ministerial Decree No. 816 of 2025 (Arabic text reproduction referencing the Official Gazette)](https://masaar.net/ar/egypt_laws/%D8%A7%D9%84%D9%84%D8%A7%D8%A6%D8%AD%D8%A9-%D8%A7%D9%84%D8%AA%D9%86%D9%81%D9%8A%D8%B0%D9%8A%D8%A9-%D9%84%D9%82%D8%A7%D9%86%D9%88%D9%86-%D8%AD%D9%85%D8%A7%D9%8A%D8%A9-%D8%A7%D9%84%D8%A8%D9%8A/); [Library of Congress overview of Law No. 151/2020](https://www.loc.gov/item/global-legal-monitor/2020-10-29/egypt-countrys-first-law-on-protection-of-personal-data-enters-into-force/). Counsel must verify the primary Arabic Official Gazette text, subsequent amendments, implementing decisions, and current regulator guidance.
