/** Pure commerce rules. Storage, React and browser APIs stay outside this module. */
export type Product = {
  id: string;
  version: number;
  title: string;
  creator: string;
  category: string;
  description: string;
  priceCents: number;
  active: boolean;
  accent: string;
};
export type Discount = {
  id: string;
  version: number;
  code: string;
  percent: number;
  active: boolean;
};
export type Line = {
  productId: string;
  version: number;
  title: string;
  unitCents: number;
  quantity: number;
};
export type Quote = {
  lines: Line[];
  discount: {
    id: string;
    version: number;
    code: string;
    percent: number;
  } | null;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
};
export type Order = {
  id: string;
  version: number;
  requestKey: string;
  fingerprint: string;
  buyer: string;
  quote: Quote;
  createdAt: string;
  status: "Recorded" | "Cancelled";
};
export type State = {
  schema: 1;
  revision: number;
  products: Product[];
  discounts: Discount[];
  orders: Order[];
};
export type Command =
  | { type: "product.save"; product: Product; expected: number | null }
  | { type: "product.delete"; id: string; expected: number }
  | { type: "discount.save"; discount: Discount; expected: number | null }
  | { type: "discount.delete"; id: string; expected: number }
  | {
      type: "checkout";
      id: string;
      requestKey: string;
      buyer: string;
      quote: Quote;
      createdAt: string;
    }
  | { type: "order.cancel"; id: string; expected: number };

