# Technical Walkthrough

This document is a viva and presentation guide for RentTrack. It explains what was built, why the architecture looks the way it does, where each responsibility lives, and how the system works internally.

## 1. Project Purpose

RentTrack is a local-first rental management mini-SaaS built as a frontend-only simulation. The project demonstrates how a multi-role business system can be modeled in Vue without a backend while still preserving:

- role-based access control
- workflow-driven state transitions
- persistence
- auditability
- reusable architecture

The system has three actors:

- `Admin`
- `Landlord`
- `Tenant`

Instead of using an API server and database, the app uses `localStorage` as the persistence layer and a set of repository and Pinia store abstractions to simulate a more realistic production architecture.

## 2. High-Level Architecture

The architecture is organized in layers:

1. `UI Layer`
   Vue views, components, layouts, and route-driven pages.

2. `State Layer`
   Pinia stores containing business actions and derived state.

3. `Persistence Layer`
   Generic repository helpers and localStorage utilities.

4. `Domain Layer`
   Shared business rules such as ID creation, unit-code generation, payment classification, and subscription status logic.

5. `Seed Layer`
   Initial local demo dataset creation.

This gives the app a structure similar to a backend-driven frontend, even though the backend is simulated locally.

## 3. Why This Architecture Was Chosen

The project requirements asked for:

- Vue 3 Composition API
- Vue Router
- Pinia
- Tailwind CSS
- localStorage persistence
- multiple business modules
- automatic workflows
- audit trail

A flat component-only approach would have become fragile very quickly. The chosen architecture separates concerns clearly:

- UI components render data and collect input
- stores orchestrate workflows
- utilities and repositories manage reusable data access
- domain helpers enforce shared rules

This makes the project easier to explain, test mentally, and extend later into a real backend.

## 4. Directory Structure

### Root-Level Files

- `README.md`
  high-level project documentation

- `USER_MANUAL.md`
  end-user instructions

- `docs/`
  supporting academic and technical documentation

- `package.json`
  scripts and dependencies

- `vite.config.js`
  Vite config and alias setup

- `tailwind.config.js`
  Tailwind scanning configuration

- `postcss.config.cjs`
  PostCSS integration for Tailwind

### `src/`

- `main.js`
  application bootstrap

- `App.vue`
  root app component

- `assets/`
  CSS and image assets

- `components/`
  reusable UI building blocks

- `composables/`
  reusable Composition API helpers

- `layouts/`
  role-specific shells

- `mock/`
  demo seed creation

- `router/`
  route definitions and route guards

- `stores/`
  Pinia domain stores

- `utils/`
  domain helpers, storage, and repository abstraction

- `views/`
  route-level pages

## 5. Bootstrap Flow

The app starts in `src/main.js`.

Main responsibilities:

1. import global CSS
2. create Vue app
3. create Pinia
4. install router and Pinia
5. initialize theme store
6. initialize data through seed logic indirectly
7. sync late payments on startup

This means the app is not just rendering UI on load. It also performs startup business maintenance so derived data remains consistent.

## 6. Routing Design

Routing is in `src/router/index.js`.

### Public Route

- `/login`

### Authenticated Areas

- `/admin/*`
- `/landlord/*`
- `/tenant/*`

### Layout Strategy

Each role is wrapped in a dedicated layout:

- `AdminLayout.vue`
- `LandlordLayout.vue`
- `TenantLayout.vue`

This was used instead of one giant shell because:

- each role has different menu items
- the shell should remain reusable
- route grouping is cleaner

### Route Guard Strategy

The router guard performs three major checks:

1. `Authentication check`
   If the route is protected and no user is logged in, redirect to `/login`.

2. `Role check`
   If the user tries to access another role’s area, redirect to their own dashboard.

3. `Landlord subscription check`
   If the landlord subscription is unpaid or expired, redirect to `/landlord/subscription-required`.

This models business access control on top of normal auth access control.

## 7. Persistence Layer

The project persists everything inside localStorage under a single application root.

### `src/utils/storage.js`

This file contains root-level localStorage operations:

- `readRoot()`
- `writeRoot()`
- `getEntity()`
- `setEntity()`
- `getValue()`
- `setValue()`
- `removeValue()`
- `resetStorage()`

Why this exists:

