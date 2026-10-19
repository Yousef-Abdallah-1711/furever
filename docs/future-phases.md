# Future Phases — Shop, Community, Payments and Video

This file holds everything about Phase 2 (Shop), Phase 3 (Community/adoption and mating), and Phase 4
(Payments and video) that was removed from `specs/001-furever-platform/spec.md` to keep that spec focused on
Phase 1. Nothing here is built or routed until its phase starts and its feature flag is enabled
(constitution VI: Phases and Feature Flags). The text below is kept verbatim so each block can be moved back
into `spec.md` unchanged when its phase begins.

## User stories (P3, flagged off)

These are fully specified so later phases are additive, not a redesign, but **MUST NOT** be built or routed
until their phase starts and its flag is enabled (constitution VI).

- **SHP-01** (P3, Phase 2) — Browse and search products. **Given** the shop is enabled, **When** an owner
  browses categories or searches, **Then** results show in both languages and out-of-stock items are
  labeled.
- **SHP-02** (P3, Phase 2) — Cart and checkout. **Given** items in a cart, **When** the owner checks out,
  **Then** quantity respects stock, an address is required, the order is placed exactly once even on retry,
  and stock decrements together with the order.
- **SHP-03** (P3, Phase 2) — Track and reorder. **Given** a placed order, **When** its status changes,
  **Then** a push fires and Reorder refills the cart at current prices.
- **SHP-04** (P3, Phase 2) — Manage products, stock, and orders. **Given** an admin, **When** they edit
  products, variants, or order status, **Then** the owner is notified of status changes and a low-stock list
  is available.
- **COM-01** (P3, Phase 3) — List a pet for adoption or mating. **Given** a pet with a complete passport,
  **When** the owner creates a listing with proof documents, **Then** it stays hidden until Verified.
- **COM-02** (P3, Phase 3) — Verify listings. **Given** a pending listing, **When** an admin approves or
  rejects it with a reason, **Then** the owner sees the outcome and reason.
- **COM-03** (P3, Phase 3) — Browse and request. **Given** verified listings, **When** an owner sends a
  request, **Then** only one open request per listing/pet pair exists and the other owner is notified.
- **COM-04** (P3, Phase 3) — Chat after approval. **Given** an approved request, **When** either side opens
  chat, **Then** messages arrive in realtime and Report/Block work from the chat header.
- **COM-05** (P3, Phase 3) — Handle reports. **Given** a report, **When** an admin reviews it, **Then** they
  can hide a listing, warn, or suspend the user, each action audited.
- **PAY-01** (P3, Phase 4) — Pay online. **Given** payments are enabled, **When** an owner pays for a
  booking or order, **Then** the result is confirmed only by a verified server-side webhook, never by the
  client, with visible pending/failed states.
- **PAY-02** (P3, Phase 4) — Refund. **Given** a paid booking or order, **When** an admin issues a full or
  partial refund, **Then** it is recorded and reflected on that booking/order.
- **PAY-03** (P3, Phase 4) — Auto-delivery. **Given** a subscribed product, **When** each interval elapses,
  **Then** an order is created and the saved payment method is charged, unless skipped/paused/cancelled.
- **VID-01** (P3, Phase 4) — Video consultation. **Given** a booking of type video, **When** the join window
  opens, **Then** the call connects and the doctor's notes save to the pet's timeline afterward.

## Functional Requirements

- **FR-061** (SHP-01, P3, Ph2): System MUST, once shop is enabled, let an owner browse and search a bilingual
  product catalog with out-of-stock labeling.
- **FR-062** (SHP-02, P3, Ph2): System MUST, once shop is enabled, process checkout so stock is decremented
  together with order creation and a retried checkout never creates two orders.
- **FR-063** (SHP-03, P3, Ph2): System MUST, once shop is enabled, notify an owner on each order-status
  change and support reordering at current prices.
- **FR-064** (SHP-04, P3, Ph2): System MUST, once shop is enabled, let an admin manage products, stock, and
  order status with owner notifications on change.
- **FR-065** (COM-01, P3, Ph3): System MUST, once community is enabled, require a complete pet passport and
  proof documents before a listing can be created, and keep it hidden until verified.
- **FR-066** (COM-02, P3, Ph3): System MUST, once community is enabled, let an admin approve or reject a
  listing with a reason visible to its owner.
