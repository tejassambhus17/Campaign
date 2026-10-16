import { Notification } from "./types";

export const activityFilters = [
  "All",
  "Unread",
  "Campaigns",
  "Payments",
  "Account",
] as const;
export type ActivityFilter = (typeof activityFilters)[number];

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
  for (const item of notifications) {
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
    return { title: "Account settings", href: "/profile?section=Settings" };
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
    return { title: "Account settings", href: "/profile?section=Settings" };
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
