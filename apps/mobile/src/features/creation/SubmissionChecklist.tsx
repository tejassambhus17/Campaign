import React from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Circle } from "react-native-svg";
import { Text, useTheme } from "../../components/ui";
import { Campaign } from "../../lib/types";
import { campaignReadiness, DraftIssue } from "./readiness";
import { STEPS } from "./model";

export function SubmissionChecklist({ draft, goalInput, accepted, onSelect }: { draft: Campaign; goalInput: string; accepted: boolean; onSelect: (issue: DraftIssue) => void }) {
  const { colors } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const readiness = campaignReadiness(draft, goalInput, accepted);
  const ringSize = Math.round(72 * Math.max(1, fontScale / 1.2));
  const radius = ringSize / 2 - 7;
  const circumference = 2 * Math.PI * radius;
  return (
    <View testID="campaign-readiness" style={{ padding: 14, gap: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.paper }}>
      <Text accessibilityRole="header" style={{ fontSize: 15, lineHeight: 21, fontWeight: "700", color: colors.ink }}>Campaign readiness</Text>
      <View style={{ flexDirection: width / fontScale < 240 ? "column" : "row", alignItems: width / fontScale < 240 ? "flex-start" : "center", gap: 14 }}>
        <View accessible accessibilityRole="progressbar" accessibilityLabel="Campaign readiness checks" accessibilityValue={{ min: 0, max: readiness.total, now: readiness.completed, text: `${readiness.completed} of ${readiness.total} checks complete. ${readiness.missing} required items remaining.` }} style={{ width: ringSize, height: ringSize, alignItems: "center", justifyContent: "center" }}>
          <Svg width={ringSize} height={ringSize} style={{ position: "absolute" }} accessible={false}>
            <Circle cx={ringSize / 2} cy={ringSize / 2} r={radius} stroke={colors.progressTrack} strokeWidth={6} fill="none" />
            <Circle cx={ringSize / 2} cy={ringSize / 2} r={radius} stroke={colors.green} strokeWidth={6} fill="none" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - readiness.percent / 100)} strokeLinecap="round" rotation={-90} origin={`${ringSize / 2}, ${ringSize / 2}`} />
          </Svg>
          <Text style={{ fontSize: 17, lineHeight: 23, fontWeight: "700", color: colors.green }}>{readiness.percent}%</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text accessibilityLiveRegion="polite" style={{ fontSize: 14, lineHeight: 20, fontWeight: "700", color: colors.ink }}>{readiness.missing ? "A few things to finish" : "Ready to submit for review"}</Text>
          <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>{readiness.missing ? `${readiness.missing} required ${readiness.missing === 1 ? "item" : "items"} remaining. Tap an item to finish it.` : readiness.recommended ? "Recommendations improve your draft and do not block submission." : "All checks complete. Submission starts platform review."}</Text>
        </View>
      </View>
      <View>
        {readiness.items.map((item, index) => (
          <View key={item.id} style={{ borderTopWidth: index ? 1 : 0, borderColor: colors.line }}>
            <Pressable accessibilityRole="button" accessibilityLabel={`${item.title}. ${item.status === "complete" ? "Completed" : item.status === "missing" ? "Missing required information" : "Recommended improvement"}. ${item.summary}. Open ${STEPS[item.target.step]}.`} onPress={() => onSelect(item.target)} style={({ pressed }) => ({ minHeight: 58, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10, opacity: pressed ? 0.65 : 1 })}>
              <Ionicons name={item.status === "complete" ? "checkmark-circle" : item.status === "missing" ? "alert-circle" : "bulb-outline"} size={24} color={item.status === "complete" ? colors.green : item.status === "missing" ? colors.red : colors.warning} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 12, lineHeight: 18, fontWeight: "600", color: colors.ink }}>{item.title}</Text>
                <Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>{item.summary}</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.muted} />
            </Pressable>
            {item.issues.filter(issue => issue.required).length > 1 && item.issues.filter(issue => issue.required).map(issue => <Pressable key={issue.id} accessibilityRole="button" accessibilityLabel={`Required: ${issue.title}. ${issue.message} Open ${STEPS[issue.step]}.`} onPress={() => onSelect(issue)} style={({ pressed }) => ({ minHeight: 48, marginLeft: 34, flexDirection: "row", alignItems: "center", gap: 8, opacity: pressed ? 0.65 : 1 })}>
              <Text style={{ flex: 1, fontSize: 11, lineHeight: 16, color: colors.green }}>{issue.title}</Text><Ionicons name="arrow-forward" size={15} color={colors.green} />
            </Pressable>)}
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 10, lineHeight: 15, color: colors.muted }}>{readiness.completed}/{readiness.total} checks complete · Includes optional improvements. This is a drafting checklist, not a Trust Score or approval.</Text>
    </View>
  );
}
