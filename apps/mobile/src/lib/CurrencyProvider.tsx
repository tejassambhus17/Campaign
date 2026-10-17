import React, { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { createCurrencyStore, DisplayCurrency, formatMoney, freezeMoneySnapshot, referenceDescription } from "./currency";

function useCurrencyStore() {
  const [store] = useState(() => createCurrencyStore(AsyncStorage, async url => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try { const response = await fetch(url, { signal: controller.signal }); const data = await response.json(); return { ok: response.ok, json: async () => data }; } finally { clearTimeout(timer); }
  }));
  useEffect(() => { void store.restore(); }, [store]);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => {
    if (!state.ready || state.preference !== "INR") return;
    const subscription = AppState.addEventListener("change", next => { if (next === "active") void store.refreshRate(); });
    const timer = setInterval(() => { if (AppState.currentState === "active") void store.refreshRate(); }, 60 * 60 * 1000);
    return () => { subscription.remove(); clearInterval(timer); };
  }, [state.preference, state.ready, store]);
  const snapshot = useMemo(() => freezeMoneySnapshot(state.preference, state.rate), [state]);
  return useMemo(() => ({ ...state, snapshot, money: (value: number) => formatMoney(value, snapshot), description: referenceDescription(snapshot), setPreference: store.setPreference, refreshRate: store.refreshRate }), [state, snapshot, store]);
}
const fallback = { preference: "USD" as DisplayCurrency, rate: null, ready: true, loading: false, error: "", snapshot: freezeMoneySnapshot("USD", null), money: (value: number) => formatMoney(value, freezeMoneySnapshot("USD", null)), description: "Campaign accounting remains in USD.", setPreference: async (_value: DisplayCurrency) => {}, refreshRate: async (_force?: boolean) => {} };
const CurrencyContext = createContext<ReturnType<typeof useCurrencyStore>>(fallback);
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const value = useCurrencyStore();
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
export const useCurrency = () => useContext(CurrencyContext);
