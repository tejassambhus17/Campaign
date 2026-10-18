import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, findNodeHandle, Keyboard, KeyboardAvoidingView, type KeyboardEvent, Modal, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fonts, Text, useTheme } from "./ui";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

/** A concise destination, rather than an expanded copy of the destination. */
export function SummaryLink({ title, summary, description, icon, onPress, testID, compact = false, triggerRef, disabled = false, accessibilityLabel, expanded }: {
  title: string; summary?: string; description?: string; icon?: IconName; onPress: () => void;
  testID?: string; compact?: boolean; triggerRef?: React.Ref<View>; disabled?: boolean; accessibilityLabel?: string; expanded?: boolean;
}) {
  const { colors } = useTheme();
  return <Pressable ref={triggerRef} testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel || [title, summary, description].filter(Boolean).join(". ")} disabled={disabled} accessibilityState={{ disabled, ...(expanded === undefined ? {} : { expanded }) }} onPress={onPress} style={({ pressed }) => ({ minHeight: compact ? 52 : 68, paddingHorizontal: 12, paddingVertical: compact ? 10 : 12, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, flexDirection: "row", alignItems: "center", gap: 11, opacity: pressed || disabled ? 0.65 : 1 })}>
    {!!icon && <View style={{ width: compact ? 30 : 38, minHeight: compact ? 32 : 38, alignItems: "center", justifyContent: "center" }}><Ionicons name={icon} size={compact ? 21 : 24} color={colors.primary} accessible={false} /></View>}
    <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: colors.ink }}>{title}</Text>
      {!!summary && <Text style={{ fontSize: 12, lineHeight: 18, color: colors.text }}>{summary}</Text>}
      {!!description && <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>{description}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.primary} accessible={false} />
  </Pressable>;
}

/** Native, bounded contextual sheet. Its single scroll area can reflow large text. */
export function InfoSheet({ visible, title, onClose, children, testID, returnFocusRef }: {
  visible: boolean; title: string; onClose: () => void; children: React.ReactNode; testID?: string;
  returnFocusRef?: React.RefObject<View | null>;
}) {
  const { colors } = useTheme(), insets = useSafeAreaInsets(), { height } = useWindowDimensions();
  const heading = useRef<View>(null), wasVisible = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [keyboardTop, setKeyboardTop] = useState<number | null>(() => Keyboard.metrics()?.screenY || null);
  useEffect(() => {
    const shown = Keyboard.addListener("keyboardDidShow", (event: KeyboardEvent) => {
      const top = event.endCoordinates.screenY;
      setKeyboardTop(Number.isFinite(top) && top > 0 ? top : null);
    });
    const hidden = Keyboard.addListener("keyboardDidHide", () => setKeyboardTop(null));
    return () => { shown.remove(); hidden.remove(); };
  }, []);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    if (!visible && wasVisible.current && returnFocusRef) requestAnimationFrame(() => {
      const node = findNodeHandle(returnFocusRef.current); if (node) AccessibilityInfo.setAccessibilityFocus(node);
    });
    wasVisible.current = visible;
  }, [visible, returnFocusRef]);
  return <Modal visible={visible} transparent animationType={reduceMotion ? "none" : "fade"} statusBarTranslucent navigationBarTranslucent onRequestClose={onClose} onShow={() => {
    const node = findNodeHandle(heading.current); if (node) AccessibilityInfo.setAccessibilityFocus(node);
  }}>
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.58)" }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Dismiss ${title}`} onPress={onClose} style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} />
      <View testID={testID} accessibilityViewIsModal onAccessibilityEscape={onClose} style={{ width: "100%", maxWidth: 640, maxHeight: Math.max(120, Math.min(height, keyboardTop ?? height) - insets.top - 24), alignSelf: "center", borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, paddingBottom: Math.max(insets.bottom, 12) }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: 18, paddingRight: 6, paddingTop: 8, paddingBottom: 4, gap: 8 }}>
          <View ref={heading} accessible accessibilityRole="header" style={{ flex: 1 }}><Text style={{ fontFamily: fonts.bold, fontSize: 18, lineHeight: 25, color: colors.ink }}>{title}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Close ${title}`} onPress={onClose} style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}><Ionicons name="close" size={23} color={colors.ink} /></Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" style={{ flexGrow: 0, flexShrink: 1, minHeight: 0 }} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 4, paddingBottom: 12, gap: 12 }}>{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

/** Stable optional content; validation can reveal without closing edited fields later. */
export function InfoAction({ title, summary, icon = "information-circle-outline", children, reveal = false, keepMounted = false, initiallyOpen = false, testID }: {
  title: string; summary?: string; icon?: IconName; children: React.ReactNode;
  reveal?: boolean | object; keepMounted?: boolean; initiallyOpen?: boolean; testID?: string;
}) {
  const [open, setOpen] = useState(initiallyOpen || !!reveal), trigger = useRef<View>(null);
  useEffect(() => { if (reveal) setOpen(true); }, [reveal]);
  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => { const node = findNodeHandle(trigger.current); if (node) AccessibilityInfo.setAccessibilityFocus(node); });
  };
  return <View style={{ gap: 0 }}>
    <SummaryLink title={title} summary={summary} icon={icon} compact expanded={open} onPress={() => { Keyboard.dismiss(); setOpen(true); }} triggerRef={trigger} testID={testID} />
    {(open || keepMounted) && <InfoSheet visible={open} title={title} onClose={close} testID={testID ? `${testID}-sheet` : undefined}>{children}</InfoSheet>}
  </View>;
}

/** Explicit selection commits once; Back, close and outside dismissal never commit. */
export function SelectionSheet({ label, value, options, onSelect, disabled = false, testID }: {
  label: string; value: string; options: readonly { value: string; label: string; description?: string }[];
  onSelect: (value: string) => void; disabled?: boolean; testID?: string;
}) {
  const { colors } = useTheme(), [open, setOpen] = useState(false), trigger = useRef<View>(null);
  const selected = options.find(option => option.value === value);
  return <View>
    <SummaryLink title={selected?.label || label} accessibilityLabel={`${label}: ${selected?.label || value || "Not selected"}`} expanded={open} summary={selected ? undefined : value || undefined} onPress={() => { Keyboard.dismiss(); setOpen(true); }} compact disabled={disabled} triggerRef={trigger} testID={testID} />
    <InfoSheet visible={open} title={label} onClose={() => setOpen(false)} returnFocusRef={trigger} testID={testID ? `${testID}-sheet` : undefined}>
      {options.map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} disabled={disabled} accessibilityState={{ checked: value === option.value, disabled }} onPress={() => { if (!disabled) { onSelect(option.value); setOpen(false); } }} style={({ pressed }) => ({ minHeight: 48, flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 10, opacity: pressed || disabled ? 0.65 : 1 })}>
        <Ionicons name={value === option.value ? "radio-button-on" : "radio-button-off"} size={22} color={value === option.value ? colors.primary : colors.muted} />
        <View style={{ flex: 1, gap: 3 }}><Text style={{ color: colors.ink, fontSize: 14, lineHeight: 21 }}>{option.label}</Text>{!!option.description && <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{option.description}</Text>}</View>
      </Pressable>)}
    </InfoSheet>
  </View>;
}
