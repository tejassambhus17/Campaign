import React from "react";
import { Image, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Campaign, Config, estimate, number } from "../lib/types";
import { Picture, Text, useTheme } from "../components/ui";

export const hasIllustrativeCover = (campaign: Campaign) => campaign.id === "demo_ocean";

/** This local artwork belongs only to the fictional seed's discovery cover.
 * Supporting story evidence and the creator's advertising assets stay intact. */
export function CampaignCover({ campaign, height = 180 }: { campaign: Campaign; height?: number }) {
  return hasIllustrativeCover(campaign) ? (
    <Image source={require("../../assets/images/showcase/ocean-turtle.png")} accessibilityLabel="AI-generated illustrative ocean artwork for a demo campaign" resizeMode="cover" style={{ width: "100%", height }} />
  ) : <Picture uri={campaign.coverImage} height={height} />;
}

export function CampaignStats({ campaign, config, showTime = false }: { campaign: Campaign; config?: Config; showTime?: boolean }) {
  const { colors } = useTheme();
  const report = useQuery({ queryKey: ["report", campaign.id], queryFn: () => api<Record<string, unknown>>(`/campaigns/${campaign.id}/report`), enabled: !!campaign.publishedAt });
  const count = report.data?.contributionCount;
  const fundingOpen = (campaign.campaignState || campaign.status) === "Available for Funding";
  const days = fundingOpen && campaign.deadline ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86400000)) : null;
  const items: { icon: React.ComponentProps<typeof Ionicons>["name"]; value: string; label: string }[] = [
    { icon: "megaphone-outline", value: config ? number(estimate(campaign.goal, config)) : "—", label: "Est. at goal" },
    { icon: "people-outline", value: typeof count === "number" ? number(count) : "—", label: count === 1 ? "Contribution" : "Contributions" },
  ];
  if (showTime) items.push({ icon: "time-outline", value: days === null ? String(campaign.durationDays) : String(days), label: days === null ? "Planned days" : "Days left" });
  return <View style={{ flexDirection: "row", paddingTop: 10, borderTopWidth: 1, borderColor: colors.line }}>
    {items.map((item, i) => <View key={item.label} accessible accessibilityLabel={`${item.label}: ${item.value}`} style={{ flex: 1, minWidth: 0, gap: 3, paddingLeft: i ? 9 : 0, borderLeftWidth: i ? 1 : 0, borderColor: colors.line }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Ionicons accessible={false} name={item.icon} size={16} color={colors.ink} />
        <Text style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"], color: colors.ink }}>{item.value}</Text>
      </View>
      <Text style={{ fontSize: 10, lineHeight: 14, color: colors.muted }}>{item.label}</Text>
    </View>)}
  </View>;
}
