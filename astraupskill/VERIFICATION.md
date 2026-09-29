# Verification evidence and practical limits

The implementation is verified in layers: pure model and storage assertions, production compilation, and Chromium workflows against an owned loopback preview process. The central report records completed evidence and the finite delivery manifest. Generated results are separate from source and browser data.

## Reproduce the checks

Run `npm.cmd test` and `npm.cmd run build` from this root. The 44 fast tests write `.verification/unit.log` and `.verification/unit-results.json`. The browser verifier is [scripts/verify_browser.py](../scripts/verify_browser.py); environment options are in [testing and debugging](04-TESTING-AND-DEBUGGING.md). Its 15 scenarios produce individual results and screenshots.

Fast tests cover product and discount CRUD, strict imports, cent arithmetic, immutable snapshots, reference-preserving deletion, cancellation, request-key conflicts, stale baselines, explicit recovery, quota failure, and a write accepted before its acknowledgement fails. Browser cases cover actual forms, localStorage, separate tabs, draft downloads, receipt persistence, guarded navigation, reviewed import, invalid carts, and responsive layouts.

Fixtures are fictional. Fresh browser contexts isolate test records. The verifier starts its own preview process and refuses to reuse an occupied port. No payment provider, creator account, customer database, or external notification service is contacted. The old `buildgum-cart` key remains untouched, including when malformed.

## What these checks do not establish

This is a browser-only local workshop. There is no authenticated actor, authorization boundary, server database, payment acceptance, tax calculation, recurring billing, stock reservation, license generation, fulfillment, refund, or notification delivery. Orders are explicitly simulated receipts. Cancellation changes local history without requesting a financial refund.

Web Locks protect cooperating same-origin writers. Scripts bypassing the repository, browser-profile access, storage clearing, extension interference, and machine failure are outside that guarantee. Tests do not certify power-loss durability, every browser engine, deployment hardening, or complete accessibility. Selected layout checks verify document and navigation-label overflow at their tested widths and states, not universal visual correctness.

## Storage and recovery boundaries

JSON is capped at four MiB, with at most one thousand products, two hundred codes, and two thousand receipts. The aggregate is rewritten for each accepted change. This is a bounded learning workspace, not an unbounded production ledger. Increasing limits requires measuring serialization, validation, storage behavior, and user experience.

Drafts and frozen checkout attempts remain in tab memory and can be exported for manual review. They are not imported or durably resumed after reload. A new key after an uncertain result can create another receipt; inspect Orders before abandoning the attempt. Backup replacement can remove current records absent from the imported file. Corrupt bytes remain until replacement is explicitly confirmed.

Original planning documents provide historical context. The preserved [historical README](../docs/HISTORICAL-README.md) may describe ambitions beyond implementation. Treat source, reproducible checks, and delivery evidence as the record of completed behavior. When extending the project, update this page with actual tests and newly introduced failure boundaries. Do not promote a local simulation into a production claim merely because the interface looks complete.

## Completed run

All 44 domain/storage tests and all 15 Chromium scenarios passed, and the production TypeScript/Vite build passed. Six screenshots were visually reviewed: [desktop storefront](images/storefront-1440.png), [desktop editor](images/editor-1440.png), [tablet storefront](images/storefront-800.png), [tablet editor](images/editor-800.png), [phone storefront](images/storefront-390.png), and [phone editor](images/editor-390.png). A repeated background-tab timeout was resolved by explicitly foregrounding that tab and allowing a longer action deadline; the final complete suite passed with unchanged integrity assertions.
