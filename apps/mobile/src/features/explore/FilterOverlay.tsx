import { useRef } from "react";
import { AccessibilityInfo, findNodeHandle, Keyboard, Modal, Pressable, ScrollView, Switch, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button, fonts, IconButton, Text, useTheme } from "../../components/ui";

export const campaignSortOptions = ["Featured", "Newest", "Most funded", "Closest to goal"] as const;
export type CampaignFilters = { sort: string; funding: boolean };

/** A small, transparent overlay; Explore and its page/list state stay mounted. */
export function FilterOverlay({ visible, draft, onChange, onApply, onClose, reduceMotion }: {
  visible: boolean;
  draft: CampaignFilters;
  onChange: (filters: CampaignFilters) => void;
  onApply: () => void;
  onClose: () => void;
  reduceMotion: boolean;
}) {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const heading = useRef<View>(null);
  if (!visible) return null;
  return <Modal transparent visible animationType={reduceMotion ? "none" : "fade"} statusBarTranslucent navigationBarTranslucent onRequestClose={onClose} onShow={() => {
    Keyboard.dismiss();
    const target = findNodeHandle(heading.current);
    if (target) AccessibilityInfo.setAccessibilityFocus(target);
  }}>
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20, paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss campaign filters" onPress={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.48)" }} />
      <View accessibilityViewIsModal onAccessibilityEscape={onClose} style={{ width: "100%", maxWidth: 420, maxHeight: Math.max(1, Math.min(height * 0.78, height - insets.top - insets.bottom - 32)), borderRadius: 16, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.paper, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 18, paddingRight: 6, paddingTop: 6, paddingBottom: 4 }}>
          <View ref={heading} accessible accessibilityRole="header" accessibilityLabel="Filters and sort" style={{ flex: 1 }}><Text style={{ fontFamily: fonts.bold, fontSize: 19, lineHeight: 26, color: colors.ink }}>Filters & sort</Text></View>
          <IconButton label="Close campaign filters" icon="close" onPress={onClose} />
        </View>
        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 10, gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 13, lineHeight: 20, color: colors.muted }}>Sort by</Text>
            <Button title="Clear" variant="ghost" style={{ paddingHorizontal: 8 }} onPress={() => onChange({ sort: "Featured", funding: false })} />
          </View>
          <View accessibilityRole="radiogroup" accessibilityLabel="Sort campaigns">
            {campaignSortOptions.map((sort) => <Pressable key={sort} accessibilityRole="radio" accessibilityLabel={sort} accessibilityState={{ checked: draft.sort === sort }} onPress={() => onChange({ ...draft, sort })} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: draft.sort === sort ? colors.mint : pressed ? colors.subtle : "transparent" })}>
              <Text style={{ flex: 1, color: draft.sort === sort ? colors.green : colors.ink, fontFamily: draft.sort === sort ? fonts.semibold : fonts.sans, fontSize: 14, lineHeight: 21 }}>{sort}</Text>
              <Ionicons name={draft.sort === sort ? "radio-button-on" : "radio-button-off"} size={20} color={draft.sort === sort ? colors.green : colors.muted} />
            </Pressable>)}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line }}>
            <Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: colors.ink }}>Open for backing only</Text>
            <Switch accessibilityLabel="Open for backing only" value={draft.funding} onValueChange={(funding) => onChange({ ...draft, funding })} trackColor={{ false: colors.outline, true: colors.green }} thumbColor={colors.paper} style={{ minWidth: 48, minHeight: 48 }} />
          </View>
          <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>Selections are kept here until you apply them.</Text>
        </ScrollView>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 14, paddingTop: 8 }}>
          <Button title="Cancel" variant="secondary" onPress={onClose} style={{ flex: 1, minWidth: 104 }} />
          <Button title="Apply filters" onPress={onApply} style={{ flex: 1, minWidth: 130 }} />
        </View>
      </View>
    </View>
  </Modal>;
}