function requireThat(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}
function object(value: unknown, keys: string[]): Record<string, any> {
  requireThat(
    value !== null && typeof value === "object" && !Array.isArray(value),
    "Expected an object.",
  );
  requireThat(
    Object.keys(value).sort().join("|") === [...keys].sort().join("|"),
    "Unexpected or missing fields.",
  );
  return value as Record<string, any>;
}
function integer(
  n: unknown,
  min: number,
  max = Number.MAX_SAFE_INTEGER - 1,
): asserts n is number {
  requireThat(
    Number.isSafeInteger(n) && Number(n) >= min && Number(n) <= max,
    "Number is outside its permitted range.",
  );
}
function text(s: unknown, max: number, blank = false): asserts s is string {
  requireThat(
    typeof s === "string" &&
      s === s.trim() &&
      (blank || s.length > 0) &&
      s.length <= max &&
      !/[\u0000-\u001f\u007f]/.test(s),
    "Text must be trimmed, bounded and control-free.",
  );
}
function id(s: unknown): asserts s is string {
  text(s, 80);
  requireThat(/^[a-zA-Z0-9-]+$/.test(s), "Invalid identifier.");
}
function version(n: unknown) {
  integer(n, 1);
}
function boolean(b: unknown) {
  requireThat(typeof b === "boolean", "Expected true or false.");
}
function collection(v: unknown, max: number): asserts v is any[] {
  requireThat(
    Array.isArray(v) && v.length <= max,
    "Collection limit exceeded.",
  );
}
function unique(values: unknown[]) {
  requireThat(
    new Set(values).size === values.length,
    "Duplicate identifier or code.",
  );
}
export function validateProduct(value: unknown): asserts value is Product {
  const p = object(value, [
    "id",
    "version",
    "title",
    "creator",
    "category",
    "description",
    "priceCents",
    "active",
    "accent",
  ]);
  id(p.id);
  version(p.version);
  text(p.title, 120);
  text(p.creator, 80);
  text(p.category, 60);
  text(p.description, 2000, true);
  integer(p.priceCents, 0, 10000000);
  boolean(p.active);
  requireThat(
    typeof p.accent === "string" && /^#[0-9a-f]{6}$/i.test(p.accent),
    "Use a six-digit hex color.",
  );
}
export function validateDiscount(value: unknown): asserts value is Discount {
  const d = object(value, ["id", "version", "code", "percent", "active"]);
  id(d.id);
  version(d.version);
  text(d.code, 24);
  requireThat(
    /^[A-Z0-9-]{2,24}$/.test(d.code),
    "Code needs 2-24 uppercase letters, digits or hyphens.",
  );
  integer(d.percent, 1, 100);
  boolean(d.active);
}
function validateQuote(value: unknown): asserts value is Quote {
  const q = object(value, [
    "lines",
    "discount",
    "subtotalCents",
    "discountCents",
    "totalCents",
  ]);
  collection(q.lines, 50);
  requireThat(q.lines.length > 0, "Cart is empty.");
  for (const value of q.lines) {
    const l = object(value, [
      "productId",
      "version",
      "title",
      "unitCents",
      "quantity",
    ]);
    id(l.productId);
    version(l.version);
    text(l.title, 120);
    integer(l.unitCents, 0, 10000000);
    integer(l.quantity, 1, 99);
  }
  unique(q.lines.map((l: Line) => l.productId));
  requireThat(
    q.lines.map((l: Line) => l.productId).join("|") ===
      q.lines
        .map((l: Line) => l.productId)
        .sort()
        .join("|"),
    "Quote lines must be sorted.",
  );
  if (q.discount !== null) {
    const d = object(q.discount, ["id", "version", "code", "percent"]);
    id(d.id);
    version(d.version);
    text(d.code, 24);
    requireThat(/^[A-Z0-9-]{2,24}$/.test(d.code), "Invalid receipt code.");
    integer(d.percent, 1, 100);
  }
  const subtotal = q.lines.reduce(
    (sum: number, l: Line) => sum + l.unitCents * l.quantity,
    0,
  );
  const discount = Math.floor(
    (subtotal * (q.discount?.percent ?? 0) + 50) / 100,
  );
  integer(q.subtotalCents, 0);
  integer(q.discountCents, 0);
  integer(q.totalCents, 0);
  requireThat(
    q.subtotalCents === subtotal &&
      q.discountCents === discount &&
      q.totalCents === subtotal - discount,
    "Receipt totals do not agree with its lines.",
  );
}
export function fingerprint(buyer: string, quote: Quote) {
  return JSON.stringify([
    buyer,
    quote.lines.map((l) => [
      l.productId,
      l.version,
      l.title,
      l.unitCents,
      l.quantity,
    ]),
    quote.discount === null
      ? null
      : [
          quote.discount.id,
          quote.discount.version,
          quote.discount.code,
          quote.discount.percent,
        ],
    quote.subtotalCents,
    quote.discountCents,
    quote.totalCents,
  ]);
}
export function validateState(value: unknown): asserts value is State {
  const s = object(value, [
    "schema",
    "revision",
    "products",
    "discounts",
    "orders",
  ]);
  requireThat(s.schema === 1, "Unsupported workspace schema.");
  integer(s.revision, 0);
  collection(s.products, 1000);
  collection(s.discounts, 200);
  collection(s.orders, 2000);
  s.products.forEach(validateProduct);
  s.discounts.forEach(validateDiscount);
  unique(s.products.map((p: Product) => p.id));
  unique(s.discounts.map((d: Discount) => d.id));
  unique(s.discounts.map((d: Discount) => d.code));
  for (const value of s.orders) {
    const o = object(value, [
      "id",
      "version",
      "requestKey",
      "fingerprint",
      "buyer",
      "quote",
      "createdAt",
      "status",
    ]);
    id(o.id);
    version(o.version);
    id(o.requestKey);
    text(o.buyer, 254);
    requireThat(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.buyer) &&
        o.buyer === o.buyer.toLowerCase(),
      "Use a normalized buyer email.",
    );
    requireThat(
      typeof o.createdAt === "string" &&
        /^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(o.createdAt) &&
        Number.isFinite(Date.parse(o.createdAt)) &&
        new Date(o.createdAt).toISOString() === o.createdAt,
      "Invalid receipt date.",
    );
    requireThat(
      ["Recorded", "Cancelled"].includes(o.status),
      "Invalid order status.",
    );
    validateQuote(o.quote);
    requireThat(
      o.fingerprint === fingerprint(o.buyer, o.quote),
      "Receipt fingerprint does not agree.",
    );
    requireThat(
      o.quote.lines.every((l: Line) =>
        s.products.some((p: Product) => p.id === l.productId),
      ),
      "Receipt references a missing product.",
    );
  }
  unique(s.orders.map((o: Order) => o.id));
  unique(s.orders.map((o: Order) => o.requestKey));
}
export function decode(raw: string): State {
  requireThat(
    new TextEncoder().encode(raw).length <= 4 * 1024 * 1024,
    "Workspace exceeds 4 MiB.",
  );
  const s: unknown = JSON.parse(raw);
  validateState(s);
  return s;
}
export function encode(state: State) {
  validateState(state);
  const raw = JSON.stringify(state);
  decode(raw);
  return raw;
}
export function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
export function parsePrice(value: string) {
  requireThat(
    /^(0|[1-9]\d{0,5})(\.\d{1,2})?$/.test(value),
    "Price needs dollars and at most two decimal places.",
  );
  const [d, c = ""] = value.split(".");
  const cents = Number(d) * 100 + Number(c.padEnd(2, "0"));
  integer(cents, 0, 10000000);
  return cents;
}
export function quoteCart(
  s: State,
  cart: { productId: string; quantity: number }[],
  code: string,
): Quote {
  collection(cart, 50);
  const lines = cart
    .map((item) => {
      integer(item.quantity, 1, 99);
      const p = s.products.find((p) => p.id === item.productId);
      requireThat(p?.active, "A cart product is unavailable.");
      return {
        productId: p.id,
        version: p.version,
        title: p.title,
        unitCents: p.priceCents,
        quantity: item.quantity,
      };
    })
    .sort((a, b) =>
      a.productId < b.productId ? -1 : a.productId > b.productId ? 1 : 0,
    );
  const normalized = code.trim().toUpperCase();
  const d = normalized
    ? s.discounts.find((d) => d.code === normalized && d.active)
    : null;
  requireThat(!normalized || d, "Discount code is unavailable.");
  const discount = d
    ? { id: d.id, version: d.version, code: d.code, percent: d.percent }
    : null;
  const subtotalCents = lines.reduce(
    (sum, l) => sum + l.unitCents * l.quantity,
    0,
  );
  const discountCents = Math.floor(
    (subtotalCents * (discount?.percent ?? 0) + 50) / 100,
  );
  const q = {
    lines,
    discount,
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
  };
  validateQuote(q);
  return q;
}
export function replay(s: State, command: Command): Order | undefined {
  if (command.type !== "checkout") return;
  const old = s.orders.find((o) => o.requestKey === command.requestKey);
  if (old)
    requireThat(
      old.fingerprint === fingerprint(command.buyer, command.quote),
      "This request key was already used with different details.",
    );
  return old;
}
export function reduce(s: State, command: Command): State {
  validateState(s);
  if (replay(s, command)) return s;
  const next = structuredClone(s);
  next.revision++;
  if (command.type === "product.save" || command.type === "discount.save") {
    const product = command.type === "product.save";
    const value = structuredClone(product ? command.product : command.discount);
    if (product) validateProduct(value);
    else validateDiscount(value);
    const list: (Product | Discount)[] = product
      ? next.products
      : next.discounts;
    const index = list.findIndex((item) => item.id === value.id);
    requireThat(
      command.expected === null
        ? index === -1
        : index !== -1 && list[index].version === command.expected,
      "Record changed; reload and review your draft.",
    );
    value.version = command.expected === null ? 1 : command.expected + 1;
    if (index === -1) list.push(value);
    else list[index] = value;
  } else if (
    command.type === "product.delete" ||
    command.type === "discount.delete"
  ) {
    const list =
      command.type === "product.delete" ? next.products : next.discounts;
    const item = list.find((p) => p.id === command.id);
    requireThat(
      item && item.version === command.expected,
      "Record changed; reload first.",
    );
    if (command.type === "product.delete") {
      requireThat(
        !next.orders.some((o) =>
          o.quote.lines.some((l) => l.productId === command.id),
        ),
        "This product has receipt history. Archive it instead.",
      );
      next.products = next.products.filter((p) => p.id !== command.id);
    } else next.discounts = next.discounts.filter((d) => d.id !== command.id);
  } else if (command.type === "checkout") {
    validateQuote(command.quote);
    const fresh = quoteCart(
      s,
      command.quote.lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
      command.quote.discount?.code ?? "",
    );
    requireThat(
      fingerprint(command.buyer, fresh) ===
        fingerprint(command.buyer, command.quote),
      "Quote changed; review current prices before a new attempt.",
    );
    next.orders.unshift({
      id: command.id,
      version: 1,
      requestKey: command.requestKey,
      fingerprint: fingerprint(command.buyer, command.quote),
      buyer: command.buyer,
      quote: structuredClone(command.quote),
      createdAt: command.createdAt,
      status: "Recorded",
    });
  } else if (command.type === "order.cancel") {
    const order = next.orders.find((o) => o.id === command.id);
    requireThat(
      order && order.version === command.expected,
      "Order changed; reload first.",
    );
    requireThat(order.status === "Recorded", "Order is already cancelled.");
    order.status = "Cancelled";
    order.version++;
  } else throw new Error("Unknown command.");
  encode(next);
  return next;
}
