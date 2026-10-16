import React, { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Appearance, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SystemUI from "expo-system-ui";
import * as NavigationBar from "expo-navigation-bar";
import { createAppearanceStore, darkColors, lightColors } from "./appearance";
import { createThemeStyles } from "./theme-styles";

function useAppearanceStore() {
  const [store] = useState(() => createAppearanceStore(AsyncStorage, {
    getColorScheme: () => Appearance.getColorScheme(),
    subscribe: (listener) => { const subscription = Appearance.addChangeListener(listener); return () => subscription.remove(); },
    setOverride: (preference) => {
      if (Platform.OS !== "web") Appearance.setColorScheme(preference === "system" ? "unspecified" : preference);
    },
  }));
  useEffect(() => store.start(), [store]);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const colors = state.scheme === "dark" ? darkColors : lightColors;
  const styles = useMemo(() => createThemeStyles(colors), [colors]);
  useEffect(() => { void SystemUI.setBackgroundColorAsync(colors.bg).catch(() => undefined); }, [colors.bg]);
  useEffect(() => { if (Platform.OS === "android") NavigationBar.setStyle(state.scheme); }, [state.scheme]);
  return useMemo(() => ({ ...state, colors, styles, setPreference: store.setPreference }), [state, colors, styles, store]);
}
const ThemeContext = createContext<ReturnType<typeof useAppearanceStore> | null>(null);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useAppearanceStore();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("Campaign theme must be inside ThemeProvider.");
  return value;
}
