import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, findNodeHandle, Keyboard, Pressable, ScrollView, TextInput, useWindowDimensions, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCurrency } from "../../lib/CurrencyProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, Button, Empty, ErrorState, Loading, Notice, Screen, fonts, useTheme } from "../../components/ui";
import { useActivity, useCampaigns, useConfig, useSession } from "../../lib/session";
import { categories, estimate, number } from "../../lib/types";
import { HomeDiscoveryCard } from "../../features/home/HomeDiscoveryCard";
import { selectHomeCampaigns } from "../../features/home/model";
import { CampaignFilters, FilterOverlay } from "../../features/explore/FilterOverlay";
import { STEPS } from "../../features/creation/model";
import { useDraftLibrary } from "../../features/creation/useDraftLibrary";
import { NotificationSheet } from "../../features/notifications/NotificationSheet";
import { captureApiSession } from "../../lib/api";
import { UnreadBadge } from "../../components/UnreadBadge";
import { SpotlightCard } from "../../features/home/SpotlightCard";
import { useWalkthrough, useWalkthroughTarget, WalkthroughInvitation } from "../../features/walkthrough/Walkthrough";

const primaryCategories = ["Environment", "Health", "Education", "Community"];
const homeCategories = ["All", ...primaryCategories, ...categories.filter((category) => !primaryCategories.includes(category))];
const categoryIcons: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = { Environment: "leaf-outline", Health: "heart-outline", Education: "book-outline", Community: "people-outline", Science: "flask-outline", "Public Policy": "globe-outline", "Economic Policy": "trending-up-outline", "Arts & Culture": "color-palette-outline", Business: "briefcase-outline", Other: "ellipsis-horizontal" };

