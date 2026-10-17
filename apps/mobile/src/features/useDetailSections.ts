import { useEffect, useRef, useState, type RefObject } from "react";
import { AccessibilityInfo, ScrollView } from "react-native";
import PagerView from "../components/NativePager";
import { detailSections, type DetailSection, requestedDetailSection } from "./detail-sections";

/** Native pages own their vertical reading state; no content replacement or JS
 * animation runs on a swipe frame. The shared overview collapses before a page
 * begins scrolling, and the section bar stays above the horizontal pager.
 */
export function useDetailSections(id: string, requested: string | string[] | undefined, scroll: RefObject<ScrollView | null>) {
  const requestedSection = requestedDetailSection(requested);
  const [section, setSection] = useState<DetailSection>(requestedSection);
  const [viewport, setViewport] = useState(0);
  const [tabsHeight, setTabsHeight] = useState(48);
  const [collapsed, setCollapsed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const pager = useRef<PagerView>(null);
  const pending = useRef<number | null>(null);
  const overview = useRef({ id, height: 0, y: 0, collapsed: false });
  useEffect(() => {
    let active = true, changed = false;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active && !changed) setReduceMotion(value); }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", value => { changed = true; setReduceMotion(value); });
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    const index = detailSections.indexOf(requestedSection);
    pending.current = index;
    setSection(requestedSection);
    pager.current?.setPageWithoutAnimation(index);
    if (overview.current.id !== id) {
      overview.current = { id, height: overview.current.height, y: 0, collapsed: false };
      setCollapsed(false);
      scroll.current?.scrollTo({ y: 0, animated: false });
    }
  }, [id, requestedSection, scroll]);
  const recordScroll = (y: number) => {
    const state = overview.current;
    state.y = Math.max(0, y);
    const next = state.height > 0 && state.y >= state.height - 2;
    if (next !== state.collapsed) { state.collapsed = next; setCollapsed(next); }
  };
  return {
    section, pager,
    initialPage: detailSections.indexOf(requestedSection),
    pageHeight: viewport > 0 ? Math.max(1, viewport - tabsHeight) : 520,
    contentScrollEnabled: collapsed,
    selectSection: (next: DetailSection) => {
      const index = detailSections.indexOf(next);
      if (index < 0) return;
      pending.current = index;
      setSection(next);
      if (reduceMotion) pager.current?.setPageWithoutAnimation(index);
      else pager.current?.setPage(index);
    },
    onPageSelected: (position: number) => {
      if (!Number.isInteger(position) || position < 0 || position >= detailSections.length) return;
      if (pending.current !== null && pending.current !== position) return;
      pending.current = null;
      setSection(detailSections[position]);
    },
    onPageScrollStateChanged: (state: string) => { if (state === "dragging") pending.current = null; },
    recordTabs: (height: number) => setTabsHeight(height),
    recordScroll,
    recordHeader: (height: number) => { overview.current.height = height; recordScroll(overview.current.y); },
    recordViewport: (height: number) => setViewport(height),
  };
}
