import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Picture, Text, useTheme } from "../../components/ui";
import { InfoAction } from "../../components/Information";
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

function DraftRow({ title, cover, progress, saved, storage, onResume, onDelete, disabled }: { title: string; cover?: string; progress: string; saved: string; storage: string; onResume: () => void; onDelete?: () => void; disabled: boolean }) {
  const { colors } = useTheme();
  return <View style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.paper, paddingHorizontal: 12, paddingTop: 12, marginTop: 8 }}>
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
    {!!cover && <View style={{ width: 48, borderRadius: 7, overflow: "hidden" }}><Picture uri={cover} height={48} /></View>}
    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
      <Text numberOfLines={2} style={{ fontSize: 14, lineHeight: 20, fontWeight: "700", color: colors.ink }}>{title}</Text>
      <Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>{progress} · {storage}</Text>
      <Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>{saved}</Text>
    </View>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, borderTopWidth: 1, borderColor: colors.line, marginTop: 10 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Resume ${title}`} accessibilityState={{ disabled }} disabled={disabled} onPress={onResume} style={({ pressed }) => ({ minHeight: 48, flexShrink: 1, paddingRight: 10, flexDirection: "row", alignItems: "center", gap: 6, opacity: disabled ? 0.45 : pressed ? 0.65 : 1 })}>
      <Text style={{ fontSize: 13, lineHeight: 19, fontWeight: "700", color: colors.green }}>Resume</Text>
      <Ionicons name="arrow-forward" size={17} color={colors.green} />
    </Pressable>
    {onDelete && <Pressable accessibilityRole="button" accessibilityLabel={`Delete draft ${title}`} accessibilityState={{ disabled }} disabled={disabled} onPress={onDelete} style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, opacity: disabled ? 0.45 : pressed ? 0.65 : 1 })}>
      <Ionicons name="trash-outline" size={14} color={colors.red} />
      <Text style={{ fontSize: 12, lineHeight: 18, fontWeight: "600", color: colors.red }}>Delete</Text>
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
    <Text style={{ fontSize: 13, lineHeight: 19, color: colors.muted }}>Turn your message into a campaign in five simple steps.</Text>
    <View style={{ gap: 8 }}>
      <CreationButton title="Create manually" icon="arrow-forward" onPress={onManual} disabled={disabled} />
      <CreationButton title="Guided creation · demo" icon="mic-outline" secondary onPress={onGuided} disabled={disabled} />
    </View>
    <CreationOverview />
    {children}
    <View style={{ gap: 3, paddingTop: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}><Text accessibilityRole="header" style={{ fontSize: 16, lineHeight: 22, fontWeight: "700", color: colors.ink }}>Your drafts</Text><Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>{localDrafts.length + accountDrafts.length} saved</Text></View>
      {localDrafts.map((entry) => <DraftRow key={entry.localId} title={entry.draft.title || "Untitled campaign"} cover={entry.draft.coverImage} progress={stepLabel(entry.step)} saved={dateLabel(entry.updatedAt)} storage={signedIn ? entry.accountSavedToken === accountDraftToken(entry) ? "Device + account saved" : "Device · Account save needed" : "This device · Guest"} disabled={disabled || !!deletion?.busy} onResume={() => onResumeLocal(entry)} onDelete={deletion && localDeletionTarget(entry, scope) ? () => deletion.requestLocal(entry) : undefined} />)}
      {accountDrafts.map((campaign) => <DraftRow key={campaign.id} title={campaign.title || "Untitled campaign"} cover={campaign.coverImage} progress={`${stepLabel(campaign.currentStep ?? campaign.step ?? 0)}${campaign.status === "Changes Requested" ? " · Changes requested" : ""}`} saved="Last saved time unavailable" storage="Account · Connect to resume" disabled={disabled || !!deletion?.busy} onResume={() => onResumeAccount(campaign.id)} onDelete={deletion && accountDeletionTarget(campaign, scope) ? () => deletion.requestAccount(campaign) : undefined} />)}
      {signedIn && accountLoading && <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 }}><ActivityIndicator color={colors.green} /><Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>Loading account drafts…</Text></View>}
      {signedIn && accountError && <View style={{ gap: 4, paddingTop: 8 }}>
        <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>Account drafts could not load. Device drafts are still available.</Text>
        <CreationButton title="Retry account drafts" secondary onPress={onRetryAccount} />
      </View>}
      {!localDrafts.length && !accountDrafts.length && !disabled && (!signedIn || (!accountLoading && !accountError)) && <Text style={{ fontSize: 12, lineHeight: 18, paddingVertical: 12, color: colors.muted }}>No saved drafts yet. Start above; your work saves on this device as you go.</Text>}
    </View>
    <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>Contributions fund advertising, not direct donations.</Text>
    <InfoAction title="Creation help" summary={signedIn ? "Offline drafts, account saving and guided creation" : "Guest drafts and guided creation"} icon="help-circle-outline" testID="creation-help">
      <Text style={styles.body}>Contributions fund advertising, not direct donations to the cause.</Text>
      <Text style={styles.muted}>Guided creation uses an editable template. Type or use keyboard dictation; live speech and AI are not connected.</Text>
      <Text style={styles.muted}>{signedIn ? "Device drafts work offline. Save Draft also updates your account when connected." : "Guest drafts stay on this device. Sign in to upload, save to your account or submit."}</Text>
    </InfoAction>
  </>;
}
