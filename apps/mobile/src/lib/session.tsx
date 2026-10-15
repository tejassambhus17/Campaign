import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useFocusEffect } from "expo-router";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { api, onSessionExpired, setToken, setApiUrl } from "./api";
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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
const Context = createContext<Session>(null as unknown as Session);
const storage = {
  get: () =>
    Platform.OS === "web"
      ? AsyncStorage.getItem("campaign-session")
      : SecureStore.getItemAsync("campaign-session"),
  set: (v: string) =>
    Platform.OS === "web"
      ? AsyncStorage.setItem("campaign-session", v)
      : SecureStore.setItemAsync("campaign-session", v),
  remove: () =>
    Platform.OS === "web"
      ? AsyncStorage.removeItem("campaign-session")
      : SecureStore.deleteItemAsync("campaign-session"),
};
// Keep an earlier expiry removal ahead of a subsequent successful sign-in write.
let storageWrite: Promise<void> = Promise.resolve();
function persistSession(value: string | null) {
  const next = storageWrite
    .catch(() => undefined)
    .then(() => (value === null ? storage.remove() : storage.set(value)));
  storageWrite = next;
  return next;
}
export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const clearExpiredSession = async () => {
      setUser(null);
      queryClient.clear();
      await persistSession(null);
    };
    const unsubscribe = onSessionExpired(clearExpiredSession);
    (async () => {
      try {
        const url = await AsyncStorage.getItem("campaign-api-url");
        if (url) setApiUrl(url);
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
  async function authenticate(path: string, body: unknown) {
    const data = await api<{ token: string; user: User }>(path, {
      method: "POST",
      body,
    });
    setToken(data.token);
    setUser(data.user);
    queryClient.clear();
    await persistSession(JSON.stringify(data));
  }
  const value: Session = {
    user,
    ready,
    login: (email, password) =>
      authenticate("/auth/login", { email, password }),
    register: (name, email, password) =>
      authenticate("/auth/register", { name, email, password }),
    logout: async () => {
      try {
        await api("/auth/logout", { method: "POST" });
      } finally {
        setToken(null);
        setUser(null);
        queryClient.clear();
        await persistSession(null);
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
  const { user } = useSession();
  return useQuery({
    queryKey: ["activity", user?.id],
    queryFn: () => api<Notification[]>("/activity"),
    enabled: !!user,
  });
};
