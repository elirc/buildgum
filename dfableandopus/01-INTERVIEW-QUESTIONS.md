# Interview questions on Buildgum

23 questions with model answers. Paths are relative to the project root. Every technical answer names a line you can open while you speak.

## Screening

**S1 (junior). What are the entities and how are they stored?**
One JSON document under a single key. `src/model.ts:49` declares `State` as `{ schema: 1, revision, products, discounts, orders }`, and `src/repository.ts:9` names the key `buildgum-workspace-v1`. `Product` (`model.ts:2`) carries an id, a `version` counter, title, creator, category, description, `priceCents`, `active` and an accent color. `Discount` (`model.ts:13`) is id, version, code, percent, active. `Order` (`model.ts:39`) is the receipt: id, version, `requestKey`, `fingerprint`, buyer, a frozen `Quote`, `createdAt` and a status of `Recorded` or `Cancelled`.

**S2 (junior). Why are prices integers?**
`priceCents` is a whole number of cents, bounded to 0 through 10,000,000 at `model.ts:145`. Text becomes cents exactly once, in `parsePrice` at `model.ts:330`, which requires the pattern `^(0|[1-9]\d{0,5})(\.\d{1,2})?$` and then computes `Number(d) * 100 + Number(c.padEnd(2, "0"))`. Nothing downstream sees a float, so no arithmetic can drift. Display goes the other way, through `money` at `model.ts:324`, which divides by 100 only for `Intl.NumberFormat`.

**S3 (junior). Describe the path a save takes.**
The UI calls `save` at `src/App.tsx:141`, which calls `repo.commit(base, command)`. `commit` (`src/repository.ts:26`) runs inside a lock, reloads current storage, checks for a replayable receipt, compares raw bytes against the caller's baseline, calls the pure `reduce`, encodes and writes. On success `accept` at `App.tsx:136` replaces the snapshot and clears the stale flag; on failure the catch at line 155 shows the error and the draft survives.

**S4 (junior). Which boundary validates, and what does it refuse?**
`model.ts` is the whole validator, and it is strict in an unusual way: `object()` at `model.ts:74` compares the sorted key list against the expected list, so an extra field is as fatal as a missing one. `text()` at line 95 requires the string to equal its own trim, be non-empty unless blank is allowed, stay inside a length bound and contain no control characters. `integer()` at line 85 demands `Number.isSafeInteger` and a range. Every write funnels through `encode` (`model.ts:318`), which validates, stringifies, and then decodes the result again before returning it.

**S5 (junior). What is the difference between a record version and the workspace revision?**
A `version` belongs to one product, discount or order and is checked when that record is edited: `reduce` at `model.ts:411` requires `list[index].version === command.expected` and then sets `value.version = command.expected + 1` on line 417. `revision` at `model.ts:51` belongs to the whole document and is incremented once per accepted command at line 401. The first answers "did this row change under me", the second answers "did anything change under me".

**S6 (mid). Where does concurrency control actually live?**
Two places, deliberately. `browserLock` at `src/repository.ts:69` serialises writers in the same origin through `navigator.locks.request`, and if `navigator.locks` is absent it rejects rather than proceeding unsafely (line 70). Inside the lock, `commit` at `repository.ts:31` compares `current.raw !== base.raw`, a whole-document compare-and-set on the exact stored bytes. The lock stops interleaving; the byte compare is what actually refuses a stale write, and it still works if the lock were bypassed.

**S7 (junior). What happens on a stale write?**
It throws "Workspace changed in another tab. Export your draft, then reload." (`repository.ts:33`), the catch in `save` puts that text on screen, and nothing is discarded: the editor draft and the cart stay in memory so the user can export them. The test at `test/model.cjs:340` proves the property directly, two concurrent commits from the same baseline and exactly one fulfilled.

## Deep dive

**D1 (mid). Describe the change you made to checkout.**
The original set a boolean and displayed a fixed order identifier, so there was no record of what had been bought, nothing survived a reload, and a retry was indistinguishable from a second purchase. The replacement has three parts. `quoteCart` (`model.ts:340`) prices the cart from the catalog. The UI freezes an attempt (`App.tsx:280`) holding an order id, a `requestKey`, a normalized buyer, the quote and a timestamp, created before the write is awaited. `commit` (`repository.ts:26`) calls `replay` first, so a retry of that same frozen attempt returns the existing receipt instead of creating another.

**D2 (mid). Why is the request key generated when the attempt is frozen, not when the button is pressed?**
Because the client cannot distinguish "the write was rejected" from "the write succeeded and the acknowledgement was lost". Both look like an error. If the key were regenerated per press, a retry after a lost acknowledgement would create a second receipt. Freezing it at `App.tsx:283` means retry sends byte-identical arguments, `replay` at `model.ts:387` finds the order by key, and the count stays at one. `astraupskill/03-WORKED-CHANGE.md` sets this out as a three-outcome table, and the test "checkout retry after write then response failure finds receipt" at `test/model.cjs:351` makes it executable: `setItem` writes and then throws, the commit rejects, the same command is committed again, and the assertion is `orders.length === 1` with `revision === 1`.

