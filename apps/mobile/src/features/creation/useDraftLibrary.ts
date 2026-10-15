import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalDraft } from "./model";

export function useDraftLibrary(scope: string, ready: boolean) {
  const [entries, setEntries] = useState<LocalDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const entriesRef = useRef<LocalDraft[]>([]);
  const currentScope = useRef(scope);
  const queue = useRef(Promise.resolve());
  const key = `campaign-creation-v1:${scope}`;
  currentScope.current = scope;

  useEffect(() => {
    let active = true;
    entriesRef.current = [];
    setEntries([]);
    setLoading(true);
    setError("");
    if (!ready) return;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (!active) return;
        const saved = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(saved))
          throw new Error("Saved draft data has an unexpected format.");
        const valid = saved.filter(
          (entry: LocalDraft) =>
            entry?.localId &&
            entry.draft &&
            Array.isArray(entry.draft.sections) &&
            Array.isArray(entry.draft.sources),
        );
        entriesRef.current = valid;
        setEntries(valid);
      })
      .catch(() => {
        if (active)
          setError(
            "Drafts on this device could not be read. Retry before creating new work so saved drafts stay protected.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [key, ready, reload]);

  const persist = useCallback(
    (next: LocalDraft[]) => {
      const operationScope = scope;
      entriesRef.current = next;
      setEntries(next);
      const encoded = JSON.stringify(next);
      const pending = queue.current
        .catch(() => undefined)
        .then(() => AsyncStorage.setItem(key, encoded));
      queue.current = pending;
      return pending
        .then(() => {
          if (currentScope.current === operationScope) setError("");
        })
        .catch((error) => {
          if (currentScope.current === operationScope)
            setError(
              "This device could not save your latest edits. Keep this screen open and retry Save as Draft.",
            );
          throw error;
        });
    },
    [key, scope],
  );

  const save = useCallback(
    (entry: LocalDraft) =>
      persist([
        entry,
        ...entriesRef.current.filter(
          (value) => value.localId !== entry.localId,
        ),
      ]),
    [persist],
  );
  const remove = useCallback(
    (id: string) =>
      persist(entriesRef.current.filter((value) => value.localId !== id)),
    [persist],
  );
  const claimGuest = useCallback(
    async (entry: LocalDraft) => {
      if (scope === "guest") return;
      await save(entry);
      // Transfer is explicit and only offered for a guest draft from this running session.
      // Remove the unowned copy after it is durably saved to the signed-in account's scope.
      const guestKey = "campaign-creation-v1:guest";
      const raw = await AsyncStorage.getItem(guestKey);
      const guestEntries: LocalDraft[] = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(
        guestKey,
        JSON.stringify(
          guestEntries.filter((value) => value.localId !== entry.localId),
        ),
      );
    },
    [save, scope],
  );
  return {
    entries,
    loading,
    error,
    save,
    remove,
    claimGuest,
    retry: () => setReload((value) => value + 1),
  };
}
