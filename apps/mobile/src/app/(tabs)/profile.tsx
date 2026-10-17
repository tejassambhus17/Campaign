import { useCurrency } from "../../lib/CurrencyProvider";
import { formatNativeMoney } from "../../lib/currency";
import { CurrencySettings } from "../../features/profile/CurrencySettings";
import { useCallback, useEffect, useState } from "react";
import { AccessibilityInfo, BackHandler, Linking, Pressable, ScrollView, Switch, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, getApiUrl, isCloudBuild, normalizeApiUrl, setApiUrl } from "../../lib/api";
import { Campaign, Config, Me, Payment, estimate, number } from "../../lib/types";
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
  Pill,
  Picture,
  Progress,
  Screen,
  Text,
  useTheme,
} from "../../components/ui";
import { AuthForm } from "../../features/auth";
import { Reviewer } from "../../features/reviewer";
import { ProfilePhoto, ProfilePhotoEditor } from "../../features/profile/Photo";
import { useWalkthrough } from "../../features/walkthrough/Walkthrough";
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

type ProfileSection = "Overview" | "Created" | "Backed" | "Saved" | "Payments" | "Notifications" | "Settings" | "Edit" | "Appearance" | "Help" | "Review";
const sectionTitles: Record<ProfileSection, string> = {
  Overview: "Profile", Created: "My Campaigns", Backed: "Backed Campaigns", Saved: "Saved Campaigns",
  Payments: "Payment History", Notifications: "Notifications", Settings: "Settings", Edit: "Edit Profile",
  Appearance: "Appearance", Help: "Help & Support", Review: "Campaign Review",
};

