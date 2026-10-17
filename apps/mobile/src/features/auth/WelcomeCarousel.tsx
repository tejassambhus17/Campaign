import { useLayoutEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { fonts, Text, useTheme } from "../../components/ui";

// Welcome-only order: previous second, previous third, previous first.
// Stable IDs keep each bundled image, caption and accessibility label together.
const slidesById = {
  "ocean-turtle": {
    image: require("../../../assets/images/showcase/ocean-turtle.png"),
    label: "Illustrative sea turtle above a coral reef",
    caption: "A brighter tomorrow\nis a shared effort.",
  },
  "story-mountains": {
    image: require("../../../assets/images/create/story-mountains.png"),
    label: "Illustrative mountain landscape",
    caption: "Every big change\nstarts with a story.",
  },
  "confirmation-coast": {
    image: require("../../../assets/images/create/confirmation-coast.png"),
    label: "Illustrative coastal landscape",
    caption: "Small ideas.\nBigger possibilities.",
  },
} as const;
const slideOrder = ["story-mountains", "confirmation-coast", "ocean-turtle"] as const;
type SlideId = typeof slideOrder[number];

/** Informational photos only: no Welcome/session/tour persistence side effects. */
export function WelcomeCarousel({ height }: { height: number }) {
  const { colors } = useTheme();
  const [selectedId, setSelectedId] = useState<SlideId>(slideOrder[0]);
  const [pageWidth, setPageWidth] = useState(0);
  const selectedIndex = slideOrder.indexOf(selectedId);
  const paging = useRef<ScrollView>(null);
  const measuredWidth = useRef(0);
  const currentIndex = useRef(0);
  const aligning = useRef(false);
  currentIndex.current = selectedIndex;

  const alignPage = () => {
    if (measuredWidth.current > 0) paging.current?.scrollTo({ x: currentIndex.current * measuredWidth.current, y: 0, animated: false });
  };

  useLayoutEffect(() => {
    // A width change changes page geometry, not the selected photo. Ignore old
    // native scroll events until the corrected offset arrives or a new drag starts.
    if (pageWidth > 0) {
      aligning.current = true;
      paging.current?.scrollTo({ x: currentIndex.current * pageWidth, y: 0, animated: false });
    }
  }, [pageWidth]);

  const syncPage = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const width = measuredWidth.current;
    if (!(width > 0) || Math.abs(layoutMeasurement.width - width) > 1 || !Number.isFinite(contentOffset.x)) return;
    if (aligning.current) {
      if (Math.abs(contentOffset.x - currentIndex.current * width) > 1) return;
      aligning.current = false;
    }
    const next = Math.max(0, Math.min(slideOrder.length - 1, Math.round(contentOffset.x / width)));
    currentIndex.current = next;
    setSelectedId(slideOrder[next]);
  };

  return <View>
    <View testID="welcome-photo-viewport" onLayout={event => {
      const width = event.nativeEvent.layout.width;
      if (Number.isFinite(width) && width > 0 && width !== measuredWidth.current) {
        measuredWidth.current = width;
        aligning.current = true;
        setPageWidth(width);
      }
    }} style={{ height, marginTop: 16, borderRadius: 15, overflow: "hidden", backgroundColor: colors.paper }}>
      <ScrollView ref={paging} testID="welcome-photo-pager" horizontal pagingEnabled directionalLockEnabled nestedScrollEnabled
        showsHorizontalScrollIndicator={false} bounces={false} overScrollMode="never" scrollsToTop={false}
        onScroll={syncPage} onMomentumScrollEnd={syncPage} onScrollEndDrag={syncPage} scrollEventThrottle={16}
        onScrollBeginDrag={() => { aligning.current = false; }} onContentSizeChange={() => { if (aligning.current) alignPage(); }}
        style={{ flex: 1 }}>
        {pageWidth > 0 && slideOrder.map((id, index) => {
          const item = slidesById[id];
          return <View key={id} testID={`welcome-photo-${id}`} accessibilityElementsHidden={index !== selectedIndex}
            importantForAccessibility={index === selectedIndex ? "auto" : "no-hide-descendants"} style={{ width: pageWidth, height: "100%" }}>
            <Image source={item.image} accessibilityRole="image" accessibilityLabel={item.label} accessibilityIgnoresInvertColors resizeMode="cover"
              style={{ width: "100%", height: "100%" }} />
            <View pointerEvents="none" style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, backgroundColor: "rgba(0,0,0,0.57)" }}>
              <View style={{ width: 31, height: 2, backgroundColor: "#8EF4C5", marginBottom: 7 }} />
              <Text style={{ color: "#FFFFFF", fontFamily: fonts.semibold, fontSize: 12, lineHeight: 17 }}>{item.caption}</Text>
            </View>
          </View>;
        })}
      </ScrollView>
    </View>
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", minHeight: 48 }}>
      {slideOrder.map((id, index) => <Pressable key={id} accessibilityRole="button"
        accessibilityLabel={`Show illustration ${index + 1} of ${slideOrder.length}: ${slidesById[id].caption.replace("\n", " ")}`}
        accessibilityState={{ selected: selectedId === id }} onPress={() => {
          currentIndex.current = index;
          setSelectedId(id);
          aligning.current = true;
          alignPage();
        }} style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: selectedId === id ? colors.green : colors.outline, opacity: selectedId === id ? 1 : 0.55 }} />
      </Pressable>)}
    </View>
  </View>;
}
