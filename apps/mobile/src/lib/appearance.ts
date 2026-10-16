export type AppearancePreference = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";
export const APPEARANCE_KEY = "campaign:appearance:v1";

export function normalizeAppearance(value: unknown): AppearancePreference {
  return value === "light" || value === "dark" ? value : "system";
}
export function resolveAppearance(preference: AppearancePreference, system: unknown): ColorScheme {
  return preference === "system" ? (system === "dark" ? "dark" : "light") : preference;
}
type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> };
type System = { getColorScheme(): unknown; subscribe(listener: () => void): () => void; setOverride(preference: AppearancePreference): void };
export type AppearanceSnapshot = { preference: AppearancePreference; scheme: ColorScheme; ready: boolean; appearanceError: string };

/** Device preference only. This store never reads or writes sessions, drafts or payments. */
export function createAppearanceStore(storage: Storage, system: System) {
  let state: AppearanceSnapshot = { preference: "system", scheme: resolveAppearance("system", system.getColorScheme()), ready: false, appearanceError: "" };
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
        apply("system");
        update({ appearanceError: "Appearance could not be restored. Following your system for now." });
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
  bg: "#F7FAF8", paper: "#FFFFFF", surfaceRaised: "#EEF4F0", ink: "#17221D", text: "#24362B",
  muted: "#52655A", line: "#D5E0D9", outline: "#73867B", green: "#17221D", primary: "#17221D",
  onPrimary: "#FFFFFF", mint: "#E4F3EB", header: "#BCE6D5", headerText: "#17221D", onHeaderMuted: "#375B49",
  orange: "#8D451E", peach: "#F9EFE5", red: "#A82424", errorSurface: "#FCECEC", success: "#216146",
  successSurface: "#E4F3EB", warning: "#795516", warningSurface: "#F7EFD9", focus: "#176541",
  progress: "#287452", progressTrack: "#D4E9DE", subtle: "#EDF3EF", disabledSurface: "#E0E7E2", disabledText: "#596C60",
  overlay: "rgba(5,15,9,0.6)", imageScrim: "rgba(5,15,9,0.62)", onImage: "#FFFFFF",
};
export type ThemeColors = { [K in keyof typeof lightColors]: string };
export const darkColors: ThemeColors = {
  bg: "#000000", paper: "#121212", surfaceRaised: "#1C1C1C", ink: "#F5F5F5", text: "#E5E5E5",
  muted: "#B0B0B0", line: "#303030", outline: "#7D7D7D", green: "#A9DEC7", primary: "#A9DEC7",
  onPrimary: "#111111", mint: "#1E1E1E", header: "#151515", headerText: "#F5F5F5", onHeaderMuted: "#B8B8B8",
  orange: "#F3BB91", peach: "#392D23", red: "#FFB0AD", errorSurface: "#402625", success: "#A9DEC7",
  successSurface: "#1E1E1E", warning: "#E9CF8D", warningSurface: "#383322", focus: "#A9DEC7",
  progress: "#A9DEC7", progressTrack: "#363636", subtle: "#191919", disabledSurface: "#242424", disabledText: "#A3A3A3",
  overlay: "rgba(0,0,0,0.72)", imageScrim: "rgba(5,15,9,0.62)", onImage: "#FFFFFF",
};
