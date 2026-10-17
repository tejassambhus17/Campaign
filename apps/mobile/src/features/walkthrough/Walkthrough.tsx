import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlatformPressable } from "@react-navigation/elements";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { usePathname } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AccessibilityInfo, AppState, BackHandler, findNodeHandle, Keyboard, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button, Text, useTheme } from "../../components/ui";
import { useSession } from "../../lib/session";
import { canOfferWalkthrough, createWalkthroughStore } from "../../lib/walkthrough";
import { placeTourCard, TourRect, visibleTourTarget } from "./layout";

type Target = "home" | "viewport" | "search" | "create" | "back" | "activity";
type HomeState = { focused: boolean; ready: boolean; blocked: boolean; pending: boolean };
type Store = ReturnType<typeof createWalkthroughStore>;
type ContextValue = {
  store: Store;
  active: boolean;
  invitation: boolean;
  launchError: string;
  requestReplay: () => void;
  start: () => void;
  skip: () => void;
  setHome: (next: HomeState) => void;
  register: (id: Target, view: View | null) => void;
  measure: (id: Target, callback: (rect: TourRect | null) => void) => void;
};
const Context = createContext<ContextValue | null>(null);
export function useWalkthrough() {
  const value = useContext(Context);
  if (!value) throw new Error("Walkthrough must be inside its provider");
  return value;
}

