import { useRef, useState } from "react";
import { Linking, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import PagerView from "../../../../components/NativePager";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../lib/api";
import { Campaign } from "../../../../lib/types";
import { useCurrency } from "../../../../lib/CurrencyProvider";
import { CurrencyNote } from "../../../../components/CurrencyNote";
import { detailSections as sections } from "../../../../features/detail-sections";
import { useDetailSections } from "../../../../features/useDetailSections";
import { audienceCampaign } from "../../../../lib/public-campaign";
import { refresh, useConfig, useMe, useRefreshOnFocus, useSession } from "../../../../lib/session";
import { isPublicUrl } from "../../../../features/creation/model";
import { CampaignUpdates } from "../../../../features/updates";
import { Text, Button, fonts, ErrorState, Loading, Notice, Progress, Screen, useTheme } from "../../../../components/ui";
import { CampaignCover, CampaignStats, Disclosures, ShareButton, Story, CampaignJourney } from "../../../../features/campaign";

function CampaignSources({ campaign }: { campaign: Campaign }) {
  const { colors, styles } = useTheme();
  const [error, setError] = useState("");
  async function openSource(url: string) {
    if (!isPublicUrl(url)) {
      setError("This source needs a valid public URL before it can be opened.");
      return;
    }
    try {
      await Linking.openURL(url);
      setError("");
    } catch {
      setError("This source could not be opened. Check the URL and try again.");
    }
  }
  return (
    <View style={{ gap: 15 }}>
      <Text accessibilityRole="header" style={styles.h2}>Sources & evidence</Text>
      <Text style={styles.muted}>Public sources supplied by the creator for context. They do not establish independent verification.</Text>
      {campaign.sources.length ? campaign.sources.map((source, index) => (
        <Pressable
          key={source.id}
          accessibilityRole="link"
          accessibilityLabel={`Open source ${source.title || index + 1}. ${source.url || "Missing URL"}. Opens outside Campaign.`}
          accessibilityHint="Opens the creator-provided public source in your browser."
          onPress={() => { void openSource(source.url); }}
          style={({ pressed }) => ({ flexDirection: "row", gap: 12, paddingVertical: 15, borderBottomWidth: 1, borderColor: colors.line, opacity: pressed ? 0.65 : 1 })}
        >
          <Ionicons name="document-text-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={{ fontSize: 14, lineHeight: 21, fontWeight: "600", color: colors.ink }}>{source.title || `Source ${index + 1}`}</Text>
            <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>{source.url || "URL missing"}</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.muted} />
        </Pressable>
      )) : <Text style={styles.muted}>No supporting sources added.</Text>}
      {campaign.id === "demo_ocean" && <Text style={styles.muted}>Cover artwork: an AI-generated ocean illustration for this fictional demo, not documentary evidence. Editorial photographs and source links retain their own credits.</Text>}
      {!!error && <Notice tone="error">{error}</Notice>}
    </View>
  );
}

