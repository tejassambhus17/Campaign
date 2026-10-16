import {
  useRefreshOnFocus,
  refresh,
  useConfig,
  useMe,
  useSession,
} from "../../../../lib/session";
import { CampaignUpdates } from "../../../../features/updates";
import { useState } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../lib/api";
import { Campaign } from "../../../../lib/types";
import { audienceCampaign } from "../../../../lib/public-campaign";

import {
  Text,
  Button,
  fonts,
  ErrorState,
  Loading,
  Notice,
  Picture,
  Screen,
  useTheme,
} from "../../../../components/ui";
import {
  Disclosures,
  Funding,
  ShareButton,
  Story,
  CampaignJourney,
} from "../../../../features/campaign";
export default function CampaignDetail() {
  const { colors, styles } = useTheme();
  const { fontScale, width } = useWindowDimensions();
  const stackDock = fontScale > 1.15 || width < 350;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const q = useQuery({
    queryKey: ["campaign", id, user?.id],
    queryFn: () => api<Campaign>(`/campaigns/${id}`),
  });
  useRefreshOnFocus(q.refetch);
  const config = useConfig();
  const me = useMe();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function toggle(kind: "save" | "follow") {
    if (!user) {
      router.push("/profile");
      return;
    }
    setBusy(true);
    try {
      const r = await api<{ active: boolean }>(`/campaigns/${id}/${kind}`, {
        method: "POST",
      });
      setMessage(
        r.active
          ? kind === "save"
            ? "Campaign saved to your profile."
            : "You’re following this campaign. Updates will appear in Activity."
          : kind === "save"
            ? "Campaign removed from saved."
            : "You have stopped following this campaign.",
      );
      await refresh();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (q.isPending)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (q.isError)
    return (
      <Screen>
        <Button
          title="Back to Explore"
          variant="ghost"
          onPress={() => router.dismissTo("/explore")}
        />
        <ErrorState error={q.error} retry={() => q.refetch()} />
      </Screen>
    );
  const c = audienceCampaign(q.data);
  if (!c) return <Screen><Button title="Back to Explore" variant="ghost" icon="arrow-back" onPress={() => router.dismissTo("/explore")} /><Notice>The approved public campaign could not be loaded. Private edits cannot be backed. Open Profile to manage your campaign.</Notice></Screen>;
  const publicState = c.campaignState || c.status;
  const days = c.deadline
    ? Math.max(0, Math.ceil((Date.parse(c.deadline) - Date.now()) / 86400000))
    : undefined;
  return (
    <Screen scroll={false}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ width: "100%", maxWidth: 640, alignSelf: "center" }}>
          <View style={{ paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Button
              title="Explore"
              variant="ghost"
              icon="arrow-back"
              onPress={() => router.dismissTo("/explore")}
            />
            <ShareButton campaign={c} compact />
          </View>
          <Picture uri={c.coverImage} height={220} />
          <View style={{ padding: 18, gap: 14 }}>
            <View style={{ ...styles.row, justifyContent: "space-between" }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.muted,
                }}
              >
                {c.category}
              </Text>
              <Text style={{ ...styles.label, fontSize: 10 }}>
                Demo campaign
              </Text>
            </View>
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: 26,
                lineHeight: 33,
                color: colors.ink,
              }}
            >
              {c.title || "Untitled campaign"}
            </Text>
            <Text style={styles.muted}>
              By {c.creatorName} ·{" "}
              {c.publishedAt
                ? "Published "
                : c.submittedAt
                  ? "Submitted "
                  : "Created "}
              {new Date(
                c.publishedAt || c.submittedAt || c.createdAt,
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
            <View style={{ gap: 6 }}>
              <Text
                style={{
                  ...styles.muted,
                  color: colors.green,
                  fontWeight: "600",
                }}
              >
                {publicState}
                {c.revisionPending
                  ? " · Showing the approved public version; private changes are not included."
                  : ""}
              </Text>
            </View>
            <View
              style={{
                paddingVertical: 16,
                gap: 10,
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: colors.line,
              }}
            >
              <Funding campaign={c} config={config.data} />
              <Text style={styles.muted}>
                {publicState !== "Available for Funding"
                  ? `${c.durationDays}-day delivery plan · ${publicState === "Completed" ? "Distribution complete" : publicState === "Promoting" ? "Promotion in progress" : "Funding is not open"}`
                  : days === undefined
                    ? `${c.durationDays}-day campaign`
                    : days > 0
                      ? `${days} days remaining in the funding period`
                      : "Funding period has ended"}
                . Figures are demonstration data.
              </Text>
            </View>
            {!!c.summary && <Text style={styles.body}>{c.summary}</Text>}
            {!!c.feedback && <Notice>Review feedback: {c.feedback}</Notice>}
            <Story campaign={c} />
            <CampaignJourney campaign={c} />
            <Disclosures campaign={c} config={config.data} />
            <CampaignUpdates campaign={c} />
            <View style={styles.row}>
              <Button
                title={me.data?.saved.includes(id) ? "Saved" : "Save campaign"}
                variant="secondary"
                icon="bookmark-outline"
                disabled={busy}
                onPress={() => toggle("save")}
                style={{ flex: 1 }}
              />
              <Button
                title={
                  me.data?.followed.includes(id)
                    ? "Following"
                    : "Follow updates"
                }
                variant="secondary"
                icon="notifications-outline"
                disabled={busy}
                onPress={() => toggle("follow")}
                style={{ flex: 1 }}
              />
            </View>
            {!!message && <Notice>{message}</Notice>}
            <Button
              title="View progress & report"
              variant="secondary"
              icon="bar-chart-outline"
              onPress={() => router.push(`/explore/${id}/report`)}
            />
          </View>
        </View>
      </ScrollView>
      <View
        style={{
          borderTopWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.paper,
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <View
          style={{ width: "100%", maxWidth: 608, alignSelf: "center", gap: 6 }}
        >
          <View style={{ flexDirection: stackDock ? "column" : "row", alignItems: "stretch", gap: 10 }}>
            <View style={stackDock ? undefined : { flex: 1 }}>
              <Funding campaign={c} config={config.data} compact />
            </View>
            <Button
              title={
                publicState === "Available for Funding"
                  ? "Back campaign"
                  : publicState === "Completed"
                    ? "Final report"
                    : "Not open"
              }
              style={{ minWidth: 136, paddingHorizontal: 10 }}
              disabled={
                !["Available for Funding", "Completed"].includes(publicState)
              }
              onPress={() =>
                router.push(
                  `/explore/${id}/${publicState === "Completed" ? "report" : "back"}`,
                )
              }
            />
          </View>
          <Text style={{ ...styles.muted, fontSize: 11, lineHeight: 16 }}>
            Demo contributions fund advertising, not direct donations.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
