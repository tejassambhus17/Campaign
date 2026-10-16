import { useCallback, useRef, useState } from "react";
import { Keyboard, Pressable, ScrollView, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, Button, Empty, ErrorState, Loading, Pill, Screen, fonts, useTheme } from "../../components/ui";
import { useActivity, useCampaigns, useConfig, useSession } from "../../lib/session";
import { categories, estimate, number } from "../../lib/types";
import { CampaignCard } from "../../features/campaign";
import { STEPS } from "../../features/creation/model";
import { useDraftLibrary } from "../../features/creation/useDraftLibrary";

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
  const { user, ready } = useSession();
  const campaigns = useCampaigns();
  const config = useConfig();
  const activity = useActivity();
  const [search, setSearch] = useState("");
  const unread = user ? activity.data?.filter((item) => !item.read).length || 0 : 0;
  const stories = campaigns.data || [];
  const featured = stories.find((c) => c.featured && c.coverImage) || stories.find((c) => c.coverImage) || stories[0];
  const feed = stories.filter((c) => c.id !== featured?.id).slice(0, 3);
  const explore = (category = "All") => {
    Keyboard.dismiss();
    router.push({ pathname: "/explore", params: { q: search.trim(), category } });
  };
  return (
    <Screen scroll={false}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ width: "100%", maxWidth: 640, alignSelf: "center" }}>
          <View style={{ backgroundColor: colors.header, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12, gap: 6 }}>
            <View style={{ ...styles.row, justifyContent: "space-between" }}>
              <View style={{ ...styles.row, flex: 1, gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}><Ionicons name="megaphone" size={22} color={colors.onPrimary} /></View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 21, color: colors.headerText, letterSpacing: -0.6 }}>campaign</Text>
                  <Text style={{ color: colors.onHeaderMuted, fontSize: 12 }} numberOfLines={1}>{user ? `Welcome back, ${user.name}` : "Good messages deserve an audience"}</Text>
                </View>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={unread ? `Activity, ${unread} unread updates` : "Open Activity"} onPress={() => router.push("/activity")} style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper, opacity: pressed ? 0.75 : 1 })}>
                <Ionicons name="notifications-outline" size={22} color={colors.ink} />
                {!!unread && <View style={{ position: "absolute", right: 0, top: 0, minWidth: 19, minHeight: 19, paddingHorizontal: 4, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 10, fontFamily: fonts.bold, color: colors.onPrimary }}>{unread > 99 ? "99+" : unread}</Text></View>}
              </Pressable>
            </View>
            <View style={{ ...styles.row, gap: 6, minHeight: 52, borderRadius: 12, backgroundColor: colors.paper, paddingLeft: 14 }}>
              <Ionicons name="search-outline" size={20} color={colors.muted} />
              <TextInput accessibilityLabel="Search campaigns" keyboardAppearance={scheme} placeholder="Search messages, topics, creators" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} returnKeyType="search" onSubmitEditing={() => explore()} selectionColor={colors.focus} style={{ flex: 1, minHeight: 52, paddingVertical: 10, fontFamily: fonts.sans, fontSize: 14, color: colors.ink }} />
              <Pressable accessibilityRole="button" accessibilityLabel="Search campaigns now" onPress={() => explore()} style={{ width: 48, height: 52, alignItems: "center", justifyContent: "center" }}><Ionicons name="arrow-forward" size={20} color={colors.ink} /></Pressable>
            </View>
            <View style={{ gap: 3 }}>
              <Text accessibilityRole="header" style={{ fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, color: colors.headerText }}>Help a message travel further.</Text>
              <Text style={{ fontSize: 12, lineHeight: 18, color: colors.onHeaderMuted }}>Community-funded advertising beyond the creator’s network.</Text>
            </View>
            <View style={{ ...styles.row, gap: 8 }}>
              <Button title="Explore campaigns" style={{ flex: 1, paddingHorizontal: 10 }} onPress={() => explore()} />
              <Button title="Start a campaign" variant="secondary" style={{ flex: 1, paddingHorizontal: 10 }} onPress={() => router.push("/create")} />
            </View>
            <Text style={{ color: colors.onHeaderMuted, fontSize: 11, lineHeight: 16 }}>{config.data ? `$1 ≈ ${number(estimate(1, config.data))} people after the ${Number((config.data.feeRate * 100).toFixed(2))}% demo fee. Estimate only; results vary.` : "Audience estimates appear when the current demo settings load. Results vary."}</Text>
          </View>
          <View style={{ paddingHorizontal: 18, paddingTop: 12, gap: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {["All", ...categories].map((category) => <Pill key={category} title={category} selected={category === "All"} onPress={() => explore(category)} />)}
            </ScrollView>
            {campaigns.isPending ? <Loading /> : campaigns.isError ? <ErrorState error={campaigns.error} retry={() => campaigns.refetch()} /> : featured ? (
              <View style={{ gap: 10 }}>
                <View style={{ ...styles.row, justifyContent: "space-between" }}><Text style={styles.h2}>In focus</Text><Text style={{ ...styles.muted, fontSize: 12 }}>Featured · demo</Text></View>
                <CampaignCard campaign={featured} config={config.data} />
              </View>
            ) : <Empty title="No campaigns published yet" body="Create a draft or return soon to discover a new message." action={<Button title="Start a campaign" onPress={() => router.push("/create")} />} />}
            <ContinueDraft key={user?.id || "guest"} scope={user?.id || "guest"} ready={ready} />
            {!!feed.length && <View><View style={{ ...styles.row, justifyContent: "space-between" }}><Text style={styles.h2}>More to discover</Text><Button title="See all" variant="ghost" onPress={() => explore()} style={{ paddingHorizontal: 4 }} /></View>{feed.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} config={config.data} compact />)}</View>}
            <View style={{ gap: 14, paddingVertical: 8 }}>
              <Text style={styles.h2}>Create. Review. Amplify.</Text>
              {[["create-outline", "Create", "Prepare your story, sources and intended audience."], ["checkmark-done-outline", "Review", "The platform reviews the message before public backing."], ["radio-outline", "Amplify", "Backers fund advertising. Follow delivery and the final report."]].map(([icon, title, body]) => <View key={title} style={{ flexDirection: "row", gap: 12 }}><Ionicons name={icon as "create-outline"} size={22} color={colors.primary} /><View style={{ flex: 1, gap: 2 }}><Text style={{ ...styles.body, fontWeight: "700" }}>{title}</Text><Text style={styles.muted}>{body}</Text></View></View>)}
            </View>
            <Text style={{ ...styles.muted, fontSize: 12, paddingTop: 12, borderTopWidth: 1, borderColor: colors.line }}>Contributions fund advertising, not direct donations. Campaigns, payments and delivery results in this local prototype are simulated.</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