**D3 (mid). What stops key reuse from being a hole?**
`fingerprint` at `model.ts:222` serialises the buyer plus every line's product id, version, title, unit price and quantity, the discount identity, and the three totals. `replay` at `model.ts:390` throws "This request key was already used with different details." when a stored order's fingerprint disagrees with the incoming one. That turns a client bug, the same key reused for a different purchase, into a loud failure instead of a silently returned wrong receipt. `test/model.cjs:243` covers it by changing only the buyer.

**D4 (mid). Why does `replay` run before the baseline compare in `commit`?**
Order matters at `repository.ts:30` versus `:31`. A retry may legitimately carry a stale baseline: the first attempt wrote successfully, so storage has moved on, and the caller still holds the old snapshot. If the compare ran first, the retry would be rejected as stale and the user would be told to reload, having no idea their order exists. Checking for an already-accepted receipt first makes the retry idempotent regardless of baseline age. `test/model.cjs:369` pins that: commit the checkout, make an unrelated edit, then retry from the original base, and the result is revision 2 with one order.

**D5 (mid). Why does a frozen quote get re-quoted inside the reducer?**
`reduce` at `model.ts:441` validates the submitted quote, then rebuilds one from the current catalog with `quoteCart` at line 442, and requires the two fingerprints to match at line 450. Without that, an attempt frozen before a price rise would be accepted at the old price. The error text names the remedy: "Quote changed; review current prices before a new attempt." Two tests cover both triggers, a price or product version change at `test/model.cjs:219` and a discount change at `:228`.

**D6 (mid). What breaks if you delete line 31 of the repository?**
Line 31 is `if (current.raw !== base.raw) throw ...`. Removing it turns every commit into a last-write-wins overwrite of the whole document: tab B, holding a ten-minute-old snapshot, saves a product and silently deletes every product, discount and receipt tab A created in the meantime, because the write is one replacement document built from B's stale state. The lock does not help, it only decides who goes first. The test at `test/model.cjs:340` fails immediately, since it expects exactly one of two concurrent commits to succeed.

**D7 (mid). Deletion policy: why is a product sometimes undeletable but a discount always deletable?**
`reduce` at `model.ts:431` refuses to delete a product that any receipt line references, with "This product has receipt history. Archive it instead." A discount has no such guard at line 439. The reason is what the receipt stores: the order's quote embeds the discount's code, percent and version (`model.ts:29`), so the historical record survives the discount row's removal, while `validateState` at `model.ts:299` requires every receipt line to point at a product that still exists. Two different reference models, two different policies, stated rather than assumed. `test/model.cjs:251` covers both the block and the archive path.

**D8 (mid). How is rounding handled on discounts?**
`quoteCart` computes `Math.floor((subtotalCents * percent + 50) / 100)` at `model.ts:374`, which is half-up rounding on integers with no floating point anywhere. `validateQuote` recomputes exactly the same expression at `model.ts:209` and refuses the quote if the three totals disagree with the lines, so a tampered or hand-built receipt fails. The worked example in `astraupskill/03-WORKED-CHANGE.md` is 7800 cents at 20 percent giving 1560 and a 6240 total.

**D9 (mid). What is the honest security position?**
There is none, and the course says so. Web Locks serialise cooperating writers on one origin; a script, an extension or a developer console can write `localStorage` directly. `astraupskill/02-CONCEPTS.md` states that a lock, a TypeScript type or a hidden button is not security against an untrusted client. The validation in `model.ts` is an integrity boundary against corrupted or hand-edited data, not an authorization boundary, and on a server the same checks would sit behind authentication inside the transaction.

**D10 (mid). What does the test suite prove, and what does it not?**
44 fast domain and storage tests in `test/model.cjs` plus 15 Chromium scenarios through `scripts/verify_browser.py`. They cover CRUD with version checks, cent arithmetic, quote validation, request-key retries, stale baselines, quota failure, explicit recovery from corrupt bytes, and a write accepted before its acknowledgement fails. `astraupskill/VERIFICATION.md` lists what they do not establish: no authenticated actor, no server, no payment, no tax, no stock reservation, no power-loss durability, no guarantee against a writer that bypasses the repository.

## Behavioral

