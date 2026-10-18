import React from "react";
import { Pressable, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Accordion, Text, useTheme } from "../../components/ui";
import { DraftIssue } from "./readiness";
import { STEPS } from "./model";

export function SubmissionChecklist({ issues, onSelect }: { issues: DraftIssue[]; onSelect: (issue: DraftIssue) => void }) {
  const { colors, styles } = useTheme();
  const required = issues.filter((issue) => issue.required);
  const optional = issues.filter((issue) => !issue.required);
  const row = (issue: DraftIssue) => (
    <Pressable key={issue.id} accessibilityRole="button" accessibilityLabel={`${issue.title}. ${issue.message} Open ${STEPS[issue.step]}.`} onPress={() => onSelect(issue)} style={({ pressed }) => ({ minHeight: 48, paddingVertical: 10, gap: 5, opacity: pressed ? 0.65 : 1 })}>
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Text style={[styles.body, { flex: 1, fontWeight: "600" }]}>{issue.title}</Text>
        <Text style={styles.muted}>{issue.step + 1}/5</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.green} />
      </View>
      <Text style={styles.muted}>{issue.message}</Text>
    </Pressable>
  );
  return (
    <View style={{ gap: 10, paddingVertical: 8 }}>
      <Text accessibilityLiveRegion="polite" style={{ fontSize: 13, lineHeight: 19, fontWeight: "600", color: required.length ? colors.red : colors.green }}>{required.length ? `${required.length} required ${required.length === 1 ? "item" : "items"} to complete` : "Required fields are ready for review."}</Text>
      {!!required.length && <View testID="creation-required-issues" style={{ gap: 0 }}>{required.map(row)}</View>}
      {!!optional.length && <Accordion compact title={`Optional improvements · ${optional.length}`}><Text style={styles.muted}>These suggestions do not block submission.</Text>{optional.map(row)}</Accordion>}
    </View>
  );
}
