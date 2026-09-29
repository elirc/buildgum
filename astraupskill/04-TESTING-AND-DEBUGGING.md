# Test boundaries, then inspect the interface

Run commands from the Buildgum root. A development server does not establish that production compilation or persistence failures are handled correctly.

```powershell
npm.cmd test
npm.cmd run build
```

The test command compiles pure TypeScript modules into `.verification`, then runs Node's built-in test runner. It writes a TAP log and JSON result. The test compiler declares its source root explicitly because the installed TypeScript 6 toolchain requires an unambiguous emitted layout. Generated output is ignored by Git and is not application data.

## What the fast tests prove

Read [test/model.cjs](../test/model.cjs). Tests cover decimal input rejection, cent rounding, immutable product changes, versions, discount uniqueness, cart bounds, receipt snapshots, history-protected deletion, cancellation, and matching versus conflicting retries. Import cases include malformed structure, duplicate keys, changed fingerprints, missing references, and excessive size.

Repository tests use an in-memory storage adapter and a serializing promise queue. A quota failure and two simultaneous stale-baseline saves become deterministic. The test that writes successfully and then throws demonstrates why an exception does not always prove nothing was accepted. A second call with the same request key must return one existing receipt.

These adapters isolate the business contract. They do not prove every browser's storage implementation. Browser checks cover React, actual localStorage, Web Locks, downloads, and a second tab on the same origin.

## Run browser checks

The optional verifier uses Python and Playwright. Install its dependency in your preferred isolated Python environment, then install Chromium:

```powershell
python -m pip install playwright==1.59.0
python -m playwright install chromium
python scripts/verify_browser.py
```

The script starts an owned loopback preview process on port 5180 and refuses to proceed when the port is occupied. Stop your development server first. Each scenario receives a disposable browser context, so test records do not enter your normal browser profile. The script stops only the process it created. `ASTRA_BROWSER_EXECUTABLE` selects an existing Chromium executable; `BUILDGUM_CHECK_DIR` selects the evidence directory.

## Debug a stale editor

Open two tabs on the same origin. In the first, edit Automation Field Manual without saving. In the second, create a product and wait for the saved message. Return to the first and submit. The editor must retain its title while the alert explains the conflict. Export the draft and inspect its value. The accepted stored product must retain its old title.

Place breakpoints in `commit` before raw comparison and in `save` before `accept`. The second breakpoint is not reached on the rejected write. Do not fix the conflict by blindly adopting current bytes as the draft's baseline: that detaches the draft from what the user originally reviewed.

## Debug recovery and display

In a disposable profile, set the workspace value to malformed JSON and reload. Recovery must preserve exact bytes and offer export. Reviewing a valid file must not write anything until replacement is confirmed. Compare desktop, tablet, and narrow layouts, keyboard focus, visible labels, and empty search results.

The initial screenshot review found squeezed navigation labels despite no page overflow. Historical icon-only widths were still applied to text buttons. The repair makes navigation a three-column grid on smaller screens and verifies label width separately. This is an example of why one layout assertion cannot replace visual inspection. Selected screenshots are evidence of those states, not complete accessibility certification.
