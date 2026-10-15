import React, { useState } from "react";
import { Platform, Share, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StoryPreview } from "./creation/Preview";
import { Campaign, Config, estimate, money, number } from "../lib/types";
import {
  Text,
  Accordion,
  Button,
  colors,
  fonts,
  Notice,
  Picture,
  Progress,
  styles,
} from "../components/ui";
export const detailPath = (id: string) => `/explore/${id}` as const;
export async function shareCampaign(c: Campaign) {
  if (!c.publishedAt)
    throw new Error(
      "Public sharing is available after review and publication.",
    );
  const privateRevision =
    c.revisionPending &&
    ["Draft", "Submitted for Review", "Changes Requested", "Approved"].includes(
      c.status,
    );
  const title = privateRevision ? "A message worth sharing" : c.title;
  const link =
    Platform.OS === "web"
      ? `${window.location.origin}/explore/${c.id}`
      : `amplify://explore/${c.id}`;
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
  return (
    <View style={{ gap: compact ? 6 : 11 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Text
          style={{
            fontSize: compact ? 18 : 22,
            fontWeight: "700",
            color: colors.ink,
            flexShrink: 1,
          }}
        >
          {money(c.raised)}{" "}
          <Text style={[styles.muted, compact && { fontSize: 13 }]}>
            of {money(c.goal)}
          </Text>
        </Text>
        <Text style={{ color: colors.green, fontSize: 13, fontWeight: "700" }}>
          {c.goal ? Math.round((c.raised / c.goal) * 100) : 0}%
        </Text>
      </View>
      <Progress raised={c.raised} goal={c.goal} />
      <View style={styles.row}>
        <Ionicons name="people-outline" color={colors.green} size={15} />
        <Text
          style={[
            styles.muted,
            { flexShrink: 1 },
            compact && { fontSize: 12, lineHeight: 18 },
          ]}
        >
          Est. {number(estimate(c.goal, config))} people at goal
        </Text>
      </View>
    </View>
  );
}
export function CampaignCard({
  campaign: c,
  config,
  compact = false,
}: {
  campaign: Campaign;
  config?: Config;
  compact?: boolean;
}) {
  return (
    <View style={styles.card}>
      <Picture uri={c.coverImage} height={compact ? 140 : 184} />
      <View style={{ padding: 16, gap: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text
            style={{ fontSize: 12, color: colors.orange, fontWeight: "600" }}
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
            fontFamily: fonts.editorialStrong,
            fontSize: 26,
            lineHeight: 29,
            color: colors.ink,
          }}
        >
          {c.title}
        </Text>
        <Text style={{ fontSize: 13, color: colors.muted }}>
          by {c.creatorName}
        </Text>
        {!!c.summary && (
          <Text
            style={{ ...styles.body, fontSize: 14, lineHeight: 21 }}
            numberOfLines={compact ? 2 : 3}
          >
            {c.summary}
          </Text>
        )}
        <Funding campaign={c} config={config} compact />
        <Button
          title={
            c.status === "Available for Funding"
              ? "Back this campaign"
              : "Read the campaign"
          }
          variant="ghost"
          style={{
            borderTopWidth: 1,
            borderColor: colors.line,
            paddingBottom: 0,
            marginTop: 2,
          }}
          icon="arrow-forward"
          onPress={() => router.push(detailPath(c.id))}
        />
      </View>
    </View>
  );
}
export function Story({ campaign: c }: { campaign: Campaign }) {
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
  return (
    <View>
      <Accordion title="Where your contribution goes">
        <Text style={styles.body}>
          Your contribution pays for distribution of this message. It is not a
          direct donation to the cause or a transfer to the creator.
        </Text>
        <Text style={styles.body}>
          Demo policy: {Math.round((config?.feeRate ?? 0.05) * 100)}% platform
          fee, with the remainder reserved for advertising. No additional
          transaction fee; the amount you select is your total simulated
          payment.
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
          Illustrative model: {config?.peoplePerAdDollar ?? 27} people per
          advertising dollar after the platform fee. {money(1)} contributed is
          approximately {number(estimate(1, config))} people. Actual reach
          depends on inventory, price, targeting, delivery and performance.
          Unique reach and impressions are different metrics. No audience size
          is guaranteed.
        </Text>
      </Accordion>
    </View>
  );
}
export function ShareButton({ campaign }: { campaign: Campaign }) {
  const [error, setError] = useState("");
  return (
    <View style={{ gap: 8 }}>
      <Button
        title="Share campaign"
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
