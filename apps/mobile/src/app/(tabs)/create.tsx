import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
  Field,
  Loading,
  Notice,
  Picture,
  Pill,
  Screen,
  Text,
  colors,
  styles,
} from "../../components/ui";
import { api } from "../../lib/api";
import { refresh, useConfig, useMe, useSession } from "../../lib/session";
import {
  Campaign,
  Section,
  categories,
  estimate,
  money,
  number,
  quote,
} from "../../lib/types";
import {
  AdPreview,
  CampaignPreview,
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

type ActiveDraft = LocalDraft & { scope: string };
const emptyAssistance: Assistance = {
  idea: "",
  audience: "",
  why: "",
  evidence: "",
  action: "",
};
const dateLabel = (date: string) =>
  new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "The operation could not be completed. Your local draft is preserved.";

function StepIndicator({ step }: { step: number }) {
  return (
    <View
      accessibilityLabel={`Step ${step + 1} of 5: ${STEPS[step]}`}
      style={{ gap: 6 }}
    >
      <View style={{ flexDirection: "row", gap: 5 }}>
        {["Basics", "Story", "Visuals", "Reach", "Submit"].map(
          (label, index) => (
            <View key={label} style={{ flex: 1, gap: 5, alignItems: "center" }}>
              <View
                style={{
                  height: 4,
                  width: "100%",
                  backgroundColor: index <= step ? colors.green : colors.line,
                  borderRadius: 3,
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  lineHeight: 16,
                  color: index === step ? colors.green : colors.muted,
                  fontWeight: index === step ? "800" : "500",
                }}
              >
                {label}
              </Text>
            </View>
          ),
        )}
      </View>
    </View>
  );
}

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 8,
        justifyContent: "center",
        opacity: disabled ? 0.45 : pressed ? 0.65 : 1,
      })}
    >
      {busy ? (
        <ActivityIndicator color={colors.green} />
      ) : (
        <Text
          style={{
            fontSize: 13,
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
  const { width, fontScale } = useWindowDimensions();
  const { user, ready } = useSession();
  const config = useConfig();
  const me = useMe();
  const params = useLocalSearchParams<{ draft?: string }>();
  const scope = user?.id || "guest";
  const library = useDraftLibrary(scope, ready);
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
  const [saveStatus, setSaveStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [uploading, setUploading] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [assistance, setAssistance] = useState<Assistance>(emptyAssistance);
  const [placement, setPlacement] = useState("Instagram");
  const [imagePrompt, setImagePrompt] = useState("");
  const [showStoryPreview, setShowStoryPreview] = useState(true);
  const scroll = useRef<ScrollView>(null);
  const activeRef = useRef(active);
  const scopeRef = useRef(scope);
  const priorScope = useRef(scope);
  const cloudLock = useRef(false);
  const openedParameter = useRef("");
  activeRef.current = active;
  scopeRef.current = scope;
  const saveLocal = library.save;
  const removeLocal = library.remove;

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
    setSaveStatus("");
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
      mode === "submitted" ||
      library.loading
    )
      return;
    const snapshot = active;
    setSaveStatus("Saving on this device…");
    const timer = setTimeout(() => {
      void saveLocal(snapshot)
        .then(() => {
          if (
            activeRef.current?.updatedAt === snapshot.updatedAt &&
            scopeRef.current === snapshot.scope
          )
            setSaveStatus("Saved on this device");
        })
        .catch(() => {
          if (scopeRef.current === snapshot.scope)
            setSaveStatus("Device save failed · retry Save as Draft");
        });
    }, 250);
    return () => clearTimeout(timer);
  }, [active, scope, mode, library.loading, saveLocal]);

  const begin = useCallback(
    (entry?: LocalDraft, voice = false) => {
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
      scroll.current?.scrollTo({ y: 0, animated: false });
    },
    [scope],
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
          begin(local);
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
      // Consume this visit's intent while Create is focused. A later notification
      // for the same campaign must reopen the editor after exiting or submitting.
      router.setParams({ draft: undefined });
      void loadCloud(id);
    }, [params.draft, ready, library.loading, loadingDraft, loadCloud, scope]),
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
  }
  const changeStep = useCallback((step: number) => {
    setActive((previous) =>
      previous
        ? { ...previous, step, updatedAt: new Date().toISOString() }
        : previous,
    );
    setErrors({});
    setFailure("");
    setPreview(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, []);
  const localNow = useCallback(async () => {
    const current = activeRef.current;
    if (!current) return;
    await saveLocal(current);
    setSaveStatus("Saved on this device");
  }, [saveLocal]);
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
    setFailure("");
    setNotice("");
    try {
      await localNow();
    } catch {
      setFailure(
        "The latest edits could not be saved on this device. Please retry.",
      );
      return;
    }
    if (!user) {
      setNotice(
        "Draft saved on this device. You can resume it here after reopening the app. Sign in to save a copy to your account.",
      );
      return;
    }
    cloudLock.current = true;
    setBusy(true);
    try {
      const saved = await saveCloud(snapshot);
      if (scopeRef.current !== operationScope) return;
      const next = {
        ...snapshot,
        draft: saved,
        updatedAt: new Date().toISOString(),
      };
      setActive(next);
      activeRef.current = next;
      await saveLocal(next);
      await refresh();
      setNotice(
        "Draft saved to your account and this device. Resume it from Create or Profile.",
      );
      setSaveStatus("Saved to your account");
    } catch (error) {
      if (scopeRef.current === operationScope) {
        setFailure(
          `${message(error)} Your current edits remain in your device draft.`,
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
      if (scopeRef.current === operationScope) setBusy(false);
    }
  }

  async function submit() {
    if (!active || cloudLock.current) return;
    for (let index = 0; index < 5; index++) {
      const invalid = validateStep(
        active.draft,
        index,
        active.goalInput,
        accepted,
      );
      if (Object.keys(invalid).length) {
        changeStep(index);
        setErrors(invalid);
        setFailure("Please check the highlighted fields before submitting.");
        return;
      }
    }
    if (!user) {
      setNotice(
        "Your draft is saved on this device. Sign in to submit it for review, then resume this draft here.",
      );
      await localNow().catch(() => undefined);
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
      const mime =
        asset.mimeType ||
        (asset.fileName?.toLowerCase().endsWith(".png")
          ? "image/png"
          : asset.fileName?.toLowerCase().endsWith(".webp")
            ? "image/webp"
            : "image/jpeg");
      if (!["image/jpeg", "image/png", "image/webp"].includes(mime))
        throw new Error(
          "Choose a JPEG, PNG, or WebP image. Video, GIF, and HEIC uploads are not supported in this prototype.",
        );
      if (asset.fileSize && asset.fileSize > 8 * 1024 * 1024)
        throw new Error(
          "This image is larger than 8 MB. Choose a smaller JPEG, PNG, or WebP file.",
        );
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
      if (purpose === "cover") change({ coverImage: uploaded.url });
      else if (purpose === "advertising")
        change({ adImages: [...current.draft.adImages, uploaded.url] });
      else
        change({
          sections: current.draft.sections.map((section) =>
            section.id === sectionId
              ? { ...section, url: uploaded.url }
              : section,
          ),
        });
      setNotice(
        "Image uploaded. Your story and advertising assets stay separate.",
      );
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
    setNotice(
      "Demo assistance filled the empty fields. Check the suggested category, edit the text, and add public source links. Your funding goal was left for you to set at Submit.",
    );
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
  const stackEditorActions = fontScale > 1.15 || width < 350;
  const editorActions = working &&
    mode !== "entry" &&
    mode !== "submitted" &&
    !preview && (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <EditorAction
          title="Save as Draft"
          onPress={() => {
            void saveDraft();
          }}
          disabled={!!uploading}
          busy={busy}
        />
        {mode !== "voice" && (
          <EditorAction
            title="Preview"
            disabled={locked}
            onPress={() => {
              setPreview(true);
              scroll.current?.scrollTo({ y: 0, animated: false });
            }}
          />
        )}
      </View>
    );

  return (
    <Screen scroll={false}>
      <View style={local.frame}>
        <View style={local.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                accessibilityRole="header"
                style={
                  working && mode !== "entry" && mode !== "submitted"
                    ? local.editorTitle
                    : styles.title
                }
              >
                {mode === "submitted"
                  ? "Submitted for review"
                  : mode === "entry"
                    ? "Create a campaign"
                    : preview
                      ? "Preview"
                      : mode === "voice"
                        ? "Guided draft"
                        : step === 2
                          ? "Ad visuals"
                          : STEPS[step]}
              </Text>
              {working && mode !== "entry" && mode !== "submitted" && (
                <Text
                  accessibilityLiveRegion="polite"
                  numberOfLines={1}
                  style={{
                    fontSize: 11,
                    lineHeight: 16,
                    color: saveStatus.includes("failed")
                      ? colors.red
                      : colors.muted,
                  }}
                >
                  {saveStatus || "Draft stays editable"}
                </Text>
              )}
            </View>
            {!stackEditorActions && editorActions}
            {working && mode !== "entry" && mode !== "submitted" && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Return to saved drafts"
                disabled={locked}
                onPress={() => {
                  void localNow()
                    .then(() => {
                      setMode("entry");
                      setPreview(false);
                    })
                    .catch(() =>
                      setFailure(
                        "Save your latest changes before leaving the editor.",
                      ),
                    );
                }}
                style={local.iconButton}
              >
                <Ionicons name="close" size={24} color={colors.green} />
              </Pressable>
            )}
          </View>
          {stackEditorActions && editorActions}
          {working && mode !== "entry" && mode !== "submitted" && (
            <StepIndicator step={step} />
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
          {!!failure && <Notice tone="error">{failure}</Notice>}
          {!!notice && notice !== "Your saved draft is ready to continue." && (
            <Notice tone="success">{notice}</Notice>
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
            <>
              <Text style={styles.body}>
                Prepare your message in five steps, then send it for review.
                Your draft saves automatically on this device.
              </Text>
              <View style={{ gap: 10 }}>
                <Button
                  title="Create Manually"
                  onPress={() => begin()}
                  icon="arrow-forward"
                  disabled={!!library.error}
                />
                <Button
                  title="Create with Your Voice"
                  onPress={() => begin(undefined, true)}
                  variant="secondary"
                  icon="mic-outline"
                  disabled={!!library.error}
                />
                <Text style={styles.muted}>
                  Voice and AI: guided demo / manual fallback. All suggestions
                  remain editable.
                </Text>
              </View>
              <Text style={styles.muted}>
                Backers fund advertising and message distribution. Their
                contributions do not directly fund the cause or transfer to you.
              </Text>
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
              {!!library.entries.length && (
                <View style={{ gap: 14 }}>
                  <Text style={styles.h2}>Saved drafts</Text>
                  <Text style={styles.muted}>
                    Private drafts on this device
                    {user ? ", saved for your account" : " · guest drafts"}.
                    Open one to continue editing.
                  </Text>
                  {library.entries.map((entry) => (
                    <View
                      style={[styles.card, { padding: 14, gap: 6 }]}
                      key={entry.localId}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: colors.ink,
                        }}
                      >
                        {entry.draft.title || "Untitled campaign"}
                      </Text>
                      <Text style={styles.muted}>
                        {STEPS[entry.step] || "Basics"} · Saved{" "}
                        {dateLabel(entry.updatedAt)}
                      </Text>
                      <Button
                        title="Resume draft"
                        variant="ghost"
                        onPress={() => begin(entry)}
                        icon="arrow-forward"
                      />
                    </View>
                  ))}
                </View>
              )}
              {!!savedCloud.length && (
                <View style={{ gap: 14 }}>
                  <Text style={styles.h2}>Drafts in your account</Text>
                  {savedCloud.map((campaign) => (
                    <View
                      key={campaign.id}
                      style={[styles.card, { padding: 14, gap: 6 }]}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: colors.ink,
                        }}
                      >
                        {campaign.title || "Untitled campaign"}
                      </Text>
                      <Text style={styles.muted}>{campaign.status}</Text>
                      <Button
                        title="Resume account draft"
                        variant="secondary"
                        onPress={() => {
                          void loadCloud(campaign.id);
                        }}
                      />
                    </View>
                  ))}
                </View>
              )}
              {!user && (
                <Text style={styles.muted}>
                  You can draft as a guest. Sign in when you’re ready to save to
                  your account, upload media, or submit.
                </Text>
              )}
            </>
          ) : mode === "submitted" && draft ? (
            <>
              <View
                style={{
                  alignSelf: "flex-start",
                  padding: 12,
                  backgroundColor: colors.mint,
                  borderRadius: 50,
                }}
              >
                <Ionicons name="checkmark" size={24} color={colors.green} />
              </View>
              <Text style={styles.title}>Campaign submitted</Text>
              <Text style={styles.body}>
                {draft.revisionPending
                  ? `Your proposed changes to “${draft.title}” were received for review. The previously approved version remains public; this update has not been published or applied to advertising.`
                  : `“${draft.title}” has been received for review. It is not published and no advertising has started.`}
              </Text>
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
                        <Ionicons name="checkmark" size={18} color="white" />
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
                title="View my campaigns"
                onPress={() => router.push("/profile")}
                icon="albums-outline"
              />
              <Button
                title="View activity"
                onPress={() => router.push("/activity")}
                variant="secondary"
              />
              <Button
                title="Create another campaign"
                onPress={() => {
                  setMode("entry");
                  setActive(null);
                  router.setParams({ draft: undefined });
                }}
                variant="ghost"
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
                    {!!draft.feedback && (
                      <Accordion title="Reviewer feedback">
                        <Text style={styles.body}>{draft.feedback}</Text>
                      </Accordion>
                    )}
                    {step === 0 && (
                      <>
                        <Text style={styles.muted}>
                          Introduce your message and who is behind it.
                        </Text>
                        <Field
                          label="Campaign title *"
                          value={draft.title}
                          maxLength={60}
                          onChangeText={(title) => change({ title })}
                          error={errors.title}
                          placeholder="A clear idea worth sharing"
                          hint={`${draft.title.length}/60 characters · The beginning of your title may be used as your ad headline if you don’t write a custom one.`}
                        />
                        <View style={{ gap: 10 }}>
                          <Text style={local.fieldLabel}>Category *</Text>
                          <Text style={styles.muted}>
                            Help the right readers discover your message.
                          </Text>
                          <View style={local.pills}>
                            {(config.data?.categories || categories).map(
                              (category) => (
                                <Pill
                                  key={category}
                                  title={category}
                                  selected={draft.category === category}
                                  onPress={() => change({ category })}
                                />
                              ),
                            )}
                          </View>
                          {!!errors.category && (
                            <Text style={styles.error}>{errors.category}</Text>
                          )}
                        </View>
                        <Field
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
                        <Field
                          label="Short summary"
                          multiline
                          maxLength={2000}
                          value={draft.summary}
                          onChangeText={(summary) => change({ summary })}
                          placeholder="What is the message, who is it for, and why does it matter?"
                          hint="A short introduction helps people decide to read the full story."
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
                        <Text style={styles.muted}>
                          Build your article with text, images, evidence, and
                          suggested audience actions.
                        </Text>
                        <Field
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
                        {draft.sections.map((section, index) => (
                          <View
                            key={section.id}
                            style={[styles.card, { padding: 17, gap: 14 }]}
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
                                <Field
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
                                {section.kind === "text" && (
                                  <View style={local.pills}>
                                    {[
                                      { value: "normal", label: "Normal" },
                                      { value: "bold", label: "Bold" },
                                      { value: "italic", label: "Italic" },
                                      { value: "bullet", label: "• List" },
                                    ].map((format) => (
                                      <Pill
                                        key={format.value}
                                        title={format.label}
                                        selected={
                                          (section.format || "normal") ===
                                          format.value
                                        }
                                        onPress={() =>
                                          updateSection(section.id, {
                                            format: format.value,
                                          })
                                        }
                                      />
                                    ))}
                                  </View>
                                )}
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
                        <View style={{ gap: 15, paddingTop: 9 }}>
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
                              <Field
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
                              <Field
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
                        </View>
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
                        <Text style={styles.muted}>
                          Keep story images separate from advertising creative.
                          Upload media you have permission to promote.
                        </Text>
                        <View style={{ gap: 13 }}>
                          <Text style={styles.h2}>Campaign cover</Text>
                          {!!draft.coverImage && (
                            <Picture uri={draft.coverImage} height={176} />
                          )}
                          <Field
                            label="Cover image URL"
                            value={draft.coverImage}
                            autoCapitalize="none"
                            keyboardType="url"
                            onChangeText={(coverImage) =>
                              change({ coverImage })
                            }
                          />
                          <Button
                            title="Upload campaign cover"
                            variant="secondary"
                            onPress={() => {
                              void upload("cover");
                            }}
                            icon="image-outline"
                          />
                          {!!draft.coverImage && (
                            <Button
                              title="Remove cover image"
                              variant="ghost"
                              onPress={() => change({ coverImage: "" })}
                            />
                          )}
                          {!draft.coverImage && (
                            <Notice>
                              A cover image is missing. It is optional, but
                              helps readers recognize your campaign.
                            </Notice>
                          )}
                        </View>
                        <View style={{ gap: 14 }}>
                          <Text style={styles.h2}>Advertising images</Text>
                          <Text style={styles.muted}>
                            Story photographs are not automatically reused as
                            ads. Upload the images you have permission to
                            promote.
                          </Text>
                          {draft.adImages.map((url, index) => (
                            <View key={index} style={{ gap: 10 }}>
                              <Picture uri={url} height={185} />
                              <Field
                                label={`Advertising image ${index + 1} URL`}
                                value={url}
                                autoCapitalize="none"
                                keyboardType="url"
                                onChangeText={(next) =>
                                  change({
                                    adImages: draft.adImages.map(
                                      (item, position) =>
                                        position === index ? next : item,
                                    ),
                                  })
                                }
                              />
                              <Button
                                title={`Remove advertising image ${index + 1}`}
                                variant="ghost"
                                onPress={() =>
                                  change({
                                    adImages: draft.adImages.filter(
                                      (_, position) => position !== index,
                                    ),
                                  })
                                }
                              />
                            </View>
                          ))}
                          <Button
                            title="Upload advertising image"
                            onPress={() => {
                              void upload("advertising");
                            }}
                            variant="secondary"
                            icon="images-outline"
                          />
                          <Button
                            title="Add advertising image URL"
                            onPress={() =>
                              change({ adImages: [...draft.adImages, ""] })
                            }
                            variant="ghost"
                            icon="link-outline"
                          />
                          {!draft.adImages.some(Boolean) && (
                            <Notice>
                              No advertising image yet. The reviewer may request
                              suitable creative before distribution.
                            </Notice>
                          )}
                          <Text style={styles.muted}>
                            JPEG, PNG, or WebP · up to 8 MB per upload. Video
                            creatives and other formats are unsupported in this
                            prototype.
                          </Text>
                          {!!errors.visuals && (
                            <Text style={styles.error}>{errors.visuals}</Text>
                          )}
                        </View>
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
                        <Text style={styles.muted}>
                          Choose your audience and how to reach them. The
                          platform reviews these proposed settings.
                        </Text>
                        <Field
                          label="Target geographic locations *"
                          maxLength={1000}
                          value={draft.geography}
                          onChangeText={(geography) => change({ geography })}
                          placeholder="For example, Pune and nearby communities"
                          error={errors.geography}
                          hint="Use cities, regions, or countries. The platform will confirm available targeting."
                        />
                        <Field
                          label="Audience characteristics & interests"
                          multiline
                          maxLength={1000}
                          value={draft.interests}
                          onChangeText={(interests) => change({ interests })}
                          placeholder="What does this audience care about?"
                          hint="Describe relevant interests. Avoid private personal information or sensitive individual targeting."
                        />
                        <View style={{ gap: 12 }}>
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
                        </View>
                        <View style={{ gap: 15 }}>
                          <Text style={styles.h2}>Proposed ad allocation</Text>
                          <Text style={styles.muted}>
                            Split 100% of the advertising budget. You’ll set
                            your funding goal at Submit; fees are deducted
                            before this split.
                          </Text>
                          {draft.channels.map((channel) => (
                            <Field
                              key={channel}
                              label={`${channel} · percent of ad budget`}
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
                          ))}
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
                        <Field
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
                            {draft.goal
                              ? `${number(estimate(draft.goal, config.data))} people, estimated from your saved funding goal`
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
                        <Text style={styles.muted}>
                          Set your funding goal, review the campaign, and
                          confirm the rules before submitting.
                        </Text>
                        <Field
                          label="Your funding goal · USD *"
                          keyboardType="decimal-pad"
                          editable={!fundingLocked}
                          value={working.goalInput}
                          onChangeText={(raw) => {
                            if (/^\d{0,6}(\.\d{0,2})?$/.test(raw)) {
                              setActive((previous) =>
                                previous
                                  ? {
                                      ...previous,
                                      goalInput: raw,
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
                            }
                          }}
                          placeholder="Enter the goal you choose"
                          error={errors.goal}
                          hint={
                            fundingLocked
                              ? "Your published goal is locked to protect existing backer expectations. Story and creative changes still require review."
                              : "You set this amount. Demo policy: $0.01–$100,000, up to two decimal places. Drafting assistance never sets or changes it."
                          }
                        />
                        <View style={[styles.card, { padding: 16, gap: 10 }]}>
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
                              {((config.data?.feeRate ?? 0.05) * 100).toFixed(
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
                            {config.data?.peoplePerAdDollar ?? 27} people per
                            advertising dollar, after fees. This is an estimate,
                            not guaranteed delivery or measured unique reach.
                          </Text>
                        </View>
                        <CampaignPreview draft={draft} config={config.data} />
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
        </ScrollView>
        {working && mode !== "entry" && mode !== "submitted" && (
          <View style={local.footer}>
            {preview ? (
              <Button
                title="Return to editing"
                onPress={() => {
                  setPreview(false);
                  scroll.current?.scrollTo({ y: 0, animated: false });
                }}
                variant="secondary"
                icon="create-outline"
              />
            ) : (
              <>
                <View style={styles.row}>
                  <Button
                    title="Back"
                    variant="ghost"
                    style={{ minWidth: 78 }}
                    onPress={goBack}
                    disabled={locked}
                  />
                  {mode === "voice" ? (
                    <Button
                      title="Continue manually"
                      style={{ flex: 1 }}
                      variant="secondary"
                      onPress={manualMode}
                    />
                  ) : (
                    <Button
                      title={step === 4 ? "Submit for Review" : "Continue"}
                      icon={
                        step === 4 ? "paper-plane-outline" : "arrow-forward"
                      }
                      loading={busy}
                      disabled={!!uploading || (step === 4 && config.isLoading)}
                      style={{ flex: 1 }}
                      onPress={() => {
                        if (step === 4) {
                          void submit();
                          return;
                        }
                        const invalid = validateStep(draft!, step);
                        if (Object.keys(invalid).length) {
                          setErrors(invalid);
                          setFailure(
                            "Please check the highlighted fields to continue.",
                          );
                          scroll.current?.scrollTo({ y: 0, animated: true });
                        } else changeStep(step + 1);
                      }}
                    />
                  )}
                </View>
              </>
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}

const local = StyleSheet.create({
  frame: { flex: 1, width: "100%", maxWidth: 640, alignSelf: "center" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 18,
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: colors.ink },
  editorTitle: {
    fontSize: 18,
    lineHeight: 24,
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
