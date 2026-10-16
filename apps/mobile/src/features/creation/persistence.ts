import { campaignBody, LocalDraft } from "./model";
import { Campaign } from "../../lib/types";

export type LocalSaveState = { token: string; phase: "saving" | "saved" | "failed" } | null;
export type AccountSaveState = "idle" | "saving" | "failed";

export function accountDraftToken(entry: LocalDraft): string {
  return JSON.stringify({ id: entry.draft.id, body: campaignBody(entry.draft, entry.step) });
}

export function localDraftToken(entry: LocalDraft): string {
  return JSON.stringify({ localId: entry.localId, draft: entry.draft, step: entry.step, goalInput: entry.goalInput, assistance: entry.assistance, entryMode: entry.entryMode, accountSavedToken: entry.accountSavedToken });
}

/** Preserve any edits made while the older snapshot was being written to the account. */
export function mergeAccountSaved<T extends LocalDraft>(snapshot: T, current: T | null, saved: Campaign): T | null {
  if (!current || current.localId !== snapshot.localId) return null;
  const unchanged = localDraftToken(current) === localDraftToken(snapshot);
  return {
    ...current,
    draft: unchanged ? saved : { ...saved, ...campaignBody(current.draft, current.step), version: saved.version, step: current.step },
    accountSavedToken: accountDraftToken({ ...snapshot, draft: saved }),
    updatedAt: new Date().toISOString(),
  };
}

/** A late result may describe an older draft, so only its exact current snapshot gets feedback. */
export async function writeLocalSnapshot(
  entry: LocalDraft,
  persist: (entry: LocalDraft) => Promise<void>,
  isCurrent: () => boolean,
  update: (state: NonNullable<LocalSaveState>) => void,
): Promise<void> {
  const token = localDraftToken(entry);
  if (isCurrent()) update({ token, phase: "saving" });
  try {
    await persist(entry);
    if (isCurrent()) update({ token, phase: "saved" });
  } catch (error) {
    if (isCurrent()) update({ token, phase: "failed" });
    throw error;
  }
}

export function draftSaveLabel(entry: LocalDraft, local: LocalSaveState, account: AccountSaveState, signedIn: boolean): string {
  const current = local?.token === localDraftToken(entry);
  if (current && local.phase === "failed") return "Device save failed · keep this draft open";
  if (!current) return "Unsaved changes";
  if (local.phase === "saving") return "Saving on this device…";
  if (account === "saving") return "Saved on device · syncing account…";
  if (account === "failed") return "Saved on device · account sync failed";
  if (signedIn && entry.accountSavedToken === accountDraftToken(entry)) return "Saved on device and account";
  return signedIn ? "Saved on device · account copy needs saving" : "Saved on this device";
}
