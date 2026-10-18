import { useCurrency } from "../../lib/CurrencyProvider";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, TextInput, useWindowDimensions, View, ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fonts, Picture, Text, useTheme } from "../../components/ui";
import { SelectionSheet } from "../../components/Information";
import { Campaign } from "../../lib/types";
import { STEPS } from "./model";
import { IMAGE_UPLOAD_HINT } from "./media";

type Icon = React.ComponentProps<typeof Ionicons>["name"];
const stepIcons: Icon[] = ["reader-outline", "create-outline", "images-outline", "people-outline", "lock-closed-outline"];
export function CreationProgress({ step }: { step: number }) {
  const { colors } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const railWidth = Math.max(Math.min(width, 640) - 36, Math.ceil(54 * 5 * Math.max(1, fontScale)));
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flexShrink: 0 }} contentContainerStyle={{ flexGrow: 1 }}>
      <View accessible accessibilityRole="progressbar" accessibilityLabel={`Campaign creation: ${STEPS[step]}`} accessibilityHint={`Five steps: ${STEPS.join(", ")}.`} accessibilityValue={{ min: 1, max: 5, now: step + 1, text: `Step ${step + 1} of 5: ${STEPS[step]}` }} accessibilityLiveRegion="polite" style={{ width: railWidth, flexDirection: "row", paddingTop: 2, paddingBottom: 2 }}>
        <View style={{ position: "absolute", left: "10%", right: "10%", top: 18, height: 1.5, backgroundColor: colors.line }} />
        {step > 0 && <View style={{ position: "absolute", left: "10%", width: `${step * 20}%`, top: 18, height: 1.5, backgroundColor: colors.green }} />}
        {["Basics", "Story", "Visuals", "Reach", "Submit"].map((title, index) => <View key={title} style={{ flex: 1, alignItems: "center", gap: 4 }}>
          <View style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: index === step ? 32 : 24, height: index === step ? 32 : 24, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: index === step ? colors.green : colors.bg, borderWidth: index < step ? 1.5 : 1, borderColor: index <= step ? colors.green : colors.line }}>
              <Ionicons name={stepIcons[index]} size={index === step ? 19 : 14} color={index === step ? colors.onPrimary : index < step ? colors.green : colors.muted} />
            </View>
          </View>
          <Text style={{ fontSize: 11, lineHeight: 16, textAlign: "center", fontWeight: index === step ? "700" : "500", color: index === step ? colors.ink : colors.muted }}>{title}</Text>
        </View>)}
      </View>
    </ScrollView>
  );
}

export function CreationButton({ title, onPress, secondary = false, icon, loading, disabled, style }: {
  title: string; onPress: () => void; secondary?: boolean; icon?: Icon; loading?: boolean; disabled?: boolean; style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const unavailable = disabled || loading;
  const foreground = disabled ? colors.disabledText : secondary ? colors.ink : colors.onPrimary;
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!unavailable, busy: !!loading }} disabled={unavailable} onPress={onPress} style={({ pressed }) => ({ minHeight: 48, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 26, borderWidth: secondary ? 1 : 0, borderColor: colors.outline, backgroundColor: disabled ? colors.disabledSurface : secondary ? colors.paper : colors.green, opacity: pressed ? 0.8 : 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, ...style })}>
    {loading ? <ActivityIndicator size="small" color={foreground} /> : <><Text style={{ fontSize: 13, lineHeight: 19, fontWeight: "700", color: foreground, textAlign: "center", flexShrink: 1 }}>{title}</Text>{icon && <Ionicons name={icon} size={18} color={foreground} />}</>}
  </Pressable>;
}

export function CreationActionDock({ primary, secondary }: {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
}) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = (Math.min(width, 640) - 36) / Math.max(fontScale, 1) < 260;
  // This occupies its own flex space below the form, so actions never float
  // over inputs. Screen handles the IME; the tab bar owns the system inset.
  return (
    <View style={{ marginHorizontal: 18, paddingTop: 8, paddingBottom: 10 }}>
      <View style={{ flexDirection: stacked ? "column" : "row", alignItems: "stretch", gap: 12 }}>
        {secondary && <View style={{ flex: stacked ? undefined : 0.85, minWidth: 0, alignSelf: stacked ? "flex-start" : undefined }}>{secondary}</View>}
        <View style={{ flex: stacked ? undefined : 1.65, minWidth: 0 }}>{primary}</View>
      </View>
    </View>
  );
}

