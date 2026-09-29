# Code reading drill: Buildgum on a shared screen

Six drills, timed the way a live screen-share round is. Answer out loud before opening the details.

## Drill 1: explain this function (4 minutes)

From `src/repository.ts:26`:

```ts
  async function commit(base: Snapshot, command: Command): Promise<Snapshot> {
    return lock(() => {
      const current = load();
      // A response may be lost after durable acceptance. Matching retries return the receipt.
      if (replay(current.state, command)) return current;
      if (current.raw !== base.raw)
        throw new Error(
          "Workspace changed in another tab. Export your draft, then reload.",
        );
      const state = reduce(current.state, command);
      const raw = encode(state);
      storage.setItem(STORAGE_KEY, raw); // Failure leaves the caller's accepted state untouched.
      return { state, raw };
    });
  }
```

Explain every line, then justify the order of the two guards.

<details>
<summary>Answer</summary>

`lock` is injected as a `LockPort` (`repository.ts:12`), which is why this module is testable without a browser; in production it is `browserLock` at line 69, wrapping `navigator.locks.request` on the storage key. Everything inside runs after the lock is held, so `load()` on line 28 reads bytes that no cooperating writer can change underneath it.

The first guard is idempotency. `replay` (`src/model.ts:387`) returns an existing order when the command is a checkout whose `requestKey` is already present, and throws if that key was used with a different fingerprint. Returning `current` means the caller receives the workspace that already contains their receipt, and nothing is written.

The second guard is the compare-and-set: the caller's baseline `raw` string must still be the exact bytes in storage. Since a write replaces the whole document, a stale baseline means the caller's `reduce` would be computed from an old state and would erase everything written since.

The order is load-bearing. A retry after a successful-but-unacknowledged write is, by construction, stale: the write moved storage forward while the caller kept the old snapshot. Checking staleness first would tell that user to reload and never reveal that their order exists. `test/model.cjs:369` pins the order by retrying from the original baseline after an unrelated edit and asserting one order at revision 2.

`reduce` is pure and validates on entry (`model.ts:398`); `encode` validates, stringifies, and decodes its own output (`model.ts:318`), so an unwritable document cannot reach `setItem`. If `setItem` throws, for example on quota, the exception propagates before the new snapshot is returned, so the caller keeps its old accepted state. That is the test at `test/model.cjs:330`.
</details>

## Drill 2: spot the bug (3 minutes)

A mutated copy of the checkout branch of the reducer. The real code is `src/model.ts:440`.

```ts
  } else if (command.type === "checkout") {
    validateQuote(command.quote);
    next.orders.unshift({
      id: command.id,
      version: 1,
      requestKey: command.requestKey,
      fingerprint: fingerprint(command.buyer, command.quote),
      buyer: command.buyer,
      quote: structuredClone(command.quote),
      createdAt: command.createdAt,
      status: "Recorded",
    });
  }
```

<details>
<summary>Answer</summary>

The re-quote is gone. The real code calls `quoteCart` against the current state at `model.ts:442` and requires `fingerprint(command.buyer, fresh) === fingerprint(command.buyer, command.quote)` at line 450, failing with "Quote changed; review current prices before a new attempt."

`validateQuote` alone is not enough, because it only checks that the submitted quote is internally consistent: sorted lines, valid ids and quantities, and totals that agree with the lines it contains (`model.ts:215`). A quote frozen ten minutes ago at the old price is perfectly self-consistent. Without the re-quote, an attempt held across a price rise, a title edit that bumped the product version, or a discount change is accepted on the stale terms, which is a pricing bug that a buyer can trigger deliberately by leaving a tab open.

Two tests fail on this mutation: "price or product version change invalidates a frozen quote" at `test/model.cjs:219` and "discount change invalidates a frozen quote" at `:228`.
</details>

## Drill 3: spot the bug (3 minutes)

A mutated copy of the price parser. The real code is `src/model.ts:330`.

