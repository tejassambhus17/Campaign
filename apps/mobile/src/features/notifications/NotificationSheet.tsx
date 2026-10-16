import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  findNodeHandle,
  Modal,
  PanResponder,
  Pressable,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button, IconButton, Text, useTheme } from "../../components/ui";
import { notificationAction, recentNotifications } from "../../lib/activity";
import { captureApiSession } from "../../lib/api";
import { useActivity, useSession } from "../../lib/session";
import { Notification } from "../../lib/types";
import { NotificationRow } from "./NotificationRow";
import { useNotificationActions } from "./useNotificationActions";

/** Native quick view over the same private feed used by the Activity tab. */
export function NotificationSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const { user, ready } = useSession();
  const q = useActivity();
  const actions = useNotificationActions();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const sheetHeight = Math.min(height - insets.top - 24, height * 0.84, 800);
  const offset = useRef(new Animated.Value(height)).current;
  const dim = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);
  const live = useRef(visible);
  const closeRef = useRef(onClose);
  const heading = useRef<View>(null);
  const [reduceMotion, setReduceMotion] = useState(true);
  live.current = visible;
  closeRef.current = onClose;

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (active) setReduceMotion(value); }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    if (visible) {
      closing.current = false;
      offset.setValue(height);
      dim.setValue(0);
      if (ready && user) void q.refetch();
    }
    // One refresh per opening, not per query update or animation frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  useEffect(() => () => { offset.stopAnimation(); dim.stopAnimation(); }, [offset, dim]);

  const present = () => {
    Animated.parallel([
      Animated.timing(offset, { toValue: 0, duration: reduceMotion ? 0 : 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(dim, { toValue: 1, duration: reduceMotion ? 0 : 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (!finished || !live.current) return;
      const node = findNodeHandle(heading.current);
      if (node) AccessibilityInfo.setAccessibilityFocus(node);
    });
  };
  const dismiss = (after?: () => void) => {
    if (closing.current || !live.current) return;
    closing.current = true;
    Animated.parallel([
      Animated.timing(offset, { toValue: height, duration: reduceMotion ? 0 : 190, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(dim, { toValue: 0, duration: reduceMotion ? 0 : 150, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (!finished || !live.current) return;
      closeRef.current();
      // Remove the modal before changing routes; no hidden touch-blocking window.
      if (after) requestAnimationFrame(after);
    });
  };
  const navigate = (href: string) => {
    const current = captureApiSession();
    dismiss(() => { if (current()) router.push(href as Href); });
  };
  const openNotification = (item: Notification) => {
    if (!user) return;
    void actions.markRead(item);
    navigate(notificationAction(item).href);
  };
  const gestureActions = useRef({ dismiss, reduceMotion });
  gestureActions.current = { dismiss, reduceMotion };
  const [drag] = useState(() => PanResponder.create({
    // ModalHost otherwise claims the start, preventing a descendant from
    // receiving later moves. Child buttons win this bubbling start first.
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: (_, gesture) => gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.4,
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.4,
    onPanResponderGrant: () => { offset.stopAnimation(); dim.setValue(1); },
    onPanResponderMove: (_, gesture) => { if (!closing.current) offset.setValue(Math.max(0, gesture.dy)); },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 72 || gesture.vy > 0.75) gestureActions.current.dismiss();
      else Animated.timing(offset, { toValue: 0, duration: gestureActions.current.reduceMotion ? 0 : 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderTerminate: () => Animated.timing(offset, { toValue: 0, duration: gestureActions.current.reduceMotion ? 0 : 180, useNativeDriver: true }).start(),
  }));
  const refresh = () => { actions.clearError(); if (user) void q.refetch(); };
  const items = user ? recentNotifications(q.data || []) : [];
  const unread = user ? (q.data || []).filter((item) => !item.read).length : 0;
  if (!visible) return null;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onShow={present} onRequestClose={() => dismiss()}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.56)", opacity: dim }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss notifications" onPress={() => dismiss()} style={{ flex: 1 }} />
        </Animated.View>
        <Animated.View accessibilityViewIsModal style={{ width: "100%", maxWidth: 640, alignSelf: "center", maxHeight: sheetHeight, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", backgroundColor: colors.paper, transform: [{ translateY: offset }] }}>
          <View {...drag.panHandlers} style={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 8 }}>
            <View accessible={false} style={{ width: 34, height: 4, borderRadius: 2, backgroundColor: colors.outline, alignSelf: "center", marginBottom: 8 }} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View ref={heading} accessible accessibilityRole="header" accessibilityLabel="Notifications" style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, lineHeight: 27, fontWeight: "700", color: colors.ink }}>Notifications</Text>
              </View>
              {!!user && <IconButton label="Refresh notifications" icon="refresh-outline" loading={q.isFetching} onPress={refresh} />}
              <IconButton label="Close notifications" icon="close" onPress={() => dismiss()} />
            </View>
            {!!user && <View style={{ flexDirection: width < 350 ? "column" : "row", alignItems: width < 350 ? "flex-start" : "center", justifyContent: "space-between", minHeight: 48, gap: 4 }}>
              <Text accessibilityLiveRegion="polite" style={{ fontSize: 12, lineHeight: 18, color: unread ? colors.green : colors.muted, fontWeight: "600" }}>{q.data ? unread ? `${unread} unread` : "All caught up" : "Your private updates"}</Text>
              {unread > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Mark all as read" accessibilityState={{ disabled: actions.markingAll, busy: actions.markingAll }} disabled={actions.markingAll} onPress={() => { void actions.markAllRead(); }} style={({ pressed }) => ({ minHeight: 48, justifyContent: "center", paddingHorizontal: 8, opacity: pressed || actions.markingAll ? 0.55 : 1 })}>
                <Text style={{ fontSize: 12, lineHeight: 18, color: colors.green, fontWeight: "700" }}>{actions.markingAll ? "Saving…" : "Mark all as read"}</Text>
              </Pressable>}
            </View>}
          </View>

          {!!user && (!!actions.error || (q.isError && !!q.data)) && <View accessibilityRole="alert" style={{ paddingHorizontal: 18, paddingVertical: 10, backgroundColor: colors.errorSurface }}>
            <Text style={{ fontSize: 12, lineHeight: 18, color: colors.red, fontWeight: "600" }}>{actions.error || "Couldn't refresh. Showing your last loaded updates. Try refreshing again."}</Text>
          </View>}

          <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ paddingBottom: 8 }} refreshControl={user ? <RefreshControl refreshing={q.isRefetching} onRefresh={refresh} tintColor={colors.green} colors={[colors.green]} progressBackgroundColor={colors.paper} /> : undefined}>
            {!ready ? <View style={{ padding: 24, gap: 12 }}><ActivityIndicator color={colors.green} /><Text style={{ fontSize: 13, textAlign: "center", color: colors.muted }}>Restoring your account…</Text></View>
              : !user ? <View style={{ padding: 18, paddingTop: 12, gap: 16 }}><SheetMessage icon="lock-closed-outline" title="Keep up with your campaigns" body="Sign in for private review updates, funding milestones and receipts." /><Button title="Sign in" variant="secondary" onPress={() => navigate("/profile")} /></View>
              : q.isPending && !q.data ? <View style={{ padding: 24, gap: 12 }}><ActivityIndicator color={colors.green} accessibilityLabel="Loading notifications" /><Text style={{ fontSize: 13, textAlign: "center", color: colors.muted }}>Loading your updates…</Text></View>
              : q.isError && !q.data ? <View style={{ padding: 18, gap: 12 }}><SheetMessage icon="cloud-offline-outline" error title="Couldn't load notifications" body="Check your connection, then try again. Your activity is safe." /><Button title="Retry notifications" variant="secondary" onPress={refresh} /></View>
              : <>
                {!items.length ? <SheetMessage icon="checkmark-circle-outline" title="You're all caught up." body="New campaign and account updates will appear here." /> : <>
                  <Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted, paddingHorizontal: 18, paddingBottom: 6 }}>Recent · Latest {items.length}</Text>
                  {items.map((item) => <NotificationRow key={item.id} item={item} compact pending={actions.pendingIds.has(item.id)} onRead={() => { void actions.markRead(item); }} onOpen={() => openNotification(item)} />)}
                </>}
              </>}
          </ScrollView>
          <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 18, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.paper }}>
            <Button title="View all activity" icon="arrow-forward" onPress={() => navigate("/activity")} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SheetMessage({ icon, title, body, error = false }: { icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; body: string; error?: boolean }) {
  const { colors } = useTheme();
  return <View accessibilityRole={error ? "alert" : undefined} style={{ padding: 18, gap: 8 }}>
    <Ionicons name={icon} size={23} color={error ? colors.red : colors.green} />
    <Text style={{ fontSize: 15, lineHeight: 21, fontWeight: "700", color: colors.ink }}>{title}</Text>
    <Text style={{ fontSize: 13, lineHeight: 19, color: colors.muted }}>{body}</Text>
  </View>;
}
