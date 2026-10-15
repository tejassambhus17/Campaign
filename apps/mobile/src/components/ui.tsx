import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { mediaUrl } from "../lib/api";
export const fonts = {
  sans: "ManropeRegular",
  medium: "ManropeMedium",
  semibold: "ManropeSemiBold",
  bold: "ManropeBold",
  editorial: "NewsreaderMedium",
  editorialStrong: "NewsreaderSemiBold",
};
export const colors = {
  bg: "#F6F5F0",
  paper: "#FFFFFF",
  ink: "#17252E",
  text: "#24333E",
  muted: "#59666D",
  line: "#DDE1E5",
  outline: "#7B868E",
  green: "#2D4ED8",
  mint: "#EEF1FC",
  orange: "#B83F2C",
  peach: "#F9EEE8",
  red: "#B3261E",
  success: "#216146",
  warning: "#785616",
  focus: "#2D4ED8",
};
export function Text({ style, ...props }: TextProps) {
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
export const styles = StyleSheet.create({
  body: { fontSize: 15, lineHeight: 23, color: colors.text },
  muted: { fontSize: 14, lineHeight: 21, color: colors.muted },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  h2: {
    fontSize: 20,
    lineHeight: 27,
    fontFamily: fonts.bold,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: {
    minHeight: 52,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderColor: colors.outline,
    borderWidth: 1,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.paper,
    fontFamily: fonts.sans,
  },
  error: { color: colors.red, fontSize: 14, lineHeight: 21 },
  stack: { gap: 16 },
});
export function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
                padding: 20,
                paddingBottom: 28,
                gap: 20,
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
  const bg =
    variant === "primary"
      ? colors.green
      : variant === "danger"
        ? colors.red
        : variant === "secondary"
          ? colors.mint
          : "transparent";
  const fg =
    variant === "primary" || variant === "danger" ? "white" : colors.green;
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
        backgroundColor: bg,
        opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
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
  ...props
}: TextInputProps & { label: string; hint?: string; error?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 7 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.ink }}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
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
}: {
  title: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityState={{ selected }}
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
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: selected ? "white" : colors.text,
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
  return (
    <View
      accessibilityRole={tone === "error" ? "alert" : "text"}
      style={{
        padding: 12,
        borderRadius: 8,
        backgroundColor:
          tone === "error"
            ? "#FCECEC"
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
        backgroundColor: colors.line,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: 6,
          width: `${percentage}%`,
          backgroundColor: colors.green,
          borderRadius: 3,
        }}
      />
    </View>
  );
}
