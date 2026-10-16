import { StyleSheet } from "react-native";
import { fonts, ThemeColors } from "./appearance";

export const createThemeStyles = (colors: ThemeColors) => StyleSheet.create({
  body: { fontSize: 15, lineHeight: 23, color: colors.text },
  muted: { fontSize: 14, lineHeight: 21, color: colors.muted },
  title: { fontFamily: fonts.bold, fontSize: 25, lineHeight: 32, letterSpacing: -0.5, color: colors.ink },
  h2: { fontSize: 20, lineHeight: 27, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink, letterSpacing: -0.4 },
  label: { fontSize: 12, lineHeight: 17, fontWeight: "600", color: colors.muted },
  card: { backgroundColor: colors.paper, borderRadius: 14, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: { minHeight: 52, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, borderColor: colors.outline, borderWidth: 1, fontSize: 16, color: colors.ink, backgroundColor: colors.paper, fontFamily: fonts.sans },
  error: { color: colors.red, fontSize: 14, lineHeight: 21 },
  stack: { gap: 16 },
});
