import React from "react";
import { View } from "react-native";
import { Text, useTheme } from "../../components/ui";
import { STEPS } from "./model";

const descriptions = [
  "Give your campaign a clear identity.",
  "Share your purpose. Help people connect with your why.",
  "Bring your message to life with a cover and advertising images.",
  "Choose who should hear your message and how it travels.",
  "Almost there. Set your goal and check the details before review.",
];

/** Informational overview only: opening Create must never start a draft. */
export function CreationOverview() {
  const { colors } = useTheme();
  return <View accessibilityLabel="Five campaign creation steps" style={{ paddingVertical: 8 }}>
    {STEPS.map((title, index) => <View key={title} style={{ flexDirection: "row", gap: 14, minHeight: 76 }}>
      <View style={{ width: 34, alignItems: "center" }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: index === 0 ? colors.progress : colors.subtle }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: index === 0 ? colors.onPrimary : colors.ink }}>{index + 1}</Text>
        </View>
        {index < STEPS.length - 1 && <View style={{ flex: 1, width: 2, backgroundColor: index === 0 ? colors.progress : colors.line, marginVertical: 5 }} />}
      </View>
      <View style={{ flex: 1, gap: 4, paddingTop: index === 0 ? 9 : 3, paddingBottom: index === 0 ? 13 : 22, paddingHorizontal: index === 0 ? 12 : 0, marginLeft: index === 0 ? -12 : 0, marginBottom: index === 0 ? 14 : 0, backgroundColor: index === 0 ? colors.mint : "transparent", borderRadius: 12 }}>
        <Text accessibilityRole="header" style={{ fontSize: 15, lineHeight: 21, fontWeight: "700", color: colors.ink }}>{title}</Text>
        <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>{descriptions[index]}</Text>
      </View>
    </View>)}
  </View>;
}
