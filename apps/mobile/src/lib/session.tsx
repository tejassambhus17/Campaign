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
export function Providers({ children }: { children: React.ReactNode }) {
  const authenticationVersion = useRef(0);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const clearExpiredSession = async () => {
      authenticationVersion.current += 1;
      setUser(null);
      queryClient.clear();
      await persistSession(null);
    };
    const unsubscribe = onSessionExpired(clearExpiredSession);
    (async () => {
      try {
        // Public APKs ignore old local/USB overrides without erasing them.
        if (!isCloudBuild) {
          const url = await AsyncStorage.getItem("campaign-api-url");
          if (url) setApiUrl(url);
        }
        const saved = await storage.get();
        if (saved) {
          const parsed = JSON.parse(saved);
          setToken(parsed.token);
          setUser(parsed.user);
          try {
            const me = await api<Me>("/me");
            setUser(me.user);
          } catch {
            // The transport handles an explicit current-session 401. A network
            // failure keeps the saved identity and its device-scoped drafts.
          }
        }
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setReady(true);
      }
    })();
    return unsubscribe;
  }, []);
  async function authenticate(path: string, body: unknown, remember = true) {
    const attempt = ++authenticationVersion.current;
    const sessionCurrent = captureApiSession();
    const current = () => attempt === authenticationVersion.current && sessionCurrent();
    const data = await api<{ token: string; user: User }>(path, {
      method: "POST",
      body,
    });
    let stored: boolean;
    try {
      stored = await persistSession(
        remember ? JSON.stringify(data) : null,
        current,
        () => {
          setToken(data.token);
          setUser(data.user);
          queryClient.clear();
        },
      );
    } catch {
      throw new Error("Could not update the saved sign-in on this device. Please try again.");
    }
    if (!stored) throw new Error("Your sign-in changed. Please try again.");
  }
  const value: Session = {
    user,
    ready,
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
