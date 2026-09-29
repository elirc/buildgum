# Runtime And Tooling Map

## Tooling

| Tool | Evidence | What it does |
| --- | --- | --- |
| npm | `package-lock.json` exists; scripts in [`package.json`](../../../package.json#L7-L12). | Installs and runs project commands. |
| Vite | Dependency in [`package.json`](../../../package.json#L16-L22). | Dev server and production bundler. |
| TypeScript | Dependency and script in [`package.json`](../../../package.json#L9-L10). | Static type checking and build gate. |
| React | Dependencies in [`package.json`](../../../package.json#L19-L22). | UI runtime. |
| lucide-react | Dependency in [`package.json`](../../../package.json#L19-L19). | Icon components imported in [`src/App.tsx`](../../../src/App.tsx#L1-L30). |

## Commands

| Command | Status | Evidence |
| --- | --- | --- |
| `npm install` | Verified earlier | `package-lock.json` generated. |
| `npm run dev` | Inferred from script; direct `npx vite --host 127.0.0.1` verified | [`package.json`](../../../package.json#L8-L8). |
| `npm run check` | Verified passing | [`package.json`](../../../package.json#L9-L9). |
| `npm run build` | Verified passing | [`package.json`](../../../package.json#L10-L10). |
| `npm run preview` | Inferred | [`package.json`](../../../package.json#L11-L11). |

## TypeScript Compiler Shape

The project targets browser-compatible modern JS through `target: es2023`, DOM libs, and bundler module resolution in [`tsconfig.json`](../../../tsconfig.json#L2-L15). It uses `jsx: react-jsx` in [`tsconfig.json`](../../../tsconfig.json#L12-L12) and turns on useful correctness checks such as `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` in [`tsconfig.json`](../../../tsconfig.json#L17-L21).

## Runtime Boundaries

- Browser only: the code touches `window.localStorage` directly in [`src/App.tsx`](../../../src/App.tsx#L54-L61), so it assumes a browser runtime.
- No server runtime: no Node API routes, Express, Next.js, Remix, workers, or serverless handlers were found.
- No environment variables: no `.env` or env access found.
- Static assets: `/storefront-preview.png` is referenced in [`src/App.tsx`](../../../src/App.tsx#L201-L202), served from `public/storefront-preview.png`.

## Drill

Explain why `localStorage` access in [`src/App.tsx`](../../../src/App.tsx#L53-L61) works in this Vite app but would need a guard in SSR.

Self-grade:

- Basic: says `window` exists in browser.
- Solid: mentions SSR/server render has no `window`.
- Strong: proposes lazy initialization guards, hydration strategy, and tests.
