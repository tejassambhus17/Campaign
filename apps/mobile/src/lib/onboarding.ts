import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { Platform } from "react-native";
import { APPEARANCE_KEY } from "./appearance";

// Device-level introduction state; identities and drafts stay backend-scoped.
export const ONBOARDING_KEY = "campaign:onboarding:v1";
export type OnboardingState = "restoring" | "welcome" | "complete";
export type OnboardingGate = "loading" | "retry" | "welcome" | "content";
type OnboardingGateInput = {
  ready: boolean;
  onboarding: OnboardingState;
  onboardingError?: string;
  segments: readonly string[];
  hasPendingDestination?: boolean;
};

/** Decide only the ordinary entry gate; never consume a pending destination. */
export function getOnboardingGate({
  ready,
  onboarding,
  onboardingError,
  segments,
  hasPendingDestination = false,
}: OnboardingGateInput): OnboardingGate {
  if (!ready) return "loading";
  if (onboarding === "restoring") return onboardingError ? "retry" : "loading";
  if (onboarding === "complete") return "content";
  const route = segments.filter((segment) => !segment.startsWith("("));
  const isCampaignDestination = route[0] === "explore" && route.length > 1;
  return route[0] === "profile" || isCampaignDestination || hasPendingDestination
    ? "content" : "welcome";
}

/** A legitimate linked task admits browsing for this mount, never persistently. */
export function createOnboardingEntryGate() {
  let admitted = false;
  return (input: OnboardingGateInput): OnboardingGate => {
    const gate = getOnboardingGate({ ...input, hasPendingDestination: admitted || input.hasPendingDestination });
    const route = input.segments.filter((segment) => !segment.startsWith("("));
    if (gate === "content" && input.onboarding === "welcome" && route[0] !== "profile") admitted = true;
    return gate;
  };
}

// Order the entire read/migrate/write transaction with explicit completion.
// An older restoration can never overwrite a later completed choice.
let pending: Promise<unknown> = Promise.resolve();
function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const next = pending.catch(() => undefined).then(operation);
  pending = next;
  return next;
}

async function readOnboarding(
  hasRememberedSession: boolean,
  hasLegacySession: () => Promise<boolean>,
): Promise<Exclude<OnboardingState, "restoring">> {
  const saved = await AsyncStorage.getItem(ONBOARDING_KEY);
  if (saved === "complete" || saved === "welcome") return saved;

  let next: "welcome" | "complete" = "welcome";
  if (saved === null) {
    // Older builds had no onboarding marker. Migrate durable user activity,
    // never the fact that Home happened to mount. Mere reads create no keys.
    const keys = await AsyncStorage.getAllKeys();
    const appearance = await AsyncStorage.getItem(APPEARANCE_KEY);
    const configuredServer = await AsyncStorage.getItem("campaign-api-url");
    const knownAppearance = ["light", "dark", "system"].includes(appearance || "");
    const hasDraftLibrary = keys.some((key) => key.startsWith("campaign-creation-v1:"));
    if (hasRememberedSession || hasDraftLibrary || knownAppearance || configuredServer || await hasLegacySession())
      next = "complete";

    if (next === "welcome" && Platform.OS === "android") {
      try {
        const [installed, updated] = await Promise.all([
          Application.getInstallationTimeAsync(),
          Application.getLastUpdateTimeAsync(),
        ]);
        const firstInstall = installed.getTime();
        const lastUpdate = updated.getTime();
        // PackageInfo timestamps distinguish a legacy in-place update from a
        // fresh install even when an older browsing-only guest saved no state.
        if (Number.isFinite(firstInstall) && firstInstall > 0 &&
          Number.isFinite(lastUpdate) && lastUpdate > firstInstall)
          next = "complete";
      } catch {
        // Unavailable package metadata keeps the existing local-evidence result.
      }
    }
  }

  // Persist the incomplete state before Welcome/Help can create new evidence.
  // A failed write is surfaced by the provider and is safe to retry.
  await AsyncStorage.setItem(ONBOARDING_KEY, next);
  return next;
}

export const restoreOnboarding = (
  hasRememberedSession: boolean,
  hasLegacySession: () => Promise<boolean>,
) => serialize(() => readOnboarding(hasRememberedSession, hasLegacySession));

export const persistOnboardingComplete = () => serialize(() =>
  AsyncStorage.setItem(ONBOARDING_KEY, "complete"));
