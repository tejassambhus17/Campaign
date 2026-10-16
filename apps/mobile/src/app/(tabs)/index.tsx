import { useCallback, useRef, useState } from "react";
import { Keyboard, Pressable, ScrollView, TextInput, useWindowDimensions, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, Button, Empty, ErrorState, Loading, Pill, Screen, fonts, useTheme } from "../../components/ui";
import { useActivity, useCampaigns, useConfig, useSession } from "../../lib/session";
import { categories, estimate, number } from "../../lib/types";
import { CampaignCard } from "../../features/campaign";
import { STEPS } from "../../features/creation/model";
import { useDraftLibrary } from "../../features/creation/useDraftLibrary";
import { NotificationSheet } from "../../features/notifications/NotificationSheet";
import { captureApiSession } from "../../lib/api";
import { UnreadBadge } from "../../components/UnreadBadge";
import { SpotlightCard } from "../../features/home/SpotlightCard";

const primaryCategories = ["Environment", "Health", "Education", "Public Policy"];
const homeCategories = ["All", ...primaryCategories, ...categories.filter((category) => !primaryCategories.includes(category))];

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
  const { colors, styles, scheme } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const { user, ready } = useSession();
  const campaigns = useCampaigns();
  const config = useConfig();
  const activity = useActivity();
  const [search, setSearch] = useState("");
  const [notificationScope, setNotificationScope] = useState<{ scope: string; current: () => boolean } | null>(null);
  const scope = user?.id || "guest";
  const notificationsOpen = notificationScope?.scope === scope && notificationScope.current();
  const unread = user ? activity.data?.filter((item) => !item.read).length || 0 : 0;
  const stories = campaigns.data || [];
  const featured = stories.find((c) => c.id === "demo_ocean") || stories.find((c) => c.featured && c.coverImage) || stories.find((c) => c.coverImage) || stories[0];
  const feed = stories.filter((c) => c.id !== featured?.id).slice(0, 3);
  const explore = (category = "All") => {
    Keyboard.dismiss();
    router.push({ pathname: "/explore", params: { q: search.trim(), category } });
  };
  const openFilters = () => {
    Keyboard.dismiss();
    router.push({ pathname: "/explore", params: { q: search.trim(), category: "All", openFilters: String(Date.now()) } });
  };
  const stackPromo = width < 370 || fontScale >= 1.25;
  const searchHeight = Math.max(48, Math.ceil(19 * fontScale + 20));
  return (
    <Screen scroll={false}>
      <ScrollView accessibilityElementsHidden={notificationsOpen} importantForAccessibility={notificationsOpen ? "no-hide-descendants" : "auto"} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ width: "100%", maxWidth: 640, alignSelf: "center", paddingHorizontal: 16, paddingTop: 6, gap: 10 }}>
          <View style={{ gap: 10 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ color: colors.primary, fontSize: 11, lineHeight: 15, fontWeight: "700", letterSpacing: 0.7, paddingRight: 60 }}>CAMPAIGN</Text>
              <Text accessibilityRole="header" style={{ fontFamily: fonts.bold, fontSize: 22, lineHeight: 26, letterSpacing: -0.45, color: colors.ink }}>Good ideas{"\n"}deserve to be heard.</Text>
              <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>Discover and amplify messages that matter.</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={unread ? `Notifications, ${unread} unread` : "Open notifications"} accessibilityHint="Opens recent notifications in a quick sheet." accessibilityState={{ expanded: notificationsOpen }} onPress={() => { Keyboard.dismiss(); setNotificationScope({ scope, current: captureApiSession() }); }} style={({ pressed }) => ({ position: "absolute", right: 0, top: 0, width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.75 : 1 })}>
                <Ionicons name="notifications-outline" size={22} color={colors.ink} />
                <UnreadBadge count={unread} style={{ position: "absolute", right: 2, top: 2 }} />
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8, height: searchHeight, borderRadius: 25, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.subtle, paddingHorizontal: 13 }}>
                <Ionicons name="search-outline" size={18} color={colors.muted} />
                <TextInput accessibilityLabel="Search campaigns" keyboardAppearance={scheme} placeholder="Search campaigns…" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} returnKeyType="search" onSubmitEditing={() => explore()} selectionColor={colors.focus} style={{ flex: 1, minWidth: 0, height: searchHeight - 2, paddingVertical: 9, fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.ink }} />
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Campaign filters and sort" accessibilityHint="Opens Explore with campaign filters and sorting expanded." onPress={openFilters} style={({ pressed }) => ({ width: 48, height: searchHeight, borderRadius: 24, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
                <Ionicons name="options-outline" size={21} color={colors.ink} />
              </Pressable>
            </View>
          </View>
          <View style={{ gap: 10 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {homeCategories.map((category) => <Pill key={category} title={category} selected={category === "All"} onPress={() => explore(category)} />)}
            </ScrollView>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <Text accessibilityRole="header" style={{ flex: 1, color: colors.ink, fontSize: 17, lineHeight: 23, fontWeight: "700", letterSpacing: -0.2 }}>In the spotlight</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="See all campaigns" onPress={() => explore()} style={({ pressed }) => ({ minWidth: 48, minHeight: 48, paddingHorizontal: 4, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, opacity: pressed ? 0.65 : 1 })}>
                <Text style={{ color: colors.primary, fontSize: 12, lineHeight: 18, fontWeight: "600" }}>See all</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </Pressable>
            </View>
            {campaigns.isPending ? <Loading /> : campaigns.isError ? <ErrorState error={campaigns.error} retry={() => campaigns.refetch()} /> : featured ? (
              <SpotlightCard campaign={featured} config={config.data} />
            ) : <Empty title="No campaigns published yet" body="Create a draft or return soon to discover a new message." action={<Button title="Start a campaign" onPress={() => router.push("/create")} />} />}
            <View style={{ flexDirection: stackPromo ? "column" : "row", alignItems: stackPromo ? "stretch" : "center", gap: 12, marginTop: 2, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }}>
              <View style={{ flex: stackPromo ? undefined : 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View accessible={false} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" }}><Ionicons name="create-outline" size={21} color={colors.primary} /></View>
                <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                  <Text style={{ color: colors.ink, fontSize: 13, lineHeight: 18, fontWeight: "700" }}>Have a message to share?</Text>
                  <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>Create your own campaign in five steps.</Text>
                </View>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Start a campaign" onPress={() => router.push("/create")} style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 13, paddingVertical: 10, alignItems: "center", justifyContent: "center", borderRadius: 24, borderWidth: 1, borderColor: colors.primary, opacity: pressed ? 0.7 : 1 })}>
                <Text style={{ color: colors.ink, fontSize: 11, lineHeight: 17, fontWeight: "700", textAlign: "center" }}>Start a campaign</Text>
              </Pressable>
            </View>
            <ContinueDraft key={user?.id || "guest"} scope={user?.id || "guest"} ready={ready} />
            {!!feed.length && <View><View style={{ ...styles.row, justifyContent: "space-between" }}><Text style={styles.h2}>More to discover</Text><Button title="See all" variant="ghost" onPress={() => explore()} style={{ paddingHorizontal: 4 }} /></View>{feed.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} config={config.data} compact />)}</View>}
            <View style={{ gap: 14, paddingVertical: 8 }}>
              <Text style={styles.h2}>Create. Review. Amplify.</Text>
              <Text style={styles.muted}>Community-funded advertising carries important messages beyond their creators’ existing networks. Contributions pay for message distribution, not direct donations to the cause.</Text>
              <Text style={styles.muted}>{config.data ? `Illustrative demo reach: $1 may reach about ${number(estimate(1, config.data))} people. Actual results vary with audience and ad delivery.` : "Connect to load the illustrative per-dollar audience estimate."}</Text>
              {[["create-outline", "Create", "Prepare your story, sources and intended audience."], ["checkmark-done-outline", "Review", "The platform reviews the message before public backing."], ["radio-outline", "Amplify", "Backers fund advertising. Follow delivery and the final report."]].map(([icon, title, body]) => <View key={title} style={{ flexDirection: "row", gap: 12 }}><Ionicons name={icon as "create-outline"} size={22} color={colors.primary} /><View style={{ flex: 1, gap: 2 }}><Text style={{ ...styles.body, fontWeight: "700" }}>{title}</Text><Text style={styles.muted}>{body}</Text></View></View>)}
            </View>
            <Text style={{ ...styles.muted, fontSize: 12, paddingTop: 12, borderTopWidth: 1, borderColor: colors.line }}>Campaigns, payments and delivery results in this local prototype are simulated.</Text>
          </View>
        </View>
      </ScrollView>
      <NotificationSheet key={scope} visible={notificationsOpen} onClose={() => setNotificationScope(null)} />
    </Screen>
  );
}
