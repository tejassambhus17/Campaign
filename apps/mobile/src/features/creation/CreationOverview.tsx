import React from "react";
import { View } from "react-native";
import { Text, useTheme } from "../../components/ui";
import { STEPS } from "./model";

const descriptions = [
  "Give your campaign a clear identity.",
  "Share your purpose and key message.",
  "Add a cover and advertising images.",
  "Choose your audience and see an estimate.",
  "Set your goal and send for review.",
];

/** Informational overview only: opening Create must never start a draft. */
export function CreationOverview() {
  const { colors } = useTheme();
  return <View accessibilityLabel="Five campaign creation steps" style={{ paddingVertical: 2 }}>
    {STEPS.map((title, index) => <View key={title} style={{ flexDirection: "row", gap: 12 }}>
      <View style={{ width: 28, alignItems: "center" }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: index === 0 ? colors.progress : colors.subtle }}>
          <Text style={{ fontSize: 13, lineHeight: 18, fontWeight: "700", color: index === 0 ? colors.onPrimary : colors.ink }}>{index + 1}</Text>
        </View>
        {index < STEPS.length - 1 && <View style={{ flex: 1, width: 1, minHeight: 16, backgroundColor: index === 0 ? colors.progress : colors.line, marginVertical: 3 }} />}
      </View>
      <View style={{ flex: 1, gap: 2, paddingTop: 1, paddingBottom: index < STEPS.length - 1 ? 12 : 0 }}>
        <Text accessibilityRole="header" style={{ fontSize: 13, lineHeight: 18, fontWeight: "700", color: colors.ink }}>{title}</Text>
        <Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>{descriptions[index]}</Text>
      </View>
    </View>)}
  </View>;
}
