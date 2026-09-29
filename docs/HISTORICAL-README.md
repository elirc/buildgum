# Buildgum

Buildgum is a Gumroad-style creator commerce prototype built with Vite, React, TypeScript, and lucide-react. It includes a customer storefront, product preview, cart and checkout flow, creator dashboard, catalog operations, orders, analytics, and admin controls.

## Run

```bash
npm install
npm run dev
npm run check
npm run build
```

## Current Surface

- Storefront search, product cards, product details, cart persistence, discounts, tax estimate, and checkout confirmation.
- Creator dashboard with revenue metrics, operations queues, audit activity, and payout-oriented status.
- Product catalog with status, pricing, sales, refund rate, and risk labels.
- Orders view with fulfillment, disputes, license keys, country, and channel data.
- Analytics panels for funnel movement, revenue mix, and forecasting entry points.
- Admin view for KYC, chargebacks, payout reserves, VAT evidence, policy queues, and audit events.

## Production Integration Points

- Replace seeded data in `src/data.ts` with API calls from a typed client.
- Add authenticated routes and role-based access for buyer, creator, support, risk, and admin roles.
- Wire checkout to a payment provider, tax service, fraud scoring, license provisioning, and receipt delivery.
- Store carts, orders, products, discounts, audit logs, and payout records in a durable database.
- Add end-to-end tests around checkout, refunds, discount validation, product publish review, and payout holds.
