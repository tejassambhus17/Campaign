import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, TextStyle, useWindowDimensions, View } from "react-native";
import { Text, useTheme } from "../../components/ui";
import { activityRelativeTime, activityTime, notificationAction } from "../../lib/activity";
import { Notification } from "../../lib/types";

export type NotificationRowProps = {
  item: Notification;
  campaignTitle?: string;
  pending?: boolean;
  onOpen: () => void;
  onRead?: () => void;
  compact?: boolean;
  /** Activity is an unboxed list; the quick-sheet treatment stays unchanged. */
  presentation?: "history" | "sheet";
};

type TextPart = "heading" | "campaign" | "body";
type TextMeasurement = { key: string; overflow: Partial<Record<TextPart, boolean>> };

function notificationIcon(item: Notification): React.ComponentProps<typeof Ionicons>["name"] {
  if (item.category === "payments") return "receipt-outline";
  if (item.category === "security") return "shield-checkmark-outline";
  if (item.destination?.type === "creator") return "create-outline";
  if (item.destination?.type === "report") return "bar-chart-outline";
  if (/milestone|funding goal/i.test(item.title)) return "trending-up-outline";
  if (/approved/i.test(item.title)) return "checkmark-circle-outline";
  if (/completed/i.test(item.title)) return "checkmark-done-outline";
  return "megaphone-outline";
}