export function CategorySelect({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return <SelectionSheet label="Category" value={value} options={options.map(option => ({ value: option, label: option }))} onSelect={onChange} testID="creation-category" />;
}

export function CreationTip({ title, children }: { title: string; children: string }) {
  const { colors } = useTheme();
  return <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.paper }}>
    <Ionicons name="bulb-outline" size={24} color={colors.green} />
    <View style={{ flex: 1, gap: 3 }}><Text style={{ fontSize: 12, lineHeight: 17, fontWeight: "700" }}>{title}</Text><Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>{children}</Text></View>
  </View>;
}

export function StoryFormatting({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { colors } = useTheme();
  return <View accessibilityLabel="Paragraph formatting" style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: colors.line }}>
    {[{ value: "normal", label: "Normal", text: "Aa" }, { value: "bold", label: "Bold", text: "B" }, { value: "italic", label: "Italic", text: "I" }, { value: "bullet", label: "List", text: "" }].map((format) => <Pressable key={format.value} accessibilityRole="button" accessibilityLabel={`${format.label} paragraph`} accessibilityState={{ selected: value === format.value }} onPress={() => onChange(format.value)} style={{ width: 48, height: 48, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: value === format.value ? colors.mint : "transparent" }}>{format.value === "bullet" ? <Ionicons name="list-outline" size={19} color={value === format.value ? colors.green : colors.muted} /> : <Text style={{ fontSize: 16, lineHeight: 21, color: value === format.value ? colors.green : colors.muted, fontWeight: format.value === "bold" ? "700" : "500", fontStyle: format.value === "italic" ? "italic" : "normal" }}>{format.text}</Text>}</Pressable>)}
    <View style={{ flex: 1 }} /><Ionicons name="document-text-outline" size={19} color={colors.muted} />
  </View>;
}

export function StoryComposer({ text, format, onChangeText, onFormat, position, total, onMove, onRemove }: {
  text: string; format: string; onChangeText: (value: string) => void; onFormat: (value: string) => void;
  position: number; total: number; onMove: (direction: -1 | 1) => void; onRemove: () => void;
}) {
  const { colors, scheme } = useTheme();
  const [focused, setFocused] = useState(false);
  return <View style={{ gap: 6 }}>
    {position >= 0 && <Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>Editing paragraph · section {position + 1} of {total}</Text>}
    <View style={{ borderWidth: 1, borderColor: focused ? colors.focus : colors.outline, borderRadius: 12, backgroundColor: colors.paper, overflow: "hidden", paddingHorizontal: 12 }}>
      <StoryFormatting value={format} onChange={onFormat} />
      <TextInput accessibilityLabel="Your story paragraph" multiline maxLength={15000} value={text} onChangeText={onChangeText} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} keyboardAppearance={scheme} placeholderTextColor={colors.muted} selectionColor={colors.green} placeholder={"Tell your story…\nWhat inspired this campaign?\nWhy does it matter?\nWhat could change if more people knew?"} style={{ minHeight: 148, textAlignVertical: "top", paddingTop: 14, paddingBottom: 30, fontSize: 13, lineHeight: 21, color: colors.ink, fontFamily: format === "bold" ? fonts.bold : fonts.sans, fontStyle: format === "italic" ? "italic" : "normal" }} />
      <Text style={{ position: "absolute", bottom: 9, right: 12, fontSize: 10, lineHeight: 15, color: colors.muted }}>{text.length}/15000</Text>
    </View>
    {position >= 0 && <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
      <Text style={{ flex: 1, fontSize: 11, lineHeight: 16, color: colors.muted }}>Order in your story</Text>
      {([{ icon: "arrow-up", label: `Move section ${position + 1} up`, disabled: position === 0, action: () => onMove(-1) }, { icon: "arrow-down", label: `Move section ${position + 1} down`, disabled: position === total - 1, action: () => onMove(1) }, { icon: "trash-outline", label: `Remove section ${position + 1}`, disabled: false, action: onRemove }] as const).map((action) => <Pressable key={action.icon} accessibilityRole="button" accessibilityLabel={action.label} accessibilityState={{ disabled: action.disabled }} disabled={action.disabled} onPress={action.action} style={({ pressed }) => ({ width: 48, height: 48, alignItems: "center", justifyContent: "center", opacity: action.disabled ? 0.35 : pressed ? 0.7 : 1 })}><Ionicons name={action.icon} size={18} color={action.icon === "trash-outline" ? colors.red : colors.green} /></Pressable>)}
    </View>}
  </View>;
}