export default function Profile() {
  const { money, description } = useCurrency();
  const { colors, styles, scheme, preference, ready: appearanceReady, appearanceError } = useTheme();
  const params = useLocalSearchParams<{ section?: string; payment?: string }>();
  const session = useSession();
  const tour = useWalkthrough();
  const me = useMe();
  const campaigns = useCampaigns();
  const config = useConfig();
  const [section, setSection] = useState<ProfileSection>("Overview");
  const [filter, setFilter] = useState("Drafts");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [address, setAddress] = useState(getApiUrl());
  const [name, setName] = useState("");
  const [focusedPayment, setFocusedPayment] = useState<{ id: string; userId: string } | null>(null);
  useEffect(() => {
    if (!message || failed) return;
    AccessibilityInfo.announceForAccessibility(message);
    const timer = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [message, failed]);
  useEffect(() => {
    setMessage("");
    setName("");
    setBusy(false);
    setFocusedPayment(null);
    setSection("Overview");
  }, [session.user?.id]);
  useEffect(() => {
    if (params.section && Object.prototype.hasOwnProperty.call(sectionTitles, params.section)) {
      setSection(params.section as ProfileSection);
      setMessage("");
      if (params.section === "Payments" && params.payment && session.user) {
        setFocusedPayment({ id: params.payment, userId: session.user.id });
      } else setFocusedPayment(null);
      router.setParams({ section: undefined, payment: undefined });
    }
  }, [params.section, params.payment, session.user]);
  const back = useCallback(() => {
    if (focusedPayment) setFocusedPayment(null);
    else setSection("Overview");
    setMessage("");
  }, [focusedPayment]);
  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (section === "Overview") return false;
      back();
      return true;
    });
    return () => sub.remove();
  }, [section, back]));
  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true); setMessage(""); setFailed(false);
    try {
      await action();
      await refresh();
      setMessage(success);
    } catch (e) {
      setFailed(true);
      setMessage((e as Error).message);
    } finally { setBusy(false); }
  }
  function open(next: ProfileSection) {
    setSection(next); setMessage(""); setFocusedPayment(null);
    if (next === "Edit") setName(me.data?.user.name || session.user?.name || "");
    if (session.user) void me.refetch();
    if (next === "Saved" || next === "Backed") void campaigns.refetch();
  }
  const own = me.data?.campaigns || [];
  const successfulCampaignIds = new Set(me.data?.payments.filter(p => p.status === "successful").map(p => p.campaignId));
  const list = section === "Created" ? own.filter(c => groups[filter]?.includes(c.status))
    : section === "Saved" ? (campaigns.data || []).filter(c => me.data?.saved.includes(c.id))
    : section === "Backed" ? (campaigns.data || []).filter(c => successfulCampaignIds.has(c.id)) : [];
  const appearanceLabel = `Appearance settings, ${preference === "system" ? `System, currently ${scheme}` : preference}`;
  const heading = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 48, marginLeft: -10 }}>
      <IconButton label={focusedPayment ? "Back to payment history" : "Back to Profile"} icon="arrow-back" onPress={back} />
      <Text accessibilityRole="header" style={[styles.h2, { fontSize: 21, lineHeight: 29, flex: 1 }]}>{focusedPayment ? "Payment Details" : sectionTitles[section]}</Text>
      {session.user && <IconButton label="Refresh your profile" icon="refresh-outline" loading={me.isFetching} onPress={() => { void refresh(); }} />}
    </View>
  );
  const help = (
    <View style={{ gap: 8 }}>
      <Text style={[styles.muted, { marginBottom: 8 }]}>A little clarity for your next step.</Text>
      <Button title="Take the app tour" variant="secondary" icon="compass-outline" onPress={() => { void (async () => {
        try {
          await session.completeOnboarding();
          back();
          tour.requestReplay();
          router.navigate("/");
        } catch { setFailed(true); setMessage("Could not save your welcome choice. Try again; your current data is unchanged."); }
      })(); }} />
      {Object.entries(information).map(([title, body]) => <Accordion key={title} title={title}>
        {title === "Terms" && config.data ? ["purpose", "fees", "allocation", "refunds", "unspent", "partialFunding"].map(key => config.data.policies[key]).join("\n\n") : body}
      </Accordion>)}
      {!isCloudBuild && (__DEV__ || process.env.EXPO_PUBLIC_INTERNAL_TEST === "1") && <Accordion title="Demo connection settings">
        <Text style={styles.muted}>Use an API address reachable from your device. Switching servers signs you out; saved drafts remain on this device. A standalone build needs a configured backend.</Text>
        <Field label="Backend address" value={address} onChangeText={setAddress} autoCapitalize="none" autoCorrect={false} editable={!busy} />
        <Button title="Save connection & reconnect" loading={busy} onPress={() => run(async () => {
          const next = normalizeApiUrl(address);
          if (next !== getApiUrl()) {
            if (session.user) await session.logout().catch(() => undefined);
            queryClient.clear();
          }
          setApiUrl(next); setAddress(next);
          await AsyncStorage.setItem("campaign-api-url", next);
          await api("/health");
        }, "Backend connection verified.")} />
      </Accordion>}
      {!session.user && <AccountRow icon="settings-outline" title="Settings" onPress={() => open("Settings")} />}
      <Button title="View the product reference" variant="ghost" icon="open-outline" onPress={() => { void Linking.openURL("https://campaign-one-pearl.vercel.app/").catch(() => { setFailed(true); setMessage("The product reference could not be opened. Check your connection and try again."); }); }} />
      <Text style={[styles.muted, { fontSize: 12, textAlign: "center", paddingVertical: 12 }]}>Campaign · Prototype 1.0</Text>
    </View>
  );

  if (!session.ready) return <Screen><Loading /></Screen>;
  if (!session.user) return <Screen scroll={false} androidKeyboardAvoidance={section === "Help"}>
    <View style={{ flex: 1, display: section === "Help" || section === "Settings" ? "none" : "flex" }}>
      <AuthForm active={section !== "Help" && section !== "Settings"} onHelp={() => open("Help")} onModeChange={() => { if (!failed) setMessage(""); }} />
      {(!!message || !!appearanceError) && <View style={{ padding: 16 }}><Notice tone={appearanceError || failed ? "error" : "success"}>{appearanceError || message}</Notice></View>}
    </View>
    {(section === "Help" || section === "Settings") && <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18, gap: 18 }}>
      {heading}{!!message && <Notice tone={failed ? "error" : "success"}>{message}</Notice>}{section === "Settings" ? <View style={{ gap: 20 }}><AppearanceSettings /><CurrencySettings /></View> : help}
    </ScrollView>}
  </Screen>;

  return <Screen key={`${section}:${focusedPayment?.id || ""}`}>
    {section === "Overview" ? <View style={{ gap: 14 }}>
      {(session.onboarding === "welcome" || !!session.onboardingError) && <View style={{ gap: 8 }}>
        <Notice>{session.onboardingError || "You're signed in. Save your welcome preference to continue to Campaign."}</Notice>
        <Button title="Continue to Campaign" loading={busy} onPress={() => { void (async () => {
          if (busy) return;
          setBusy(true); setMessage(""); setFailed(false);
          try { await session.completeOnboarding(); router.replace("/"); }
          catch (error) { setFailed(true); setMessage((error as Error).message); }
          finally { setBusy(false); }
        })(); }} />
      </View>}
      <View style={{ minHeight: 48, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
        <Pressable accessibilityRole="button" accessibilityLabel={appearanceLabel} accessibilityHint="Choose Light, Dark or System appearance." accessibilityState={{ disabled: !appearanceReady }} disabled={!appearanceReady} onPress={() => open("Appearance")}
          style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 12, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: colors.mint, opacity: pressed ? 0.7 : 1 })}>
          <Ionicons name={preference === "system" ? "phone-portrait-outline" : scheme === "dark" ? "moon-outline" : "sunny-outline"} size={18} color={colors.green} />
          <Text style={{ fontSize: 12, lineHeight: 18, fontWeight: "600", color: colors.green }}>{preference === "system" ? "System" : scheme === "dark" ? "Dark" : "Light"}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.green} />
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 3, paddingBottom: 2 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit profile photo" onPress={() => open("Edit")}><ProfilePhoto user={me.data?.user || session.user} /></Pressable>
        <View style={{ flex: 1, gap: 4 }}>
          <Text accessibilityRole="header" style={[styles.h2, { fontSize: 20, lineHeight: 27 }]}>{me.data?.user.name || session.user.name}</Text>
          <Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>{session.user.role === "reviewer" ? "Reviewer · Creator · Backer" : "Creator · Backer · Changemaker"}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" onPress={() => open("Edit")} style={{ minHeight: 48, alignSelf: "flex-start", justifyContent: "center" }}>
            <Text style={{ color: colors.green, fontFamily: fonts.semibold, fontSize: 13 }}>Edit Profile</Text>
          </Pressable>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[{ label: "Campaigns", value: own.length, next: "Created" }, { label: "Backed", value: successfulCampaignIds.size, next: "Backed" }, { label: "Saved", value: me.data?.saved.length || 0, next: "Saved" }].map(metric => (
          <Pressable key={metric.label} accessibilityRole="button" accessibilityLabel={`View ${metric.label.toLowerCase()}`} onPress={() => open(metric.next as ProfileSection)}
            style={({ pressed }) => ({ flex: 1, minHeight: 68, borderRadius: 12, backgroundColor: pressed ? colors.mint : colors.subtle, alignItems: "center", justifyContent: "center", gap: 2, paddingVertical: 8, paddingHorizontal: 3 })}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 18, lineHeight: 25, fontVariant: ["tabular-nums"] }}>{me.data ? number(metric.value) : "—"}</Text>
            <Text style={[styles.muted, { fontSize: 12, lineHeight: 18 }]}>{metric.label}</Text>
          </Pressable>
        ))}
      </View>
      {!!message && <Notice tone={failed ? "error" : "success"}>{message}</Notice>}
      {!!appearanceError && <Notice tone="error">{appearanceError}</Notice>}
      {me.isError && <ErrorState error={me.error} retry={() => me.refetch()} />}
      <View style={{ gap: 1 }}>
        <AccountRow icon="people-outline" title="My Campaigns" onPress={() => open("Created")} />
        <AccountRow icon="heart-outline" title="Backed Campaigns" onPress={() => open("Backed")} />
        <AccountRow icon="card-outline" title="Payment History" onPress={() => open("Payments")} />
        <AccountRow icon="bookmark-outline" title="Saved Campaigns" onPress={() => open("Saved")} />
        <AccountRow icon="notifications-outline" title="Notifications" onPress={() => open("Notifications")} />
        <AccountRow icon="settings-outline" title="Settings" onPress={() => open("Settings")} />
        <AccountRow icon="help-circle-outline" title="Help & Support" onPress={() => open("Help")} />
        {session.user.role === "reviewer" && <AccountRow icon="shield-checkmark-outline" title="Campaign Review" onPress={() => open("Review")} />}
      </View>
    </View> : <>
      {heading}
      {!!message && <Notice tone={failed ? "error" : "success"}>{message}</Notice>}
      {section === "Help" ? help : section === "Appearance" ? <AppearanceSettings /> : section === "Settings" ? <View style={{ gap: 20 }}>
        <AppearanceSettings />
        <CurrencySettings />
        <View>
          <AccountRow icon="person-outline" title="Account details" onPress={() => open("Edit")} />
          <AccountRow icon="notifications-outline" title="Notification preferences" onPress={() => open("Notifications")} />
          <AccountRow icon="help-circle-outline" title="Help, terms & privacy" onPress={() => open("Help")} />
        </View>
        <Text style={styles.muted}>{session.user.email}</Text>
        <Button title="Sign out" variant="secondary" loading={busy} onPress={() => run(() => session.logout(), "Signed out.")} />
        <Text style={[styles.muted, { fontSize: 12, lineHeight: 19 }]}>Your device appearance and currency are kept when you sign out.</Text>
      </View> : section === "Review" ? <Reviewer /> : me.isPending ? <Loading /> : me.isError ? <ErrorState error={me.error} retry={() => me.refetch()} /> : section === "Edit" ? <View style={{ gap: 20 }}>
        <ProfilePhotoEditor key={`${getApiUrl()}:${session.user.id}`} user={me.data.user} />
        <Text style={styles.muted}>Your name appears on the campaigns you create. Backer names stay private by default.</Text>
        <Field label="Display name" value={name} onChangeText={setName} placeholder={me.data.user.name} autoComplete="name" maxLength={150} editable={!busy} />
        <View style={{ gap: 5 }}><Text style={{ fontFamily: fonts.semibold, fontSize: 14 }}>Email address</Text><Text style={styles.muted}>{session.user.email}</Text></View>
        <Button title="Save account details" loading={busy} disabled={!name.trim() || name.trim() === me.data.user.name} onPress={() => run(() => api("/me", { method: "PUT", body: { name: name.trim() } }), "Account details saved.")} />
      </View> : section === "Notifications" ? <View style={{ gap: 18 }}>
        <Text style={styles.muted}>Choose which new updates appear in Activity. Your existing activity stays available.</Text>
        <NotificationPreferences me={me.data} busy={busy} run={run} />
        <Button title="Open Activity" icon="notifications-outline" onPress={() => router.push("/activity")} />
      </View> : section === "Payments" ? <View style={{ gap: 16 }}>
        <Text style={styles.muted}>Simulated payments for message distribution. No real money has moved.</Text>
        <Text style={[styles.muted, { fontSize: 11, lineHeight: 17 }]}>Historical USD records. Preferred-currency figures are current reference equivalents, not the original recorded amount. {description}</Text>
        {focusedPayment?.userId === session.user.id ? <PrivatePayment paymentId={focusedPayment.id} payments={me.data.payments} userId={session.user.id} onClose={() => setFocusedPayment(null)} /> : !me.data.payments.length ? <Empty title="No contributions yet" body="Your contributions and private receipts will appear here." action={<Button title="Explore campaigns" onPress={() => router.push("/explore")} />} /> : me.data.payments.map(p => (
          <View key={p.id} style={{ backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 16, gap: 11 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 12 }}>
              <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "60%", minWidth: 0, gap: 5 }}><Text style={[styles.body, { fontFamily: fonts.semibold }]}>{p.title}</Text><Text style={[styles.muted, { fontSize: 12 }]}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)} · {new Date(p.createdAt).toLocaleDateString()}</Text></View>
              <Text style={[styles.h2, { fontSize: 20, lineHeight: 28, flexShrink: 1, fontVariant: ["tabular-nums"] }]}>{money(p.amount)}</Text>
            </View>
            <Text style={[styles.muted, { fontSize: 13 }]}>Included fee {money(p.fee)} · Advertising {money(p.adBudget)}</Text>
            <Button title={p.receipt ? "Open private receipt" : "Payment details"} variant="secondary" onPress={() => setFocusedPayment({ id: p.id, userId: session.user!.id })} />
            <Button title="Campaign report" variant="ghost" onPress={() => router.push(`/explore/${p.campaignId}/report`)} />
          </View>
        ))}
      </View> : <View style={{ gap: 16 }}>
        {section === "Created" && <><Text style={styles.muted}>{own.length} {own.length === 1 ? "campaign" : "campaigns"} in your account. Drafts also resume from Create.</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>{Object.keys(groups).map(f => <Pill key={f} title={f} selected={filter === f} onPress={() => { setFilter(f); void me.refetch(); }} />)}</ScrollView></>}
        {section !== "Created" && campaigns.isPending ? <Loading /> : section !== "Created" && campaigns.isError ? <ErrorState error={campaigns.error} retry={() => campaigns.refetch()} /> : !list.length ? <Empty title={section === "Created" ? emptyGroupTitles[filter] : `No ${section.toLowerCase()} campaigns yet`} body={section === "Created" ? "Give your next idea a bigger audience. Your saved drafts will be here when you return." : `Explore campaigns to build your ${section.toLowerCase()} collection.`} action={<Button title={section === "Created" ? "Create a campaign" : "Explore campaigns"} onPress={() => router.push(section === "Created" ? "/create" : "/explore")} />} /> : list.map(c => <DashboardCard key={c.id} c={c} config={config.data} busy={busy} owner={c.ownerId === session.user!.id} revision={() => run(async () => { await api(`/campaigns/${c.id}/revision`, { method: "POST" }); router.push(`/create?draft=${c.id}`); }, "Editable revision prepared. The approved public version stays visible until review.")} />)}
      </View>}
    </>}
  </Screen>;
}

