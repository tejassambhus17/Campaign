import { useState } from "react";
import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ErrorState, fonts, Loading, Notice, Pill, Screen, Text, useTheme } from "../../../../components/ui";
import { InfoAction } from "../../../../components/Information";
import { PageHeading } from "../../../../features/transparency/PageHeading";
import { api } from "../../../../lib/api";
import { Campaign, estimate, number, quote } from "../../../../lib/types";
import { useCurrency } from "../../../../lib/CurrencyProvider";
import { audienceCampaign } from "../../../../lib/public-campaign";
import { distributionPresentation } from "../../../../lib/assessments";
import { useConfig, useRefreshOnFocus, useSession } from "../../../../lib/session";
import { AdPreview } from "../../../../features/creation/Preview";

export default function AudiencePlan() {
  const { id } = useLocalSearchParams<{ id: string }>(), { user } = useSession();
  const { styles, colors } = useTheme(), config = useConfig(), { money } = useCurrency();
  const [selected, setSelected] = useState(0);
  const q = useQuery({ queryKey: ["campaign", id, user?.id], queryFn: () => api<Campaign>(`/campaigns/${id}`) });
  useRefreshOnFocus(q.refetch);
  const campaign = q.data ? audienceCampaign(q.data) : null;
  const state = campaign ? distributionPresentation(campaign.campaignState || campaign.status, !!campaign.setupReady) : null;
  const image = campaign?.adImages[Math.min(selected, Math.max(0, campaign.adImages.length - 1))];
  const interests = campaign?.interests?.split(/[,;]+/).map(value => value.trim()).filter(Boolean) || [];
  return <Screen compact>
    <PageHeading title="Audience & Reach" id={id} />
    {q.isPending ? <Loading /> : q.isError ? <ErrorState error={q.error} retry={() => q.refetch()} /> : !campaign ? <Notice>Approved public details are unavailable. Private revisions cannot be shown as the distribution plan.</Notice> : <>
      <View style={{ backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14, gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <Ionicons name="bar-chart-outline" color={colors.primary} size={32} accessible={false} />
          <View style={{ flex: 1, gap: 3 }}><Text style={{ fontSize: 13, lineHeight: 20, color: colors.ink }}>Estimated reach at the goal</Text><Text style={{ fontFamily: fonts.bold, fontSize: 23, lineHeight: 30, color: colors.primary }}>{config.data ? number(estimate(campaign.goal, config.data)) : "Unavailable"}</Text><Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>people · illustrative estimate</Text></View>
        </View>
        <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>Based on the funding goal and configured advertising model.</Text>
        <InfoAction title="How is this estimated?" icon="information-circle-outline">
          {config.data ? <>
            <Text style={styles.body}>Goal: {money(campaign.goal)}. The configured model uses {config.data.peoplePerAdDollar} people per net advertising dollar (USD), after the included {Number((config.data.feeRate * 100).toFixed(2))}% platform fee.</Text>
            <Text style={styles.body}>Illustration: {money(1)} contributed ($1 USD) could reach approximately {number(quote(1, config.data).reach)} people. Display currency does not change the USD calculation.</Text>
          </> : <Text style={styles.body}>Estimate settings are unavailable. Reload the campaign before relying on a reach illustration.</Text>}
          <Text style={styles.muted}>This model does not predict a different price for each selected audience. Actual results depend on inventory, prices, targeting, delivery and performance. Reach is not guaranteed; impressions can include repeat views.</Text>
        </InfoAction>
      </View>
      <View style={{ gap: 9 }}>
        <Text accessibilityRole="header" style={[styles.h2, { fontSize: 16, lineHeight: 23 }]}>Audience targeting</Text>
        <Text style={{ fontSize: 13, lineHeight: 20, color: colors.text }}>{campaign.geography || "Location not selected"}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>{(interests.length ? interests : ["Broad audience; no interests supplied"]).map((interest, index) => <View key={`${interest}-${index}`} style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 11, paddingVertical: 7 }}><Text style={{ fontSize: 12, lineHeight: 18, color: colors.text }}>{interest}</Text></View>)}</View>
      </View>
      <View style={{ gap: 9 }}>
        <Text accessibilityRole="header" style={[styles.h2, { fontSize: 16, lineHeight: 23 }]}>Where it will be shown</Text>
        <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>Creator-proposed channels · {campaign.durationDays} days</Text>
        {campaign.channels.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>{campaign.channels.map(channel => <View key={channel} style={{ minWidth: 84, flex: 1, alignItems: "center", gap: 5, paddingVertical: 8 }}>
          <Ionicons name={channel === "Instagram" ? "logo-instagram" : channel === "YouTube" ? "logo-youtube" : channel === "Facebook" ? "logo-facebook" : "globe-outline"} color={colors.primary} size={25} accessible={false} />
          <Text style={{ fontSize: 12, lineHeight: 18, color: colors.ink, textAlign: "center" }}>{channel}</Text>
          <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>{campaign.allocation[channel] === undefined ? "Allocation not set" : `${campaign.allocation[channel]}% allocation`}</Text>
        </View>)}</View> : <Text style={styles.muted}>No channels selected.</Text>}
      </View>
      <InfoAction title="Key assumptions" summary={state?.title}>
        <Text style={styles.body}>{state?.body}</Text>
        <Text style={styles.body}>These are creator-selected proposals. The platform can finalize eligible placements, audience and allocation during review. Approval or reaching the funding goal does not start advertising.</Text>
        <Text style={styles.muted}>Channels are preview labels, not partnerships or live integrations. Private backer identities, payment records and personal profiles are not used in this public audience view.</Text>
        {campaign.revisionPending && <Text style={styles.muted}>Only the approved public version is shown; unpublished revisions are excluded.</Text>}
      </InfoAction>
      <InfoAction title="Advertising creative" summary={campaign.adImages.length ? `${campaign.adImages.length} proposed ${campaign.adImages.length === 1 ? "image" : "images"}` : "No ad image supplied"} icon="images-outline">
        {campaign.adImages.length > 1 && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{campaign.adImages.map((_, index) => <Pill key={index} title={`Image ${index + 1}`} selected={index === selected} onPress={() => setSelected(index)} />)}</View>}
        {image ? <AdPreview draft={{ ...campaign, adImages: [image] }} placement={campaign.channels[0] || "Selected channel"} /> : <Text style={styles.body}>No advertising image is supplied. The campaign cover is separate and has not been substituted.</Text>}
        <Text style={styles.muted}>A preview shows the proposed message. It does not prove provider approval, scheduling or delivery.</Text>
      </InfoAction>
    </>}
  </Screen>;
}
