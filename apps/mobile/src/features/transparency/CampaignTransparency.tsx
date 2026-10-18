import { View } from "react-native";
import { router } from "expo-router";
import { fonts, Text, useTheme } from "../../components/ui";
import { SummaryLink } from "../../components/Information";
import { useCurrency } from "../../lib/CurrencyProvider";
import { Campaign, Config, estimate, number } from "../../lib/types";
import { assessmentMatchesCampaign, assessmentPresentation, PublicAssessment } from "../../lib/assessments";
import { TrustScore } from "./TrustScore";

export function CampaignTransparency({ campaign, config, assessment, loading, error, retry }: {
  campaign: Campaign; config?: Config; assessment?: PublicAssessment; loading: boolean; error: boolean; retry: () => void;
}) {
  const { colors } = useTheme();
  const { money } = useCurrency();
  const matches = assessmentMatchesCampaign(campaign, assessment);
  const current = matches ? assessment : undefined;
  const state = current && !error ? assessmentPresentation(current) : null;
  const path = `/explore/${encodeURIComponent(campaign.id)}`;
  return <View testID="campaign-transparency" style={{ gap: 10 }}>
    <View style={{ padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.paper }}><TrustScore compact data={current} loading={loading} error={error || (!!assessment && !matches)} onRetry={retry} /></View>
    <View style={{ gap: 3, paddingTop: 3, paddingBottom: 2 }}>
      <Text accessibilityRole="header" style={{ fontFamily: fonts.bold, fontSize: 18, lineHeight: 25, color: colors.ink }}>Campaign transparency</Text>
      <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>Clear information about reach, funding and review.</Text>
    </View>
    <SummaryLink testID="transparency-audience" icon="bar-chart-outline" title="Audience & Reach" summary={config ? `Est. ${number(estimate(campaign.goal, config))} people at the goal` : "Estimate settings unavailable"} description="Targeting, distribution and how reach is estimated." onPress={() => router.push(`${path}/audience`)} />
    <SummaryLink testID="transparency-funding" icon="wallet-outline" title="Funding & Spending" summary={`${money(campaign.raised)} of ${money(campaign.goal)} raised`} description="Advertising allocation, fees, spending and refunds." onPress={() => router.push(`${path}/funding`)} />
    <SummaryLink testID="transparency-assessment" icon="shield-outline" title="Trust & Verification" summary={state?.score !== null && state?.score !== undefined ? `${state.label.replace(" review coverage", " review")} (${state.score}/100)` : loading ? "Loading assessment" : state?.label || "Assessment unavailable"} description="Supporting evidence, review method and limitations." onPress={() => router.push(`${path}/assessment`)} />
  </View>;
}
