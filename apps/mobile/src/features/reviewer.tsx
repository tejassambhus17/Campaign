import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Campaign } from "../lib/types";
import { refresh, useRefreshOnFocus } from "../lib/session";
import { AssessmentEditor } from "./transparency/AssessmentEditor";
import {
  Accordion,
  Button,
  Empty,
  ErrorState,
  Field,
  Loading,
  Notice,
  Text,
  useTheme,
} from "../components/ui";

const exceptionalTargets: Record<string, string[]> = {
  Approved: ["Cancelled"],
  "Available for Funding": ["Cancelled", "Failed"],
  "Funding Goal Reached": ["Cancelled", "Failed"],
  "Funding Period Ends": ["Cancelled", "Failed"],
  "Distribution Preparation": ["Cancelled", "Failed"],
  Promoting: ["Failed"],
  Cancelled: ["Refund Pending"],
  Failed: ["Refund Pending"],
  "Refund Pending": ["Cancelled"],
};

export function Reviewer() {
  const { colors, styles } = useTheme();
  const q = useQuery({
    queryKey: ["review-queue"],
    queryFn: () => api<Campaign[]>("/review-queue"),
  });
  useRefreshOnFocus(q.refetch);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  async function run(c: Campaign, path: string, body: unknown) {
    setBusy(c.id);
    setMessage("");
    setFailed(false);
    try {
      await api(`/campaigns/${c.id}/${path}`, { method: "POST", body });
      await refresh();
      setMessage("Campaign updated. The server recorded this action.");
    } catch (e) {
      setFailed(true);
      setMessage((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 6 }}>
        <Text accessibilityRole="header" style={styles.h2}>
          Review & distribution
        </Text>
        <Text style={styles.muted}>
          Inspect each campaign before taking its next step. Approval, funding
          and distribution are separate decisions.
        </Text>
      </View>
      <Notice>
        Restricted review controls. Decisions are recorded; advertising is simulated.
      </Notice>
      {!!message && (
        <Notice tone={failed ? "error" : "success"}>{message}</Notice>
      )}
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : !q.data.length ? (
        <Empty
          title="No campaigns to review"
          body="Submitted campaigns will appear here for inspection."
        />
      ) : (
        <>
          <Text style={styles.muted}>
            {q.data.filter((c) => c.status === "Submitted for Review").length}{" "}
            awaiting review · {q.data.length} campaigns in this view
          </Text>
          <View>
            {q.data.map((c) => {
              const state = c.campaignState || c.status;
              const revisionBlocked = !!c.revisionPending;
              const targets = exceptionalTargets[state] || [];
              return (
                <Accordion
                  key={c.id}
                  title={`${c.title} · ${c.status}`}
                  initiallyOpen={c.status === "Submitted for Review"}
                  keepMounted
                >
                  <View style={{ gap: 14, paddingTop: 2 }}>
                    <Text style={[styles.muted, { color: colors.green }]}>
                      {state}
                      {c.revisionPending
                        ? ` · private revision: ${c.status}`
                        : ""}
                    </Text>
                    <Button
                      title={c.revisionPending ? "Inspect published campaign" : "Inspect campaign"}
                      variant="secondary"
                      icon="arrow-forward"
                      onPress={() => router.push(`/explore/${c.id}`)}
                    />
                    <AssessmentEditor campaignId={c.id} published={!!c.publishedAt} revisionPending={!!c.revisionPending} />
                    {c.revisionPending && (
                      <Notice>
                        The approved public version remains visible. Delivery
                        changes are paused until this revision is approved and
                        setup is reconfirmed.
                      </Notice>
                    )}
                    {c.revisionPending && c.status === "Draft" && (
                      <Text style={styles.muted}>
                        The creator is still editing. Review actions become
                        available after submission.
                      </Text>
                    )}
                    {c.status === "Submitted for Review" && (
                      <>
                        <Field
                          label="Review feedback"
                          value={notes[c.id] || ""}
                          onChangeText={(v) =>
                            setNotes((current) => ({ ...current, [c.id]: v }))
                          }
                          multiline
                          editable={!busy}
                          placeholder="Explain your decision and any corrections needed."
                        />
                        <Button
                          title="Approve reviewed content"
                          loading={busy === c.id}
                          disabled={!!busy}
                          onPress={() =>
                            run(c, "review", {
                              decision: "approve",
                              feedback:
                                notes[c.id] || "Reviewed for this prototype.",
                            })
                          }
                        />
                        <Button
                          title="Request changes"
                          variant="secondary"
                          disabled={!!busy || !notes[c.id]?.trim()}
                          onPress={() =>
                            run(c, "review", {
                              decision: "changes",
                              feedback: notes[c.id],
                            })
                          }
                        />
                        <Button
                          title="Reject campaign"
                          variant="danger"
                          disabled={!!busy || !notes[c.id]?.trim()}
                          onPress={() =>
                            run(c, "review", {
                              decision: "reject",
                              feedback: notes[c.id],
                            })
                          }
                        />
                      </>
                    )}
                    {state === "Approved" && (
                      <Button
                        title="Make available for funding"
                        loading={busy === c.id}
                        disabled={!!busy || revisionBlocked}
                        onPress={() =>
                          run(c, "transition", {
                            target: "Available for Funding",
                          })
                        }
                      />
                    )}
                    {["Funding Goal Reached", "Funding Period Ends"].includes(
                      state,
                    ) && (
                      <>
                        {state === "Funding Period Ends" && (
                          <Text style={styles.muted}>
                            Preparing distribution explicitly approves the
                            available partial budget. No ads start at this step.
                          </Text>
                        )}
                        <Button
                          title={
                            state === "Funding Period Ends"
                              ? "Approve partial budget & prepare"
                              : "Prepare distribution"
                          }
                          loading={busy === c.id}
                          disabled={!!busy || revisionBlocked}
                          onPress={() =>
                            run(c, "transition", {
                              target: "Distribution Preparation",
                              partialFundingApproved:
                                state === "Funding Period Ends",
                              reason:
                                notes[c.id] ||
                                "Reviewed available partial budget for simulated distribution.",
                            })
                          }
                        />
                      </>
                    )}
                    {state === "Distribution Preparation" && (
                      <>
                        <Text style={styles.muted}>
                          Confirm the approved content, successful payments,
                          budget and advertising setup are ready before
                          starting.
                        </Text>
                        <Button
                          title="Start promotion · demo"
                          loading={busy === c.id}
                          disabled={!!busy || revisionBlocked}
                          onPress={() =>
                            run(c, "transition", {
                              target: "Promoting",
                              setupReady: true,
                            })
                          }
                        />
                      </>
                    )}
                    {state === "Promoting" && (
                      <>
                        {!c.setupReady && (
                          <Text style={styles.muted}>
                            Reconfirm the advertising setup for the latest
                            approved revision before recording progress or
                            completing distribution.
                          </Text>
                        )}
                        <Button
                          title="Reconfirm approved setup"
                          variant="secondary"
                          disabled={
                            !!busy || c.setupReady === true || revisionBlocked
                          }
                          onPress={() =>
                            run(c, "transition", {
                              target: "Promoting",
                              setupReady: true,
                              reason:
                                "Reviewed the approved revision and reconfirmed advertising setup.",
                            })
                          }
                        />
                        <Button
                          title="Record demo progress"
                          variant="secondary"
                          disabled={!!busy || !c.setupReady || revisionBlocked}
                          onPress={() => run(c, "progress", {})}
                        />
                        <Button
                          title="Complete distribution · demo"
                          loading={busy === c.id}
                          disabled={!!busy || !c.setupReady || revisionBlocked}
                          onPress={() =>
                            run(c, "transition", { target: "Completed" })
                          }
                        />
                      </>
                    )}
                    {state === "Available for Funding" && (
                      <Text style={styles.muted}>
                        Funding closes at the goal or deadline. Advertising has
                        not started.
                      </Text>
                    )}
                    {state === "Completed" && (
                      <Text style={styles.muted}>
                        Distribution is complete. The final report includes
                        simulated spend, delivery and unspent-fund refunds.
                      </Text>
                    )}
                    <Button
                      title="View campaign report"
                      variant="ghost"
                      onPress={() => router.push(`/explore/${c.id}/report`)}
                    />
                    {!!targets.length && (
                      <Accordion title="Exceptional campaign outcomes">
                        <Field
                          label="Reason for exceptional outcome"
                          value={notes[c.id] || ""}
                          onChangeText={(v) =>
                            setNotes((current) => ({ ...current, [c.id]: v }))
                          }
                          multiline
                          editable={!busy}
                        />
                        <Text style={styles.muted}>
                          These actions preserve the audit history and disclosed
                          simulated refund policy.
                        </Text>
                        {targets.map((target) => (
                          <Button
                            key={target}
                            title={
                              state === "Refund Pending" &&
                              target === "Cancelled"
                                ? "Complete cancellation & simulated refunds"
                                : `Mark ${target.toLowerCase()}`
                            }
                            variant="ghost"
                            disabled={!!busy || !notes[c.id]?.trim()}
                            onPress={() =>
                              run(c, "transition", {
                                target,
                                reason: notes[c.id],
                              })
                            }
                          />
                        ))}
                      </Accordion>
                    )}
                  </View>
                </Accordion>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}
