import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Switch, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, getApiUrl, normalizeApiUrl, setApiUrl } from "../../lib/api";
import { Campaign, Config, Payment, estimate, money, number } from "../../lib/types";
import { useQuery } from "@tanstack/react-query";
import {
  refresh,
  queryClient,
  useCampaigns,
  useConfig,
  useMe,
  useSession,
} from "../../lib/session";
import {
  Accordion,
  Button,
  Empty,
  ErrorState,
  Field,
  fonts,
  IconButton,
  Loading,
  Notice,
  PageHeader,
  Pill,
  Picture,
  Progress,
  Screen,
  Text,
  useTheme,
} from "../../components/ui";
import { AuthForm } from "../../features/auth";
import { Reviewer } from "../../features/reviewer";
const groups: Record<string, string[]> = {
  Drafts: ["Draft"],
  "Under Review": ["Submitted for Review", "Approved"],
  "Published / Funding": [
    "Available for Funding",
    "Funding Goal Reached",
    "Funding Period Ends",
  ],
  Promoting: ["Distribution Preparation", "Promoting"],
  Completed: ["Completed"],
  "Requires Action": [
    "Changes Requested",
    "Rejected",
    "Cancelled",
    "Refund Pending",
    "Failed",
  ],
};
const emptyGroupTitles: Record<string, string> = {
  Drafts: "No drafts yet",
  "Under Review": "No campaigns under review",
  "Published / Funding": "No published campaigns",
  Promoting: "No campaigns in distribution",
  Completed: "No completed campaigns",
  "Requires Action": "No campaigns need your attention",
};
const information: Record<string, string> = {
  About:
    "Campaign helps important messages travel beyond their creators’ existing networks. Community contributions fund advertising and distribution, not direct donations to the cause.",
  Partners:
    "This prototype has no live advertising distribution partners. Selected social/display placements illustrate where an approved campaign may appear.",
  "How It Works":
    "Create a message with its evidence. A reviewer checks the story, creative and proposed audience. Backers pool contributions for reach. Funding is followed by distribution preparation, promotion and a report.",
  FAQs: "Does this donate to the cause? No. Contributions pay for message distribution. Is reach guaranteed? No. Estimates depend on delivery conditions. Are payments real? All checkout and advertising results in this prototype are simulated.",
  Help: "Browse freely as a guest. Guest drafts save automatically on this device and resume from Create. Sign in to save a copy to your account, upload media or submit for review; account drafts also appear in your dashboard. If an operation fails, keep your draft and retry after reconnecting.",
  Contact:
    "Organizer contact and submission channel are listed in the official brief. No support mailbox is configured for this prototype. For a local demo issue, contact the person who provided the application.",
  Terms:
    "Prototype terms: no real money is collected, and no advertising is purchased. Contributions simulate message amplification. The demo uses a 5% included platform fee and $1–$10,000 contribution limits. Cancelling before promotion refunds all simulated contributions; unspent advertising funds are refunded proportionally. Partial funding requires explicit review approval.",
  Privacy:
    "Public backer names are private by default. Payment and receipt records are available only to the relevant account or private guest receipt capability. Demo sessions are stored securely on native devices; web preview uses browser storage. Do not enter sensitive personal information into campaign stories. No live ad tracking is enabled.",
  "Community Guidelines":
    "Use accurate, respectful messaging and relevant sources. Do not publish private information, harassment or misleading claims. Submitted campaigns require review; material changes require another review before advertising updates.",
};

