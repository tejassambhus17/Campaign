import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useConfig, useRefreshOnFocus } from "../../../../lib/session";
import { api } from "../../../../lib/api";
import { Campaign, money, number } from "../../../../lib/types";
import { audienceCampaign } from "../../../../lib/public-campaign";
import {
  Button,
  ErrorState,
  fonts,
  IconButton,
  Loading,
  Notice,
  PageHeader,
  Picture,
  Screen,
  Text,
  useTheme,
} from "../../../../components/ui";
import { CampaignJourney } from "../../../../features/campaign";

export default function Report() {
  const { colors, styles } = useTheme();
  const config = useConfig();
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
  const audience = c.data ? audienceCampaign(c.data) : null;
  return (
    <Screen>
      <View style={{ gap: 2 }}>
        <Button
          title="Back to campaign"
          variant="ghost"
          icon="arrow-back"
          onPress={() => router.dismissTo(`/explore/${id}`)}
          style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}
        />
        <PageHeader
          title="Campaign report"
          action={
            <IconButton
              label="Refresh campaign report"
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
      ) : !audience ? (
        <Notice tone="error">
          Approved campaign details are unavailable. Refresh before viewing its report.
        </Notice>
      ) : (
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{ width: 64, height: 64, borderRadius: 10, overflow: "hidden" }}
            >
              <Picture uri={audience.coverImage} height={64} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  fontFamily: fonts.semibold,
                  fontSize: 18,
                  lineHeight: 25,
                  color: colors.ink,
                }}
              >
                {audience.title}
              </Text>
              <Text style={styles.muted}>
                {audience.campaignState || audience.status}
              </Text>
            </View>
          </View>
          {audience.revisionPending && (
            <Text style={styles.muted}>
              A private revision exists. This report uses the approved public
              campaign and recorded ledger.
            </Text>
          )}
          {report.isPending ? (
            <Loading />
          ) : report.isError ? (
            <ErrorState error={report.error} retry={() => report.refetch()} />
          ) : (
            <ReportMetrics
              data={report.data || {}}
              campaign={audience}
              refundPolicy={config.data?.policies.refunds}
            />
          )}
        </View>
      )}
    </Screen>
  );
}

function ReportMetrics({
  data: r,
  campaign: c,
  refundPolicy,
}: {
  data: Record<string, unknown>;
  campaign: Campaign;
  refundPolicy?: string;
}) {
  const { colors, styles } = useTheme();
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
        Demo report. Payments and delivery are simulated; no live advertising results are verified.
      </Notice>
      <CampaignJourney campaign={c} report={r} />
      <View style={{ gap: 5 }}>
        <Text accessibilityRole="header" style={styles.h2}>
          Original contribution allocation
        </Text>
        <Text style={styles.muted}>
          Contributions pay for message distribution. These original amounts
          stay visible after refunds. All amounts are USD.
        </Text>
      </View>
      <View
        style={{
          backgroundColor: colors.paper,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.line,
          paddingHorizontal: 16,
        }}
      >
        <Metric
          label="Successful contributions"
          value={currency("raised")}
          description="Original total before included fees or completed refunds."
          prominent
        />
        <Metric
          label="Original included fees"
          value={currency("fees")}
          description="Already included in the contribution total; not an additional payment."
        />
        <Metric
          label="Original advertising allocation"
          value={currency("allocated")}
          description="Original contributions less original included fees, before spend or refunds."
          last
        />
      </View>
      <View style={{ gap: 5 }}>
        <Text accessibilityRole="header" style={styles.h2}>
          Where the funds stand
        </Text>
        <Text style={styles.muted}>
          Spend, retained fees, completed refunds and remaining advertising budget
          account for the original contributions. A refund awaiting completion
          has not been deducted yet.
        </Text>
      </View>
      <View
        style={{
          backgroundColor: colors.paper,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.line,
          paddingHorizontal: 16,
        }}
      >
        <Metric
          label="Simulated advertising spend"
          value={currency("spent")}
          description="Recorded modelled expenditure. No live advertising was purchased."
        />
        <Metric
          label="Platform fees retained"
          value={currency("retainedFees")}
          description={numeric("refundedFees") === null
            ? "The server has not supplied the retained fee breakdown."
            : `${currency("refundedFees")} of the original fees has been refunded. Retained fees may still be included in a pending full refund.`}
        />
        <Metric
          label="Completed simulated refunds"
          value={currency("refunded")}
          description={numeric("refundedAdvertising") === null || numeric("refundedFees") === null
            ? "Completed refunds in the demo ledger. Their advertising/fee split is unavailable."
            : `${currency("refundedAdvertising")} from advertising and ${currency("refundedFees")} from fees. These portions are already included in this refund total.`}
        />
        <Metric
          label="Advertising budget remaining"
          value={currency("remainingAdvertisingBudget")}
          description="Original advertising allocation less simulated spend and completed advertising refunds. Already-refunded funds are not available to spend again."
        />
        <Metric
          label="Contribution records"
          value={count("contributionCount")}
          description="Payment records; backer identities remain private. Guest uniqueness is not measured."
          last
        />
      </View>
      <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={styles.h2}>Refund status</Text>
        <Notice tone={r.refundState === "completed" || r.refundState === "not_due" ? "success" : "info"}>
          {typeof r.refundStatus === "string" ? r.refundStatus : "A current refund status has not been supplied by the server."}
        </Notice>
        {r.refundState === "pending" && (
          <Text style={styles.body}>
            Awaiting simulated refund · {currency("refundPendingAmount")}. This
            is pending, not a completed refund or an additional fund balance.
          </Text>
        )}
        {numeric("unspentBeforeRefund") !== null && (
          <Text style={styles.muted}>
            {currency("unspentBeforeRefund")} of the original advertising
            allocation was unspent before refunds. This includes any advertising
            amount already refunded above; do not add it to the remaining budget.
          </Text>
        )}
        {!!refundPolicy && <Text style={styles.muted}>{refundPolicy}</Text>}
        {numeric("remainingAdvertisingBudget") === null && (
          <Text style={styles.muted}>
            This server does not provide the current balance after refunds.
            Historical unspent figures are not presented as an available balance.
          </Text>
        )}
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
          borderWidth: 1,
          borderColor: colors.line,
          paddingHorizontal: 16,
        }}
      >
        <Metric
          label="Estimated unique reach"
          value={count("estimatedReach")}
          description="Model estimate for the original advertising allocation, before refunds. Not guaranteed delivery."
        />
        <Metric
          label="Simulated reach"
          value={count("simulatedReach")}
          description="Modelled audience in the controlled simulation. These are not measured people."
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
  const { colors, styles } = useTheme();
  return (
    <View
      style={{
        paddingVertical: 13,
        gap: 4,
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
            fontSize: prominent ? 24 : 17,
            lineHeight: prominent ? 31 : 25,
            fontVariant: ["tabular-nums"],
          }}
        >
          {value}
        </Text>
      </View>
      <Text style={[styles.muted, { fontSize: 13, lineHeight: 20 }]}>{description}</Text>
    </View>
  );
}
