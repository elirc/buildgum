# Performance Thinking

Measure before optimizing. Buildgum is small enough that most operations are fine today; the value is learning where hotspots would appear.

## Performance Domains

| Domain | Current anchor | Risk if grown | How to measure |
| --- | --- | --- | --- |
| Render | Large `App` tree in [`src/App.tsx`](../../../src/App.tsx#L83-L168). | Unrelated state changes re-render many views. | React Profiler. |
| Search | Client filter in [`src/App.tsx`](../../../src/App.tsx#L65-L67). | Large product list or remote search. | Flamegraph, input latency. |
| Join | `orders.map` plus `products.find` in [`src/App.tsx`](../../../src/App.tsx#L651-L653). | O(orders * products). | Profile row rendering. |
| Bundle | React/lucide/Vite deps in [`package.json`](../../../package.json#L19-L22). | Icon imports and growing UI. | `vite build` bundle output. |
| Layout | CSS grids and sticky panels in [`src/style.css`](../../../src/style.css#L280-L365). | Reflow/overflow on mobile. | Performance panel, screenshots. |
| Storage | Synchronous localStorage in [`src/App.tsx`](../../../src/App.tsx#L53-L62). | Large cart writes block main thread. | User timing / devtools. |

## Likely Hotspots

- Order/product lookup should become a `Map` if data grows.
- Product search should move to indexed/backend search if product count grows.
- Checkout calculations should move to pure helpers/server authority before real payments.
- Static image `public/storefront-preview.png` is large enough to consider responsive variants.

## Drill

Create a benchmark thought experiment: 10,000 products and 5,000 orders. Which current lines become suspicious first, and why?

Strong answer includes `filter`, `find` inside map, table rendering/virtualization, and remote pagination.