- it centralizes localStorage access
- it prevents every store from directly manipulating browser storage
- it makes data access more consistent

### `src/utils/repo.js`

This file acts like a tiny repository layer. It provides generic CRUD helpers:

- `getAll(entity)`
- `getById(entity, id)`
- `create(entity, data)`
- `update(entity, id, partial)`
- `remove(entity, id)`
- `replaceAll(entity, items)`
- `upsert(entity, predicate, data)`

Why this matters:

- stores focus on business actions instead of raw persistence mechanics
- the app feels closer to a production repository/service pattern
- it reduces repeated CRUD code

## 8. Domain Utility Layer

The business rule helpers live in `src/utils/domain.js`.

This file is important because it centralizes the “rules of the system”.

Key functions:

- `createId(prefix)`
  generates entity IDs

- `today()`
  returns current date

- `currentMonth()`
  returns current `YYYY-MM`

- `addYears(dateString, years)`
  used for annual subscription dates

- `normalizeEmail(email)`
  avoids credential mismatch due to casing or whitespace

- `createPrefixCode(name)`
  extracts the first 3 uppercase letters from property name

- `generateUnitCode(prefixCode, index)`
  makes codes like `HIL-001`

- `generateUnits(propertyId, prefixCode, unitsCount)`
  auto-builds unit records

- `coerceUnitsCount(category, unitsCount)`
  enforces `family_house => 1`

- `getSubscriptionStatus(subscription)`
  computes real status including `expired`

- `computePaymentStatus(amountPaid, monthlyRent, isLate)`
  derives `Paid`, `Partial`, or `Late`

- `listMonthsBetween(startDate, endMonth)`
  used to generate missing late records

This layer is what gives the system consistent behavior across multiple screens and stores.

## 9. Seed Layer

The seed logic is in `src/mock/seed.js`.

### What It Does

On first run, or when the storage version changes, it populates localStorage with:

- admin user
- landlord user
- tenant user
- unpaid subscription
- seeded property
- generated units
- active lease
- existing payment
- pending payment proof
- maintenance ticket
- chat thread and messages
- notifications
- audit log entry

### Why It Uses a Storage Version

The file checks `STORAGE_VERSION`.

If the version changes:

- existing local demo data is replaced
- the app reseeds with the latest expected structure

This is important in a frontend-only project because old localStorage can easily become incompatible with newer code.

## 10. State Management with Pinia

The main application logic lives in stores.

Each domain has its own store so responsibilities remain isolated.

### `auth.js`

Responsibilities:

- login
- logout
- current user state
- session persistence

Important idea:

Auth does not own all user data. It only manages the active session and current user context.

### `subscriptions.js`

Responsibilities:

- read landlord subscription state
- mark subscriptions paid/unpaid
- renew annual subscriptions
- request demo payment
- compute subscription revenue summary

Business significance:

This store is not just data access. It controls whether landlords are allowed into their workspace.

### `landlords.js`

Responsibilities:

- create landlord accounts
- update landlord accounts
- remove landlord accounts

It also coordinates with `subscriptions.js` when new landlords are created.

### `properties.js`

Responsibilities:

- create property
- update property
- regenerate units
- remove property

This store collaborates with `units.js`.

### `units.js`

Responsibilities:

- refresh unit data
- change occupancy status
- regenerate units
- remove units when a property is removed

### `tenants.js`

Responsibilities:

- create tenant user and tenant record
- validate unit availability
- create linked lease during tenant creation

This is an important orchestration store because tenant creation is not a single-table insert. It creates:

- a user
- a tenant record
- a lease
- occupancy update indirectly through lease creation

### `leases.js`

Responsibilities:

- create lease
- end lease
- sync unit occupancy

Rule:

- active lease => occupied
- ended lease => available

### `payments.js`

Responsibilities:

- create or update confirmed payments
- mark payments late
- auto-generate late records for missed months

This store expresses an important algorithm:

- if no confirmed payment exists for a past lease month, generate a `Late` record

### `paymentProofs.js`

Responsibilities:

- submit proof
- review proof
- confirm proof
- reject proof with reason

When confirming a proof, it also triggers:

- payment record creation/update
- notifications
- audit logging

### `tickets.js`

Responsibilities:

- create ticket
- update ticket status
- reopen once

