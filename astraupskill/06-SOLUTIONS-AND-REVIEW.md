# Solution sketches and review criteria

These sketches describe extension designs, not hidden implementations. Current source and [verification notes](VERIFICATION.md) define what ships. Evaluate your reasoning after attempting [the practice ladder](05-PRACTICE.md).

## Reviewing a backup is not replacing one

The migration sketch has to fit the restore path that already exists. `restore` compares the caller's base against current bytes, then advances the revision past whatever the import claims, so a reviewed backup can never silently rewind the workspace. From `src/repository.ts:41-65`:

```ts
  async function restore(
    baseRaw: string | null,
    raw: string,
  ): Promise<Snapshot> {
    const imported = decode(raw);
    return lock(() => {
      const currentRaw = storage.getItem(STORAGE_KEY);
      if (currentRaw !== baseRaw)
        throw new Error(
          "Workspace changed while reviewing the import. Reload first.",
        );
      let revision = 0;
      try {
        revision = currentRaw === null ? 0 : decode(currentRaw).revision;
      } catch {
        /* Explicit recovery may replace invalid bytes after confirmation. */
      }
      const state = {
        ...structuredClone(imported),
        revision: Math.max(revision, imported.revision) + 1,
      };
      const encoded = encode(state);
      storage.setItem(STORAGE_KEY, encoded);
      return { state, raw: encoded };
    });
  }
```

## Support URL and migration

Handle the empty case, parse a URL, and check its protocol against an explicit allowlist. Do not rely on string prefixes alone. React escaping text does not make every link destination appropriate. Render an accepted external link with understandable text and suitable relationship attributes when opening a new tab. Keep the validator independent of the component so import and form input use the same rule.

For persistence, introduce a migration function that accepts exactly the old structure, supplies an empty support URL, and validates the new structure. Migration is separate from replacing stored data: reviewing an old backup should not overwrite the current workspace. Test one genuine old fixture and one malformed near-match so migration does not become a parser that ignores corruption.

## Search and pagination

Compute the filtered, stably sorted collection before slicing a page. Clamp the page against the filtered count, treating an empty result as page one. After deletion, derive the page again. Keep editor state independent of result membership so filtering cannot destroy work.

Ask whether the test would catch an off-by-one error at twenty-one records. Ask whether equal titles have a deterministic secondary order. A screenshot of page one proves neither. Use explicit identifiers and expected page membership. Check that changing filters while editing does not accidentally reconstruct the editor with current server values and erase the draft.

## Expiry without rewriting history

Represent the policy in one function receiving an injected instant. For an exclusive UTC boundary, compare that instant with the boundary. The quote snapshots the code and percent accepted then. Historical validation checks internal consistency, not whether the code is active today.

Keep replay lookup before re-quoting a new request. Otherwise an accepted request retried after expiry could fail despite its existing receipt. The distinguishing cases are: new attempt after expiry fails, matching accepted retry succeeds, and changed payload under the old key fails. These separate time policy from idempotency.

## Three-way merge

Compare original-to-current and original-to-draft for each editable field. If only the draft changed, its value is a candidate. If only current changed, preserve current. If both changed identically, there is no semantic disagreement. If both changed differently, require a decision.

This analysis does not authorize persistence. Submit the reviewed result against a fresh captured baseline and repeat concurrency checks at commit. Another writer can act while the merge dialog is open. A helpful merge interface does not guarantee that the world stopped changing. Preserve the user's decisions if another conflict occurs instead of returning them to an empty form.

## Server design and review

Keep accepted prices in order-line rows and preserve receipt facts. Use foreign keys and deliberate deletion policies. Enforce actor permissions on the server; a client-supplied role or hidden button is insufficient. A unique idempotency constraint and transaction must arbitrate simultaneous requests, not a preliminary lookup alone.

Review with four questions: what invariant does each constraint protect, where does acceptance become durable, what can the client safely retry, and what survives failure? Ask the author to show a rejected stale update without losing input. A mid-level explanation includes operational recovery and limitations. Give more credit to one well-tested transaction boundary than several polished screens whose writes remain ambiguous.
