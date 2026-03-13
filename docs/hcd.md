# Human-Centered Design

## Personas

### Admin
- Needs a clear view of landlord activity, subscription coverage, and system risk.
- Wants fast access to unpaid landlords, revenue totals, and high-value audit actions.

### Landlord
- Needs quick property setup, automatic unit handling, and reliable occupancy state.
- Wants to confirm proofs, follow up on late rent, manage tickets, and keep an audit trail.

### Tenant
- Needs a straightforward way to submit proof, raise maintenance issues, and see outcomes.
- Wants transparency on lease details, payment status, and landlord responses.

## Key Flows

```mermaid
flowchart TD
  A[Admin signs in] --> B[Creates landlord account]
  B --> C[Sets subscription plan]
  C --> D[Marks paid or unpaid]
  D --> E[Landlord account access updates]
```

```mermaid
flowchart TD
  A[Landlord signs in] --> B[Creates property]
  B --> C[Units auto-generated from prefix]
  C --> D[Adds tenant]
  D --> E[Available unit selected]
  E --> F[Lease created]
  F --> G[Unit becomes Occupied]
```

```mermaid
flowchart TD
  A[Tenant signs in] --> B[Submits payment proof]
  B --> C[Landlord reviews proof]
  C -->|Confirmed| D[Payment record updated]
  C -->|Rejected| E[Tenant sees reason]
```

```mermaid
flowchart TD
  A[Tenant creates maintenance claim] --> B[Landlord updates status]
  B --> C[Chat thread used if needed]
  C --> D[Tenant can confirm resolved or reopen once]
```
