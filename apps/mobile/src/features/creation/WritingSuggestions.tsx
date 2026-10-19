import React, { useState } from "react";
import { AccessibilityInfo, Pressable, ScrollView, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, useTheme } from "../../components/ui";
import type { Campaign } from "../../lib/types";
import {
  applyWritingSuggestion,
  dismissWritingSuggestion,
  visibleWritingSuggestions,
  WritingDismissals,
  WritingStep,
  WritingSuggestion,
  WritingTarget,
} from "./suggestions";

/** Keep this hook in the editor so dismissals survive step navigation. */
export function useWritingSuggestionDismissals(draftKey: string) {
  const [dismissed, setDismissed] = useState<WritingDismissals>({ draftKey, ids: [] });
  return {
    dismissed,
    onDismiss: (id: string) => setDismissed(previous => dismissWritingSuggestion(previous, draftKey, id)),
  };
}

export function WritingSuggestions({ draft, step, draftKey, dismissed, onDismiss, onApply, onNavigate, disabled = false }: {
  draft: Campaign;
  step: WritingStep;
  draftKey: string;
  dismissed: WritingDismissals;
  onDismiss: (id: string) => void;
  onApply: (patch: Partial<Campaign>) => void;
  onNavigate: (target: WritingTarget) => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState<string | null>(null);
  const suggestions = visibleWritingSuggestions(draft, step, draftKey, dismissed);
  if (!suggestions.length || disabled) return null;
  const act = (suggestion: WritingSuggestion) => {
    const patch = applyWritingSuggestion(draft, suggestion);
    if (patch) {
      onApply(patch);
      setExpanded(null);
      AccessibilityInfo.announceForAccessibility("Suggestion applied. You can edit the text in your draft.");
    } else {
      onNavigate(suggestion.target);
    }
  };
  return <View testID={`creation-writing-suggestions-${step}`} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.paper, overflow: "hidden" }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 11 }}>
      <Ionicons name="bulb-outline" size={18} color={colors.green} />
      <Text accessibilityRole="header" style={{ flex: 1, fontSize: 13, lineHeight: 19, fontWeight: "700" }}>Writing suggestions</Text>
      <Text style={{ fontSize: 11, lineHeight: 16, color: colors.green }}>{suggestions.length}</Text>
    </View>
    {suggestions.map(suggestion => {
      const open = expanded === `${draftKey}:${suggestion.id}`;
      return <View key={suggestion.id} style={{ borderTopWidth: 1, borderTopColor: colors.line }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable accessibilityRole="button" accessibilityLabel={suggestion.title} accessibilityHint="Show this optional writing suggestion." accessibilityState={{ expanded: open }} onPress={() => setExpanded(open ? null : `${draftKey}:${suggestion.id}`)} style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 48, paddingLeft: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 8, opacity: pressed ? 0.65 : 1 })}>
            <Text style={{ flex: 1, fontSize: 12, lineHeight: 18, fontWeight: "600" }}>{suggestion.title}</Text>
            <Ionicons name={open ? "chevron-up" : "chevron-down"} size={15} color={colors.muted} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Dismiss suggestion: ${suggestion.title}`} onPress={() => { onDismiss(suggestion.id); setExpanded(null); AccessibilityInfo.announceForAccessibility("Writing suggestion dismissed."); }} style={({ pressed }) => ({ width: 48, minHeight: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.65 : 1 })}>
            <Ionicons name="close" size={17} color={colors.muted} />
          </Pressable>
        </View>
        {open && <View style={{ gap: 10, paddingHorizontal: 12, paddingBottom: 12 }}>
          <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>{suggestion.detail}</Text>
          {!!suggestion.preview && <ScrollView nestedScrollEnabled style={{ maxHeight: 160, borderRadius: 9, backgroundColor: colors.subtle }} contentContainerStyle={{ padding: 10 }} accessibilityLabel="Proposed text"><Text style={{ fontSize: 12, lineHeight: 19 }}>{suggestion.preview}</Text></ScrollView>}
          <Pressable accessibilityRole="button" accessibilityLabel={suggestion.action} onPress={() => act(suggestion)} style={({ pressed }) => ({ minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 24, paddingVertical: 11, paddingHorizontal: 15, backgroundColor: colors.green, opacity: pressed ? 0.75 : 1 })}><Text style={{ color: colors.onPrimary, fontWeight: "700", fontSize: 12, lineHeight: 18, textAlign: "center" }}>{suggestion.action}</Text></Pressable>
        </View>}
      </View>;
    })}
    <Text style={{ fontSize: 10, lineHeight: 15, color: colors.muted, paddingHorizontal: 12, paddingBottom: 10, paddingTop: 5 }}>Optional · rule-based · no AI service</Text>
  </View>;
}
