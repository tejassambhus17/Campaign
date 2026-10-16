import { StyleProp, View, ViewStyle } from "react-native";
import { Text, fonts, useTheme } from "./ui";
import { notificationBadgeLabel } from "../lib/activity";

/** The parent control announces the full count; this compact badge is visual. */
export function UnreadBadge({ count, style }: { count: number; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const label = notificationBadgeLabel(count);
  if (!label) return null;
  return <View accessible={false} importantForAccessibility="no-hide-descendants" style={[{ minWidth: 16, height: 16, paddingHorizontal: 4, borderRadius: 8, backgroundColor: colors.primary, borderColor: colors.paper, borderWidth: 1, alignItems: "center", justifyContent: "center" }, style]}>
    <Text maxFontSizeMultiplier={1.2} style={{ fontSize: 9, lineHeight: 12, fontFamily: fonts.bold, color: colors.onPrimary }}>{label}</Text>
  </View>;
}
