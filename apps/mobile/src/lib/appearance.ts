export type AppearancePreference = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";
export const APPEARANCE_KEY = "campaign:appearance:v1";

export function normalizeAppearance(value: unknown): AppearancePreference {
  return value === "light" || value === "system" ? value : "dark";
}
export function resolveAppearance(preference: AppearancePreference, system: unknown): ColorScheme {
  return preference === "system" ? (system === "dark" ? "dark" : "light") : preference;
}
type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> };
type System = { getColorScheme(): unknown; subscribe(listener: () => void): () => void; setOverride(preference: AppearancePreference): void };
export type AppearanceSnapshot = { preference: AppearancePreference; scheme: ColorScheme; ready: boolean; appearanceError: string };

/** Device preference only. This store never reads or writes sessions, drafts or payments. */
export function createAppearanceStore(storage: Storage, system: System) {
  let state: AppearanceSnapshot = { preference: "dark", scheme: "dark", ready: false, appearanceError: "" };
  const listeners = new Set<() => void>();
  let revision = 0;
  let restoration: Promise<void> | undefined;
  let writes: Promise<void> = Promise.resolve();
  const update = (next: Partial<AppearanceSnapshot>) => {
    const value = { ...state, ...next };
    if (Object.keys(next).every((key) => value[key as keyof AppearanceSnapshot] === state[key as keyof AppearanceSnapshot])) return;
    state = value;
    listeners.forEach((listener) => listener());
  };
  const apply = (preference: AppearancePreference) => {
    // Set the preference before the native callback, so an explicit choice wins.
    update({ preference, appearanceError: "" });
    system.setOverride(preference);
    update({ scheme: resolveAppearance(preference, system.getColorScheme()) });
  };
  const restore = () => {
    if (restoration) return restoration;
    const initialRevision = revision;
    restoration = storage.getItem(APPEARANCE_KEY).then((saved) => {
      if (revision === initialRevision) apply(normalizeAppearance(saved));
    }).catch(() => {
      if (revision === initialRevision) {
        apply("dark");
        update({ appearanceError: "Appearance could not be restored. Using Dark for now." });
      }
    }).finally(() => update({ ready: true }));
    return restoration;
  };
  const setPreference = async (preference: AppearancePreference) => {
    const currentRevision = ++revision;
    const next = normalizeAppearance(preference);
    apply(next);
    const write = writes.catch(() => undefined).then(() => storage.setItem(APPEARANCE_KEY, next));
    writes = write;
    try { await write; }
    catch (error) {
      if (currentRevision === revision) update({ appearanceError: "Appearance changed, but could not be saved on this device. Try again." });
      throw error;
    }
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    start: () => {
      const unsubscribe = system.subscribe(() => update({ scheme: resolveAppearance(state.preference, system.getColorScheme()) }));
      void restore();
      return unsubscribe;
    },
    restore,
    setPreference,
  };
}

export const fonts = {
  sans: "ManropeRegular", medium: "ManropeMedium", semibold: "ManropeSemiBold", bold: "ManropeBold",
  editorial: "NewsreaderMedium", editorialStrong: "NewsreaderSemiBold",
};
export const lightColors = {
  bg: "#FAFBFC", paper: "#FFFFFF", surfaceRaised: "#F0F3F4", ink: "#111919", text: "#273234",
  muted: "#566269", line: "#E2E7E8", outline: "#7C898C", green: "#103C31", primary: "#103C31",
  onPrimary: "#FFFFFF", mint: "#E9FAF2", header: "#FAFBFC", headerText: "#111919", onHeaderMuted: "#566269",
  orange: "#8D451E", peach: "#F9EFE5", red: "#A82424", errorSurface: "#FCECEC", success: "#216146",
  successSurface: "#E4F3EB", warning: "#795516", warningSurface: "#F7EFD9", focus: "#176541",
  progress: "#16865B", progressTrack: "#E5ECE8", subtle: "#F0F3F4", disabledSurface: "#E6EBE9", disabledText: "#596C60",
  overlay: "rgba(5,15,9,0.6)", imageScrim: "rgba(5,15,9,0.62)", onImage: "#FFFFFF",
};
export type ThemeColors = { [K in keyof typeof lightColors]: string };
export const darkColors: ThemeColors = {
  bg: "#000000", paper: "#121212", surfaceRaised: "#1C1C1C", ink: "#F5F7F6", text: "#E1E6E3",
  muted: "#AEB8B3", line: "#2C302E", outline: "#7D8982", green: "#8EF4C5", primary: "#8EF4C5",
  onPrimary: "#08271D", mint: "#1E1E1E", header: "#000000", headerText: "#F5F7F6", onHeaderMuted: "#AEB8B3",
  orange: "#F3BB91", peach: "#392D23", red: "#FFB0AD", errorSurface: "#402625", success: "#A9DEC7",
  successSurface: "#1E1E1E", warning: "#E9CF8D", warningSurface: "#383322", focus: "#A9DEC7",
  progress: "#8EF4C5", progressTrack: "#303733", subtle: "#191919", disabledSurface: "#242424", disabledText: "#A3A3A3",
  overlay: "rgba(0,0,0,0.72)", imageScrim: "rgba(5,15,9,0.62)", onImage: "#FFFFFF",
};