export function WalkthroughProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => createWalkthroughStore(AsyncStorage));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const session = useSession();
  const pathname = usePathname();
  const [home, setHomeState] = useState<HomeState>({ focused: false, ready: false, blocked: false, pending: false });
  const [invitation, setInvitation] = useState(false);
  const [replay, setReplay] = useState(false);
  const [launchError, setLaunchError] = useState("");
  const [foreground, setForeground] = useState(AppState.currentState === "active");
  const targets = useRef(new Map<Target, View>());
  const [targetRevision, setTargetRevision] = useState(0);
  const starting = useRef(false);
  const live = useRef(true);
  const isHome = pathname === "/" && home.focused;
  const homeIdle = isHome && home.ready && !home.blocked && !home.pending && foreground;
  const idleCurrent = useRef(homeIdle);
  idleCurrent.current = homeIdle;
  useEffect(() => {
    live.current = true;
    void store.restore();
    const subscription = AppState.addEventListener("change", (state) => {
      setForeground(state === "active");
      if (state !== "active" && (store.getSnapshot().active || starting.current)) { starting.current = false; void store.interrupt(); }
    });
    return () => { live.current = false; subscription.remove(); };
  }, [store]);
  useEffect(() => {
    if (!isHome || !foreground) {
      setInvitation(false);
      if (store.getSnapshot().active || starting.current) { starting.current = false; void store.interrupt(); }
    }
  }, [isHome, foreground, snapshot.active, store]);
  useEffect(() => {
    if (!canOfferWalkthrough(snapshot, { isHome, homeReady: home.ready, startupReady: session.ready && session.onboarding === "complete" && !session.onboardingError && foreground,
      hasPendingNavigation: home.pending || replay, interactionBusy: home.blocked })) return;
    // State writes rerender the provider; only a real route/task change cancels
    // showing this offer, not the write's busy/eligibility transition.
    void store.offer().then((offered) => {
      if (live.current && idleCurrent.current && offered) setInvitation(true);
    });
  }, [snapshot, home, isHome, replay, session.ready, session.onboarding, session.onboardingError, foreground, store]);
  useEffect(() => {
    if (!replay || !homeIdle || !snapshot.ready || snapshot.busy || snapshot.active) return;
    setReplay(false);
    setInvitation(false);
    Keyboard.dismiss();
    starting.current = true;
    void store.start({ replay: true }).then((started) => {
      starting.current = false;
      if (started && !idleCurrent.current) void store.interrupt();
      else if (live.current && idleCurrent.current && !started) setLaunchError(store.getSnapshot().storageError || "The tour couldn't open. Try again from Help.");
    });
  }, [replay, homeIdle, snapshot.ready, snapshot.busy, snapshot.active, store]);
  const register = useCallback((id: Target, view: View | null) => {
    if (targets.current.get(id) === view || (!view && !targets.current.has(id))) return;
    if (view) targets.current.set(id, view); else targets.current.delete(id);
    setTargetRevision((revision) => revision + 1);
  }, []);
  const measure = useCallback((id: Target, callback: (rect: TourRect | null) => void) => {
    const target = targets.current.get(id);
    if (!target) { callback(null); return; }
    let settled = false;
    const settle = (rect: TourRect | null) => { if (!settled) { settled = true; callback(rect); } };
    const timeout = setTimeout(() => settle(null), 160);
    target.measureInWindow((x, y, width, height) => {
      const rect = { x, y, width, height };
      const viewport = targets.current.get("viewport");
      if ((id === "back" || id === "search") && viewport) {
        viewport.measureInWindow((left, top, visibleWidth, visibleHeight) => {
          clearTimeout(timeout);
          settle(x >= left && y >= top && x + width <= left + visibleWidth + 1 && y + height <= top + visibleHeight + 1 ? rect : null);
        });
      } else { clearTimeout(timeout); settle(rect); }
    });
  }, []);
  const setHome = useCallback((next: HomeState) => {
    setHomeState((prior) => Object.keys(next).every((key) => prior[key as keyof HomeState] === next[key as keyof HomeState]) ? prior : next);
  }, []);
  const requestReplay = useCallback(() => { setLaunchError(""); setReplay(true); }, []);
  const start = useCallback(() => {
    if (!idleCurrent.current) return;
    setInvitation(false); setLaunchError(""); Keyboard.dismiss();
    starting.current = true;
    void store.start().then((started) => {
      starting.current = false;
      if (started && !idleCurrent.current) void store.interrupt();
      else if (live.current && idleCurrent.current && !started) setLaunchError(store.getSnapshot().storageError);
    });
  }, [store]);
  const skip = useCallback(() => { setInvitation(false); setLaunchError(""); void store.dismiss(); }, [store]);
  const overlayVisible = snapshot.active && isHome && foreground;
  const value = useMemo(() => ({ store, active: overlayVisible, invitation: invitation && homeIdle, launchError: homeIdle ? launchError : "",
    requestReplay, start, skip, setHome, register, measure }), [store, overlayVisible, invitation, homeIdle, launchError, requestReplay, start, skip, setHome, register, measure]);
  const restoreFocus = useCallback(() => {
    requestAnimationFrame(() => {
      if (!idleCurrent.current) return;
      const target = targets.current.get("home");
      const handle = target ? findNodeHandle(target) : null;
      if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
    });
  }, []);
  const wasActive = useRef(false);
  useEffect(() => {
    if (wasActive.current && !snapshot.active) restoreFocus();
    wasActive.current = snapshot.active;
  }, [snapshot.active, restoreFocus]);
  return <Context.Provider value={value}><View style={{ flex: 1 }}>
    <View style={{ flex: 1 }} accessibilityElementsHidden={overlayVisible} importantForAccessibility={overlayVisible ? "no-hide-descendants" : "auto"}>{children}</View>
    {overlayVisible && <TourOverlay store={store} measure={measure} targetRevision={targetRevision} />}
  </View></Context.Provider>;
}

export function useWalkthroughTarget(id: Target, enabled = true) {
  const { register } = useWalkthrough();
  const ref = useCallback((view: View | null) => { register(id, enabled ? view : null); }, [id, enabled, register]);
  useEffect(() => () => register(id, null), [id, register]);
  return ref;
}

export function WalkthroughTabButton({ target, ...props }: BottomTabBarButtonProps & { target: "create" | "activity" }) {
  const ref = useWalkthroughTarget(target);
  return <PlatformPressable {...props} ref={ref} />;
}

