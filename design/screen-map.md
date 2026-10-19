# Phase 1 Screen Map

Built-screen kit sources and Spec-screen patterns are linked from each screen record. Delivery phases are read from `specs/001-furever-platform/plan.md`'s Coverage Table.

| Screen ID | Route | Kit source or pattern | Delivery phase |
| --- | --- | --- | --- |
| `/profile/about` | `/profile/about` | Pattern: [`/(tabs)/profile`](screens/tabs-profile.md) | D02 |
| `/profile/account` | `/profile/account` | Kit: [kit-home.babel](../FurEver Design System/ui_kits/mobile/kit-home.babel) | D02 |
| `/complete-profile` | `/complete-profile` | Kit: [kit-auth.babel](../FurEver Design System/ui_kits/mobile/kit-auth.babel) | D02 |
| `/profile/edit` | `/profile/edit` | Pattern: [`/(tabs)/profile`](screens/tabs-profile.md) | D02 |
| `/force-update` | `/force-update` | Pattern: [`/welcome`](screens/welcome.md) | D02 |
| `/profile/help` | `/profile/help` | Pattern: [`/(tabs)/profile`](screens/tabs-profile.md) | D02 |
| `/language` | `/language` | Kit: [kit-auth.babel](../FurEver Design System/ui_kits/mobile/kit-auth.babel) | D02 |
| `/legal/terms` | `/legal/terms`, `/legal/privacy` | Pattern: [`/(tabs)/profile`](screens/tabs-profile.md) | D02 |
| `/maintenance` | `/maintenance` | Pattern: [`/welcome`](screens/welcome.md) | D02 |
| `/onboarding` | `/onboarding` | Kit: [kit-auth.babel](../FurEver Design System/ui_kits/mobile/kit-auth.babel) | D02 |
| `/(tabs)/profile` | `/(tabs)/profile` | Kit: [kit-home.babel](../FurEver Design System/ui_kits/mobile/kit-home.babel) | D02 |
| `/profile/settings` | `/profile/settings` | Kit: [kit-home.babel](../FurEver Design System/ui_kits/mobile/kit-home.babel) | D02 |
| `/onboarding/summary` | `/onboarding/summary` | Kit: [e-onboard2.babel](../FurEver Design System/ui_kits/mobile-entry/e-onboard2.babel) | D02 |
| `/sign-in` | `/sign-in` | Kit: [kit-auth.babel](../FurEver Design System/ui_kits/mobile/kit-auth.babel) | D02 |
| `/` | `/` | Pattern: [`/welcome`](screens/welcome.md) | D02 |
| `/otp` | `/otp` | Kit: [kit-auth.babel](../FurEver Design System/ui_kits/mobile/kit-auth.babel) | D02 |
| `/welcome` | `/welcome` | Kit: [kit-auth.babel](../FurEver Design System/ui_kits/mobile/kit-auth.babel) | D02 |
| `/pets/new` | `/pets/new` | Kit: [kit-home.babel](../FurEver Design System/ui_kits/mobile/kit-home.babel) | D03 |
| `/documents/[path]` | `/documents/[path]` | Pattern: [`/pets/[id]/passport`](screens/pets-id-passport.md) | D03 |
| `/pets/[id]/edit` | `/pets/[id]/edit` | Pattern: [`/pets/new`](screens/pets-new.md) | D03 |
| `/(tabs)/pets` | `/(tabs)/pets` | Kit: [kit-home.babel](../FurEver Design System/ui_kits/mobile/kit-home.babel) | D03 |
| `/pets/[id]/records/new` | `/pets/[id]/records/new` | Pattern: [`/pets/[id]/vaccinations/new`](screens/pets-id-vaccinations-new.md) | D04 |
| `/pets/[id]/vaccinations/new` | `/pets/[id]/vaccinations/new` | Kit: [kit-home.babel](../FurEver Design System/ui_kits/mobile/kit-home.babel) | D04 |
| `/(tabs)/index` | `/(tabs)/index` | Kit: [kit-home.babel](../FurEver Design System/ui_kits/mobile/kit-home.babel) | D04 |
| `/notifications` | `/notifications` | Kit: [kit-home.babel](../FurEver Design System/ui_kits/mobile/kit-home.babel) | D04 |
| `/pets/[id]/passport` | `/pets/[id]/passport` | Kit: [kit-home.babel](../FurEver Design System/ui_kits/mobile/kit-home.babel) | D04 |
| `/permissions` | `/permissions` | Kit: [kit-auth.babel](../FurEver Design System/ui_kits/mobile/kit-auth.babel) | D04 |
| `/pets/[id]` | `/pets/[id]` | Kit: [kit-home.babel](../FurEver Design System/ui_kits/mobile/kit-home.babel) | D04 |
| `/clinics/[id]` | `/clinics/[id]` | Kit: [kit-booking.babel](../FurEver Design System/ui_kits/mobile/kit-booking.babel) | D05 |
| `/clinics` | `/clinics` | Kit: [kit-booking.babel](../FurEver Design System/ui_kits/mobile/kit-booking.babel) | D05 |
| `/clinics/[id]/doctors/[id]` | `/clinics/[id]/doctors/[id]` | Pattern: [`/clinics/[id]`](screens/clinics-id.md) | D05 |
| `/emergency` | `/emergency` | Kit: [kit-booking.babel](../FurEver Design System/ui_kits/mobile/kit-booking.babel) | D05 |
| `/book/details` | `/book/details` | Kit: [kit-booking.babel](../FurEver Design System/ui_kits/mobile/kit-booking.babel) | D06 |
| `/book/doctor` | `/book/doctor` | Kit: [kit-booking.babel](../FurEver Design System/ui_kits/mobile/kit-booking.babel) | D06 |
| `/book/service` | `/book/service` | Kit: [kit-booking.babel](../FurEver Design System/ui_kits/mobile/kit-booking.babel) | D06 |
| `/book/summary` | `/book/summary` | Kit: [kit-booking.babel](../FurEver Design System/ui_kits/mobile/kit-booking.babel) | D06 |
| `/book/time` | `/book/time` | Kit: [kit-booking.babel](../FurEver Design System/ui_kits/mobile/kit-booking.babel) | D06 |
| `/bookings/[id]` | `/bookings/[id]` | Kit: [kit-booking.babel](../FurEver Design System/ui_kits/mobile/kit-booking.babel) | D06 |
| `/book/success` | `/book/success` | Kit: [kit-booking.babel](../FurEver Design System/ui_kits/mobile/kit-booking.babel) | D06 |
| `/(tabs)/bookings` | `/(tabs)/bookings` | Kit: [kit-booking.babel](../FurEver Design System/ui_kits/mobile/kit-booking.babel) | D06 |
| `/bookings/[id]/review` | `/bookings/[id]/review` | Kit: [kit-booking.babel](../FurEver Design System/ui_kits/mobile/kit-booking.babel) | D07 |
| `/login` | `/login`, `/mfa` | Kit: [kit-app.babel](../FurEver Design System/ui_kits/dashboard/kit-app.babel) | D02 |
| `/clinic/profile` | `/clinic/profile` | Kit: [kit-clinic.babel](../FurEver Design System/ui_kits/dashboard/kit-clinic.babel) | D05 |
| `/clinic/doctors` | `/clinic/doctors` | Pattern: [`/clinic/services`](screens/clinic-services.md) | D05 |
| `/clinic/services` | `/clinic/services` | Kit: [kit-clinic.babel](../FurEver Design System/ui_kits/dashboard/kit-clinic.babel) | D05 |
| `/clinic/settings` | `/clinic/settings` | Pattern: [`/clinic/profile`](screens/clinic-profile.md) | D05 |
| `/clinic/appointments` | `/clinic/appointments` | Kit: [kit-clinic.babel](../FurEver Design System/ui_kits/dashboard/kit-clinic.babel) | D06 |
| `/clinic` | `/clinic` | Kit: [kit-clinic.babel](../FurEver Design System/ui_kits/dashboard/kit-clinic.babel) | D06 |
| `/clinic/queue` | `/clinic/queue` | Kit: [kit-clinic.babel](../FurEver Design System/ui_kits/dashboard/kit-clinic.babel) | D07 |
| `/clinic/patients` | `/clinic/patients`, `/clinic/patients/[id]` | Pattern: [`/clinic/appointments`](screens/clinic-appointments.md) | D07 |
| `/clinic/reports` | `/clinic/reports` | Pattern: [`/admin`](screens/admin.md) | D07 |
| `/clinic/reviews` | `/clinic/reviews` | Pattern: [`/clinic/appointments`](screens/clinic-appointments.md) | D07 |
| `/clinic/staff` | `/clinic/staff` | Kit: [kit-clinic.babel](../FurEver Design System/ui_kits/dashboard/kit-clinic.babel) | D07 |
| `/accept-invite` | `/accept-invite` | Pattern: [`/login`](screens/login.md) | D02 |
| `/forgot-password` | `/forgot-password` | Pattern: [`/login`](screens/login.md) | D02 |
| `/no-access` | `/no-access` | Pattern: [`/login`](screens/login.md) | D02 |
| `/admin/team` | `/admin/team` | Pattern: [`/admin/users`](screens/admin-users.md) | D02 |
| `/admin/settings` | `/admin/settings` | Pattern: [`/admin/flags`](screens/admin-flags.md) | D02 |
| `/admin/clinics/[id]` | `/admin/clinics/[id]` | Pattern: [`/admin/clinics`](screens/admin-clinics.md) | D05 |
| `/admin/clinics` | `/admin/clinics` | Kit: [kit-admin.babel](../FurEver Design System/ui_kits/dashboard/kit-admin.babel) | D05 |
| `/admin/reference-data` | `/admin/reference-data` | Kit: [kit-admin.babel](../FurEver Design System/ui_kits/dashboard/kit-admin.babel) | D05 |
| `/admin/appointments` | `/admin/appointments` | Pattern: [`/admin/users`](screens/admin-users.md) | D06 |
| `/admin/audit-logs` | `/admin/audit-logs` | Kit: [kit-admin.babel](../FurEver Design System/ui_kits/dashboard/kit-admin.babel) | D07 |
| `/admin/notifications` | `/admin/notifications` | Kit: [kit-admin.babel](../FurEver Design System/ui_kits/dashboard/kit-admin.babel) | D07 |
| `/admin/flags` | `/admin/flags` | Kit: [kit-admin.babel](../FurEver Design System/ui_kits/dashboard/kit-admin.babel) | D07 |
| `/admin` | `/admin` | Kit: [kit-admin.babel](../FurEver Design System/ui_kits/dashboard/kit-admin.babel) | D07 |
| `/admin/pets` | `/admin/pets` | Pattern: [`/admin/users`](screens/admin-users.md) | D07 |
| `/admin/reviews` | `/admin/reviews` | Pattern: [`/admin/audit-logs`](screens/admin-audit-logs.md) | D07 |
| `/admin/users/[id]` | `/admin/users/[id]` | Pattern: [`/admin/users`](screens/admin-users.md) | D07 |
| `/admin/users` | `/admin/users` | Kit: [kit-admin.babel](../FurEver Design System/ui_kits/dashboard/kit-admin.babel) | D07 |
