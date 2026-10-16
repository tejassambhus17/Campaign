import React, { useState } from "react";
import { Linking, Pressable, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Accordion,
  Notice,
  Picture,
  Text,
  fonts,
  useTheme,
} from "../../components/ui";
import {
  Campaign,
  Config,
  quote,
  money,
  number,
} from "../../lib/types";
import { isPublicUrl } from "./model";
import { lightColors } from "../../lib/appearance";

export function AdPreview({
  draft,
  placement = "Instagram",
}: {
  draft: Campaign;
  placement?: string;
}) {
  const { colors, styles } = useTheme();
  return (
    <View style={{ gap: 8, width: "100%", maxWidth: 286, alignSelf: "center" }}>
    <View style={{ borderWidth: 3, borderColor: colors.line, borderRadius: 23, padding: 3, backgroundColor: colors.surfaceRaised }}>
    {/* The creative previews a fixed light placement independently of app appearance. */}
    <View style={[styles.card, { borderRadius: 16, backgroundColor: lightColors.paper, borderColor: lightColors.line }]}>
      <View style={{ paddingHorizontal: 11, paddingVertical: 8, gap: 1 }}>
        <Text style={{ fontSize: 11, lineHeight: 16, fontWeight: "700", color: lightColors.ink }}>
          {draft.creatorName || "Your organization"}
        </Text>
        <Text style={{ fontSize: 10, lineHeight: 14, color: lightColors.muted }}>Advertisement preview · {placement}</Text>
      </View>
      <Picture
        uri={draft.adImages[0]}
        height={placement === "Display" ? 120 : 150}
      />
      <View style={{ padding: 11, gap: 6 }}>
        <Text
          style={{
            fontSize: 16,
            lineHeight: 21,
            fontWeight: "700",
            color: lightColors.ink,
          }}
        >
          {draft.adHeadline ||
            draft.title.slice(0, 60) ||
            "Your message, out in the world."}
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 18, color: lightColors.text }}>
          {draft.adDescription ||
            draft.summary ||
            "Add an advertising description to see it here."}
        </Text>
        <View
          style={{
            alignItems: "center",
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: lightColors.primary,
            borderRadius: 10,
            marginTop: 2,
          }}
        >
          <Text style={{ fontSize: 12, lineHeight: 18, fontWeight: "700", color: lightColors.onPrimary }}>
            {draft.cta || "Learn more"}
          </Text>
        </View>
      </View>
    </View>
    </View>
    <Text style={[styles.muted, { textAlign: "center", fontSize: 10, lineHeight: 14 }]}>Illustrative {placement} placement. No live advertising.</Text>
    </View>
  );
}

