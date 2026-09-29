# Trace Tables

## UI Trace: Search To Product Card

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| Input | [`src/App.tsx`](../../../src/App.tsx#L120-L127) | string | Search input | `onChange` reads event value | No debounce for future API search. |
| State | [`src/App.tsx`](../../../src/App.tsx#L50-L51) | string | `App` | `setQuery` stores it | Empty query matches all. |
| Derived | [`src/App.tsx`](../../../src/App.tsx#L65-L67) | `Product[]` | `App` | Lowercase haystack filter | No empty state. |
| Render | [`src/App.tsx`](../../../src/App.tsx#L211-L220) | `Product` props | `Discover` | Maps products to cards | Key depends on product IDs. |

## Persistence Trace: Cart localStorage

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| Read | [`src/App.tsx`](../../../src/App.tsx#L53-L56) | string/null -> `string[]` | `App` initializer | `JSON.parse` and assertion | Malformed data can throw. |
| Add | [`src/App.tsx`](../../../src/App.tsx#L73-L77) | `Product` -> ID | `App` | Adds unique ID | No quantity support. |
| Derive | [`src/App.tsx`](../../../src/App.tsx#L69-L71) | IDs -> products | `App` | `find` and type guard | Unknown IDs disappear. |
| Write | [`src/App.tsx`](../../../src/App.tsx#L60-L62) | `string[]` -> JSON | Effect | `JSON.stringify` | Quota/storage errors unhandled. |

## Auth/Permission Trace: Admin View Is Not Protected

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| Allowed view | [`src/types.ts`](../../../src/types.ts#L1-L1) | `'admin'` union member | TypeScript | Enables admin as local view | Compile-time only. |
| Nav | [`src/App.tsx`](../../../src/App.tsx#L35-L42) | nav item | `App` | Shows admin button | No role check. |
| Render | [`src/App.tsx`](../../../src/App.tsx#L161-L165) | JSX branch | `App` | Renders `<Admin />` | Any user of UI can see it. |
| Data | [`src/App.tsx`](../../../src/App.tsx#L747-L778) | tuple controls | `Admin` | Renders controls | Mock only; no enforcement. |

## Error Trace: Unknown Product In Order

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| Order | [`src/data.ts`](../../../src/data.ts#L152-L213) | `Order.productId` | Seed data | References product ID | No foreign key. |
| Lookup | [`src/App.tsx`](../../../src/App.tsx#L652-L653) | `Product | undefined` | `Orders` | Finds product by ID | O(n) per order. |
| Fallback | [`src/App.tsx`](../../../src/App.tsx#L661-L661) | string | `Orders` | Shows `Unknown product` | Hides data issue unless logged. |
| Future test | none | n/a | n/a | No test harness | Regression could slip. |

## Checkout Value Trace

| Step | File/line | Value shape | Owner | Transformation | Risk |
| --- | --- | --- | --- | --- | --- |
| Cart | [`src/App.tsx`](../../../src/App.tsx#L337-L343) | `Product[]` prop | `Checkout` | Receives products | Client-side authority. |
| Discount | [`src/App.tsx`](../../../src/App.tsx#L344-L346) | percent number | `Checkout` | Matches code and computes | No expiry/bounds. |
| Tax | [`src/App.tsx`](../../../src/App.tsx#L347-L347) | number | `Checkout` | Fixed 8.25% | Not jurisdictional. |
| Total | [`src/App.tsx`](../../../src/App.tsx#L438-L445) | displayed money | UI | Formats and pays | Mock side effect only. |
