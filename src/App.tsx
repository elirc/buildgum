import { useEffect, useState, type CSSProperties } from "react";
import { initial } from "./initial";
import {
  decode,
  money,
  parsePrice,
  quoteCart,
  type Command,
  type Product,
  type Discount,
  type State,
} from "./model";
import {
  browserLock,
  repository,
  STORAGE_KEY,
  type Snapshot,
} from "./repository";
const repo = repository(
  {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  },
  browserLock,
  initial,
);
type View =
  | "Storefront"
  | "Products"
  | "Discounts"
  | "Checkout"
  | "Orders"
  | "Workspace";
type Editor =
  | {
      kind: "product";
      value: Product;
      price: string;
      expected: number | null;
      base: Snapshot;
    }
  | {
      kind: "discount";
      value: Discount;
      expected: number | null;
      base: Snapshot;
    };
const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "Operation failed.";
function download(name: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function readWorkspace() {
  try {
    const snapshot = repo.load();
    return { snapshot, raw: snapshot.raw, error: "" };
  } catch (error) {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {}
    return { snapshot: null, raw, error: errorText(error) };
  }
}
export default function App() {
  const [loaded] = useState(readWorkspace);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(loaded.snapshot);
  const [baseRaw, setBaseRaw] = useState<string | null>(loaded.raw);
  const [error, setError] = useState(loaded.error);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [stale, setStale] = useState(false);
  const [view, setView] = useState<View>(
    loaded.snapshot ? "Storefront" : "Workspace",
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("active");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [dirty, setDirty] = useState(false);
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>(
    [],
  );
  const [buyer, setBuyer] = useState("learner@example.com");
  const [code, setCode] = useState("");
  const [attempt, setAttempt] = useState<Extract<
    Command,
    { type: "checkout" }
  > | null>(null);
  const [imported, setImported] = useState<{
    raw: string;
    state: State;
  } | null>(null);
  const [orderPage, setOrderPage] = useState(1);
  const state = snapshot?.state;
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) setStale(true);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty || attempt || cart.length || busy) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, attempt, cart.length, busy]);
  function discardEditor() {
    if (
      dirty &&
      !confirm("Discard this unsaved editor draft? Export it first if needed.")
    )
      return false;
    setEditor(null);
    setDirty(false);
    return true;
  }
  function navigate(next: View) {
    if (next === view || discardEditor()) {
      setView(next);
      setError("");
      setMessage("");
    }
  }
  function accept(next: Snapshot) {
    setSnapshot(next);
    setBaseRaw(next.raw);
    setStale(false);
  }
  async function save(command: Command, base = snapshot, after?: () => void) {
    if (!base || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const next = await repo.commit(base, command);
      accept(next);
      after?.();
      setMessage(
        command.type === "checkout"
          ? "Simulated receipt recorded. No payment or delivery occurred."
          : "Saved to this browser.",
      );
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  function reload() {
    if (
      (dirty || attempt || cart.length) &&
      !confirm(
        "Reload current storage and discard local editor, cart and checkout drafts? Export drafts first if needed.",
      )
    )
      return;
    const r = readWorkspace();
    setSnapshot(r.snapshot);
    setBaseRaw(r.raw);
    setError(r.error);
    setEditor(null);
    setDirty(false);
    setAttempt(null);
    setCart([]);
    setImported(null);
    setStale(false);
    setMessage(r.error ? "" : "Reloaded current storage.");
  }
  function editProduct(product?: Product) {
    if (!snapshot || !discardEditor()) return;
    setEditor({
      kind: "product",
      value: product
        ? { ...product }
        : {
            id: crypto.randomUUID(),
            version: 1,
            title: "",
            creator: "Mina Studio",
            category: "Operations",
            description: "",
            priceCents: 0,
            active: true,
            accent: "#ff6b35",
          },
      price: product ? (product.priceCents / 100).toFixed(2) : "0.00",
      expected: product?.version ?? null,
      base: snapshot,
    });
    setDirty(false);
    setError("");
  }
  function editDiscount(discount?: Discount) {
    if (!snapshot || !discardEditor()) return;
    setEditor({
      kind: "discount",
      value: discount
        ? { ...discount }
        : {
            id: crypto.randomUUID(),
            version: 1,
            code: "",
            percent: 20,
            active: true,
          },
      expected: discount?.version ?? null,
      base: snapshot,
    });
    setDirty(false);
    setError("");
  }
  function submitEditor() {
    if (!editor) return;
    try {
      const e = editor;
      const command: Command =
        e.kind === "product"
          ? {
              type: "product.save",
              product: {
                ...e.value,
                title: e.value.title.trim(),
                creator: e.value.creator.trim(),
                category: e.value.category.trim(),
                description: e.value.description.trim(),
                priceCents: parsePrice(e.price),
              },
              expected: e.expected,
            }
          : {
              type: "discount.save",
              discount: { ...e.value, code: e.value.code.trim().toUpperCase() },
              expected: e.expected,
            };
      void save(command, e.base, () => {
        setEditor(null);
        setDirty(false);
      });
    } catch (e) {
      setError(errorText(e));
    }
  }
  function add(product: Product) {
    if (attempt) {
      setError(
        "Resolve or discard the frozen checkout attempt before changing the cart.",
      );
      return;
    }
    setCart((items) =>
      items.some((i) => i.productId === product.id)
        ? items
        : [...items, { productId: product.id, quantity: 1 }],
    );
    setMessage(`${product.title} is in your cart.`);
  }
  let quote = null;
  let quoteError = "";
  if (state && cart.length)
    try {
      quote = quoteCart(state, cart, code);
    } catch (e) {
      quoteError = errorText(e);
    }
  function checkout() {
    if (!snapshot) return;
    try {
      const next = attempt ?? {
        type: "checkout" as const,
        id: crypto.randomUUID(),
        requestKey: crypto.randomUUID(),
        buyer: buyer.trim().toLowerCase(),
        quote: quoteCart(snapshot.state, cart, code),
        createdAt: new Date().toISOString(),
      };
      setAttempt(next);
      void save(next, snapshot, () => {
        setAttempt(null);
        setCart([]);
        setCode("");
        setView("Orders");
        setQuery("");
        setOrderPage(1);
      });
    } catch (e) {
      setError(errorText(e));
    }
  }
  async function readImport(file?: File) {
    if (!file) return;
    setError("");
    setImported(null);
    try {
      if (file.size > 4 * 1024 * 1024) throw new Error("Import exceeds 4 MiB.");
      const raw = await file.text();
      setImported({ raw, state: decode(raw) });
    } catch (e) {
      setError(errorText(e));
    }
  }
  async function restore() {
    if (
      !imported ||
      busy ||
      !confirm(
        "Replace the entire local workspace with this reviewed backup? Export current bytes and drafts first.",
      )
    )
      return;
    setBusy(true);
    try {
      const next = await repo.restore(baseRaw, imported.raw);
      accept(next);
      setEditor(null);
      setDirty(false);
      setCart([]);
      setAttempt(null);
      setImported(null);
      setError("");
      setMessage("Backup restored as a new workspace revision.");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  const products =
    state?.products.filter(
      (p) =>
        (view === "Storefront"
          ? p.active
          : filter === "all" || p.active === (filter === "active")) &&
        [p.title, p.creator, p.category]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    ) ?? [];
  const orders =
    state?.orders.filter((o) =>
      [o.id, o.buyer, o.status, ...o.quote.lines.map((l) => l.title)]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    ) ?? [];
  const page = Math.min(orderPage, Math.max(1, Math.ceil(orders.length / 20)));
  const gross =
    state?.orders
      .filter((o) => o.status === "Recorded")
      .reduce((sum, o) => sum + o.quote.totalCents, 0) ?? 0;
  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="brand-mark">
          <span className="brand-icon">bg</span>
          <div>
            <strong>Buildgum</strong>
            <span>Creator commerce workshop</span>
          </div>
        </div>
        <nav aria-label="Primary">
          {(
            [
              "Storefront",
              "Products",
              "Discounts",
              "Checkout",
              "Orders",
              "Workspace",
            ] as View[]
          ).map((name) => (
            <button
              type="button"
              key={name}
              disabled={busy || (!state && name !== "Workspace")}
              className={`nav-item ${view === name ? "active" : ""}`}
              aria-current={view === name ? "page" : undefined}
              onClick={() => navigate(name)}
            >
              {name}
              {name === "Checkout" ? ` (${cart.length})` : ""}
            </button>
          ))}
        </nav>
        <div className="creator-chip">
          <div>
            <strong>Local learning workspace</strong>
            <span>
              Fictional catalog. No payments, subscriptions or deliveries.
            </span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <label className="search-box">
            <input
              aria-label="Search catalog or receipts"
              placeholder="Search titles, creators or receipts"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOrderPage(1);
              }}
            />
          </label>
          <button className="secondary-action" disabled={busy} onClick={reload}>
            Reload storage
          </button>
        </header>
        <main>
          <div className="workspace-notice">
            Local demo / USD /{" "}
            {state ? `Revision ${state.revision}` : "Recovery mode"} / Cart and
            editor drafts stay in this tab until reload.
          </div>
          {stale && (
            <p className="warning">
              Storage changed elsewhere. Your current view and drafts are
              retained; reload before another edit.
            </p>
          )}
          {error && (
            <p role="alert" className="warning">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="success-box">
              {message}
            </p>
          )}
          {state && view === "Storefront" && (
            <section>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Your creator catalog</p>
                  <h1>Ideas worth building.</h1>
                  <p className="intro">
                    Explore the sample collection, then create your own products
                    and record a simulated purchase.
                  </p>
                </div>
              </div>
              <div className="metric-grid">
                <article className="metric-tile">
                  <span>Active products</span>
                  <strong>
                    {state.products.filter((p) => p.active).length}
                  </strong>
                </article>
                <article className="metric-tile">
                  <span>Recorded receipts</span>
                  <strong>{state.orders.length}</strong>
                </article>
                <article className="metric-tile">
                  <span>Uncancelled demo total</span>
                  <strong>{money(gross)}</strong>
                </article>
              </div>
              <div className="product-grid">
                {products.map((p) => (
                  <article className="product-card" key={p.id}>
                    <div
                      className="product-cover"
                      style={{ "--accent": p.accent } as CSSProperties}
                    >
                      <span>{p.category}</span>
                      <strong>{p.title}</strong>
                    </div>
                    <div className="product-body">
                      <h2>{p.title}</h2>
                      <p className="muted">{p.creator}</p>
                      <p>{p.description}</p>
                    </div>
                    <div className="product-footer">
                      <strong>{money(p.priceCents)}</strong>
                      <button
                        className="secondary-action"
                        disabled={
                          busy ||
                          !!attempt ||
                          cart.some((l) => l.productId === p.id) ||
                          cart.length >= 50
                        }
                        onClick={() => add(p)}
                      >
                        {cart.some((l) => l.productId === p.id)
                          ? "In cart"
                          : "Add to cart"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!products.length && (
                <p className="panel">No active products match your search.</p>
              )}
            </section>
          )}
          {state && (view === "Products" || view === "Discounts") && (
            <section className="stacked-view">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Catalog operations</p>
                  <h1>{view}</h1>
                  <p className="intro">
                    {view === "Products"
                      ? "Edit prices and descriptions. Archive products to keep their receipt history."
                      : "One whole-percent code per receipt. No expiry or recurring billing."}
                  </p>
                </div>
                <button
                  className="primary-action"
                  disabled={busy}
                  onClick={() =>
                    view === "Products" ? editProduct() : editDiscount()
                  }
                >
                  {view === "Products" ? "New product" : "New discount"}
                </button>
              </div>
              {view === "Products" && (
                <label className="filter-label">
                  Product visibility
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="all">All</option>
                  </select>
                </label>
              )}
              {editor && (
                <form
                  className="panel editor"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitEditor();
                  }}
                >
                  <h2>
                    {editor.expected === null ? "Create" : "Edit"} {editor.kind}
                  </h2>
                  <fieldset disabled={busy}>
                    {editor.kind === "product" ? (
                      <>
                        {(["title", "creator", "category"] as const).map(
                          (key) => (
                            <label key={key}>
                              {key[0].toUpperCase() + key.slice(1)}
                              <input
                                required
                                maxLength={
                                  key === "title"
                                    ? 120
                                    : key === "creator"
                                      ? 80
                                      : 60
                                }
                                value={editor.value[key]}
                                onChange={(e) => {
                                  setEditor({
                                    ...editor,
                                    value: {
                                      ...editor.value,
                                      [key]: e.target.value,
                                    },
                                  });
                                  setDirty(true);
                                }}
                              />
                            </label>
                          ),
                        )}
                        <label>
                          Price in USD
                          <input
                            required
                            inputMode="decimal"
                            value={editor.price}
                            onChange={(e) => {
                              setEditor({ ...editor, price: e.target.value });
                              setDirty(true);
                            }}
                          />
                        </label>
                        <label className="wide">
                          Description
                          <textarea
                            maxLength={2000}
                            value={editor.value.description}
                            onChange={(e) => {
                              setEditor({
                                ...editor,
                                value: {
                                  ...editor.value,
                                  description: e.target.value,
                                },
                              });
                              setDirty(true);
                            }}
                          />
                        </label>
                        <label>
                          Cover color
                          <input
                            type="color"
                            value={editor.value.accent}
                            onChange={(e) => {
                              setEditor({
                                ...editor,
                                value: {
                                  ...editor.value,
                                  accent: e.target.value,
                                },
                              });
                              setDirty(true);
                            }}
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <label>
                          Code
                          <input
                            required
                            maxLength={24}
                            value={editor.value.code}
                            onChange={(e) => {
                              setEditor({
                                ...editor,
                                value: {
                                  ...editor.value,
                                  code: e.target.value,
                                },
                              });
                              setDirty(true);
                            }}
                          />
                        </label>
                        <label>
                          Percent
                          <input
                            type="number"
                            required
                            min={1}
                            max={100}
                            step={1}
                            value={editor.value.percent}
                            onChange={(e) => {
                              setEditor({
                                ...editor,
                                value: {
                                  ...editor.value,
                                  percent: Number(e.target.value),
                                },
                              });
                              setDirty(true);
                            }}
                          />
                        </label>
                      </>
                    )}
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={editor.value.active}
                        onChange={(e) => {
                          setEditor({
                            ...editor,
                            value: {
                              ...editor.value,
                              active: e.target.checked,
                            },
                          } as Editor);
                          setDirty(true);
                        }}
                      />
                      Active
                    </label>
                    <div className="actions wide">
                      <button className="primary-action">
                        Save {editor.kind}
                      </button>
                      <button
                        type="button"
                        className="secondary-action"
                        onClick={() =>
                          download(
                            "buildgum-editor-draft.json",
                            JSON.stringify(editor, null, 2),
                          )
                        }
                      >
                        Export draft
                      </button>
                      <button
                        type="button"
                        className="secondary-action"
                        onClick={discardEditor}
                      >
                        Close editor
                      </button>
                    </div>
                  </fieldset>
                </form>
              )}
              <div className="record-list">
                {view === "Products"
                  ? products.map((p) => (
                      <article className="panel record" key={p.id}>
                        <div>
                          <h2>{p.title}</h2>
                          <p>
                            {p.creator} / {p.category} / {money(p.priceCents)}
                          </p>
                          <p className="muted">
                            {p.active ? "Active" : "Archived"} / Version{" "}
                            {p.version}
                          </p>
                        </div>
                        <div className="actions">
                          <button
                            className="secondary-action"
                            disabled={busy}
                            onClick={() => editProduct(p)}
                          >
                            Edit {p.title}
                          </button>
                          <button
                            className="secondary-action"
                            disabled={busy || !!editor}
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete ${p.title}? Products with receipt history cannot be deleted.`,
                                )
                              )
                                void save({
                                  type: "product.delete",
                                  id: p.id,
                                  expected: p.version,
                                });
                            }}
                          >
                            Delete {p.title}
                          </button>
                        </div>
                      </article>
                    ))
                  : state.discounts.map((d) => (
                      <article className="panel record" key={d.id}>
                        <div>
                          <h2>{d.code}</h2>
                          <p>
                            {d.percent}% / {d.active ? "Active" : "Inactive"} /
                            Version {d.version}
                          </p>
                        </div>
                        <div className="actions">
                          <button
                            className="secondary-action"
                            disabled={busy}
                            onClick={() => editDiscount(d)}
                          >
                            Edit {d.code}
                          </button>
                          <button
                            className="secondary-action"
                            disabled={busy || !!editor}
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete ${d.code}? Accepted receipts retain its details.`,
                                )
                              )
                                void save({
                                  type: "discount.delete",
                                  id: d.id,
                                  expected: d.version,
                                });
                            }}
                          >
                            Delete {d.code}
                          </button>
                        </div>
                      </article>
                    ))}
              </div>
              {view === "Products" && !products.length && (
                <p>No products match this filter.</p>
              )}
              {view === "Discounts" && !state.discounts.length && (
                <p>No discount codes yet.</p>
              )}
            </section>
          )}
          {state && view === "Checkout" && (
            <section className="stacked-view">
              <div>
                <p className="eyebrow">Simulated checkout</p>
                <h1>Review your receipt.</h1>
                <p className="intro">
                  Nothing is charged or delivered. Membership samples are
                  treated as one-time items. Tax is not calculated.
                </p>
              </div>
              <div className="checkout-layout">
                <div className="panel">
                  <fieldset
                    disabled={busy || !!attempt}
                    className="checkout-fields"
                  >
                    <label>
                      Buyer email
                      <input
                        type="email"
                        value={buyer}
                        maxLength={254}
                        onChange={(e) => setBuyer(e.target.value)}
                      />
                    </label>
                    <label>
                      Discount code
                      <input
                        maxLength={24}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Optional, e.g. BUILD20"
                      />
                    </label>
                    {cart.map((line) => (
                      <div className="cart-line" key={line.productId}>
                        <strong>
                          {state.products.find((p) => p.id === line.productId)
                            ?.title ?? "Unavailable product"}
                        </strong>
                        <label>
                          Quantity
                          <input
                            aria-label={`Quantity for ${line.productId}`}
                            type="number"
                            min={1}
                            max={99}
                            step={1}
                            value={line.quantity}
                            onChange={(e) =>
                              setCart((items) =>
                                items.map((l) =>
                                  l.productId === line.productId
                                    ? { ...l, quantity: Number(e.target.value) }
                                    : l,
                                ),
                              )
                            }
                          />
                        </label>
                        <button
                          className="secondary-action"
                          onClick={() =>
                            setCart((items) =>
                              items.filter(
                                (l) => l.productId !== line.productId,
                              ),
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </fieldset>
                  {!cart.length && (
                    <p>
                      Your cart is empty. Add a product from the storefront.
                    </p>
                  )}
                </div>
                <div className="checkout-summary">
                  {quote && (
                    <>
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <strong>{money(quote.subtotalCents)}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Discount</span>
                        <strong>-{money(quote.discountCents)}</strong>
                      </div>
                      <div className="summary-total">
                        <span>Total USD</span>
                        <strong>{money(quote.totalCents)}</strong>
                      </div>
                    </>
                  )}
                  {quoteError && <p className="warning">{quoteError}</p>}
                  <button
                    className="primary-action"
                    disabled={busy || (!attempt && !quote)}
                    onClick={checkout}
                  >
                    {attempt
                      ? "Retry same receipt"
                      : "Record simulated receipt"}
                  </button>
                  {attempt && (
                    <>
                      <p>
                        The request is frozen. A matching retry returns an
                        existing receipt. Inspect Orders before discarding after
                        an uncertain result.
                      </p>
                      <button
                        className="secondary-action"
                        disabled={busy}
                        onClick={() => {
                          if (
                            confirm(
                              "Discard the frozen attempt? If it was already accepted, a new attempt could create another receipt. Inspect Orders first.",
                            )
                          )
                            setAttempt(null);
                        }}
                      >
                        Discard frozen attempt
                      </button>
                    </>
                  )}
                  <button
                    className="secondary-action"
                    onClick={() =>
                      download(
                        "buildgum-checkout-draft.json",
                        JSON.stringify({ buyer, code, cart, attempt }, null, 2),
                      )
                    }
                  >
                    Export checkout draft
                  </button>
                </div>
              </div>
            </section>
          )}
          {state && view === "Orders" && (
            <section className="stacked-view">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Local history</p>
                  <h1>Simulated receipts</h1>
                  <p className="intro">
                    Accepted titles, quantities, prices and discounts stay
                    attached to each receipt.
                  </p>
                </div>
                <button
                  className="secondary-action"
                  onClick={() =>
                    download(
                      "buildgum-receipts.json",
                      JSON.stringify(state.orders, null, 2),
                    )
                  }
                >
                  Export receipts
                </button>
              </div>
              {orders.slice((page - 1) * 20, page * 20).map((order) => (
                <article className="panel receipt" key={order.id}>
                  <div className="record">
                    <div>
                      <h2>{order.buyer}</h2>
                      <p className="receipt-id">{order.id}</p>
                      <p>
                        {new Date(order.createdAt).toLocaleString()} /{" "}
                        {order.status} / Version {order.version}
                      </p>
                    </div>
                    <strong>{money(order.quote.totalCents)}</strong>
                  </div>
                  <ul>
                    {order.quote.lines.map((l) => (
                      <li key={l.productId}>
                        {l.title} x {l.quantity} at {money(l.unitCents)} each
                      </li>
                    ))}
                  </ul>
                  <p>
                    Discount:{" "}
                    {order.quote.discount
                      ? `${order.quote.discount.code} (${order.quote.discount.percent}%)`
                      : "None"}{" "}
                    / {money(order.quote.discountCents)}
                  </p>
                  <div className="actions">
                    <button
                      className="secondary-action"
                      onClick={() =>
                        download(
                          `receipt-${order.id}.json`,
                          JSON.stringify(order, null, 2),
                        )
                      }
                    >
                      Export receipt
                    </button>
                    <button
                      className="secondary-action"
                      disabled={busy || order.status === "Cancelled"}
                      onClick={() => {
                        if (
                          confirm(
                            "Mark this local receipt cancelled? No refund or external action occurs.",
                          )
                        )
                          void save({
                            type: "order.cancel",
                            id: order.id,
                            expected: order.version,
                          });
                      }}
                    >
                      Cancel receipt
                    </button>
                  </div>
                </article>
              ))}
              {!orders.length && (
                <p className="panel">No receipts match your search.</p>
              )}
              <div className="actions">
                <button
                  className="secondary-action"
                  disabled={page <= 1}
                  onClick={() => setOrderPage(page - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {Math.max(1, Math.ceil(orders.length / 20))} /{" "}
                  {orders.length} receipts
                </span>
                <button
                  className="secondary-action"
                  disabled={page * 20 >= orders.length}
                  onClick={() => setOrderPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </section>
          )}
          {view === "Workspace" && (
            <section className="stacked-view">
              <div>
                <p className="eyebrow">Backup and recovery</p>
                <h1>Your browser workspace.</h1>
                <p className="intro">
                  Only this origin's local storage is used. No account or server
                  database is connected.
                </p>
              </div>
              <div className="panel">
                <h2>Export before replacing data</h2>
                <p>
                  Workspace backups can be restored here. Draft and receipt
                  exports are reference files for manual review, not workspace
                  imports. Existing legacy buildgum-cart data is left untouched.
                </p>
                <div className="actions">
                  <button
                    className="secondary-action"
                    onClick={() =>
                      download(
                        "buildgum-workspace.json",
                        snapshot
                          ? JSON.stringify(snapshot.state, null, 2)
                          : (baseRaw ?? ""),
                      )
                    }
                  >
                    {snapshot
                      ? "Export loaded workspace"
                      : "Export original stored bytes"}
                  </button>
                  <button
                    className="secondary-action"
                    onClick={() =>
                      download(
                        "buildgum-all-drafts.json",
                        JSON.stringify(
                          { editor, buyer, code, cart, attempt },
                          null,
                          2,
                        ),
                      )
                    }
                  >
                    Export all drafts
                  </button>
                  <button
                    className="secondary-action"
                    onClick={() =>
                      download(
                        "buildgum-sample-workspace.json",
                        JSON.stringify(initial, null, 2),
                      )
                    }
                  >
                    Download clean sample backup
                  </button>
                </div>
              </div>
              <div className="panel editor">
                <h2>Review a backup</h2>
                <label>
                  Workspace JSON
                  <input
                    type="file"
                    accept=".json,application/json"
                    disabled={busy}
                    onChange={(e) => void readImport(e.target.files?.[0])}
                  />
                </label>
                {imported && (
                  <>
                    <p>
                      Validated backup: {imported.state.products.length}{" "}
                      products, {imported.state.discounts.length} codes,{" "}
                      {imported.state.orders.length} receipts. Its revision is{" "}
                      {imported.state.revision}. Replacement removes current
                      records absent from this backup.
                    </p>
                    <button
                      className="primary-action"
                      disabled={busy}
                      onClick={() => void restore()}
                    >
                      Replace with reviewed backup
                    </button>
                  </>
                )}
              </div>
              <p className="muted">
                Limits: 4 MiB, 1,000 products, 200 codes and 2,000 receipts.
                Browser access is not authentication. Backups and drafts may
                contain buyer emails; use fictional data for exercises.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
