import { CurrencyNote } from "../components/CurrencyNote";
import { useCurrency } from "../lib/CurrencyProvider";
import React, { useState } from "react";
import { Platform, Pressable, Share, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StoryPreview } from "./creation/Preview";
import { Campaign, Config, estimate, number } from "../lib/types";
import { audienceCampaign } from "../lib/public-campaign";
import {
  Text,
  Accordion,
  Button,
  Notice,
  Progress,
  useTheme,
} from "../components/ui";
import { CampaignCover, CampaignStats } from "./showcase";
export { CampaignCover, CampaignStats, hasIllustrativeCover } from "./showcase";
export { CampaignJourney } from "./CampaignJourney";
export const detailPath = (id: string) => `/explore/${id}` as const;
export async function shareCampaign(campaign: Campaign) {
  const c = audienceCampaign(campaign);
  if (!campaign.publishedAt)
    throw new Error(
      "Public sharing is available after review and publication.",
    );
  // A published route can still be shared if a managed snapshot is unavailable;
  // use a generic label rather than exposing any private draft content.
  const title = c?.title || "A message worth sharing";
  const link =
    Platform.OS === "web"
      ? `${window.location.origin}/explore/${campaign.id}`
      : `amplify://explore/${campaign.id}`;
  await Share.share({
    title,
    message: `${title}\nHelp this message reach more people. Demo campaign: ${link}`,
    url: link,
  });
}
export function Funding({ campaign: c, config, compact = false, showEstimate = true }: { campaign: Campaign; config?: Config; compact?: boolean; showEstimate?: boolean }) {
  const { colors } = useTheme();
  const { money } = useCurrency();
  return <View style={{ gap: 6 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
      <Text style={{ fontSize: compact ? 12 : 15, lineHeight: compact ? 17 : 22, fontWeight: "700", fontVariant: ["tabular-nums"], color: colors.ink, flex: 1, minWidth: 0 }}>{money(c.raised)} <Text style={{ fontSize: compact ? 10 : 12, lineHeight: compact ? 15 : 18, color: colors.muted }}>of {money(c.goal)}</Text></Text>
      <Text style={{ color: colors.ink, fontSize: compact ? 10 : 12, lineHeight: compact ? 15 : 18, fontWeight: "700", fontVariant: ["tabular-nums"], flexShrink: 0 }}>{c.goal ? Math.round((c.raised / c.goal) * 100) : 0}%</Text>
    </View>
    <Progress raised={c.raised} goal={c.goal} />
    <CurrencyNote />
    {showEstimate && <Text style={{ color: colors.muted, fontSize: compact ? 10 : 12, lineHeight: compact ? 14 : 18 }}>{config ? `Est. ${number(estimate(c.goal, config))} people at goal` : "Reach estimate unavailable"}</Text>}
  </View>;
}
export function CampaignCard({ campaign, config, compact = false }: { campaign: Campaign; config?: Config; compact?: boolean }) {
  const { colors, styles } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const c = audienceCampaign(campaign);
  if (!c) return <Notice>The approved campaign is unavailable. Open your creator dashboard to manage private changes.</Notice>;
  const state = c.campaignState || c.status;
  const open = () => router.push(detailPath(c.id));
  const canBack = state === "Available for Funding";
  const back = () => router.push(`/explore/${c.id}/back`);
  if (compact) return <Pressable accessibilityRole="button" accessibilityLabel={`Read ${c.title}. ${c.category}. By ${c.creatorName}. ${state}. ${c.summary}`} onPress={open} style={({ pressed }) => ({ flexDirection: "row", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.line, opacity: pressed ? 0.75 : 1 })}>
    <View style={{ width: width < 370 ? 86 : 96, borderRadius: 11, overflow: "hidden", alignSelf: "flex-start" }}><CampaignCover campaign={c} height={132} /></View>
    <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
      <Text style={{ fontSize: 14, lineHeight: 18, fontWeight: "700", color: colors.ink }} numberOfLines={2}>{c.title}</Text>
      <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 13 }} numberOfLines={1}>{c.category} · {c.creatorName}</Text>
      {!!c.summary && <Text style={{ color: colors.text, fontSize: 11, lineHeight: 16 }} numberOfLines={2}>{c.summary}</Text>}
      <View style={{ paddingTop: 2 }}>
        <Funding campaign={c} config={config} compact showEstimate={false} />
        <View style={{ flexDirection: fontScale > 1.3 || width < 350 ? "column" : "row", gap: 8, alignItems: fontScale > 1.3 || width < 350 ? "stretch" : "center" }}>
          <Text style={{ flex: 1, color: colors.muted, fontSize: 10, lineHeight: 15 }}>{config ? `Est. ${number(estimate(c.goal, config))} people at goal` : "Reach unavailable"}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`${canBack ? "Back" : "View"} ${c.title}`} onPress={canBack ? back : open} style={({ pressed }) => ({ minHeight: 48, flexDirection: "row", gap: 4, alignItems: "center", justifyContent: "flex-end", opacity: pressed ? 0.65 : 1 })}>
            <Text style={{ color: colors.primary, fontSize: 11, lineHeight: 16, fontWeight: "700" }}>{canBack ? "Back campaign" : "View campaign"}</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </Pressable>
        </View>
      </View>
    </View>
  </Pressable>;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Read ${c.title}. ${c.category}. By ${c.creatorName}. ${state}. Demo campaign.`} onPress={open} style={({ pressed }) => ({ ...styles.card, opacity: pressed ? 0.85 : 1 })}>
    <View><CampaignCover campaign={c} height={160} /><View style={{ position: "absolute", left: 12, top: 12, borderRadius: 7, paddingVertical: 5, paddingHorizontal: 8, backgroundColor: "#8EF4C5", flexDirection: "row", gap: 4, alignItems: "center" }}><Ionicons name="megaphone" size={11} color="#103C31" /><Text style={{ fontSize: 10, fontWeight: "700", color: "#103C31" }}>Spotlight · demo</Text></View></View>
    <View style={{ padding: 13, gap: 7 }}>
      <Text style={{ fontSize: 20, lineHeight: 25, fontWeight: "700", color: colors.ink }} numberOfLines={2}>{c.title}</Text>
      <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 14 }} numberOfLines={1}>{c.category} · By {c.creatorName}</Text>
      {!!c.summary && <Text style={{ color: colors.text, fontSize: 12, lineHeight: 17 }} numberOfLines={2}>{c.summary}</Text>}
      <Funding campaign={c} config={config} showEstimate={false} />
      <CampaignStats campaign={c} config={config} />
      <Button title={canBack ? "Back this campaign" : "Read campaign"} onPress={canBack ? back : open} style={{ marginTop: 3 }} />
    </View>
  </Pressable>;
}
export function Story({ campaign: c }: { campaign: Campaign }) {
  const { styles } = useTheme();
  return (
    <View style={{ gap: 18 }}>
      <StoryPreview
        draft={c}
        campaignHeader={{ title: c.title, summary: c.summary }}
      />
      {!c.sources.length && (
        <Text style={styles.muted}>No supporting sources added.</Text>
      )}
      <Text style={styles.muted}>
        Sources are creator-supplied context, not independent verification of
        this campaign.
      </Text>
    </View>
  );
}
export function Disclosures({
  campaign: c,
  config,
  details,
}: {
  campaign: Campaign;
  config?: Config;
  details?: React.ReactNode;
}) {
  const { styles } = useTheme();
  const { money } = useCurrency();
  return (
    <View>
      <Accordion title="Where your contribution goes">
        <Text style={styles.body}>
          Your contribution pays for distribution of this message. It is not a
          direct donation to the cause or a transfer to the creator.
        </Text>
        <Text style={styles.body}>
          {config
            ? `Demo policy: ${Number((config.feeRate * 100).toFixed(2))}% included platform fee, with the remainder reserved for advertising. No additional transaction fee; the amount you select is your total simulated payment.`
            : "Current fee settings are unavailable. Load the contribution review before paying to see the included fee, advertising budget and total."}
        </Text>
        <Text style={styles.body}>
          {config?.policies.refunds ||
            "Cancellation before promotion refunds the full simulated contribution. After promotion, only unspent net advertising funds are refunded proportionally; the platform fee is retained."}
        </Text>
        <Text style={styles.body}>
          {config?.policies.unspent ||
            "Unspent net advertising funds are refunded proportionally on completion."}
        </Text>
        <Text style={styles.body}>
          {config?.policies.partialFunding ||
            "Partial funding requires explicit reviewer approval before distribution."}
        </Text>
      </Accordion>
      {details || <Accordion title="Intended audience & distribution">
        <Text style={styles.body}>
          {c.geography || "Location not selected"} ·{" "}
          {c.interests || "Broad audience"}
        </Text>
        <Text style={styles.body}>
          Channels: {c.channels?.join(", ") || "Not selected"}. Duration:{" "}
          {c.durationDays} days. Proposed allocation:{" "}
          {Object.entries(c.allocation || {})
            .map(([k, v]) => `${k} ${v}%`)
            .join(" · ")}
          .
        </Text>
        <Text style={styles.muted}>
          Creator selections are proposals. The platform finalizes eligible
          placements and targeting during review. Advertising may use broad
          location and interests; private backer identities are not shared for
          targeting. No live distribution partner is connected in this demo.
        </Text>
        <Button title="See the audience and distribution plan" variant="ghost" onPress={() => router.push(`/explore/${c.id}/audience`)} />
      </Accordion>}
      <Accordion title="How review works">
        <Text style={styles.body}>
          A restricted reviewer inspects the message, supporting sources,
          creative assets and proposed audience before publication. A campaign
          may be approved, returned for changes or rejected. This demo shows the
          process. Policy approval, evidence assessment, advertising readiness
          and actual delivery are separate. Any published Trust Score follows
          Campaign&apos;s documented prototype rubric; it is not independent
          fact-checking, identity verification or advertising-platform approval.
        </Text>
        <Button title="See the campaign assessment" variant="ghost" onPress={() => router.push(`/explore/${c.id}/assessment`)} />
      </Accordion>
      {!details && <Accordion title="How estimated reach is calculated">
        <Text style={styles.body}>
          {config
            ? `Illustrative model: ${config.peoplePerAdDollar} people per advertising dollar after the platform fee. ${money(1)} contributed is approximately ${number(estimate(1, config))} people.`
            : "The configured audience estimate is unavailable until the current settings load."}{" "}
          Actual reach depends on inventory, price, targeting, delivery and performance.
          Unique reach and impressions are different metrics. No audience size is guaranteed.
        </Text>
      </Accordion>}
    </View>
  );
}
export function ShareButton({ campaign, compact = false }: { campaign: Campaign; compact?: boolean }) {
  const { styles } = useTheme();
  const [error, setError] = useState("");
  return (
    <View style={{ gap: 8, flexShrink: 1, minWidth: 0 }}>
      <Button
        title={compact ? "Share" : "Share campaign"}
        variant="ghost"
        icon="share-outline"
        disabled={!campaign.publishedAt}
        onPress={() =>
          shareCampaign(campaign).catch((e) => setError(String(e.message)))
        }
      />
      {!campaign.publishedAt && (
        <Text style={styles.muted}>
          Public sharing is available after review and publication.
        </Text>
      )}
      {!!error && <Notice tone="error">{error}</Notice>}
    </View>
  );
}
