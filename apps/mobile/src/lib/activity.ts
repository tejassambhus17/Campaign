import { Notification } from "./types";

export function notificationBadgeLabel(count: number) {
  if (!Number.isFinite(count) || count < 1) return undefined;
  return count > 99 ? "99+" : String(Math.floor(count));
}

export const activityFilters = [
  "All",
  "Unread",
  "Campaigns",
  "Payments",
  "Account",
] as const;
export type ActivityFilter = (typeof activityFilters)[number];

// Copy before sorting: a notification with the same timestamp keeps its server
// order, and malformed historical timestamps fall after valid ones.
export function activityNewestFirst(notifications: readonly Notification[]) {
  return notifications
    .map((item, index) => ({ item, index, time: Date.parse(item.createdAt) }))
    .sort((a, b) => {
      const first = Number.isNaN(a.time) ? -Infinity : a.time;
      const second = Number.isNaN(b.time) ? -Infinity : b.time;
      return first === second ? a.index - b.index : second - first;
    })
    .map(({ item }) => item);
}

export function recentNotifications(
  notifications: readonly Notification[],
  limit = 5,
) {
  return activityNewestFirst(notifications).slice(0, Math.max(0, limit));
}

// Read status is monotonic in the existing API. A background GET begun before
// a successful POST must not turn a confirmed read back into an unread item.
export function mergeActivityReadStatus(
  incoming: Notification[],
  current?: Notification[],
) {
  const readIds = new Set(current?.filter((item) => item.read).map((item) => item.id));
  return incoming.map((item) =>
    !item.read && readIds.has(item.id) ? { ...item, read: true } : item,
  );
}

export function activitySections(
  notifications: Notification[],
  filter: ActivityFilter,
  now = new Date(),
) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sections = ["Today", "Yesterday", "Earlier"].map((title) => ({
    title,
    data: [] as Notification[],
  }));
  for (const item of activityNewestFirst(notifications)) {
    if (filter === "Unread" && item.read) continue;
    if (filter === "Campaigns" && item.category !== "campaigns") continue;
    if (filter === "Payments" && item.category !== "payments") continue;
    if (filter === "Account" && item.category !== "security") continue;
    const date = new Date(item.createdAt).getTime();
    const index = date >= +today ? 0 : date >= +yesterday ? 1 : 2;
    sections[index].data.push(item);
  }
  return sections.filter((section) => section.data.length);
}

export function activityCategory(category: string) {
  if (category === "payments") return "Payment";
  if (category === "security") return "Account";
  return "Campaign";
}

export function notificationAction(item: Notification) {
  const destination = item.destination;
  const campaignId = destination?.campaignId || item.campaignId;
  const id = campaignId ? encodeURIComponent(campaignId) : "";
  if (destination?.type === "profile") {
    return { title: "Account details", href: "/profile?section=Edit" };
  }
  if (
    destination?.type === "payments" ||
    (!destination && item.category === "payments")
  ) {
    if (destination?.paymentId) {
      return {
        title: "View payment & receipt",
        href: `/profile?section=Payments&payment=${encodeURIComponent(destination.paymentId)}`,
      };
    }
    return { title: "Payment history", href: "/profile?section=Payments" };
  }
  if (destination?.type === "creator" && id) {
    return { title: "Review & edit", href: `/create?draft=${id}&context=review` };
  }
  if (destination?.type === "report" && id) {
    return { title: "View progress & report", href: `/explore/${id}/report` };
  }
  if (!id) {
    return { title: "Account details", href: "/profile?section=Edit" };
  }
  return { title: "Read campaign", href: `/explore/${id}` };
}

export function activityTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

export function activityRelativeTime(value: string, now = new Date()) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp) || Number.isNaN(now.getTime())) return "Date unavailable";
  const seconds = Math.max(0, Math.floor((now.getTime() - timestamp) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(new Date(timestamp).getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}
