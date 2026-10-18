import { useQuery, CancelledError } from "@tanstack/react-query";
import { api, captureApiSession } from "../../lib/api";
import { useRefreshOnFocus, useSession } from "../../lib/session";
import { CampaignReport, isReportSnapshot } from "../../lib/report";

export function useCampaignReport(id: string, enabled = true) {
  const { user } = useSession();
  const query = useQuery({
    queryKey: ["report", id, user?.id || "guest"],
    enabled,
    queryFn: async () => {
      const current = captureApiSession();
      const report = await api<CampaignReport>(`/campaigns/${id}/report`);
      if (!current()) throw new CancelledError({ silent: true });
      if (!isReportSnapshot(report, id)) throw new Error("The report snapshot is unavailable. Refresh in a moment to load the latest report.");
      return report;
    },
  });
  useRefreshOnFocus(query.refetch, enabled);
  return query;
}
