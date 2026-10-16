import React, { useState } from "react";
import { Platform, Pressable, Share, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StoryPreview } from "./creation/Preview";
import { Campaign, Config, estimate, money, number } from "../lib/types";
import { audienceCampaign, campaignJourneyDates } from "../lib/public-campaign";
import {
  Text,
  Accordion,
  Button,
  fonts,
  Notice,
  Picture,
  Progress,
  useTheme,
} from "../components/ui";
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
export function Funding({
  campaign: c,
  config,
  compact = false,
}: {
  campaign: Campaign;
  config?: Config;
  compact?: boolean;
}) {
  const { colors, styles } = useTheme();
  return (
    <View style={{ gap: compact ? 5 : 9 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Text
          style={{
            fontSize: compact ? 17 : 23,
            fontWeight: "700",
            color: colors.ink,
            flexShrink: 1,
          }}
        >
          {money(c.raised)}{" "}
          <Text style={[styles.muted, compact && { fontSize: 13 }]}>
            of {money(c.goal)} goal
          </Text>
        </Text>
        <Text style={{ color: colors.ink, fontSize: 13, fontWeight: "700" }}>
          {c.goal ? Math.round((c.raised / c.goal) * 100) : 0}%
        </Text>
      </View>
      <Progress raised={c.raised} goal={c.goal} />
      <View style={styles.row}>
        <Ionicons name="people-outline" color={colors.muted} size={15} />
        <Text
          style={[
            styles.muted,
            { flexShrink: 1 },
            compact && { fontSize: 12, lineHeight: 18 },
          ]}
        >
          {config ? `Est. ${number(estimate(c.goal, config))} people at goal` : "Reach estimate unavailable until settings load"}
        </Text>
      </View>
    </View>
  );
}
export function CampaignCard({
  campaign,
  config,
  compact = false,
}: {
  campaign: Campaign;
  config?: Config;
  compact?: boolean;
}) {
  const { colors, styles } = useTheme();
  const c = audienceCampaign(campaign);
  if (!c) return <Notice>The approved campaign is unavailable. Open your creator dashboard to manage private changes.</Notice>;
  const state = c.campaignState || c.status;
  const action = state === "Available for Funding" ? "Back this campaign" : "Read campaign";
  const open = () => router.push(detailPath(c.id));
  if (compact) return (
    <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.line, gap: 11 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Read ${c.title}`} onPress={open} style={({ pressed }) => ({ flexDirection: "row", gap: 12, opacity: pressed ? 0.75 : 1 })}>
        <View style={{ width: 100, borderRadius: 12, overflow: "hidden", alignSelf: "flex-start" }}><Picture uri={c.coverImage} height={112} /></View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{c.category}</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: colors.ink }} numberOfLines={3}>{c.title}</Text>
          <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>By {c.creatorName}</Text>
          {!!c.summary && <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19 }} numberOfLines={2}>{c.summary}</Text>}
        </View>
      </Pressable>
      <Funding campaign={c} config={config} compact />
      <View style={{ ...styles.row, justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
        <Text style={{ ...styles.muted, fontSize: 11, flex: 1 }}>{state} · Demo</Text>
        <Button title={action} variant="ghost" icon="arrow-forward" onPress={open} style={{ paddingHorizontal: 6 }} />
      </View>
    </View>
  );
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Read ${c.title}`} onPress={open}><Picture uri={c.coverImage} height={150} /></Pressable>
      <View style={{ padding: 14, gap: 9 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text
            style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}
          >
            {c.category}
          </Text>
          <Text style={{ fontSize: 10, color: colors.muted }}>
            Demo campaign
          </Text>
        </View>
        <Text
          onPress={() => router.push(detailPath(c.id))}
          accessibilityRole="link"
          style={{
            fontFamily: fonts.bold,
            fontSize: 20,
            lineHeight: 26,
            color: colors.ink,
          }}
        >
          {c.title}
        </Text>
        <Text style={{ fontSize: 13, color: colors.muted }}>
          By {c.creatorName}
        </Text>
        <Funding campaign={c} config={config} compact />
        {!!c.summary && (
          <Text
            style={{ ...styles.body, fontSize: 13, lineHeight: 19 }}
            numberOfLines={2}
          >
            {c.summary}
          </Text>
        )}
        <Button
          title={action}
          style={{ marginTop: 2 }}
          icon="arrow-forward"
          onPress={() => router.push(detailPath(c.id))}
        />
      </View>
    </View>
  );
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
}: {
  campaign: Campaign;
  config?: Config;
}) {
  const { styles } = useTheme();
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
      <Accordion title="Intended audience & distribution">
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
      </Accordion>
      <Accordion title="How review works">
        <Text style={styles.body}>
          A restricted reviewer inspects the message, supporting sources,
          creative assets and proposed audience before publication. A campaign
          may be approved, returned for changes or rejected. This demo shows the
          process; it does not claim independent verification or assign a trust
          score.
        </Text>
      </Accordion>
      <Accordion title="How estimated reach is calculated">
        <Text style={styles.body}>
          {config
            ? `Illustrative model: ${config.peoplePerAdDollar} people per advertising dollar after the platform fee. ${money(1)} contributed is approximately ${number(estimate(1, config))} people.`
            : "The configured audience estimate is unavailable until the current settings load."}{" "}
          Actual reach depends on inventory, price, targeting, delivery and performance.
          Unique reach and impressions are different metrics. No audience size is guaranteed.
        </Text>
      </Accordion>
    </View>
  );
}
export function ShareButton({ campaign, compact = false }: { campaign: Campaign; compact?: boolean }) {
  const { styles } = useTheme();
  const [error, setError] = useState("");
  return (
    <View style={{ gap: 8 }}>
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

// Only publication and the current public lifecycle are exposed here. This is
// not a fabricated event history, and it never fetches the restricted audit API.
export function CampaignJourney({ campaign: c, report }: { campaign: Campaign; report?: Record<string, unknown> }) {
  const { colors, styles } = useTheme();
  const state = c.campaignState || c.status;
  const indices: Record<string, number> = {
    "Available for Funding": 1,
    "Funding Goal Reached": 1,
    "Funding Period Ends": 1,
    "Distribution Preparation": 2,
    Promoting: 3,
    Completed: 4,
  };
  const current = indices[state] ?? (c.publishedAt ? 1 : 0);
  const exceptional = ["Cancelled", "Rejected", "Failed", "Refund Pending"].includes(state);
  const explanation = exceptional
    ? "This campaign is not accepting backing. Open the report for recorded funds and any refunds."
    : state === "Completed"
      ? "Distribution is complete. The report separates simulated results from estimates."
      : state === "Promoting"
        ? "Promotion is in progress. Delivery is simulated in this local prototype."
        : state === "Distribution Preparation"
          ? "The platform is preparing approved creative, audience settings and advertising funds."
          : state === "Funding Goal Reached" || state === "Funding Period Ends"
            ? "Funding has closed. A separate approval and setup check must happen before promotion."
            : c.publishedAt
              ? "Reviewed before public backing. Reaching the goal does not start advertising automatically."
              : "Content is reviewed before public backing. Funding and promotion are separate stages.";
  const stages = ["Review", "Funding", "Preparation", "Promoting", "Report"];
  const dates = campaignJourneyDates(c, report);
  return (
    <View style={{ gap: 12, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }}>
      <Text style={{ ...styles.h2, fontSize: 18 }}>Campaign journey</Text>
      <Text style={{ ...styles.muted, color: exceptional ? colors.warning : colors.text, fontWeight: "600" }}>{state}</Text>
      <View accessibilityLabel={`Campaign journey. Current status: ${state}`} style={{ flexDirection: "row", gap: 5 }}>
        {stages.map((stage, index) => (
          <View key={stage} style={{ flex: 1, gap: 6, alignItems: "center" }}>
            <View style={{ height: 4, width: "100%", backgroundColor: index <= current ? colors.progress : colors.progressTrack, borderRadius: 3 }} />
            <Ionicons name={index < current ? "checkmark-circle" : index === current ? (exceptional ? "pause-circle-outline" : "radio-button-on") : "ellipse-outline"} size={20} color={index <= current ? colors.primary : colors.muted} />
            <Text style={{ fontSize: 11, lineHeight: 16, textAlign: "center", fontWeight: index === current ? "700" : "400", color: index === current ? colors.ink : colors.muted }}>{stage}</Text>
          </View>
        ))}
      </View>
      {!!dates.length && <View style={{ gap: 4 }}>{dates.map(({ label, date }) => <Text key={label} style={{ ...styles.muted, fontSize: 12 }}>{label} · {new Date(date).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</Text>)}</View>}
      <Text style={styles.muted}>{explanation}</Text>
    </View>
  );
}