export default function CampaignDetail() {
  const { colors } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const { id, section: requestedSection } = useLocalSearchParams<{ id: string; section?: string }>();
  const { money } = useCurrency();
  const { user } = useSession();
  const q = useQuery({ queryKey: ["campaign", id, user?.id], queryFn: () => api<Campaign>(`/campaigns/${id}`) });
  useRefreshOnFocus(q.refetch);
  const config = useConfig();
  const me = useMe();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showDock, setShowDock] = useState(false);
  const dockVisible = useRef(false);
  const overviewHeight = useRef(0);
  const scroll = useRef<ScrollView>(null);
  const navigation = useDetailSections(id, requestedSection, scroll);
  const { section, selectSection } = navigation;
  async function toggle(kind: "save" | "follow") {
    if (!user) { router.push("/profile"); return; }
    setBusy(true);
    try {
      const result = await api<{ active: boolean }>(`/campaigns/${id}/${kind}`, { method: "POST" });
      setMessage(result.active
        ? kind === "save" ? "Campaign saved to your profile." : "You’re following this campaign. Updates will appear in Activity."
        : kind === "save" ? "Campaign removed from saved." : "You have stopped following this campaign.");
      await refresh();
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  if (q.isPending) return <Screen><Loading /></Screen>;
  if (q.isError) return <Screen><Button title="Back to Explore" variant="ghost" icon="arrow-back" onPress={() => router.dismissTo("/explore")} /><ErrorState error={q.error} retry={() => q.refetch()} /></Screen>;
  const c = audienceCampaign(q.data);
  if (!c) return <Screen><Button title="Back to Explore" variant="ghost" icon="arrow-back" onPress={() => router.dismissTo("/explore")} /><Notice>The approved public campaign could not be loaded. Private edits cannot be backed. Open Profile to manage your campaign.</Notice></Screen>;
  const publicState = c.campaignState || c.status;
  const canBack = publicState === "Available for Funding";
  const canReport = publicState === "Completed";
  const saved = me.data?.saved.includes(id) || false;
  const followed = me.data?.followed.includes(id) || false;
  const percentage = c.goal ? Math.round((c.raised / c.goal) * 100) : 0;
  const openAction = () => router.push(`/explore/${id}/${canReport ? "report" : "back"}`);
  const actionTitle = canBack ? "Back this campaign" : canReport ? "View final report" : "Backing is closed";
  return (
    <Screen scroll={false} backgroundColor={colors.paper}>
      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ width: "100%", maxWidth: 640, alignSelf: "center", paddingBottom: 0 }}
        nestedScrollEnabled
        overScrollMode="never"
        scrollEventThrottle={32}
        onLayout={event => navigation.recordViewport(event.nativeEvent.layout.height)}
        onScroll={(event) => {
          navigation.recordScroll(event.nativeEvent.contentOffset.y);
          const visible = event.nativeEvent.contentOffset.y > Math.max(120, overviewHeight.current - 80);
          if (visible !== dockVisible.current) {
            dockVisible.current = visible;
            setShowDock(visible);
          }
        }}
      >
        <View onLayout={(event) => { overviewHeight.current = event.nativeEvent.layout.height; navigation.recordHeader(event.nativeEvent.layout.height); }}>
          <View>
            <CampaignCover campaign={c} height={Math.min(260, width * 0.6)} />
            <View style={{ position: "absolute", left: 12, right: 12, top: 10, flexDirection: "row", justifyContent: "space-between" }}>
              <Pressable accessibilityRole="button" accessibilityLabel="Back to Explore" onPress={() => router.dismissTo("/explore")} style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 13, justifyContent: "center", alignItems: "center", backgroundColor: colors.imageScrim, opacity: pressed ? 0.7 : 1 })}>
                <Ionicons name="arrow-back" size={23} color={colors.onImage} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={saved ? "Remove saved campaign" : "Save campaign"} accessibilityState={{ selected: saved, disabled: busy }} disabled={busy} onPress={() => { void toggle("save"); }} style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 13, justifyContent: "center", alignItems: "center", backgroundColor: colors.imageScrim, opacity: pressed || busy ? 0.7 : 1 })}>
                <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={22} color={colors.onImage} />
              </Pressable>
            </View>
          </View>
          <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12, gap: 12 }}>
            <Text accessibilityRole="header" style={{ fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.5, color: colors.ink }}>{c.title || "Untitled campaign"}</Text>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" }}><Ionicons name="megaphone-outline" size={21} color={colors.primary} /></View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 13, lineHeight: 19, fontWeight: "600", color: colors.ink }}>by {c.creatorName}</Text>
                <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>{c.category} · {new Date(c.publishedAt || c.submittedAt || c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Text>
              </View>
            </View>
            {!!c.summary && <Text style={{ fontSize: 14, lineHeight: 22, color: colors.text }}>{c.summary}</Text>}
            <View style={{ gap: 7, paddingTop: 3 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <Text style={{ fontSize: 17, lineHeight: 24, fontWeight: "700", fontVariant: ["tabular-nums"], color: colors.ink, flex: 1, minWidth: 0 }}>{money(c.raised)} <Text style={{ fontSize: 12, color: colors.muted }}>of {money(c.goal)}</Text></Text>
                <Text style={{ fontSize: 12, fontWeight: "700", fontVariant: ["tabular-nums"], flexShrink: 0, color: colors.ink }}>{percentage}%</Text>
              </View>
              <Progress raised={c.raised} goal={c.goal} />
              <CurrencyNote />
            </View>
            <CampaignStats campaign={c} config={config.data} showTime />
            <Button title={actionTitle} disabled={!canBack && !canReport} onPress={openAction} style={{ minHeight: 48 }} />
            <Text style={{ fontSize: 10, lineHeight: 16, color: colors.muted }}>
              {publicState} · Demo campaign{c.id === "demo_ocean" ? " · AI-generated cover artwork" : ""}
            </Text>
            {c.revisionPending && <Notice>Showing the approved public version; private changes are not included.</Notice>}
            {!!message && <Notice>{message}</Notice>}
            {!!c.feedback && <Notice>Review feedback: {c.feedback}</Notice>}
          </View>
        </View>
        <View>
        <View onLayout={event => navigation.recordTabs(event.nativeEvent.layout.height)} style={{ flexDirection: "row", backgroundColor: colors.paper, borderBottomWidth: 1, borderColor: colors.line, paddingHorizontal: 12 }}>
          {sections.map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityLabel={item} accessibilityState={{ selected: section === item }} onPress={() => selectSection(item)} style={({ pressed }) => ({ minHeight: 48, flex: 1, paddingHorizontal: 3, paddingVertical: 13, alignItems: "center", justifyContent: "center", borderBottomWidth: 2, borderBottomColor: section === item ? colors.ink : "transparent", opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: 12, lineHeight: 19, fontWeight: section === item ? "700" : "500", color: section === item ? colors.ink : colors.muted }}>{item}</Text>
          </Pressable>)}
        </View>
        </View>
        <PagerView
          key={id}
          ref={navigation.pager}
          initialPage={navigation.initialPage}
          orientation="horizontal"
          layoutDirection="ltr"
          overScrollMode="never"
          offscreenPageLimit={3}
          style={{ height: navigation.pageHeight, width: "100%" }}
          onPageSelected={event => navigation.onPageSelected(event.nativeEvent.position)}
          onPageScrollStateChanged={event => navigation.onPageScrollStateChanged(event.nativeEvent.pageScrollState)}
        >
          {sections.map(item => <View key={item} collapsable={false} style={{ width: "100%", height: "100%" }} accessibilityElementsHidden={section !== item} importantForAccessibility={section === item ? "auto" : "no-hide-descendants"}>
            <ScrollView
              nestedScrollEnabled
              scrollEnabled={navigation.contentScrollEnabled}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 18, gap: 22, flexGrow: 1 }}
            >
              {item === "Story" && <Story campaign={c} />}
              {item === "Updates" && <CampaignUpdates campaign={c} />}
              {item === "Impact" && <View style={{ gap: 18 }}><CampaignJourney campaign={c} /><Button title="View progress & report" variant="secondary" icon="bar-chart-outline" onPress={() => router.push(`/explore/${id}/report`)} /></View>}
              {item === "Sources" && <CampaignSources campaign={c} />}
              <Disclosures campaign={c} config={config.data} />
              <View style={{ gap: 8 }}>
                <Button title={followed ? "Following updates" : "Follow campaign updates"} variant="secondary" icon={followed ? "notifications" : "notifications-outline"} disabled={busy} onPress={() => { void toggle("follow"); }} />
                <ShareButton campaign={c} />
              </View>
            </ScrollView>
          </View>)}
        </PagerView>
      </ScrollView>
      {showDock && <View style={{ paddingHorizontal: 16, paddingVertical: 9, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }}>
        <View style={{ width: "100%", maxWidth: 608, alignSelf: "center", gap: 8, flexDirection: fontScale > 1.3 || width < 350 ? "column" : "row", alignItems: "center" }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Show campaign funding details" onPress={() => scroll.current?.scrollTo({ y: 0, animated: true })} style={{ flex: 1, minHeight: 44, justifyContent: "center", alignSelf: "stretch" }}>
            <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "700", color: colors.ink }}>{money(c.raised)} <Text style={{ fontSize: 11, color: colors.muted }}>of {money(c.goal)}</Text></Text>
            <Text style={{ fontSize: 10, lineHeight: 15, color: colors.muted }}>Funds message distribution</Text>
          </Pressable>
          <Button title={canBack ? "Back campaign" : canReport ? "Final report" : "Backing closed"} disabled={!canBack && !canReport} onPress={openAction} style={{ minHeight: 46, paddingHorizontal: 18, alignSelf: "stretch" }} />
        </View>
      </View>}
    </Screen>
  );
}