/** A compact invitation only; it neither owns focus nor blocks public browsing. */
export function WalkthroughInvitation() {
  const { colors } = useTheme();
  const { invitation, launchError, start, skip, requestReplay } = useWalkthrough();
  if (!invitation && !launchError) return null;
  return <View style={{ position: "absolute", left: 16, right: 16, bottom: 12, maxWidth: 440, alignSelf: "center", borderRadius: 16, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.paper, padding: 14, gap: 6 }}>
    <Text accessibilityRole="header" style={{ fontSize: 15, lineHeight: 21, fontWeight: "700", color: colors.ink }}>Welcome to Campaign</Text>
    <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>{launchError || "Take a quick tour to discover, create and amplify messages."}</Text>
    <View style={{ flexDirection: "row", gap: 10, marginTop: 2 }}>
      <Button title={launchError ? "Try the tour" : "Show me around"} onPress={launchError ? requestReplay : start} style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10 }} />
      <Button title="Skip" variant="ghost" onPress={skip} style={{ paddingHorizontal: 16 }} />
    </View>
  </View>;
}

const steps: { title: string; body: string; target: "search" | "create" | "back" | "activity"; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
  { title: "Discover messages", body: "Find campaigns that matter to you. Read their stories and sources.", target: "search", icon: "search-outline" },
  { title: "Create your campaign", body: "Create in five steps, save a draft and submit it for review.", target: "create", icon: "create-outline" },
  { title: "Fund the message, not the cause", body: "Contributions fund advertising, not direct donations. Payments here are simulated; no real money is charged.", target: "back", icon: "megaphone-outline" },
  { title: "Follow what happens", body: "Track updates and reports in Activity. Use the bell for a quick notification overview.", target: "activity", icon: "notifications-outline" },
];

