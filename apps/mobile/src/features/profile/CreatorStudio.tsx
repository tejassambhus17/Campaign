import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button, Empty, ErrorState, fonts, Loading, Picture, Progress, Text, useTheme } from "../../components/ui";
import { useCurrency } from "../../lib/CurrencyProvider";
import type { Campaign } from "../../lib/types";
import { number } from "../../lib/types";
import { STEPS } from "../creation/model";
import { accountDraftToken } from "../creation/persistence";
import { useDraftLibrary } from "../creation/useDraftLibrary";
import { creatorStudioItems, STUDIO_FILTERS, studioCounts, studioDestination, studioStep, type StudioFilter, type StudioItem } from "./studio";

type Props = { userId: string; campaigns: Campaign[]; accountLoading: boolean; accountError: Error | null; onRetry: () => void; onMyCampaigns: () => void };

export function CreatorStudio({ userId, campaigns, accountLoading, accountError, onRetry, onMyCampaigns }: Props) {
  const { colors, styles } = useTheme();
  // Read the established account-scoped library. No parallel draft store or
  // write occurs when the Studio is opened, filtered or refreshed.
  const library = useDraftLibrary(userId, true);
  const reloadLibrary = useRef(library.retry);
  reloadLibrary.current = library.retry;
  useFocusEffect(useCallback(() => { reloadLibrary.current(); }, []));
  const [filter, setFilter] = useState<StudioFilter>("All");
  const items = useMemo(() => creatorStudioItems(userId, campaigns, library.entries), [userId, campaigns, library.entries]);
  const counts = studioCounts(items);
  const visible = filter === "All" ? items : items.filter(item => item.group === filter);
  const complete = !library.loading && !accountLoading && !accountError && !library.error;
  const metrics = [
    { key: "All", label: "Campaigns", icon: "document-text-outline" },
    { key: "Drafts", label: "Drafts", icon: "create-outline" },
    { key: "Review", label: "In review", icon: "time-outline" },
    { key: "Funding", label: "Funding", icon: "trending-up-outline" },
  ] as const;
  return <View style={{ gap: 16 }}>
    <Text style={[styles.muted, { fontSize: 13, lineHeight: 20 }]}>Your ideas, saved work and next steps in one place.</Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
      {metrics.map(metric => <Pressable key={metric.key} accessibilityRole="button" accessibilityLabel={`${metric.label}: ${complete ? counts[metric.key] : "loading or partial"}. Show ${metric.key.toLowerCase()}`} onPress={() => setFilter(metric.key)}
        style={({ pressed }) => ({ flex: 1, minWidth: 66, paddingHorizontal: 7, paddingVertical: 12, borderWidth: 1, borderColor: filter === metric.key ? colors.green : colors.line, borderRadius: 12, backgroundColor: colors.paper, alignItems: "center", gap: 5, opacity: pressed ? 0.75 : 1 })}>
        <Ionicons name={metric.icon} size={19} color={colors.green} />
        <Text style={{ fontFamily: fonts.bold, fontSize: 22, lineHeight: 29, fontVariant: ["tabular-nums"] }}>{complete ? number(counts[metric.key]) : "—"}</Text>
        <Text style={[styles.muted, { fontSize: 10, lineHeight: 15, textAlign: "center" }]}>{metric.label}</Text>
      </Pressable>)}
    </View>
    <Button title="Create a campaign" icon="add" onPress={() => router.push("/create")} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 7 }}>
      {STUDIO_FILTERS.map(value => <Pressable key={value} accessibilityRole="tab" accessibilityLabel={`${value}${complete ? `, ${counts[value]}` : ""}`} accessibilityState={{ selected: filter === value }} onPress={() => setFilter(value)}
        style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22, borderWidth: 1, borderColor: filter === value ? colors.green : colors.line, backgroundColor: filter === value ? colors.mint : colors.paper, justifyContent: "center", opacity: pressed ? 0.75 : 1 })}>
        <Text style={{ fontSize: 12, lineHeight: 19, fontFamily: fonts.semibold, color: filter === value ? colors.green : colors.muted }}>{value}{complete ? ` (${counts[value]})` : ""}</Text>
      </Pressable>)}
    </ScrollView>
    {(accountLoading || library.loading) && <Loading />}
    {accountError && <ErrorState error={accountError} retry={onRetry} />}
    {!!library.error && <View style={{ gap: 6 }}><Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>{library.error}</Text><Button title="Retry device drafts" variant="secondary" onPress={library.retry} /></View>}
    {!complete && items.length > 0 && <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Showing available work. Totals update when account and device drafts finish loading.</Text>}
    {visible.map(item => <StudioCampaign key={item.key} item={item} />)}
    {complete && !visible.length && <Empty title={filter === "All" ? "Your next idea starts here" : `No ${filter.toLowerCase()} campaigns`} body={filter === "All" ? "Create a campaign or return to your saved work at any time." : "Your campaigns will appear here as they move through the process."} />}
    <Button title="All campaign management" variant="ghost" icon="folder-open-outline" onPress={onMyCampaigns} />
    <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Funding and advertising delivery are separate stages. Payments and delivery in this prototype are simulated.</Text>
  </View>;
}

