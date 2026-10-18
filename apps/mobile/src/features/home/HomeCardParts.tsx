import React, { createContext, useContext, useId, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Text } from "../../components/ui";
import { PublicAssessment } from "../../lib/assessments";
import { DiscoveryTrustBadge, useCampaignAssessment } from "../transparency/DiscoveryTrustBadge";
import { Campaign, number } from "../../lib/types";
import { CampaignCover } from "../campaign";

// Text on photography keeps the approved mint/white image treatment in both themes.
export const imageAccent = "#8EF4C5";
export const imageMuted = "#D2DAD6";
const CaptionPosition = createContext<(top: number) => void>(() => undefined);

/** Align the readability scrim to actual text, including one-column large text. */
export function HomeCardCaption({ children, topSpace, gap = 4, onPress, accessibilityLabel, accessibilityHint }: {
  children: React.ReactNode; topSpace: number; gap?: number; onPress: () => void; accessibilityLabel: string; accessibilityHint?: string;
}) {
  const position = useContext(CaptionPosition);
  return <Pressable onLayout={(event) => position(Math.ceil(event.nativeEvent.layout.y + topSpace))} accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint} onPress={onPress} style={({ pressed }) => ({ paddingTop: topSpace, gap, minHeight: 48, opacity: pressed ? 0.75 : 1 })}>{children}</Pressable>;
}

export function useHomeCardData(campaign: Campaign) {
  const assessment = useCampaignAssessment(campaign);
  // Campaign responses already include this public aggregate. Avoid a separate
  // report request for every discovery tile and never infer unique backers.
  const publicReport = (campaign as Campaign & { report?: Record<string, unknown> }).report;
  const rawCount = publicReport?.contributionCount;
  const count = typeof rawCount === "number" && Number.isInteger(rawCount) && rawCount >= 0 ? rawCount : null;
  const deadline = campaign.deadline ? Date.parse(campaign.deadline) : NaN;
  const fundingOpen = (campaign.campaignState || campaign.status) === "Available for Funding";
  const days = fundingOpen && Number.isFinite(deadline) ? Math.max(0, Math.ceil((deadline - Date.now()) / 86400000)) : null;
  return {
    count,
    assessment: assessment.data,
    assessmentLoading: assessment.loading,
    assessmentError: assessment.error,
    percentage: campaign.goal > 0 ? Math.max(0, Math.round(campaign.raised / campaign.goal * 100)) : 0,
    time: days === null ? { value: String(campaign.durationDays), label: "planned days" } : { value: String(days), label: days === 1 ? "day left" : "days left" },
  };
}

/** The image height follows real laid-out content, including Android text scaling. */
export function HomeCardArtwork({ campaign, children, testID, radius = 16 }: { campaign: Campaign; children: React.ReactNode; testID: string; radius?: number }) {
  const [bounds, setBounds] = useState({ width: 328, height: 380 });
  const [captionTop, setCaptionTop] = useState(80);
  const photoHeight = Math.min(bounds.height, bounds.width * 0.92);
  const readableAt = Math.min(0.92, Math.max(0.12, captionTop / photoHeight));
  const fadeStart = Math.max(0, readableAt - 24 / photoHeight);
  const fadeEnd = Math.min(1, readableAt + 42 / photoHeight);
  const gradientId = `home-photo-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return <View testID={testID} onLayout={event => { const next = { width: Math.ceil(event.nativeEvent.layout.width), height: Math.ceil(event.nativeEvent.layout.height) }; if (next.width > 0 && next.height > 0 && (next.height !== bounds.height || next.width !== bounds.width)) setBounds(next); }} style={{ overflow: "hidden", borderRadius: radius, borderWidth: 1, borderColor: "#2C302E", backgroundColor: "#080808" }}>
    <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={StyleSheet.absoluteFill}>
      <CampaignCover campaign={campaign} height={photoHeight} />
      <Svg width="100%" height={photoHeight + 1} style={{ position: "absolute", top: 0, left: 0 }} accessible={false}>
        <Defs><LinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#000000" stopOpacity={0.04} />
          <Stop offset={fadeStart} stopColor="#000000" stopOpacity={0.14} />
          <Stop offset={readableAt} stopColor="#000000" stopOpacity={0.68} />
          <Stop offset={fadeEnd} stopColor="#000000" stopOpacity={0.94} />
          <Stop offset="1" stopColor="#080808" stopOpacity={1} />
        </LinearGradient></Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
    <CaptionPosition.Provider value={setCaptionTop}>{children}</CaptionPosition.Provider>
  </View>;
}

export function HomeTrustBadge({ campaign, data, loading, error, compact = false }: { campaign: Campaign; data?: PublicAssessment; loading: boolean; error: boolean; compact?: boolean }) {
  return <DiscoveryTrustBadge campaign={campaign} data={data} loading={loading} error={error} testID={compact ? "home-discovery-assessment" : "home-featured-assessment"} />;
}

export function HomeMetric({ icon, value, label, columns = 4 }: { icon: React.ComponentProps<typeof Ionicons>["name"]; value: string; label: string; columns?: 2 | 4 }) {
  return <View accessible accessibilityLabel={`${value} ${label}`} style={{ width: columns === 2 ? "50%" : "25%", paddingRight: 5, gap: 3 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Ionicons name={icon} size={15} color={imageAccent} accessible={false} />
      <Text style={{ color: "#FFFFFF", fontSize: 11, lineHeight: 17, fontWeight: "700", fontVariant: ["tabular-nums"], flexShrink: 1 }}>{value}</Text>
    </View>
    <Text style={{ color: imageMuted, fontSize: 10, lineHeight: 14 }}>{label}</Text>
  </View>;
}

export function HomeFundingProgress({ raised, goal }: { raised: number; goal: number }) {
  const value = goal > 0 ? Math.min(100, Math.max(0, Math.round(raised / goal * 100))) : 0;
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: value }} style={{ height: 5, borderRadius: 3, backgroundColor: "#2B3531", overflow: "hidden" }}>
    <View style={{ height: "100%", borderRadius: 3, width: `${value}%`, backgroundColor: imageAccent }} />
  </View>;
}

export function compactHomeCount(value: number | null) { return value === null ? "—" : number(value); }
