type SessionStorage = {
  set: (value: string) => Promise<void>;
  remove: () => Promise<void>;
};

/** Serialize saved-session changes and publish identity only after storage wins. */
export function createSessionWriter(storage: SessionStorage) {
  let pending: Promise<unknown> = Promise.resolve();
  return (
    value: string | null,
    current: () => boolean = () => true,
    commit: () => void = () => undefined,
  ) => {
    const next = pending.catch(() => undefined).then(async () => {
      if (!current()) return false;
      await (value === null ? storage.remove() : storage.set(value));
      if (!current()) {
        // A later account/logout superseded an in-flight save. Clean this
        // write before the next queued transaction can store a newer identity.
        await storage.remove();
        return false;
      }
      commit();
      return true;
    });
    pending = next;
    return next;
  };
}
