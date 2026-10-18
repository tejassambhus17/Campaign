import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  TextProps,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../lib/theme";
import { fonts } from "../lib/appearance";
import { getApiSessionGeneration, isCloudBuild, loadPrivateWebImage, mediaImageSource, subscribeApiSession } from "../lib/api";
export { useTheme } from "../lib/theme";
export { fonts } from "../lib/appearance";
export function Text({ style, ...props }: TextProps) {
  const { colors } = useTheme();
  const flat = StyleSheet.flatten(style) || {};
  const weight = Number(flat.fontWeight || 400);
  const family =
    flat.fontFamily ||
    (weight >= 700
      ? fonts.bold
      : weight >= 600
        ? fonts.semibold
        : weight >= 500
          ? fonts.medium
          : fonts.sans);
  return (
    <NativeText
      {...props}
      style={[
        { fontFamily: family, color: colors.text },
        style,
        { fontWeight: "normal" },
      ]}
    />
  );
}
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const { styles } = useTheme();
  return (
    <View style={{ gap: 6, paddingTop: 8, paddingBottom: 4 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text accessibilityRole="header" style={[styles.title, { flex: 1 }]}>
          {title}
        </Text>
        {action}
      </View>
      {!!description && <Text style={styles.muted}>{description}</Text>}
    </View>
  );
}
export function Screen({
  children,
  scroll = true,
  backgroundColor,
  androidKeyboardAvoidance = true,
  compact = false,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  backgroundColor?: string;
  /** Disable where Android window resizing already handles the focused form. */
  androidKeyboardAvoidance?: boolean;
  /** Tighter page rhythm for task screens; safe areas and touch targets stay intact. */
  compact?: boolean;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(
    () => Platform.OS === "android" && androidKeyboardAvoidance && Keyboard.isVisible(),
  );
  useEffect(() => {
    if (Platform.OS !== "android" || !androidKeyboardAvoidance) return;
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, [androidKeyboardAvoidance]);
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: backgroundColor || colors.bg }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        enabled={Platform.OS !== "android" || androidKeyboardAvoidance}
        // Android may retain a residual height after IME dismissal. Returning
        // to flex layout clears it while preserving this view and its children.
        behavior={Platform.OS === "ios" ? "padding" : androidKeyboardAvoidance && keyboardVisible ? "height" : undefined}
        keyboardVerticalOffset={Platform.OS === "android" ? insets.top : 0}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View
              style={{
                width: "100%",
                maxWidth: 640,
                alignSelf: "center",
                paddingHorizontal: 18,
                paddingTop: compact ? 12 : 18,
                paddingBottom: compact ? 20 : 28,
                gap: compact ? 12 : 18,
              }}
            >
              {children}
            </View>
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const bg =
    variant === "primary"
      ? colors.green
      : variant === "danger"
        ? colors.red
        : variant === "secondary"
          ? colors.mint
          : "transparent";
  const fg = disabled ? colors.disabledText : variant === "primary" ? colors.onPrimary : variant === "danger" ? colors.paper : colors.green;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: disabled ? colors.disabledSurface : bg,
        opacity: pressed ? 0.8 : 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        ...style,
      })}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : icon ? (
        <Ionicons name={icon} size={19} color={fg} />
      ) : null}
      <Text
        style={{
          fontSize: 15,
          fontWeight: "700",
          color: fg,
          flexShrink: 1,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function IconButton({
  label,
  icon,
  onPress,
  disabled = false,
  loading = false,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        borderRadius: 9,
        backgroundColor: pressed ? colors.mint : "transparent",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.45 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={colors.green} />
      ) : (
        <Ionicons name={icon} size={22} color={colors.green} />
      )}
    </Pressable>
  );
}
export function Field({
  label,
  hint,
  error,
  inputRef,
  compact = false,
  ...props
}: TextInputProps & { label: string; hint?: string; error?: string; inputRef?: React.Ref<TextInput>; compact?: boolean }) {
  const { colors, styles, scheme } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: compact ? 5 : 7 }}>
      <Text style={{ fontSize: compact ? 12 : 14, lineHeight: compact ? 17 : 20, fontWeight: "600", color: colors.ink }}>
        {label}
      </Text>
      <TextInput
        ref={inputRef}
        accessibilityLabel={label}
        keyboardAppearance={scheme}
        placeholderTextColor={colors.muted}
        selectionColor={colors.green}
        {...props}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[
          styles.input,
          props.multiline && { minHeight: 110, textAlignVertical: "top" },
          compact && { minHeight: props.multiline ? 112 : 48, fontSize: 14, lineHeight: 20, paddingHorizontal: 12, paddingVertical: 10 },
          props.style,
          focused && { borderColor: colors.focus },
          error && { borderColor: colors.red },
        ]}
      />
      {!!hint && <Text style={[styles.muted, compact && { fontSize: 11, lineHeight: 16 }]}>{hint}</Text>}
      {!!error && (
        <Text accessibilityRole="alert" style={[styles.error, compact && { fontSize: 12, lineHeight: 17 }]}>
          {error}
        </Text>
      )}
    </View>
  );
}
export function Pill({
  title,
  selected,
  onPress,
  disabled = false,
  accessibilityLabel,
}: {
  title: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minHeight: 48,
        paddingHorizontal: 14,
        paddingVertical: 12,
        justifyContent: "center",
        borderRadius: 24,
        backgroundColor: selected ? colors.green : colors.paper,
        borderWidth: 1,
        borderColor: selected ? colors.green : colors.line,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: selected ? colors.onPrimary : colors.text,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Notice({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "error" | "success";
}) {
  const { colors, styles } = useTheme();
  return (
    <View
      accessibilityRole={tone === "error" ? "alert" : "text"}
      style={{
        padding: 12,
        borderRadius: 8,
        backgroundColor:
          tone === "error"
            ? colors.errorSurface
            : tone === "success"
              ? colors.mint
              : colors.peach,
      }}
    >
      <Text
        style={{
          ...styles.muted,
          color: tone === "error" ? colors.red : colors.ink,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  const { colors, styles } = useTheme();
  return (
    <View
      style={{
        padding: 20,
        gap: 12,
        alignItems: "flex-start",
        backgroundColor: colors.mint,
        borderRadius: 12,
      }}
    >
      <Text style={[styles.h2, { fontSize: 18 }]}>{title}</Text>
      <Text style={styles.muted}>{body}</Text>
      {action}
    </View>
  );
}
export function Loading() {
  const { colors } = useTheme();
  return (
    <View accessibilityLabel="Loading campaigns" style={{ gap: 14 }}>
      {[1, 2].map((v) => (
        <View
          key={v}
          style={{
            height: 210,
            borderRadius: 14,
            backgroundColor: colors.line,
            opacity: 0.6,
          }}
        />
      ))}
      <ActivityIndicator color={colors.green} />
      <ConnectionHint active />
    </View>
  );
}
export function ConnectionHint({ active }: { active: boolean }) {
  const { styles } = useTheme();
  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    setWaiting(false);
    if (!active || !isCloudBuild) return;
    const timer = setTimeout(() => setWaiting(true), 8000);
    return () => clearTimeout(timer);
  }, [active]);
  return waiting && active ? <Text accessibilityLiveRegion="polite" style={[styles.muted, { fontSize: 12, lineHeight: 18, textAlign: "center" }]}>Connecting to Campaign… Free hosting may take a moment to wake up. Your device drafts stay saved.</Text> : null;
}
export function ErrorState({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <View style={{ gap: 12 }}>
      <Notice tone="error">
        {error instanceof Error ? error.message : "Something went wrong."}
      </Notice>
      <Button title="Try again" onPress={retry} variant="secondary" />
    </View>
  );
}
export function Accordion({
  title,
  children,
  initiallyOpen = false,
  keepMounted = false,
  compact = false,
  reveal = false,
}: {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
  keepMounted?: boolean;
  compact?: boolean;
  /** A truthy/new validation request opens content; clearing it never closes an edited field. */
  reveal?: boolean | object;
}) {
  const { colors, styles } = useTheme();
  const [open, setOpen] = useState(initiallyOpen || !!reveal);
  useEffect(() => { if (reveal) setOpen(true); }, [reveal]);
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(current => !current)}
        style={{
          minHeight: 48,
          paddingVertical: compact ? 9 : 11,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Text
          style={{
            fontSize: compact ? 14 : 16,
            ...(compact ? { lineHeight: 20 } : {}),
            fontWeight: "600",
            color: open ? colors.primary : colors.ink,
            flex: 1,
          }}
        >
          {title}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.green}
        />
      </Pressable>
      {(open || keepMounted) && (
        <View importantForAccessibility={open ? "auto" : "no-hide-descendants"} style={{ display: open ? "flex" : "none", paddingBottom: compact ? 12 : 18, gap: compact ? 8 : 10 }}>
          {typeof children === "string" ? (
            <Text style={[styles.body, compact && { fontSize: 14, lineHeight: 21 }]}>{children}</Text>
          ) : (
            children
          )}
        </View>
      )}
    </View>
  );
}
export function Picture({
  uri,
  height = 220,
}: {
  uri?: string;
  height?: number;
}) {
  const { colors } = useTheme();
  const generation = useSyncExternalStore(subscribeApiSession, getApiSessionGeneration, getApiSessionGeneration);
  const identity = `${generation}:${uri || ""}`;
  const currentIdentity = useRef(identity);
  currentIdentity.current = identity;
  const [failed, setFailed] = useState(false);
  const [webImage, setWebImage] = useState<{ identity: string; uri: string } | null>(null);
  useEffect(() => setFailed(false), [identity]);
  const source = mediaImageSource(uri || "");
  const privateWebImage = Platform.OS === "web" && !!source.headers;
  useEffect(() => {
    if (Platform.OS !== "web" || !uri || !mediaImageSource(uri).headers) return;
    let active = true;
    let dispose: (() => void) | undefined;
    const controller = new AbortController();
    void loadPrivateWebImage(uri, controller.signal).then((image) => {
      if (!active || currentIdentity.current !== identity) { image.dispose(); return; }
      dispose = image.dispose;
      setWebImage({ identity, uri: image.uri });
    }).catch(() => { if (active && currentIdentity.current === identity) setFailed(true); });
    return () => { active = false; controller.abort(); dispose?.(); };
  }, [identity, uri]);
  const displaySource = privateWebImage ? webImage?.identity === identity ? { uri: webImage.uri } : null : source;
  return uri && !failed && displaySource ? (
    <Image
      key={identity}
      accessibilityLabel="Campaign photograph"
      source={displaySource}
      style={{ width: "100%", height, backgroundColor: colors.mint }}
      resizeMode="cover"
      onError={() => { if (currentIdentity.current === identity && getApiSessionGeneration() === generation) setFailed(true); }}
    />
  ) : (
    <View
      style={{
        height,
        backgroundColor: colors.mint,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name="megaphone-outline" size={48} color={colors.green} />
    </View>
  );
}
export function Progress({ raised, goal }: { raised: number; goal: number }) {
  const { colors } = useTheme();
  const percentage = goal
    ? Math.min(100, Math.round((raised / goal) * 100))
    : 0;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      style={{
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.progressTrack,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: 6,
          width: `${percentage}%`,
          backgroundColor: colors.progress,
          borderRadius: 3,
        }}
      />
    </View>
  );
}
