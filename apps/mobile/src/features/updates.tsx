import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Campaign } from "../lib/types";
import { refresh, useRefreshOnFocus, useSession } from "../lib/session";
import {
  Accordion,
  Button,
  ErrorState,
  Field,
  Notice,
  Text,
  useTheme,
} from "../components/ui";
import { AdPreview } from "./creation/Preview";

export function CampaignUpdates({ campaign: c }: { campaign: Campaign }) {
  const { colors, styles } = useTheme();
  const { user } = useSession();
  const q = useQuery({
    queryKey: ["updates", c.id],
    queryFn: () =>
      api<{ id: string; title: string; body: string; createdAt: string }[]>(
        `/campaigns/${c.id}/updates`,
      ),
  });
  useRefreshOnFocus(q.refetch);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const canPublish =
    !!c.publishedAt &&
    !!user &&
    (user.id === c.ownerId || user.role === "reviewer");
  async function publish() {
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      await api(`/campaigns/${c.id}/updates`, {
        method: "POST",
        body: { title, body },
      });
      setTitle("");
      setBody("");
      await refresh();
      setMessage("Update published. Followers can now read it.");
    } catch (e) {
      setFailed(true);
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={{ gap: 16 }}>
      <Text accessibilityRole="header" style={styles.h2}>
        Campaign updates
      </Text>
      {q.isPending ? (
        <View style={[styles.row, { paddingVertical: 12 }]}>
          <ActivityIndicator color={colors.green} />
          <Text style={styles.muted}>Loading updates…</Text>
        </View>
      ) : q.isError ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : q.data.length ? (
        q.data.map((u) => (
          <View
            key={u.id}
            style={{
              paddingBottom: 18,
              gap: 8,
              borderBottomWidth: 1,
              borderColor: colors.line,
            }}
          >
            <Text style={styles.muted}>
              {new Date(u.createdAt).toLocaleDateString()}
            </Text>
            <Text style={[styles.h2, { fontSize: 18, lineHeight: 25 }]}>
              {u.title}
            </Text>
            <Text style={styles.body}>{u.body}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.muted}>
          No updates yet. New messages from the creator will appear here.
        </Text>
      )}
      {canPublish && (
        <Accordion title="Publish a campaign update">
          <Text style={styles.muted}>
            This update will be public and may appear in followers’ activity.
          </Text>
          <Field
            label="Update title"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            editable={!busy}
          />
          <Field
            label="Update message"
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={5000}
            editable={!busy}
          />
          <Button
            title="Publish update"
            disabled={!title.trim() || !body.trim()}
            loading={busy}
            onPress={publish}
          />
        </Accordion>
      )}
      {!!message && <Notice tone={failed ? "error" : "success"}>{message}</Notice>}
      <Accordion title="Advertising creative preview">
        <Text style={styles.muted}>
          Intended advertising placement. This preview does not indicate a live
          advertisement.
        </Text>
        <AdPreview draft={c} placement={c.channels[0]} />
        {!c.adImages.length && (
          <Notice>
            No advertising image supplied. A reviewer must check asset readiness
            before distribution.
          </Notice>
        )}
      </Accordion>
    </View>
  );
}
