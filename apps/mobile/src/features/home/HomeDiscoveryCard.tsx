import React, { useEffect, useRef, useState } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text } from "../../components/ui";
import { api, captureApiSession } from "../../lib/api";
import { audienceCampaign } from "../../lib/public-campaign";
import { refresh, useMe, useSession } from "../../lib/session";
import { Campaign, Config, estimate, number } from "../../lib/types";
import { useCurrency } from "../../lib/CurrencyProvider";
import { detailPath } from "../campaign";
import { compactHomeCount, HomeCardArtwork, HomeCardCaption, HomeFundingProgress, HomeTrustBadge, imageAccent, imageMuted, useHomeCardData } from "./HomeCardParts";

/** Compact Home-only photo card; Explore retains its established native list. */
export const HomeDiscoveryCard = React.memo(function HomeDiscoveryCard({ campaign, config }: { campaign: Campaign; config?: Config }) {
  const current = audienceCampaign(campaign);
  return current ? <ApprovedDiscovery campaign={current} config={config} /> : null;
});

function ApprovedDiscovery({ campaign: c, config }: { campaign: Campaign; config?: Config }) {
  const { fontScale } = useWindowDimensions();
  const { money } = useCurrency();
  const { user } = useSession();
  const me = useMe();
  const { count, assessment, assessmentLoading, assessmentError, percentage, time } = useHomeCardData(c);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const saving = useRef(false);
  const saved = !!user && (me.data?.saved.includes(c.id) || false);
  const enlarged = fontScale > 1.2;
  const canBack = (c.campaignState || c.status) === "Available for Funding";
  useEffect(() => { saving.current = false; setBusy(false); setMessage(""); }, [c.id, user?.id]);
  async function toggleSaved() {
    if (!user) { router.push("/profile?auth=login"); return; }
    if (saving.current) return;
    const current = captureApiSession();
    saving.current = true;
    setBusy(true);
    setMessage("");
    try {
      const response = await api<{ active: boolean }>(`/campaigns/${encodeURIComponent(c.id)}/save`, { method: "POST" });
      if (!current()) return;
      setMessage(response.active ? "Campaign saved." : "Removed from saved.");
      await refresh();
    } catch (error) { if (current()) setMessage(error instanceof Error ? error.message : "Could not update saved campaigns. Try again."); }
    finally { if (current()) { saving.current = false; setBusy(false); } }
  }
  const open = () => router.push(detailPath(c.id));

  return <HomeCardArtwork campaign={c} testID={`home-discovery-${c.id}`} radius={14}>
    <View style={{ padding: 10, gap: 5, flex: 1 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
        <HomeTrustBadge campaign={c} data={assessment} loading={assessmentLoading} error={assessmentError} compact />
        <Pressable testID={`home-save-${c.id}`} accessibilityRole="button" accessibilityLabel={saved ? `Remove ${c.title} from saved campaigns` : `Save ${c.title}`} accessibilityHint={user ? "Updates your saved campaign collection." : "Sign in to save this campaign."} accessibilityState={{ selected: saved, disabled: busy }} disabled={busy} onPress={() => { void toggleSaved(); }} style={({ pressed }) => ({ width: 48, minHeight: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.72)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", opacity: pressed || busy ? 0.6 : 1 })}>
          <Ionicons name={saved ? "heart" : "heart-outline"} size={22} color={saved ? imageAccent : "#FFFFFF"} accessible={false} />
        </Pressable>
      </View>
      <HomeCardCaption accessibilityLabel={`View ${c.title}. ${c.summary}. ${percentage}% funded.`} onPress={open} topSpace={22}>
        <Text style={{ color: "#FFFFFF", fontSize: 14, lineHeight: 19, fontWeight: "700", letterSpacing: -0.2 }}>{c.title}</Text>
        {!!c.summary && <Text numberOfLines={enlarged ? undefined : 1} style={{ color: imageMuted, fontSize: 11, lineHeight: 16 }}>{c.summary}</Text>}
      </HomeCardCaption>
      <Text numberOfLines={enlarged ? undefined : 2} style={{ color: imageMuted, fontSize: 11, lineHeight: 16 }}><Text style={{ color: imageAccent }}>{c.category}</Text> · {c.creatorName}{c.id.startsWith("demo_") ? " · Demo campaign" : ""}</Text>
      <Text style={{ color: imageMuted, fontSize: 10, lineHeight: 15 }}><Text style={{ color: "#FFFFFF", fontWeight: "700" }}>{money(c.raised)}</Text> of {money(c.goal)}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 8, rowGap: 7, paddingTop: 2 }}>
        <View accessible accessibilityLabel={`${compactHomeCount(count)} contributions`} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Ionicons name="people-outline" size={14} color={imageAccent} accessible={false} /><Text style={{ color: "#FFFFFF", fontSize: 10, lineHeight: 15 }}>{compactHomeCount(count)}</Text></View>
        <View accessible accessibilityLabel={`${percentage}% funded`} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Ionicons name="pie-chart-outline" size={14} color={imageAccent} accessible={false} /><Text style={{ color: "#FFFFFF", fontSize: 10, lineHeight: 15 }}>{percentage}%</Text></View>
        <View accessible accessibilityLabel={`${time.value} ${time.label}`} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Ionicons name="calendar-outline" size={14} color={imageAccent} accessible={false} /><Text style={{ color: "#FFFFFF", fontSize: 10, lineHeight: 15 }}>{time.value}{time.label === "planned days" ? "d planned" : "d left"}</Text></View>
      </View>
      <HomeFundingProgress raised={c.raised} goal={c.goal} />
      <Text style={{ color: imageMuted, fontSize: 11, lineHeight: 16 }}>{config ? `Est. ${number(estimate(c.goal, config))} people at goal` : "Reach estimate unavailable"}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${canBack ? "Back" : "View"} campaign: ${c.title}`} onPress={canBack ? () => router.push(`/explore/${encodeURIComponent(c.id)}/back`) : open} style={({ pressed }) => ({ minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ color: imageAccent, fontSize: 12, lineHeight: 17, fontWeight: "700", textAlign: "center", flexShrink: 1 }}>{canBack ? "Back campaign" : "View campaign"}</Text>
        <Ionicons name="arrow-forward" size={15} color={imageAccent} accessible={false} />
      </Pressable>
      {!!message && <Text accessibilityLiveRegion="polite" style={{ color: imageMuted, fontSize: 11, lineHeight: 16 }}>{message}</Text>}
    </View>
  </HomeCardArtwork>;
}
