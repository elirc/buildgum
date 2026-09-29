# Buildgum

A local creator-commerce CRUD workshop: products, discounts, exact-cent carts, durable simulated receipts, cancellation, and reviewed backup recovery. No real payments or deliveries occur.

Start the detailed junior-to-mid-level course at [astraupskill/README.md](astraupskill/README.md).

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run dev
```

Open `http://127.0.0.1:5180` consistently; storage belongs to that origin. Requires Node 22.12 or newer compatible with the package engine; verified on Node 22.16.0. Dependencies and lockfile are pinned to the verified versions.

```powershell
npm.cmd test
npm.cmd run build
```

See [testing](astraupskill/04-TESTING-AND-DEBUGGING.md) for optional Chromium checks and [limits](astraupskill/VERIFICATION.md). Export a complete workspace backup before experiments. Cart and editor drafts remain in tab memory and can be exported for manual review.

The original visual palette and fictional collection are retained. Planning documents remain available; [the historical README](docs/HISTORICAL-README.md) preserves the earlier description. The running app does not use old revenue, payout, tax, or fulfillment claims as operational facts.
