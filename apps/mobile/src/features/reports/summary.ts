import type { ReportDocument, ReportRow } from "../../lib/report";

/** A summary never presents a planning estimate as delivered or measured reach. */
export function reportSummary(document: ReportDocument): ReportRow[] {
  const report = document.snapshot;
  const reachKey = report.measuredReach !== null && report.metricAvailability.measuredReach === "measured"
    ? "measuredReach"
    : report.simulatedReach !== null && report.metricAvailability.simulatedReach === "simulated"
      ? "simulatedReach"
      : report.estimatedReach !== null && report.metricAvailability.estimatedReach === "estimated"
        ? "estimatedReach"
        : null;
  const reach = document.results.find(row => row.key === reachKey);
  return [
    { ...document.funding[0], label: "Funds raised" },
    { ...document.balance[0], label: "Ad spending" },
    reach ? { ...reach, label: reachKey === "estimatedReach" ? "Est. reach" : reachKey === "simulatedReach" ? "Simulated reach" : "Measured reach" }
      : { key: "reachUnavailable", label: "Reach", value: "Unavailable", definition: "No classified reach figure has been supplied." },
  ];
}
