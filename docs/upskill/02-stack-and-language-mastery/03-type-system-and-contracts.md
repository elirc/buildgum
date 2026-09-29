# TypeScript Contracts

## Concept: Unions Encode Allowed States

`ViewKey`, `ProductStatus`, and `RiskLevel` are string unions in [`src/types.ts`](../../../src/types.ts#L1-L5). They make illegal values harder to introduce in TypeScript.

Why it matters: a small union can prevent scattered typo bugs and force update points when adding new states.

Failure modes:

- Runtime data from APIs can still violate the union.
- CSS class generation from unions requires matching styles in [`src/style.css`](../../../src/style.css#L797-L813).

Drill: add a hypothetical `Archived` product status on paper. List type, seed, table, CSS, test, and migration needs.

## Concept: Optional Fields Are Product Decisions

`compareAt?: number` and `subscription?: string` are optional in [`src/types.ts`](../../../src/types.ts#L15-L28). Rendering checks them in [`src/App.tsx`](../../../src/App.tsx#L276-L277) and [`src/App.tsx`](../../../src/App.tsx#L610-L610).

Why it matters: optional fields create branches. They need display defaults and API compatibility rules.

Failure modes:

- Treating optional values as present.
- Adding optional fields that should actually be required by a feature.

Drill: explain whether `subscription` should be a string or a structured price interval.

## Concept: Type Assertions Are Promises, Not Checks

The cart initializer asserts parsed data is `string[]` in [`src/App.tsx`](../../../src/App.tsx#L55-L55). TypeScript trusts this assertion.

Why it matters: data crossing storage, network, or user-input boundaries needs runtime validation.

Failure modes:

- Malformed localStorage crashes.
- Object shape looks typed but lacks required strings.

Drill: write pseudocode for a `parseCartIds(value: string | null): string[]` function. Label it illustrative fake code if you write actual code.

## Concept: Props As Component Contracts

`Discover` accepts product arrays, callbacks, and selected product in [`src/App.tsx`](../../../src/App.tsx#L172-L186). `Checkout` accepts cart products, callbacks, and promo state in [`src/App.tsx`](../../../src/App.tsx#L329-L343).

Why it matters: props define component boundaries. Good props expose intent, not internal implementation.

Failure modes:

- Passing raw setter functions too deeply can couple children to parent state shape.
- Too-large prop lists hint at a missing abstraction.

Drill: sketch a `CartSummary` prop type. Which values are raw products, and which are already calculated?

## Verification Notes

- Inspected `src/types.ts` and usage sites in `src/App.tsx`.
- No generated schemas, Zod/Yup validators, API DTOs, or database models exist.
