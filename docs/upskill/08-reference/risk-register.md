# Risk Register

| Risk | Evidence | File anchors | Impact | Likelihood | Suggested test | Suggested fix | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Corrupt cart storage crashes app | `JSON.parse` without catch | [`src/App.tsx`](../../../src/App.tsx#L53-L56) | Medium | Medium | Malformed localStorage test | Safe parser | High |
| Checkout math trusted if made real | Client subtotal/discount/tax | [`src/App.tsx`](../../../src/App.tsx#L344-L348) | High | High if payments added | Domain unit tests and API tests | Server-side price authority | High |
| No tests | No test script | [`package.json`](../../../package.json#L7-L12) | High | High | CI fails without tests | Add Vitest/RTL | High |
| Admin unprotected if made real | Local view renders admin | [`src/App.tsx`](../../../src/App.tsx#L161-L165) | High | High if backend added | Permission tests | Auth/role guards | High |
| Status/risk style drift | Data-derived class names | [`src/App.tsx`](../../../src/App.tsx#L608-L614), [`src/style.css`](../../../src/style.css#L797-L813) | Medium | Medium | Exhaustive mapping test | Explicit maps/fallbacks | High |
| Order/product lookup scaling | `find` inside `orders.map` | [`src/App.tsx`](../../../src/App.tsx#L651-L653) | Low now, medium later | Low now | Large fixture render test | Map by ID or backend join | Medium |
| Money precision | JS numbers for prices | [`src/types.ts`](../../../src/types.ts#L14-L15), [`src/App.tsx`](../../../src/App.tsx#L344-L348) | High if real checkout | Medium | Cents/rounding tests | Integer cents + currency | High |
| Mock operational claims mistaken as real | TLS/fraud/license text | [`src/App.tsx`](../../../src/App.tsx#L358-L360), [`src/App.tsx`](../../../src/App.tsx#L446-L448) | Medium | Medium | Product review | Label mock/demo until backed | High |
| Large `App.tsx` blast radius | 782-line app module | [`src/App.tsx`](../../../src/App.tsx#L1-L782) | Medium | Medium | Review diff size | Extract tested modules | Medium |
| Possible separator encoding issue | Line output showed `Â·` | [`src/App.tsx`](../../../src/App.tsx#L605-L605) | Low | Unknown | Browser/editor verify | Replace separator if confirmed | Low |
