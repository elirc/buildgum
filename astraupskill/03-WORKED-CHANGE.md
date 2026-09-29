# Worked change: replacing pretend checkout with an accepted receipt

The original checkout changed a boolean and displayed a fixed order identifier. That demonstrated a screen, but did not establish what had been bought, preserve a receipt across reload, or distinguish a retry from another purchase. Follow the replacement in [the model](../src/model.ts), [repository](../src/repository.ts), and [interface](../src/App.tsx).

## Step 1: build a quote from the catalog

The cart stores product identifiers and quantities. It does not own prices. `quoteCart` resolves each item against the accepted catalog, rejects unavailable products and duplicate lines, and validates quantities from one through ninety-nine. It sorts lines by identifier so equivalent cart ordering does not change the fingerprint.

For two Automation Field Manuals at 3,900 cents each:

```text
subtotalCents = 3900 * 2 = 7800
BUILD20      = 20 percent
 discount    = floor((7800 * 20 + 50) / 100) = 1560
 total       = 7800 - 1560 = 6240
```

The quote contains computed amounts and accepted product and discount versions. The reducer can therefore detect a changed quote later. The UI displays `$62.40`, not a whole-dollar approximation.

## Step 2: freeze the attempt

When checkout is first requested, the UI creates an order ID, request key, normalized buyer address, timestamp, and quote. It places this command in `attempt` before awaiting persistence. Inputs become disabled while the attempt remains unresolved. Retry sends the same command instead of rebuilding it from possibly changed fields.

The timestamp belongs to the original attempt. A retry does not invent a newer purchase time. The buyer field is normalized at the UI boundary, while domain validation still rejects malformed or mixed-case stored buyer addresses. The email check validates useful structure, not mailbox ownership.

## Step 3: look for an existing receipt

Within the repository lock, `replay` searches current receipts for the request key. If the fingerprint matches, the existing workspace is returned immediately. This can succeed even when the caller's baseline is old: the operation identifies an already accepted receipt rather than applying another change.

If there is no matching receipt, ordinary baseline comparison applies. The reducer re-quotes against accepted products and discounts and compares fingerprints. A changed price, title version, or discount version prevents acceptance under different terms. The user must review current data and deliberately start a new attempt.

## Step 4: persist the candidate

The reducer appends the receipt to a cloned aggregate and advances the revision. `encode` validates totals, identifiers, collection bounds, and product references. The repository writes one JSON document. React accepts that snapshot only after `setItem` returns successfully.

An exception after the actual write represents a lost acknowledgement. The UI displays an error and retains the attempt. Retrying finds the receipt already in storage, so the count remains one. The browser verifier exercises this boundary directly; it does not merely assert that a button became disabled.

### The three outcomes of one checkout

| outcome | what storage holds | what the user sees | what `replay()` does on retry with the same `requestKey` |
|---|---|---|---|
| write rejected (validation, budget, stale baseline) | nothing new | the error; the draft is kept | nothing to replay: the retry is a first attempt again |
| write succeeded, response delivered | one order + one receipt | the receipt | returns the stored receipt, creates nothing |
| write succeeded, acknowledgement lost (tab closed, storage event missed) | one order + one receipt | nothing, or a spinner that died | finds the receipt by key and returns it: the user sees the order they already have, not a second one |

The third row is the one that matters: the client cannot tell "rejected" from "acknowledgement lost" by itself, so the retry must be safe under both. The `requestKey` is what makes it safe. A retry with a *new* key after a lost acknowledgement creates a second order, which is why the key is generated when the attempt is frozen (Step 2), not when the button is pressed.

## Step 5: explain the remaining gap

This flow records a local simulated receipt. It does not authorize money, reserve inventory, issue licenses, calculate taxes, or send email. Payment integration needs server authorization, provider idempotency, durable attempts, reconciliation, and transitions for uncertain provider outcomes. Keep that extension separate from claiming a browser receipt is payment confirmation. Identify the exact line where local acceptance occurs and the additional boundary a real external effect would introduce.
