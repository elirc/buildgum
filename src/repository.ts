import {
  decode,
  encode,
  reduce,
  replay,
  type Command,
  type State,
} from "./model";
export const STORAGE_KEY = "buildgum-workspace-v1";
export type Snapshot = { state: State; raw: string | null };
export type StoragePort = Pick<Storage, "getItem" | "setItem">;
export type LockPort = <T>(work: () => T | Promise<T>) => Promise<T>;
/** The raw baseline and cooperative lock cover the complete read/validate/write operation. */
export function repository(
  storage: StoragePort,
  lock: LockPort,
  initial: State,
) {
  function load(): Snapshot {
    const raw = storage.getItem(STORAGE_KEY);
    return {
      raw,
      state: raw === null ? structuredClone(initial) : decode(raw),
    };
  }
  async function commit(base: Snapshot, command: Command): Promise<Snapshot> {
    return lock(() => {
      const current = load();
      // A response may be lost after durable acceptance. Matching retries return the receipt.
      if (replay(current.state, command)) return current;
      if (current.raw !== base.raw)
        throw new Error(
          "Workspace changed in another tab. Export your draft, then reload.",
        );
      const state = reduce(current.state, command);
      const raw = encode(state);
      storage.setItem(STORAGE_KEY, raw); // Failure leaves the caller's accepted state untouched.
      return { state, raw };
    });
  }
  async function restore(
    baseRaw: string | null,
    raw: string,
  ): Promise<Snapshot> {
    const imported = decode(raw);
    return lock(() => {
      const currentRaw = storage.getItem(STORAGE_KEY);
      if (currentRaw !== baseRaw)
        throw new Error(
          "Workspace changed while reviewing the import. Reload first.",
        );
      let revision = 0;
      try {
        revision = currentRaw === null ? 0 : decode(currentRaw).revision;
      } catch {
        /* Explicit recovery may replace invalid bytes after confirmation. */
      }
      const state = {
        ...structuredClone(imported),
        revision: Math.max(revision, imported.revision) + 1,
      };
      const encoded = encode(state);
      storage.setItem(STORAGE_KEY, encoded);
      return { state, raw: encoded };
    });
  }
  return { load, commit, restore };
}
export const browserLock: LockPort = (work) => {
  if (!navigator.locks)
    return Promise.reject(
      new Error(
        "Safe writes need Web Locks. Open this app on localhost in a supported browser.",
      ),
    );
  return navigator.locks.request(STORAGE_KEY, work);
};
