import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Button, ErrorState, Loading, Notice, Pill, Screen, Text, useTheme } from "../../../../components/ui";
import { api } from "../../../../lib/api";
import { Campaign } from "../../../../lib/types";
import { audienceCampaign } from "../../../../lib/public-campaign";
import { distributionPresentation } from "../../../../lib/assessments";
import { useRefreshOnFocus, useSession } from "../../../../lib/session";
import { AdPreview } from "../../../../features/creation/Preview";

export default function AudiencePlan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const { styles } = useTheme();
  const [selected, setSelected] = useState(0);
  const q = useQuery({ queryKey: ["campaign", id, user?.id], queryFn: () => api<Campaign>(`/campaigns/${id}`) });
  useRefreshOnFocus(q.refetch);
  const campaign = q.data ? audienceCampaign(q.data) : null;
  const state = campaign ? distributionPresentation(campaign.campaignState || campaign.status, !!campaign.setupReady) : null;
  const image = campaign?.adImages[Math.min(selected, Math.max(0, campaign.adImages.length - 1))];
  return <Screen>
    <Button title="Back to campaign" variant="ghost" icon="arrow-back" style={{ alignSelf: "flex-start", paddingHorizontal: 0 }} onPress={() => router.dismissTo(`/explore/${id}`)} />
    <Text accessibilityRole="header" style={styles.title}>Audience & distribution</Text>
    {q.isPending ? <Loading /> : q.isError ? <ErrorState error={q.error} retry={() => q.refetch()} /> : !campaign ? <Notice>Approved public details are unavailable. Private revisions cannot be shown as the distribution plan.</Notice> : <>
      <Text style={styles.h2}>{campaign.title}</Text>
      <Notice>{state?.title}. {state?.body}</Notice>
      {campaign.revisionPending && <Text style={styles.muted}>Showing the approved public version. Unpublished draft changes are excluded.</Text>}
      <View style={{ gap: 18 }}>
        {[["Proposed locations", campaign.geography || "Not selected"], ["Configured audience interests", campaign.interests || "Broad audience; no interests supplied"], ["Campaign duration", `${campaign.durationDays} days`]].map(([label, value]) => <View key={label} style={{ gap: 5 }}><Text style={styles.h2}>{label}</Text><Text style={styles.body}>{value}</Text></View>)}
        <View style={{ gap: 6 }}><Text style={styles.h2}>Selected channels & allocation</Text>
          {campaign.channels.length ? campaign.channels.map(channel => <Text key={channel} style={styles.body}>{channel} · {campaign.allocation[channel] === undefined ? "Allocation not set" : `${campaign.allocation[channel]}% of the advertising budget`}</Text>) : <Text style={styles.body}>No channels selected.</Text>}
        </View>
      </View>
      <Text style={styles.muted}>These are creator-selected proposals. The platform can finalize eligible placements, audience and allocation during review. Channels shown here are preview labels, not claims of partnerships or live integrations.</Text>
      <Text style={styles.muted}>No private backer identities, payment details or personal profiles are used in this public audience view.</Text>
      <Text accessibilityRole="header" style={styles.h2}>Advertising creative</Text>
      {campaign.adImages.length > 1 && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{campaign.adImages.map((_, index) => <Pill key={index} title={`Image ${index + 1}`} selected={index === selected} onPress={() => setSelected(index)} />)}</View>}
      {image ? <AdPreview draft={{ ...campaign, adImages: [image] }} placement={campaign.channels[0] || "Selected channel"} /> : <Notice>No ad image is supplied. The campaign cover is separate and has not been substituted for advertising creative.</Notice>}
      <Text style={styles.muted}>A preview demonstrates the proposed message. It does not prove that an ad was approved by a provider, scheduled or delivered.</Text>
      <Button title="See assessment and review limitations" variant="secondary" onPress={() => router.push(`/explore/${id}/assessment`)} />
      <Button title="View funds, spend and refunds" variant="ghost" onPress={() => router.push(`/explore/${id}/report`)} />
    </>}
  </Screen>;
}