- **FR-067** (COM-03, P3, Ph3): System MUST, once community is enabled, allow at most one open request per
  listing/pet pair and notify the other party.
- **FR-068** (COM-04, P3, Ph3): System MUST, once community is enabled, open chat only after request
  approval and support report/block from within it.
- **FR-069** (COM-05, P3, Ph3): System MUST, once community is enabled, give an admin an audited way to hide
  a listing, warn, or suspend a user from a report.
- **FR-070** (PAY-01, P3, Ph4): System MUST, once payments are enabled, confirm a payment only via a
  verified server-side callback, never via the client alone, with a visible pending/failed state.
- **FR-071** (PAY-02, P3, Ph4): System MUST, once payments are enabled, let an admin issue a full or partial
  refund and reflect it on the related booking or order.
- **FR-072** (PAY-03, P3, Ph4): System MUST, once payments are enabled, run subscription deliveries on their
  interval unless skipped, paused, or cancelled, charging the saved method each time.
- **FR-073** (VID-01, P3, Ph4): System MUST, once video is enabled, open a join window before a video
  booking's start time and save the doctor's notes to the pet's timeline after the call.

## Key Entities

- **Product** *(Phase 2)*: an item in the shop catalog, with variants and stock.
- **Order** *(Phase 2)*: a placed shop purchase with items, status history, and delivery address.
- **Address** *(Phase 2)*: a saved delivery location for an owner.
- **Listing** *(Phase 3)*: an adoption or mating post tied to a pet, with a verification status.
- **Match request** *(Phase 3)*: a request from one owner to another about a listing.
- **Conversation** *(Phase 3)*: the chat opened once a match request is approved.
- **Payment** *(Phase 4)*: a recorded online payment for a booking or order.
- **Subscription** *(Phase 4)*: a recurring auto-delivery arrangement for a product.
- **Video session** *(Phase 4)*: the record of a video consultation tied to an appointment.

## Screen Coverage

### Owner mobile

| Screen ID | Phase | Status | Serves |
| --- | --- | --- | --- |
| `/(tabs)/shop` Shop home | 2 | Built (home only) | SHP-01 |
| Shop category/product/cart/checkout/orders/addresses/wishlist | 2 | Spec | SHP-01, SHP-02, SHP-03 |
| `/community` Adoption and Mating hub | 3 | Built | COM-03 |
| Community listing/new/mine/requests/chat/report | 3 | Spec | COM-01, COM-02, COM-03, COM-04, COM-05 |
| `PaymentMethodSelector` slot | 4 | Spec | PAY-01 |
| `/consult/[id]/prejoin` Video pre-join | 4 | Built | VID-01 |
| Video call/summary, `/subscriptions` | 4 | Spec | VID-01, PAY-03 |

### Clinic dashboard

| Screen ID | Phase | Status | Serves |
| --- | --- | --- | --- |
| `/clinic/payouts`, video schedule | 4 | Spec | PAY-02, VID-01 |

### Admin dashboard

| Screen ID | Phase | Status | Serves |
| --- | --- | --- | --- |
| Products, orders | 2 | Locked stub | SHP-04 |
| Listings | 3 | Locked stub | COM-02 |
| Payments, refunds | 4 | Locked stub | PAY-02 |

### Design gaps (deferred)

When each phase starts, these screens need to be composed from existing design-system components following
the nearest Built screen in the same area: the full Shop flow beyond its home screen, the full Community
flow beyond the hub, the video call/summary screens and Subscriptions (owner mobile); Payouts and the video
schedule screen (clinic dashboard); the Products/orders, Listings, and Payments/refunds locked stubs become
real screens (admin dashboard).

## Restoring a phase into spec.md

When a phase starts:

1. Move its user stories back under `## User Scenarios & Testing` in `spec.md` (restore the phase's priority
   tag to match that sprint's plan).
2. Move its functional requirements back into `## Requirements → Functional Requirements`, keeping the same
   FR numbers.
3. Move its key entities back into `## Requirements → Key Entities`.
4. Move its Screen Coverage rows back into the matching portal table, and fold its design-gap bullet back
   into `## Screen Coverage → Design gaps`.
5. Remove the phase's content from this file once it is restored, so there is one source of truth again.
