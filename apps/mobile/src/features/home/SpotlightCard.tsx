import React from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, useTheme } from "../../components/ui";
import { Campaign, Config, estimate, number } from "../../lib/types";
import { useCurrency } from "../../lib/CurrencyProvider";
import { audienceCampaign } from "../../lib/public-campaign";
import { detailPath } from "../campaign";
import { HomeCardArtwork, HomeCardCaption, HomeFundingProgress, HomeMetric, HomeTrustBadge, imageAccent, imageMuted, useHomeCardData } from "./HomeCardParts";

/** Image-led Home spotlight. Values always describe the approved public message. */
export const SpotlightCard = React.memo(function SpotlightCard({ campaign, config, backTargetRef }: { campaign: Campaign; config?: Config; backTargetRef?: React.Ref<View> }) {
  const current = audienceCampaign(campaign);
  return current ? <ApprovedSpotlight campaign={current} config={config} backTargetRef={backTargetRef} /> : null;
});

function ApprovedSpotlight({ campaign: c, config, backTargetRef }: { campaign: Campaign; config?: Config; backTargetRef?: React.Ref<View> }) {
  const { colors } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const { money } = useCurrency();
  const { count, assessment, assessmentLoading, assessmentError, percentage, time } = useHomeCardData(c);
  const compact = width < 370 || fontScale > 1.15;
  const enlarged = fontScale >= 1.25;
  const stackActions = (Math.min(width, 640) - 60) / Math.max(fontScale, 1) < 250;
  const canBack = (c.campaignState || c.status) === "Available for Funding";
  const open = () => router.push(detailPath(c.id));
  const demo = c.id.startsWith("demo_");

  return <HomeCardArtwork campaign={c} testID="home-featured-card" radius={16}>
    <View style={{ padding: 12, gap: 6 }}>
      <View testID="home-featured-photo-badges" style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <View style={{ minWidth: 0, flexShrink: 1, minHeight: 28, flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 16, borderWidth: 1, borderColor: "rgba(142,244,197,0.55)", paddingHorizontal: 9, paddingVertical: 4, backgroundColor: "rgba(0,0,0,0.78)" }}>
          <Ionicons name="diamond-outline" size={13} color={imageAccent} accessible={false} />
          <Text style={{ color: imageAccent, fontSize: 10, lineHeight: 15, fontWeight: "700", flexShrink: 1 }}>{demo ? "FEATURED · DEMO" : "FEATURED"}</Text>
        </View>
        <HomeTrustBadge campaign={c} data={assessment} loading={assessmentLoading} error={assessmentError} />
      </View>

      <HomeCardCaption onPress={open} accessibilityLabel={`View campaign: ${c.title}. By ${c.creatorName}. ${c.summary}`} accessibilityHint="Opens the campaign story, sources and progress." topSpace={compact ? 24 : 36} gap={5}>
        <Text accessibilityRole="header" style={{ color: colors.onImage, fontSize: compact ? 20 : 21, lineHeight: 26, letterSpacing: -0.4, fontWeight: "700" }}>{c.title}</Text>
        {!!c.summary && <Text numberOfLines={enlarged ? undefined : 2} style={{ color: imageMuted, fontSize: 12, lineHeight: 17 }}>{c.summary}</Text>}
      </HomeCardCaption>

      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 4 }}>
        <Text style={{ color: imageAccent, fontSize: 10, lineHeight: 15, fontWeight: "700" }}>{c.category} · {c.creatorName}{count === null ? "" : ` · ${number(count)} ${count === 1 ? "contribution" : "contributions"}`}</Text>
        <Text style={{ color: imageMuted, fontSize: 11, lineHeight: 16 }}><Text style={{ color: colors.onImage, fontWeight: "700" }}>{money(c.raised)}</Text> of {money(c.goal)}</Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 13, paddingTop: 2 }}>
        <HomeMetric icon="megaphone-outline" value={config ? number(estimate(c.goal, config)) : "—"} label="est. at goal" columns={enlarged ? 2 : 4} />
        <HomeMetric icon="flag-outline" value={money(c.goal)} label="funding goal" columns={enlarged ? 2 : 4} />
        <HomeMetric icon="pie-chart-outline" value={`${percentage}%`} label="funded" columns={enlarged ? 2 : 4} />
        <HomeMetric icon="calendar-outline" value={time.value} label={time.label} columns={enlarged ? 2 : 4} />
      </View>
      <HomeFundingProgress raised={c.raised} goal={c.goal} />

      <View testID="home-featured-actions" style={{ flexDirection: stackActions ? "column" : "row", alignItems: "stretch", gap: 8, paddingTop: 6 }}>
        {canBack && <Pressable ref={backTargetRef} collapsable={false} onPress={() => router.push(`/explore/${encodeURIComponent(c.id)}/back`)} accessibilityRole="button" accessibilityLabel={`Back campaign: ${c.title}`} style={({ pressed }) => ({ flex: stackActions ? undefined : 1, minWidth: 0, minHeight: 48, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 26, borderWidth: 1, borderColor: imageAccent, backgroundColor: "rgba(0,0,0,0.70)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, opacity: pressed ? 0.7 : 1 })}>
          <Ionicons name="megaphone-outline" size={16} color={imageAccent} accessible={false} />
          <Text style={{ color: imageAccent, fontSize: 12, lineHeight: 18, fontWeight: "700", textAlign: "center", flexShrink: 1 }}>Back campaign</Text>
        </Pressable>}
        <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`View campaign: ${c.title}`} style={({ pressed }) => ({ flex: stackActions ? undefined : 1, minWidth: 0, minHeight: 48, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 26, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 })}>
          <Text style={{ color: colors.onPrimary, fontSize: 12, lineHeight: 18, fontWeight: "700", textAlign: "center", flexShrink: 1 }}>View campaign</Text>
          <Ionicons name="arrow-forward" size={17} color={colors.onPrimary} accessible={false} />
        </Pressable>
      </View>
    </View>
  </HomeCardArtwork>;
}
