import { discoverCampaigns } from "../../../lib/discovery";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, FlatList, Keyboard, Pressable, ScrollView, Switch, TextInput, useWindowDimensions, View } from "react-native";
import PagerView from "../../../components/NativePager";
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

const categoryOrder = ["All", ...categories];

export default function Explore() {
  const { colors, styles, scheme } = useTheme();
  const { fontScale } = useWindowDimensions();
  const searchHeight = Math.max(48, Math.ceil(19 * fontScale + 20));
  const params = useLocalSearchParams<{ q?: string; category?: string; openFilters?: string }>();
  const q = useCampaigns();
  const config = useConfig();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [funding, setFunding] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const pager = useRef<PagerView>(null);
  const requestedPage = useRef<number | null>(null);
  const selectedCategory = useRef(category);
  selectedCategory.current = category;
  const categoryStrip = useRef<ScrollView>(null);
  const categoryBounds = useRef<Record<string, { x: number; width: number }>>({});
  const stripGeometry = useRef({ width: 0, contentWidth: 0, offset: 0 });
  const selectCategory = useCallback((index: number, animate = true) => {
    if (!Number.isInteger(index) || !categoryOrder[index]) return;
    requestedPage.current = index;
    setCategory(categoryOrder[index]);
    if (animate && !reduceMotion) pager.current?.setPage(index);
    else pager.current?.setPageWithoutAnimation(index);
  }, [reduceMotion]);
  const selectCategoryRef = useRef(selectCategory);
  selectCategoryRef.current = selectCategory;
  useEffect(() => {
    let active = true, changed = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (active && !changed) setReduceMotion(value); }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => { changed = true; setReduceMotion(value); });
    return () => { active = false; subscription.remove(); };
  }, []);
  const revealCategory = useCallback(() => {
    const bounds = categoryBounds.current[category];
    const strip = stripGeometry.current;
    if (!bounds || !strip.width || !strip.contentWidth) return;
    const offset = bounds.x < strip.offset ? bounds.x : bounds.x + bounds.width > strip.offset + strip.width ? bounds.x + bounds.width - strip.width : strip.offset;
    const next = Math.max(0, Math.min(offset, strip.contentWidth - strip.width));
    if (next !== strip.offset) {
      strip.offset = next;
      categoryStrip.current?.scrollTo({ x: next, animated: false });
    }
  }, [category]);
  useEffect(revealCategory, [revealCategory, fontScale]);
  useEffect(() => {
    // Route changes pin the native pager, including a search-only update while
    // a different page is settling. There is no delayed JS category commit.
    if (params.q !== undefined) setSearch(Array.isArray(params.q) ? params.q[0] : params.q);
    if (params.category !== undefined) {
      const value = Array.isArray(params.category) ? params.category[0] : params.category;
      selectCategoryRef.current(categories.includes(value) ? categoryOrder.indexOf(value) : 0, false);
    } else if (params.q !== undefined) selectCategoryRef.current(categoryOrder.indexOf(selectedCategory.current), false);
  }, [params.q, params.category]);
  useEffect(() => {
    if (params.openFilters) setSortOpen(true);
  }, [params.openFilters]);
  const pageResults = useMemo(
    () => categoryOrder.map((pageCategory) => discoverCampaigns(q.data || [], { search, category: pageCategory, sort, funding })),
    [q.data, search, sort, funding],
  );
  const selectedIndex = Math.max(0, categoryOrder.indexOf(category));
  const filtered = pageResults[selectedIndex];
  const filtersActive = !!search.trim() || category !== "All" || funding || sort !== "Featured";
  const renderCampaign = useCallback(
    ({ item }: { item: Campaign }) => <CampaignCard campaign={item} config={config.data} compact />,
    [config.data],
  );
  const reset = () => {
    setSearch("");
    selectCategory(0);
    setFunding(false);
    setSort("Featured");
    setSortOpen(false);
  };
  return (
    <Screen scroll={false}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" style={{ flexGrow: 0, maxHeight: "55%" }} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 4, width: "100%", maxWidth: 640, alignSelf: "center", gap: 10 }}>
      <Text accessibilityRole="header" style={[styles.title, { marginBottom: 3 }]}>Explore{"\n"}campaigns</Text>
      <View style={[styles.row, { gap: 8 }]}>
        <View style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 7, height: searchHeight, borderRadius: 25, backgroundColor: colors.subtle, paddingHorizontal: 13 }}>
          <Ionicons name="search-outline" size={17} color={colors.muted} />
          <TextInput accessibilityLabel="Search campaigns" keyboardAppearance={scheme} placeholder="Search campaigns…" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} onSubmitEditing={Keyboard.dismiss} returnKeyType="search" selectionColor={colors.focus} style={{ flex: 1, minWidth: 0, height: searchHeight, paddingVertical: 9, fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.ink }} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Campaign filters and sort" accessibilityState={{ expanded: sortOpen }} onPress={() => setSortOpen(!sortOpen)} style={({ pressed }) => ({ width: 48, height: searchHeight, borderRadius: 24, borderWidth: 1, borderColor: sortOpen ? colors.green : colors.line, backgroundColor: sortOpen ? colors.mint : colors.paper, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
          <Ionicons name="options-outline" size={20} color={colors.ink} />
          {(funding || sort !== "Featured") && <View style={{ position: "absolute", width: 7, height: 7, borderRadius: 4, top: 8, right: 8, backgroundColor: colors.progress }} />}
        </Pressable>
      </View>
      <ScrollView ref={categoryStrip} horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ alignItems: "center" }}
        onLayout={(event) => { stripGeometry.current.width = event.nativeEvent.layout.width; revealCategory(); }}
        onContentSizeChange={(width) => { stripGeometry.current.contentWidth = width; revealCategory(); }}
        onScroll={(event) => { stripGeometry.current.offset = event.nativeEvent.contentOffset.x; }} scrollEventThrottle={16}>
        <View style={styles.row}>
          {categoryOrder.map((c, index) => (
            <View key={c} onLayout={(event) => { const { x, width } = event.nativeEvent.layout; categoryBounds.current[c] = { x, width }; if (c === category) revealCategory(); }}>
            <Pill
              title={c}
              selected={category === c}
              onPress={() => selectCategory(index)}
            />
            </View>
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
      </ScrollView>
      <PagerView ref={pager} style={{ flex: 1 }} initialPage={0} orientation="horizontal" layoutDirection="ltr" overScrollMode="never" overdrag={false} offscreenPageLimit={1} keyboardDismissMode="on-drag"
        onPageSelected={(event) => {
          const index = event.nativeEvent.position;
          if (!Number.isInteger(index) || !categoryOrder[index]) return;
          if (requestedPage.current !== null && requestedPage.current !== index) return;
          requestedPage.current = null;
          setCategory(categoryOrder[index]);
        }}
        onPageScrollStateChanged={(event) => { if (event.nativeEvent.pageScrollState === "dragging") requestedPage.current = null; }}>
      {categoryOrder.map((pageCategory, index) => <View key={pageCategory} collapsable={false} style={{ width: "100%", height: "100%" }} accessibilityElementsHidden={selectedIndex !== index} importantForAccessibility={selectedIndex === index ? "auto" : "no-hide-descendants"} pointerEvents={selectedIndex === index ? "auto" : "none"}>
      <FlatList
        data={q.isPending || q.isError ? [] : pageResults[index]}
        keyExtractor={(campaign) => campaign.id}
        renderItem={renderCampaign}
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 2, paddingBottom: 28, width: "100%", maxWidth: 640, alignSelf: "center", flexGrow: 1 }}
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
      </View>)}
      </PagerView>
    </Screen>
  );
}
