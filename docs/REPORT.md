# RentTrack Report

## Overview
RentTrack is a Vue 3 + Vite mini-SaaS demo with three roles:
- Admin
- Landlord
- Tenant

The app runs entirely in localStorage and demonstrates subscription control, property automation, lease occupancy, payment-proof review, maintenance claims, chat threads, notifications, and audit logging.

## Roles
- Admin manages landlord accounts, subscription state, revenue, and audit history.
- Landlord manages properties, generated units, tenants, leases, proofs, payments, maintenance, chat, and landlord-side audit visibility.
- Tenant views the active lease, submits payment proof, opens maintenance claims, and communicates through contextual chat threads.

## Routes
- `/login`
- `/admin/dashboard`
- `/admin/landlords`
- `/admin/reports`
- `/admin/audit`
- `/landlord/dashboard`
- `/landlord/properties`
- `/landlord/tenants`
- `/landlord/leases`
- `/landlord/payments`
- `/landlord/payment-proofs`
- `/landlord/maintenance`
- `/landlord/chat`
- `/landlord/subscription-required`
- `/tenant/dashboard`
- `/tenant/payments`
- `/tenant/maintenance`
- `/tenant/chat`

## Feature Notes
- Auth is seeded on first run with admin, landlord, and tenant demo accounts.
- Landlord subscriptions support annual and lifetime plans with paid, unpaid, and expired states.
- Property names generate stable prefix codes. Regenerating units requires explicit confirmation and fails if units are occupied.
- Family houses are forced to exactly one unit.
- Adding a tenant requires property and available-unit assignment and creates an active lease automatically.
- Active leases mark units occupied. Ending a lease marks units available.
- Confirmed payment proofs create or update payment records. Late records are auto-generated for past lease months without confirmed payment.
- Tenant maintenance claims support optional images and one reopen.
- Chat threads support `general`, `payment_proof`, and `maintenance_ticket` contexts.
- Important actions write audit-log entries.

## UX Decisions
- Tailwind palette uses slate, indigo, emerald, and amber tones.
- Dashboards use soft cards, roomy spacing, and illustration placeholders instead of generic blank screens.
- Forms include inline validation messaging, `aria-invalid`, and alert roles.
- Toast notifications use `aria-live="polite"`.
- Empty states use reusable illustrations and clear calls to action.
- Modal dialogs close on Escape and restore focus.

## Future Backend
- Replace localStorage repositories with API-backed persistence.
- Hash passwords and move auth/session logic server-side.
- Add file storage for proofs and ticket images.
- Add tenant-payment reminders, billing exports, and role-specific analytics.