function AccountRow({ icon, title, onPress }: { icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; onPress: () => void }) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 15, minHeight: 53, paddingVertical: 10, paddingHorizontal: 9, borderRadius: 9, backgroundColor: pressed ? colors.mint : "transparent" })}>
    <Ionicons name={icon} size={22} color={colors.ink} /><Text style={{ flex: 1, fontSize: 14, lineHeight: 22, fontFamily: fonts.medium }}>{title}</Text><Ionicons name="chevron-forward" size={17} color={colors.muted} />
  </Pressable>;
}

function NotificationPreferences({ me, busy, run }: { me: Me; busy: boolean; run: (action: () => Promise<unknown>, success: string) => Promise<void> }) {
  const { colors, styles } = useTheme();
  return <View>
    {(["campaigns", "payments"] as const).map(category => <View key={category} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, minHeight: 86, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.line }}>
      <View style={{ flex: 1, gap: 5 }}><Text style={[styles.body, { fontFamily: fonts.semibold }]}>{category === "campaigns" ? "Campaign updates" : "Payment updates"}</Text><Text style={[styles.muted, { fontSize: 13, lineHeight: 20 }]}>{category === "campaigns" ? "Reviews, funding and distribution" : "Contribution and refund status"}</Text></View>
      <Switch accessibilityLabel={category === "campaigns" ? "Campaign updates" : "Payment updates"} value={me.preferences.categories[category] !== false} disabled={busy} trackColor={{ false: colors.outline, true: colors.green }} thumbColor={colors.onPrimary} onValueChange={value => { void run(() => api("/me/preferences", { method: "PUT", body: { categories: { [category]: value } } }), `${category === "campaigns" ? "Campaign" : "Payment"} notification preference saved.`); }} />
    </View>)}
    <View style={{ paddingVertical: 18, gap: 6 }}><Text style={[styles.body, { fontFamily: fonts.semibold }]}>Security notices · Always on</Text><Text style={[styles.muted, { fontSize: 13, lineHeight: 21 }]}>In-app delivery is active. Push and email are not connected in this prototype.</Text></View>
  </View>;
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
  const { money, preference: currencyPreference, description } = useCurrency();
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
            <Text style={styles.muted}>Receipt {verified.id} · Original amounts in USD</Text>
            <Text style={styles.muted}>{new Date(verified.createdAt).toLocaleString()}</Text>
            <Text style={styles.body}>Contribution · {formatNativeMoney(verified.amount)+ " USD"}</Text>
            <Text style={styles.body}>Included platform fee · {formatNativeMoney(verified.fee)+ " USD"}</Text>
            <Text style={styles.body}>Original advertising allocation · {formatNativeMoney(verified.adBudget)+ " USD"}</Text>
            <Text style={[styles.h2, { fontSize: 20, lineHeight: 27 }]}>Total simulated payment · {formatNativeMoney(verified.total)+ " USD"}</Text>
            <Text style={styles.muted}>Estimated audience at payment · {number(verified.reach)} people. Model estimate, not guaranteed or measured delivery.</Text>
            {typeof verified.refunded === "number" && (
              <Text style={styles.body}>Completed simulated refund · {formatNativeMoney(verified.refunded)+ " USD"}</Text>
            )}
          </View>
          {currencyPreference === "INR" && <Text style={styles.muted}>Current reference equivalent of the recorded total: {money(verified.total)}. {description}</Text>}
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
  const { money } = useCurrency();
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
