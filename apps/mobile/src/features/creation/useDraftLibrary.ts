import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalDraft } from "./model";
import { draftStorageKey } from "../../lib/api";
import { addDeletionMarkers, DraftDeletionMarkers, DraftDeletionTarget, emptyDeletionMarkers, isDeletedDraft, matchesDeletion, parseDeletionMarkers } from "./draftDeletion";

type LibraryState = { scope: string; entries: LocalDraft[]; markers: DraftDeletionMarkers; pending: DraftDeletionTarget[] };
export function useDraftLibrary(scope: string, ready: boolean) {
  const [entries, setEntries] = useState<LocalDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const state = useRef<LibraryState>({ scope, entries: [], markers: emptyDeletionMarkers(), pending: [] });
  const currentScope = useRef(scope);
  const queue = useRef(Promise.resolve());
  const key = draftStorageKey(scope), markerKey = `${key}:deletions-v1`;
  currentScope.current = scope;

  useEffect(() => {
    let active = true;
    const loaded: LibraryState = { scope, entries: [], markers: emptyDeletionMarkers(), pending: [] };
    state.current = loaded;
    setEntries([]); setLoading(true); setError("");
    if (!ready) return;
    Promise.all([AsyncStorage.getItem(key), AsyncStorage.getItem(markerKey)])
      .then(([raw, deleted]) => {
        if (!active) return;
        const saved = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(saved)) throw new Error("Saved draft data has an unexpected format.");
        loaded.markers = parseDeletionMarkers(deleted);
        loaded.entries = saved.filter((entry: LocalDraft) => entry?.localId && entry.draft && Array.isArray(entry.draft.sections) && Array.isArray(entry.draft.sources) && !isDeletedDraft(entry, loaded.markers));
        setEntries(loaded.entries);
      })
      .catch(() => {
        if (active) setError("Drafts on this device could not be read. Retry before creating new work so saved drafts stay protected.");
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [key, markerKey, ready, reload, scope]);

  const persist = useCallback((next: LocalDraft[]) => {
    const captured = state.current;
    if (captured.scope !== scope || currentScope.current !== scope) return Promise.reject(new Error("The draft workspace changed. Reopen it before saving."));
    captured.entries = next.filter(entry => !isDeletedDraft(entry, captured.markers));
    setEntries(captured.entries);
    const snapshot = captured.entries;
    const pending = queue.current.catch(() => undefined).then(() => AsyncStorage.setItem(key, JSON.stringify(snapshot.filter(entry => !isDeletedDraft(entry, captured.markers)))));
    queue.current = pending;
    return pending.then(() => { if (currentScope.current === scope) setError(""); }).catch(error => {
      if (currentScope.current === scope) setError("This device could not save your latest edits. Keep this screen open and retry Save as Draft.");
      throw error;
    });
  }, [key, scope]);

  const canSave = useCallback((entry: LocalDraft) => state.current.scope === scope && currentScope.current === scope && !isDeletedDraft(entry, state.current.markers) && !state.current.pending.some(target => matchesDeletion(entry, target)), [scope]);
  const save = useCallback((entry: LocalDraft) => {
    if (!canSave(entry)) return Promise.reject(new Error("This draft was deleted or is being deleted. Its old autosave was ignored."));
    return persist([entry, ...state.current.entries.filter(value => value.localId !== entry.localId)]);
  }, [canSave, persist]);
  // Submission cleanup is deliberately separate from confirmed destructive deletion.
  const remove = useCallback((id: string) => persist(state.current.entries.filter(value => value.localId !== id)), [persist]);
  const deleteDraft = useCallback(async (target: DraftDeletionTarget, deleteAccount?: () => Promise<void>) => {
    const captured = state.current;
    if (target.scope !== scope || captured.scope !== scope || currentScope.current !== scope) throw new Error("The draft workspace changed. Nothing was deleted.");
    if (!target.localId && !target.campaignId) throw new Error("This draft has no deletion identifier.");
    if (target.campaignId && !deleteAccount) throw new Error("Account deletion requires a confirmed server operation.");
    if (captured.pending.some(value => value.campaignId === target.campaignId && value.localId === target.localId)) throw new Error("Draft deletion is already pending.");
    captured.pending.push(target); // Immediately blocks delayed local/autosave callbacks.
    try {
      await queue.current.catch(() => undefined);
      if (deleteAccount) await deleteAccount(); // Failure preserves every local copy; never queue a deletion offline.
      const operation = queue.current.catch(() => undefined).then(async () => {
        const markers = addDeletionMarkers(captured.markers, target, captured.entries);
        // Markers commit first: interruption cannot resurrect the old array.
        await AsyncStorage.setItem(markerKey, JSON.stringify(markers));
        captured.markers = markers;
        captured.entries = captured.entries.filter(entry => !isDeletedDraft(entry, markers));
        if (currentScope.current === scope && state.current === captured) setEntries(captured.entries);
        await AsyncStorage.setItem(key, JSON.stringify(captured.entries));
      });
      queue.current = operation;
      await operation;
      if (currentScope.current === scope) setError("");
    } finally {
      captured.pending = captured.pending.filter(value => value !== target);
    }
  }, [key, markerKey, scope]);
  const claimGuest = useCallback(async (entry: LocalDraft) => {
    if (scope === "guest") return;
    await save(entry);
    const guestKey = draftStorageKey("guest");
    const raw = await AsyncStorage.getItem(guestKey);
    const guestEntries: LocalDraft[] = raw ? JSON.parse(raw) : [];
    await AsyncStorage.setItem(guestKey, JSON.stringify(guestEntries.filter(value => value.localId !== entry.localId)));
  }, [save, scope]);
  return { entries, loading, error, save, remove, canSave, deleteDraft, claimGuest, retry: () => { if (!state.current.pending.length) setReload(value => value + 1); } };
}
