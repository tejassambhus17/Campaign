import { View } from "react-native";
import { router } from "expo-router";
import { Button, fonts, Text, useTheme } from "../../components/ui";
import { useCurrency } from "../../lib/CurrencyProvider";
import { Campaign, Config, estimate, number, quote } from "../../lib/types";
import { assessmentMatchesCampaign, distributionPresentation, PublicAssessment } from "../../lib/assessments";
import { TrustScore } from "./TrustScore";

export function CampaignTransparency({ campaign, config, assessment, loading, error, retry }: {
  campaign: Campaign; config?: Config; assessment?: PublicAssessment; loading: boolean; error: boolean; retry: () => void;
}) {
  const { colors, styles } = useTheme();
  const { money } = useCurrency();
  const plan = distributionPresentation(campaign.campaignState || campaign.status, !!campaign.setupReady);
  const matches = assessmentMatchesCampaign(campaign, assessment);
  return <View style={{ gap: 22 }}>
    <View style={{ gap: 8 }}>
      <Text accessibilityRole="header" style={styles.h2}>Estimated reach</Text>
      {config ? <>
        <Text style={{ fontFamily: fonts.bold, fontSize: 25, lineHeight: 34, color: colors.ink }}>{number(estimate(campaign.goal, config))} people at the goal</Text>
        <Text style={styles.body}>Illustration: {money(1)} contributed ({"$1 USD"}) could reach about {number(quote(1, config).reach)} people after the included {Number((config.feeRate * 100).toFixed(2))}% fee.</Text>
        <Text style={styles.muted}>Current model: {config.peoplePerAdDollar} people per net advertising dollar (USD). Goal: {money(campaign.goal)}. Reach uses the same USD calculation in every display currency.</Text>
      </> : <Text style={styles.muted}>Current estimate settings are unavailable. Refresh the campaign before relying on a reach illustration.</Text>}
      <Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>An estimate, not measured delivery or a guaranteed audience. Prices, available inventory, targeting and performance can change results. Impressions may include repeat views.</Text>
    </View>
    <TrustScore data={matches ? assessment : undefined} loading={loading} error={error || (!!assessment && !matches)} onRetry={retry} onOpen={() => router.push(`/explore/${campaign.id}/assessment`)} />
    <View style={{ gap: 8 }}>
      <Text accessibilityRole="header" style={styles.h2}>Audience & distribution</Text>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 14, lineHeight: 21, color: colors.primary }}>{plan.title}</Text>
      <Text style={styles.body}>{campaign.geography || "Location not selected"} · {campaign.channels?.join(" / ") || "Channels not selected"} · {campaign.durationDays} days</Text>
      <Text style={styles.muted}>{plan.body}</Text>
      <Button title="See the audience and distribution plan" variant="secondary" icon="people-outline" onPress={() => router.push(`/explore/${campaign.id}/audience`)} />
      <Button title="See funds, spend and refunds" variant="ghost" icon="receipt-outline" onPress={() => router.push(`/explore/${campaign.id}/report`)} />
    </View>
  </View>;
}