export default function Profile() {
  const { colors, styles } = useTheme();
  const params = useLocalSearchParams<{ section?: string; payment?: string }>();
  const session = useSession();
  const me = useMe();
  const campaigns = useCampaigns();
  const config = useConfig();
  const [section, setSection] = useState("Created");
  const [filter, setFilter] = useState("Drafts");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [address, setAddress] = useState(getApiUrl());
  const [name, setName] = useState("");
  const [focusedPayment, setFocusedPayment] = useState<{
    id: string;
    userId: string;
  } | null>(null);
  useEffect(() => {
    setMessage("");
    setName("");
    setFocusedPayment(null);
  }, [session.user?.id]);
  useEffect(() => {
    if (params.section === "Payments" || params.section === "Settings") {
      setSection(params.section);
      setMessage("");
      if (params.section === "Payments" && params.payment && session.user) {
        setFocusedPayment({ id: params.payment, userId: session.user.id });
      } else {
        setFocusedPayment(null);
      }
      router.setParams({ section: undefined, payment: undefined });
    }
  }, [params.section, params.payment, session.user]);
  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      await action();
      await refresh();
      setMessage(success);
    } catch (e) {
      setFailed(true);
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const own = me.data?.campaigns || [];
  const list =
    section === "Created"
      ? own.filter((c) => groups[filter]?.includes(c.status))
      : section === "Saved"
        ? (campaigns.data || []).filter((c) => me.data?.saved.includes(c.id))
        : section === "Backed"
          ? (campaigns.data || []).filter((c) =>
              me.data?.payments.some(
                (p) => p.campaignId === c.id && p.status === "successful",
              ),
            )
          : [];
  return (
    <Screen key={`${section}:${focusedPayment?.id || ""}`}>
      <PageHeader
        title="Profile"
        action={
          session.user ? (
            <IconButton
              label="Refresh your profile"
              icon="refresh-outline"
              loading={me.isFetching || campaigns.isFetching}
              onPress={() => {
                void refresh();
              }}
            />
          ) : undefined
        }
      />
      {!!message && <Notice tone={failed ? "error" : "success"}>{message}</Notice>}
      {session.ready && !session.user && <AppearanceSettings />}
      {!session.ready ? (
        <Loading />
      ) : !session.user ? (
        <AuthForm />
      ) : (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              accessible={false}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.mint,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: fonts.bold, color: colors.green, fontSize: 18 }}>
                {(me.data?.user.name || session.user.name)
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part.charAt(0).toUpperCase())
                  .join("")}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.h2, { fontSize: 20, lineHeight: 27 }]}>
                {me.data?.user.name || session.user.name}
              </Text>
              <Text style={[styles.muted, { fontSize: 12 }]}>
                {session.user.role === "reviewer"
                  ? "Reviewer · creator · backer"
                  : "One account to create, back and follow"}
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          >
            {[
              "Created",
              "Backed",
              "Saved",
              "Payments",
              "Settings",
              ...(session.user.role === "reviewer" ? ["Review"] : []),
            ].map((s) => (
              <Pill
                key={s}
                title={s}
                selected={section === s}
                onPress={() => {
                  setSection(s);
                  setFocusedPayment(null);
                  setMessage("");
                  void me.refetch();
                  void campaigns.refetch();
                }}
              />
            ))}
          </ScrollView>
          {section === "Settings" && <AppearanceSettings />}
          {section === "Review" ? (
            <Reviewer />
          ) : me.isPending ? (
            <Loading />
          ) : me.isError ? (
            <ErrorState error={me.error} retry={() => me.refetch()} />
          ) : section === "Settings" ? (
            <View style={{ gap: 20 }}>
              <Text accessibilityRole="header" style={styles.h2}>
                Account settings
              </Text>
              <Text style={styles.muted}>{session.user.email}</Text>
              <Field
                label="Display name"
                value={name}
                onChangeText={setName}
                placeholder={me.data.user.name}
                autoComplete="name"
                maxLength={150}
                editable={!busy}
              />
              <Button
                title="Save account details"
                disabled={busy || !name.trim()}
                onPress={() =>
                  run(
                    () => api("/me", { method: "PUT", body: { name } }),
                    "Account details saved.",
                  )
                }
              />
              <Accordion title="Notification preferences" initiallyOpen>
                <Text style={styles.muted}>
                  Choose which new updates appear in Activity. Existing activity
                  stays available.
                </Text>
                <View style={{ paddingTop: 4 }}>
                  {(["campaigns", "payments"] as const).map((category) => (
                    <View
                      key={category}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        minHeight: 64,
                        borderBottomWidth: 1,
                        borderColor: colors.line,
                      }}
                    >
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text
                          style={[styles.body, { fontFamily: fonts.medium }]}
                        >
                          {category === "campaigns"
                            ? "Campaign updates"
                            : "Payment updates"}
                        </Text>
                        <Text style={styles.muted}>
                          {category === "campaigns"
                            ? "Reviews, funding and distribution"
                            : "Contribution and refund status"}
                        </Text>
                      </View>
                      <Switch
                        accessibilityLabel={
                          category === "campaigns"
                            ? "Campaign updates"
                            : "Payment updates"
                        }
                        value={
                          me.data.preferences.categories[category] !== false
                        }
                        disabled={busy}
                        trackColor={{ false: colors.outline, true: colors.green }}
                        thumbColor={colors.onPrimary}
                        onValueChange={(value) => {
                          void run(
                            () =>
                              api("/me/preferences", {
                                method: "PUT",
                                body: { categories: { [category]: value } },
                              }),
                            `${category === "campaigns" ? "Campaign" : "Payment"} notification preference saved.`,
                          );
                        }}
                      />
                    </View>
                  ))}
                  <View style={{ paddingVertical: 16, gap: 4 }}>
                    <Text style={[styles.body, { fontFamily: fonts.medium }]}>
                      Essential security notices · Always on
                    </Text>
                    <Text style={styles.muted}>
                      In-app delivery is active. Push and email are not
                      connected in this prototype.
                    </Text>
                  </View>
                </View>
              </Accordion>
              <Button
                title="Sign out"
                variant="secondary"
                loading={busy}
                onPress={() => run(() => session.logout(), "Signed out.")}
              />
            </View>
          ) : section === "Payments" ? (
            <View style={{ gap: 16 }}>
              <Text accessibilityRole="header" style={styles.h2}>
                Payment history
              </Text>
              <Text style={styles.muted}>
                Simulated payments for message distribution. No real money has
                moved.
              </Text>
              {focusedPayment?.userId === session.user.id && (
                <PrivatePayment
                  paymentId={focusedPayment.id}
                  payments={me.data.payments}
                  userId={session.user.id}
                  onClose={() => setFocusedPayment(null)}
                />
              )}
              {focusedPayment?.userId === session.user.id ? null : !me.data.payments.length ? (
                <Empty
                  title="No contributions yet"
                  body="Your simulated contributions and private receipts will appear here."
                />
              ) : (
                <View
                  style={{
                    backgroundColor: colors.paper,
                    borderRadius: 14,
                    paddingHorizontal: 16,
                  }}
                >
                  {me.data.payments.map((p, index) => (
                    <View
                      key={p.id}
                      style={{
                        paddingVertical: 18,
                        gap: 10,
                        borderBottomWidth:
                          index === me.data.payments.length - 1 ? 0 : 1,
                        borderColor: colors.line,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: 12,
                        }}
                      >
                        <Text
                          style={[
                            styles.body,
                            { flex: 1, fontFamily: fonts.semibold },
                          ]}
                        >
                          {p.title}
                        </Text>
                        <Text style={[styles.h2, { fontSize: 22, fontVariant: ["tabular-nums"] }]}>
                          {money(p.amount)}
                        </Text>
                      </View>
                      <Text style={styles.muted}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)} ·{" "}
                        {new Date(p.createdAt).toLocaleDateString()}
                      </Text>
                      <Text style={styles.muted}>
                        Included fee {money(p.fee)} · Advertising{" "}
                        {money(p.adBudget)}
                      </Text>
                      <Button
                        title="Campaign report"
                        variant="secondary"
                        onPress={() =>
                          router.push(`/explore/${p.campaignId}/report`)
                        }
                      />
                      {p.receipt && (
                        <Button
                          title="Open private receipt"
                          variant="ghost"
                          onPress={() => setFocusedPayment({ id: p.id, userId: session.user!.id })}
                        />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              <View style={{ gap: 5 }}>
                <Text accessibilityRole="header" style={styles.h2}>
                  {section === "Created"
                    ? "Your campaigns"
                    : `${section} campaigns`}
                </Text>
                {section === "Created" && (
                  <Text style={styles.muted}>
                    {own.length} {own.length === 1 ? "campaign" : "campaigns"}{" "}
                    in your account. Drafts also resume from Create.
                  </Text>
                )}
              </View>
              {section === "Created" && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                >
                  {Object.keys(groups).map((f) => (
                    <Pill
                      key={f}
                      title={f}
                      selected={filter === f}
                      onPress={() => {
                        setFilter(f);
                        void me.refetch();
                      }}
                    />
                  ))}
                </ScrollView>
              )}
              {section !== "Created" && campaigns.isPending ? (
                <Loading />
              ) : section !== "Created" && campaigns.isError ? (
                <ErrorState
                  error={campaigns.error}
                  retry={() => campaigns.refetch()}
                />
              ) : !list.length ? (
                <Empty
                  title={
                    section === "Created"
                      ? emptyGroupTitles[filter]
                      : `No ${section.toLowerCase()} campaigns yet`
                  }
                  body={
                    section === "Created"
                      ? "Create a campaign, then follow each step from your dashboard."
                      : `Explore campaigns to build your ${section.toLowerCase()} collection.`
                  }
                  action={
                    <Button
                      title={
                        section === "Created"
                          ? "Create a campaign"
                          : "Explore campaigns"
                      }
                      onPress={() =>
                        router.push(
                          section === "Created" ? "/create" : "/explore",
                        )
                      }
                    />
                  }
                />
              ) : (
                list.map((c) => (
                  <DashboardCard
                    key={c.id}
                    c={c}
                    config={config.data}
                    busy={busy}
                    owner={c.ownerId === session.user!.id}
                    revision={() =>
                      run(async () => {
                        await api(`/campaigns/${c.id}/revision`, {
                          method: "POST",
                        });
                        router.push(`/create?draft=${c.id}`);
                      }, "Editable revision prepared. The approved public version stays visible until review.")
                    }
                  />
                ))
              )}
            </View>
          )}
        </>
      )}
      <View style={{ gap: 3, paddingTop: 16 }}>
        <Text accessibilityRole="header" style={styles.h2}>
          Information & help
        </Text>
        {Object.entries(information).map(([title, body]) => (
          <Accordion key={title} title={title}>
            {title === "Terms" && config.data
              ? [
                  "purpose",
                  "fees",
                  "allocation",
                  "refunds",
                  "unspent",
                  "partialFunding",
                ]
                  .map((key) => config.data.policies[key])
                  .join("\n\n")
              : body}
          </Accordion>
        ))}
      </View>
      {(__DEV__ || process.env.EXPO_PUBLIC_INTERNAL_TEST === "1") && (
        <Accordion title="Demo connection settings">
          <Text style={styles.muted}>
            Use an API address reachable from your device. Switching servers
            signs you out; saved drafts remain on this device. A standalone
            build needs a configured backend.
          </Text>
          <Field
            label="Backend address"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!busy}
          />
          <Button
            title="Save connection & reconnect"
            loading={busy}
            onPress={() =>
              run(async () => {
                const next = normalizeApiUrl(address);
                if (next !== getApiUrl()) {
                  if (session.user)
                    await session.logout().catch(() => undefined);
                  queryClient.clear();
                }
                setApiUrl(next);
                setAddress(next);
                await AsyncStorage.setItem("campaign-api-url", next);
                await api("/health");
              }, "Backend connection verified.")
            }
          />
        </Accordion>
      )}
      <Text style={styles.muted}>Campaign Amplification · Prototype 1.0</Text>
      <Button
        title="View the product reference"
        variant="ghost"
        icon="open-outline"
        onPress={() => {
          void Linking.openURL("https://campaign-one-pearl.vercel.app/");
        }}
        style={{ alignSelf: "flex-start", paddingHorizontal: 0 }}
      />
    </Screen>
  );
}

