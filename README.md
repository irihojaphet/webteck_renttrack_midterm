# RentTrack

RentTrack is a local-first property management mini-SaaS built with Vue 3, Vite, Pinia, Vue Router, and Tailwind CSS. It simulates a multi-role rental platform for admins, landlords, and tenants without a backend.

The system covers:
- role-based authentication
- landlord subscription gating
- property and unit automation
- tenant assignment and lease activation
- payment proof submission and confirmation
- maintenance tickets
- contextual chat threads
- notifications
- audit logs
- light and dark mode

## Tech Stack

- Vue 3
- Vite
- Pinia
- Vue Router
- Tailwind CSS
- localStorage for persistence

## Demo Accounts

Use these seeded credentials on the login page:

- Admin: `admin@example.com` / `admin123`
- Landlord: `landlord1@example.com` / `landlord123`
- Tenant: `tenant1@example.com` / `tenant123`

## Core Roles

### Admin
- creates landlord accounts
- sets subscription plans
- marks landlord subscriptions paid or unpaid
- renews annual subscriptions
- reviews revenue and unpaid landlords
- reads the audit trail

### Landlord
- manages properties and auto-generated units
- assigns tenants to available units
- creates and ends leases
- reviews payment proofs
- sees paid, partial, and late records
- manages maintenance tickets
- uses chat threads with tenants

### Tenant
- views lease details
- submits payment proof
- reviews payment history
- creates maintenance tickets with images
- reopens a resolved ticket once
- uses chat with the landlord

## Main Business Rules

### Authentication
- Auth is simulated with seeded users in localStorage.
- Sessions are stored locally.
- Route guards protect admin, landlord, and tenant areas.

### Subscription Gating
- Annual plan: `12000 RWF/year`
- One-time plan: `100000 RWF lifetime`
- If a landlord is unpaid or expired, landlord routes redirect to the subscription-required screen.
- The subscription screen supports:
  - logout
  - plan selection
  - demo payment simulation

### Property and Unit Automation
- `prefixCode` is built from the first 3 letters of the property name, letters only, uppercase.
- Unit codes follow `PREFIX-001`, `PREFIX-002`, and so on.
- `family_house` forces exactly `1` unit.
- Property name changes do not auto-change the prefix code.
- Units regenerate only through an explicit action.

### Lease and Occupancy
- Creating a tenant with assignment also creates an active lease.
- Active lease -> unit becomes `Occupied`
- Ended lease -> unit becomes `Available`

### Payment Proof Workflow
- Tenant submits proof -> `Pending`
- Landlord confirms -> payment record becomes `Paid` or `Partial`
- Landlord rejects -> tenant sees the rejection reason
- Late records are auto-generated for past lease months with no confirmed payment

### Maintenance
- Tenant opens a ticket with optional images
- Landlord updates status: `Open`, `InProgress`, `Resolved`
- Tenant can reopen once

### Audit Logging
- Important actions are stored in audit logs
- Admin and landlord areas expose audit information

## Routes

### Public
- `/login`

### Admin
- `/admin/dashboard`
- `/admin/landlords`
- `/admin/reports`
- `/admin/audit`

### Landlord
- `/landlord/dashboard`
- `/landlord/properties`
- `/landlord/tenants`
- `/landlord/leases`
- `/landlord/payments`
- `/landlord/payment-proofs`
- `/landlord/maintenance`
- `/landlord/chat`
- `/landlord/subscription-required`

### Tenant
- `/tenant/dashboard`
- `/tenant/payments`
- `/tenant/maintenance`
- `/tenant/chat`

## Project Structure

```text
src/
  assets/
  components/
  composables/
  layouts/
  mock/
  router/
  stores/
  utils/
  views/
```

Important areas:

- `src/mock/seed.js`
  seeds the app into localStorage

- `src/utils/storage.js`
  localStorage root read/write helpers

- `src/utils/repo.js`
  generic CRUD helpers for local entities

- `src/stores/`
  business domains including auth, subscriptions, landlords, properties, units, tenants, leases, payments, payment proofs, tickets, chats, notifications, audit logs, theme, and UI state

- `src/layouts/`
  admin, landlord, and tenant shells

- `src/views/`
  role-specific screens

## Theme

- light and dark mode are available
- mode is stored in localStorage
- toggle exists on login and authenticated screens

## Persistence

This project is intentionally backend-free.

All data is stored in localStorage under a single application root. That includes:
- users
- session
- subscriptions
- properties
- units
- tenants
- leases
- payments
- payment proofs
- tickets
- chat threads
- messages
- notifications
- audit logs
- theme

If the storage version changes, the seed resets to the current demo dataset.

## Setup

Install dependencies:

```sh
npm install
```

Run development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Preview production build:

```sh
npm run preview
```

Lint:

```sh
npm run lint
```

## Documentation

Additional project documents are available in:

- [`USER_MANUAL.md`](./USER_MANUAL.md)
- [`docs/REPORT.md`](./docs/REPORT.md)
- [`docs/hcd.md`](./docs/hcd.md)
- [`docs/security_threat_model.md`](./docs/security_threat_model.md)
- [`docs/accessibility.md`](./docs/accessibility.md)

## Notes

- This is a demo system, not a production-secure platform.
- Passwords are stored in plain localStorage for simulation only.
- Real deployments should move auth, storage, image handling, and audit enforcement to a backend.
