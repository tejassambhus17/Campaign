import { useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, captureApiSession } from "../../lib/api";
import { useSession } from "../../lib/session";
import { notificationActionsFor } from "./state";

export function useNotificationActions() {
  const { user, ready } = useSession();
  const client = useQueryClient();
  const actions = notificationActionsFor(
    client,
    ready ? user?.id : undefined,
    captureApiSession,
    (id) => api(`/activity/${encodeURIComponent(id)}/read`, { method: "POST" }),
  );
  const state = useSyncExternalStore(actions.subscribe, actions.getSnapshot, actions.getSnapshot);
  return {
    ...state,
    markRead: actions.markRead,
    markAllRead: actions.markAllRead,
    clearError: actions.clearError,
  };
}
