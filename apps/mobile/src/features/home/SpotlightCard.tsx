import { Image, Pressable, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, useTheme } from "../../components/ui";
import { Campaign, Config } from "../../lib/types";
import { audienceCampaign } from "../../lib/public-campaign";
import { CampaignCover, CampaignStats, detailPath, Funding, hasIllustrativeCover } from "../campaign";

const oceanArtwork = require("../../../assets/images/showcase/ocean-turtle.png");
const oceanDimensions = Image.resolveAssetSource(oceanArtwork);

function SpotlightCover({ campaign }: { campaign: Campaign }) {
  if (!hasIllustrativeCover(campaign)) return <CampaignCover campaign={campaign} height={140} />;
  // Keep the source's upper focal area inside Home's wide slot rather than
  // centering a cover crop through the turtle's head. Other covers are shared.
  return <View style={{ height: 140, overflow: "hidden" }}>
    <Image source={oceanArtwork} accessibilityLabel="AI-generated illustrative ocean artwork for a demo campaign" resizeMode="cover" style={{ width: "100%", height: undefined, aspectRatio: oceanDimensions.width / oceanDimensions.height }} />
  </View>;
}

/** Home's reference-led spotlight; shared discovery cards keep their layout. */
export function SpotlightCard({ campaign, config }: { campaign: Campaign; config?: Config }) {
  const { colors } = useTheme();
  const { fontScale } = useWindowDimensions();
  const current = audienceCampaign(campaign);
  if (!current) return null;
  const open = () => router.push(detailPath(current.id));
  const state = current.campaignState || current.status;
  const canBack = state === "Available for Funding";
  const back = () => router.push(`/explore/${encodeURIComponent(current.id)}/back`);
  const stackedMetadata = fontScale >= 1.25;

  return <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, overflow: "hidden" }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Explore ${current.title}. ${current.category}. By ${current.creatorName}. ${state}.`} onPress={open} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <SpotlightCover campaign={current} />
      <View style={{ position: "absolute", left: 10, top: 10, flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 12, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: colors.primary }}>
        <Ionicons name="megaphone-outline" size={12} color={colors.onPrimary} />
        <Text style={{ color: colors.onPrimary, fontSize: 10, lineHeight: 14, fontWeight: "600" }}>Featured · demo</Text>
      </View>
    </Pressable>
    <View style={{ padding: 12, gap: 7 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Explore campaign: ${current.title}. By ${current.creatorName}. ${state}.`} accessibilityHint="Opens the campaign story, sources and progress." onPress={open} style={({ pressed }) => ({ gap: 4, minHeight: 48, opacity: pressed ? 0.75 : 1 })}>
        <View style={{ flexDirection: stackedMetadata ? "column" : "row", alignItems: stackedMetadata ? "flex-start" : "center", gap: stackedMetadata ? 3 : 10 }}>
          <Text style={{ color: colors.primary, fontSize: 10, lineHeight: 14, fontWeight: "700", letterSpacing: 0.55 }}>{current.category.toLocaleUpperCase()}</Text>
          {!stackedMetadata && <View accessible={false} style={{ width: 1, height: 12, backgroundColor: colors.line }} />}
          <Text numberOfLines={2} style={{ flex: stackedMetadata ? undefined : 1, minWidth: 0, color: colors.muted, fontSize: 10, lineHeight: 14 }}>By {current.creatorName}</Text>
        </View>
        <Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 17, lineHeight: 22, fontWeight: "700", letterSpacing: -0.2 }}>{current.title}</Text>
        {!!current.summary && <Text numberOfLines={fontScale > 1.2 ? 3 : 2} style={{ color: colors.muted, fontSize: 12, lineHeight: 17 }}>{current.summary}</Text>}
      </Pressable>
      <Funding campaign={current} config={config} showEstimate={false} />
      <CampaignStats campaign={current} config={config} showTime />
      <Pressable accessibilityRole="button" accessibilityLabel={`${canBack ? "Back" : "Explore"} campaign: ${current.title}`} onPress={canBack ? back : open} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, marginTop: 3, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24, backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 })}>
        <Text style={{ color: colors.onPrimary, fontSize: 13, lineHeight: 19, fontWeight: "700", textAlign: "center", flexShrink: 1 }}>{canBack ? "Back this campaign" : "Explore campaign"}</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
      </Pressable>
    </View>
  </View>;
}
