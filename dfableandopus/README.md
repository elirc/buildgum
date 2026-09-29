# Interview preparation from Buildgum

Buildgum is a local creator-commerce workshop: a React 19 and TypeScript front end over a pure domain module and a small storage repository, with products, discount codes, a cart and durable simulated receipts. The `astraupskill/` course teaches how a change travels from a form through validation, concurrency checks and persistence. This folder is the hiring-facing version of the same project.

## The pitch

"The original checkout flipped a boolean and printed a fixed order number. I replaced it with a real accepted-receipt flow. Prices become integer cents once, at the boundary (`src/model.ts:330`). The cart holds only ids and quantities; prices are resolved from the catalog by `quoteCart` (`src/model.ts:340`), which sorts lines so two equivalent carts hash the same. Checkout freezes an attempt with a client-generated `requestKey` and an order id before the write is awaited (`src/App.tsx:280`), so a retry sends the same command rather than rebuilding it. Inside a Web Lock the repository looks for an existing receipt by that key (`src/repository.ts:30`), compares the raw storage bytes against the caller's baseline (`src/repository.ts:31`), then reduces, validates and writes one JSON document. The result is that a write which succeeded but whose acknowledgement was lost cannot become a second order. 44 domain and storage tests plus 15 Chromium scenarios pass."

## Which stack this maps to

TypeScript, React 19 function components, Vite 8, and Node's built-in test runner. There is no server, no authentication and no database, and every answer here says so rather than implying otherwise. The value for a CRUD backend interview is that the invariants are the server ones, moved one boundary inward: `requestKey` is an `Idempotency-Key`, the raw-bytes compare is `If-Match` on an ETag or a conditional `UPDATE ... WHERE id = ? AND version = ?`, and `navigator.locks` is the database transaction. The course states that mapping in `astraupskill/02-CONCEPTS.md` under "What this becomes on a server", and `05-SYSTEM-DESIGN-FOLLOWUPS.md` here carries it through to Node and .NET answers.

## Two weeks

- Days 1-3: [01-INTERVIEW-QUESTIONS.md](01-INTERVIEW-QUESTIONS.md) with `src/model.ts` open beside it.
- Days 4-5: [02-STORIES-AND-RESUME.md](02-STORIES-AND-RESUME.md). The three-outcome table in `astraupskill/03-WORKED-CHANGE.md` is the spine of story one.
- Days 6-8: [03-CODE-READING-DRILL.md](03-CODE-READING-DRILL.md), cold and timed.
- Days 9-11: [04-TAKE-HOME.md](04-TAKE-HOME.md), then grade yourself against its rubric.
- Days 12-13: [05-SYSTEM-DESIGN-FOLLOWUPS.md](05-SYSTEM-DESIGN-FOLLOWUPS.md) at a whiteboard.
- Every day: [06-FLASHCARDS.md](06-FLASHCARDS.md).

Run the suite with `npm test` from the project root; it compiles into `.verification/` first, so `node --test test/model.cjs` alone will not work.
