import { ReactNode, Ref, useCallback, useRef, useState } from "react";
import { ActivityIndicator, Image, Keyboard, Platform, Pressable, StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fonts, Text, useTheme } from "../../components/ui";

export function AuthBackdrop({ children, active = true }: { children: ReactNode; active?: boolean }) {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const container = useRef<View>(null);
  const remeasure = useRef<(() => void) | null>(null);
  const [keyboardOverlap, setKeyboardOverlap] = useState(0);

  useFocusEffect(useCallback(() => {
    if (Platform.OS !== "android" || !active) return;
    let live = true;
    let revision = 0;
    let frame = Keyboard.metrics();
    const measure = () => {
      if (!live) return;
      const request = ++revision;
      const metrics = frame ?? Keyboard.metrics();
      if (!metrics || metrics.height <= 0 || !Number.isFinite(metrics.screenY)) {
        setKeyboardOverlap(0);
        return;
      }
      const keyboardTop = metrics.screenY;
      container.current?.measureInWindow((_x, y, _width, height) => {
        if (!live || request !== revision) return;
        // Measure the stable outer view, never its already-inset ScrollView.
        // A window that has resized above the IME therefore adds no overlap.
        setKeyboardOverlap(Math.min(height, Math.max(0, Math.ceil(y + height - keyboardTop))));
      });
    };
    remeasure.current = measure;
    const shown = Keyboard.addListener("keyboardDidShow", (event) => { frame = event.endCoordinates; measure(); });
    const changed = Keyboard.addListener("keyboardDidChangeFrame", (event) => { frame = event.endCoordinates; measure(); });
    const hidden = Keyboard.addListener("keyboardDidHide", () => { frame = undefined; revision += 1; setKeyboardOverlap(0); });
    measure();
    return () => {
      live = false;
      revision += 1;
      remeasure.current = null;
      shown.remove(); changed.remove(); hidden.remove();
      setKeyboardOverlap(0);
    };
  }, [active]));

  return <View ref={container} collapsable={false} onLayout={() => remeasure.current?.()}
    style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: Math.max(insets.bottom, keyboardOverlap) }}>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFillObject}>
      <Image source={require("../../../assets/images/showcase/welcome-background.png")} resizeMode="cover" accessible={false}
        style={{ width: "100%", height: "100%", opacity: scheme === "dark" ? 0.68 : 0.035 }} />
    </View>
    {children}
  </View>;
}

export function AuthAction({ title, onPress, variant = "primary", disabled = false, loading = false, arrow = false }: {
  title: string; onPress: () => void; variant?: "primary" | "outline" | "text"; disabled?: boolean; loading?: boolean; arrow?: boolean;
}) {
  const { colors } = useTheme();
  const fg = disabled ? colors.disabledText : variant === "primary" ? colors.onPrimary : colors.green;
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: disabled || loading, busy: loading }} disabled={disabled || loading} onPress={onPress}
    style={({ pressed }) => ({ minHeight: variant === "primary" ? 50 : 48, borderRadius: 26, paddingHorizontal: 18, paddingVertical: 12,
      backgroundColor: disabled ? colors.disabledSurface : variant === "primary" ? colors.green : "transparent", borderWidth: variant === "outline" ? 1 : 0, borderColor: colors.green,
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, opacity: pressed ? 0.75 : 1 })}>
    {loading ? <ActivityIndicator color={fg} /> : <>
      <Text style={{ color: fg, fontFamily: fonts.bold, fontSize: 14, lineHeight: 21, textAlign: "center", flexShrink: 1 }}>{title}</Text>
      {arrow && <Ionicons name="arrow-forward" size={21} color={fg} />}
    </>}
  </Pressable>;
}

export function AuthDivider() {
  const { colors } = useTheme();
  return <View accessible={false} style={{ flexDirection: "row", alignItems: "center", minHeight: 29, gap: 13 }}>
    <View style={{ height: 1, backgroundColor: colors.outline, opacity: 0.45, flex: 1 }} />
    <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>or</Text>
    <View style={{ height: 1, backgroundColor: colors.outline, opacity: 0.45, flex: 1 }} />
  </View>;
}

export function AuthField({ label, icon, inputRef, trailing, ...props }: TextInputProps & {
  label: string; icon: React.ComponentProps<typeof Ionicons>["name"]; inputRef?: Ref<TextInput>; trailing?: ReactNode;
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const control = useRef<TextInput>(null);
  return <Pressable accessible={false} focusable={false} disabled={props.editable === false} onPress={() => control.current?.focus()}
    style={{ minHeight: 64, borderWidth: 1, borderColor: focused ? colors.focus : colors.outline, borderRadius: 12, backgroundColor: colors.paper, flexDirection: "row", alignItems: "center", paddingLeft: 14, paddingRight: trailing ? 2 : 14, gap: 12 }}>
    <Ionicons name={icon} size={22} color={colors.muted} accessible={false} />
    <View style={{ flex: 1, minWidth: 0, paddingVertical: 9 }}>
      <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15 }}>{label}</Text>
      <TextInput {...props} ref={(node) => { control.current = node; if (typeof inputRef === "function") inputRef(node); else if (inputRef) inputRef.current = node; }} accessibilityLabel={label} placeholderTextColor={colors.muted} selectionColor={colors.green} cursorColor={colors.green} underlineColorAndroid="transparent"
        onFocus={(event) => { setFocused(true); props.onFocus?.(event); }} onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
        style={{ color: colors.text, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, minHeight: 26, padding: 0, paddingVertical: 0, includeFontPadding: false }} />
    </View>
    {trailing}
  </Pressable>;
}

