# Trace lab: prove what was accepted

Use the application and [repository source](../src/repository.ts). Keep columns for action, loaded revision, product version, request key, stored revision, and visible result. Reconcile interface messages with persisted facts rather than assuming a click means acceptance.

## The commit Lab D depends on

Lab D is about an acknowledgement you did not see. Read `commit` first: the replay check runs before the base comparison, so a retried command with the same request key returns the stored receipt instead of a conflict. From `src/repository.ts:26-39`:

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

## Lab A: create and edit

Begin on an unused origin or explicitly restore a clean sample backup. Record the displayed revision. Create Tiny API Guide at `12.35`. Inspect an exported workspace. The new identifier should be stable and its version should be one. The revision advances once.

Edit only the description. Verify that the ID stays unchanged, its version advances, and the revision advances again. Explain why several React renders do not imply several accepted writes. StrictMode can expose lifecycle mistakes during development, which is one reason initialization does not eagerly overwrite storage.

## Lab B: two clients

Open another tab before your next edit. In tab A, open a product editor and type a new title without saving. In B, create a discount. Return to A and submit. Predict the outcome before clicking.

Expect a conflict alert, retained title, and no extra accepted revision from A. Export the draft. Reload only after deciding to discard or manually re-enter it. Identify the raw baseline comparison inside the lock. Saying React state was stale describes a symptom but does not explain how data loss was prevented.

## Lab C: receipt versus catalog

Buy two original Automation Field Manuals with `BUILD20`. Record the 7,800-cent subtotal, 1,560-cent discount, and 6,240-cent total. Export the receipt. Change the catalog title and price, then inspect the receipt again.

Its accepted title and price remain unchanged. Attempt deletion and observe the history safeguard. Archive through the editor instead. The product disappears from new storefront selection while its receipt remains valid. Delete the code and explain why the old receipt still has its percentage. Compare these reference policies without assuming one deletion rule fits everything.

## Lab D: uncertain acknowledgement

Read the browser verifier's lost-acknowledgement scenario. It wraps `Storage.prototype.setItem`, calls the real write, then throws once. The caller observes failure after persistence succeeded. Use the automated scenario rather than injecting faults into your normal browser profile.

The first attempt shows an error and retains its frozen command. Retry succeeds with one receipt and the same key. Record why a fresh key would represent a different operation. Also record the limit: attempts live in tab memory, so closing the tab is not equivalent to a durable client outbox. Exporting a draft preserves reference material, but the application does not automatically resume that export.

## Lab E: backup replacement

Export a complete workspace, then change the catalog. Review the older file in Workspace. Nothing changes merely because it parses successfully. Confirm replacement only after exporting anything worth retaining. The restored document receives a newer revision even when its product versions are older.

Explain why a pre-import editor cannot use those restored versions to overwrite the replacement. Consider a second tab writing after you reviewed the file: replacement must reject its now-stale baseline. Finish with a review note naming one verified invariant, one reproduced failure, one untested limitation, and the next server feature you would build. This connects portfolio evidence to specific code and tests rather than a screenshot alone.