function PrivatePayment({
  paymentId,
  payments,
  userId,
  onClose,
}: {
  paymentId: string;
  payments: Payment[];
  userId: string;
  onClose: () => void;
}) {
  const { colors, styles } = useTheme();
  // Only the signed-in account's /me records may open a receipt. The receipt
  // endpoint checks ownership again; its capability token never enters a route.
  const payment = payments.find((item) => item.id === paymentId);
  const receipt = useQuery({
    queryKey: ["receipt", userId, paymentId],
    queryFn: () => api<Payment & { refunded?: number; note?: string }>(
      `/receipts/${encodeURIComponent(paymentId)}`,
    ),
    enabled: payment?.status === "successful" && !!payment.receipt,
  });
  const verified = receipt.data?.id === payment?.id &&
    receipt.data?.campaignId === payment?.campaignId ? receipt.data : null;
  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 4 }}>
        <Text accessibilityRole="header" style={styles.h2}>
          {payment?.status === "successful" ? "Private receipt" : "Payment details"}
        </Text>
        <Text style={styles.muted}>
          Available only to the account that made this contribution.
        </Text>
      </View>
      {!payment ? (
        <Notice tone="error">
          This payment is not available in your account. Refresh your profile or
          return to payment history. No private receipt has been opened.
        </Notice>
      ) : payment.status !== "successful" || !payment.receipt ? (
        <>
          <Text style={styles.body}>{payment.title}</Text>
          <Notice>
            This simulated payment is {payment.status}. A receipt is issued only
            after confirmed success. This attempt has not increased campaign funding.
          </Notice>
          <Text style={styles.body}>Attempted payment · {money(payment.total)}</Text>
        </>
      ) : receipt.isPending ? (
        <View style={{ gap: 8 }}>
          <Text style={styles.muted}>Loading your private receipt…</Text>
          <Loading />
        </View>
      ) : receipt.isError ? (
        <ErrorState error={receipt.error} retry={() => receipt.refetch()} />
      ) : !verified ? (
        <Notice tone="error">
          This receipt could not be verified against your payment. Refresh your profile and try again.
        </Notice>
      ) : (
        <>
          <View style={{ backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 16, gap: 12 }}>
            <Text style={[styles.h2, { fontSize: 18, lineHeight: 25 }]}>{verified.title}</Text>
            <Text style={styles.muted}>Receipt {verified.id}</Text>
            <Text style={styles.muted}>{new Date(verified.createdAt).toLocaleString()}</Text>
            <Text style={styles.body}>Contribution · {money(verified.amount)}</Text>
            <Text style={styles.body}>Included platform fee · {money(verified.fee)}</Text>
            <Text style={styles.body}>Original advertising allocation · {money(verified.adBudget)}</Text>
            <Text style={[styles.h2, { fontSize: 20, lineHeight: 27 }]}>Total simulated payment · {money(verified.total)}</Text>
            <Text style={styles.muted}>Estimated audience at payment · {number(verified.reach)} people. Model estimate, not guaranteed or measured delivery.</Text>
            {typeof verified.refunded === "number" && (
              <Text style={styles.body}>Completed simulated refund · {money(verified.refunded)}</Text>
            )}
          </View>
          <Notice>{verified.note || "Simulated transaction receipt. No real funds moved; this is not a charitable donation receipt."}</Notice>
          <Button
            title="View campaign progress & report"
            variant="secondary"
            onPress={() => router.push(`/explore/${encodeURIComponent(verified.campaignId)}/report`)}
          />
        </>
      )}
      <Button title="Back to payment history" variant="ghost" onPress={onClose} />
    </View>
  );
}

