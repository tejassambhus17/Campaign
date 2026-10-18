import { Pressable, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Shield from "lucide-react-native/icons/shield";
import { Text } from "../../components/ui";
import { api } from "../../lib/api";
import { assessmentMatchesCampaign, assessmentPresentation, PublicAssessment } from "../../lib/assessments";
import { useSession } from "../../lib/session";
import { Campaign } from "../../lib/types";

/** Home and Explore share the exact public-content assessment cache. */
export function useCampaignAssessment(campaign: Campaign) {
  const { user } = useSession();
  const query = useQuery({
    queryKey: ["assessment", campaign.id, user?.id],
    queryFn: () => api<PublicAssessment>(`/campaigns/${campaign.id}/assessment`),
    enabled: !!campaign.publishedAt,
  });
  const matches = assessmentMatchesCampaign(campaign, query.data);
  return {
    data: matches ? query.data : undefined,
    loading: query.isPending,
    error: query.isError || (!!query.data && !matches),
  };
}

/** A compact photo badge. Provenance and criteria remain in the linked review. */
export function DiscoveryTrustBadge({ campaign, data, loading, error, testID }: {
  campaign: Campaign; data?: PublicAssessment; loading: boolean; error: boolean; testID: string;
}) {
  const { fontScale } = useWindowDimensions();
  const state = data && !error && assessmentMatchesCampaign(campaign, data) ? assessmentPresentation(data) : {
    score: null, label: loading ? "Loading assessment" : "Assessment unavailable", demo: false,
  };
  const hasScore = state.score !== null;
  const enlarged = fontScale > 1.25;
  const status = loading ? "Loading" : state.label === "Not yet assessed" ? "Not assessed" : state.label === "Assessment in progress" ? "In review" : state.label === "New assessment needed" ? "Review needed" : "Unavailable";
  return <Pressable testID={testID} onPress={() => router.push(`/explore/${encodeURIComponent(campaign.id)}/assessment`)} accessibilityRole="button" accessibilityLabel={`${state.demo ? "Illustrative demo assessment. " : ""}${hasScore ? `Trust Score ${state.score} out of 100. ` : ""}${state.label}. See assessment and limitations.`} style={({ pressed }) => ({ minWidth: 74, minHeight: 74, width: enlarged ? 104 : 74, flexShrink: 0, paddingHorizontal: 5, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "rgba(142,244,197,0.55)", backgroundColor: "rgba(0,0,0,0.84)", alignItems: "center", justifyContent: "center", gap: 2, opacity: pressed ? 0.7 : 1 })}>
    {enlarged && hasScore ? <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      <Shield size={24} strokeWidth={1.8} color="#8EF4C5" accessible={false} />
      <Text style={{ color: "#FFFFFF", fontSize: 15, lineHeight: 21, fontWeight: "700", fontVariant: ["tabular-nums"] }}>{state.score}</Text>
    </View> : <View style={{ width: 34, height: 36, alignItems: "center", justifyContent: "center" }}>
      <Shield size={34} strokeWidth={1.8} color="#8EF4C5" accessible={false} />
      {hasScore && <Text style={{ position: "absolute", color: "#FFFFFF", fontSize: 13, lineHeight: 18, fontWeight: "700", fontVariant: ["tabular-nums"] }}>{state.score}</Text>}
    </View>}
    <Text style={{ color: "#8EF4C5", fontSize: 9, lineHeight: 13, fontWeight: "600", textAlign: "center" }}>{hasScore ? "Trust Score" : status}</Text>
  </Pressable>;
}

export function CampaignTrustBadge({ campaign, testID = "explore-campaign-assessment" }: { campaign: Campaign; testID?: string }) {
  const assessment = useCampaignAssessment(campaign);
  return <DiscoveryTrustBadge campaign={campaign} {...assessment} testID={testID} />;
}
