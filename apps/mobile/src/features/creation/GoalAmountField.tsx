import { useState } from "react";
import { View } from "react-native";
import { Button, Text, useTheme } from "../../components/ui";
import { useCurrency } from "../../lib/CurrencyProvider";
import { formatMoney, formatNativeMoney, inputForUsd, moneyInputWithinLimits, MoneyEntryRecord, referenceDescription, restoreMoneyEntry, usdFromInput } from "../../lib/currency";
import { TargetField } from "./FieldTarget";

/** The editor persists USD only. Input text and its reference snapshot stay paired. */
export function GoalAmountField({ value, entry, onChange, editable, error }: { value: number; entry?: MoneyEntryRecord; onChange: (canonicalInput: string, entry: MoneyEntryRecord) => void; editable: boolean; error?: string }) {
  const { styles } = useTheme();
  const currency = useCurrency();
  const entryIdentity = JSON.stringify(entry ?? null);
  const [field, setField] = useState(() => ({
    input: restoreMoneyEntry(entry, value, currency.snapshot),
    upstreamUsd: value,
    upstreamEntry: entryIdentity,
    pending: null as MoneyEntryRecord | null,
  }));
  let current = field;
  if (field.upstreamUsd !== value || field.upstreamEntry !== entryIdentity) {
    // An editor acknowledgement must preserve typed text (including "1.")
    // and its frozen FX context. An explicit account-version replacement is
    // different: reconcile before committing a frame with an obsolete amount.
    const ownAcknowledgement = field.pending?.canonicalUsd === value && JSON.stringify(field.pending) === entryIdentity;
    current = {
      input: ownAcknowledgement ? field.input : restoreMoneyEntry(entry, value, currency.snapshot),
      upstreamUsd: value,
      upstreamEntry: entryIdentity,
      pending: null,
    };
    setField(current);
  }
  const { raw, snapshot } = current.input;
  const converted = usdFromInput(raw, snapshot);
  const withinLimits = moneyInputWithinLimits(raw, snapshot, 0.01, 100000);
  return <View style={{ gap: 6 }}>
    <TargetField compact target="goal" label={`Your funding goal · ${snapshot.currency} *`} keyboardType="decimal-pad" editable={editable} value={raw}
      onChangeText={text => {
        if (!/^\d{0,10}(\.\d{0,2})?$/.test(text)) return;
        const usd = usdFromInput(text, snapshot);
        const valid = moneyInputWithinLimits(text, snapshot, 0.01, 100000);
        const next = { raw: text, canonicalUsd: valid ? usd ?? 0 : 0, snapshot };
        setField({ ...current, input: next, pending: next });
        onChange(!valid || usd === null || usd === 0 ? "" : usd.toFixed(2), next);
      }} placeholder="Enter the goal you choose" error={raw && !withinLimits ? `Enter ${formatMoney(0.01, snapshot)}–${formatMoney(100000, snapshot)} with up to two decimals.` : error}
      hint={editable ? `You choose the goal. Demo limits: ${formatMoney(0.01, snapshot)}–${formatMoney(100000, snapshot)} (USD $0.01–$100,000). Up to two decimals; USD cents are authoritative.` : "Your published goal is locked to protect existing backer expectations. Story and creative changes still require review."} />
    {snapshot.currency === "INR" && <Text style={[styles.muted, { fontSize: 12, lineHeight: 18 }]}>Canonical USD goal: {converted === null ? "Enter an amount" : `${formatNativeMoney(converted)} USD`}. Conversion rounds once to USD cents.</Text>}
    <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>{referenceDescription(snapshot)}</Text>
    {(currency.preference !== snapshot.currency || currency.rate?.date !== snapshot.rate?.date) && editable && <Button title={`Use current ${currency.preference} preference`} variant="ghost" disabled={currency.loading || currency.snapshot.unavailable} onPress={() => { const next = { raw: inputForUsd(value, currency.snapshot), canonicalUsd: value, snapshot: currency.snapshot }; setField({ ...current, input: next, pending: next }); onChange(value ? value.toFixed(2) : "", next); }} />}
  </View>;
}
