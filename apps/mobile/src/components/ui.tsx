import React, { useEffect, useState } from "react";
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
import { mediaUrl } from "../lib/api";
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
}: {
  children: React.ReactNode;
  scroll?: boolean;
  backgroundColor?: string;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(
    () => Platform.OS === "android" && Keyboard.isVisible(),
  );
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: backgroundColor || colors.bg }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // Android may retain a residual height after IME dismissal. Returning
        // to flex layout clears it while preserving this view and its children.
        behavior={Platform.OS === "ios" ? "padding" : keyboardVisible ? "height" : undefined}
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
                padding: 18,
                paddingBottom: 28,
                gap: 18,
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
        borderRadius: 9,
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
  ...props
}: TextInputProps & { label: string; hint?: string; error?: string; inputRef?: React.Ref<TextInput> }) {
  const { colors, styles, scheme } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 7 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.ink }}>
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
          props.style,
          focused && { borderColor: colors.focus },
          error && { borderColor: colors.red },
        ]}
      />
      {!!hint && <Text style={styles.muted}>{hint}</Text>}
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
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
        borderRadius: 8,
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
    </View>
  );
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
}: {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
}) {
  const { colors, styles } = useTheme();
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <View style={{ borderBottomWidth: 1, borderColor: colors.line }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={{
          minHeight: 56,
          paddingVertical: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.ink,
            flex: 1,
          }}
        >
          {title}
        </Text>
        <Ionicons
          name={open ? "remove" : "add"}
          size={21}
          color={colors.green}
        />
      </Pressable>
      {open && (
        <View style={{ paddingBottom: 18, gap: 10 }}>
          {typeof children === "string" ? (
            <Text style={styles.body}>{children}</Text>
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
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  return uri && !failed ? (
    <Image
      accessibilityLabel="Campaign photograph"
      source={{ uri: mediaUrl(uri) }}
      style={{ width: "100%", height, backgroundColor: colors.mint }}
      resizeMode="cover"
      onError={() => setFailed(true)}
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
