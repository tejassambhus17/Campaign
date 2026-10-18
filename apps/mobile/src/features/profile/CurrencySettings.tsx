import { useState } from "react";
import { Pressable, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button, Text, useTheme } from "../../components/ui";
import { InfoAction } from "../../components/Information";
import { useCurrency } from "../../lib/CurrencyProvider";
import { DisplayCurrency, formatNativeMoney, rateStale, rateUsable } from "../../lib/currency";

export function CurrencySettings() {
  const { colors, styles } = useTheme();
  const currency = useCurrency();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  async function select(value: DisplayCurrency) {
    if (saving) return;
    setSaving(true); setFeedback("");
    try { await currency.setPreference(value); setFeedback("Currency saved on this device."); }
    catch { /* The shared store exposes the honest persistence error. */ }
    finally { setSaving(false); }
  }
  return <View style={{ gap: 10 }}>
    <Text style={[styles.muted, { fontSize: 13, lineHeight: 20 }]}>Choose your display currency. Accounting stays in USD; INR is a reference estimate.</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel="Currency" style={{ gap: 8 }}>
      {([{ value: "USD", title: "US Dollar — USD ($) — default" }, { value: "INR", title: "Indian Rupee — INR (₹)" }] as const).map(choice => <Pressable key={choice.value} accessibilityRole="radio" accessibilityLabel={choice.title} accessibilityState={{ checked: currency.preference === choice.value, disabled: saving || !currency.ready }} disabled={saving || !currency.ready} onPress={() => void select(choice.value)}
        style={({ pressed }) => ({ minHeight: 52, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderRadius: 12, borderColor: currency.preference === choice.value ? colors.primary : colors.line, backgroundColor: pressed ? colors.mint : colors.paper, flexDirection: "row", alignItems: "center", gap: 10 })}>
        <Ionicons name={currency.preference === choice.value ? "radio-button-on" : "radio-button-off"} size={20} color={currency.preference === choice.value ? colors.primary : colors.muted} />
        <Text style={[styles.body, { flex: 1, minWidth: 0, fontSize: 13, lineHeight: 20 }]}>{choice.title}</Text>
      </Pressable>)}
    </View>
    <InfoAction title="Exchange rate details" icon="swap-horizontal-outline" testID="currency-rate-details">
      <Text style={[styles.muted, { fontSize: 12, lineHeight: 18 }]}>{currency.rate && rateUsable(currency.rate) ? `Frankfurter daily reference · ${currency.rate.date}. $1 USD = ${formatNativeMoney(currency.rate.rate, "INR")}. ${rateStale(currency.rate) ? "Cached/stale reference." : "Reference estimate."} Refresh at most daily; cached observations are usable for 7 days. Not a live payment quote.` : currency.preference === "INR" ? "INR conversion unavailable until a recent reference loads. USD remains available and is explicitly labelled." : "USD needs no exchange rate. INR loads a free, anonymous Frankfurter reference when selected."}</Text>
      {currency.preference === "INR" && <Button title="Refresh reference rate" variant="ghost" loading={currency.loading} onPress={() => { void currency.refreshRate(true); }} />}
    </InfoAction>
    {!!currency.error && <Text accessibilityRole="alert" style={[styles.muted, { color: colors.red }]}>{currency.error}</Text>}
    {!!feedback && <Text accessibilityLiveRegion="polite" style={[styles.muted, { color: colors.primary }]}>{feedback}</Text>}
  </View>;
}