function DashboardCard({
  c,
  config,
  busy,
  owner,
  revision,
}: {
  c: Campaign;
  config?: Config;
  busy: boolean;
  owner: boolean;
  revision: () => void;
}) {
  const { colors, styles } = useTheme();
  const state = c.campaignState || c.status;
  const editable = owner && ["Draft", "Changes Requested"].includes(c.status);
  const activePublished =
    !!c.publishedAt &&
    [
      "Available for Funding",
      "Funding Goal Reached",
      "Funding Period Ends",
      "Distribution Preparation",
      "Promoting",
    ].includes(state);
  const canRevise =
    owner && activePublished && (!c.revisionPending || c.status === "Rejected");
  return (
    <View
      style={{
        backgroundColor: colors.paper,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.line,
        padding: 14,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", gap: 14, alignItems: "flex-start" }}>
        <View style={{ width: 68, borderRadius: 8, overflow: "hidden" }}>
          <Picture uri={c.coverImage} height={76} />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={[styles.h2, { fontSize: 17, lineHeight: 24 }]}>
            {c.title || "Untitled draft"}
          </Text>
          <Text style={[styles.muted, { fontSize: 12, color: colors.green }]}>{state}</Text>
          {c.revisionPending && (
            <Text style={[styles.muted, { color: colors.green }]}>
              Private revision: {c.status}
            </Text>
          )}
        </View>
      </View>
      {c.goal > 0 ? (
        <>
          <Text style={[styles.body, { fontFamily: fonts.semibold, fontVariant: ["tabular-nums"] }]}>
            {money(c.raised)}{" "}
            <Text style={styles.muted}>of {money(c.goal)}</Text>
          </Text>
          <Progress raised={c.raised} goal={c.goal} />
          <Text style={styles.muted}>
            {config
              ? `Est. ${number(estimate(c.goal, config))} people at goal · demo estimate`
              : "Reach estimate unavailable until settings load"}
          </Text>
        </>
      ) : (
        <Text style={styles.muted}>Funding goal is set at Submit.</Text>
      )}
      <Text style={styles.muted}>
        {c.durationDays}-day delivery plan
        {c.deadline
          ? ` · Funding deadline ${new Date(c.deadline).toLocaleDateString()}`
          : ""}
      </Text>
      {!!c.feedback && <Notice>{c.feedback}</Notice>}
      {c.revisionPending && (
        <Text style={styles.muted}>
          The approved public version stays visible while this revision is
          reviewed.
        </Text>
      )}
      <Button
        title={editable ? "Resume & edit draft" : "View campaign"}
        variant={editable ? "primary" : "secondary"}
        onPress={() =>
          router.push(editable ? `/create?draft=${c.id}` : `/explore/${c.id}`)
        }
      />
      {canRevise && (
        <Button
          title={
            c.status === "Rejected"
              ? "Start a fresh revision"
              : "Propose a content update"
          }
          variant="ghost"
          disabled={busy}
          onPress={revision}
        />
      )}
      <Button
        title="Progress & report"
        variant="ghost"
        onPress={() => router.push(`/explore/${c.id}/report`)}
      />
    </View>
  );
}

function AppearanceSettings() {
  const {
    colors,
    styles,
    preference,
    scheme,
    setPreference,
    ready,
    appearanceError,
  } = useTheme();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const choices = [
    { value: "system", title: "System", icon: "phone-portrait-outline" },
    { value: "light", title: "Light", icon: "sunny-outline" },
    { value: "dark", title: "Dark", icon: "moon-outline" },
  ] as const;
  async function change(value: "system" | "light" | "dark") {
    if (saving) return;
    setSaving(true);
    setFeedback("");
    setError("");
    try {
      await setPreference(value);
      setFeedback("Appearance saved on this device.");
    } catch {
      setError("Appearance changed, but could not be saved. Try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <View style={{ gap: 10 }}>
      <View style={{ gap: 3 }}>
        <Text
          accessibilityRole="header"
          style={[styles.h2, { fontSize: 19, lineHeight: 26 }]}
        >
          Appearance
        </Text>
        <Text style={styles.muted}>
          {preference === "system"
            ? `Follows your device · ${scheme === "dark" ? "Dark" : "Light"}`
            : `${preference === "dark" ? "Dark" : "Light"} on this device`}
        </Text>
      </View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Appearance"
        style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
      >
        {choices.map((choice) => {
          const selected = preference === choice.value;
          return (
            <Pressable
              key={choice.value}
              accessibilityRole="radio"
              accessibilityLabel={`${choice.title} appearance`}
              accessibilityState={{ checked: selected, disabled: saving || !ready }}
              disabled={saving || !ready}
              onPress={() => void change(choice.value)}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: 88,
                minHeight: 64,
                paddingVertical: 10,
                paddingHorizontal: 8,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: selected ? colors.green : colors.outline,
                backgroundColor: selected ? colors.mint : colors.paper,
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                opacity: pressed ? 0.75 : saving ? 0.6 : 1,
              })}
            >
              <Ionicons
                name={selected ? "checkmark-circle" : choice.icon}
                size={20}
                color={selected ? colors.green : colors.muted}
              />
              <Text
                style={[
                  styles.body,
                  {
                    fontSize: 14,
                    fontFamily: selected ? fonts.bold : fonts.medium,
                    color: colors.ink,
                    textAlign: "center",
                  },
                ]}
              >
                {choice.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {(saving || !!feedback) && (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.muted, { fontSize: 12 }]}
        >
          {saving ? "Saving appearance…" : feedback}
        </Text>
      )}
      {(!!error || !!appearanceError) && (
        <Notice tone="error">{appearanceError || error}</Notice>
      )}
    </View>
  );
}
