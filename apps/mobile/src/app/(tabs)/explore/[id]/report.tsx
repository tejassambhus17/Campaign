import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useRefreshOnFocus } from "../../../../lib/session";
import { api } from "../../../../lib/api";
import { Campaign, money, number } from "../../../../lib/types";
import {
  Button,
  colors,
  ErrorState,
  fonts,
  Loading,
  Notice,
  PageHeader,
  Screen,
  Text,
  styles,
} from "../../../../components/ui";

export default function Report() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => api<Campaign>(`/campaigns/${id}`),
  });
  const report = useQuery({
    queryKey: ["report", id],
    queryFn: () => api<Record<string, unknown>>(`/campaigns/${id}/report`),
  });
  useRefreshOnFocus(c.refetch);
  useRefreshOnFocus(report.refetch);
  return (
    <Screen>
      <View style={{ gap: 2 }}>
        <Button
          title="Back to campaign"
          variant="ghost"
          icon="arrow-back"
          onPress={() => router.replace(`/explore/${id}`)}
          style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}
        />
        <PageHeader
          title="Campaign report"
          action={
            <Button
              title="Refresh"
              variant="ghost"
              icon="refresh-outline"
              loading={c.isFetching || report.isFetching}
              onPress={() => {
                void c.refetch();
                void report.refetch();
              }}
            />
          }
        />
      </View>
      {c.isPending ? (
        <Loading />
      ) : c.isError ? (
        <ErrorState error={c.error} retry={() => c.refetch()} />
      ) : (
        <View style={{ gap: 14 }}>
          <View style={{ gap: 6 }}>
            <Text
              style={{
                fontFamily: fonts.semibold,
                fontSize: 20,
                lineHeight: 27,
                color: colors.ink,
              }}
            >
              {c.data.title}
            </Text>
            <Text style={styles.muted}>
              {c.data.campaignState || c.data.status}
            </Text>
            {c.data.revisionPending && (
              <Text style={styles.muted}>
                Private revision: {c.data.status}. Funding and delivery below
                reflect the campaign ledger.
              </Text>
            )}
          </View>
          {report.isPending ? (
            <Loading />
          ) : report.isError ? (
            <ErrorState error={report.error} retry={() => report.refetch()} />
          ) : (
            <ReportMetrics data={report.data || {}} campaign={c.data} />
          )}
        </View>
      )}
    </Screen>
  );
}

function ReportMetrics({
  data: r,
  campaign: c,
}: {
  data: Record<string, unknown>;
  campaign: Campaign;
}) {
  const numeric = (key: string) =>
    typeof r[key] === "number" && Number.isFinite(r[key])
      ? (r[key] as number)
      : null;
  const currency = (key: string) =>
    numeric(key) === null ? "Unavailable" : money(numeric(key)!);
  const count = (key: string) =>
    numeric(key) === null ? "Not available yet" : number(numeric(key)!);
  const final = r.final === true;
  return (
    <>
      <Notice>
        Demonstration report. Payments and advertising delivery are simulated.
        Delivery figures are not verified real-world results.
      </Notice>
      <View style={{ gap: 5 }}>
        <Text accessibilityRole="header" style={styles.h2}>
          {final ? "Final funding breakdown" : "Funding breakdown"}
        </Text>
        <Text style={styles.muted}>
          Contributions fund message distribution. All amounts are USD.
        </Text>
      </View>
      <View
        style={{
          backgroundColor: colors.paper,
          borderRadius: 14,
          paddingHorizontal: 16,
        }}
      >
        <Metric
          label="Funds raised"
          value={currency("raised")}
          description="Successful simulated contributions before fees."
          prominent
        />
        <Metric
          label="Platform fees"
          value={currency("fees")}
          description="Included fees recorded for successful contributions."
        />
        <Metric
          label="Advertising budget allocated"
          value={currency("allocated")}
          description="The recorded budget after included fees."
        />
        <Metric
          label="Advertising spend"
          value={currency("spent")}
          description="Simulated expenditure, separate from funds raised."
        />
        <Metric
          label="Simulated refunds"
          value={currency("refunded")}
          description="Refunds recorded in the demo ledger."
        />
        <Metric
          label="Unspent advertising budget"
          value={
            numeric("unspent") === null
              ? "Not calculated yet"
              : currency("unspent")
          }
          description="Handled under the disclosed refund policy."
        />
        <Metric
          label="Successful contributions"
          value={count("contributionCount")}
          description="Payment records; backer identities remain private. Guest uniqueness is not measured."
          last
        />
      </View>
      <View style={{ gap: 5 }}>
        <Text accessibilityRole="header" style={styles.h2}>
          {final ? "Final delivery report" : "Delivery progress"}
        </Text>
        <Text style={styles.muted}>
          Estimates, simulated delivery and measured results are distinct.
        </Text>
      </View>
      <View
        style={{
          backgroundColor: colors.paper,
          borderRadius: 14,
          paddingHorizontal: 16,
        }}
      >
        <Metric
          label="Estimated unique reach"
          value={count("estimatedReach")}
          description="Model estimate based on the funded budget. Not guaranteed."
        />
        <Metric
          label="Simulated reach"
          value={count("simulatedReach")}
          description="People reached in the controlled advertising simulation."
        />
        <Metric
          label="Measured unique reach"
          value={
            numeric("measuredReach") === null
              ? "Unavailable"
              : count("measuredReach")
          }
          description="No live advertising network is connected in this prototype."
        />
        <Metric
          label="Impressions"
          value={count("impressions")}
          description="Simulated ad displays. One person may see more than one."
        />
        <Metric
          label="Clicks"
          value={count("clicks")}
          description="Simulated interactions with the advertising creative."
        />
        <Metric
          label="Campaign duration"
          value={`${numeric("durationDays") ?? c.durationDays} days`}
          description="The proposed delivery period."
          last
        />
      </View>
      <Text style={styles.body}>
        {String(
          r.summary ||
            r.message ||
            (final
              ? "Simulated distribution is complete. Funding and delivery figures remain available for review."
              : "Funding and approval do not start advertising automatically. Distribution requires a separate readiness check."),
        )}
      </Text>
    </>
  );
}

function Metric({
  label,
  value,
  description,
  prominent = false,
  last = false,
}: {
  label: string;
  value: string;
  description: string;
  prominent?: boolean;
  last?: boolean;
}) {
  return (
    <View
      style={{
        paddingVertical: 16,
        gap: 7,
        borderBottomWidth: last ? 0 : 1,
        borderColor: colors.line,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 8,
        }}
      >
        <Text
          style={[styles.body, { flexShrink: 1, fontFamily: fonts.medium }]}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: fonts.bold,
            color: colors.ink,
            fontSize: prominent ? 27 : 18,
            lineHeight: prominent ? 34 : 26,
          }}
        >
          {value}
        </Text>
      </View>
      <Text style={styles.muted}>{description}</Text>
    </View>
  );
}