```ts
export function parsePrice(value: string) {
  requireThat(
    /^(0|[1-9]\d{0,5})(\.\d{1,2})?$/.test(value),
    "Price needs dollars and at most two decimal places.",
  );
  return Math.round(Number(value) * 100);
}
```

<details>
<summary>Answer</summary>

Two defects. The obvious one is that this reintroduces binary floating point into money: `Number("12.35") * 100` is 1234.9999999999998, and while `Math.round` rescues that particular case, the approach is exactly what integer cents exists to avoid, and it will be copied into a place without the rounding.

The subtler one is the dropped bound. The real function computes the cents by string manipulation, `Number(d) * 100 + Number(c.padEnd(2, "0"))` at `model.ts:336`, and then runs `integer(cents, 0, 10000000)` at line 337. The mutation returns without that check, so a value the regex allows, up to 999999.99, becomes 99,999,999 cents and is refused much later, by `validateProduct` at `model.ts:145`, if it is refused at all on a path that does not go through a product. Validating at the point of conversion is what makes the boundary a boundary.

Note the `padEnd` detail in the real code: "12.3" must become 1230, not 1203, which is the kind of thing a reviewer should check by asking for the one-decimal case.
</details>

## Drill 4: predict the outcome (5 minutes)

Give the result and one sentence of reasoning for each.

1. Two tabs load the workspace. Tab A saves a new product. Tab B, from its original snapshot, saves a different product.
2. A checkout is submitted; `setItem` writes successfully and then the browser throws before the UI accepts the snapshot. The user presses retry on the frozen attempt.
3. The same scenario, but the user reloads first and starts a new checkout with the same cart.
4. A cart holds one product twice as two separate lines.
5. A product with a receipt referencing it is deleted.
6. A backup is imported whose `revision` is 3, while current storage is at revision 9.
7. A JSON file is imported in which one order's `totalCents` has been reduced by 100.

<details>
<summary>Answers</summary>

1. **One succeeds, one throws.** The lock serialises them; the loser's `base.raw` no longer matches storage, so `repository.ts:31` throws the "Workspace changed in another tab" error and the final revision is 1. That is the assertion at `test/model.cjs:340`.
2. **One order.** The frozen attempt carries the same `requestKey` created at `src/App.tsx:283`, so `replay` at `model.ts:389` finds the stored order and `commit` returns the current workspace without writing. `test/model.cjs:351` is this exact case.
3. **Two orders.** `App.tsx:161` clears the attempt on reload, so the new checkout generates a fresh `requestKey` and the reducer has no reason to treat it as a retry. This is why `App.tsx:934` warns before discarding a frozen attempt and tells the user to inspect Orders first.
4. **Rejected.** `validateQuote` calls `unique` on the line product ids at `model.ts:188`, so duplicate lines fail with "Duplicate identifier or code." The cart must merge quantities instead, bounded to 99 by `model.ts:186`.
5. **Rejected with "This product has receipt history. Archive it instead."** `reduce` at `model.ts:431` scans receipts for a line naming the id. Setting `active: false` is the supported path, and `quoteCart` at `model.ts:350` then refuses to put it in a new cart.
6. **Accepted, and the stored revision becomes 10.** `restore` sets `Math.max(revision, imported.revision) + 1` at `repository.ts:60`, so an old backup cannot lower the counter and re-authorize a draft written against revision 9. `test/model.cjs:395` covers it.
7. **Rejected before anything is written.** `validateQuote` recomputes the subtotal and discount from the lines and requires all three totals to agree (`model.ts:215`), and the order's stored `fingerprint` would also disagree with a fresh `fingerprint(buyer, quote)` at `model.ts:295`. Either check alone is fatal; `test/model.cjs:293` exercises tampered totals.
</details>

## Drill 5: review this diff (6 minutes)

Find the defects before approving.

