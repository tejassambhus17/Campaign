import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, ScrollView, useWindowDimensions } from "react-native";
import PagerView from "../../components/NativePager";
import type { ActivityFilter } from "../../lib/activity";

/** Keep the established visual order; the API's category names stay unchanged. */
export const activityPages = [
  { value: "All", title: "All" },
  { value: "Campaigns", title: "Updates" },
  { value: "Payments", title: "Contributions" },
  { value: "Unread", title: "Unread" },
  { value: "Account", title: "Account" },
] as const satisfies readonly { value: ActivityFilter; title: string }[];

/** Only controls native page selection. Fetching, read actions and each page's
 * vertical position remain owned by the existing Activity query/list views.
 */
export function useActivityPages(identity: string | undefined) {
  const [filter, setFilter] = useState<ActivityFilter>("All");
  const [reduceMotion, setReduceMotion] = useState(true);
  const { fontScale } = useWindowDimensions();
  const pager = useRef<PagerView>(null);
  const requestedPage = useRef<number | null>(null);
  const strip = useRef<ScrollView>(null);
  const bounds = useRef<Record<string, { x: number; width: number }>>({});
  const geometry = useRef({ width: 0, contentWidth: 0, offset: 0 });

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

  useEffect(() => {
    // A different account starts at All. Keyed native pages also discard the
    // former account's mounted lists instead of carrying private scroll state.
    requestedPage.current = 0;
    setFilter("All");
    pager.current?.setPageWithoutAnimation(0);
  }, [identity]);

  const selectFilter = useCallback((next: ActivityFilter) => {
    const index = activityPages.findIndex(page => page.value === next);
    if (index < 0) return;
    requestedPage.current = index;
    setFilter(next);
    if (reduceMotion) pager.current?.setPageWithoutAnimation(index);
    else pager.current?.setPage(index);
  }, [reduceMotion]);

  const revealFilter = useCallback(() => {
    const item = bounds.current[filter], viewport = geometry.current;
    if (!item || !viewport.width || !viewport.contentWidth) return;
    const offset = item.x < viewport.offset ? item.x : item.x + item.width > viewport.offset + viewport.width
      ? item.x + item.width - viewport.width : viewport.offset;
    const next = Math.max(0, Math.min(offset, viewport.contentWidth - viewport.width));
    if (next !== viewport.offset) {
      viewport.offset = next;
      strip.current?.scrollTo({ x: next, animated: false });
    }
  }, [filter]);
  useEffect(revealFilter, [revealFilter, fontScale]);

  return {
    filter, selectedIndex: activityPages.findIndex(page => page.value === filter),
    pager, strip, selectFilter,
    onPageSelected: (position: number) => {
      if (!Number.isInteger(position) || !activityPages[position]) return;
      if (requestedPage.current !== null && requestedPage.current !== position) return;
      requestedPage.current = null;
      setFilter(activityPages[position].value);
    },
    onPageScrollStateChanged: (state: string) => {
      // A real new drag supersedes an interrupted pill animation.
      if (state === "dragging") requestedPage.current = null;
    },
    recordStrip: (width: number) => { geometry.current.width = width; revealFilter(); },
    recordContent: (width: number) => { geometry.current.contentWidth = width; revealFilter(); },
    recordOffset: (x: number) => { geometry.current.offset = x; },
    recordFilter: (value: ActivityFilter, x: number, width: number) => {
      bounds.current[value] = { x, width };
      if (value === filter) revealFilter();
    },
  };
}
