# Practice ladder: stronger CRUD reasoning

Use a separate branch or copy of your learning workspace. Export browser data before schema experiments. These are proposed learning tasks, not silently claimed completed features. Consult [solutions and review](06-SOLUTIONS-AND-REVIEW.md) after writing your own acceptance criteria.

Two commands gate every exercise here: `npm test` (the Node test runner via `scripts/test.mjs`) and `npm run check` (`tsc --noEmit`). An exercise counts as done when both pass with your new tests included — write the failing test first so you know it can fail.

## Exercise 1: a useful product field

Add an optional support URL. Begin with the type, strict validator, sample data, form, storefront, and import behavior. Decide whether old backups need migration or a new schema version. An optional TypeScript property alone will not make an exact-key validator accept older JSON.

Acceptance examples: blank is permitted; an HTTPS URL is rendered as a useful link; a `javascript:` URL is rejected; a value beyond the documented bound fails without clearing the draft. Explain whether HTTP is permitted for local development. Add a round-trip test and a rejected-input test that would fail if validation were removed. Avoid a test that merely repeats an implementation assignment.

## Exercise 2: search and pagination

Add a creator filter and paginate Products at twenty records. Search is currently a literal case-insensitive substring operation over title, creator, and category. Preserve that behavior. Brackets and asterisks must not become regular-expression instructions.

Acceptance examples: changing the filter on page three shows a valid page; deleting the final record on the last page does not strand the user; a dirty editor survives when its title stops matching the filter. Document the sort order and use an identifier to break ties. Check twenty-one records explicitly rather than relying on a small screenshot fixture.

## Exercise 3: discount expiry

Add an expiry date. Define the timezone and whether expiry occurs at the start or end of that date. Inject a clock into quoting instead of reading wall-clock time from several helpers. Freeze accepted discount details in the receipt so historical records do not become invalid as today advances.

Acceptance examples: a code works immediately before the boundary and fails at the boundary; an accepted receipt remains readable afterward; a matching retry for that receipt succeeds after expiry. Explain why validating historical receipts against today's availability would be incorrect.

## Exercise 4: review a merge

The repository currently rejects all stale baselines. Propose a three-way product merge using the original product, current accepted product, and user's draft. Automatically merging disjoint edits is optional; displaying a clear field-level comparison is already useful.

Acceptance examples: separate-field edits differ from two competing title edits; an imported backup invalidates an open editor even when its product version matches; cancelling the merge retains the draft. Do not remove the repository comparison simply to make a stale save pass. Another writer can still act while the review interface is open.

## Exercise 5: authenticated server boundary

Design a small SQL-backed HTTP API. Products, discounts, orders, and accepted order lines become tables with constraints. Add an authenticated actor and an explicit policy for catalog management versus checkout. Use a transaction for receipt creation and an idempotency constraint scoped to the relevant actor or workspace and request key.

Demonstrate concurrent requests, a repeated key with changed payload, an unauthorized edit, and transaction failure. Keep payment integration out until database acceptance is reliable. Deliver a working vertical slice, executable evidence, migration strategy, and documented failure responses. One coherent slice develops stronger mid-level skills than a list of unimplemented enterprise features.
