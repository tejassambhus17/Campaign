import { Campaign, categories, newDraft } from "../../lib/types";

export const STEPS = [
  "Basics",
  "Story",
  "Campaign & Ad Visuals",
  "Reach",
  "Submit",
];
export const CHANNELS = ["Instagram", "Facebook", "Display"];
export const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
export const blankDraft = (): Campaign => ({
  ...newDraft(),
  channels: ["Instagram", "Facebook"],
  allocation: { Instagram: 60, Facebook: 40 },
});
export const hasContent = (draft: Campaign) =>
  !!(
    draft.title ||
    draft.summary ||
    draft.creatorName ||
    draft.intro ||
    draft.sections.length ||
    draft.sources.length ||
    draft.coverImage
  );
export const isPublicUrl = (text: string) => {
  try {
    const url = new URL(text);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !!url.hostname &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
};
export const isMediaUrl = (text: string) =>
  !text ||
  (text.startsWith("/media/") && !text.includes("..")) ||
  isPublicUrl(text);

export type DraftErrors = Record<string, string>;
export function validateStep(
  draft: Campaign,
  step: number,
  goalInput = "",
  accepted = false,
): DraftErrors {
  const errors: DraftErrors = {};
  if (step === 0) {
    if (!draft.title.trim()) errors.title = "Give your campaign a title.";
    else if (draft.title.length > 60)
      errors.title = "Keep your title to 60 characters.";
    if (!categories.includes(draft.category))
      errors.category = "Choose a category.";
    if (!draft.creatorName.trim())
      errors.creatorName = "Add your name or organization.";
  }
  if (step === 1) {
    if (
      draft.sources.some(
        (source) => !source.title.trim() || !isPublicUrl(source.url),
      )
    )
      errors.sources =
        "Every source needs a title and a public http:// or https:// URL. Remove unused rows.";
    if (
      draft.sections.some(
        (section) => section.kind === "image" && !isMediaUrl(section.url || ""),
      )
    )
      errors.sections =
        "Use an uploaded image or public image URL for story photographs.";
  }
  if (
    step === 2 &&
    (!isMediaUrl(draft.coverImage) ||
      draft.adImages.some((image) => !image || !isMediaUrl(image)))
  )
    errors.visuals =
      "Use an uploaded image or a public http:// or https:// image URL.";
  if (step === 3) {
    if (!draft.geography.trim())
      errors.geography = "Describe the places you want to reach.";
    if (!draft.channels.length)
      errors.channels = "Select at least one distribution channel.";
    const percentages = draft.channels.map(
      (channel) => draft.allocation[channel],
    );
    if (
      percentages.some(
        (value) => !Number.isFinite(value) || value < 0 || value > 100,
      ) ||
      Math.abs(percentages.reduce((sum, value) => sum + value, 0) - 100) > 0.01
    )
      errors.allocation =
        "Allocate exactly 100% across your selected channels.";
    if (
      !Number.isInteger(draft.durationDays) ||
      draft.durationDays < 1 ||
      draft.durationDays > 90
    )
      errors.durationDays =
        "Choose a duration from 1 to 90 days (demo policy).";
  }
  if (step === 4) {
    if (
      !/^\d+(\.\d{1,2})?$/.test(goalInput) ||
      !Number.isFinite(draft.goal) ||
      draft.goal <= 0 ||
      draft.goal > 100000
    )
      errors.goal =
        "Set your goal between $0.01 and $100,000 with up to two decimal places (demo policy).";
    if (!accepted)
      errors.rules =
        "Read and confirm the campaign rules and funding policies.";
  }
  return errors;
}

export type Assistance = {
  idea: string;
  audience: string;
  why: string;
  evidence: string;
  action: string;
};
export type LocalDraft = {
  localId: string;
  draft: Campaign;
  step: number;
  goalInput: string;
  updatedAt: string;
  assistance?: Assistance;
  entryMode?: "voice" | "edit";
  /** Written only after a confirmed account write; older device drafts have no sync claim. */
  accountSavedToken?: string;
};
export function normalizeDraft(
  value: Partial<Campaign> & { currentStep?: number },
): Campaign {
  return {
    ...blankDraft(),
    ...value,
    sections: value.sections || [],
    sources: value.sources || [],
    adImages: value.adImages || [],
    step: value.currentStep ?? value.step ?? 0,
  };
}
export function campaignBody(draft: Campaign, step: number) {
  // Privileged state, owner, balances and approval fields never form part of an edit request.
  const {
    title,
    category,
    creatorName,
    summary,
    coverImage,
    storyHeadline,
    intro,
    sections,
    sources,
    adImages,
    adHeadline,
    adDescription,
    cta,
    geography,
    interests,
    channels,
    allocation,
    durationDays,
    goal,
  } = draft;
  return {
    title,
    category,
    creatorName,
    summary,
    coverImage,
    storyHeadline,
    intro,
    sections,
    sources,
    adImages,
    adHeadline,
    adDescription,
    cta,
    geography,
    interests,
    channels,
    allocation,
    durationDays,
    goal,
    currentStep: step,
    version: draft.version,
  };
}
