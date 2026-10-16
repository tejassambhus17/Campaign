import { discoverCampaigns } from "../../../lib/discovery";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Keyboard, Pressable, ScrollView, Switch, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import {
  Text,
  Button,
  Empty,
  ErrorState,
  Loading,
  Pill,
  Screen,
  fonts,
  useTheme,
} from "../../../components/ui";
import { Campaign, categories } from "../../../lib/types";
import { useCampaigns, useConfig } from "../../../lib/session";
import { CampaignCard } from "../../../features/campaign";
export default function Explore() {
  const { colors, styles, scheme } = useTheme();
  const params = useLocalSearchParams<{ q?: string; category?: string; openFilters?: string }>();
  const q = useCampaigns();
  const config = useConfig();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [funding, setFunding] = useState(false);
  useEffect(() => {
    if (params.q !== undefined) setSearch(Array.isArray(params.q) ? params.q[0] : params.q);
    if (params.category !== undefined) {
      const value = Array.isArray(params.category) ? params.category[0] : params.category;
      setCategory(categories.includes(value) ? value : "All");
    }
  }, [params.q, params.category]);
  useEffect(() => {
    if (params.openFilters) setSortOpen(true);
  }, [params.openFilters]);
  const filtered = useMemo(
    () => discoverCampaigns(q.data || [], { search, category, sort, funding }),
    [q.data, search, category, sort, funding],
  );
  const filtersActive = !!search.trim() || category !== "All" || funding || sort !== "Featured";
  const renderCampaign = useCallback(
    ({ item }: { item: Campaign }) => <CampaignCard campaign={item} config={config.data} compact />,
    [config.data],
  );
  const reset = () => {
    setSearch("");
    setCategory("All");
    setFunding(false);
    setSort("Featured");
    setSortOpen(false);
  };
  return (
    <Screen scroll={false}>
      <FlatList
        data={q.isPending || q.isError ? [] : filtered}
        keyExtractor={(campaign) => campaign.id}
        renderItem={renderCampaign}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 28, width: "100%", maxWidth: 640, alignSelf: "center", flexGrow: 1 }}
        ListHeaderComponent={<View style={{ gap: 10, paddingBottom: 4 }}>
      <Text accessibilityRole="header" style={[styles.title, { marginBottom: 3 }]}>Explore{"\n"}campaigns</Text>
      <View style={[styles.row, { gap: 8 }]}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 7, minHeight: 48, borderRadius: 25, backgroundColor: colors.subtle, paddingHorizontal: 13 }}>
          <Ionicons name="search-outline" size={17} color={colors.muted} />
          <TextInput accessibilityLabel="Search campaigns" keyboardAppearance={scheme} placeholder="Search campaigns…" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} onSubmitEditing={Keyboard.dismiss} returnKeyType="search" selectionColor={colors.focus} style={{ flex: 1, minHeight: 48, paddingVertical: 9, fontFamily: fonts.sans, fontSize: 13, color: colors.ink }} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Campaign filters and sort" accessibilityState={{ expanded: sortOpen }} onPress={() => setSortOpen(!sortOpen)} style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: sortOpen ? colors.green : colors.line, backgroundColor: sortOpen ? colors.mint : colors.paper, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
          <Ionicons name="options-outline" size={20} color={colors.ink} />
          {(funding || sort !== "Featured") && <View style={{ position: "absolute", width: 7, height: 7, borderRadius: 4, top: 8, right: 8, backgroundColor: colors.progress }} />}
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ alignItems: "center" }}>
        <View style={styles.row}>
          {["All", ...categories].map((c) => (
            <Pill
              key={c}
              title={c}
              selected={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </View>
      </ScrollView>
      {sortOpen && <View
        style={{
          gap: 10,
          padding: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.paper,
        }}
      >
        <View
          style={{
            ...styles.row,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Text style={{ ...styles.body, fontWeight: "700" }}>Sort campaigns</Text>
          <View style={{ ...styles.row, minHeight: 48, gap: 6 }}>
            <Text style={{ ...styles.muted, fontSize: 12 }}>
              Open for backing
            </Text>
            <Switch
              accessibilityLabel="Open for backing only"
              value={funding}
              onValueChange={setFunding}
              trackColor={{ false: colors.outline, true: colors.green }}
              thumbColor={colors.paper}
              style={{ minWidth: 48, minHeight: 48 }}
            />
          </View>
        </View>
          <View style={{ ...styles.row, flexWrap: "wrap" }}>
            {["Featured", "Newest", "Most funded", "Closest to goal"].map(
              (s) => (
                <Pill
                  key={s}
                  title={s}
                  selected={sort === s}
                  onPress={() => {
                    setSort(s);
                    setSortOpen(false);
                  }}
                />
              ),
            )}
          </View>
      </View>}
      {filtersActive && <View style={{ ...styles.row, justifyContent: "space-between", gap: 4 }}><Text style={{ ...styles.muted, fontSize: 12, flex: 1 }}>{[search.trim() ? `“${search.trim()}”` : "", category !== "All" ? category : "", funding ? "Open for backing" : "", sort !== "Featured" ? sort : ""].filter(Boolean).join(" · ")}</Text><Button title="Reset" icon="close" variant="ghost" onPress={reset} style={{ paddingHorizontal: 8 }} /></View>}
      {!q.isPending && !q.isError && <Text style={{ ...styles.muted, fontSize: 11, lineHeight: 16 }}>
        {filtered.length} {filtered.length === 1 ? "campaign" : "campaigns"} · demonstration data
      </Text>}
      </View>}
      ListEmptyComponent={q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : (
            <Empty
              title={
                q.data?.length ? "No matching messages yet" : "No campaigns yet"
              }
              body="Try another search or remove a filter to discover more ideas."
              action={
                <Button
                  title="Clear search & filters"
                  variant="secondary"
                  onPress={reset}
                />
              }
            />
      )}
      />
    </Screen>
  );
}
