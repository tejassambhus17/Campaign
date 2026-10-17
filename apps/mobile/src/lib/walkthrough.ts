export const WALKTHROUGH_KEY = "campaign:walkthrough:v1";
export const WALKTHROUGH_STEPS = 4;
export type WalkthroughStatus = "offered" | "in_progress" | "completed" | "skipped" | "interrupted";
export type WalkthroughRecord = { version: 1; status: WalkthroughStatus; step: number };
export type WalkthroughStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};
export type WalkthroughSnapshot = {
  ready: boolean;
  record: WalkthroughRecord | null;
  active: boolean;
  step: number;
  busy: boolean;
  invitationEligible: boolean;
  storageError: string;
};
export type WalkthroughOfferContext = {
  isHome: boolean;
  homeReady: boolean;
  startupReady: boolean;
  hasPendingNavigation: boolean;
  interactionBusy: boolean;
};

/** Only an idle, settled Home can offer. Network/campaign availability is irrelevant. */
export function canOfferWalkthrough(snapshot: WalkthroughSnapshot, context: WalkthroughOfferContext) {
  return snapshot.invitationEligible && !snapshot.active && !snapshot.busy &&
    context.isHome && context.homeReady && context.startupReady &&
    !context.hasPendingNavigation && !context.interactionBusy;
}

const interrupted = (): WalkthroughRecord => ({ version: 1, status: "interrupted", step: 0 });
const terminal = (record: WalkthroughRecord | null) => record?.status === "completed" || record?.status === "skipped";

function decode(saved: string | null): WalkthroughRecord | null {
  if (saved === null) return null;
  try {
    const value: unknown = JSON.parse(saved);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const record = value as Partial<WalkthroughRecord>;
      if (record.version === 1 && ["offered", "in_progress", "completed", "skipped", "interrupted"].includes(record.status || "") &&
        Number.isInteger(record.step) && typeof record.step === "number" && record.step >= 0 && record.step < WALKTHROUGH_STEPS &&
        (record.status !== "completed" || record.step === WALKTHROUGH_STEPS - 1) && (record.status !== "offered" || record.step === 0)) {
        // No transient overlay or invitation resumes after a process closes.
        return { version: 1, status: record.status === "in_progress" ? "interrupted" : record.status!, step: record.step };
      }
    }
  } catch { /* Keep corrupt/unknown data intact until an explicit tour choice replaces it. */ }
  return interrupted();
}

/** Device-only, separate from Welcome, identity, drafts, appearance and backend data. */
export function createWalkthroughStore(storage: WalkthroughStorage) {
  let state: WalkthroughSnapshot = {
    ready: false, record: null, active: false, step: 0, busy: false,
    invitationEligible: false, storageError: "",
  };
  const listeners = new Set<() => void>();
  let restoration: Promise<void> | undefined;
  let pending: Promise<unknown> = Promise.resolve();
  let queued = 0;
  let presentation = 0;
  let invitationSuppressed = false;
  const update = (next: Partial<WalkthroughSnapshot>) => {
    const value = { ...state, ...next };
    value.invitationEligible = value.ready && !value.record && !value.busy && !invitationSuppressed && !value.storageError;
    if ((Object.keys(value) as (keyof WalkthroughSnapshot)[]).every((key) => value[key] === state[key])) return;
    state = value;
    listeners.forEach((listener) => listener());
  };
  const suppressInvitation = () => { invitationSuppressed = true; update({}); };
  const restore = () => {
    if (restoration) return restoration;
    restoration = Promise.resolve().then(() => storage.getItem(WALKTHROUGH_KEY)).then((saved) => {
      update({ record: decode(saved), ready: true });
    }).catch(() => {
      // An unreadable preference must not interrupt a returning user's task.
      update({ record: interrupted(), ready: true, storageError: "Tour preferences could not be restored. You can try again from Help." });
    });
    return restoration;
  };
  const run = (operation: () => Promise<boolean>) => {
    queued++;
    update({ busy: true });
    const next = pending.catch(() => undefined).then(async () => {
      await restore();
      try { return await operation(); }
      catch {
        update({ storageError: "Your tour choice could not be saved on this device. Try again, or close the tour." });
        return false;
      }
    });
    pending = next;
    return next.finally(() => { queued--; update({ busy: queued > 0 }); });
  };
  const persist = async (record: WalkthroughRecord) => {
    await storage.setItem(WALKTHROUGH_KEY, JSON.stringify(record));
    update({ record, storageError: "" });
  };
  const move = (direction: -1 | 1) => {
    if (!state.active || state.busy) return Promise.resolve(false);
    const step = state.step + direction;
    if (step < 0 || step >= WALKTHROUGH_STEPS) return Promise.resolve(false);
    const currentPresentation = presentation;
    return run(async () => {
      if (!state.active || currentPresentation !== presentation) return false;
      // A replay cannot undo the user's earlier completed/skipped preference.
      if (!terminal(state.record)) await persist({ version: 1, status: "in_progress", step });
      if (!state.active || currentPresentation !== presentation) return false;
      update({ step });
      return true;
    });
  };
  const close = (status: "skipped" | "interrupted") => {
    presentation++;
    suppressInvitation();
    // Dismissal releases the modal immediately, even with slow or failed storage.
    const step = state.step;
    update({ active: false, step: 0 });
    return run(async () => {
      if (!terminal(state.record)) await persist({ version: 1, status, step });
      return true;
    });
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    restore,
    offer: () => {
      suppressInvitation();
      return run(async () => {
        if (state.record) return false;
        await persist({ version: 1, status: "offered", step: 0 });
        return true;
      });
    },
    start: ({ replay = false }: { replay?: boolean } = {}) => {
      if (state.active || state.busy) return Promise.resolve(false);
      suppressInvitation();
      const currentPresentation = ++presentation;
      return run(async () => {
        if (currentPresentation !== presentation || (!replay && state.record?.status !== "offered")) return false;
        if (!terminal(state.record)) await persist({ version: 1, status: "in_progress", step: 0 });
        if (currentPresentation !== presentation) return false;
        update({ active: true, step: 0, storageError: "" });
        return true;
      });
    },
    next: () => move(1),
    back: () => move(-1),
    complete: () => {
      if (!state.active || state.busy || state.step !== WALKTHROUGH_STEPS - 1) return Promise.resolve(false);
      const currentPresentation = presentation;
      return run(async () => {
        if (currentPresentation !== presentation || !state.active) return false;
        if (state.record?.status !== "completed") await persist({ version: 1, status: "completed", step: WALKTHROUGH_STEPS - 1 });
        if (currentPresentation !== presentation) return false;
        update({ active: false, step: 0, storageError: "" });
        return true;
      });
    },
    dismiss: () => close("skipped"),
    interrupt: () => close("interrupted"),
  };
}
