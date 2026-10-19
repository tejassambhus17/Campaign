import type { Campaign } from "../../lib/types";

export type WritingStep = 0 | 1;
export type WritingTarget = { step: WritingStep; field: string };
export type WritingSuggestion = {
  id: string;
  rule: string;
  target: WritingTarget;
  title: string;
  detail: string;
  /** Exact text proposed for an explicit, reversible edit. */
  preview?: string;
  action: string;
};
type ApplicableSuggestion = WritingSuggestion & { patch?: Partial<Campaign> };
export type WritingDismissals = { draftKey: string; ids: string[] };

// Identifiers are for UI continuity, not security. Only fields used by a rule
// participate, so unrelated edits do not revive a dismissed suggestion.
function identity(rule: string, values: unknown[]): string {
  const text = JSON.stringify(values);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${rule}:${(hash >>> 0).toString(36)}`;
}

const clean = (value: string) => value.trim().replace(/[\t ]+/g, " ");
const words = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

/** Copy an existing complete sentence/paragraph; never manufacture a claim. */
function summaryCandidate(draft: Campaign): string | undefined {
  const text = draft.intro.trim() || draft.sections.find(section => section.kind === "text" && section.text.trim())?.text.trim();
  if (!text) return undefined;
  const paragraph = text.split(/\n\s*\n/)[0].trim();
  const sentence = paragraph.match(/^.*?[.!?](?=\s|$)/s)?.[0] || paragraph;
  return sentence.length <= 400 ? sentence : undefined;
}

function rules(draft: Campaign, step: WritingStep): ApplicableSuggestion[] {
  const result: ApplicableSuggestion[] = [];
  const add = (rule: string, values: unknown[], suggestion: Omit<ApplicableSuggestion, "id" | "rule">) => {
    result.push({ id: identity(rule, values), rule, ...suggestion });
  };
  if (step === 0) {
    const headline = clean(draft.storyHeadline);
    const title = clean(draft.title);
    if (!title && headline && headline.length <= 60) {
      add("reuse-story-headline", [draft.title, draft.storyHeadline], {
        target: { step, field: "title" }, title: "Use your story headline", detail: "Your existing headline fits the 60-character title limit.", preview: headline, action: "Use as title", patch: { title: headline },
      });
    } else if (title && title !== draft.title && title.length <= 60) {
      add("tidy-title", [draft.title], {
        target: { step, field: "title" }, title: "Tidy your title", detail: "Remove extra spaces without changing your words.", preview: title, action: "Apply edit", patch: { title },
      });
    } else if (title && words(title) < 3) {
      add("specific-title", [draft.title], {
        target: { step, field: "title" }, title: "Make the title specific", detail: "Name the message or who it matters to. Keep it within 60 characters.", action: "Edit title",
      });
    }

    if (!draft.summary.trim()) {
      const candidate = summaryCandidate(draft);
      add("introduce-message", [draft.summary, candidate || ""], {
        target: { step, field: "summary" }, title: candidate ? "Reuse your opening sentence" : "Introduce your message",
        detail: candidate ? "Use this sentence from your story as a starting summary. You can edit it afterward." : "In one or two sentences, say what people should understand and why it matters.",
        preview: candidate, action: candidate ? "Use as summary" : "Write summary", patch: candidate ? { summary: candidate } : undefined,
      });
    } else {
      const summary = clean(draft.summary);
      if (summary !== draft.summary && summary.length <= 2000) {
        add("tidy-summary", [draft.summary], {
          target: { step, field: "summary" }, title: "Tidy your summary", detail: "Remove extra spaces and keep your wording.", preview: summary, action: "Apply edit", patch: { summary },
        });
      } else if (words(summary) < 8) {
        add("specific-summary", [draft.summary], {
          target: { step, field: "summary" }, title: "Give readers a little context", detail: "Explain who or what is affected, and what learning about it could change.", action: "Edit summary",
        });
      }
    }
    return result;
  }

  if (!draft.storyHeadline.trim() && draft.title.trim()) {
    const title = clean(draft.title);
    if (title.length <= 200) add("reuse-campaign-title", [draft.title, draft.storyHeadline], {
      target: { step, field: "storyHeadline" }, title: "Start with your campaign title", detail: "Reuse your title as the story headline, then refine it in the editor.", preview: title, action: "Use as headline", patch: { storyHeadline: title },
    });
  }
  if (!draft.intro.trim() && draft.summary.trim() && draft.summary.trim().length <= 15000) {
    add("reuse-summary", [draft.intro, draft.summary], {
      target: { step, field: "intro" }, title: "Start with your summary", detail: "Use the summary you wrote in Basics as your introduction.", preview: draft.summary.trim(), action: "Use as introduction", patch: { intro: draft.summary.trim() },
    });
  }
  const story = [draft.intro, ...draft.sections.filter(section => ["text", "action", "statistic"].includes(section.kind)).map(section => section.text)].filter(Boolean).join(" ");
  if (story.trim() && words(story) < 35) {
    add("story-context", [draft.intro, draft.sections.filter(section => section.kind === "text").map(section => [section.id, section.text])], {
      target: { step, field: "intro" }, title: "Make your story specific", detail: "Explain where this is happening, who it affects and why the message matters. Add only details you can support.", action: "Edit introduction",
    });
  }
  if (story.trim() && !draft.sections.some(section => section.kind === "action" && section.text.trim()) && !/\b(learn|read|share|join|explore|visit|watch|discover|sign)\b/i.test(story)) {
    const action = "Learn more about this message and share it with someone who should see it.";
    const values = [draft.intro, draft.sections];
    add("audience-action", values, {
      target: { step, field: "storyHeadline" }, title: "Give readers a next step", detail: "Add an editable audience-action section. This invites learning and sharing; it does not ask for a direct donation.", preview: action, action: "Add action section",
      patch: { sections: [...draft.sections, { id: `writing-action-${identity("section", values).split(":")[1]}`, kind: "action", text: action }] },
    });
  }
  if (story.trim() && !draft.sources.length) {
    add("supporting-source", [!!story.trim(), draft.sources.length], {
      target: { step, field: "sources" }, title: "Support your factual claims", detail: "Add a relevant public source you have checked. Suggestions never invent links or verify claims.", action: "Add a source",
    });
  }
  return result;
}

export function writingSuggestions(draft: Campaign, step: WritingStep): WritingSuggestion[] {
  return rules(draft, step).map(({ patch, ...suggestion }) => {
    void patch;
    return suggestion;
  });
}

/**
 * Re-evaluate against the current draft before applying. A stale suggestion
 * cannot overwrite a newer edit or replace unrelated fields. Patches are
 * generated locally rather than trusted from a stored suggestion object.
 */
export function applyWritingSuggestion(draft: Campaign, suggestion: WritingSuggestion): Partial<Campaign> | null {
  const current = rules(draft, suggestion.target.step).find(candidate => candidate.id === suggestion.id);
  return current?.patch || null;
}

export function dismissWritingSuggestion(state: WritingDismissals, draftKey: string, id: string): WritingDismissals {
  const ids = state.draftKey === draftKey ? state.ids : [];
  return { draftKey, ids: ids.includes(id) ? ids : [...ids, id] };
}

export function visibleWritingSuggestions(draft: Campaign, step: WritingStep, draftKey: string, dismissed: WritingDismissals): WritingSuggestion[] {
  const ids = dismissed.draftKey === draftKey ? dismissed.ids : [];
  return writingSuggestions(draft, step).filter(suggestion => !ids.includes(suggestion.id));
}
