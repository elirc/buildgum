# Read the code in dependency order

Start with [the model](../src/model.ts), not the largest React component. The dependency direction is simple: the interface calls a repository, and the repository calls pure domain functions. Domain functions do not import React or localStorage. Most failure cases can therefore be exercised without launching a browser.

## Files and responsibilities

| File | Responsibility | Inspect first |
| --- | --- | --- |
| `src/main.tsx` | Mounts React and imports styles | Root element and StrictMode |
| `src/initial.ts` | Fictional products and one discount | Empty orders and revision zero |
| `src/model.ts` | Types, validation, quoting, transitions | `quoteCart`, `reduce`, `validateState` |
| `src/repository.ts` | Storage and cooperative concurrency | `load`, `commit`, `restore` |
| `src/App.tsx` | Forms, drafts, receipts, recovery | `submitEditor`, `save`, `checkout` |
| `src/style.css` | Visual language and CRUD layouts | Final responsive overrides |
| `test/model.cjs` | Domain and repository assertions | Lost acknowledgement and stale baseline |
| `scripts/verify_browser.py` | Isolated Chromium checks | Context setup and owned server cleanup |

Original `src/data.ts` and `src/types.ts` remain reference modules. The running application uses `initial.ts` and `model.ts`. Old sales metrics, licenses, payout events, and revenue charts are not loaded into the operational workspace. Removing those fictional operational claims prevents a learner from mistaking static sample values for measured behavior.

## Follow one write

Open [App.tsx](../src/App.tsx) and search for `editProduct`. Opening an editor captures a product copy, the expected record version, and the complete accepted snapshot. This capture is the baseline for a later save. Typing changes the editor draft. It does not mutate the accepted product collection or browser storage.

`submitEditor` trims descriptive fields and parses the decimal price string. It constructs a `product.save` command. `save` marks the interface busy and calls `repo.commit`. The repository acquires its lock, loads current bytes, compares them with the editor's captured bytes, and calls `reduce`. The reducer builds a candidate state and validates it. Only a successful storage write produces the snapshot that React accepts.

This distinction explains why a storage exception must not clear the editor. The requested change and the accepted change are different objects. Follow the success callback to see where the editor closes. Follow the catch branch to see where its values remain available for export.

## Follow one read

`readWorkspace` calls `repo.load`. Missing storage produces a cloned sample state in memory; it does not eagerly write sample data. Existing storage goes through `decode`, which checks the byte limit, parses JSON, and validates fields and references. Corrupt data routes the UI to Workspace recovery. Raw bytes remain available for export instead of being silently replaced.

A `storage` event from another tab sets a warning. It does not automatically replace the currently edited form. Reload is deliberate, with a discard prompt when work is present. This conservative design avoids surprising changes, at the cost of requiring reload after unrelated writes.

## Build your own map

Draw five boxes: form draft, command, repository, candidate state, accepted snapshot. Put the browser lock around the repository's read-through-write sequence. Mark validation failures before persistence and storage failures at persistence. Add an arrow for an idempotent checkout retry, which may return an existing receipt before baseline comparison. Explain why that exception works for matching retries but cannot be the general rule for edits.
