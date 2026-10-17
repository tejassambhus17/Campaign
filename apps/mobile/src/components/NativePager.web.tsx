import { Children, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import type { PagerViewProps } from "react-native-pager-view";

export type { PagerViewProps, PagerViewOnPageSelectedEvent, PagerViewOnPageScrollEvent, PageScrollStateChangedNativeEvent } from "react-native-pager-view";

type PagerHandle = {
  setPage: (index: number) => void;
  setPageWithoutAnimation: (index: number) => void;
  setScrollEnabled: (enabled: boolean) => void;
};
const pageEvent = <T,>(nativeEvent: T) => ({ nativeEvent }) as NativeSyntheticEvent<T>;

/** Web compatibility only. Native builds always resolve the real PagerView.
 * All pages stay mounted, with browser-native scroll snapping and measured
 * widths rather than simulated content replacement or a JS tween.
 */
const NativePager = forwardRef<PagerHandle, PagerViewProps>(function NativePager({
  children, initialPage = 0, style, scrollEnabled = true, orientation = "horizontal", layoutDirection = "ltr",
  onLayout, onPageSelected, onPageScroll, onPageScrollStateChanged,
  keyboardDismissMode, testID, accessibilityLabel,
}, forwardedRef) {
  const pages = Children.toArray(children);
  const horizontal = orientation !== "vertical";
  const validInitial = Math.max(0, Math.min(pages.length - 1, Math.trunc(initialPage) || 0));
  const [selected, setSelected] = useState(validInitial);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [enabled, setEnabled] = useState(scrollEnabled ?? true);
  const scroll = useRef<ScrollView>(null);
  const current = useRef(validInitial);
  const offset = useRef(0);
  const pending = useRef<number | null>(null);
  const aligning = useRef<number | null>(null);
  const announced = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geometry = useRef(size);
  const latest = useRef({ count: pages.length, horizontal, onPageSelected, onPageScroll, onPageScrollStateChanged });
  latest.current = { count: pages.length, horizontal, onPageSelected, onPageScroll, onPageScrollStateChanged };

  const clearTimer = () => { if (timer.current !== null) { clearTimeout(timer.current); timer.current = null; } };
  const emitState = (pageScrollState: "idle" | "dragging" | "settling") => latest.current.onPageScrollStateChanged?.(pageEvent({ pageScrollState }));
  const extent = () => latest.current.horizontal ? geometry.current.width : geometry.current.height;
  const align = (index: number, animated: boolean) => {
    const length = extent();
    if (!length) return;
    offset.current = index * length;
    scroll.current?.scrollTo(latest.current.horizontal ? { x: offset.current, y: 0, animated } : { x: 0, y: offset.current, animated });
  };
  const announce = (index: number) => {
    current.current = index;
    setSelected(index);
    if (announced.current !== index) {
      announced.current = index;
      latest.current.onPageSelected?.(pageEvent({ position: index }));
    }
  };
  const finish = () => {
    clearTimer();
    const length = extent(), count = latest.current.count;
    if (!length || !count) return;
    const index = Math.max(0, Math.min(count - 1, Math.round(offset.current / length)));
    pending.current = null;
    announce(index);
    emitState("idle");
  };
  const goTo = (index: number, animated: boolean) => {
    if (!Number.isInteger(index) || index < 0 || index >= latest.current.count) return;
    clearTimer();
    pending.current = index;
    current.current = index;
    if (!extent()) return; // The first measured layout applies this command.
    if (animated) emitState("settling");
    aligning.current = animated ? null : index * extent();
    align(index, animated);
    if (animated) timer.current = setTimeout(finish, 160);
    else { pending.current = null; announce(index); emitState("idle"); }
  };
  useImperativeHandle(forwardedRef, () => ({
    setPage: index => goTo(index, true),
    setPageWithoutAnimation: index => goTo(index, false),
    setScrollEnabled: setEnabled,
  }));
  useEffect(() => { setEnabled(scrollEnabled ?? true); }, [scrollEnabled]);
  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);

  const sync = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const length = extent(), count = latest.current.count;
    const value = latest.current.horizontal ? event.nativeEvent.contentOffset.x : event.nativeEvent.contentOffset.y;
    if (!length || !count || !Number.isFinite(value)) return;
    const eventLength = latest.current.horizontal ? event.nativeEvent.layoutMeasurement.width : event.nativeEvent.layoutMeasurement.height;
    if (Math.abs(eventLength - length) > 1) return;
    if (aligning.current !== null) {
      if (Math.abs(value - aligning.current) > 1) return;
      aligning.current = null;
    }
    offset.current = Math.max(0, Math.min((count - 1) * length, value));
    const progress = offset.current / length;
    const position = Math.min(count - 1, Math.floor(progress));
    latest.current.onPageScroll?.(pageEvent({ position, offset: progress - position }));
    clearTimer();
    // RN Web emits scroll but browser smooth scrolling has no portable native
    // momentum-end event. Its quiet period confirms the snapped selected page.
    timer.current = setTimeout(finish, 160);
  };

  return <ScrollView
    ref={scroll} testID={testID} accessibilityLabel={accessibilityLabel}
    horizontal={horizontal} pagingEnabled directionalLockEnabled nestedScrollEnabled
    scrollEnabled={enabled} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
    keyboardDismissMode={keyboardDismissMode ?? "none"} keyboardShouldPersistTaps="handled"
    bounces={false} overScrollMode="never" style={[{ direction: layoutDirection ?? "ltr" }, style]} scrollEventThrottle={16}
    onLayout={event => {
      const { width, height } = event.nativeEvent.layout;
      if (Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0) {
        geometry.current = { width, height };
        setSize(geometry.current);
        const index = Math.max(0, Math.min(pages.length - 1, pending.current ?? current.current));
        if (pages.length) { clearTimer(); aligning.current = index * extent(); align(index, false); pending.current = null; announce(index); }
      }
      onLayout?.(event);
    }}
    onContentSizeChange={() => { if (extent() && pages.length) align(current.current, false); }}
    onScroll={sync}
    onScrollBeginDrag={() => { clearTimer(); pending.current = null; aligning.current = null; emitState("dragging"); }}
    onScrollEndDrag={sync} onMomentumScrollEnd={event => { sync(event); finish(); }}
  >
    {pages.map((page, index) => <View key={(page as { key?: string }).key ?? index}
      accessibilityElementsHidden={selected !== index} importantForAccessibility={selected === index ? "auto" : "no-hide-descendants"}
      pointerEvents={selected === index ? "auto" : "none"}
      style={{ width: size.width, height: size.height, flexShrink: 0, overflow: "hidden" }}>
      {page}
    </View>)}
  </ScrollView>;
});
export default NativePager;