export function StudioCampaign({ item }: { item: StudioItem }) {
  const { colors, styles } = useTheme();
  const { money } = useCurrency();
  const { campaign, local, group } = item;
  const title = campaign.title || "Untitled campaign";
  const status = local ? campaign.status : campaign.campaignState || campaign.status;
  const date = local ? new Date(local.updatedAt) : null;
  const saved = date && Number.isFinite(date.getTime()) ? `Saved ${date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : "";
  const synchronized = local && local.accountSavedToken === accountDraftToken(local);
  const funding = item.account || campaign;
  const privatePublicFunding = group === "Drafts" && !!campaign.revisionPending && !!funding.publishedAt &&
    ["Available for Funding", "Funding Goal Reached", "Funding Period Ends", "Distribution Preparation", "Promoting"].includes(funding.campaignState || funding.status);
  const draftGoalOnly = group === "Drafts" && !privatePublicFunding;
  return <View testID={`studio-item-${item.key}`} style={{ backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1, borderRadius: 14, padding: 12, gap: 11 }}>
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 11 }}>
      {!!campaign.coverImage && <View style={{ width: 62, borderRadius: 9, overflow: "hidden" }}><Picture uri={campaign.coverImage} height={70} /></View>}
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <Text accessibilityRole="header" style={{ fontSize: 14, lineHeight: 21, fontFamily: fonts.semibold }}>{title}</Text>
        <Text style={{ color: group === "Review" ? colors.warning : colors.green, fontSize: 11, lineHeight: 17, fontFamily: fonts.semibold }}>{status}</Text>
        {group === "Drafts" && <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Step {studioStep(campaign, local) + 1} of 5 · {STEPS[studioStep(campaign, local)]}</Text>}
      </View>
    </View>
    {!!local && <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>{saved ? `${saved} · ` : ""}{synchronized ? "Device + account saved" : "Device · Account save needed"}</Text>}
    {campaign.revisionPending && <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Private revision: {campaign.status}. The approved public version stays visible.</Text>}
    {!!campaign.feedback && <Text style={[styles.body, { fontSize: 12, lineHeight: 19 }]}>{campaign.feedback}</Text>}
    {group === "Review" && <Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>{campaign.status === "Approved" ? "Approved. Funding and distribution setup are separate next stages." : "Submitted for review. Check here for a decision or requested changes."}</Text>}
    {draftGoalOnly ? campaign.goal > 0 ? <Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>Draft goal · <Text style={{ color: colors.ink, fontFamily: fonts.semibold }}>{money(campaign.goal)}</Text></Text> : null : funding.goal > 0 && <View style={{ gap: 6 }}>
      {privatePublicFunding && <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Account campaign funding · This draft is a private revision.</Text>}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
        <Text style={{ fontSize: 14, lineHeight: 21, fontFamily: fonts.semibold }}>{money(funding.raised)} <Text style={[styles.muted, { fontSize: 11 }]}>of {money(funding.goal)}</Text></Text>
        <Text style={[styles.muted, { fontSize: 11 }]}>{Math.round(funding.raised / funding.goal * 100)}% funded</Text>
      </View>
      <Progress raised={funding.raised} goal={funding.goal} />
    </View>}
    <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 9, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 1 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${group === "Drafts" ? "Resume" : "View"} ${title}`} onPress={() => router.push(studioDestination(item) as never)}
        style={({ pressed }) => ({ minHeight: 48, flex: 1, minWidth: 125, flexDirection: "row", alignItems: "center", gap: 6, opacity: pressed ? 0.65 : 1 })}>
        <Text style={{ color: colors.green, fontSize: 12, lineHeight: 19, fontFamily: fonts.semibold }}>{group === "Drafts" ? "Resume draft" : group === "Review" ? "Review status" : "View campaign"}</Text><Ionicons name="arrow-forward" size={16} color={colors.green} />
      </Pressable>
      {group !== "Drafts" && !!campaign.id && <Pressable accessibilityRole="button" accessibilityLabel={`Report for ${title}`} onPress={() => router.push(`/explore/${encodeURIComponent(campaign.id)}/report`)} style={({ pressed }) => ({ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 5, opacity: pressed ? 0.65 : 1 })}>
        <Ionicons name="bar-chart-outline" size={16} color={colors.green} /><Text style={{ color: colors.green, fontSize: 12, fontFamily: fonts.semibold }}>Report</Text>
      </Pressable>}
    </View>
  </View>;
}
