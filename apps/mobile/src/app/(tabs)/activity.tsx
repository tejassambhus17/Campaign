import { useEffect, useRef, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  SectionList,
  View,
} from "react-native";
import { Href, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Ionicons from "@expo/vector-icons/Ionicons";
import { api } from "../../lib/api";
import { Campaign, Notification } from "../../lib/types";
import {
  ActivityFilter,
  activityCategory,
  activityFilters,
  activitySections,
  activityTime,
  notificationAction,
} from "../../lib/activity";
import {
  queryClient,
  useActivity,
  useMe,
  useSession,
  useRefreshOnFocus,
} from "../../lib/session";
import {
  Text,
  useTheme,
  Accordion,
  Button,
  IconButton,
  PageHeader,
  Empty,
  ErrorState,
  Loading,
  Notice,
  Pill,
  Progress,
  Screen,
} from "../../components/ui";

export default function Activity() {
  const { colors, styles } = useTheme();
  const { user } = useSession();
  const me = useMe();
  const q = useActivity();
  const [filter, setFilter] = useState<ActivityFilter>("All");
  const [error, setError] = useState("");
  const [marking, setMarking] = useState<string[]>([]);
  const pending = useRef(new Set<string>());
  const campaigns = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => api<Campaign[]>("/campaigns"),
    enabled: !!user && !!me.data?.followed.length,
  });
  useRefreshOnFocus(q.refetch, !!user);
  useRefreshOnFocus(campaigns.refetch, !!user && !!me.data?.followed.length);
  useEffect(() => {
    setFilter("All");
    setError("");
  }, [user?.id]);

  async function markRead(item: Notification) {
    if (item.read || pending.current.has(item.id) || !user) return;
    const key = ["activity", user.id];
    pending.current.add(item.id);
    setMarking((current) => [...current, item.id]);
    setError("");
    try {
      await api(`/activity/${encodeURIComponent(item.id)}/read`, {
        method: "POST",
      });
      // Never recreate a private query that sign-out has already removed.
      queryClient.setQueriesData<Notification[]>(
        { queryKey: key, exact: true },
        (current) =>
          current?.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      );
    } catch (e) {
      setError(`Read status was not saved. ${(e as Error).message}`);
    } finally {
      pending.current.delete(item.id);
      setMarking((current) => current.filter((id) => id !== item.id));
    }
  }

  const heading = (
    <PageHeader
      title="Activity"
      description={
        !user ? "Campaign updates and your contribution history." : undefined
      }
    />
  );
  if (!user) {
    return (
      <Screen>
        {heading}
        <Empty
          title="Your updates, in one place"
          body="Sign in for review decisions, funding milestones and receipts. Your activity stays private."
          action={
            <Button title="Sign in" onPress={() => router.push("/profile")} />
          }
        />
      </Screen>
    );
  }

  const unread = q.data?.filter((n) => !n.read).length || 0;
  const byId = new Map(
    [...(campaigns.data || []), ...(me.data?.campaigns || [])].map((c) => [
      c.id,
      c,
    ]),
  );
  const header = (
    <View style={{ gap: 12 }}>
      <PageHeader
        title="Activity"
        action={
          <View style={{ flexDirection: "row" }}>
            <IconButton
              label="Notification preferences"
              icon="options-outline"
              onPress={() => router.push("/profile?section=Settings")}
            />
            <IconButton
              label="Refresh activity"
              icon="refresh-outline"
              loading={q.isFetching}
              onPress={() => {
                void q.refetch();
                void me.refetch();
                if (me.data?.followed.length) void campaigns.refetch();
              }}
            />
          </View>
        }
      />
      <View
        style={{
          ...styles.row,
          justifyContent: "space-between",
          flexWrap: "wrap",
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: colors.mint,
        }}
      >
        <Text
          accessibilityLiveRegion="polite"
          style={{ ...styles.body, fontWeight: "700" }}
        >
          {q.data ? `${unread} unread` : "Recent updates"}
        </Text>
        <Text style={[styles.muted, { fontSize: 12 }]}>Private to your account</Text>
      </View>
      {!!error && <Notice tone="error">{error}</Notice>}
      {q.isError && !!q.data && (
        <Notice tone="error">
          Could not refresh. Showing your previously loaded updates.{" "}
          {q.error.message}
        </Notice>
      )}
      {!!me.data?.followed.length && (
        <Accordion
          title={`Following ${me.data.followed.length} ${me.data.followed.length === 1 ? "campaign" : "campaigns"}`}
        >
          {campaigns.isPending ? (
            <Loading />
          ) : campaigns.isError ? (
            <ErrorState
              error={campaigns.error}
              retry={() => void campaigns.refetch()}
            />
          ) : (
            me.data.followed.map((id) => {
              const campaign = byId.get(id);
              return campaign ? (
                <View key={id} style={{ paddingVertical: 8, gap: 8 }}>
                  <Text style={{ ...styles.body, fontWeight: "700" }}>
                    {campaign.title}
                  </Text>
                  <Text style={styles.muted}>{campaign.status}</Text>
                  <Progress raised={campaign.raised} goal={campaign.goal} />
                  <Button
                    title={`Read ${campaign.title}`}
                    variant="ghost"
                    onPress={() => router.push(`/explore/${id}`)}
                  />
                </View>
              ) : (
                <Text key={id} style={styles.muted}>
                  A followed campaign is no longer available.
                </Text>
              );
            })
          )}
        </Accordion>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
      >
        {activityFilters.map((value) => (
          <Pill
            key={value}
            title={value}
            selected={filter === value}
            onPress={() => setFilter(value)}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Screen scroll={false}>
      <SectionList
        sections={activitySections(q.data || [], filter)}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        contentContainerStyle={{
          width: "100%",
          maxWidth: 640,
          alignSelf: "center",
          padding: 18,
          paddingBottom: 28,
          flexGrow: 1,
        }}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        refreshControl={
          Platform.OS === "web" ? undefined : (
            <RefreshControl
              refreshing={q.isRefetching}
              tintColor={colors.green}
              colors={[colors.green]}
              progressBackgroundColor={colors.paper}
              onRefresh={() => void q.refetch()}
            />
          )
        }
        renderSectionHeader={({ section }) => (
          <Text
            accessibilityRole="header"
            style={{ ...styles.label, paddingTop: 20, paddingBottom: 8 }}
          >
            {section.title}
          </Text>
        )}
        ListEmptyComponent={
          q.isPending ? (
            <Loading />
          ) : q.isError && !q.data ? (
            <ErrorState error={q.error} retry={() => void q.refetch()} />
          ) : (
            <View style={{ paddingTop: 20 }}>
              <Empty
                title={
                  filter === "Unread"
                    ? "You're all caught up"
                    : filter === "All"
                      ? "Your next update starts here"
                      : `No ${filter.toLowerCase()} updates yet`
                }
                body={
                  filter === "Unread"
                    ? "You've read your recent updates. New ones will appear here."
                    : "Follow or back a message. Relevant updates will appear here as its story moves forward."
                }
                action={
                  filter !== "All" ? (
                    <Button
                      title="See all updates"
                      variant="secondary"
                      onPress={() => setFilter("All")}
                    />
                  ) : (
                    <Button
                      title="Explore campaigns"
                      onPress={() => router.push("/explore")}
                    />
                  )
                }
              />
            </View>
          )
        }
        renderItem={({ item }) => (
          <ActivityCard
            item={item}
            marking={marking.includes(item.id)}
            campaignTitle={
              item.campaignTitle || byId.get(item.campaignId || "")?.title
            }
            onRead={() => void markRead(item)}
            onOpen={() => {
              // Slow read-state writes must never trap the user outside a destination.
              void markRead(item);
              router.push(notificationAction(item).href as Href);
            }}
          />
        )}
      />
    </Screen>
  );
}

function ActivityCard({
  item,
  campaignTitle,
  marking,
  onRead,
  onOpen,
}: {
  item: Notification;
  campaignTitle?: string;
  marking: boolean;
  onRead: () => void;
  onOpen: () => void;
}) {
  const { colors, styles } = useTheme();
  const icon =
    item.category === "payments"
      ? "receipt-outline"
      : item.category === "security"
        ? "shield-checkmark-outline"
        : "flag-outline";
  return (
    <View
      style={{
        paddingVertical: 14,
        flexDirection: "row",
        gap: 12,
        borderBottomWidth: 1,
        borderColor: colors.line,
      }}
    >
      <View
        accessible={false}
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: item.read ? colors.subtle : colors.mint,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
        }}
      >
        <Ionicons name={icon} size={19} color={item.read ? colors.muted : colors.green} />
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <View
          style={{
            ...styles.row,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <View style={styles.row}>
            <Text style={{ ...styles.muted, fontSize: 12 }}>
              {activityCategory(item.category)}
            </Text>
          </View>
          <Text
            style={{
              ...styles.muted,
              fontSize: 12,
              color: item.read ? colors.muted : colors.green,
              fontWeight: item.read ? "400" : "700",
            }}
          >
            {item.read ? "Read" : "Unread"}
          </Text>
        </View>
        <Text
          accessibilityRole="header"
          style={{
            ...styles.h2,
            fontSize: 16,
            lineHeight: 23,
            letterSpacing: -0.2,
          }}
        >
          {item.title}
        </Text>
        {!!campaignTitle && (
          <Text style={{ ...styles.muted, fontSize: 13, fontWeight: "700" }}>
            {campaignTitle}
          </Text>
        )}
        <Text style={{ ...styles.body, fontSize: 14, lineHeight: 21 }}>
          {item.body}
        </Text>
        <Text style={{ ...styles.muted, fontSize: 12 }}>
          {activityTime(item.createdAt)}
        </Text>
        <View
          style={{
            ...styles.row,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <Button
            title={notificationAction(item).title}
            icon="arrow-forward-outline"
            variant="ghost"
            onPress={onOpen}
            style={{ paddingHorizontal: 0 }}
          />
          {!item.read && (
            <Button
              title="Mark read"
              variant="secondary"
              loading={marking}
              onPress={onRead}
              style={{ paddingHorizontal: 13 }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
