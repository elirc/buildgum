const test = require("node:test");
const assert = require("node:assert/strict");
const { initial } = require("../.verification/initial.js");
const {
  decode,
  encode,
  reduce,
  quoteCart,
  parsePrice,
  money,
  validateState,
} = require("../.verification/model.js");
const { repository, STORAGE_KEY } = require("../.verification/repository.js");
const fresh = () => structuredClone(initial);
const product = () => ({
  ...initial.products[0],
  id: "new-product",
  title: "Tiny course",
  priceCents: 101,
});
const create = (p = product()) => ({
  type: "product.save",
  product: p,
  expected: null,
});
const checkout = (s = fresh(), extra = {}) => ({
  type: "checkout",
  id: "order-one",
  requestKey: "request-one",
  buyer: "learner@example.com",
  quote: quoteCart(s, [{ productId: "p-automation", quantity: 2 }], "BUILD20"),
  createdAt: "2026-09-09T12:00:00.000Z",
  ...extra,
});
function fixture(raw = null) {
  const data = new Map(raw === null ? [] : [[STORAGE_KEY, raw]]);
  let tail = Promise.resolve();
  const lock = (work) => {
    const result = tail.then(work);
    tail = result.catch(() => {});
    return result;
  };
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  return { data, storage, lock, repo: repository(storage, lock, fresh()) };
}
test("initial catalog round trips without invented receipts", () => {
  assert.deepEqual(decode(encode(fresh())), fresh());
  assert.equal(initial.orders.length, 0);
});
test("price parsing preserves cents and money displays cents", () => {
  assert.equal(parsePrice("39.95"), 3995);
  assert.equal(parsePrice("0.1"), 10);
  assert.equal(money(101), "$1.01");
});
for (const value of ["1.001", "-1", "1e2", "01", "NaN", " 2", "100000.01"])
  test(`invalid price ${value} is rejected`, () =>
    assert.throws(() => parsePrice(value)));
test("product create is immutable and advances revision", () => {
  const s = fresh();
  const n = reduce(s, create());
  assert.equal(n.revision, 1);
  assert.equal(n.products.at(-1).version, 1);
  assert.equal(s.products.length, 6);
});
test("product edit increments version and preserves other records", () => {
  const s = fresh();
  const p = { ...s.products[0], title: "Revised manual" };
  const n = reduce(s, { type: "product.save", product: p, expected: 1 });
  assert.equal(n.products[0].version, 2);
  assert.equal(n.products[1].title, s.products[1].title);
});
test("stale product version cannot overwrite", () =>
  assert.throws(
    () =>
      reduce(fresh(), {
        type: "product.save",
        product: initial.products[0],
        expected: 2,
      }),
    /changed/,
  ));
test("duplicate product ID cannot create", () =>
  assert.throws(() => reduce(fresh(), create(initial.products[0])), /changed/));
test("unused product can be deleted", () => {
  const s = reduce(fresh(), create());
  const n = reduce(s, {
    type: "product.delete",
    id: "new-product",
    expected: 1,
  });
  assert.equal(n.products.length, 6);
});
test("product limits reject invalid title and fractional cents", () => {
  for (const patch of [
    { title: "" },
    { title: "x".repeat(121) },
    { priceCents: 1.1 },
    { description: "bad\ntext" },
    { accent: "url(evil)" },
  ])
    assert.throws(() => reduce(fresh(), create({ ...product(), ...patch })));
});
test("discount CRUD increments versions and normalizes at UI boundary only", () => {
  const d = {
    id: "discount-two",
    version: 1,
    code: "LEARN10",
    percent: 10,
    active: true,
  };
  let s = reduce(fresh(), {
    type: "discount.save",
    discount: d,
    expected: null,
  });
  s = reduce(s, {
    type: "discount.save",
    discount: { ...d, percent: 15 },
    expected: 1,
  });
  assert.equal(s.discounts[1].version, 2);
  s = reduce(s, { type: "discount.delete", id: d.id, expected: 2 });
  assert.equal(s.discounts.length, 1);
});
test("discount uniqueness includes inactive codes", () =>
  assert.throws(
    () =>
      reduce(fresh(), {
        type: "discount.save",
        discount: { ...initial.discounts[0], id: "other", active: false },
        expected: null,
      }),
    /Duplicate/,
  ));
