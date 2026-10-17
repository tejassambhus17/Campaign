import React, { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, ActivityIndicator, findNodeHandle, Modal, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme } from "../../components/ui";
import { api, ApiError } from "../../lib/api";
import { queryClient, refresh } from "../../lib/session";
import type { Campaign, Me } from "../../lib/types";
import type { LocalDraft } from "./model";
import type { useDraftLibrary } from "./useDraftLibrary";
import { accountDeletionTarget, deletionKey, DraftDeletionTarget, localDeletionTarget } from "./draftDeletion";

export function useDraftDeletion({ scope, library, disabled, onDeleted }: {
  scope: string; library: ReturnType<typeof useDraftLibrary>; disabled: boolean; onDeleted: (target: DraftDeletionTarget) => void;
}) {
  const [target, setTarget] = useState<DraftDeletionTarget | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false), scopeRef = useRef(scope), onDeletedRef = useRef(onDeleted);
  scopeRef.current = scope; onDeletedRef.current = onDeleted;
  useEffect(() => { setTarget(null); setError(""); setBusy(false); }, [scope]);
  const requestLocal = useCallback((entry: LocalDraft) => {
    if (disabled || pending.current) return;
    const next = localDeletionTarget(entry, scope);
    if (next) { setTarget(next); setError(""); }
  }, [disabled, scope]);
  const requestAccount = useCallback((campaign: Campaign) => {
    if (disabled || pending.current) return;
    const next = accountDeletionTarget(campaign, scope);
    if (next) { setTarget(next); setError(""); }
  }, [disabled, scope]);
  const cancel = useCallback(() => { if (!pending.current) { setTarget(null); setError(""); } }, []);
  const confirm = useCallback(async () => {
    if (!target || target.scope !== scope || disabled || pending.current) return;
    pending.current = true; setBusy(true); setError("");
    let accountConfirmed = false;
    try {
      await library.deleteDraft(target, target.campaignId ? async () => {
        const result = await api<{ deleted: boolean; campaignId: string; scope: string }>(`/campaigns/${encodeURIComponent(target.campaignId!)}/draft`, { method: "DELETE" });
        if (!result.deleted || result.scope !== "account" || result.campaignId !== target.campaignId) throw new Error("The server did not confirm account deletion. Device copies were kept.");
        accountConfirmed = true;
        await Promise.all([
          queryClient.cancelQueries({ queryKey: ["me", scope], exact: true }),
          queryClient.cancelQueries({ queryKey: ["campaign", target.campaignId] }),
        ]);
        queryClient.setQueryData<Me>(["me", scope], previous => previous ? { ...previous, campaigns: previous.campaigns.filter(campaign => campaign.id !== target.campaignId) } : previous);
        queryClient.removeQueries({ queryKey: ["campaign", target.campaignId] });
      } : undefined);
      if (scopeRef.current !== scope) return;
      onDeletedRef.current(target);
      setTarget(null);
      AccessibilityInfo.announceForAccessibility(target.campaignId ? "Account draft and device copies deleted." : "Device draft deleted.");
      if (target.campaignId) void refresh().catch(() => undefined);
    } catch (failure) {
      if (scopeRef.current !== scope) return;
      setError(accountConfirmed
        ? "The account draft was deleted, but device cleanup could not finish. Keep this dialog open and retry Delete draft. Uploaded media was kept."
        : failure instanceof ApiError && [404, 405].includes(failure.status)
          ? "Account deletion is unavailable on this server, or the draft no longer exists. Device copies were kept. Retry after the account service supports deletion."
          : `${failure instanceof Error ? failure.message : "Deletion could not finish."} ${target.campaignId ? "Account deletion was not confirmed; device copies were kept. Check your connection and retry." : "Retry Delete draft to finish device cleanup."}`);
    } finally {
      pending.current = false;
      if (scopeRef.current === scope) setBusy(false);
    }
  }, [disabled, library, scope, target]);
  const visibleTarget = target?.scope === scope ? target : null;
  return { target: visibleTarget, busy: !!visibleTarget && busy, busyKey: busy && visibleTarget ? deletionKey(visibleTarget) : "", error: visibleTarget ? error : "", requestLocal, requestAccount, cancel, confirm };
}
export type DraftDeletionControls = ReturnType<typeof useDraftDeletion>;

export function DraftDeleteDialog({ deletion }: { deletion: DraftDeletionControls }) {
  const { colors } = useTheme(), { height } = useWindowDimensions(), insets = useSafeAreaInsets();
  const heading = useRef<View>(null);
  const target = deletion.target;
  if (!target) return null;
  return <Modal visible transparent animationType="none" onRequestClose={deletion.cancel} onShow={() => {
    const handle = findNodeHandle(heading.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  }}>
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 22, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, backgroundColor: "rgba(0,0,0,0.65)" }}>
      <View accessibilityViewIsModal style={{ alignSelf: "center", width: "100%", maxWidth: 420, maxHeight: Math.max(160, height - insets.top - insets.bottom - 48), padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }}>
        <ScrollView contentContainerStyle={{ gap: 12 }} keyboardShouldPersistTaps="handled">
          <View ref={heading} accessible accessibilityRole="header" accessibilityLabel="Delete draft?">
            <Text style={{ fontSize: 20, lineHeight: 27, fontWeight: "700", color: colors.ink }}>Delete draft?</Text>
          </View>
          <Text style={{ fontSize: 14, lineHeight: 21, fontWeight: "700", color: colors.ink }}>{target.title}</Text>
          <Text style={{ fontSize: 13, lineHeight: 20, color: colors.muted }}>{target.campaignId
            ? "Delete this unpublished draft from your account and its corresponding copies in this device workspace. This cannot be undone. Uploaded media is kept."
            : "Delete this device-only draft from the current workspace. This cannot be undone. Account drafts and uploaded media are kept."}</Text>
          {!!deletion.error && <Text accessibilityRole="alert" style={{ fontSize: 12, lineHeight: 19, color: colors.red }}>{deletion.error}</Text>}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Cancel draft deletion" disabled={deletion.busy} onPress={deletion.cancel} style={{ minHeight: 48, minWidth: 80, paddingHorizontal: 12, justifyContent: "center", alignItems: "center", opacity: deletion.busy ? 0.45 : 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.green }}>Cancel</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Confirm delete draft" accessibilityState={{ disabled: deletion.busy, busy: deletion.busy }} disabled={deletion.busy} onPress={() => { void deletion.confirm(); }} style={{ minHeight: 48, minWidth: 108, paddingHorizontal: 12, flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center", opacity: deletion.busy ? 0.65 : 1 }}>
              {deletion.busy && <ActivityIndicator size="small" color={colors.red} />}
              <Text style={{ fontSize: 13, lineHeight: 19, fontWeight: "700", color: colors.red }}>{deletion.busy ? "Deleting…" : "Delete draft"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
