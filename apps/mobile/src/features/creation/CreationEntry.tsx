import React from "react";
import { ActivityIndicator, Pressable, useWindowDimensions, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button, Text, useTheme } from "../../components/ui";
import type { Campaign } from "../../lib/types";
import { LocalDraft, STEPS } from "./model";
import { accountDraftToken } from "./persistence";
import { CreationButton } from "./CreationUi";
import { CreationOverview } from "./CreationOverview";
import { accountDeletionTarget, localDeletionTarget } from "./draftDeletion";
import type { DraftDeletionControls } from "./DraftDeleteDialog";

const dateLabel = (date: string) => {
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? "Save time unavailable" : `Saved ${value.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
};
const stepLabel = (step: number) => {
  const index = Math.max(0, Math.min(4, Number.isFinite(step) ? Math.floor(step) : 0));
  return `Step ${index + 1} of 5 · ${STEPS[index]}`;
};

function DraftRow({ title, progress, saved, storage, onResume, onDelete, disabled }: { title: string; progress: string; saved: string; storage: string; onResume: () => void; onDelete?: () => void; disabled: boolean }) {
  const { colors } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const stacked = (Math.min(width, 640) - 60) / Math.max(1, fontScale) < 255;
  return <View style={{ flexDirection: stacked ? "column" : "row", alignItems: stacked ? "stretch" : "center", gap: stacked ? 2 : 10, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.line }}>
    <View style={{ flex: stacked ? undefined : 1, minWidth: 0, gap: 3 }}>
      <Text numberOfLines={2} style={{ fontSize: 14, lineHeight: 20, fontWeight: "700", color: colors.ink }}>{title}</Text>
      <Text style={{ fontSize: 12, lineHeight: 17, color: colors.muted }}>{progress}</Text>
      <Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>{saved}</Text>
      <Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>{storage}</Text>
    </View>
    <View style={{ alignSelf: stacked ? "flex-end" : "center", alignItems: "flex-end" }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Resume ${title}`} accessibilityState={{ disabled }} disabled={disabled} onPress={onResume} style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, opacity: disabled ? 0.45 : pressed ? 0.65 : 1 })}>
      <Text style={{ fontSize: 13, lineHeight: 19, fontWeight: "700", color: colors.green }}>Resume</Text>
      <Ionicons name="arrow-forward" size={17} color={colors.green} />
    </Pressable>
    {onDelete && <Pressable accessibilityRole="button" accessibilityLabel={`Delete draft ${title}`} accessibilityState={{ disabled }} disabled={disabled} onPress={onDelete} style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, opacity: disabled ? 0.45 : pressed ? 0.65 : 1 })}>
      <Ionicons name="trash-outline" size={14} color={colors.red} />
      <Text style={{ fontSize: 12, lineHeight: 18, fontWeight: "600", color: colors.red }}>Delete draft</Text>
    </Pressable>}
    </View>
  </View>;
}

export function CreationEntry({ signedIn, scope = "guest", deletion, localDrafts, accountDrafts, accountLoading, accountError, disabled, onManual, onGuided, onResumeLocal, onResumeAccount, onRetryAccount, children }: {
  signedIn: boolean; localDrafts: LocalDraft[]; accountDrafts: Campaign[]; accountLoading: boolean; accountError: boolean; disabled: boolean;
  onManual: () => void; onGuided: () => void; onResumeLocal: (entry: LocalDraft) => void; onResumeAccount: (id: string) => void; onRetryAccount: () => void;
  children?: React.ReactNode;
  scope?: string; deletion?: DraftDeletionControls;
}) {
  const { colors, styles } = useTheme();
  return <>
    <CreationOverview />
    <View style={{ gap: 10 }}>
      <Button title="Create Manually" onPress={onManual} disabled={disabled} />
      <Button title="Create with Your Voice" icon="mic-outline" variant="ghost" onPress={onGuided} disabled={disabled} />
      <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>Voice-guided demo · Type or use keyboard dictation. Live speech and AI are not connected.</Text>
      {!signedIn && <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>Draft as a guest. Sign in to upload, save to your account or submit.</Text>}
    </View>
    <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>Contributions fund advertising, not direct donations to the cause.</Text>
    {children}
    <View style={{ gap: 3, paddingTop: 6 }}>
      <Text accessibilityRole="header" style={styles.h2}>Saved drafts</Text>
      <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>{signedIn ? "Your private device and account workspace." : "Private to this device · Guest workspace."}</Text>
      {localDrafts.map((entry) => <DraftRow key={entry.localId} title={entry.draft.title || "Untitled campaign"} progress={stepLabel(entry.step)} saved={dateLabel(entry.updatedAt)} storage={signedIn ? entry.accountSavedToken === accountDraftToken(entry) ? "Device + account copy saved" : "On this device · Account copy needs saving" : "On this device"} disabled={disabled || !!deletion?.busy} onResume={() => onResumeLocal(entry)} onDelete={deletion && localDeletionTarget(entry, scope) ? () => deletion.requestLocal(entry) : undefined} />)}
      {accountDrafts.map((campaign) => <DraftRow key={campaign.id} title={campaign.title || "Untitled campaign"} progress={`${stepLabel(campaign.currentStep ?? campaign.step ?? 0)}${campaign.status === "Changes Requested" ? " · Changes requested" : ""}`} saved="Last saved time unavailable" storage="Account copy · Connect to resume" disabled={disabled || !!deletion?.busy} onResume={() => onResumeAccount(campaign.id)} onDelete={deletion && accountDeletionTarget(campaign, scope) ? () => deletion.requestAccount(campaign) : undefined} />)}
      {signedIn && accountLoading && <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 }}><ActivityIndicator color={colors.green} /><Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>Loading account drafts…</Text></View>}
      {signedIn && accountError && <View style={{ gap: 4, paddingTop: 8 }}>
        <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>Account drafts could not load. Device drafts are still available.</Text>
        <CreationButton title="Retry account drafts" secondary onPress={onRetryAccount} />
      </View>}
      {!localDrafts.length && !accountDrafts.length && !disabled && (!signedIn || (!accountLoading && !accountError)) && <Text style={{ fontSize: 12, lineHeight: 18, paddingVertical: 12, color: colors.muted }}>No saved drafts yet. Start above; your work saves on this device as you go.</Text>}
    </View>
    {signedIn && <Text style={{ fontSize: 12, lineHeight: 19, color: colors.muted }}>Device drafts work offline. Use Save Draft to update an account copy when connected.</Text>}
  </>;
}
