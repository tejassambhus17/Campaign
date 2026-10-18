import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, FlatList, ScrollView, useWindowDimensions, View } from "react-native";
import PagerView from "../../components/NativePager";
import { Button, Empty, Pill, Text, useTheme } from "../../components/ui";
import type { Campaign } from "../../lib/types";

/** Existing creator groups and status membership, in their established order. */
export const myCampaignGroups = [
  { title: "Drafts", statuses: ["Draft"], empty: "No drafts yet" },
  { title: "Under Review", statuses: ["Submitted for Review", "Approved"], empty: "No campaigns under review" },
  { title: "Published / Funding", statuses: ["Available for Funding", "Funding Goal Reached", "Funding Period Ends"], empty: "No published campaigns" },
  { title: "Promoting", statuses: ["Distribution Preparation", "Promoting"], empty: "No campaigns in distribution" },
  { title: "Completed", statuses: ["Completed"], empty: "No completed campaigns" },
  { title: "Requires Action", statuses: ["Changes Requested", "Rejected", "Cancelled", "Refund Pending", "Failed"], empty: "No campaigns need your attention" },
] as const;

type Props = {
  campaigns: Campaign[];
  renderCampaign: (campaign: Campaign) => ReactNode;
  onCreate: () => void;
};

/** The parent keys this account-owned surface by user ID. All native pages stay
 * mounted, so swiping/tapping filters preserves their separate reading offsets.
 * Paging has no query, draft, review or other business-state side effects.
 */
export function MyCampaigns({ campaigns, renderCampaign, onCreate }: Props) {
  const { colors, styles } = useTheme();
  const { fontScale } = useWindowDimensions();
  const [selected, setSelected] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  const pager = useRef<PagerView>(null);
  const pending = useRef<number | null>(null);
  const strip = useRef<ScrollView>(null);
  const bounds = useRef<Record<number, { x: number; width: number }>>({});
  const geometry = useRef({ width: 0, contentWidth: 0, offset: 0 });
  const lists = useMemo(() => myCampaignGroups.map(group => campaigns.filter(campaign =>
    (group.statuses as readonly string[]).includes(campaign.status),
  )), [campaigns]);

  useEffect(() => {
    let active = true, changed = false;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (active && !changed) setReduceMotion(value);
    }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", value => {
      changed = true;
      if (active) setReduceMotion(value);
    });
    return () => { active = false; subscription.remove(); };
  }, []);

  const selectPage = (index: number) => {
    if (!Number.isInteger(index) || !myCampaignGroups[index]) return;
    pending.current = index;
    setSelected(index);
    if (reduceMotion) pager.current?.setPageWithoutAnimation(index);
    else pager.current?.setPage(index);
  };
  const revealSelected = useCallback(() => {
    const item = bounds.current[selected], viewport = geometry.current;
    if (!item || !viewport.width || !viewport.contentWidth) return;
    const offset = item.x < viewport.offset ? item.x : item.x + item.width > viewport.offset + viewport.width
      ? item.x + item.width - viewport.width : viewport.offset;
    const next = Math.max(0, Math.min(offset, viewport.contentWidth - viewport.width));
    if (next !== viewport.offset) {
      viewport.offset = next;
      strip.current?.scrollTo({ x: next, animated: false });
    }
  }, [selected]);
  useEffect(revealSelected, [revealSelected, fontScale]);

  return <View style={{ flex: 1, minHeight: 0 }}>
    <ScrollView
      style={{ flexGrow: 0, maxHeight: "45%" }}
      contentContainerStyle={{ gap: 12, paddingBottom: 6 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.muted}>
        {campaigns.length} {campaigns.length === 1 ? "campaign" : "campaigns"} in your account. Drafts also resume from Create.
      </Text>
      <ScrollView
        ref={strip}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingBottom: 4 }}
        onLayout={event => { geometry.current.width = event.nativeEvent.layout.width; revealSelected(); }}
        onContentSizeChange={width => { geometry.current.contentWidth = width; revealSelected(); }}
        onScroll={event => { geometry.current.offset = event.nativeEvent.contentOffset.x; }}
        scrollEventThrottle={16}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {myCampaignGroups.map((group, index) => <View key={group.title}
            onLayout={event => { const { x, width } = event.nativeEvent.layout; bounds.current[index] = { x, width }; if (selected === index) revealSelected(); }}>
            <Pill title={group.title} selected={selected === index} onPress={() => selectPage(index)} />
          </View>)}
        </View>
      </ScrollView>
    </ScrollView>
    <PagerView
      ref={pager}
      style={{ flex: 1 }}
      initialPage={0}
      orientation="horizontal"
      layoutDirection="ltr"
      overScrollMode="never"
      overdrag={false}
      offscreenPageLimit={5}
      onPageSelected={event => {
        const index = event.nativeEvent.position;
        if (!Number.isInteger(index) || !myCampaignGroups[index]) return;
        if (pending.current !== null && pending.current !== index) return;
        pending.current = null;
        setSelected(index);
      }}
      onPageScrollStateChanged={event => { if (event.nativeEvent.pageScrollState === "dragging") pending.current = null; }}
    >
      {myCampaignGroups.map((group, index) => <View key={group.title} collapsable={false}
        style={{ width: "100%", height: "100%" }}
        accessibilityElementsHidden={selected !== index}
        importantForAccessibility={selected === index ? "auto" : "no-hide-descendants"}
        pointerEvents={selected === index ? "auto" : "none"}
      >
        <FlatList
          style={{ flex: 1, backgroundColor: colors.bg }}
          data={lists[index]}
          keyExtractor={campaign => campaign.id}
          renderItem={({ item }) => <View>{renderCampaign(item)}</View>}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          initialNumToRender={4}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 28, flexGrow: 1 }}
          ListEmptyComponent={<Empty
            title={group.empty}
            body="Give your next idea a bigger audience. Your saved drafts will be here when you return."
            action={<Button title="Create a campaign" onPress={onCreate} />}
          />}
        />
      </View>)}
    </PagerView>
  </View>;
}
