import type { QueryClient } from "@tanstack/react-query";
import type { Notification } from "../../lib/types";

export type NotificationReadState = {
  pendingIds: ReadonlySet<string>;
  markingAll: boolean;
  error: string;
};
type ReadResult = { status: "saved" | "skipped" | "stale" } | { status: "failed"; message: string };
type ReadJob = { id: string; finish: (result: ReadResult) => void };
type Dependencies = {
  client: QueryClient;
  userId: string;
  isCurrent: () => boolean;
  requestRead: (id: string) => Promise<unknown>;
};

// These are request-coordination details only. Notification records/read counts
// continue to live exclusively in the existing recipient-scoped Query cache.
export const NOTIFICATION_READ_CONCURRENCY = 3;
const emptyState: NotificationReadState = { pendingIds: new Set(), markingAll: false, error: "" };

export function createNotificationActions({ client, userId, isCurrent, requestRead }: Dependencies) {
  const key = ["activity", userId];
  let state = emptyState;
  const listeners = new Set<() => void>();
  const requests = new Map<string, Promise<ReadResult>>();
  const queue: ReadJob[] = [];
  let active = 0;
  let allRequest: Promise<void> | undefined;
  const items = () => client.getQueryData<Notification[]>(key);
  function update(patch: Partial<NotificationReadState>) {
    state = { ...state, ...patch };
    if (isCurrent()) listeners.forEach((listener) => listener());
  }
  function finish(job: ReadJob, result: ReadResult) {
    requests.delete(job.id);
    const next = new Set(state.pendingIds);
    next.delete(job.id);
    update({ pendingIds: next });
    job.finish(result);
  }
  function pump() {
    while (active < NOTIFICATION_READ_CONCURRENCY && queue.length) {
      const job = queue.shift()!;
      if (!isCurrent()) {
        finish(job, { status: "stale" });
        continue;
      }
      const item = items()?.find((entry) => entry.id === job.id);
      if (!item || item.read) {
        finish(job, { status: "skipped" });
        continue;
      }
      active += 1;
      void (async () => {
        let result: ReadResult;
        try {
          if (!isCurrent()) result = { status: "stale" };
          else {
            await requestRead(job.id);
            if (!isCurrent()) result = { status: "stale" };
            else {
              // setQueriesData updates existing queries only. An operation that
              // outlives sign-out/removal must never recreate private data.
              client.setQueriesData<Notification[]>(
                { queryKey: key, exact: true },
                (current) => current?.map((entry) => entry.id === job.id ? { ...entry, read: true } : entry),
              );
              result = { status: "saved" };
            }
          }
        } catch (error) {
          result = isCurrent()
            ? { status: "failed", message: error instanceof Error ? error.message : "Please check your connection and retry." }
            : { status: "stale" };
        }
        active -= 1;
        finish(job, result);
        pump();
      })();
    }
  }
  function readOne(id: string): Promise<ReadResult> {
    if (!isCurrent()) return Promise.resolve({ status: "stale" });
    const existing = requests.get(id);
    if (existing) return existing;
    const item = items()?.find((entry) => entry.id === id);
    if (!item || item.read) return Promise.resolve({ status: "skipped" });
    let finishRequest!: (result: ReadResult) => void;
    const request = new Promise<ReadResult>((resolve) => { finishRequest = resolve; });
    requests.set(id, request);
    update({ pendingIds: new Set([...state.pendingIds, id]) });
    queue.push({ id, finish: finishRequest });
    pump();
    return request;
  }
  return {
    isCurrent,
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    clearError: () => { if (isCurrent()) update({ error: "" }); },
    markRead: async (item: Notification) => {
      if (!isCurrent()) return;
      update({ error: "" });
      const result = await readOne(item.id);
      if (isCurrent() && result.status === "failed") update({ error: "This update is still unread. Refresh and try again." });
    },
    markAllRead: (): Promise<void> => {
      if (!isCurrent()) return Promise.resolve();
      if (allRequest) return allRequest;
      // Capture once: notifications arriving during this operation remain unread.
      const ids = [...new Set(items()?.filter((item) => !item.read).map((item) => item.id))];
      if (!ids.length) return Promise.resolve();
      update({ markingAll: true, error: "" });
      allRequest = Promise.all(ids.map(readOne)).then((results) => {
        if (!isCurrent()) return;
        const failures = results.filter((result): result is Extract<ReadResult, { status: "failed" }> => result.status === "failed");
        if (failures.length) update({ error: `${failures.length} ${failures.length === 1 ? "update is" : "updates are"} still unread. Saved changes are kept. Refresh and try again.` });
      }).finally(() => {
        allRequest = undefined;
        update({ markingAll: false });
      });
      return allRequest;
    },
  };
}

type Actions = ReturnType<typeof createNotificationActions>;
const coordinators = new WeakMap<QueryClient, { userId: string; actions: Actions }>();
const guestActions: Actions = {
  isCurrent: () => false,
  getSnapshot: () => emptyState,
  subscribe: () => () => undefined,
  clearError: () => undefined,
  markRead: async () => undefined,
  markAllRead: async () => undefined,
};

// Sheet and Activity observers receive the very same in-flight actions/state.
// The API's session epoch also invalidates reauthentication to the same account.
export function notificationActionsFor(
  client: QueryClient,
  userId: string | undefined,
  captureSession: () => () => boolean,
  requestRead: Dependencies["requestRead"],
) {
  if (!userId) return guestActions;
  const previous = coordinators.get(client);
  if (previous?.userId === userId && previous.actions.isCurrent()) return previous.actions;
  const actions = createNotificationActions({ client, userId, isCurrent: captureSession(), requestRead });
  coordinators.set(client, { userId, actions });
  return actions;
}
