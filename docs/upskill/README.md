# Buildgum Upskill Curriculum

This curriculum turns Buildgum into a training lab for a junior engineer moving toward mid-level ownership and senior judgment. It is codebase-specific: every claim is anchored to real files such as [`src/App.tsx`](../../src/App.tsx), [`src/data.ts`](../../src/data.ts), [`src/types.ts`](../../src/types.ts), and [`src/style.css`](../../src/style.css). It is also transferable: each module teaches the concept, why it matters in production, where this repo shows it, how it fails, and what to practice.

Buildgum is a small single-page creator commerce prototype. It uses Vite, React, TypeScript, and lucide-react according to [`package.json`](../../package.json#L1-L22). The browser entry point mounts `<App />` inside React StrictMode in [`src/main.tsx`](../../src/main.tsx#L1-L10). The app has one large UI module with local state, derived data, and view switching in [`src/App.tsx`](../../src/App.tsx#L49-L168). Domain contracts live in [`src/types.ts`](../../src/types.ts#L1-L74), and seeded product/order/analytics data lives in [`src/data.ts`](../../src/data.ts#L1-L228). There is no server, database, auth layer, CI config, or test harness yet; those are documented as future production boundaries, not as existing behavior.

## Who This Is For

- Brand-new juniors who can read TypeScript but need a map.
- Juniors with React familiarity who need contribution habits.
- Mid-level engineers learning ownership across state, UI, data contracts, checks, and risks.
- Senior engineers doing architecture review of a frontend prototype before backend integration.

## How To Use It

| Time budget | Path |
| --- | --- |
| One weekend | Read [`00-fast-track.md`](00-fast-track.md), trace storefront and checkout, run the verified checks, complete one small ticket. |
| Two weeks | Add `01-codebase-cartography`, `02-stack-and-language-mastery`, and the code-reading drills. |
| Eight weeks | Work through architecture, quality, contribution tickets, review katas, and interview prep. |
| Ongoing practice | Rotate between a feature ticket, a debugging scenario, a review kata, and one senior design kata each week. |

## Major Learning Tracks

- Codebase cartography: repo shape, files, domain language, and key flows.
- Stack mastery: JavaScript runtime, React mental model, TypeScript contracts, and Vite build tooling.
- Architecture: boundaries, validation, persistence gaps, side effects, patterns, and critique.
- Code reading: annotations, trace tables, fake-code contrasts, and review practice.
- Quality engineering: testing strategy, debugging, performance, security, observability.
- Contribution practice: good first tickets, mid-level features, senior projects, refactor katas.
- Career and collaboration: PRs, RFCs, maintainer communication, and interview prep from this repo.

## Recommended Path

Brand-new junior:
1. Start with [`00-fast-track.md`](00-fast-track.md).
2. Read [`01-codebase-cartography/02-file-reading-order.md`](01-codebase-cartography/02-file-reading-order.md).
3. Complete three drills in [`04-code-reading-gym/01-annotation-drills.md`](04-code-reading-gym/01-annotation-drills.md).

Junior with basic stack familiarity:
1. Read the key flows in [`01-codebase-cartography/05-key-flows.md`](01-codebase-cartography/05-key-flows.md).
2. Work through React and TypeScript modules.
3. Pick two tickets from [`06-contribution-practice/01-good-first-tickets.md`](06-contribution-practice/01-good-first-tickets.md).

Mid-level engineer new to this repo:
1. Read architecture and quality modules.
2. Build a design note for one ticket in [`06-contribution-practice/02-mid-level-feature-tickets.md`](06-contribution-practice/02-mid-level-feature-tickets.md).
3. Review two fake PRs in [`04-code-reading-gym/04-review-katas.md`](04-code-reading-gym/04-review-katas.md).

Senior engineer doing architecture review:
1. Read [`03-architecture-and-patterns/06-architecture-critique.md`](03-architecture-and-patterns/06-architecture-critique.md).
2. Review [`08-reference/risk-register.md`](08-reference/risk-register.md).
3. Choose a project from [`06-contribution-practice/03-senior-build-projects.md`](06-contribution-practice/03-senior-build-projects.md).

## Conventions

- File anchors point to exact files and lines where practical.
- Fake code is always labeled as illustrative and not from this repo.
- Drills ask you to annotate inputs, outputs, dependencies, invariants, side effects, and failure modes.
- Self-grading distinguishes weak, solid, and strong answers.
- Verification notes list commands run, files inspected, and uncertainty.

## Senior Mindset

A junior asks, "How do I make it work?" A mid-level engineer asks, "Is this the right pattern and how do I prove it stays correct?" A senior asks, "What does this commit us to, who pays the cost, what is the blast radius, and how do we reduce risk before the system grows?"

## Verification Notes

- Inspected `rg --files`, root files, `package.json`, `README.md`, `tsconfig.json`, `src/App.tsx`, `src/data.ts`, `src/types.ts`, `src/style.css`, `src/main.tsx`, and `index.html`.
- Ran `npm run check` successfully.
- Earlier implementation pass ran `npm run build` successfully and verified `http://127.0.0.1:5173/` returned `200`.
- No test, lint, CI, server, database, env, Docker, auth, API, worker, or observability files were found in the project root. Treat those as gaps or future design topics.