test("invalid discount percent and lowercase are rejected", () => {
  for (const patch of [
    { percent: 0 },
    { percent: 101 },
    { percent: 1.5 },
    { code: "lower" },
  ])
    assert.throws(() =>
      reduce(fresh(), {
        type: "discount.save",
        discount: { ...initial.discounts[0], ...patch },
        expected: 1,
      }),
    );
});
test("quote sorts lines and rounds discount half up in cents", () => {
  const s = reduce(fresh(), create());
  s.discounts[0].percent = 50;
  const q = quoteCart(
    s,
    [
      { productId: "p-automation", quantity: 1 },
      { productId: "new-product", quantity: 1 },
    ],
    " build20 ",
  );
  assert.equal(q.lines[0].productId, "new-product");
  assert.equal(q.subtotalCents, 4001);
  assert.equal(q.discountCents, 2001);
  assert.equal(q.totalCents, 2000);
});
test("empty and duplicate cart lines cannot checkout", () => {
  assert.throws(() => quoteCart(fresh(), [], ""));
  assert.throws(() =>
    quoteCart(
      fresh(),
      [
        { productId: "p-automation", quantity: 1 },
        { productId: "p-automation", quantity: 2 },
      ],
      "",
    ),
  );
});
test("invalid cart quantities and unavailable products fail", () => {
  for (const quantity of [0, -1, 100, 1.2, NaN])
    assert.throws(() =>
      quoteCart(fresh(), [{ productId: "p-automation", quantity }], ""),
    );
  assert.throws(
    () => quoteCart(fresh(), [{ productId: "p-local", quantity: 1 }], ""),
    /unavailable/,
  );
});
test("unknown and inactive discounts fail explicitly", () => {
  assert.throws(() =>
    quoteCart(fresh(), [{ productId: "p-automation", quantity: 1 }], "NOPE"),
  );
  const s = fresh();
  s.discounts[0].active = false;
  assert.throws(() =>
    quoteCart(s, [{ productId: "p-automation", quantity: 1 }], "BUILD20"),
  );
});
test("receipt keeps accepted product and discount snapshots", () => {
  let s = reduce(fresh(), checkout());
  s = reduce(s, {
    type: "product.save",
    product: { ...s.products[0], title: "New title", priceCents: 4000 },
    expected: 1,
  });
  s = reduce(s, {
    type: "discount.delete",
    id: s.discounts[0].id,
    expected: 1,
  });
  assert.equal(s.orders[0].quote.lines[0].title, "Automation Field Manual");
  assert.equal(s.orders[0].quote.lines[0].unitCents, 3900);
  assert.equal(s.orders[0].quote.discount.code, "BUILD20");
  validateState(s);
});
test("price or product version change invalidates a frozen quote", () => {
  const old = checkout();
  const s = reduce(fresh(), {
    type: "product.save",
    product: { ...initial.products[0], priceCents: 3901 },
    expected: 1,
  });
  assert.throws(() => reduce(s, old), /Quote changed/);
});
test("discount change invalidates a frozen quote", () => {
  const old = checkout();
  const s = reduce(fresh(), {
    type: "discount.save",
    discount: { ...initial.discounts[0], percent: 21 },
    expected: 1,
  });
  assert.throws(() => reduce(s, old), /Quote changed/);
});
test("matching request retry never creates a second receipt", () => {
  const c = checkout();
  const s = reduce(fresh(), c);
  assert.equal(reduce(s, c), s);
  assert.equal(s.orders.length, 1);
});
test("request key reuse with changed buyer fails", () => {
  const c = checkout();
  const s = reduce(fresh(), c);
  assert.throws(
    () => reduce(s, { ...c, buyer: "other@example.com" }),
    /different details/,
  );
});
test("history protects deletion but permits archive", () => {
  const s = reduce(fresh(), checkout());
  assert.throws(
    () =>
      reduce(s, { type: "product.delete", id: "p-automation", expected: 1 }),
    /history/,
  );
  const n = reduce(s, {
    type: "product.save",
    product: { ...s.products[0], active: false },
    expected: 1,
  });
  assert.equal(n.products[0].active, false);
  assert.equal(n.orders.length, 1);
});
test("cancellation is retained and retry returns cancelled receipt", () => {
  const c = checkout();
  let s = reduce(fresh(), c);
  s = reduce(s, { type: "order.cancel", id: c.id, expected: 1 });
  assert.equal(s.orders[0].status, "Cancelled");
  assert.equal(s.orders[0].version, 2);
  assert.equal(reduce(s, c), s);
  assert.throws(() =>
    reduce(s, { type: "order.cancel", id: c.id, expected: 1 }),
  );
  assert.throws(
    () => reduce(s, { type: "order.cancel", id: c.id, expected: 2 }),
    /already/,
  );
});
test("invalid buyer and impossible timestamp do not create orders", () => {
  for (const patch of [
    { buyer: "not-mail" },
    { buyer: "Mixed@Example.com" },
    { createdAt: "2026-02-30T12:00:00.000Z" },
  ])
    assert.throws(() => reduce(fresh(), checkout(fresh(), patch)));
});
test("strict import rejects extra fields and schema mismatch", () => {
  assert.throws(() => decode(JSON.stringify({ ...fresh(), extra: true })));
  assert.throws(() => decode(JSON.stringify({ ...fresh(), schema: 2 })));
});
test("strict import rejects missing references and tampered totals", () => {
  const s = reduce(fresh(), checkout());
  const broken = structuredClone(s);
  broken.products = broken.products.filter((p) => p.id !== "p-automation");
  assert.throws(() => validateState(broken), /missing product/);
  s.orders[0].quote.totalCents++;
  assert.throws(() => validateState(s), /totals/);
});
test("strict import rejects duplicate requests and altered fingerprints", () => {
  const s = reduce(fresh(), checkout());
  s.orders.push({ ...s.orders[0], id: "another" });
  assert.throws(() => validateState(s), /Duplicate/);
  s.orders.pop();
  s.orders[0].fingerprint = "forged";
  assert.throws(() => validateState(s), /fingerprint/);
});
test("size and collection bounds reject excessive workspaces", () => {
  assert.throws(() => decode(" ".repeat(4 * 1024 * 1024 + 1)), /4 MiB/);
  const s = fresh();
  s.products = Array.from({ length: 1001 }, (_, i) => ({
    ...product(),
    id: `product-${i}`,
  }));
  assert.throws(() => validateState(s), /limit/);
});
test("reading missing storage does not seed or touch legacy data", () => {
  const f = fixture();
  f.data.set("buildgum-cart", "broken legacy");
  assert.equal(f.repo.load().state.products.length, 6);
  assert.equal(f.data.has(STORAGE_KEY), false);
  assert.equal(f.data.get("buildgum-cart"), "broken legacy");
});
test("corrupt storage stops load and remains byte-for-byte", () => {
  const f = fixture("{broken");
  assert.throws(() => f.repo.load());
  assert.equal(f.data.get(STORAGE_KEY), "{broken");
});
test("storage quota failure does not advance accepted snapshot", async () => {
  const f = fixture();
  const base = f.repo.load();
  f.storage.setItem = () => {
    throw new Error("Quota");
  };
  await assert.rejects(f.repo.commit(base, create()), /Quota/);
  assert.equal(base.state.revision, 0);
  assert.equal(f.data.size, 0);
});
test("two simultaneous tabs accept one stale-baseline save", async () => {
  const f = fixture();
  const a = f.repo.load(),
    b = f.repo.load();
  const outcomes = await Promise.allSettled([
    f.repo.commit(a, create()),
    f.repo.commit(b, create({ ...product(), id: "second" })),
  ]);
  assert.equal(outcomes.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal(f.repo.load().state.revision, 1);
});
test("checkout retry after write then response failure finds receipt", async () => {
  const f = fixture();
  const base = f.repo.load();
  const original = f.storage.setItem;
  let once = true;
  f.storage.setItem = (k, v) => {
    original(k, v);
    if (once) {
      once = false;
      throw new Error("Lost response");
    }
  };
  const c = checkout();
  await assert.rejects(f.repo.commit(base, c), /Lost response/);
  const result = await f.repo.commit(base, c);
  assert.equal(result.state.orders.length, 1);
  assert.equal(result.state.revision, 1);
});
test("matching retry survives unrelated later edits", async () => {
  const f = fixture();
  const base = f.repo.load();
  const c = checkout();
  const first = await f.repo.commit(base, c);
  await f.repo.commit(first, create());
  const retry = await f.repo.commit(base, c);
  assert.equal(retry.state.revision, 2);
  assert.equal(retry.state.orders.length, 1);
});
test("restore uses reviewed raw baseline and raises revision", async () => {
  const f = fixture();
  const base = f.repo.load();
  await f.repo.commit(base, create());
  await assert.rejects(f.repo.restore(base.raw, encode(fresh())), /changed/);
  const current = f.repo.load();
  const restored = await f.repo.restore(current.raw, encode(fresh()));
  assert.equal(restored.state.revision, 2);
  assert.equal(restored.state.products.length, 6);
});
test("explicit recovery can replace corrupt bytes but never silently", async () => {
  const f = fixture("bad");
  await assert.rejects(f.repo.restore(null, encode(fresh())), /changed/);
  const result = await f.repo.restore("bad", encode(fresh()));
  assert.equal(result.state.revision, 1);
});
test("restored version numbers cannot authorize a pre-import draft", async () => {
  const f = fixture(encode(fresh()));
  const base = f.repo.load();
  await f.repo.restore(base.raw, encode(fresh()));
  await assert.rejects(f.repo.commit(base, create()), /changed/);
});
test("invalid backup and unavailable lock do not mutate storage", async () => {
  const f = fixture();
  await assert.rejects(f.repo.restore(null, "{}"));
  const r = repository(
    f.storage,
    () => Promise.reject(new Error("No Web Locks")),
    fresh(),
  );
  await assert.rejects(r.commit(r.load(), create()), /Web Locks/);
  assert.equal(f.data.size, 0);
});
