# Take-home: refunds against a recorded receipt

Time box: 3 to 4 hours. Work in this repository. The acceptance criteria are the specification; nothing is hidden.

## Brief

Buildgum can record a simulated receipt and cancel it whole (`order.cancel`, `src/model.ts:465`). Support needs something narrower: refund part of an order, one line at a time, and show the remaining refundable amount on the order.

Add a `refund` command:

- A refund names an order id, a product id within that order, a quantity to refund, and its own client-generated `requestKey`.
- The refunded quantity per line can never exceed the quantity purchased on that line, and refunds accumulate across multiple partial refunds.
- A cancelled order cannot be refunded; an order that has been fully refunded line by line cannot be cancelled.
- A retried refund with the same `requestKey` must not refund twice.
- The Orders view shows, per order, the amount refunded and the amount still refundable, in cents formatted by `money` (`src/model.ts:324`).

## Acceptance criteria

1. The command is added to the `Command` union at `src/model.ts:56` and handled in `reduce`, following the existing branches. `reduce` stays pure: no storage, no `Date`, no `crypto` inside it.
2. Refund records are validated by `validateState` with the same strictness as everything else, meaning the exact-key-set rule from `object()` (`src/model.ts:74`), an `id()` request key, a bounded integer quantity, and a `createdAt` matching the ISO pattern enforced at `src/model.ts:283`.
3. The refunded amount is recomputed from the stored line's `unitCents` and the refunded quantity and checked during validation, in the same spirit as the totals check at `src/model.ts:215`. A hand-edited refund amount must fail import.
4. Idempotency is real: extend `replay` (`src/model.ts:387`) so a refund whose `requestKey` already exists returns without a second effect, and so reusing that key with different details throws, the way the checkout fingerprint check does at `src/model.ts:390`.
5. An order's `version` advances on each accepted refund, and the command carries an `expected` version, matching the pattern used by `order.cancel` at `src/model.ts:467`.
6. The mutual exclusion holds in both directions: refunding a `Cancelled` order and cancelling a fully refunded order both fail with distinct messages that name the next action, the way `src/model.ts:436` does.
7. The Orders view in `src/App.tsx` shows refunded and refundable amounts and disables the refund control while `busy` or while an attempt is frozen, matching the existing pattern at `src/App.tsx:826`.
8. Existing behavior does not regress. `npm test` still passes all 44 existing cases, and `npm run build` succeeds.

## What to submit

- A branch or patch with the model change, the UI change and the tests.
- New tests appended to `test/model.cjs`, in the style already there: `node:test` with `node:assert/strict`, one behavior per `test(...)`. Run them with `npm test` from the project root. Note that `npm test` runs `node scripts/test.mjs`, which compiles into `.verification/` before running; `node --test test/model.cjs` on its own will not work.
- `NOTES.md` at the repository root, at most one page: where you put the refund records and why, what the import-compatibility consequence is, and what you left undone.

## Grading rubric

| Criterion | Strong submission | Weak submission |
|---|---|---|
| Purity of the reducer | The refund branch is a pure function of state and command; timestamps and keys arrive in the command, generated at the UI boundary the way checkout does at `src/App.tsx:282` | `new Date()` or `crypto.randomUUID()` called inside `reduce`, making the reducer untestable and a replay non-deterministic |
| Idempotency | `replay` is extended, and a retry with the same key is a no-op while the same key with different details throws; there is a test that writes then throws, mirroring `test/model.cjs:351` | A boolean `refunded` flag, or a check that runs after the write, so a retry either double-refunds or silently succeeds with the wrong amount |
| Validation strictness | The new record passes through `object()` with an exact key list, and the refunded amount is recomputed and compared during `validateState`, so a tampered import fails | New fields added without extending the key list, so `object()` rejects every existing backup, or added loosely so a hand-edited amount imports cleanly |
| Invariants | Per-line accumulation is enforced against the stored purchased quantity, and the cancel/refund exclusion is enforced in both directions | Only the single-refund case is checked, so two partial refunds of 60 percent each are both accepted |
| Tests | Covers partial refund, accumulation to the exact purchased quantity, one unit over, retry with the same key, key reuse with different details, refund of a cancelled order, and a tampered import | One happy path, and assertions only on the final total rather than on the rejected cases |
| Notes and honesty | Says plainly that this refunds nothing financially, consistent with the framing in `astraupskill/VERIFICATION.md`, and names the migration cost for existing exports | Language implying money moves, or silence about breaking previously exported backups |

## Reviewer's notes

The first read is the `reduce` branch. If a `Date` or a random id appears inside it, the submission has broken the property the whole codebase is built on, that the reducer is a pure function validated on entry at `src/model.ts:398` and re-validated on exit at line 475. Everything else is secondary to that.

The second read is `replay`. Refunds are the second idempotent operation in this system, and the interesting question is whether the candidate generalised or special-cased. `replay` today returns an `Order | undefined` and short-circuits `commit` at `src/repository.ts:30` by truthiness, so a refund that must also short-circuit needs either a wider return type or a second guard. A candidate who notices that the existing signature does not extend cleanly, and says which of the two they chose and why, is doing the job. A candidate who returns the parent order from a refund replay, so the caller cannot tell which operation was replayed, has produced something that works today and misleads tomorrow.

Third, the import compatibility question. Because `object()` compares exact key sets, adding a field to `Order` breaks every backup exported before the change, with the message "Unexpected or missing fields." There is no migration machinery in this repository. The honest answers are to put refunds in a new top-level collection, which still changes the `validateState` key list at `src/model.ts:246` and so still breaks old files, or to bump `schema` and write an upgrade step. Any answer is acceptable if the notes say which one and what it costs. Silence here is the most common failure.

Finally the tests. The existing suite asserts behaviors rather than implementation, and one of its best cases makes `setItem` succeed and then throw (`test/model.cjs:351`). A refund submission with no equivalent test for the lost-acknowledgement path has not covered the case the feature is most likely to be reported for.
