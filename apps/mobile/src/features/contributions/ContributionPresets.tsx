import { useRef, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { fonts, Text, useTheme } from "../../components/ui";
import { CONTRIBUTION_PRESETS, contributionPresetLayout, PRESET_GAP, PRESET_HORIZONTAL_PADDING } from "./presetLayout";

export function ContributionPresets({ selectedUsd, formatAmount, disabled, onSelect }: {
  selectedUsd: number;
  formatAmount: (usd: number) => string;
  disabled: boolean;
  onSelect: (usd: number) => void;
}) {
  const { colors } = useTheme();
  const { width: windowWidth, fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const labels = CONTRIBUTION_PRESETS.map(formatAmount);
  const measureKey = JSON.stringify([labels, fontScale]);
  const currentMeasureKey = useRef(measureKey);
  currentMeasureKey.current = measureKey;
  const [measurements, setMeasurements] = useState<{ key: string; widths: Record<number, number> }>({ key: measureKey, widths: {} });
  const widths = labels.map((label, index) => measurements.key === measureKey && measurements.widths[index] !== undefined
    ? measurements.widths[index]
    : Array.from(label).length * 10 * fontScale);
  const layout = contributionPresetLayout(width || Math.max(1, Math.min(windowWidth, 640) - 40), widths);
  const labelStyle = { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, fontVariant: ["tabular-nums"] as "tabular-nums"[] };

  return <View testID="contribution-presets" onLayout={event => {
    const measuredWidth = event.nativeEvent.layout.width;
    if (measuredWidth > 0) setWidth(previous => Math.abs(previous - measuredWidth) > 0.5 ? measuredWidth : previous);
  }} style={{ flexDirection: "row", flexWrap: "wrap", gap: PRESET_GAP }}>
    {/* A horizontal measuring surface gives labels their natural native width,
        including Android font scaling, without exposing duplicate controls. */}
    <ScrollView key={measureKey} horizontal scrollEnabled={false} pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" removeClippedSubviews={false} style={{ position: "absolute", width: "100%", height: 1, opacity: 0 }} contentContainerStyle={{ flexDirection: "row" }}>
      {labels.map((label, index) => <Text key={CONTRIBUTION_PRESETS[index]} testID={`contribution-preset-measure-${CONTRIBUTION_PRESETS[index]}`} accessible={false} style={labelStyle} onLayout={event => {
        const measuredWidth = event.nativeEvent.layout.width;
        if (currentMeasureKey.current !== measureKey || !Number.isFinite(measuredWidth) || measuredWidth <= 0) return;
        setMeasurements(previous => previous.key === measureKey && previous.widths[index] === measuredWidth
          ? previous
          : { key: measureKey, widths: { ...(previous.key === measureKey ? previous.widths : {}), [index]: measuredWidth } });
      }}>{label}</Text>)}
    </ScrollView>
    {CONTRIBUTION_PRESETS.map((preset, index) => {
      const selected = selectedUsd === preset;
      return <Pressable key={preset} testID={`contribution-preset-${preset}`} accessibilityRole="button" accessibilityLabel={`${labels[index]} contribution`} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => { if (!disabled) onSelect(preset); }} style={({ pressed }) => ({
        width: layout.itemWidth,
        minHeight: 48,
        paddingHorizontal: PRESET_HORIZONTAL_PADDING,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.line,
        backgroundColor: selected ? colors.primary : colors.paper,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
      })}>
        <Text style={[labelStyle, { color: selected ? colors.onPrimary : colors.ink, textAlign: "center" }]}>{labels[index]}</Text>
      </Pressable>;
    })}
  </View>;
}