/** One presentation for the account-scoped quick sheet and complete history. */
export function NotificationRow({
  item,
  campaignTitle,
  pending = false,
  onOpen,
  onRead,
  compact = false,
  presentation = "sheet",
}: NotificationRowProps) {
  const { colors, scheme } = useTheme();
  const { fontScale } = useWindowDimensions();
  const action = notificationAction(item);
  const title = campaignTitle || item.campaignTitle;
  const unread = !item.read;
  // Disclosure belongs to this mounted event, never to a cached account/feed.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expanded = expandedId === item.id;
  const [textWidth, setTextWidth] = useState(0);
  const [measurement, setMeasurement] = useState<TextMeasurement | null>(null);
  const bodyLines = compact ? 2 : 3;
  const measurementKey = JSON.stringify([item.id, item.title, title, item.body, compact, unread, textWidth, fontScale, scheme]);
  const currentMeasurementKey = useRef(measurementKey);
  currentMeasurementKey.current = measurementKey;
  const measured = measurement?.key === measurementKey ? measurement.overflow : {};
  const overflowing = Object.values(measured).some(Boolean);
  const canDisclose = expanded || overflowing;
  const headingStyle: TextStyle = { color: colors.ink, fontSize: compact ? 13 : 14, lineHeight: compact ? 18 : 20, fontWeight: unread ? "700" : "600", letterSpacing: -0.15 };
  const campaignStyle: TextStyle = { color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "500" };
  const bodyStyle: TextStyle = { color: colors.text, fontSize: 12, lineHeight: 18 };

  function measuredText(part: TextPart, lines: number, limit: number) {
    // A previous width/font/account event may arrive after this row changes.
    if (currentMeasurementKey.current !== measurementKey) return;
    const overflow = lines > limit;
    setMeasurement((previous) => {
      const values = previous?.key === measurementKey ? previous.overflow : {};
      if (values[part] === overflow) return previous;
      return { key: measurementKey, overflow: { ...values, [part]: overflow } };
    });
  }
  return (
    <View style={{ flexDirection: "row", gap: 8, borderBottomWidth: presentation === "history" ? 0 : 1, borderBottomColor: colors.line, backgroundColor: presentation === "history" ? "transparent" : unread ? colors.paper : "transparent" }}>
      <View style={{ flex: 1, paddingLeft: compact ? 12 : 0, paddingTop: 12, paddingBottom: 4 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${unread ? "Unread. " : ""}${item.title}. ${title ? `${title}. ` : ""}${item.body}. ${activityTime(item.createdAt)}. ${action.title}.`}
          accessibilityHint="Opens this update's relevant destination."
          onPress={onOpen}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "flex-start", gap: 11, minHeight: 48, opacity: pressed ? 0.65 : 1 })}
        >
          <View accessible={false} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: unread ? colors.mint : colors.surfaceRaised, alignItems: "center", justifyContent: "center", marginTop: 2 }}>
            <Ionicons name={notificationIcon(item)} size={19} color={unread ? colors.green : colors.muted} />
          </View>
          <View onLayout={(event) => setTextWidth(event.nativeEvent.layout.width)} style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text numberOfLines={expanded ? undefined : 2} style={headingStyle}>{item.title}</Text>
            {!!title && <Text numberOfLines={expanded ? undefined : 1} style={campaignStyle}>{title}</Text>}
            <Text numberOfLines={expanded ? undefined : bodyLines} style={bodyStyle}>{item.body}</Text>
            {/* Measure natural native lines once at the exact visible width.
                Android's line-limited Text event cannot establish truncation.
                Each probe disappears after its result; none is accessible,
                touchable or part of the row's height. Only mounted rows probe. */}
            {!expanded && !overflowing && textWidth > 0 && <View key={measurementKey} pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", left: 0, top: 0, width: textWidth, height: 0, overflow: "hidden", opacity: 0 }}>
              {measured.heading === undefined && <Text accessible={false} onTextLayout={(event) => measuredText("heading", event.nativeEvent.lines.length, 2)} style={headingStyle}>{item.title}</Text>}
              {!!title && measured.campaign === undefined && <Text accessible={false} onTextLayout={(event) => measuredText("campaign", event.nativeEvent.lines.length, 1)} style={campaignStyle}>{title}</Text>}
              {measured.body === undefined && <Text accessible={false} onTextLayout={(event) => measuredText("body", event.nativeEvent.lines.length, bodyLines)} style={bodyStyle}>{item.body}</Text>}
            </View>}
          </View>
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: 8, marginLeft: 47, minHeight: canDisclose ? 48 : 24 }}>
          <Text accessibilityLabel={activityTime(item.createdAt)} style={{ flexGrow: 1, flexShrink: 1, color: colors.muted, fontSize: 11, lineHeight: 16 }}>{activityRelativeTime(item.createdAt)}</Text>
          {canDisclose && <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${expanded ? "Collapse" : "Read full"} update: ${item.title}`}
            accessibilityHint="Shows this notification's complete text here without leaving the list."
            accessibilityState={{ expanded }}
            onPress={() => setExpandedId(expanded ? null : item.id)}
            style={({ pressed }) => ({ minHeight: 48, minWidth: 48, maxWidth: "68%", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, paddingHorizontal: 4, opacity: pressed ? 0.65 : 1 })}
          >
            <Text style={{ flexShrink: 1, color: colors.green, fontSize: 11, lineHeight: 16, fontWeight: "600" }}>{expanded ? "Show less" : "Read full update"}</Text>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={13} color={colors.green} />
          </Pressable>}
        </View>
      </View>
      {unread && onRead ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Mark ${item.title} as read`}
          accessibilityHint="Marks this update as read without opening it."
          accessibilityState={{ disabled: pending, busy: pending }}
          disabled={pending}
          onPress={onRead}
          style={({ pressed }) => ({ width: 48, minHeight: 48, alignSelf: "flex-start", alignItems: "center", justifyContent: "center", marginTop: compact ? 5 : 8, opacity: pressed || pending ? 0.55 : 1 })}
        >
          {pending ? <ActivityIndicator size="small" color={colors.green} /> : <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.progress }} />}
        </Pressable>
      ) : (
        <Pressable accessible={false} focusable={false} onPress={onOpen} style={({ pressed }) => ({ width: 48, minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: compact ? 5 : 8, opacity: pressed ? 0.65 : 1 })}>
          {unread ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.progress }} /> : <Ionicons name="chevron-forward" size={15} color={colors.muted} />}
        </Pressable>
      )}
    </View>
  );
}
