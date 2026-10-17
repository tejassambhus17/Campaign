import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFocusEffect } from "expo-router";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  QueryClient,
  QueryClientProvider,
  CancelledError,
  useQuery,
} from "@tanstack/react-query";
import { api, captureApiSession, getSessionStorageKey, isCloudBuild, onSessionExpired, setToken, setApiUrl } from "./api";
import { activityNewestFirst, mergeActivityReadStatus } from "./activity";
import { createSessionWriter } from "./session-storage";
import { OnboardingState, persistOnboardingComplete, restoreOnboarding } from "./onboarding";
import { Campaign, Config, Me, Notification, User } from "./types";
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 10000 },
    mutations: { retry: false },
  },
});
type Session = {
  user: User | null;
  ready: boolean;
  onboarding: OnboardingState;
  onboardingError: string;
  retryOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
const Context = createContext<Session>(null as unknown as Session);
const storage = {
  get: () =>
    Platform.OS === "web"
      ? AsyncStorage.getItem(getSessionStorageKey())
      : SecureStore.getItemAsync(getSessionStorageKey()),
  set: (v: string) =>
    Platform.OS === "web"
      ? AsyncStorage.setItem(getSessionStorageKey(), v)
      : SecureStore.setItemAsync(getSessionStorageKey(), v),
  remove: () =>
    Platform.OS === "web"
      ? AsyncStorage.removeItem(getSessionStorageKey())
      : SecureStore.deleteItemAsync(getSessionStorageKey()),
};
// Keep expiry removals, remembered saves and memory-only sign-ins in order.
const persistSession = createSessionWriter(storage);
function parseSavedSession(saved: string | null): { token: string; user: User } | null {
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    return typeof parsed?.token === "string" && !!parsed.token &&
      typeof parsed?.user?.id === "string" && !!parsed.user.id &&
      typeof parsed.user.name === "string" && typeof parsed.user.email === "string" &&
      typeof parsed.user.role === "string" ? parsed : null;
  } catch { return null; }
}
async function hasLegacySession() {
  // Only migration evidence is read; a local token is never restored into cloud.
  if (getSessionStorageKey() === "campaign-session") return false;
  try {
    const saved = Platform.OS === "web"
      ? await AsyncStorage.getItem("campaign-session")
      : await SecureStore.getItemAsync("campaign-session");
    return !!parseSavedSession(saved);
  } catch { return false; }
}
export function Providers({ children }: { children: React.ReactNode }) {
  const authenticationVersion = useRef(0);
  const hasRememberedSession = useRef(false);
  const onboardingRestoration = useRef<Promise<void> | null>(null);
  const onboardingRevision = useRef(0);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingState>("restoring");
  const [onboardingError, setOnboardingError] = useState("");
  const retryOnboarding = useCallback(() => {
    // Double taps and bootstrap/retry callers share one complete restoration.
    if (onboardingRestoration.current) return onboardingRestoration.current;
    const revision = onboardingRevision.current;
    setOnboardingError("");
    const restoration = restoreOnboarding(hasRememberedSession.current, hasLegacySession)
      .then((next) => {
        if (revision === onboardingRevision.current) setOnboarding(next);
      }, () => {
        if (revision === onboardingRevision.current)
          setOnboardingError("Campaign could not restore its welcome settings on this device. Retry to continue; your saved drafts are unchanged.");
      });
    const settled = restoration.finally(() => {
      if (onboardingRestoration.current === settled) onboardingRestoration.current = null;
    });
    onboardingRestoration.current = settled;
    return settled;
  }, []);
  useEffect(() => {
    let mounted = true;
    const clearExpiredSession = async () => {
      authenticationVersion.current += 1;
      setUser(null);
      queryClient.clear();
      await persistSession(null);
    };
    const unsubscribe = onSessionExpired(clearExpiredSession);
    void (async () => {
      const bootstrapVersion = authenticationVersion.current;
      try {
        // Public APKs ignore old local/USB overrides without erasing them.
        if (!isCloudBuild) {
          const url = await AsyncStorage.getItem("campaign-api-url");
          if (url) setApiUrl(url);
        }
        const parsed = parseSavedSession(await storage.get());
        hasRememberedSession.current = !!parsed;
        await retryOnboarding();
        if (parsed && mounted && bootstrapVersion === authenticationVersion.current) {
          setToken(parsed.token);
          setUser(parsed.user);
          const current = captureApiSession();
          // Local hydration decides startup. A sleeping/offline server must
          // not hold Welcome or public browsing behind its request timeout.
          void api<Me>("/me").then((me) => {
            if (mounted && bootstrapVersion === authenticationVersion.current && current()) setUser(me.user);
          }).catch(() => {
            // The transport handles an explicit current-session 401. A network
            // failure keeps the saved identity and its device-scoped drafts.
          });
        }
      } catch {
        if (mounted && bootstrapVersion === authenticationVersion.current) { setToken(null); setUser(null); }
        await retryOnboarding();
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => { mounted = false; unsubscribe(); };
  }, [retryOnboarding]);
  async function authenticate(path: string, body: unknown, remember = true) {
    const attempt = ++authenticationVersion.current;
    const sessionCurrent = captureApiSession();
    const current = () => attempt === authenticationVersion.current && sessionCurrent();
    const data = await api<{ token: string; user: User }>(path, {
      method: "POST",
      body,
    });
    let stored: boolean;
    if (!current()) throw new Error("Your sign-in changed. Please try again.");
    try {
      stored = await persistSession(
        remember ? JSON.stringify(data) : null,
        current,
        () => {
          setToken(data.token);
          setUser(data.user);
          setOnboarding("complete");
          queryClient.clear();
        },
      );
    } catch {
      throw new Error("Could not update the saved sign-in on this device. Please try again.");
    }
    if (!stored) throw new Error("Your sign-in changed. Please try again.");
    // Session storage wins first. A failed session write cannot prematurely
    // persist Welcome completion; a later preference failure cannot turn a
    // successful sign-in into a misleading authentication failure.
    if (onboarding !== "complete" || onboardingError) {
      const revision = ++onboardingRevision.current;
      try {
        await persistOnboardingComplete();
        if (attempt === authenticationVersion.current && revision === onboardingRevision.current) setOnboardingError("");
      } catch {
        if (attempt === authenticationVersion.current && revision === onboardingRevision.current)
          setOnboardingError("Signed in. Your welcome preference could not be saved on this device. Retry to keep it after restart.");
      }
    }
  }
  const value: Session = {
    user,
    ready,
    onboarding,
    onboardingError,
    retryOnboarding,
    completeOnboarding: async () => {
      if (onboarding === "complete" && !onboardingError) return;
      try {
        onboardingRevision.current += 1;
        await persistOnboardingComplete();
        setOnboarding("complete");
        setOnboardingError("");
      } catch {
        throw new Error("Could not save your welcome choice on this device. Please try again.");
      }
    },
    login: (email, password, remember = true) =>
      authenticate("/auth/login", { email, password }, remember),
    register: (name, email, password) =>
      authenticate("/auth/register", { name, email, password }),
    logout: async () => {
      authenticationVersion.current += 1;
      const current = captureApiSession();
      try {
        await api("/auth/logout", { method: "POST" });
      } finally {
        if (current()) {
          setToken(null);
          setUser(null);
          queryClient.clear();
          await persistSession(null);
        }
      }
    },
  };
  return (
    <QueryClientProvider client={queryClient}>
      <Context.Provider value={value}>{children}</Context.Provider>
    </QueryClientProvider>
  );
}
export const useSession = () => useContext(Context);
export function useRefreshOnFocus(
  refetch: () => Promise<unknown>,
  enabled = true,
) {
  useFocusEffect(
    useCallback(() => {
      if (enabled) void refetch();
    }, [refetch, enabled]),
  );
}
export const useCampaigns = () => {
  const query = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => api<Campaign[]>("/campaigns"),
  });
  useRefreshOnFocus(query.refetch);
  return query;
};
export const useConfig = () =>
  useQuery({ queryKey: ["config"], queryFn: () => api<Config>("/config") });
export const useMe = () => {
  const { user } = useSession();
  const query = useQuery({
    queryKey: ["me", user?.id],
    queryFn: () => api<Me>("/me"),
    enabled: !!user,
  });
  useRefreshOnFocus(query.refetch, !!user);
  return query;
};
export const refresh = () => queryClient.invalidateQueries();
// One recipient-scoped cache drives both the inbox and its tab badge.
export const useActivity = () => {
  const { user, ready } = useSession();
  const key = ["activity", user?.id];
  const renderedSession = captureApiSession();
  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      // A disabled query can still be refetched manually. Guests must never
      // issue the private request, even from a stale refresh callback.
      if (!user || !ready) return [];
      if (!renderedSession()) throw new CancelledError({ silent: true });
      const current = captureApiSession();
      const incoming = await api<Notification[]>("/activity");
      if (!current()) throw new CancelledError({ silent: true });
      return activityNewestFirst(mergeActivityReadStatus(incoming, queryClient.getQueryData<Notification[]>(key)));
    },
    enabled: ready && !!user,
  });
  return { ...query, data: ready && user ? query.data : undefined };
};
