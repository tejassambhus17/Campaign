import { View, useWindowDimensions } from "react-native";
import Shield from "lucide-react-native/icons/shield";
import { Button, fonts, Text, useTheme } from "../../components/ui";
import { assessmentDisclaimer, assessmentPresentation, PublicAssessment } from "../../lib/assessments";

export function TrustScore({ data, loading, error, onRetry, onOpen }: {
  data?: PublicAssessment; loading: boolean; error: boolean; onRetry: () => void; onOpen?: () => void;
}) {
  const { colors } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const state = data && !error ? assessmentPresentation(data) : {
    title: "Campaign assessment", label: loading ? "Loading assessment…" : "Assessment unavailable", score: null, demo: false,
  };
  const size = Math.min(220, Math.max(180, width - 132));
  const enlarged = fontScale > 1.2;
  return <View testID="trust-score" style={{ paddingHorizontal: 16, paddingVertical: 22, borderRadius: 16, backgroundColor: colors.mint, borderWidth: 1, borderColor: colors.line, gap: 12, alignItems: "center" }}>
    <Text accessibilityRole="header" style={{ fontFamily: fonts.bold, fontSize: 17, lineHeight: 25, color: colors.ink, textAlign: "center" }}>{state.title}</Text>
    {state.demo && <Text testID="demo-assessment-label" style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: 12, lineHeight: 18, textAlign: "center" }}>Demo assessment · illustrative</Text>}
    <View style={{ width: "100%", alignItems: "center", gap: 8 }}>
      <View style={{ width: size, height: enlarged ? 64 : size, alignItems: "center", justifyContent: "center" }}>
        <Shield size={enlarged ? 56 : size} strokeWidth={enlarged ? 1.2 : 0.32} color={colors.primary} accessible={false} />
        {!enlarged && <View style={{ position: "absolute", top: size * 0.27, left: size * 0.12, right: size * 0.12, alignItems: "center", gap: 4 }}>
          {state.score !== null && <Text testID="assessment-score" accessibilityLabel={`${state.score} out of 100 rubric points`} style={{ fontFamily: fonts.bold, fontSize: 52, lineHeight: 64, fontVariant: ["tabular-nums"], color: colors.ink }}>{state.score}</Text>}
          <Text style={{ maxWidth: 112, fontFamily: fonts.semibold, fontSize: 13, lineHeight: 19, textAlign: "center", color: colors.primary }}>{state.label}</Text>
        </View>}
      </View>
      {enlarged && <View style={{ alignItems: "center", gap: 6 }}>
        {state.score !== null && <Text testID="assessment-score" accessibilityLabel={`${state.score} out of 100 rubric points`} style={{ fontFamily: fonts.bold, fontSize: 40, lineHeight: 52, color: colors.ink }}>{state.score}</Text>}
        <Text style={{ fontFamily: fonts.semibold, fontSize: 15, lineHeight: 23, textAlign: "center", color: colors.primary }}>{state.label}</Text>
      </View>}
    </View>
    {error && <Button title="Retry assessment" variant="secondary" onPress={onRetry} />}
    {!loading && !error && data && onOpen && <Button title="See how we reviewed the campaign" variant="ghost" onPress={onOpen} style={{ alignSelf: "stretch", paddingHorizontal: 0 }} />}
    {data?.state === "superseded" && <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted, textAlign: "center" }}>The published content changed. Earlier scores are history, not a review of this version.</Text>}
    <Text style={{ fontSize: 11, lineHeight: 17, textAlign: "center", color: colors.muted }}>{assessmentDisclaimer}</Text>
  </View>;
}