### `chats.js`

Responsibilities:

- create or reuse threads by context
- send messages

Contexts:

- `general`
- `payment_proof`
- `maintenance_ticket`

### `notifications.js`

Responsibilities:

- create notification
- mark read
- mark all read

### `auditLogs.js`

Responsibilities:

- append important actions
- expose sorted activity history

### `ui.js`

Responsibilities:

- temporary toast messages

### `theme.js`

Responsibilities:

- initialize light/dark mode
- persist theme
- toggle theme

## 11. Reusable UI Components

The component system was designed for reuse rather than duplicating HTML in every page.

### `AppShell.vue`

Shared app shell used by layouts:

- sidebar
- topbar
- mobile nav strip
- page content area

### `SidebarNav.vue`

Handles role-based navigation menu rendering.

### `Topbar.vue`

Handles:

- role label
- title
- notifications button
- theme toggle
- session identity
- logout

### `Table.vue`

Reusable data table with slot-based cell customization.

This avoided rewriting custom table markup everywhere.

### `Modal.vue`

Accessible modal with:

- ESC close
- focus restoration
- body overlay

### `FormField.vue`

Standard label + hint + validation wrapper.

### `FileUploadWithPreview.vue`

Converts images to base64 and previews them instantly.

Used in:

- payment proof upload
- maintenance ticket image upload

### `Badge.vue`

Reusable visual status indicator.

### `StatCard.vue`

Metric display card used on dashboards.

### `EmptyState.vue`

Fallback component for empty lists and first-use screens.

### `Toast.vue`

Renders global live notifications from the UI store.

## 12. Composables

### `useSessionEntities.js`

This composable helps tenant-oriented screens derive linked entities for the current logged-in user:

- current tenant record
- current lease
- current property
- current unit

Why it exists:

- many tenant pages need the same lookup chain
- it prevents repeated lookup logic in multiple views

## 13. View-Level Responsibilities

Each file in `src/views/` is a route-level page.

### Admin Pages

- `AdminDashboard.vue`
  summary metrics and recent activity

- `AdminLandlords.vue`
  landlord creation and subscription management

- `AdminReports.vue`
  revenue and unpaid-landlord reporting

- `AdminAudit.vue`
  filterable audit trail

### Landlord Pages

- `LandlordDashboard.vue`
  occupancy, proofs, tickets, audit visibility

- `LandlordProperties.vue`
  CRUD properties and regenerate units

- `LandlordTenants.vue`
  create tenant + assignment + lease

- `LandlordLeases.vue`
  end leases and release units

- `LandlordPayments.vue`
  view paid, partial, late records

- `LandlordPaymentProofs.vue`
  confirm or reject proofs

- `LandlordMaintenance.vue`
  update ticket status and open chat

- `LandlordChat.vue`
  thread-based tenant communication

- `LandlordSubscriptionRequired.vue`
  gating page with plan selection, demo payment, logout

### Tenant Pages

- `TenantDashboard.vue`
  lease, payments, tickets

- `TenantPayments.vue`
  submit proof and review payment history

- `TenantMaintenance.vue`
  create ticket, reopen ticket, open chat

- `TenantChat.vue`
  context-aware communication

## 14. End-to-End Workflow Explanations

### A. Login Flow

1. User enters email and password.
2. `auth.login()` normalizes the email and compares against seeded users.
3. If matched, the session is stored in localStorage.
4. The router guard redirects to the correct area.

### B. Landlord Subscription Flow

1. Landlord logs in.
2. Router guard checks the landlord’s subscription.
3. If unpaid or expired, landlord is redirected to the subscription-required page.
4. On that page:
   - landlord can log out
   - choose annual or lifetime
   - simulate payment
5. The subscription is marked paid and access is unlocked.

### C. Property Creation Flow

1. Landlord submits property form.
2. `properties.createProperty()` creates property record.
3. Prefix code is derived from property name.
4. Units are generated automatically through `units.regenerate()`.
5. Audit log is written.

### D. Tenant Creation Flow

1. Landlord selects property and available unit.
2. `tenants.createTenantWithLease()` validates availability.
3. Tenant user record is created.
4. Tenant business record is created.
5. Lease is created.
6. Lease creation marks unit occupied.
7. Notifications and audit actions occur where relevant.