export function UploadArea({ title, onPress, disabled, compact = false, showLimits = true }: { title: string; onPress: () => void; disabled?: boolean; compact?: boolean; showLimits?: boolean }) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ minHeight: compact ? 90 : 152, borderWidth: 1, borderStyle: "dashed", borderColor: colors.outline, borderRadius: 12, backgroundColor: colors.paper, padding: compact ? 12 : 20, alignItems: "center", justifyContent: "center", gap: compact ? 6 : 10, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 })}>
    <Ionicons name="image-outline" size={compact ? 27 : 35} color={colors.green} />
    <Text style={{ fontSize: 13, lineHeight: 19, textAlign: "center", color: colors.ink, fontWeight: "600" }}>{title}</Text>
    {showLimits && <Text style={{ fontSize: 10, lineHeight: 15, textAlign: "center", color: colors.muted }}>{IMAGE_UPLOAD_HINT}</Text>}
  </Pressable>;
}

export function MediaThumb({ uri, label, onRemove, large = false, disabled = false }: { uri: string; label: string; onRemove: () => void; large?: boolean; disabled?: boolean }) {
  const { colors } = useTheme();
  return <View style={{ flex: large ? 1.25 : 1, gap: 6 }}>
    <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: colors.line }}>
      <Picture uri={uri} height={large ? 174 : 110} />
      <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${label.toLowerCase()}`} accessibilityState={{ disabled }} disabled={disabled} onPress={onRemove} style={({ pressed }) => ({ position: "absolute", right: 0, top: 0, width: 48, height: 48, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}><View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" }}><Ionicons name="close" size={18} color={colors.paper} /></View></Pressable>
    </View>
    <Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>{label}</Text>
  </View>;
}

export function CampaignReviewSummary({ draft, onEdit }: { draft: Campaign; onEdit: (step: number) => void }) {
  const { money } = useCurrency();
  const { colors } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const contentWidth = Math.min(width, 640) - 36;
  const stacked = contentWidth / fontScale < 280;
  const labelWidth = Math.max(108, Math.min(124, contentWidth * 0.34));
  const rows: { icon: Icon; label: string; value: string; step: number }[] = [
    { icon: "leaf-outline", label: "Category", value: draft.category || "Choose a category", step: 0 },
    { icon: "person-outline", label: "Creator", value: draft.creatorName || "Add your name", step: 0 },
    { icon: "location-outline", label: "Location", value: draft.geography || "Set your reach", step: 3 },
    { icon: "wallet-outline", label: "Funding goal", value: draft.goal ? money(draft.goal) : "Set below", step: 4 },
    { icon: "calendar-outline", label: "Duration", value: `${draft.durationDays || "—"} days`, step: 3 },
    { icon: "people-outline", label: "Audience", value: draft.interests || "Broad audience", step: 3 },
    { icon: "document-text-outline", label: "Story", value: `${draft.sections.length} sections · ${draft.sources.length} sources`, step: 1 },
    { icon: "images-outline", label: "Media", value: `${draft.coverImage ? "Cover + " : ""}${draft.adImages.filter(Boolean).length} ad images`, step: 2 },
  ];
  return <View style={{ gap: 12 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      {draft.coverImage ? <View style={{ width: 92, borderRadius: 10, overflow: "hidden" }}><Picture uri={draft.coverImage} height={76} /></View> : <View style={{ width: 76, height: 76, borderRadius: 10, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center" }}><Ionicons name="megaphone-outline" size={28} color={colors.green} /></View>}
      <View style={{ flex: 1, gap: 2 }}><Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "700" }}>{draft.title || "Your campaign"}</Text><Pressable accessibilityRole="button" accessibilityLabel="Edit campaign basics" onPress={() => onEdit(0)} style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 5 }}><Ionicons name="create-outline" size={15} color={colors.green} /><Text style={{ fontSize: 12, color: colors.green }}>Edit</Text></Pressable></View>
    </View>
    <View testID="creation-edit-summary" style={{ gap: 0 }}>{rows.map((row) => <Pressable key={row.label} accessibilityRole="button" accessibilityLabel={`Edit ${row.label.toLowerCase()}: ${row.value}`} onPress={() => onEdit(row.step)} style={({ pressed }) => ({ minHeight: 48, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 9, opacity: pressed ? 0.65 : 1 })}>
      <Ionicons name={row.icon} size={16} color={colors.muted} />
      <View style={{ flex: 1, minWidth: 0, flexDirection: stacked ? "column" : "row", alignItems: stacked ? "stretch" : "center", gap: stacked ? 4 : 12 }}>
        <Text style={{ fontSize: 12, lineHeight: 18, color: colors.ink, width: stacked ? undefined : labelWidth }}>{row.label}</Text>
        <Text style={{ flex: stacked ? undefined : 1, minWidth: 0, fontSize: 12, lineHeight: 18, color: colors.muted, textAlign: stacked ? "left" : "right", fontVariant: ["tabular-nums"] }}>{row.value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={12} color={colors.muted} />
    </Pressable>)}</View>
  </View>;
}