```diff
--- a/src/model.ts
+++ b/src/model.ts
@@ export function quoteCart(
-    .sort((a, b) =>
-      a.productId < b.productId ? -1 : a.productId > b.productId ? 1 : 0,
-    );
+    ;
@@ export function replay(
 export function replay(s: State, command: Command): Order | undefined {
   if (command.type !== "checkout") return;
   const old = s.orders.find((o) => o.requestKey === command.requestKey);
-  if (old)
-    requireThat(
-      old.fingerprint === fingerprint(command.buyer, command.quote),
-      "This request key was already used with different details.",
-    );
   return old;
 }

--- a/src/repository.ts
+++ b/src/repository.ts
@@ async function commit(
-      const state = reduce(current.state, command);
-      const raw = encode(state);
-      storage.setItem(STORAGE_KEY, raw);
-      return { state, raw };
+      const state = reduce(base.state, command);
+      const raw = encode(state);
+      storage.setItem(STORAGE_KEY, raw);
+      return { state, raw };
```

<details>
<summary>Answer: three defects</summary>

**1. The line sort is removed.** `quoteCart` sorted by product id at `model.ts:359` and `validateQuote` independently re-checks the sort at `model.ts:189`, so the immediate symptom is that any multi-line cart added out of alphabetical order now fails validation. The deeper reason the sort exists is the fingerprint: `fingerprint` at `model.ts:222` serialises the lines in order, so without a canonical order the same purchase produces different fingerprints depending on click order, and a legitimate retry would be read as "same key, different details". The test at `test/model.cjs:153` asserts sorted lines directly.

**2. The fingerprint check in `replay` is removed.** Now any request that reuses an existing key returns that stored order regardless of what the caller asked for. A client bug that reuses a key for a genuinely different cart silently returns the wrong receipt and reports success, which is worse than a double charge because nothing is logged as wrong. The real guard is `model.ts:390`, and `test/model.cjs:243` covers it by keeping the key and changing the buyer.

**3. `reduce` is fed `base.state` instead of `current.state`.** This is the quiet one. With the compare-and-set immediately above it, `base.raw === current.raw` at that point, so the two states are equal and every test still passes. But the replay branch on line 30 returns before the compare, and any future edit that relaxes or reorders the guards makes the reducer operate on a stale state while writing a whole-document replacement, which is the data-loss bug the compare exists to prevent. Reading from `current` inside the lock is the invariant; depending on the guard above to make a stale read harmless is not.
</details>

## Drill 6: explain the validator (4 minutes)

From `src/model.ts:74`:

```ts
function object(value: unknown, keys: string[]): Record<string, any> {
  requireThat(
    value !== null && typeof value === "object" && !Array.isArray(value),
    "Expected an object.",
  );
  requireThat(
    Object.keys(value).sort().join("|") === [...keys].sort().join("|"),
    "Unexpected or missing fields.",
  );
  return value as Record<string, any>;
}
```

Why compare the whole key set, and what does that cost when the schema changes?

<details>
<summary>Answer</summary>

It makes the shape exact in both directions: a missing field and an extra field are the same error. That matters here because import is a trust boundary. A backup file is arbitrary user-supplied JSON, and a permissive validator that ignores unknown keys lets a hand-edited file carry a field the app will later start reading, or preserve a field from a future schema through a round trip in an old version and write it back in a state the old code never validated. `validateState` at `model.ts:245` applies the same rule at the top level and checks `schema === 1` at line 253, so a version mismatch is refused rather than half-understood. The test "strict import rejects extra fields and schema mismatch" at `test/model.cjs:289` is the executable form.

The cost is that every schema change is a breaking change to stored data. Adding `supportUrl` to `Product` means updating the key list at `model.ts:128`, and every previously exported backup then fails to import with "Unexpected or missing fields." There is no migration step in this codebase, which is exactly why the junior milestone in `astraupskill/README.md` asks for the new field to be proven across export and import. The alternative design is to bump `schema` and write an upgrade function that runs before validation; that is the standard answer and it is the thing this project has deliberately not needed yet.

Note the sort on both sides: `Object.keys` order is insertion order for string keys, so comparing without sorting would reject a semantically identical object whose fields were written in a different order.
</details>
