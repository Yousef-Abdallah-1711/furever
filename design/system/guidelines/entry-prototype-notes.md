# Owner entry prototype: flow map and assumptions

Open `ui_kits/mobile-entry/index.html`.

## Flow map
- **New user:** Language → Intro slides → Welcome (Get Started) → Phone → Verify code → Profile → Pet species → Pet basics → Pet photo → Health passport (upload card / enter manually / skip) → Notifications → Summary → Home.
- **Returning user:** Welcome (I Have an Account) → Phone or Google/Apple → Verify code → Home. Onboarding is skipped.
- **From Home:** tabs Home, Pets, Bookings, Profile; Clinics, Clinic detail, simulated booking, Notifications inbox, Emergency. Profile tab has Review setup summary (back to onboarding summary), language and theme, Log out, and the prototype Restart control.
- **Edit loops:** Summary Edit buttons jump to a step and return to Summary.

## Simulated, not connected
SMS code (123456 ok, 111111 expired, others wrong; 3 attempts), Google/Apple account sheets, photo and file pickers, OS notification prompt, call/WhatsApp/directions, booking confirmation.

## Assumptions to confirm
- Whether an account exists is decided by the entry path (Sign in vs Create account); a real backend should decide by phone/identity and could redirect between the two.
- Egypt only is selectable in the country picker; other codes shown as unavailable.
- Egyptian mobile validation: 10 digits starting 10, 11, 12 or 15 (leading 0 allowed).
- Resend after 60s and 3 attempts before lock; lock duration not specified in the PRD.
- Name minimum 2 characters; city required; Terms checkbox required (PRD).
- Pet: species, name, breed, gender and birth date or approximate age required; weight and photo optional.
- Pet can be skipped during onboarding; Home then shows an Add your first pet card.
- Vaccine list per species and next-due intervals (12, 12 and 3 months) are placeholders for reference data.
- Next-due status thresholds: overdue if past, due soon within 14 days (PRD Home banner rule).
- Apple sign-in shown on all prototype devices; PRD says iOS only.
- Prototype holds one pet; multi-pet add lives in the Owner app kit.
- Arabic copy is draft and needs native review.