**B1. Tell me about a time you replaced something that only looked finished.**
Situation: Buildgum's checkout displayed a fixed order number along with payment, tax and delivery claims it did not perform. Task: make the flow honest and make a retry safe. Action: I built the quote, receipt and idempotency path, and I also changed the language: the success message at `src/App.tsx:152` reads "Simulated receipt recorded. No payment or delivery occurred." The original planning documents were kept in `docs/HISTORICAL-README.md` for comparison rather than deleted, so the gap between ambition and implementation is visible. Result: 44 domain tests and 15 browser scenarios pass, and `astraupskill/VERIFICATION.md` states in its own section which claims the checks do not support.

**B2. Describe a bug or risk you found by reasoning rather than by a failing test.**
Situation: the checkout retry path looked correct because the receipt lookup existed. Task: decide where in `commit` it belonged. Action: I reasoned about the retry's baseline. A successful first write moves storage forward, so a retry necessarily carries a stale baseline, which meant an ordering where the compare ran first would reject exactly the case idempotency exists to serve. I put `replay` ahead of the compare at `src/repository.ts:30` and wrote the test that would have caught the other order, "matching retry survives unrelated later edits" at `test/model.cjs:369`. Result: the retry is safe even after unrelated edits by another tab, and the test would fail if anyone reordered those two lines.

**B3. Tell me about a constraint you chose to keep even though it was conservative.**
Situation: the baseline compare is whole-document, so an edit to a discount in one tab rejects an unrelated product edit from another tab's older snapshot. Task: decide whether to narrow it to per-record versions. Action: I kept the document-level compare and wrote down why in `astraupskill/02-CONCEPTS.md`: one easily explained consistency boundary beats a clever one in a workspace whose entire state is a single stored document, and a server with row-level updates is the place to narrow it. The per-record `version` fields still exist and are enforced by `reduce` at `model.ts:411`, so the narrower mechanism is already there when the storage model changes. Result: a rejection is always explainable in one sentence to the user, and the export-your-draft path keeps a rejection from costing work.

**B4. When did you make a failure message part of the design?**
Situation: rejections in this app cost the user a form they had filled in. Task: make failure recoverable. Action: every throw carries the next action, not just the cause: "Export your draft, then reload." (`repository.ts:33`), "Record changed; reload and review your draft." (`model.ts:415`), "This product has receipt history. Archive it instead." (`model.ts:436`). The UI backs those up, holding the frozen attempt on screen and warning before a discard that a new attempt could create another receipt (`App.tsx:934`). Result: the browser scenarios include guarded navigation and draft downloads, and the export path exists precisely so a rejection never silently destroys input.

## Follow-ups an interviewer asks next

**F1. You said the fingerprint is a `JSON.stringify`. Is that a hash?**
No, and I would not call it one. `model.ts:222` returns the serialized array itself, so it is a canonical form, not a digest. It is longer than a hash and stored on every order, which is a real cost at 2000 receipts, but it is inspectable in the debugger and has no collision question at all. On a server I would hash the same canonical form, because there the comparison happens in a database index rather than in memory.

**F2. Your lock is `navigator.locks`. What if the browser lacks it?**
`browserLock` at `repository.ts:70` rejects with a message telling the user to open the app in a supported browser rather than falling back to an unlocked write. That is the right default: a silent fallback would leave the byte compare as the only protection, which is narrower than it looks, because two tabs can both read the same bytes before either writes. The test at `test/model.cjs:401` covers an unavailable lock leaving storage unmutated.

**F3. The whole workspace is rewritten on every change. When does that stop working?**
`encode` at `model.ts:318` serializes the entire document and then decodes it again to check, so every keystroke-sized change costs a full validate, stringify, parse and validate. The declared ceilings are 4 MiB, 1000 products, 200 discounts and 2000 receipts (`model.ts:311` and `:255` to `:257`). `astraupskill/VERIFICATION.md` says raising them requires measuring serialization, validation and storage behavior first. The structural answer is to stop storing one aggregate, which in browser terms means IndexedDB with per-record writes, and on a server means rows.

**F4. Where does the user actually lose work today?**
Drafts and frozen attempts live in React state only. `astraupskill/VERIFICATION.md` states they are not imported or durably resumed after reload, and `App.tsx:161` confirms a reload clears the editor, cart and attempt after a confirmation. The mitigation is export, at `App.tsx:949`, which writes the buyer, code, cart and attempt to a file for manual review. The real fix is persisting the frozen attempt under its own storage key so a closed tab does not lose the only copy of an in-flight request key.

**F5. If this became a Node service, what is the first thing you would write?**
The idempotency table: a unique index on `(customerId, requestKey)` with the stored response, written in the same transaction as the order, so `replay` becomes a read of that row. `astraupskill/02-CONCEPTS.md` maps it directly, `Idempotency-Key` header in, `If-Match` or a `version` column for the compare, database transaction in place of the Web Lock. The part people get wrong is writing the idempotency row in a separate transaction, which reintroduces exactly the lost-acknowledgement double-charge this design removes.
