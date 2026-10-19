import { Image, Pressable, useWindowDimensions, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fonts, Text, useTheme } from "../../components/ui";
import type { User } from "../../lib/types";
import { number } from "../../lib/types";
import { ProfilePhoto } from "./Photo";

export function ProfileIdentity({ user, onEdit }: { user: User; onEdit: () => void }) {
  const { colors, styles, scheme } = useTheme();
  return <View style={{ marginHorizontal: -18, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, overflow: "hidden" }}>
    {scheme === "dark" && <Image source={require("../../../assets/images/create/story-mountains.png")} resizeMode="cover" accessible={false} style={{ position: "absolute", top: 0, right: 0, width: "100%", height: "100%", opacity: 0.18 }} />}
    <View style={{ flexDirection: "row", alignItems: "center", gap: 17 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Edit profile photo" onPress={onEdit} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
        <View style={{ padding: 5, borderWidth: 1, borderColor: colors.line, borderRadius: 49 }}><ProfilePhoto size={76} user={user} /></View>
        <View accessible={false} style={{ position: "absolute", right: 0, bottom: 0, width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 14, borderColor: colors.line, borderWidth: 1, backgroundColor: colors.paper }}><Ionicons name="pencil-outline" size={14} color={colors.ink} /></View>
      </Pressable>
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <Text accessibilityRole="header" style={{ fontSize: 20, lineHeight: 28, fontFamily: fonts.bold }}>{user.name}</Text>
        <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>{user.role === "reviewer" ? "Reviewer · Creator · Backer" : "Creator · Backer · Changemaker"}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" onPress={onEdit} style={({ pressed }) => ({ alignSelf: "flex-start", minHeight: 48, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: colors.outline, borderRadius: 22, backgroundColor: colors.bg, marginTop: 3, opacity: pressed ? 0.75 : 1 })}>
          <Ionicons name="pencil-outline" size={14} color={colors.green} /><Text style={{ color: colors.green, fontFamily: fonts.semibold, fontSize: 11, lineHeight: 17 }}>Edit Profile</Text><Ionicons name="chevron-forward" size={13} color={colors.green} />
        </Pressable>
      </View>
    </View>
  </View>;
}

type Metric = { label: string; value: number; icon: React.ComponentProps<typeof Ionicons>["name"]; onPress: () => void };
export function ProfileMetrics({ metrics, loaded }: { metrics: Metric[]; loaded: boolean }) {
  const { colors, styles } = useTheme();
  return <View style={{ flexDirection: "row", backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 15, paddingVertical: 9 }}>
    {metrics.map((metric, index) => <Pressable key={metric.label} accessibilityRole="button" accessibilityLabel={`View ${metric.label.toLowerCase()}${loaded ? `, ${metric.value}` : ""}`} onPress={metric.onPress}
      style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 63, justifyContent: "center", alignItems: "center", gap: 3, paddingHorizontal: 4, borderLeftWidth: index ? 1 : 0, borderColor: colors.line, opacity: pressed ? 0.7 : 1 })}>
      <Ionicons name={metric.icon} size={19} color={index === 1 ? colors.red : colors.green} />
      <Text style={{ fontFamily: fonts.bold, fontSize: 19, lineHeight: 26, fontVariant: ["tabular-nums"] }}>{loaded ? number(metric.value) : "—"}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3, flexWrap: "wrap" }}><Text style={[styles.muted, { fontSize: 10, lineHeight: 16, textAlign: "center" }]}>{metric.label}</Text><Ionicons name="chevron-forward" size={11} color={colors.muted} /></View>
    </Pressable>)}
  </View>;
}

export function StudioInvitation({ onPress }: { onPress: () => void }) {
  const { colors, styles } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const hideArtwork = fontScale > 1.2 || width / fontScale < 300;
  const features = [
    { icon: "bar-chart-outline", label: "Track progress" }, { icon: "document-text-outline", label: "View reports" },
    { icon: "people-outline", label: "Manage campaigns" }, { icon: "flash-outline", label: "Grow impact" },
  ] as const;
  return <Pressable testID="creator-studio-entry" accessibilityRole="button" accessibilityLabel="Open Creator Studio. Manage campaigns, drafts, review status and funding progress" onPress={onPress}
    style={({ pressed }) => ({ borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.paper, overflow: "hidden", opacity: pressed ? 0.8 : 1 })}>
    <View style={{ padding: 16, paddingRight: hideArtwork ? 58 : 16, paddingBottom: 11, minHeight: 141 }}>
      {!hideArtwork && <View accessible={false} style={{ position: "absolute", right: 12, top: 12, width: "36%", height: 112, borderRadius: 12, overflow: "hidden" }}>
        <Image accessible={false} source={require("../../../assets/images/profile/creator-studio-hq.png")} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
      </View>}
      <View style={{ width: hideArtwork ? "100%" : "56%", gap: 6 }}>
        <Text style={{ color: colors.green, fontFamily: fonts.bold, letterSpacing: 1.7, fontSize: 10, lineHeight: 15 }}>CREATOR STUDIO</Text>
        <Text style={{ fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 }}>Bring your ideas{"\n"}to life</Text>
        <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Create, manage and track your campaigns, all in one place.</Text>
      </View>
      <View accessible={false} style={{ position: "absolute", right: 15, bottom: 13, width: 35, height: 35, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceRaised, alignItems: "center", justifyContent: "center" }}><Ionicons name="chevron-forward" size={20} color={colors.green} /></View>
    </View>
    <View accessible={false} style={{ flexDirection: "row", flexWrap: hideArtwork ? "wrap" : "nowrap", rowGap: hideArtwork ? 12 : 0, paddingHorizontal: 9, paddingVertical: 11, borderTopWidth: 1, borderColor: colors.line }}>
      {features.map((feature, index) => <View key={feature.label} style={{ flex: hideArtwork ? undefined : 1, width: hideArtwork ? "50%" : undefined, paddingHorizontal: 5, gap: 5, borderLeftWidth: (hideArtwork ? index % 2 : index) ? 1 : 0, borderColor: colors.line }}>
        <Ionicons name={feature.icon} color={colors.green} size={17} /><Text style={[styles.muted, { fontSize: 9, lineHeight: 14 }]}>{feature.label}</Text>
      </View>)}
    </View>
  </Pressable>;
}

export function ProfileGroup({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={{ backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 15, paddingHorizontal: 11, paddingVertical: 3 }}>{children}</View>;
}
