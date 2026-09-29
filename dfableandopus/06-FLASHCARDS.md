# Flashcards: Buildgum

Cover the right column. Paths are relative to the project root.

| Question | Answer |
|---|---|
| What is the storage key and where is it declared? | `buildgum-workspace-v1`, `src/repository.ts:9` |
| What are the five fields of `State`? | `schema`, `revision`, `products`, `discounts`, `orders`, `src/model.ts:49` |
| What schema number does `validateState` require? | Exactly 1, `src/model.ts:253` |
| Collection ceilings | 1000 products, 200 discounts, 2000 orders, `src/model.ts:255` to `:257` |
| Maximum encoded workspace size | 4 MiB, checked in `decode` before parsing, `src/model.ts:311` |
| Difference between `version` and `revision` | `version` is per record and checked on edit (`model.ts:411`); `revision` is the whole document and bumps once per command (`model.ts:401`) |
| Where does text become cents? | `parsePrice`, `src/model.ts:330` |
| The price regex | `^(0|[1-9]\d{0,5})(\.\d{1,2})?$`, `src/model.ts:332` |
| Why `padEnd(2, "0")` in `parsePrice`? | "12.3" must become 1230, not 1203, `src/model.ts:336` |
| Upper bound on `priceCents` | 10,000,000, `src/model.ts:145` and `:337` |
| Discount rounding formula | `Math.floor((subtotalCents * percent + 50) / 100)`, half-up on integers, `src/model.ts:374` |
| Where is that formula re-checked? | `validateQuote`, `src/model.ts:209`, which refuses totals that disagree with the lines |
| Quantity bounds on a quote line | 1 to 99, `src/model.ts:186` |
| Why are quote lines sorted by product id? | The fingerprint serialises them in order, so a canonical order makes it a function of content, `src/model.ts:359` and `:189` |
| What does `fingerprint` return? | A `JSON.stringify` of buyer, every line's id/version/title/unitCents/quantity, the discount identity and the three totals, `src/model.ts:222` |
| What does `replay` do? | For a checkout, finds an order by `requestKey` and throws if the stored fingerprint disagrees, `src/model.ts:387` |
| Error on request-key reuse with different details | "This request key was already used with different details.", `src/model.ts:393` |
| Where is the request key created? | When the attempt is frozen, `src/App.tsx:283`, before the write is awaited |
| Why freeze the key rather than generate it per press? | A retry after a lost acknowledgement must send the identical command, or it creates a second order |
| Order of the two guards in `commit` | `replay` first, then the baseline compare, `src/repository.ts:30` and `:31` |
| Why that order? | A successful first write leaves the retry stale, so a staleness check first would reject exactly the retry idempotency exists for |
| Stale-write error text | "Workspace changed in another tab. Export your draft, then reload.", `src/repository.ts:33` |
| What does `browserLock` do when `navigator.locks` is missing? | Rejects with a message rather than writing unlocked, `src/repository.ts:70` |
| What does the lock protect against, and what not? | Cooperating same-origin writers; not scripts bypassing the repository, extensions or profile access |
| What does `commit` pass to `reduce`? | `current.state`, read inside the lock, not the caller's `base.state`, `src/repository.ts:35` |
| Does `reduce` touch storage or `Date`? | No. It is pure; ids, keys and timestamps arrive in the command |
| What does `encode` do beyond stringify? | Validates, stringifies, then decodes its own output before returning, `src/model.ts:318` |
| Why does the reducer re-quote at checkout? | To refuse a frozen quote whose prices or versions have moved, `src/model.ts:442` and `:450` |
| Error when a frozen quote is stale | "Quote changed; review current prices before a new attempt.", `src/model.ts:453` |
| When can a product not be deleted? | When any receipt line references it; archive instead, `src/model.ts:431` |
| Why can a discount always be deleted? | The receipt embeds the discount's code, percent and version, so history survives, `src/model.ts:29` |
| What does `order.cancel` require? | The order exists, its version equals `expected`, and its status is `Recorded`, `src/model.ts:467` and `:471` |
| `createdAt` format required | `20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d{3}Z` and equal to its own `toISOString()`, `src/model.ts:285` |
| What makes an extra JSON field fatal on import? | `object()` compares the sorted key set both ways, `src/model.ts:74` |
| Three uniqueness rules in `validateState` | Product ids, discount ids and codes, order ids and request keys, `src/model.ts:260` to `:262` and `:306` to `:307` |
| What revision does `restore` write? | `Math.max(current, imported) + 1`, so an old backup cannot lower the counter, `src/repository.ts:60` |
| Why does that matter? | An imported revision must not re-authorize a draft written against the pre-import workspace |
| Where does a corrupt workspace end up? | Preserved byte-for-byte until an explicit confirmed replacement, `test/model.cjs:325` and `:389` |
| Test count and kinds | 44 domain and storage tests in `test/model.cjs`, plus 15 Chromium scenarios via `scripts/verify_browser.py` |
| Command to run the fast tests | `npm test` from the project root; it compiles into `.verification/` first, so `node --test test/model.cjs` alone fails |
| Which test proves the lost-acknowledgement case? | "checkout retry after write then response failure finds receipt", `test/model.cjs:351` |
| Which test proves two tabs cannot both win? | "two simultaneous tabs accept one stale-baseline save", `test/model.cjs:340` |
| Why does the dev host matter? | Storage belongs to an origin, so `127.0.0.1:5180` and `localhost:5180` are different workspaces |
| What the checks do not establish | No authenticated actor, authorization, server database, payment, tax, stock reservation, fulfillment or power-loss durability, per `astraupskill/VERIFICATION.md` |
| Server equivalent of `requestKey` | An `Idempotency-Key` header plus a row keyed `(customerId, key)` written in the same transaction as the order |
| Server equivalent of the raw-bytes compare | `If-Match` on an ETag, or `UPDATE ... WHERE id = ? AND version = ?` with the row count as the answer |
