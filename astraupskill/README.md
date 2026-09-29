# Buildgum: from catalog mockup to reliable CRUD

Buildgum is a local creator-commerce workshop. You will manage products and discount codes, build a cart, and record simulated order receipts. The useful lesson is learning how an accepted business change travels through validation, concurrency checks, persistence, and a user interface that explains failure without discarding work.

The original project supplied a distinctive cream, charcoal, and orange interface, a fictional creator catalog, and extensive planning documents. Many controls were placeholders. Checkout displayed a fixed order number and payment, tax, and delivery claims without performing those operations. This implementation replaces those claims with explicit local simulation, working CRUD, durable receipts, and reproducible evidence. Original planning material remains available for comparison; it is not evidence of implemented payment infrastructure.

## Prerequisites, toolchain and setup

**Prerequisites:** TypeScript with React function components, browser storage and JSON, npm scripts, and the idea that money is stored as whole cents. The vanilla browser course in `04 JavaScript Training/react` is a natural predecessor for drafts and stale saves.

```powershell
node --version                       # 22.x
npm ci
npm run dev                          # Vite
npm test                             # compiles the tests into .verification/ first, then runs node --test; running node --test test/model.cjs alone will not work
npm run build
python -m pip install playwright==1.59.0   # optional browser verifier
python -m playwright install chromium
python scripts/verify_browser.py           # needs port 5180 free; see 04
```

| Term | Meaning here | Where in this project |
|---|---|---|
| cents | Prices are integers of the smallest unit; text becomes cents once, at the boundary. | `parsePrice` and `money` in `src/model.ts` |
| record version | A counter on one product or discount, checked when that record is edited. | the `version` field asserted by `validateProduct` in `src/model.ts` |
| workspace revision | A counter for the whole stored workspace, raised on an accepted import. | `revision` in `restore`, `src/repository.ts` |
| command | The only input to a state change; the reducer is pure and returns the next state. | `reduce(state, command)` in `src/model.ts` |
| request key | The client-generated key that makes a retried checkout recognisable. | `requestKey` on the checkout command, `src/model.ts` |
| fingerprint | A hash of buyer and quote; the same key with different details is a client bug, not a retry. | `fingerprint(buyer, quote)` in `src/model.ts` |
| replay | Returning the stored receipt for a repeated request key instead of charging twice. | `replay` in `src/model.ts`, called first inside `commit` |
| receipt | The order snapshot that keeps the titles and prices accepted at checkout. | the `Order` records in `validateState`, `src/model.ts` |
| compare-and-set | Refusing to write when storage no longer holds the text the draft was based on. | `current.raw !== base.raw` in `commit`, `src/repository.ts` |
| web lock | Serialises two commits in the same browser before the comparison runs. | `browserLock` in `src/repository.ts` |
| quote | The priced cart computed from the catalog, validated before it can be checked out. | `quoteCart` in `src/model.ts` |
| origin storage key | Saved data belongs to one origin and one key; another port is another workspace. | `STORAGE_KEY = "buildgum-workspace-v1"` in `src/repository.ts` |

## Start and observe

Use Node 22.12 or newer compatible with the declared engine. The implementation was built with Node 22.16.0. From the project root:

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run dev
```

Open `http://127.0.0.1:5180`. The host and port matter: browser storage belongs to an origin. Opening another port or using `localhost` instead of `127.0.0.1` creates a different storage location. Seeing a fresh catalog there does not prove your earlier records were deleted. Use one origin consistently during these exercises.

Create a product called Tiny API Guide priced at `12.35`. Edit it to `18.95`, reload storage, and verify that the accepted price remains. Add it to a cart with quantity two. Apply `BUILD20`, review the total, and record a simulated receipt. Then edit the catalog title again. The receipt should still show the title accepted at checkout. Write down why that difference is intentional before reading the concepts chapter.

## Suggested learning sequence

1. Read [the codebase map](01-CODEBASE-MAP.md), then trace one create operation with the debugger. Locate where input text becomes integer cents.
2. Read [the concepts](02-CONCEPTS.md) and [worked change](03-WORKED-CHANGE.md). Explain record versions, workspace revisions, and receipt snapshots in your own words.
3. Run [the tests and failure drills](04-TESTING-AND-DEBUGGING.md). Reproduce a stale-tab rejection and export the retained draft.
4. Complete [the practice ladder](05-PRACTICE.md), using its acceptance criteria before consulting [the solutions](06-SOLUTIONS-AND-REVIEW.md).
5. Finish [the trace lab](07-TRACE-LAB.md) and compare your claims against [verification and limits](VERIFICATION.md).

Budget four sessions of about two hours. **Junior milestone:** add a validated `supportUrl` field to the catalog item, prove it survives export and import, and show the test that rejects a `javascript:` URL. **Mid-level milestone:** explain, with the receipt table open, why a retried checkout with the same `requestKey` returns one receipt while a retry with a new key returns two, and which of the two a user who lost the acknowledgement actually wants.

## Keep the scope clear

Use fictional buyer addresses. No card data is requested. There is no server, authentication, subscription scheduler, tax calculation, fulfillment, or payment provider. Anyone with access to the browser profile can inspect or alter its data. This small application teaches boundaries you will later enforce in an authenticated API and database.

Before experiments, export a complete workspace backup from Workspace. Draft and receipt exports are reference documents, not importable workspace backups. A reload clears the in-memory cart and editor after confirmation. Recovery is explicit: malformed stored bytes are preserved until you review and confirm a valid replacement. These behaviors are part of the learning material, not incidental inconvenience.
