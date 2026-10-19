# Screen inventory

Status: **Built** = interactive in a UI kit. **Spec** = covered by a component pattern and PRD row, not yet laid out as its own screen. All states (loading, empty, error) on owner lists are toggled in the mobile kit's "List state" control.

## Owner mobile (ui_kits/mobile)
| Route | Screen | Phase | Status |
|---|---|---|---|
| / | Splash | 1 | Spec (brand gradient + wordmark) |
| /language | Language | 1 | Built |
| /onboarding | Onboarding (3 slides) | 1 | Built |
| /welcome | Welcome | 1 | Built |
| /sign-in | Sign in (phone, Google, Apple) | 1 | Built (loading state) |
| /otp | Verify code | 1 | Built (error, loading) |
| /complete-profile | Complete profile | 1 | Built |
| /permissions | Permissions primer | 1 | Built |
| /(tabs)/index | Home | 1 | Built (loading) |
| /(tabs)/pets | My pets | 1 | Built (loading, empty, error) |
| /pets/new | Add pet, 4 steps | 1 | Built |
| /pets/[id] | Pet passport, tabs, overflow menu, delete sheet | 1 | Built (Vaccinations tab; other tabs Spec) |
| /pets/[id]/edit | Edit pet | 1 | Spec (Add pet fields) |
| /pets/[id]/vaccinations/new | Add vaccination | 1 | Built |
| /pets/[id]/records/new | Add record | 1 | Spec |
| /pets/[id]/passport | Passport share | 1 | Built |
| /documents/[path] | Document viewer | 1 | Spec |
| /clinics | Clinics, filters | 1 | Built (loading, empty, error) |
| /clinics/[id] | Clinic detail | 1 | Built |
| /clinics/[id]/doctors/[id] | Doctor | 1 | Spec |
| /book/service, doctor, time, details, summary | Booking steps 1-5 | 1 | Built (closed day, disabled slots, offline) |
| /book/success | Confirmation | 1 | Built |
| /(tabs)/bookings | My bookings | 1 | Built (empty) |
| /bookings/[id] | Booking detail, QR, live queue, cancel sheet | 1 | Built |
| /bookings/[id]/review | Rate visit | 1 | Built |
| /emergency | Emergency (no-location fallback) | 1 | Built |
| /notifications | Inbox | 1 | Built (empty) |
| /(tabs)/profile, /profile/settings, /profile/account | Profile, Settings, Account (delete sheet) | 1 | Built |
| /profile/edit, help, about, legal | Secondary profile pages | 1 | Spec |
| /force-update, /maintenance | System screens | 1 | Spec |
| /(tabs)/shop and shop/* | Shop home | 2 | Built (home only) |
| shop category, product, cart, checkout, orders, addresses, wishlist | Shop flow | 2 | Spec |
| /community | Adoption and Mating hub | 3 | Built |
| community listing, new, mine, requests, chat, report | Community flow | 3 | Spec |
| PaymentMethodSelector | Online payments | 4 | Spec (booking summary slot, only Pay at clinic) |
| /consult/*/prejoin | Video pre-join | 4 | Built |
| consult call, summary, /subscriptions | Video call, auto-delivery | 4 | Spec |

## Clinic dashboard (ui_kits/dashboard, Clinic portal)
| Route | Screen | Phase | Status |
|---|---|---|---|
| /login, /mfa | Sign in | 1 | Built |
| /clinic | Today | 1 | Built |
| /clinic/queue | Live queue board (check-in dialog, role-restricted buttons) | 1 | Built |
| /clinic/appointments | List, detail dialog | 1 | Built (calendar day/week Spec) |
| /clinic/services | Services (read-only for non-managers) | 1 | Built |
| /clinic/profile | Clinic profile with Pending banner | 1 | Built |
| /clinic/staff | Staff (manager only; restricted state) | 1 | Built |
| patients, patient detail, doctors and schedule editor, reviews, reports, settings | | 1 | Spec |
| /clinic/payouts, video schedule | | 4 | Spec |

## Admin dashboard (ui_kits/dashboard, Admin portal)
| Route | Screen | Phase | Status |
|---|---|---|---|
| /admin | Overview KPIs and charts | 1 | Built |
| /admin/users | Users | 1 | Built |
| /admin/clinics | Clinics, approve, suspend with required reason | 1 | Built |
| /admin/reference-data | Bilingual inline tables | 1 | Built |
| /admin/notifications | Broadcast composer | 1 | Built |
| /admin/flags | Flags (super admin only; restricted state) | 1 | Built |
| /admin/audit-logs | Audit log | 1 | Built (diff viewer Spec) |
| user detail, pets, clinic detail and wizard, appointments, reviews, team, settings | | 1 | Spec |
| /accept-invite, /forgot-password, /no-access | Auth edge screens | 1 | Spec |
| products, orders, listings, payments, refunds | | 2 / 3 / 4 | Locked stubs with Later-phase tag |
