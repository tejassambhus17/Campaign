import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, useTheme } from "../components/ui";
import { Campaign } from "../lib/types";
import { campaignJourneyDates } from "../lib/public-campaign";

// Public lifecycle only: no inferred delivery dates or private review history.
export function CampaignJourney({ campaign: c, report }: { campaign: Campaign; report?: Record<string, unknown> }) {
  const { colors, styles } = useTheme();
  const state = c.campaignState || c.status;
  const indices: Record<string, number> = {
    "Available for Funding": 1, "Funding Goal Reached": 1, "Funding Period Ends": 1,
    "Distribution Preparation": 2, Promoting: 3, Completed: 4,
  };
  const current = indices[state] ?? (c.publishedAt ? 1 : 0);
  const exceptional = ["Cancelled", "Rejected", "Failed", "Refund Pending"].includes(state);
  const dates = campaignJourneyDates(c, report);
  const stages = [
    {
      label: "Under review", icon: "reader-outline" as const,
      description: c.publishedAt ? "Reviewed before the campaign opened for backing." : state === "Draft" ? "Submit your draft for the platform to review." : "The platform checks your story, sources and creative.",
    },
    {
      label: "Funding", icon: "cash-outline" as const,
      description: state === "Available for Funding" ? "Your campaign is open for simulated contributions." : state === "Funding Goal Reached" || state === "Funding Period Ends" ? "Funding has closed. Approval and setup come next." : "Eligible campaigns open for public backing.",
      date: dates.find((entry) => entry.label === "Backing opened")?.date,
    },
    { label: "Preparing ads", icon: "images-outline" as const, description: "Approved creative, audience settings and advertising funds are prepared." },
    { label: "Promoting", icon: "megaphone-outline" as const, description: "Your message reaches people through simulated distribution.", date: dates.find((entry) => entry.label === "Promotion began")?.date },
    { label: "Completed", icon: "checkmark-done-outline" as const, description: "See the final report, including results and any unspent funds.", date: dates.find((entry) => entry.label === "Completed")?.date },
  ];
  return (
    <View style={{ gap: 16, paddingVertical: 12 }}>
      <Text accessibilityRole="header" style={[styles.h2, { fontSize: 20, lineHeight: 27 }]}>Campaign journey</Text>
      <Text style={{ fontSize: 12, lineHeight: 18, color: exceptional ? colors.warning : colors.muted }}>Current status · {state}</Text>
      <View accessibilityLabel={`Campaign journey. Current status: ${state}`}>
        {stages.map((stage, index) => {
          const reached = index <= current;
          const active = index === current;
          return (
            <View key={stage.label} style={{ flexDirection: "row", gap: 14 }}>
              <View style={{ width: 38, alignItems: "center" }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: reached ? colors.primary : colors.surfaceRaised }}>
                  <Ionicons name={active && exceptional ? "pause-outline" : stage.icon} size={18} color={reached ? colors.onPrimary : colors.muted} />
                </View>
                {index < stages.length - 1 && <View style={{ flex: 1, minHeight: 25, width: 2, backgroundColor: index < current ? colors.progress : colors.line }} />}
              </View>
              <View style={{ flex: 1, gap: 5, paddingTop: 5, paddingBottom: index < stages.length - 1 ? 25 : 0 }}>
                <Text style={{ fontSize: 15, lineHeight: 21, fontWeight: active ? "700" : "600", color: colors.ink }}>{stage.label}</Text>
                <Text style={{ fontSize: 12, lineHeight: 19, color: colors.muted }}>{stage.description}</Text>
                {!!stage.date && <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>{new Date(stage.date).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</Text>}
              </View>
            </View>
          );
        })}
      </View>
      <Text style={{ ...styles.muted, fontSize: 12, lineHeight: 19 }}>
        {exceptional ? "This campaign is not accepting backing. Open its report for recorded funds and any refunds." : state === "Completed" ? "Distribution is complete. The report separates simulated results from estimates." : "Reaching the funding goal does not start advertising automatically. Distribution requires separate approval and setup."}
      </Text>
    </View>
  );
}
