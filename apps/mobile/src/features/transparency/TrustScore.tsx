import { View, useWindowDimensions } from "react-native";
import Shield from "lucide-react-native/icons/shield";
import { Button, fonts, Text, useTheme } from "../../components/ui";
import { assessmentDisclaimer, assessmentPresentation, PublicAssessment } from "../../lib/assessments";

export function TrustScore({ data, loading, error, onRetry, onOpen, compact = false }: {
  data?: PublicAssessment; loading: boolean; error: boolean; onRetry: () => void; onOpen?: () => void; compact?: boolean;
}) {
  const { colors } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const state = data && !error ? assessmentPresentation(data) : {
    title: "Campaign assessment", label: loading ? "Loading assessment…" : "Assessment unavailable", score: null, demo: false,
  };
  const size = Math.min(216, Math.max(164, width - 154));
  const enlarged = fontScale > 1.2;
  if (compact) return <View testID="trust-score-summary" style={{ gap: 5, paddingBottom: 9 }}>
    <View style={{ flexDirection: fontScale > 1.6 ? "column" : "row", gap: 12, alignItems: fontScale > 1.6 ? "flex-start" : "center" }}>
      <View style={{ width: enlarged ? 48 : 74, height: enlarged ? 54 : 80, alignItems: "center", justifyContent: "center" }}>
        <Shield size={enlarged ? 46 : 74} strokeWidth={1.3} color={colors.primary} accessible={false} />
        {!enlarged && state.score !== null && <Text testID="assessment-summary-score" accessibilityLabel={`${state.score} out of 100 rubric points`} style={{ position: "absolute", fontFamily: fonts.bold, fontSize: 25, lineHeight: 33, fontVariant: ["tabular-nums"], color: colors.ink }}>{state.score}</Text>}
      </View>
      <View style={{ flex: fontScale > 1.6 ? undefined : 1, minWidth: 0, gap: 4 }}>
        {enlarged && state.score !== null && <Text testID="assessment-summary-score" accessibilityLabel={`${state.score} out of 100 rubric points`} style={{ fontFamily: fonts.bold, fontSize: 23, lineHeight: 31, color: colors.ink }}>{state.score}/100</Text>}
        <Text accessibilityLabel={state.score !== null ? `${state.score}/100 · ${state.label}` : state.label} style={{ color: colors.ink, fontFamily: fonts.bold, fontSize: 14, lineHeight: 21 }}>{state.label}</Text>
        <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17 }}>{state.demo ? "Illustrative assessment · Demo campaign. Not independent verification of the claims." : `${state.title}. ${assessmentDisclaimer}`}</Text>
      </View>
    </View>
    {error && <Button title="Retry assessment" variant="secondary" onPress={onRetry} />}
  </View>;
  return <View testID="trust-score" style={{ paddingHorizontal: 14, paddingVertical: 16, borderRadius: 14, backgroundColor: colors.mint, gap: 9, alignItems: "center" }}>
    <Text accessibilityRole="header" style={{ fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.ink, textAlign: "center" }}>{state.title}</Text>
    <View style={{ width: "100%", alignItems: "center", gap: 8 }}>
      <View style={{ width: size, height: enlarged ? 64 : size, alignItems: "center", justifyContent: "center" }}>
        <Shield size={enlarged ? 56 : size} strokeWidth={enlarged ? 1.2 : 0.8} color={colors.primary} accessible={false} />
        {!enlarged && <View style={{ position: "absolute", top: size * 0.24, left: size * 0.16, right: size * 0.16, alignItems: "center", gap: 1 }}>
          {state.score !== null && <Text testID="assessment-score" accessibilityLabel={`${state.score} out of 100 rubric points`} style={{ fontFamily: fonts.bold, fontSize: 56, lineHeight: 64, fontVariant: ["tabular-nums"], color: colors.ink }}>{state.score}</Text>}
          <Text accessibilityLabel={state.label} style={{ maxWidth: 82, fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, textAlign: "center", color: colors.primary }}>{state.label.replace(" review coverage", " review")}</Text>
        </View>}
      </View>
      {enlarged && <View style={{ alignItems: "center", gap: 6 }}>
        {state.score !== null && <Text testID="assessment-score" accessibilityLabel={`${state.score} out of 100 rubric points`} style={{ fontFamily: fonts.bold, fontSize: 40, lineHeight: 52, color: colors.ink }}>{state.score}</Text>}
        <Text style={{ fontFamily: fonts.semibold, fontSize: 15, lineHeight: 23, textAlign: "center", color: colors.primary }}>{state.label}</Text>
      </View>}
    </View>
    {state.demo && <Text testID="demo-assessment-label" style={{ color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center" }}>Illustrative assessment · Demo campaign. Not independent verification of the claims.</Text>}
    {error && <Button title="Retry assessment" variant="secondary" onPress={onRetry} />}
    {!loading && !error && data && onOpen && <Button title="See how we reviewed the campaign" icon="arrow-forward" variant="ghost" onPress={onOpen} style={{ alignSelf: "stretch", paddingHorizontal: 0 }} />}
    {data?.state === "superseded" && <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted, textAlign: "center" }}>The published content changed. Earlier scores are history, not a review of this version.</Text>}
    {!state.demo && <Text style={{ fontSize: 11, lineHeight: 17, textAlign: "center", color: colors.muted }}>{assessmentDisclaimer}</Text>}
  </View>;
}