function ContinueDraft({ scope, ready }: { scope: string; ready: boolean }) {
  const { colors, styles } = useTheme();
  const library = useDraftLibrary(scope, ready);
  const reload = useRef(library.retry);
  reload.current = library.retry;
  useFocusEffect(useCallback(() => { reload.current(); }, []));
  const draft = library.entries[0];
  if (!ready || library.loading || library.error || !draft) return null;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Continue draft ${draft.draft.title || "Untitled campaign"}`} onPress={() => router.push({ pathname: "/create", params: { localDraft: draft.localId } })} style={({ pressed }) => ({ ...styles.row, padding: 14, gap: 12, borderRadius: 12, backgroundColor: colors.mint, opacity: pressed ? 0.75 : 1 })}>
      <Ionicons name="document-text-outline" size={23} color={colors.primary} />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: colors.ink }}>Continue your draft</Text>
        <Text style={{ ...styles.muted, fontSize: 12 }} numberOfLines={1}>{draft.draft.title || "Untitled campaign"} · {STEPS[draft.step] || "Basics"}</Text>
      </View>
      <Ionicons name="arrow-forward" size={20} color={colors.primary} />
    </Pressable>
  );
}

export default function Home() {
  const { money } = useCurrency();
  const { colors, styles, scheme } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const { user, ready, onboardingError, completeOnboarding } = useSession();
  const tour = useWalkthrough();
  const params = useLocalSearchParams();
  const searchTarget = useWalkthroughTarget("search");
  const backTarget = useWalkthroughTarget("back");
  const homeTarget = useWalkthroughTarget("home");
  const viewportTarget = useWalkthroughTarget("viewport");
  const [focused, setFocused] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [category, setCategory] = useState("All");
  const [filters, setFilters] = useState<CampaignFilters>({ sort: "Featured", funding: false });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const filterButton = useRef<View>(null);
  useEffect(() => {
    let active = true, changed = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (active && !changed) setReduceMotion(value); }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => { changed = true; setReduceMotion(value); });
    return () => { active = false; subscription.remove(); };
  }, []);
  useFocusEffect(useCallback(() => {
    const frame = requestAnimationFrame(() => setFocused(true));
    return () => { cancelAnimationFrame(frame); setFocused(false); setFiltersOpen(false); };
  }, []));
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardOpen(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  const campaigns = useCampaigns();
  const config = useConfig();
  const activity = useActivity();
  const [search, setSearch] = useState("");
  const [notificationScope, setNotificationScope] = useState<{ scope: string; current: () => boolean } | null>(null);
  const scope = user?.id || "guest";
  const notificationsOpen = notificationScope?.scope === scope && notificationScope.current();
  const pendingNavigation = Object.keys(params).some((key) => !key.startsWith("__"));
  const setTourHome = tour.setHome;
  useEffect(() => { setTourHome({ focused, ready: layoutReady, blocked: !!notificationsOpen || filtersOpen || keyboardOpen || scrolling, pending: pendingNavigation }); },
    [focused, layoutReady, notificationsOpen, filtersOpen, keyboardOpen, scrolling, pendingNavigation, setTourHome]);
  const unread = user ? activity.data?.filter((item) => !item.read).length || 0 : 0;
  // Drag/tour/notification state must not refilter the public feed or replace
  // its card props while the native scroll view is moving.
  const { featured, discover: feed, total } = useMemo(
    () => selectHomeCampaigns(campaigns.data || [], { search, category, ...filters }),
    [campaigns.data, search, category, filters],
  );
  const explore = () => {
    Keyboard.dismiss();
    router.push({ pathname: "/explore", params: { q: search.trim(), category, sort: filters.sort, funding: filters.funding ? "1" : "0" } });
  };
  const closeFilters = () => {
    setFiltersOpen(false);
    requestAnimationFrame(() => { const target = findNodeHandle(filterButton.current); if (target) AccessibilityInfo.setAccessibilityFocus(target); });
  };
  const reset = () => { setSearch(""); setCategory("All"); setFilters({ sort: "Featured", funding: false }); };
  const activeFilters = !!search.trim() || category !== "All" || filters.funding || filters.sort !== "Featured";
  const gridColumns = width >= 360 && fontScale < 1.25 ? 2 : 1;
  const searchHeight = Math.max(50, Math.ceil(20 * fontScale + 24));
  const heading = (title: string) => <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
    <Text accessibilityRole="header" style={{ flex: 1, color: colors.ink, fontFamily: fonts.bold, fontSize: 19, lineHeight: 26, letterSpacing: -0.4 }}>{title}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`See all ${title.toLowerCase()}`} onPress={explore} style={({ pressed }) => ({ minWidth: 64, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6, opacity: pressed ? 0.65 : 1 })}>
      <Text style={{ color: colors.primary, fontSize: 12, lineHeight: 18, fontFamily: fonts.semibold }}>See all</Text><Ionicons name="arrow-forward" size={18} color={colors.primary} />
    </Pressable>
  </View>;
  return <Screen scroll={false}>
    <View ref={viewportTarget} collapsable={false} style={{ flex: 1 }}>
      <ScrollView onLayout={() => setLayoutReady(true)} onScrollBeginDrag={() => setScrolling(true)} onScrollEndDrag={() => setScrolling(false)} onMomentumScrollBegin={() => setScrolling(true)} onMomentumScrollEnd={() => setScrolling(false)} accessibilityElementsHidden={!!notificationsOpen || filtersOpen || tour.active} importantForAccessibility={notificationsOpen || filtersOpen || tour.active ? "no-hide-descendants" : "auto"} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={{ width: "100%", maxWidth: 640, alignSelf: "center", paddingHorizontal: 18, paddingTop: 4, gap: 8 }}>
          <View ref={homeTarget} collapsable={false} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}><Text accessibilityRole="header" style={{ color: colors.ink, fontFamily: fonts.bold, fontSize: 20, lineHeight: 28, letterSpacing: -0.5 }}>Good ideas. Greater reach.</Text><Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>Community-funded advertising for messages that matter.</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel={unread ? `Notifications, ${unread} unread` : "Open notifications"} accessibilityHint="Opens recent notifications in a quick sheet." accessibilityState={{ expanded: notificationsOpen }} onPress={() => { Keyboard.dismiss(); setNotificationScope({ scope, current: captureApiSession() }); }} style={({ pressed }) => ({ width: 48, height: 48, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
              <Ionicons name="notifications-outline" size={23} color={colors.ink} /><UnreadBadge count={unread} style={{ position: "absolute", right: 1, top: 2 }} />
            </Pressable>
          </View>
          <View ref={searchTarget} collapsable={false} style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: searchHeight, borderRadius: 28, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.subtle, paddingLeft: 15, paddingRight: 4 }}>
            <Ionicons name="search-outline" size={21} color={colors.muted} />
            <TextInput accessibilityLabel="Search campaigns" keyboardAppearance={scheme} placeholder={width >= 560 && fontScale <= 1.1 ? "Search campaigns, causes or keywords…" : "Search campaigns…"} placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} returnKeyType="search" onSubmitEditing={Keyboard.dismiss} selectionColor={colors.focus} style={{ flex: 1, minWidth: 0, minHeight: searchHeight - 2, paddingVertical: 10, fontFamily: fonts.sans, fontSize: 13, color: colors.ink }} />
            {!!search && <Pressable accessibilityRole="button" accessibilityLabel="Clear campaign search" onPress={() => setSearch("")} style={{ width: 48, height: searchHeight, alignItems: "center", justifyContent: "center" }}><Ionicons name="close" size={18} color={colors.muted} /></Pressable>}
            <View style={{ width: 1, height: 22, backgroundColor: colors.line }} />
            <Pressable ref={filterButton} accessibilityRole="button" accessibilityLabel="Home campaign filters and sort" accessibilityHint="Opens filters over Home. Choose options, then apply." accessibilityState={{ expanded: filtersOpen }} onPress={() => { Keyboard.dismiss(); setDraftFilters({ ...filters }); setFiltersOpen(true); }} style={({ pressed }) => ({ width: 48, minHeight: searchHeight, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
              <Ionicons name="options-outline" size={22} color={filtersOpen ? colors.primary : colors.ink} />
              {(filters.funding || filters.sort !== "Featured") && <View style={{ position: "absolute", right: 8, top: 7, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />}
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, alignItems: "center" }}>
            {homeCategories.map((value) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value} campaigns`} accessibilityState={{ selected: category === value }} onPress={() => { Keyboard.dismiss(); setCategory(value); }} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 7, minHeight: 48, paddingHorizontal: value === "All" ? 21 : 14, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: category === value ? colors.primary : colors.line, backgroundColor: category === value ? colors.primary : colors.paper, opacity: pressed ? 0.75 : 1 })}>
              {categoryIcons[value] && <Ionicons name={categoryIcons[value]} size={18} color={category === value ? colors.onPrimary : value === "Environment" ? colors.primary : colors.ink} />}
              <Text style={{ fontFamily: fonts.semibold, color: category === value ? colors.onPrimary : colors.ink, fontSize: 12, lineHeight: 18 }}>{value === "Community" ? "Communities" : value}</Text>
            </Pressable>)}
          </ScrollView>
          {!!onboardingError && <View><Notice tone="error">{onboardingError}</Notice><Button title="Retry welcome preference" variant="ghost" onPress={() => { void completeOnboarding().catch(() => undefined); }} /></View>}
          {activeFilters && <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Text accessibilityLiveRegion="polite" style={{ flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 }}>{total} {total === 1 ? "campaign" : "campaigns"}{category !== "All" ? ` · ${category}` : ""}{filters.funding ? " · Open for backing" : ""}{filters.sort !== "Featured" ? ` · ${filters.sort}` : ""}</Text><Button title="Reset" variant="ghost" onPress={reset} style={{ paddingHorizontal: 8 }} /></View>}
          {campaigns.isPending ? <Loading /> : campaigns.isError && !campaigns.data?.length ? <ErrorState error={campaigns.error} retry={() => campaigns.refetch()} /> : featured ? <>
            <View style={{ gap: 6 }}>{heading("Featured Campaign")}<SpotlightCard campaign={featured} config={config.data} backTargetRef={backTarget} /></View>
            {!!feed.length && <View style={{ gap: 6, marginTop: 4 }}>{heading("Discover Campaigns")}<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>{feed.map((campaign) => <View key={campaign.id} style={{ width: gridColumns === 2 ? "48.4%" : "100%", flexGrow: gridColumns === 2 ? 1 : 0 }}><HomeDiscoveryCard campaign={campaign} config={config.data} /></View>)}</View></View>}
          </> : <Empty title={activeFilters ? "No campaigns match" : "No campaigns published yet"} body={activeFilters ? "Try another topic or clear your filters to discover more messages." : "Create a draft or return soon to discover a new message."} action={<Button title={activeFilters ? "Clear filters" : "Start a campaign"} onPress={activeFilters ? reset : () => router.push("/create")} />} />}
          <View style={{ gap: 10, paddingTop: 14, paddingBottom: 6 }}>
            <Text style={styles.h2}>Good ideas deserve to be heard.</Text>
            <Text style={styles.muted}>Discover and amplify messages that matter. Contributions fund advertising reach, not direct donations.</Text>
            <View style={{ flexDirection: width < 370 || fontScale >= 1.3 ? "column" : "row", gap: 8 }}><Button title="Explore campaigns" variant="secondary" onPress={explore} style={{ flex: 1 }} /><Button title="Start a campaign" onPress={() => router.push("/create")} style={{ flex: 1 }} /></View>
          </View>
          <ContinueDraft key={scope} scope={scope} ready={ready} />
          <View style={{ gap: 12, paddingVertical: 12 }}>
            <Text style={styles.h2}>Create. Review. Amplify.</Text>
            <Text style={styles.muted}>{config.data ? `Illustrative estimate: ${money(1)} (USD $1 canonical) may reach about ${number(estimate(1, config.data))} people. Results vary with audience and advertising delivery.` : "Connect to load the illustrative audience estimate."}</Text>
            {[["create-outline", "Create", "Prepare your story, sources and intended audience."], ["checkmark-done-outline", "Review", "The platform reviews the message before public backing."], ["radio-outline", "Amplify", "Backers fund advertising. Follow delivery and the final report."]].map(([icon, title, body]) => <View key={title} style={{ flexDirection: "row", gap: 12 }}><Ionicons name={icon as "create-outline"} size={22} color={colors.primary} /><View style={{ flex: 1, gap: 2 }}><Text style={{ ...styles.body, fontWeight: "700" }}>{title}</Text><Text style={styles.muted}>{body}</Text></View></View>)}
            <Text style={{ ...styles.muted, fontSize: 11, lineHeight: 17 }}>Demo campaigns and assessments are illustrative. Payments and advertising delivery are simulated.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
    <WalkthroughInvitation />
    <NotificationSheet key={scope} visible={notificationsOpen} onClose={() => setNotificationScope(null)} />
    <FilterOverlay visible={filtersOpen} draft={draftFilters} onChange={setDraftFilters} onClose={closeFilters} onApply={() => { setFilters({ ...draftFilters }); closeFilters(); }} reduceMotion={reduceMotion} />
  </Screen>;
}