### E. Payment Proof Flow

1. Tenant uploads proof image.
2. `paymentProofs.submitProof()` stores a pending record.
3. Landlord sees the pending proof.
4. Landlord confirms or rejects:
   - confirm => payment created/updated
   - reject => landlord comment required
5. Tenant receives notification.
6. Audit log records the decision.

### F. Late Payment Logic

This is a key algorithm.

At startup and payment-page refresh:

1. The system checks active leases.
2. It generates all months between lease start and current month.
3. For any past month with no confirmed payment, it creates a `Late` payment entry.

This means late status is derived automatically rather than manually counted.

### G. Maintenance Flow

1. Tenant submits ticket with optional image evidence.
2. Landlord sees open ticket.
3. Landlord sets status to `InProgress` or `Resolved`.
4. Tenant may reopen once if needed.
5. Chat can be opened from the ticket context.

### H. Chat Flow

Threads are not random message groups.

Each thread is tied to:

- a landlord
- a tenant
- a context type
- a context ID

This gives messages business meaning.

## 15. Dark Mode Design

Dark mode is implemented through:

- `theme.js` store
- CSS overrides in `src/assets/main.css`
- root class toggle `theme-dark`

Why not use Tailwind dark class everywhere?

Because this project was already using many utility classes and needed a practical retrofit. A centralized CSS override strategy allowed fast global dark-mode adaptation while preserving the existing component templates.

Additional visual tuning:

- login image brightness reduced in dark mode
- dashboard image brightness reduced in dark mode
- light hover states overridden for dark mode

## 16. Notification Interaction

Notifications are stored in the notifications store and surfaced in the top bar.

The top bar supports:

- showing unread count
- opening a notification panel
- marking one notification as read
- marking all notifications as read

This turns notifications from passive data into an interactive UI feature.

## 17. Auditability

Audit logs are used as the “footprint system”.

Examples of actions recorded:

- landlord created
- subscription updated
- proof submitted
- proof confirmed/rejected
- ticket status changed
- message sent

Why this matters:

- it demonstrates traceability
- it supports administrative review
- it simulates a compliance-aware business system

## 18. Accessibility Considerations

The implementation includes:

- inline validation messages
- alert roles for errors
- modal keyboard escape handling
- focus restoration after modal close
- semantic tables
- toast live region
- visible focus states

This is important to mention during viva because accessibility was considered as a system property, not as a final cosmetic step.

## 19. Limitations

The project is intentionally frontend-only.

Known limitations:

- passwords are not securely hashed
- localStorage can be manually edited
- no real file upload backend exists
- no server-side authorization exists
- no multi-user real-time sync exists

These are acceptable for the assignment because the app is a simulation of business behavior rather than a production deployment.

## 20. How to Explain It in Viva

A strong explanation path is:

1. start from the problem domain
   explain the three roles and their responsibilities

2. explain the layered architecture
   UI -> stores -> repo/storage -> localStorage

3. explain why Pinia stores were split by domain
   better separation, business actions, easier scaling

4. explain the router guards
   auth, role protection, landlord subscription gating

5. explain one or two key algorithms
   unit-code generation, lease occupancy updates, late payment generation

6. explain how audit logs and notifications make the app feel like a real business system

7. finish by noting what would move to a backend in production

## 21. Files Worth Showing During Presentation

If asked to show “where the logic is”, these are the best files:

- `src/router/index.js`
- `src/mock/seed.js`
- `src/utils/domain.js`
- `src/utils/repo.js`
- `src/stores/auth.js`
- `src/stores/subscriptions.js`
- `src/stores/properties.js`
- `src/stores/tenants.js`
- `src/stores/leases.js`
- `src/stores/payments.js`
- `src/stores/paymentProofs.js`
- `src/stores/tickets.js`
- `src/stores/chats.js`
- `src/views/landlord/LandlordProperties.vue`
- `src/views/landlord/LandlordPaymentProofs.vue`
- `src/views/tenant/TenantPayments.vue`

These files show the architecture most clearly.

## 22. Final Summary

Under the skin, RentTrack is not just a set of pages. It is a state-driven business simulation with:

- layered design
- persistent local data
- domain-driven stores
- route-level access control
- automated workflows
- auditability
- reusable UI architecture

That is the core technical story of the project.
