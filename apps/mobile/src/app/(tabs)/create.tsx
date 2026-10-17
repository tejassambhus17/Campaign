import { useCurrency } from "../../lib/CurrencyProvider";
import { GoalAmountField } from "../../features/creation/GoalAmountField";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AccessibilityInfo,
  BackHandler,
  findNodeHandle,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Accordion,
  Button,
  Empty,
  Field as BaseField,
  Loading,
  Notice,
  Picture,
  Pill,
  Screen,
  Text,
  useTheme,
} from "../../components/ui";
import { api } from "../../lib/api";
import { detailPath } from "../../features/campaign";
import { refresh, useConfig, useMe, useSession } from "../../lib/session";
import {
  Campaign,
  Section,
  categories,
  estimate,
  number,
  quote,
} from "../../lib/types";
import {
  AdPreview,
  CampaignPreview,
  FundingPolicies,
  StoryPreview,
} from "../../features/creation/Preview";
import {
  Assistance,
  CHANNELS,
  DraftErrors,
  LocalDraft,
  STEPS,
  blankDraft,
  campaignBody,
  newId,
  normalizeDraft,
  validateStep,
} from "../../features/creation/model";
import { useDraftLibrary } from "../../features/creation/useDraftLibrary";
import { CreationTargets, TargetField as BaseTargetField, TargetGroup } from "../../features/creation/FieldTarget";
import { CampaignReviewSummary, CategorySelect, CreationActionDock, CreationButton, CreationProgress, CreationTip, StoryComposer, StoryFormatting } from "../../features/creation/CreationUi";
import { CreationEntry } from "../../features/creation/CreationEntry";
import { DraftDeleteDialog, useDraftDeletion } from "../../features/creation/DraftDeleteDialog";
import { matchesDeletion } from "../../features/creation/draftDeletion";
import { CampaignMediaSections } from "../../features/creation/CampaignMedia";
import { IMAGE_UPLOAD_HINT, uploadedMediaPatch, validatePickedImage } from "../../features/creation/media";
import { DraftIssue, submissionIssues } from "../../features/creation/readiness";
import { SubmissionChecklist } from "../../features/creation/SubmissionChecklist";
import { accountDraftToken, AccountSaveState, draftSaveLabel, localDraftToken, LocalSaveState, mergeAccountSaved, writeLocalSnapshot } from "../../features/creation/persistence";

type ActiveDraft = LocalDraft & { scope: string };
const stepSuccessNotices = {
  upload: "Image uploaded.",
  assistance: "Demo assistance filled the empty fields. Check the suggested category, edit the text, and add public source links. Your funding goal was left for you to set at Submit.",
};
const emptyAssistance: Assistance = {
  idea: "",
  audience: "",
  why: "",
  evidence: "",
  action: "",
};
const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "The operation could not be completed. Your local draft is preserved.";

const Field = (props: React.ComponentProps<typeof BaseField>) => <BaseField compact {...props} />;
const TargetField = (props: React.ComponentProps<typeof BaseTargetField>) => <BaseTargetField compact {...props} />;

const stepDescriptions = [
  "Give your campaign a clear identity.",
  "Share your purpose. Help people connect with your why.",
  "Bring your message to life with a cover and advertising images.",
  "Choose who should hear your message and how it travels.",
  "Almost there. Set your goal and check the details before review.",
];
const stepHeadings = ["Campaign Basics", "Your Story", "Campaign & Ad Visuals", "Set Your Reach", "Review & Submit"];

