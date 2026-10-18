export const CONTRIBUTION_PRESETS = [5, 10, 25, 50] as const;
export const PRESET_GAP = 10;
export const PRESET_HORIZONTAL_PADDING = 14;

/** Keep every complete monetary label readable before adding another column. */
export function contributionPresetLayout(availableWidth: number, labelWidths: readonly number[]) {
  const width = Number.isFinite(availableWidth) && availableWidth > 0 ? availableWidth : 1;
  const widest = Math.max(0, ...labelWidths.filter(value => Number.isFinite(value) && value >= 0));
  // Include borders and a small rounding allowance around native text measurements.
  const minimum = Math.max(48, Math.ceil(widest) + PRESET_HORIZONTAL_PADDING * 2 + 4);
  const columns = ([4, 2, 1] as const).find(count => (width - PRESET_GAP * (count - 1)) / count >= minimum) ?? 1;
  return { columns, itemWidth: (width - PRESET_GAP * (columns - 1)) / columns };
}
