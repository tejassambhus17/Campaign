import { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  View,
} from "react-native";
import { Href, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import PagerView from "../../components/NativePager";
import { api, captureApiSession } from "../../lib/api";
import { Campaign } from "../../lib/types";
import {
  ActivityFilter,
  activitySections,
  notificationAction,
} from "../../lib/activity";
import {
  useActivity,
  useMe,
  useSession,
  useRefreshOnFocus,
} from "../../lib/session";
import { NotificationRow } from "../../features/notifications/NotificationRow";
import { useNotificationActions } from "../../features/notifications/useNotificationActions";
import { activityPages, useActivityPages } from "../../features/notifications/useActivityPages";
import { InfoSheet, SummaryLink } from "../../components/Information";
import {
  Text,
  useTheme,
  Button,
  IconButton,
  Empty,
  ErrorState,
  Notice,
  Pill,
  Progress,
  Screen,
} from "../../components/ui";

export default function Activity() {
  const { colors } = useTheme();
  const { user } = useSession();
  const [followingOwner, setFollowingOwner] = useState<string | null>(null);
  const followingTrigger = useRef<View>(null);
  useEffect(() => { setFollowingOwner(null); }, [user?.id]);
  const me = useMe();
  const q = useActivity();
  const actions = useNotificationActions();
  const navigation = useActivityPages(user?.id);
  const { filter } = navigation;
  const campaigns = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => api<Campaign[]>("/campaigns"),
    enabled: !!user && !!me.data?.followed.length,
  });
  useRefreshOnFocus(q.refetch, !!user);
  useRefreshOnFocus(campaigns.refetch, !!user && !!me.data?.followed.length);
  const byId = useMemo(() => new Map(
    [...(campaigns.data || []), ...(me.data?.campaigns || [])].map((c) => [c.id, c]),
  ), [campaigns.data, me.data?.campaigns]);
  const pageSections = useMemo(() => activityPages.map(page => activitySections(q.data || [], page.value)), [q.data]);

  const heading = (
    <Text
      accessibilityRole="header"
      style={{ color: colors.ink, fontSize: 22, lineHeight: 28, fontWeight: "700", letterSpacing: -0.35 }}
    >
      Activity
    </Text>
  );
  if (!user) {
    return (
      <Screen compact>
        {heading}
        <Empty
          title="Your updates, in one place"
          body="Sign in for private campaign updates and contribution receipts."
          action={<Button title="Sign in" onPress={() => router.push("/profile?auth=login")} />}
        />
      </Screen>
    );
  }

  const unread = q.data?.filter((n) => !n.read).length || 0;
  function refreshActivity() {
    actions.clearError();
    void q.refetch();
    void me.refetch();
    if (me.data?.followed.length) void campaigns.refetch();
  }
  const header = (
    <View style={{ gap: 6 }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}
      >
        <View style={{ flex: 1 }}>{heading}</View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <IconButton
            label="Notification preferences"
            icon="options-outline"
            onPress={() => router.push("/profile?section=Notifications")}
          />
          <IconButton
            label="Refresh activity"
            icon="refresh-outline"
            loading={q.isFetching}
            onPress={refreshActivity}
          />
        </View>
      </View>
      <ScrollView
        ref={navigation.strip}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingBottom: 2 }}
        onLayout={event => navigation.recordStrip(event.nativeEvent.layout.width)}
        onContentSizeChange={navigation.recordContent}
        onScroll={event => navigation.recordOffset(event.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {activityPages.map(({ value, title }) => (
          <View key={value} onLayout={event => {
            const { x, width } = event.nativeEvent.layout;
            navigation.recordFilter(value, x, width);
          }}>
          <Pill
            title={title}
            selected={filter === value}
            onPress={() => {
              actions.clearError();
              navigation.selectFilter(value);
            }}
          />
          </View>
        ))}
        </View>
      </ScrollView>
      <View
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", minHeight: 48 }}
      >
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}
        >
          {q.data ? `${unread} unread · Private to you` : "Private to your account"}
        </Text>
        {!!q.data && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mark all activity as read"
            accessibilityState={{ disabled: actions.markingAll || !unread, busy: actions.markingAll }}
            disabled={actions.markingAll || !unread}
            onPress={() => void actions.markAllRead()}
            style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 4, justifyContent: "center", opacity: pressed || actions.markingAll ? 0.55 : 1 })}
          >
            <Text style={{ color: unread ? colors.green : colors.muted, fontSize: 12, lineHeight: 18, fontWeight: "700" }}>
              {actions.markingAll ? "Marking as read…" : "Mark all as read"}
            </Text>
          </Pressable>
        )}
      </View>
      {!!actions.error && <Notice tone="error">{actions.error}</Notice>}
      {q.isError && !!q.data && (
        <Notice tone="error">
          Could not refresh. Your loaded updates are still available. Pull down or use Refresh to retry.
        </Notice>
      )}
    </View>
  );
  const followingTitle = `Following ${me.data?.followed.length || 0} ${me.data?.followed.length === 1 ? "campaign" : "campaigns"}`;
  const followingContent = !!me.data?.followed.length && (
    <View style={{ gap: 12 }}>
        {campaigns.isPending ? (
          <ActivityLoading />
        ) : campaigns.isError ? (
          <ErrorState error={campaigns.error} retry={() => void campaigns.refetch()} />
        ) : (
          me.data.followed.map((id) => {
            const campaign = byId.get(id);
            return campaign ? (
              <View key={id} style={{ paddingVertical: 8, gap: 8 }}>
                <Text style={{ color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: "700" }}>{campaign.title}</Text>
                <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{campaign.status}</Text>
                <Progress raised={campaign.raised} goal={campaign.goal} />
                <Button
                  title="Read campaign"
                  variant="ghost"
                  onPress={() => {
                    const current = captureApiSession();
                    setFollowingOwner(null);
                    requestAnimationFrame(() => { if (current()) router.push(`/explore/${encodeURIComponent(id)}`); });
                  }}
                />
              </View>
            ) : (
              <Text key={id} style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
                A followed campaign is no longer available.
              </Text>
            );
          })
        )}
    </View>
  );
  const empty = (pageFilter: ActivityFilter) => q.isPending ? (
    <ActivityLoading />
  ) : q.isError && !q.data ? (
    <ErrorState error={q.error} retry={() => void q.refetch()} />
  ) : (
    <View style={{ paddingTop: 16 }}>
      <Empty
        title={pageFilter === "Unread" || pageFilter === "All"
          ? "You're all caught up."
          : `No ${pageFilter === "Campaigns" ? "campaign" : pageFilter === "Payments" ? "contribution" : "account"} updates yet`}
        body={pageFilter === "Unread"
          ? "You've read your updates. New ones will appear here."
          : "Review decisions, contributions and campaign progress appear here as they happen."}
        action={pageFilter !== "All" ? (
          <Button title="See all activity" variant="secondary" onPress={() => navigation.selectFilter("All")} />
        ) : (
          <Button title="Explore campaigns" onPress={() => router.push("/explore")} />
        )}
      />
    </View>
  );

  return (
    <Screen scroll={false}>
      <ScrollView
        style={{ flexGrow: 0, maxHeight: "55%" }}
        contentContainerStyle={{ width: "100%", maxWidth: 640, alignSelf: "center", paddingHorizontal: 18, paddingTop: 10, paddingBottom: 2 }}
        keyboardShouldPersistTaps="handled"
      >
        {header}
      </ScrollView>
      <PagerView
        key={user.id}
        ref={navigation.pager}
        style={{ flex: 1 }}
        initialPage={0}
        orientation="horizontal"
        layoutDirection="ltr"
        overScrollMode="never"
        overdrag={false}
        offscreenPageLimit={4}
        onPageSelected={event => navigation.onPageSelected(event.nativeEvent.position)}
        onPageScrollStateChanged={event => navigation.onPageScrollStateChanged(event.nativeEvent.pageScrollState)}
      >
      {activityPages.map((page, index) => <View
        key={page.value}
        collapsable={false}
        style={{ width: "100%", height: "100%" }}
        accessibilityElementsHidden={navigation.selectedIndex !== index}
        importantForAccessibility={navigation.selectedIndex === index ? "auto" : "no-hide-descendants"}
        pointerEvents={navigation.selectedIndex === index ? "auto" : "none"}
      >
      <SectionList
        style={{ flex: 1, backgroundColor: colors.bg }}
        sections={pageSections[index]}
        nestedScrollEnabled
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        contentContainerStyle={{ width: "100%", maxWidth: 640, alignSelf: "center", paddingHorizontal: 18, paddingBottom: 20, flexGrow: 1 }}
        ListFooterComponent={me.data?.followed.length ? <View style={{ marginTop: 12 }}><SummaryLink title={followingTitle} summary="Campaigns you follow" icon="notifications-outline" compact testID={`activity-following-${page.value.toLowerCase()}`} triggerRef={navigation.selectedIndex === index ? followingTrigger : undefined} onPress={() => setFollowingOwner(user.id)} /></View> : null}
        refreshControl={Platform.OS === "web" ? undefined : (
          <RefreshControl
            refreshing={q.isRefetching}
            tintColor={colors.green}
            colors={[colors.green]}
            progressBackgroundColor={colors.paper}
            onRefresh={refreshActivity}
          />
        )}
        renderSectionHeader={({ section }) => (
          <Text accessibilityRole="header" style={{ color: colors.muted, fontSize: 12, lineHeight: 18, fontWeight: "600", paddingTop: 12, paddingBottom: 4 }}>
            {section.title}
          </Text>
        )}
        ListEmptyComponent={empty(page.value)}
        renderItem={({ item }) => (
          <NotificationRow
            presentation="history"
            item={item}
            pending={actions.pendingIds.has(item.id)}
            campaignTitle={item.campaignTitle || byId.get(item.campaignId || "")?.title}
            onRead={() => void actions.markRead(item)}
            onOpen={() => {
              // Opening a destination never waits for read-state transport.
              void actions.markRead(item);
              router.push(notificationAction(item).href as Href);
            }}
          />
        )}
      />
      </View>)}
      </PagerView>
      <InfoSheet visible={followingOwner === user.id} title={followingTitle} onClose={() => setFollowingOwner(null)} returnFocusRef={followingTrigger} testID="activity-following-sheet">
        {followingContent}
      </InfoSheet>
    </Screen>
  );
}

function ActivityLoading() {
  const { colors } = useTheme();
  return (
    <View accessibilityLabel="Loading activity" accessibilityState={{ busy: true }} style={{ paddingTop: 12 }}>
      {[1, 2, 3].map((row) => (
        <View key={row} style={{ flexDirection: "row", gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.line }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceRaised }} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ height: 14, width: "75%", borderRadius: 4, backgroundColor: colors.surfaceRaised }} />
            <View style={{ height: 12, width: "92%", borderRadius: 4, backgroundColor: colors.surfaceRaised }} />
            <View style={{ height: 10, width: "34%", borderRadius: 4, backgroundColor: colors.surfaceRaised }} />
          </View>
        </View>
      ))}
    </View>
  );
}