export function StoryPreview({
  draft,
  campaignHeader,
}: {
  draft: Campaign;
  campaignHeader?: Pick<Campaign, "title" | "summary">;
}) {
  const { colors, styles } = useTheme();
  const [linkError, setLinkError] = useState("");
  async function open(url: string) {
    if (!isPublicUrl(url)) {
      setLinkError(
        "This source needs a valid public URL before it can be opened.",
      );
      return;
    }
    try {
      await Linking.openURL(url);
      setLinkError("");
    } catch {
      setLinkError(
        "This source could not be opened. Check the URL and try again.",
      );
    }
  }
  return (
    <View style={{ gap: 20 }}>
      {!!draft.storyHeadline &&
        draft.storyHeadline.trim() !== campaignHeader?.title.trim() && (
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: fonts.bold,
              fontSize: 23,
              lineHeight: 30,
              color: colors.ink,
            }}
          >
            {draft.storyHeadline}
          </Text>
        )}
      {!!draft.intro &&
        draft.intro.trim() !== campaignHeader?.summary.trim() && (
          <Text style={[styles.body, { fontSize: 16, lineHeight: 25 }]}>
            {draft.intro}
          </Text>
        )}
      {draft.sections.map((section) => (
        <View key={section.id} style={{ gap: 7 }}>
          {section.kind === "image" ? (
            <>
              <Picture uri={section.url} height={215} />
              {!!section.caption && (
                <Text style={styles.muted}>{section.caption}</Text>
              )}
              {!!section.credit && (
                <Text style={styles.muted}>
                  Image credit: {section.credit}
                </Text>
              )}
            </>
          ) : section.kind === "heading" ? (
            <Text
              accessibilityRole="header"
              style={{
                fontFamily: fonts.semibold,
                fontSize: 20,
                lineHeight: 27,
                color: colors.ink,
              }}
            >
              {section.text}
            </Text>
          ) : section.kind === "statistic" ? (
            <View
              style={{
                backgroundColor: colors.mint,
                padding: 18,
                borderRadius: 10,
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  lineHeight: 31,
                  fontWeight: "700",
                  color: colors.green,
                }}
              >
                {section.text}
              </Text>
              {!!section.caption && (
                <Text style={styles.body}>{section.caption}</Text>
              )}
            </View>
          ) : section.kind === "action" ? (
            <View
              style={{
                backgroundColor: colors.mint,
                borderRadius: 10,
                padding: 16,
                gap: 8,
              }}
            >
              <Text style={{ fontWeight: "700", color: colors.ink }}>
                What you can do
              </Text>
              <Text style={styles.body}>{section.text}</Text>
            </View>
          ) : (
            <Text
              style={[
                styles.body,
                { fontSize: 16, lineHeight: 26 },
                section.format === "bold" && { fontWeight: "700" },
                section.format === "italic" && { fontStyle: "italic" },
              ]}
            >
              {section.format === "bullet" ? "• " : ""}
              {section.text}
            </Text>
          )}
        </View>
      ))}
      {!draft.storyHeadline && !draft.intro && !draft.sections.length && (
        <Text style={styles.muted}>
          Your story will appear here as you write it.
        </Text>
      )}
      {!!draft.sources.length && (
        <Accordion
          title={`Sources & evidence (${draft.sources.length})`}
          initiallyOpen
        >
          <Text style={styles.muted}>
            {campaignHeader
              ? "Public sources provided by the creator for context and evidence."
              : "These sources will be visible to everyone reading the campaign."} Source links provide supporting context; they do not establish independent verification.
          </Text>
          {draft.sources.map((source, index) => (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Open source ${source.title || index + 1}. ${source.url || "Missing URL"}. Opens outside Campaign.`}
              accessibilityHint="Opens the creator-provided public source in your browser."
              onPress={() => {
                void open(source.url);
              }}
              key={source.id}
              style={{ minHeight: 48, paddingVertical: 10, gap: 4 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    color: colors.green,
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {index + 1}. {source.title || "Untitled source"}
                </Text>
                <Ionicons name="open-outline" size={18} color={colors.green} />
              </View>
              {isPublicUrl(source.url) && <Text style={[styles.muted, { fontWeight: "600" }]}>{new URL(source.url).hostname}</Text>}
              <Text selectable style={styles.muted}>
                {source.url || "Add a source URL"}
              </Text>
            </Pressable>
          ))}
        </Accordion>
      )}
      {!!linkError && <View accessibilityLiveRegion="polite"><Notice tone="error">{linkError} The source URL remains visible above so you can copy it.</Notice></View>}
    </View>
  );
}

export function FundingPolicies({ config }: { config?: Config }) {
  const { colors, styles } = useTheme();
  return (
      <Accordion title="Funding policies & campaign rules" initiallyOpen>
        <Text style={styles.body}>
          Demo policy · No real payments or advertisements. Contributions
          support distribution of this message and are never paid directly to
          the creator or cause.
        </Text>
        {config?.policies ? (
          Object.entries(config.policies).map(([key, value]) => (
            <View key={key} style={{ gap: 5 }}>
              <Text style={{ fontWeight: "700", color: colors.ink }}>
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (character) => character.toUpperCase())}
              </Text>
              <Text style={styles.body}>{value}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.muted}>
            Connect to the server to load the current allocation, refund, and
            unspent-funds policy before submitting.
          </Text>
        )}
        <Text style={styles.body}>
          Share accurate information, include supporting sources for factual
          claims, and use only media you have permission to distribute. Review
          approval is required before publication; funding completion does not
          launch advertising automatically.
        </Text>
      </Accordion>
  );
}

export function CampaignPreview({
  draft,
  config,
}: {
  draft: Campaign;
  config?: Config;
}) {
  const { colors, styles } = useTheme();
  const [view, setView] = useState<"campaign" | "advertisement">("campaign");
  const funding = config ? quote(draft.goal, config) : null;
  return (
    <View style={{ gap: 20 }}>
      <View accessibilityRole="tablist" style={{ flexDirection: "row", padding: 3, borderWidth: 1, borderColor: colors.outline, borderRadius: 28, backgroundColor: colors.bg }}>
        {([
          ["campaign", "Campaign page"],
          ["advertisement", "Social ad"],
        ] as const).map(([value, label]) => (
          <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: view === value }} onPress={() => setView(value)} style={({ pressed }) => ({ flex: 1, minHeight: 46, paddingVertical: 10, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: view === value ? colors.primary : "transparent", opacity: pressed ? 0.75 : 1 })}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: view === value ? colors.onPrimary : colors.text }}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {view === "campaign" && <>
      <View style={styles.card}>
        {!!draft.coverImage && <Picture uri={draft.coverImage} height={220} />}
        <View style={{ padding: 16, gap: 9 }}>
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: 23,
              lineHeight: 29,
              color: colors.ink,
            }}
          >
            {draft.title || "Your campaign title"}
          </Text>
          <Text style={styles.muted}>
            By {draft.creatorName || "Your name or organization"}
          </Text>
          <Text style={[styles.muted, { fontSize: 12 }]}>{draft.category || "Category not selected"}</Text>
          {!!draft.summary && <Text style={styles.body}>{draft.summary}</Text>}
        </View>
      </View>
      <StoryPreview draft={draft} campaignHeader={draft} />
      </>}
      {view === "advertisement" &&
      <View
        style={{
          gap: 16,
        }}
      >
        <AdPreview draft={draft} placement={draft.channels[0]} />
        {draft.adImages.length > 1 && (
          <View style={{ gap: 12 }}>
            <Text style={styles.label}>Additional advertising images</Text>
            {draft.adImages.slice(1).map((uri, index) => (
              <Picture key={`${uri}-${index}`} uri={uri} height={180} />
            ))}
          </View>
        )}
      </View>
      }
      <Text style={styles.muted}>
        Draft preview · Approval is required before publication. Contributions fund message distribution. Story and advertising assets remain separate.
      </Text>
      <View style={{ gap: 12 }}>
        <Text style={styles.h2}>Audience & distribution</Text>
        <Text style={styles.body}>
          {draft.geography || "Geography not set"}
          {draft.interests ? ` · ${draft.interests}` : ""}
        </Text>
        <Text style={styles.muted}>
          {draft.channels.join(" + ") || "Select distribution channels"} ·{" "}
          {draft.durationDays} days
        </Text>
        {draft.channels.map((channel) => (
          <View
            style={[styles.row, { justifyContent: "space-between" }]}
            key={channel}
          >
            <Text style={styles.body}>{channel}</Text>
            <Text style={styles.body}>
              {draft.allocation[channel] || 0}%
              {funding && draft.goal > 0 ? ` · ${money((funding.adBudget * (draft.allocation[channel] || 0)) / 100)}` : ""}
            </Text>
          </View>
        ))}
        <Text style={styles.muted}>
          These are your proposed settings. The platform may finalize targeting,
          placements, and allocation during review.
        </Text>
      </View>
      <View
        style={{
          borderTopWidth: 1,
          borderColor: colors.line,
          paddingTop: 20,
          gap: 12,
        }}
      >
        <Text style={styles.h2}>Funding review</Text>
        <View
          style={{
            ...styles.row,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Text style={styles.body}>Your funding goal</Text>
          <Text style={{ ...styles.h2, fontSize: 22 }}>
            {draft.goal ? money(draft.goal) : "Not set yet"}
          </Text>
        </View>
        <View style={{ ...styles.row, justifyContent: "space-between" }}>
          <Text style={styles.body}>Platform fee</Text>
          <Text style={styles.body}>{funding ? money(funding.fee) : "Unavailable"}</Text>
        </View>
        <View
          style={{
            ...styles.row,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Text style={styles.body}>Advertising budget</Text>
          <Text style={{ ...styles.body, fontWeight: "700" }}>
            {funding ? money(funding.adBudget) : "Unavailable"}
          </Text>
        </View>
        <Text
          style={{ ...styles.body, fontWeight: "700", color: colors.green }}
        >
          {funding && draft.goal > 0 ? `Est. ${number(funding.reach)} people` : draft.goal > 0 ? "Reach estimate unavailable" : "Set your goal at Submit for a reach estimate"}
        </Text>
        <Text style={styles.muted}>
          {config ? `Demo model: ${config.peoplePerAdDollar} people per advertising dollar after the ${(config.feeRate * 100).toFixed(0)}% fee. Reach depends on prices, inventory, targeting, delivery, and performance; it is never guaranteed.` : "Connect to load current fees, funding policies and estimate assumptions. Your draft remains editable; no fee or audience estimate is assumed."}
        </Text>
      </View>
      <FundingPolicies config={config} />
    </View>
  );
}