function EditorAction({
  title,
  onPress,
  disabled = false,
  busy = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 14,
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.paper,
        borderRadius: 24,
        opacity: disabled ? 0.45 : pressed ? 0.65 : 1,
      })}
    >
      {busy ? (
        <ActivityIndicator color={colors.green} />
      ) : (
        <Text
          style={{
            fontSize: 12,
            lineHeight: 18,
            fontWeight: "600",
            color: colors.green,
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

function AssistanceForm({
  values,
  onChange,
  onApply,
}: {
  values: Assistance;
  onChange: (value: Assistance) => void;
  onApply: () => void;
}) {
  const { styles } = useTheme();
  return (
    <View style={{ gap: 16 }}>
      <Notice>
        Guided demo / manual fallback · Live speech recognition and AI services
        are not connected. Type your answers, or use your keyboard’s dictation
        if available. A simple template will organize them into an editable
        draft.
      </Notice>
      <Field
        label="What is your message?"
        multiline
        value={values.idea}
        onChangeText={(idea) => onChange({ ...values, idea })}
        placeholder="Describe the idea in your own words."
      />
      <Field
        label="Who should hear it?"
        value={values.audience}
        onChangeText={(audience) => onChange({ ...values, audience })}
        placeholder="People, interests, and places"
      />
      <Field
        label="Why does this matter?"
        multiline
        value={values.why}
        onChangeText={(why) => onChange({ ...values, why })}
        placeholder="Tell us why this message deserves a wider audience."
      />
      <Field
        label="What evidence or context supports it?"
        multiline
        value={values.evidence}
        onChangeText={(evidence) => onChange({ ...values, evidence })}
        placeholder="Describe your evidence. Add public sources in Story."
      />
      <Field
        label="What could someone do after reading?"
        value={values.action}
        onChangeText={(action) => onChange({ ...values, action })}
        placeholder="For example, read more or start a conversation."
      />
      <Button
        title="Build editable demo draft"
        onPress={onApply}
        disabled={!values.idea.trim()}
        icon="sparkles-outline"
      />
      <Text style={styles.muted}>
        Only empty fields are filled. You can edit or remove every suggestion.
        This assistance never sets your funding goal.
      </Text>
    </View>
  );
}

export default function CreateScreen() {
  const { money } = useCurrency();
  const { colors, styles } = useTheme();
  const local = makeLocalStyles(colors);
  const { fontScale } = useWindowDimensions();
  const { user, ready } = useSession();
  const config = useConfig();
  const me = useMe();
  const params = useLocalSearchParams<{ draft?: string; localDraft?: string; context?: string }>();
  const scope = user?.id || "guest";
  const library = useDraftLibrary(scope, ready);
  const [libraryScope, setLibraryScope] = useState(scope);
  const [active, setActive] = useState<ActiveDraft | null>(null);
  const [guestHandoff, setGuestHandoff] = useState<LocalDraft | null>(null);
  const [mode, setMode] = useState<"entry" | "voice" | "edit" | "submitted">(
    "entry",
  );
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [notice, setNotice] = useState("");
  const [failure, setFailure] = useState("");
  const [serverConflict, setServerConflict] = useState<Campaign | null>(null);
  const [localSaveState, setLocalSaveState] = useState<LocalSaveState>(null);
  const [accountSaveState, setAccountSaveState] = useState<AccountSaveState>("idle");
  const [focusedIssue, setFocusedIssue] = useState<DraftIssue | null>(null);
  const [reviewContext, setReviewContext] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [uploading, setUploading] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [assistance, setAssistance] = useState<Assistance>(emptyAssistance);
  const [placement, setPlacement] = useState("Instagram");
  const [imagePrompt, setImagePrompt] = useState("");
  const [showStoryPreview, setShowStoryPreview] = useState(true);
  const [editingParagraphId, setEditingParagraphId] = useState<string | null>(null);
  const scroll = useRef<ScrollView>(null);
  const content = useRef<View>(null);
  const targets = useRef(new Map<string, { view: View; input?: TextInput | null; announcement?: View | null }>());
  const pendingIssue = useRef<DraftIssue | null>(null);
  const activeRef = useRef(active);
  const scopeRef = useRef(scope);
  const priorScope = useRef(scope);
  const cloudLock = useRef(false);
  const openedParameter = useRef("");
  activeRef.current = active;
  scopeRef.current = scope;
  const saveLocal = library.save;
  const removeLocal = library.remove;
  const canSaveLocal = library.canSave;
  const deletion = useDraftDeletion({
    scope, library,
    disabled: busy || !!uploading || loadingDraft || library.loading || !!library.error,
    onDeleted: (target) => {
      if (activeRef.current && activeRef.current.scope === target.scope && matchesDeletion(activeRef.current, target)) {
        activeRef.current = null;
        setActive(null);
        setMode("entry");
        setPreview(false);
        setAccepted(false);
        setErrors({});
        setLocalSaveState(null);
        setAccountSaveState("idle");
        setServerConflict(null);
        setFocusedIssue(null);
        pendingIssue.current = null;
        openedParameter.current = "";
      }
      setNotice(target.campaignId ? "Account draft and its device copies deleted." : "Device draft deleted.");
      setFailure("");
    },
  });

  useEffect(() => setLibraryScope(scope), [scope]);

  useEffect(() => {
    if (
      scope !== "guest" &&
      priorScope.current === "guest" &&
      activeRef.current?.scope === "guest"
    )
      setGuestHandoff(activeRef.current);
    else if (scope === "guest" || priorScope.current !== "guest")
      setGuestHandoff(null);
    priorScope.current = scope;
    setActive(null);
    setMode("entry");
    setPreview(false);
    setAccepted(false);
    setErrors({});
    setNotice("");
    setFailure("");
    setLocalSaveState(null);
    setAccountSaveState("idle");
    setFocusedIssue(null);
    setReviewContext(false);
    setAssistance(emptyAssistance);
    setBusy(false);
    setUploading("");
    setServerConflict(null);
    openedParameter.current = "";
  }, [scope]);

  useEffect(() => {
    if (
      !active ||
      active.scope !== scope ||
      !canSaveLocal(active) ||
      mode === "submitted" ||
      library.loading
    )
      return;
    const snapshot = active;
    const token = localDraftToken(snapshot);
    const timer = setTimeout(() => {
      if (!canSaveLocal(snapshot)) return;
      void writeLocalSnapshot(snapshot, saveLocal,
        () => canSaveLocal(snapshot) && scopeRef.current === snapshot.scope && !!activeRef.current && localDraftToken(activeRef.current) === token,
        setLocalSaveState,
      ).catch(() => { /* The persistence helper and draft library expose the actual failure. */ });
    }, 250);
    return () => clearTimeout(timer);
  }, [active, scope, mode, library.loading, saveLocal, canSaveLocal]);

  const begin = useCallback(
    (entry?: LocalDraft, voice = false) => {
      if (entry && !canSaveLocal(entry)) return;
      const next: ActiveDraft = entry
        ? { ...entry, draft: normalizeDraft(entry.draft), scope }
        : {
            localId: newId(),
            draft: blankDraft(),
            step: 0,
            goalInput: "",
            updatedAt: new Date().toISOString(),
            scope,
            entryMode: voice ? "voice" : "edit",
          };
      setActive(next);
      setMode(voice || entry?.entryMode === "voice" ? "voice" : "edit");
      setPreview(false);
      setAccepted(false);
      setErrors({});
      setNotice(entry ? "Your saved draft is ready to continue." : "");
      setFailure("");
      setServerConflict(null);
      setAssistance(entry?.assistance || emptyAssistance);
      setImagePrompt("");
      setFocusedIssue(null);
      setAccountSaveState("idle");
      scroll.current?.scrollTo({ y: 0, animated: false });
    },
    [scope, canSaveLocal],
  );

  const loadCloud = useCallback(
    async (id: string) => {
      if (!user) {
        setFailure(
          "Sign in to the account that owns this draft, then open it from Profile.",
        );
        return;
      }
      const operationScope = scope;
      const current = activeRef.current;
      setLoadingDraft(true);
      setFailure("");
      try {
        if (current?.scope === operationScope && mode !== "submitted") {
          try {
            await saveLocal(current);
          } catch {
            throw new Error(
              "Your current draft could not be saved on this device. Retry Save as Draft before opening another campaign.",
            );
          }
        }
        const response = await api<Campaign & { currentStep?: number }>(
          `/campaigns/${encodeURIComponent(id)}`,
        );
        if (scopeRef.current !== operationScope) return;
        if (response.ownerId !== user.id)
          throw new Error("Only the creator can edit this campaign.");
        if (
          [
            "Submitted for Review",
            "Rejected",
            "Cancelled",
            "Refund Pending",
            "Failed",
            "Completed",
          ].includes(response.status)
        )
          throw new Error(
            "This campaign is not currently editable. Open its status and feedback in Profile.",
          );
        const draft = normalizeDraft(response);
        const local =
          mode !== "submitted" &&
          current?.scope === operationScope &&
          current.draft.id === id
            ? current
            : library.entries.find((entry) => entry.draft.id === id);
        // A recovered local version may contain edits that never reached the server.
        if (local) {
          begin({ ...local, draft: { ...local.draft, feedback: response.feedback } });
          if (
            local.draft.version !== undefined &&
            response.version !== local.draft.version
          )
            setServerConflict(draft);
        } else
          begin({
            localId: newId(),
            draft,
            step: Math.min(4, Math.max(0, draft.step || 0)),
            goalInput: draft.goal ? String(draft.goal) : "",
            updatedAt: new Date().toISOString(),
            accountSavedToken: accountDraftToken({ localId: "", draft, step: Math.min(4, Math.max(0, draft.step || 0)), goalInput: draft.goal ? String(draft.goal) : "", updatedAt: "" }),
          });
        if (
          response.status !== "Draft" &&
          response.status !== "Changes Requested"
        )
          setNotice(
            "You are editing a new revision. Material changes require review before the approved campaign or advertising can change.",
          );
      } catch (error) {
        if (scopeRef.current === operationScope) setFailure(message(error));
      } finally {
        if (scopeRef.current === operationScope) setLoadingDraft(false);
      }
    },
    [user, scope, library.entries, begin, mode, saveLocal],
  );

  useFocusEffect(
    useCallback(() => {
      const localId = Array.isArray(params.localDraft)
        ? params.localDraft[0]
        : params.localDraft;
      if (localId) {
        if (
          !ready ||
          libraryScope !== scope ||
          library.loading ||
          loadingDraft
        )
          return;
        if (openedParameter.current === `${scope}:local:${localId}`) return;
        openedParameter.current = `${scope}:local:${localId}`;
        router.setParams({ localDraft: undefined });
        const entry = library.entries.find(
          (value) => value.localId === localId,
        );
        if (!entry) {
          setFailure(
            "This draft is not available in your current workspace. Open a saved draft below.",
          );
          return;
        }
        // Preserve current work before following a Home continuation link.
        const current = activeRef.current;
        if (
          current?.scope === scope &&
          current.localId === entry.localId &&
          mode !== "submitted"
        ) {
          // The live editor may be newer than its 250ms autosave snapshot.
          // A Home continuation for this same draft must never roll it back.
          if (mode === "entry") begin(current);
          return;
        }
        if (
          current?.scope === scope &&
          mode !== "submitted"
        ) {
          void saveLocal(current)
            .then(() => {
              if (scopeRef.current === scope) begin(entry);
            })
            .catch(() => {
              if (scopeRef.current === scope)
                setFailure(
                  "Your current changes could not be saved. Retry Save as Draft before switching drafts.",
                );
            });
        } else begin(entry);
        return;
      }
      const id = Array.isArray(params.draft) ? params.draft[0] : params.draft;
      if (!id) {
        openedParameter.current = "";
        return;
      }
      if (
        !ready ||
        library.loading ||
        loadingDraft ||
        openedParameter.current === `${scope}:${id}`
      )
        return;
      openedParameter.current = `${scope}:${id}`;
      setReviewContext(params.context === "review");
      // Consume this visit's intent while Create is focused. A later notification
      // for the same campaign must reopen the editor after exiting or submitting.
      router.setParams({ draft: undefined, context: undefined });
      void loadCloud(id);
    }, [
      params.localDraft,
      params.draft,
      params.context,
      ready,
      libraryScope,
      library.loading,
      library.entries,
      loadingDraft,
      loadCloud,
      scope,
      begin,
      mode,
      saveLocal,
    ]),
  );

  function change(patch: Partial<Campaign>) {
    setActive((previous) =>
      previous
        ? {
            ...previous,
            draft: { ...previous.draft, ...patch },
            updatedAt: new Date().toISOString(),
          }
        : previous,
    );
    setAccepted(false);
    setErrors({});
    setNotice("");
    setFailure("");
    setFocusedIssue(null);
  }
  const changeStep = useCallback((step: number) => {
    setActive((previous) =>
      previous
        ? { ...previous, step, updatedAt: new Date().toISOString() }
        : previous,
    );
    setErrors({});
    setFailure("");
    setNotice((current) => Object.values(stepSuccessNotices).includes(current) ? "" : current);
    setPreview(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, []);
  const revealTarget = useCallback(() => {
    const issue = pendingIssue.current;
    if (!issue || activeRef.current?.step !== issue.step || !content.current) return;
    const target = targets.current.get(issue.field);
    if (!target) return;
    target.view.measureLayout(content.current, (_x, y) => {
      if (pendingIssue.current?.id !== issue.id) return;
      pendingIssue.current = null;
      scroll.current?.scrollTo({ y: Math.max(0, y + 4), animated: false });
      setTimeout(() => {
        target.input?.focus();
        const announcement = target.announcement && findNodeHandle(target.announcement);
        if (!target.input && announcement) AccessibilityInfo.setAccessibilityFocus(announcement);
        AccessibilityInfo.announceForAccessibility(`${STEPS[issue.step]}. ${issue.title}. ${issue.message}`);
      }, 120);
    }, () => {});
  }, []);
  const registerTarget = useCallback((key: string, view: View | null, input?: TextInput | null, announcement?: View | null) => {
    if (view) targets.current.set(key, { view, input, announcement });
    else targets.current.delete(key);
    if (view && pendingIssue.current?.field === key) requestAnimationFrame(revealTarget);
  }, [revealTarget]);
  function jumpToIssue(issue: DraftIssue) {
    changeStep(issue.step);
    setMode("edit");
    setFocusedIssue(issue);
    pendingIssue.current = issue;
    const current = activeRef.current;
    if (current) setErrors(validateStep(current.draft, issue.step, current.goalInput, accepted));
    setTimeout(revealTarget, 60);
  }
  const localNow = useCallback(async () => {
    const current = activeRef.current;
    if (!current) return;
    if (!canSaveLocal(current)) throw new Error("This draft was deleted or is being deleted. Its old save was ignored.");
    const token = localDraftToken(current);
    await writeLocalSnapshot(current, saveLocal,
      () => canSaveLocal(current) && scopeRef.current === current.scope && !!activeRef.current && localDraftToken(activeRef.current) === token,
      setLocalSaveState,
    );
  }, [saveLocal, canSaveLocal]);
  async function signIn() {
    try {
      await localNow();
      if (!user && activeRef.current) setGuestHandoff(activeRef.current);
      router.push("/profile");
    } catch {
      setFailure(
        "Save your draft on this device before leaving. Retry Save as Draft.",
      );
    }
  }

  async function saveCloud(snapshot: ActiveDraft): Promise<Campaign> {
    if (!canSaveLocal(snapshot)) throw new Error("This draft was deleted or is being deleted. No account save was sent.");
    let content = snapshot.draft;
    if (
      content.id &&
      [
        "Available for Funding",
        "Funding Goal Reached",
        "Funding Period Ends",
        "Distribution Preparation",
        "Promoting",
      ].includes(content.status) &&
      !content.revisionPending
    ) {
      content = normalizeDraft(
        await api<Campaign>(`/campaigns/${content.id}/revision`, {
          method: "POST",
        }),
      );
      // The revision is initialized by the server, while the current editor remains authoritative for the edit.
      content = {
        ...snapshot.draft,
        version: content.version,
        revisionPending: true,
      };
    }
    const saved = await api<Campaign>(
      content.id ? `/campaigns/${content.id}` : "/campaigns",
      {
        method: content.id ? "PUT" : "POST",
        body: {
          ...campaignBody(content, snapshot.step),
          clientDraftId: snapshot.localId,
        },
      },
    );
    return normalizeDraft(saved);
  }

  async function saveDraft() {
    if (!active || cloudLock.current) return;
    const snapshot = active;
    const operationScope = scope;
    cloudLock.current = true;
    setBusy(true);
    setFailure("");
    setNotice("");
    try {
      await localNow();
    } catch {
      setFailure(
        "The latest edits could not be saved on this device. Please retry.",
      );
      cloudLock.current = false;
      if (scopeRef.current === operationScope) setBusy(false);
      return;
    }
    if (scopeRef.current !== operationScope) { cloudLock.current = false; return; }
    if (!user) {
      cloudLock.current = false;
      setBusy(false);
      return;
    }
    setAccountSaveState("saving");
    let accountWritten = false;
    try {
      const saved = await saveCloud(snapshot);
      accountWritten = true;
      if (scopeRef.current !== operationScope) return;
      const next = mergeAccountSaved(snapshot, activeRef.current, saved);
      if (!next) {
        await saveLocal({ ...snapshot, draft: saved, accountSavedToken: accountDraftToken({ ...snapshot, draft: saved }) });
        setAccountSaveState("idle");
        await refresh().catch(() => undefined);
        return;
      }
      setActive(next);
      activeRef.current = next;
      const token = localDraftToken(next);
      await writeLocalSnapshot(next, saveLocal,
        () => scopeRef.current === operationScope && !!activeRef.current && localDraftToken(activeRef.current) === token,
        setLocalSaveState,
      );
      setAccountSaveState("idle");
      await refresh().catch(() => undefined);
    } catch (error) {
      if (scopeRef.current === operationScope && activeRef.current?.localId === snapshot.localId) {
        setAccountSaveState(accountWritten ? "idle" : "failed");
        setFailure(
          accountWritten
            ? `${message(error)} Your account copy was saved, but the latest device save did not finish. Keep this draft open and retry Save as Draft.`
            : `${message(error)} Your current edits remain in your device draft. Retry Save as Draft to sync your account.`,
        );
        if (snapshot.draft.id && message(error).includes("newer draft")) {
          try {
            const latest = await api<Campaign>(
              `/campaigns/${snapshot.draft.id}`,
            );
            if (scopeRef.current === operationScope)
              setServerConflict(normalizeDraft(latest));
          } catch {
            /* The local draft stays recoverable while offline. */
          }
        }
      }
    } finally {
      cloudLock.current = false;
      if (scopeRef.current === operationScope) {
        setBusy(false);
        setAccountSaveState((state) => state === "saving" ? "idle" : state);
      }
    }
  }

  async function submit() {
    if (!active || cloudLock.current) return;
    const firstIssue = submissionIssues(active.draft, active.goalInput, accepted).find((issue) => issue.required);
    if (firstIssue) {
      jumpToIssue(firstIssue);
      return;
    }
    if (!user) {
      try {
        await localNow();
        setNotice("Your draft is saved on this device. Sign in to submit it for review, then resume this draft here.");
      } catch {
        setFailure("This device could not save your draft. Keep it open and retry Save as Draft before signing in.");
      }
      return;
    }
    if (!config.data) {
      setFailure(
        "Load the current funding policies before submitting. Check your connection, then retry.",
      );
      void config.refetch();
      return;
    }
    cloudLock.current = true;
    setBusy(true);
    setFailure("");
    setNotice("");
    const operationScope = scope;
    let savedId = active.draft.id;
    try {
      await localNow();
      const saved = await saveCloud(active);
      savedId = saved.id;
      if (scopeRef.current !== operationScope) return;
      const recoverable = {
        ...active,
        draft: saved,
        updatedAt: new Date().toISOString(),
      };
      setActive(recoverable);
      activeRef.current = recoverable;
      await saveLocal(recoverable);
      const result = await api<Campaign>(`/campaigns/${saved.id}/submit`, {
        method: "POST",
        body: { rulesAccepted: true },
      });
      if (scopeRef.current !== operationScope) return;
      setActive({ ...recoverable, draft: normalizeDraft(result) });
      setMode("submitted");
      setPreview(false);
      await removeLocal(active.localId);
      await refresh();
    } catch (error) {
      if (scopeRef.current !== operationScope) return;
      // A timed-out submission may have succeeded. Confirm server state before offering another submission.
      if (savedId) {
        try {
          const confirmed = await api<Campaign>(`/campaigns/${savedId}`);
          if (confirmed.status === "Submitted for Review") {
            setActive((previous) =>
              previous
                ? { ...previous, draft: normalizeDraft(confirmed) }
                : previous,
            );
            setMode("submitted");
            await removeLocal(active.localId);
            await refresh();
            return;
          }
          if (message(error).includes("newer draft"))
            setServerConflict(normalizeDraft(confirmed));
        } catch {
          /* Preserve the saved draft and report the unconfirmed request. */
        }
      }
      setFailure(
        `${message(error)} Your draft is preserved. If the connection interrupted submission, check Profile for its latest review status before retrying.`,
      );
    } finally {
      cloudLock.current = false;
      if (scopeRef.current === operationScope) setBusy(false);
    }
  }

  async function upload(
    purpose: "cover" | "story" | "advertising",
    sectionId?: string,
  ) {
    if (!active) return;
    if (!user) {
      setNotice(
        "Sign in to upload files to your account. Your local draft is preserved; you can also use a public image URL.",
      );
      return;
    }
    if (uploading) return;
    const operationScope = scope;
    const localId = active.localId;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.9,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const mime = validatePickedImage(asset);
      setUploading(sectionId || purpose);
      setFailure("");
      const form = new FormData();
      if (Platform.OS === "web") {
        const file = asset.file || (await (await fetch(asset.uri)).blob());
        form.append(
          "file",
          file,
          asset.fileName || `campaign-${Date.now()}.${mime.split("/")[1]}`,
        );
      } else
        form.append("file", {
          uri: asset.uri,
          name:
            asset.fileName || `campaign-${Date.now()}.${mime.split("/")[1]}`,
          type: mime,
        } as unknown as Blob);
      form.append("purpose", purpose);
      const uploaded = await api<{ url: string }>("/uploads", {
        method: "POST",
        form,
      });
      if (
        scopeRef.current !== operationScope ||
        activeRef.current?.localId !== localId
      )
        return;
      const current = activeRef.current;
      change(uploadedMediaPatch(current.draft, purpose, uploaded.url, sectionId));
      setNotice(stepSuccessNotices.upload);
    } catch (error) {
      if (scopeRef.current === operationScope) setFailure(message(error));
    } finally {
      if (scopeRef.current === operationScope) setUploading("");
    }
  }

  function applyAssistance() {
    if (!active || !assistance.idea.trim()) return;
    const draft = active.draft;
    const text = assistance.idea.trim();
    const sections: Section[] = draft.sections.length
      ? draft.sections
      : [
          ...(assistance.why.trim()
            ? [
                {
                  id: newId(),
                  kind: "text" as const,
                  text: assistance.why.trim(),
                  format: "normal",
                },
              ]
            : []),
          ...(assistance.evidence.trim()
            ? [
                {
                  id: newId(),
                  kind: "heading" as const,
                  text: "Evidence and context",
                },
                {
                  id: newId(),
                  kind: "text" as const,
                  text: assistance.evidence.trim(),
                  format: "normal",
                },
              ]
            : []),
          ...(assistance.action.trim()
            ? [
                {
                  id: newId(),
                  kind: "action" as const,
                  text: assistance.action.trim(),
                },
              ]
            : []),
        ];
    const lower = text.toLowerCase();
    const suggestedCategory = /school|learn|teach|education/.test(lower)
      ? "Education"
      : /forest|ocean|climate|environment|park/.test(lower)
        ? "Environment"
        : /health|care|wellbeing/.test(lower)
          ? "Health"
          : "Community";
    change({
      title: draft.title || text.split(/[.!?\n]/)[0].slice(0, 60),
      summary: draft.summary || text.slice(0, 2000),
      category: draft.category || suggestedCategory,
      creatorName: draft.creatorName || user?.name || "",
      storyHeadline:
        draft.storyHeadline || text.split(/[.!?\n]/)[0].slice(0, 200),
      intro: draft.intro || text,
      interests: draft.interests || assistance.audience,
      sections,
    });
    setActive((previous) =>
      previous ? { ...previous, entryMode: "edit" } : previous,
    );
    setMode("edit");
    setNotice(stepSuccessNotices.assistance);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  function updateAssistance(values: Assistance) {
    setAssistance(values);
    setActive((previous) =>
      previous
        ? {
            ...previous,
            assistance: values,
            updatedAt: new Date().toISOString(),
          }
        : previous,
    );
  }
  function manualMode() {
    setMode("edit");
    setActive((previous) =>
      previous
        ? {
            ...previous,
            entryMode: "edit",
            updatedAt: new Date().toISOString(),
          }
        : previous,
    );
  }

  function updateSection(id: string, patch: Partial<Section>) {
    if (active)
      change({
        sections: active.draft.sections.map((section) =>
          section.id === id ? { ...section, ...patch } : section,
        ),
      });
  }
  function moveSection(index: number, direction: -1 | 1) {
    if (!active) return;
    const sections = [...active.draft.sections];
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    [sections[index], sections[target]] = [sections[target], sections[index]];
    change({ sections });
  }
  function toggleChannel(channel: string) {
    if (!active) return;
    const channels = active.draft.channels.includes(channel)
      ? active.draft.channels.filter((item) => item !== channel)
      : [...active.draft.channels, channel];
    const allocation: Record<string, number> = {};
    channels.forEach((item, index) => {
      allocation[item] =
        index === channels.length - 1
          ? 100 - Math.floor(100 / channels.length) * (channels.length - 1)
          : Math.floor(100 / channels.length);
    });
    change({ channels, allocation });
  }

  const working = active?.scope === scope ? active : null;
  const draft = working?.draft;
  useEffect(() => setEditingParagraphId(null), [working?.localId]);
  const primaryParagraph = draft?.sections.find((section) => section.kind === "text" && section.id === editingParagraphId) || draft?.sections.find((section) => section.kind === "text");
  const primaryParagraphIndex = primaryParagraph ? draft!.sections.findIndex((section) => section.id === primaryParagraph.id) : -1;
  function editPrimaryParagraph(patch: Partial<Section>) {
    if (!draft) return;
    if (primaryParagraph) updateSection(primaryParagraph.id, patch);
    else {
      const id = newId();
      setEditingParagraphId(id);
      change({ sections: [...draft.sections, { id, kind: "text", text: "", format: "normal", ...patch }] });
    }
  }
  const saveStatus = working ? draftSaveLabel(working, localSaveState, accountSaveState, !!user) : "";
  const step = working?.step || 0;
  const locked = busy || !!uploading;
  const goBack = useCallback(() => {
    if (preview) {
      setPreview(false);
      scroll.current?.scrollTo({ y: 0, animated: false });
    } else if (mode !== "voice" && step > 0) {
      changeStep(step - 1);
    } else {
      void localNow()
        .then(() => setMode("entry"))
        .catch(() => setFailure("Please retry saving before leaving."));
    }
  }, [preview, mode, step, changeStep, localNow]);
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (!working || mode === "entry" || mode === "submitted")
            return false;
          if (!locked) goBack();
          return true;
        },
      );
      return () => subscription.remove();
    }, [working, mode, locked, goBack]),
  );
  const fundingLocked =
    !!draft?.revisionPending ||
    [
      "Available for Funding",
      "Funding Goal Reached",
      "Funding Period Ends",
      "Distribution Preparation",
      "Promoting",
    ].includes(draft?.status || "");
  const channels = config.data?.channels || CHANNELS;
  const fundingQuote = quote(draft?.goal || 0, config.data);
  const savedCloud = (me.data?.campaigns || []).filter(
    (campaign) =>
      ["Draft", "Changes Requested"].includes(campaign.status) &&
      !library.entries.some((entry) => entry.draft.id === campaign.id),
  );
  const editorActions = working &&
    mode !== "entry" &&
    mode !== "submitted" &&
    !preview && (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <EditorAction
          title="Save Draft"
          onPress={() => {
            void saveDraft();
          }}
          disabled={!!uploading}
          busy={busy}
        />
        {mode !== "voice" && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Preview campaign"
            accessibilityState={{ disabled: locked }}
            disabled={locked}
            onPress={() => {
              setPreview(true);
              scroll.current?.scrollTo({ y: 0, animated: false });
            }}
            style={({ pressed }) => ({ width: 48, height: 48, alignItems: "center", justifyContent: "center", opacity: locked ? 0.45 : pressed ? 0.65 : 1 })}
          ><Ionicons name="eye-outline" size={21} color={colors.muted} /></Pressable>
        )}
      </View>
    );

  return (
    <Screen scroll={false}>
      <DraftDeleteDialog deletion={deletion} />
      <View style={local.frame}>
        <View style={local.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {working && mode !== "entry" && mode !== "submitted" && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={preview ? "Return to editing" : step > 0 && mode !== "voice" ? `Back to ${STEPS[step - 1]}` : "Return to saved drafts"}
                disabled={locked}
                onPress={goBack}
                style={[local.iconButton, { marginLeft: -8 }]}
              >
                <Ionicons name="arrow-back" size={21} color={colors.ink} />
              </Pressable>
            )}
            <View style={{ flex: 1, gap: 2 }}>
              {!(working && mode === "edit" && !preview) && <Text
                accessibilityRole="header"
                style={[local.editorTitle, mode === "entry" && { fontSize: 22, lineHeight: 29 }]}
              >
                {mode === "submitted"
                  ? "Submitted for review"
                  : mode === "entry"
                    ? "Create campaign"
                    : preview
                      ? "Preview"
                      : mode === "voice"
                        ? "Guided draft"
                        : ""}
              </Text>}
            </View>
            {editorActions}
          </View>
          {working && mode !== "entry" && mode !== "submitted" && (
            <>
              <CreationProgress step={step} />
              <Text accessibilityLiveRegion="polite" style={{ fontSize: 11, lineHeight: 16, paddingTop: 2, color: saveStatus.includes("failed") ? colors.red : colors.muted, textAlign: "center" }}>{saveStatus || "Draft stays editable"}</Text>
            </>
          )}
        </View>
        <ScrollView
          key={mode === "submitted" ? "submitted" : "draft"}
          ref={scroll}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={local.content}
        >
          <CreationTargets.Provider value={{ issue: focusedIssue, register: registerTarget }}>
          <View ref={content} style={{ gap: 16 }}>
          {!!failure && <Notice tone="error">{failure}</Notice>}
          {!!notice && notice !== "Your saved draft is ready to continue." && (
            <View accessibilityLiveRegion="polite" style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 10, backgroundColor: colors.paper }}>
              <Ionicons name={Object.values(stepSuccessNotices).includes(notice) ? "checkmark-circle-outline" : "information-circle-outline"} size={18} color={colors.green} />
              <Text style={{ flex: 1, fontSize: 12, lineHeight: 18, color: colors.ink }}>{notice}</Text>
            </View>
          )}
          {serverConflict && working && (
            <View style={[styles.card, { padding: 18, gap: 13 }]}>
              <Text style={styles.h2}>A newer account version exists</Text>
              <Text style={styles.body}>
                Your local edits are preserved. The account version is “
                {serverConflict.title || "Untitled campaign"}” (version{" "}
                {serverConflict.version}). Choose how to continue; no version
                will be silently overwritten.
              </Text>
              <Button
                title="Keep my edits as a separate draft"
                variant="secondary"
                disabled={locked}
                onPress={() => {
                  const next: LocalDraft = {
                    ...working,
                    localId: newId(),
                    draft: {
                      ...working.draft,
                      id: "",
                      ownerId: "",
                      status: "Draft",
                      version: undefined,
                      revisionPending: false,
                      raised: 0,
                    },
                    updatedAt: new Date().toISOString(),
                  };
                  begin(next);
                  setNotice(
                    "Your local edits are now a separate draft. The existing account campaign is preserved.",
                  );
                }}
              />
              <Button
                title="Load the latest account version"
                variant="ghost"
                disabled={locked}
                onPress={() => {
                  const latest = serverConflict;
                  const archived: LocalDraft = {
                    ...working,
                    localId: newId(),
                    draft: {
                      ...working.draft,
                      id: "",
                      ownerId: "",
                      status: "Draft",
                      version: undefined,
                      revisionPending: false,
                      raised: 0,
                    },
                    updatedAt: new Date().toISOString(),
                  };
                  void saveLocal(archived)
                    .then(() => {
                      begin({
                        localId: working.localId,
                        draft: latest,
                        step: Math.min(4, latest.step || 0),
                        goalInput: latest.goal ? String(latest.goal) : "",
                        updatedAt: new Date().toISOString(),
                      });
                      setNotice(
                        "The latest account version is loaded. Your previous local edits were preserved as a separate device draft.",
                      );
                    })
                    .catch((error) => setFailure(message(error)));
                }}
              />
            </View>
          )}
          {!!library.error && (
            <View style={{ gap: 12 }}>
              <Notice tone="error">{library.error}</Notice>
              <Button
                title="Retry loading device drafts"
                variant="secondary"
                onPress={library.retry}
                disabled={locked}
              />
            </View>
          )}
          {!ready || library.loading || loadingDraft ? (
            <Loading />
          ) : mode === "entry" ? (
            <CreationEntry
              scope={scope}
              deletion={deletion}
              signedIn={!!user}
              localDrafts={library.entries}
              accountDrafts={savedCloud}
              accountLoading={me.isLoading}
              accountError={me.isError}
              disabled={!!library.error}
              onManual={() => begin()}
              onGuided={() => begin(undefined, true)}
              onResumeLocal={(entry) => begin(entry)}
              onResumeAccount={(id) => { void loadCloud(id); }}
              onRetryAccount={() => { void me.refetch(); }}
            >
              {!!user && guestHandoff && (
                <View style={[styles.card, { padding: 20, gap: 12 }]}>
                  <Text style={styles.h2}>Continue your guest draft</Text>
                  <Text style={styles.body}>
                    {guestHandoff.draft.title || "Your draft from this session"}
                  </Text>
                  <Text style={styles.muted}>
                    Move this draft into your signed-in account’s private
                    workspace on this device. The guest copy will be removed
                    after transfer.
                  </Text>
                  <Button
                    title="Move & resume my guest draft"
                    variant="secondary"
                    onPress={() => {
                      void library
                        .claimGuest(guestHandoff)
                        .then(() => {
                          begin(guestHandoff);
                          setGuestHandoff(null);
                        })
                        .catch((error) => setFailure(message(error)));
                    }}
                  />
                </View>
              )}
            </CreationEntry>
          ) : mode === "submitted" && draft ? (
            <>
              <View style={{ alignItems: "center", paddingTop: 24, gap: 18 }}>
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" }}><Ionicons name="checkmark" size={40} color={colors.onPrimary} /></View>
                <Text accessibilityRole="header" style={{ fontSize: 27, lineHeight: 35, fontWeight: "700", textAlign: "center", letterSpacing: -0.5 }}>Your idea is ready{"\n"}for review.</Text>
              <Text style={[styles.body, { textAlign: "center", color: colors.muted }]}>
                {draft.revisionPending
                  ? `Your proposed changes to “${draft.title}” were received for review. The previously approved version remains public; this update has not been published or applied to advertising.`
                  : `“${draft.title}” has been received for review. It is not published and no advertising has started.`}
              </Text>
              </View>
              <View style={{ gap: 10, paddingTop: 6 }}>
                <CreationButton title="View Campaign" icon="arrow-forward" onPress={() => router.push(detailPath(draft.id))} />
                <CreationButton title="Create Another Campaign" secondary onPress={() => { setMode("entry"); setActive(null); router.setParams({ draft: undefined }); }} />
              </View>
              <View style={{ height: 170, borderRadius: 14, overflow: "hidden", backgroundColor: "#000000" }}>
                <Image accessible={false} source={require("../../../assets/images/create/confirmation-coast.png")} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                <View style={{ position: "absolute", left: 20, right: 20, bottom: 16 }}><Text style={{ color: "#FFFFFF", fontSize: 17, lineHeight: 24, textAlign: "center", fontWeight: "600" }}>Small ideas. A wider conversation.</Text></View>
              </View>
              <Text style={styles.h2}>What happens next</Text>
              <View style={[styles.card, { padding: 16, gap: 18 }]}>
                {[
                  {
                    title: "Submission received",
                    body: "Your story, sources, creative, audience settings, and proposed budget are saved for review.",
                    done: true,
                  },
                  {
                    title: "Content & creative review",
                    body: "The platform checks eligibility and may request corrections. Watch Activity for feedback.",
                  },
                  {
                    title: draft.revisionPending
                      ? "Approval of your proposed update"
                      : "Approval → Available for Funding",
                    body: draft.revisionPending
                      ? "Only approved changes can replace the current public story and creative. The prior approved version is preserved during review."
                      : "An approved campaign can be made available for backing. Contributions pay for message distribution.",
                  },
                  {
                    title: "Distribution preparation → Promoting",
                    body: "Reaching the goal does not launch ads. Approval, payment, budget, and advertising setup must be confirmed first.",
                  },
                  {
                    title: "Completed → Final report",
                    body: "Follow funding and distribution progress, then inspect the final report.",
                  },
                ].map((item, index) => (
                  <View
                    style={[styles.row, { alignItems: "flex-start" }]}
                    key={item.title}
                  >
                    <View
                      style={{
                        width: 29,
                        height: 29,
                        borderRadius: 15,
                        backgroundColor: item.done ? colors.green : colors.mint,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.done ? (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={colors.onPrimary}
                        />
                      ) : (
                        <Text
                          style={{ color: colors.green, fontWeight: "700" }}
                        >
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    <View style={{ flex: 1, gap: 6 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: colors.ink,
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.muted}>{item.body}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Button
                title="View activity"
                onPress={() => router.push("/activity")}
                variant="secondary"
              />
            </>
          ) : working && draft ? (
            <>
              <View
                pointerEvents={locked ? "none" : "auto"}
                style={{ gap: 16, opacity: busy ? 0.65 : 1 }}
              >
                {mode === "voice" ? (
                  <AssistanceForm
                    values={assistance}
                    onChange={updateAssistance}
                    onApply={applyAssistance}
                  />
                ) : preview ? (
                  <CampaignPreview draft={draft} config={config.data} />
                ) : (
                  <>
                    <View style={{ gap: 5, paddingTop: 2, paddingBottom: 2 }}>
                      <Text accessibilityRole="header" style={{ fontSize: 22, lineHeight: 29, fontWeight: "700", letterSpacing: -0.45, color: colors.ink }}>{step + 1}. {stepHeadings[step]}</Text>
                      {step !== 2 && <Text style={{ fontSize: 13, lineHeight: 19, color: colors.muted }}>{stepDescriptions[step]}</Text>}
                    </View>
                    {!!draft.feedback && (
                      <Accordion key={`${draft.id}:${reviewContext}`} title="Reviewer feedback" initiallyOpen={reviewContext}>
                        <Text style={styles.body}>{draft.feedback}</Text>
                        <Button title="Review submission checklist" variant="ghost" onPress={() => changeStep(4)} />
                      </Accordion>
                    )}
                    {step === 0 && (
                      <>
                        <TargetField target="title"
                          label="Campaign title *"
                          value={draft.title}
                          maxLength={60}
                          onChangeText={(title) => change({ title })}
                          error={errors.title}
                          placeholder="A clear idea worth sharing"
                          hint={`${draft.title.length}/60 · Default ad headline.`}
                        />
                        <TargetGroup target="category">
                          <Text style={local.fieldLabel}>Category *</Text>
                          <CategorySelect value={draft.category} options={config.data?.categories || categories} onChange={(category) => change({ category })} />
                          {!!errors.category && (
                            <Text style={styles.error}>{errors.category}</Text>
                          )}
                        </TargetGroup>
                        <TargetField target="creatorName"
                          label="Creator or organization name *"
                          value={draft.creatorName}
                          maxLength={150}
                          onChangeText={(creatorName) =>
                            change({ creatorName })
                          }
                          placeholder="Who is behind this message?"
                          error={errors.creatorName}
                          hint="This name will be public on your campaign."
                        />
                        <TargetField target="summary"
                          label="Short summary"
                          multiline
                          maxLength={2000}
                          value={draft.summary}
                          onChangeText={(summary) => change({ summary })}
                          placeholder="What is the message, who is it for, and why does it matter?"
                          style={{ minHeight: 100 }}
                          hint={`${draft.summary.length}/2000 characters · A short introduction to your message.`}
                        />
                        <Accordion title="Optional campaign cover image">
                          <View style={{ gap: 13 }}>
                            {!!draft.coverImage && (
                              <Picture uri={draft.coverImage} height={180} />
                            )}
                            <Field
                              label="Public cover image URL"
                              value={draft.coverImage}
                              onChangeText={(coverImage) =>
                                change({ coverImage })
                              }
                              autoCapitalize="none"
                              keyboardType="url"
                            />
                            <Button
                              title={
                                user
                                  ? "Upload cover image"
                                  : "Sign in to upload a cover"
                              }
                              onPress={() => {
                                if (user) void upload("cover");
                                else void signIn();
                              }}
                              variant="secondary"
                              icon="image-outline"
                            />
                            {!!draft.coverImage && (
                              <Button
                                title="Remove cover"
                                onPress={() => change({ coverImage: "" })}
                                variant="ghost"
                              />
                            )}
                          </View>
                        </Accordion>
                        <Accordion title="Drafting assistance · demo fallback">
                          <AssistanceForm
                            values={assistance}
                            onChange={updateAssistance}
                            onApply={applyAssistance}
                          />
                        </Accordion>
                      </>
                    )}
                    {step === 1 && (
                      <>
                        <StoryComposer text={primaryParagraph?.text || ""} format={primaryParagraph?.format || "normal"} position={primaryParagraphIndex} total={draft.sections.length} onChangeText={(text) => editPrimaryParagraph({ text })} onFormat={(format) => editPrimaryParagraph({ format })} onMove={(direction) => { if (primaryParagraph) { setEditingParagraphId(primaryParagraph.id); moveSection(primaryParagraphIndex, direction); } }} onRemove={() => { if (primaryParagraph) { change({ sections: draft.sections.filter((section) => section.id !== primaryParagraph.id) }); setEditingParagraphId(null); } }} />
                        <CreationTip title="Be real. Be human.">People support clear, honest stories.</CreationTip>
                        <View style={{ height: 88, borderRadius: 12, overflow: "hidden", backgroundColor: "#000000" }}>
                          <Image accessible={false} source={require("../../../assets/images/create/story-mountains.png")} style={{ position: "absolute", width: "100%", height: 177, bottom: 0 }} resizeMode="cover" />
                          <Text style={{ position: "absolute", left: 20, right: 20, bottom: 13, color: "#FFFFFF", fontSize: 14, lineHeight: 20, fontWeight: "600", textAlign: "center" }}>Every big change starts with a story.</Text>
                        </View>
                        <Accordion key={focusedIssue?.field === "storyHeadline" ? "story-headline-focus" : "story-heading"} title="Headline & introduction" initiallyOpen={focusedIssue?.field === "storyHeadline"}>
                        <View style={{ gap: 14 }}>
                        <TargetField target="storyHeadline"
                          label="Story headline"
                          value={draft.storyHeadline}
                          maxLength={200}
                          onChangeText={(storyHeadline) =>
                            change({ storyHeadline })
                          }
                          placeholder="The headline of your article"
                        />
                        <Field
                          label="Introduction"
                          value={draft.intro}
                          multiline
                          maxLength={15000}
                          onChangeText={(intro) => change({ intro })}
                          placeholder="Invite people into the story."
                        />
                        </View>
                        </Accordion>
                        {draft.sections.map((section, index) => section.id === primaryParagraph?.id ? null : (
                          <View
                            key={section.id}
                            style={[styles.card, { padding: 13, gap: 12 }]}
                          >
                            <View
                              style={[
                                styles.row,
                                {
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                },
                              ]}
                            >
                              <View style={{ flex: 1, gap: 3 }}>
                                <Text style={styles.label}>
                                  Section {index + 1}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    color: colors.ink,
                                    fontWeight: "700",
                                  }}
                                >
                                  {section.kind === "text"
                                    ? "Paragraph"
                                    : section.kind === "action"
                                      ? "Audience action"
                                      : section.kind === "statistic"
                                        ? "Statistic"
                                        : section.kind === "image"
                                          ? "Photograph"
                                          : "Heading"}
                                </Text>
                              </View>
                              <View style={{ flexDirection: "row", gap: 8 }}>
                                <Pressable
                                  accessibilityRole="button"
                                  accessibilityLabel={`Move section ${index + 1} up`}
                                  disabled={index === 0}
                                  onPress={() => moveSection(index, -1)}
                                  style={[
                                    local.iconButton,
                                    { opacity: index === 0 ? 0.3 : 1 },
                                  ]}
                                >
                                  <Ionicons
                                    name="arrow-up"
                                    size={21}
                                    color={colors.green}
                                  />
                                </Pressable>
                                <Pressable
                                  accessibilityRole="button"
                                  accessibilityLabel={`Move section ${index + 1} down`}
                                  disabled={index === draft.sections.length - 1}
                                  onPress={() => moveSection(index, 1)}
                                  style={[
                                    local.iconButton,
                                    {
                                      opacity:
                                        index === draft.sections.length - 1
                                          ? 0.3
                                          : 1,
                                    },
                                  ]}
                                >
                                  <Ionicons
                                    name="arrow-down"
                                    size={21}
                                    color={colors.green}
                                  />
                                </Pressable>
                                <Pressable
                                  accessibilityRole="button"
                                  accessibilityLabel={`Remove section ${index + 1}`}
                                  onPress={() =>
                                    change({
                                      sections: draft.sections.filter(
                                        (item) => item.id !== section.id,
                                      ),
                                    })
                                  }
                                  style={local.iconButton}
                                >
                                  <Ionicons
                                    name="trash-outline"
                                    size={20}
                                    color={colors.red}
                                  />
                                </Pressable>
                              </View>
                            </View>
                            {section.kind === "image" ? (
                              <>
                                <Picture uri={section.url} height={190} />
                                <Button
                                  title="Upload story image"
                                  onPress={() => {
                                    void upload("story", section.id);
                                  }}
                                  variant="secondary"
                                  icon="image-outline"
                                />
                                <TargetField target={`section:${section.id}`}
                                  label={`Section ${index + 1} image URL`}
                                  value={section.url || ""}
                                  autoCapitalize="none"
                                  keyboardType="url"
                                  onChangeText={(url) =>
                                    updateSection(section.id, { url })
                                  }
                                />
                                <Field
                                  label="Image caption"
                                  value={section.caption || ""}
                                  maxLength={1000}
                                  onChangeText={(caption) =>
                                    updateSection(section.id, { caption })
                                  }
                                />
                                <Field
                                  label="Image credit"
                                  value={section.credit || ""}
                                  maxLength={300}
                                  onChangeText={(credit) =>
                                    updateSection(section.id, { credit })
                                  }
                                  placeholder="Photographer or rights holder"
                                />
                              </>
                            ) : (
                              <>
                                {section.kind === "text" && <StoryFormatting value={section.format || "normal"} onChange={(format) => updateSection(section.id, { format })} />}
                                <Field
                                  label={
                                    section.kind === "statistic"
                                      ? "Statistic or key figure"
                                      : section.kind === "action"
                                        ? "Suggested audience action"
                                        : section.kind === "heading"
                                          ? "Section heading"
                                          : "Paragraph text"
                                  }
                                  multiline={
                                    section.kind === "text" ||
                                    section.kind === "action"
                                  }
                                  value={section.text}
                                  maxLength={15000}
                                  onChangeText={(text) =>
                                    updateSection(section.id, { text })
                                  }
                                  placeholder={
                                    section.kind === "statistic"
                                      ? "A meaningful number, with a source"
                                      : "Write in your own words…"
                                  }
                                />
                                {section.kind === "statistic" && (
                                  <Field
                                    label="Context & source reference"
                                    value={section.caption || ""}
                                    multiline
                                    onChangeText={(caption) =>
                                      updateSection(section.id, { caption })
                                    }
                                    hint="Explain what this number means and add its public source below."
                                  />
                                )}
                              </>
                            )}
                          </View>
                        ))}
                        <View style={{ gap: 12 }}>
                          <Text style={styles.label}>Add to your story</Text>
                          <View style={local.pills}>
                            {(
                              [
                                "text",
                                "heading",
                                "image",
                                "statistic",
                                "action",
                              ] as const
                            ).map((kind) => (
                              <Pill
                                key={kind}
                                title={`+ ${kind === "text" ? "Paragraph" : kind === "action" ? "Action" : kind.charAt(0).toUpperCase() + kind.slice(1)}`}
                                onPress={() =>
                                  change({
                                    sections: [
                                      ...draft.sections,
                                      {
                                        id: newId(),
                                        kind,
                                        text: "",
                                        format: "normal",
                                      },
                                    ],
                                  })
                                }
                              />
                            ))}
                          </View>
                          {!!errors.sections && (
                            <Text style={styles.error}>{errors.sections}</Text>
                          )}
                        </View>
                        <TargetGroup target="sources">
                          <Text style={styles.h2}>Sources & evidence</Text>
                          <Text style={styles.muted}>
                            Your sources stay visible to everyone who reads the
                            campaign. A source is context, rather than a claim
                            of independent verification.
                          </Text>
                          {draft.sources.map((source, index) => (
                            <View
                              style={[styles.card, { padding: 16, gap: 13 }]}
                              key={source.id}
                            >
                              <TargetField target={`source-title:${source.id}`}
                                label={`Source ${index + 1} title`}
                                maxLength={300}
                                value={source.title}
                                onChangeText={(title) =>
                                  change({
                                    sources: draft.sources.map((item) =>
                                      item.id === source.id
                                        ? { ...item, title }
                                        : item,
                                    ),
                                  })
                                }
                              />
                              <TargetField target={`source-url:${source.id}`}
                                label={`Source ${index + 1} URL`}
                                maxLength={2000}
                                value={source.url}
                                autoCapitalize="none"
                                keyboardType="url"
                                onChangeText={(url) =>
                                  change({
                                    sources: draft.sources.map((item) =>
                                      item.id === source.id
                                        ? { ...item, url }
                                        : item,
                                    ),
                                  })
                                }
                                placeholder="https://…"
                              />
                              <Button
                                title={`Remove source ${index + 1}`}
                                onPress={() =>
                                  change({
                                    sources: draft.sources.filter(
                                      (item) => item.id !== source.id,
                                    ),
                                  })
                                }
                                variant="ghost"
                              />
                            </View>
                          ))}
                          <Button
                            title="Add a public source"
                            icon="link-outline"
                            variant="secondary"
                            onPress={() =>
                              change({
                                sources: [
                                  ...draft.sources,
                                  { id: newId(), title: "", url: "" },
                                ],
                              })
                            }
                          />
                          {!!errors.sources && (
                            <Text style={styles.error}>{errors.sources}</Text>
                          )}
                        </TargetGroup>
                        <Button
                          title={
                            showStoryPreview
                              ? "Hide live story preview"
                              : "Show live story preview"
                          }
                          variant="ghost"
                          onPress={() => setShowStoryPreview(!showStoryPreview)}
                          icon="eye-outline"
                        />
                        {showStoryPreview && (
                          <View
                            style={{
                              borderTopWidth: 1,
                              borderColor: colors.line,
                              paddingTop: 22,
                              gap: 19,
                            }}
                          >
                            <Text style={styles.h2}>Story preview</Text>
                            <StoryPreview draft={draft} />
                          </View>
                        )}
                      </>
                    )}
                    {step === 2 && (
                      <>
                        <CampaignMediaSections
                          draft={draft}
                          disabled={locked}
                          onUpload={(purpose) => { if (user) void upload(purpose); else void signIn(); }}
                          onChange={change}
                        />
                        <TargetGroup target="advertising">
                          {!!errors.visuals && <Text style={styles.error}>{errors.visuals}</Text>}
                        </TargetGroup>
                        <Accordion key={focusedIssue?.field === "coverImage" || focusedIssue?.field.startsWith("ad-image:") ? focusedIssue.field : "media-urls"} title="Manage images & public URLs" initiallyOpen={focusedIssue?.field === "coverImage" || !!focusedIssue?.field.startsWith("ad-image:")}>
                          <View style={{ gap: 14 }}>
                            <TargetField target="coverImage" label="Cover image URL" value={draft.coverImage} autoCapitalize="none" keyboardType="url" onChangeText={(coverImage) => change({ coverImage })} />
                            {draft.adImages.map((url, index) => <View key={index} style={{ gap: 6 }}>
                              <TargetField target={`ad-image:${index}`} label={`Advertising image ${index + 1} URL`} value={url} autoCapitalize="none" keyboardType="url" onChangeText={(next) => change({ adImages: draft.adImages.map((item, position) => position === index ? next : item) })} />
                              <Button title={`Remove advertising image ${index + 1}`} variant="ghost" onPress={() => change({ adImages: draft.adImages.filter((_, position) => position !== index) })} />
                            </View>)}
                            <Button title="Add advertising image URL" onPress={() => change({ adImages: [...draft.adImages, ""] })} variant="ghost" icon="link-outline" />
                            <Text style={styles.muted}>{IMAGE_UPLOAD_HINT} per upload. Videos and documents are not supported in this prototype.</Text>
                          </View>
                        </Accordion>
                        <Accordion title="Image generation · manual fallback">
                          <View style={{ gap: 13 }}>
                            <Text style={styles.body}>
                              A live image generator is not connected. Build a
                              prompt, use it with your preferred generation
                              tool, then upload the resulting image. Check
                              rights, accuracy, and suitability before use.
                            </Text>
                            <Button
                              title="Build an image prompt"
                              variant="secondary"
                              icon="sparkles-outline"
                              onPress={() =>
                                setImagePrompt(
                                  `Create a thoughtful editorial advertising image for the message: “${draft.title || "my campaign message"}”. Context: ${draft.summary || "a community-funded message"}. Audience: ${draft.geography || "the intended community"}. Calm, credible visual; strong focal point; mobile-readable composition; no fabricated facts or logos; leave room for a headline. Avoid implying this campaign has already been verified or funded.`,
                                )
                              }
                            />
                            {!!imagePrompt && (
                              <View style={{ gap: 8 }}>
                                <Text style={styles.label}>
                                  Prompt template · select to copy
                                </Text>
                                <Text selectable style={styles.body}>
                                  {imagePrompt}
                                </Text>
                              </View>
                            )}
                          </View>
                        </Accordion>
                        <Field
                          label="Ad headline"
                          maxLength={150}
                          value={draft.adHeadline}
                          onChangeText={(adHeadline) => change({ adHeadline })}
                          placeholder={
                            draft.title.slice(0, 60) || "Your ad headline"
                          }
                          hint="Leave blank to use the beginning of your campaign title."
                        />
                        <Field
                          label="Ad description"
                          multiline
                          maxLength={2000}
                          value={draft.adDescription}
                          onChangeText={(adDescription) =>
                            change({ adDescription })
                          }
                          placeholder="Give someone a reason to read the story."
                        />
                        <Field
                          label="Call-to-action text"
                          maxLength={100}
                          value={draft.cta}
                          onChangeText={(cta) => change({ cta })}
                          placeholder="Learn more"
                        />
                        <View style={{ gap: 14 }}>
                          <Text style={styles.h2}>Placement preview</Text>
                          <View style={local.pills}>
                            {channels.map((channel) => (
                              <Pill
                                key={channel}
                                title={channel}
                                selected={placement === channel}
                                onPress={() => setPlacement(channel)}
                              />
                            ))}
                          </View>
                          <AdPreview draft={draft} placement={placement} />
                          <Text style={styles.muted}>
                            Illustrative supported placement. Final crops, copy,
                            and placements may change during review; no
                            advertising has been published.
                          </Text>
                        </View>
                        <Accordion title="Creative quality check">
                          <Text style={styles.body}>
                            Can you understand the message at a glance? Is the
                            text readable on a phone? Does the image have
                            permission and context? Could someone mistake it for
                            a verified claim? Use these prompts to refine your
                            creative before review.
                          </Text>
                        </Accordion>
                      </>
                    )}
                    {step === 3 && (
                      <>
                        <TargetField target="geography"
                          label="Target geographic locations *"
                          maxLength={1000}
                          value={draft.geography}
                          onChangeText={(geography) => change({ geography })}
                          placeholder="For example, Pune and nearby communities"
                          error={errors.geography}
                          hint="Use cities, regions, or countries. The platform will confirm available targeting."
                        />
                        <View style={{ gap: 5 }}>
                          <Text style={local.fieldLabel}>Target audience</Text>
                          <View style={local.pills}>{["Everyone", "Students", "Professionals", "Communities"].map((audience) => <Pill key={audience} title={audience} selected={audience === "Everyone" ? !draft.interests : draft.interests === audience} onPress={() => change({ interests: audience === "Everyone" ? "" : audience })} />)}</View>
                        </View>
                        <Field
                          label="Audience characteristics & interests"
                          multiline
                          maxLength={1000}
                          value={draft.interests}
                          onChangeText={(interests) => change({ interests })}
                          placeholder="What does this audience care about?"
                          hint="Describe relevant interests. Avoid private personal information or sensitive individual targeting."
                        />
                        <TargetGroup target="channels">
                          <Text style={local.fieldLabel}>
                            Distribution channels *
                          </Text>
                          <View style={local.pills}>
                            {channels.map((channel) => (
                              <Pill
                                key={channel}
                                title={channel}
                                selected={draft.channels.includes(channel)}
                                onPress={() => toggleChannel(channel)}
                              />
                            ))}
                          </View>
                          {!!errors.channels && (
                            <Text style={styles.error}>{errors.channels}</Text>
                          )}
                        </TargetGroup>
                        <View style={{ gap: 12 }}>
                          <Text style={styles.h2}>Proposed ad allocation</Text>
                          <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>Split 100% of the budget after fees. You set your funding goal at Submit.</Text>
                          <View style={{ flexDirection: fontScale > 1.3 ? "column" : "row", gap: 10 }}>{draft.channels.map((channel) => (
                            <View key={channel} style={{ flex: 1 }}>
                            <TargetField target={`allocation:${channel}`}
                              label={`${channel} %`}
                              keyboardType="numeric"
                              value={String(draft.allocation[channel] ?? 0)}
                              onChangeText={(raw) => {
                                if (/^\d{0,3}$/.test(raw))
                                  change({
                                    allocation: {
                                      ...draft.allocation,
                                      [channel]: raw ? Number(raw) : 0,
                                    },
                                  });
                              }}
                            />
                            </View>
                          ))}</View>
                          <Text
                            style={{
                              fontWeight: "700",
                              color: errors.allocation
                                ? colors.red
                                : colors.green,
                            }}
                          >
                            Total:{" "}
                            {draft.channels.reduce(
                              (sum, channel) =>
                                sum + (draft.allocation[channel] || 0),
                              0,
                            )}
                            %
                          </Text>
                          {!!errors.allocation && (
                            <Text style={styles.error}>
                              {errors.allocation}
                            </Text>
                          )}
                        </View>
                        <TargetField target="durationDays"
                          label="Campaign duration · days *"
                          keyboardType="numeric"
                          editable={!fundingLocked}
                          value={
                            draft.durationDays ? String(draft.durationDays) : ""
                          }
                          onChangeText={(raw) => {
                            if (/^\d{0,2}$/.test(raw))
                              change({ durationDays: raw ? Number(raw) : 0 });
                          }}
                          error={errors.durationDays}
                          hint={
                            fundingLocked
                              ? "Duration is locked after publication to protect backer expectations."
                              : "Demo policy: 1–90 days. The platform confirms the distribution schedule during review."
                          }
                        />
                        {!fundingLocked && <View style={local.pills}>{[14, 30, 60].map((days) => <Pill key={days} title={`${days} days`} selected={draft.durationDays === days} onPress={() => change({ durationDays: days })} />)}</View>}
                        <View style={[styles.card, { padding: 20, gap: 13 }]}>
                          <Text style={styles.label}>
                            Your audience preview
                          </Text>
                          <Text style={styles.h2}>
                            {draft.geography || "Choose a place to start"}
                          </Text>
                          <Text style={styles.body}>
                            {draft.interests ||
                              "Broad audience within your selected locations"}
                          </Text>
                          <Text style={styles.muted}>
                            {draft.channels.join(" + ") ||
                              "No channel selected"}{" "}
                            · {draft.durationDays || "—"} days
                          </Text>
                          <Text style={styles.body}>
                            {draft.goal && config.data
                              ? `${number(estimate(draft.goal, config.data))} people, estimated from your saved funding goal`
                              : draft.goal
                                ? "Reach estimate unavailable until current funding policies load."
                              : "Set your goal at Submit to see the estimated audience reach."}
                          </Text>
                        </View>
                        <AdPreview
                          draft={draft}
                          placement={draft.channels[0] || "Instagram"}
                        />
                        <Notice>
                          Your settings are proposals. The platform may finalize
                          targeting, placements, and allocation during review.
                          Reach depends on inventory, prices, targeting,
                          delivery, and performance. A fixed audience size is
                          never guaranteed.
                        </Notice>
                      </>
                    )}
                    {step === 4 && (
                      <>
                        <CampaignReviewSummary draft={draft} onEdit={(targetStep) => targetStep === 4 ? jumpToIssue({ id: "review-goal", step: 4, field: "goal", title: "Funding goal", message: "Choose the funding goal for your message.", required: false }) : changeStep(targetStep)} />
                        <GoalAmountField key={working.localId} value={draft.goal} entry={working.goalEntry} editable={!fundingLocked} error={errors.goal}
                          onChange={(raw, goalEntry) => {
                              setActive((previous) =>
                                previous
                                  ? {
                                      ...previous,
                                      goalInput: raw,
                                      goalEntry,
                                      draft: {
                                        ...previous.draft,
                                        goal: raw ? Number(raw) || 0 : 0,
                                      },
                                      updatedAt: new Date().toISOString(),
                                    }
                                  : previous,
                              );
                              setAccepted(false);
                              setErrors({});
                          }}
                        />
                        {config.data ? <View style={[styles.card, { padding: 16, gap: 10 }]}>
                          <Text style={styles.h2}>
                            Est. {number(fundingQuote.reach)} people
                          </Text>
                          <View
                            style={[
                              styles.row,
                              { justifyContent: "space-between" },
                            ]}
                          >
                            <Text style={styles.muted}>
                              Platform fee (
                              {(config.data.feeRate * 100).toFixed(
                                0,
                              )}
                              %)
                            </Text>
                            <Text style={styles.body}>
                              {money(fundingQuote.fee)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.row,
                              { justifyContent: "space-between" },
                            ]}
                          >
                            <Text style={styles.muted}>Advertising budget</Text>
                            <Text style={styles.body}>
                              {money(fundingQuote.adBudget)}
                            </Text>
                          </View>
                          <Text style={styles.muted}>
                            Demo assumption:{" "}
                            {config.data.peoplePerAdDollar} people per
                            advertising dollar, after fees. This is an estimate,
                            not guaranteed delivery or measured unique reach.
                          </Text>
                        </View> : <Notice>Current fees and reach estimates are unavailable. Connect to load funding policies before submitting; your draft can still be edited and saved.</Notice>}
                        <SubmissionChecklist issues={submissionIssues(draft, working.goalInput, accepted)} onSelect={jumpToIssue} />
                        <Accordion title="Complete campaign preview"><CampaignPreview draft={draft} config={config.data} /></Accordion>
                        {config.isLoading ? (
                          <ActivityIndicator
                            color={colors.green}
                            accessibilityLabel="Loading funding policies"
                          />
                        ) : config.isError ? (
                          <View style={{ gap: 12 }}>
                            <Notice tone="error">
                              The current funding policies could not be loaded.
                              Your draft is preserved. Load them before
                              submitting.
                            </Notice>
                            <Button
                              title="Reload funding policies"
                              onPress={() => {
                                void config.refetch();
                              }}
                              variant="secondary"
                            />
                          </View>
                        ) : null}
                        <Notice>
                          Contributions fund message distribution, rather than
                          direct support for the cause. Submission starts a
                          review. Approval is required before publication, and
                          funding completion does not automatically start
                          advertising.
                        </Notice>
                        <FundingPolicies config={config.data} />
                        <TargetGroup target="rules">
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: accepted }}
                          onPress={() => {
                            setAccepted(!accepted);
                            setErrors((previous) => ({
                              ...previous,
                              rules: "",
                            }));
                          }}
                          style={[
                            styles.row,
                            {
                              alignItems: "flex-start",
                              minHeight: 54,
                              paddingVertical: 9,
                            },
                          ]}
                        >
                          <Ionicons
                            name={accepted ? "checkbox" : "square-outline"}
                            size={26}
                            color={colors.green}
                          />
                          <Text style={[styles.body, { flex: 1 }]}>
                            I confirm that my message is accurate to the best of
                            my knowledge, that I can use the supplied media, and
                            that I accept the campaign rules, review process,
                            fees, allocation, refund, and unspent-funds policies
                            shown above.
                          </Text>
                        </Pressable>
                        </TargetGroup>
                        {!!errors.rules && (
                          <Text style={styles.error}>{errors.rules}</Text>
                        )}
                      </>
                    )}
                  </>
                )}
              </View>
              {!!uploading && (
                <View style={[styles.row, { justifyContent: "center" }]}>
                  <ActivityIndicator color={colors.green} />
                  <Text style={styles.muted}>Uploading image securely…</Text>
                </View>
              )}
              {!user && (
                <Button
                  title="Sign in to save to my account or submit"
                  variant="ghost"
                  onPress={() => {
                    void signIn();
                  }}
                  disabled={locked}
                />
              )}
            </>
          ) : (
            <Empty
              title="Your draft is ready to begin"
              body="Start manually or use the guided demo."
              action={
                <Button
                  title="Start a campaign"
                  onPress={() => setMode("entry")}
                />
              }
            />
          )}
          </View>
          </CreationTargets.Provider>
        </ScrollView>
        {working && mode !== "entry" && mode !== "submitted" && (
          <CreationActionDock
            secondary={!preview ? (
              <CreationButton
                title={step === 0 && mode !== "voice" ? "Save & Exit" : "Back"}
                secondary
                style={{ backgroundColor: "transparent", borderColor: colors.line, paddingHorizontal: 12 }}
                onPress={goBack}
                disabled={locked}
              />
            ) : undefined}
            primary={preview ? (
              <CreationButton
                title="Return to editing"
                onPress={() => {
                  setPreview(false);
                  scroll.current?.scrollTo({ y: 0, animated: false });
                }}
                icon="create-outline"
              />
            ) : mode === "voice" ? (
              <CreationButton title="Continue manually" onPress={manualMode} disabled={locked} icon="arrow-forward" />
            ) : (
              <CreationButton
                title={step === 4 ? "Submit for Review" : "Next"}
                icon={step === 4 ? "paper-plane-outline" : "arrow-forward"}
                loading={busy}
                disabled={!!uploading || (step === 4 && config.isLoading)}
                onPress={() => {
                  if (step === 4) {
                    void submit();
                    return;
                  }
                  const invalid = validateStep(draft!, step);
                  if (Object.keys(invalid).length) {
                    const issue = submissionIssues(draft!, working.goalInput, accepted).find((item) => item.required && item.step === step);
                    if (issue) jumpToIssue(issue);
                  } else changeStep(step + 1);
                }}
              />
            )}
          />
        )}
      </View>
    </Screen>
  );
}

const makeLocalStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
  frame: { flex: 1, width: "100%", maxWidth: 640, alignSelf: "center" },
  header: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 2,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 14,
    flexGrow: 1,
  },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  fieldLabel: { fontSize: 12, lineHeight: 17, fontWeight: "600", color: colors.ink },
  editorTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.35,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
