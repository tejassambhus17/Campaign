import { useEffect, useMemo, useState } from "react";
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
import { api } from "../../lib/api";
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
import {
  Text,
  useTheme,
  Accordion,
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
  const me = useMe();
  const q = useActivity();
  const actions = useNotificationActions();
  const [filter, setFilter] = useState<ActivityFilter>("All");
  const campaigns = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => api<Campaign[]>("/campaigns"),
    enabled: !!user && !!me.data?.followed.length,
  });
  useRefreshOnFocus(q.refetch, !!user);
  useRefreshOnFocus(campaigns.refetch, !!user && !!me.data?.followed.length);
  useEffect(() => {
    setFilter("All");
  }, [user?.id]);
  const byId = useMemo(() => new Map(
    [...(campaigns.data || []), ...(me.data?.campaigns || [])].map((c) => [c.id, c]),
  ), [campaigns.data, me.data?.campaigns]);
  const sections = useMemo(() => activitySections(q.data || [], filter), [q.data, filter]);

  const heading = (
    <Text
      accessibilityRole="header"
      style={{ color: colors.ink, fontSize: 24, lineHeight: 30, fontWeight: "700", letterSpacing: -0.45 }}
    >
      Activity
    </Text>
  );
  if (!user) {
    return (
      <Screen>
        {heading}
        <Empty
          title="Your updates, in one place"
          body="Sign in for review decisions, funding milestones and receipts. Your activity stays private."
          action={<Button title="Sign in" onPress={() => router.push("/profile")} />}
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
    <View style={{ gap: 8 }}>
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
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
      >
        {([
          ["All", "All"],
          ["Campaigns", "Updates"],
          ["Payments", "Contributions"],
          ["Unread", "Unread"],
          ["Account", "Account"],
        ] as const).map(([value, label]) => (
          <Pill
            key={value}
            title={label}
            selected={filter === value}
            onPress={() => {
              actions.clearError();
              setFilter(value);
            }}
          />
        ))}
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
  const following = !!me.data?.followed.length && (
    <View style={{ marginTop: 20 }}>
      <Accordion title={`Following ${me.data.followed.length} ${me.data.followed.length === 1 ? "campaign" : "campaigns"}`}>
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
                  onPress={() => router.push(`/explore/${encodeURIComponent(id)}`)}
                />
              </View>
            ) : (
              <Text key={id} style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
                A followed campaign is no longer available.
              </Text>
            );
          })
        )}
      </Accordion>
    </View>
  );
  const empty = q.isPending ? (
    <ActivityLoading />
  ) : q.isError && !q.data ? (
    <ErrorState error={q.error} retry={() => void q.refetch()} />
  ) : (
    <View style={{ paddingTop: 16 }}>
      <Empty
        title={filter === "Unread" || filter === "All"
          ? "You're all caught up."
          : `No ${filter === "Campaigns" ? "campaign" : filter === "Payments" ? "contribution" : "account"} updates yet`}
        body={filter === "Unread"
          ? "You've read your updates. New ones will appear here."
          : "Review decisions, contributions and campaign progress appear here as they happen."}
        action={filter !== "All" ? (
          <Button title="See all activity" variant="secondary" onPress={() => setFilter("All")} />
        ) : (
          <Button title="Explore campaigns" onPress={() => router.push("/explore")} />
        )}
      />
    </View>
  );

  return (
    <Screen scroll={false}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        contentContainerStyle={{ width: "100%", maxWidth: 640, alignSelf: "center", padding: 18, paddingBottom: 28, flexGrow: 1 }}
        ListHeaderComponent={header}
        ListFooterComponent={following || null}
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
          <Text accessibilityRole="header" style={{ color: colors.muted, fontSize: 12, lineHeight: 18, fontWeight: "600", paddingTop: 16, paddingBottom: 6 }}>
            {section.title}
          </Text>
        )}
        ListEmptyComponent={empty}
        renderItem={({ item }) => (
          <NotificationRow
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