function TourOverlay({ store, measure, targetRevision }: { store: Store; measure: ContextValue["measure"]; targetRevision: number }) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const { colors } = useTheme();
  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const root = useRef<View>(null);
  const heading = useRef<View>(null);
  const [rect, setRect] = useState<TourRect | null>(null);
  const [size, setSize] = useState({ width: dimensions.width, height: dimensions.height });
  const [cardHeight, setCardHeight] = useState(220);
  const step = steps[snapshot.step];
  const viewport = { ...size, top: insets.top, bottom: insets.bottom };
  useEffect(() => {
    let current = true;
    setRect(null);
    const frame = requestAnimationFrame(() => {
      root.current?.measureInWindow((originX, originY) => {
        measure(step.target, (target) => {
          if (current) setRect(target ? { ...target, x: target.x - originX, y: target.y - originY } : null);
        });
      });
    });
    return () => { current = false; cancelAnimationFrame(frame); };
  }, [snapshot.step, step.target, dimensions.width, dimensions.height, dimensions.fontScale, size.width, size.height, measure, targetRevision]);
  const focusHeading = useCallback(() => {
    const handle = findNodeHandle(heading.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(focusHeading);
    return () => cancelAnimationFrame(frame);
  }, [snapshot.step, focusHeading]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => { void store.dismiss(); return true; });
    return () => subscription.remove();
  }, [store]);
  const availableTarget = visibleTourTarget(rect, viewport);
  const position = placeTourCard(viewport, availableTarget, cardHeight);
  const spotlight = position.anchored ? availableTarget : null;
  const dim = "rgba(0,0,0,0.66)";
  // Targets and overlay share the same native window. Android Dialog/Modal
  // origins differ from the application window under edge-to-edge insets.
  const roundedMask = Platform.OS !== "android" || Number(Platform.Version) >= 28;
  return <View ref={root} collapsable={false} style={[StyleSheet.absoluteFill, { zIndex: 1000, overflow: "hidden" }]} onLayout={({ nativeEvent }) => setSize({ width: nativeEvent.layout.width, height: nativeEvent.layout.height })}>
      <View accessible={false} importantForAccessibility="no-hide-descendants" onStartShouldSetResponder={() => true} style={StyleSheet.absoluteFill}>
        {spotlight && roundedMask ? <View pointerEvents="none" style={{ position: "absolute", left: spotlight.x, top: spotlight.y, width: spotlight.width, height: spotlight.height,
          borderRadius: step.target === "search" || step.target === "back" ? 28 : 12, borderWidth: 2, borderColor: colors.green,
          boxShadow: `0px 0px 0px ${Math.ceil(Math.hypot(size.width, size.height))}px ${dim}` }} />
        : spotlight ? <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: spotlight.y, backgroundColor: dim }} />
          <View style={{ position: "absolute", top: spotlight.y + spotlight.height, left: 0, right: 0, bottom: 0, backgroundColor: dim }} />
          <View style={{ position: "absolute", top: spotlight.y, left: 0, width: spotlight.x, height: spotlight.height, backgroundColor: dim }} />
          <View style={{ position: "absolute", top: spotlight.y, left: spotlight.x + spotlight.width, right: 0, height: spotlight.height, backgroundColor: dim }} />
          <View style={{ position: "absolute", width: spotlight.width, height: spotlight.height, left: spotlight.x, top: spotlight.y, borderWidth: 2, borderColor: colors.green }} />
        </View> : <View style={[StyleSheet.absoluteFill, { backgroundColor: dim }]} />}
      </View>
      <View accessibilityViewIsModal style={{ position: "absolute", left: Math.max(16, (size.width - 420) / 2), right: Math.max(16, (size.width - 420) / 2), top: position.top, maxHeight: position.maxHeight, borderRadius: 16, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.paper }}
        onLayout={({ nativeEvent }) => setCardHeight(nativeEvent.layout.height)}>
        <ScrollView bounces={false} style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ padding: 14, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", columnGap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 100 }}>
              <Ionicons accessible={false} name={step.icon} size={18} color={colors.green} />
              <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>Step {snapshot.step + 1} of 4</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Skip tour" onPress={() => { void store.dismiss(); }} style={({ pressed }) => ({ minHeight: 48, minWidth: 72, paddingHorizontal: 6, justifyContent: "center", alignItems: "center", opacity: pressed ? 0.6 : 1 })}>
              <Text style={{ color: colors.green, fontSize: 13, lineHeight: 19, fontWeight: "600" }}>Skip tour</Text>
            </Pressable>
          </View>
          <View ref={heading} collapsable={false} accessible accessibilityRole="header" accessibilityLabel={`Step ${snapshot.step + 1} of 4. ${step.title}`}>
            <Text style={{ color: colors.ink, fontSize: 17, lineHeight: 23, fontWeight: "700" }}>{step.title}</Text>
          </View>
          <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19 }}>{step.body}</Text>
          {snapshot.storageError ? <Text accessibilityRole="alert" style={{ color: colors.red, fontSize: 12, lineHeight: 18 }}>{snapshot.storageError}</Text> : null}
          <View style={{ flexDirection: dimensions.width < 350 || dimensions.fontScale > 1.4 ? "column" : "row", gap: 10, marginTop: 2 }}>
            {snapshot.step > 0 && <Button title="Back" variant="ghost" disabled={snapshot.busy} onPress={() => { void store.back(); }} style={{ flex: 1, minWidth: 72, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, paddingVertical: 8 }} />}
            <Button title={snapshot.step === 3 ? "Start exploring" : "Next"} loading={snapshot.busy} onPress={() => { void (snapshot.step === 3 ? store.complete() : store.next()); }} style={{ flex: snapshot.step > 0 ? 1.7 : 1, paddingHorizontal: 12, paddingVertical: 8 }} />
          </View>
        </ScrollView>
      </View>
  </View>;
}
