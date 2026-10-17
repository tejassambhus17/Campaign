import { Text, useTheme } from "./ui";
import { useCurrency } from "../lib/CurrencyProvider";
import { conversionCaption } from "../lib/currency";

/** Compact attribution; never puts a rupee sign on an unconverted USD value. */
export function CurrencyNote() {
  const { colors } = useTheme();
  const { snapshot } = useCurrency();
  const caption = conversionCaption(snapshot);
  return caption ? <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15 }}>{caption}</Text> : null;
}
