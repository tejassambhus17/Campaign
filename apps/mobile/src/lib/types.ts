export const categories = [
  "Environment",
  "Health",
  "Science",
  "Education",
  "Public Policy",
  "Economic Policy",
  "Community",
  "Arts & Culture",
  "Business",
  "Other",
];
export type User = { id: string; name: string; email: string; role: string; avatarVersion?: string | null };
export type Section = {
  id: string;
  kind: "text" | "heading" | "image" | "statistic" | "action";
  text: string;
  url?: string;
  caption?: string;
  credit?: string;
  format?: string;
};
export type Source = { id: string; title: string; url: string };
export type Campaign = {
  id: string;
  ownerId: string;
  title: string;
  category: string;
  creatorName: string;
  summary: string;
  coverImage: string;
  storyHeadline: string;
  intro: string;
  sections: Section[];
  sources: Source[];
  adImages: string[];
  adHeadline: string;
  adDescription: string;
  cta: string;
  geography: string;
  interests: string;
  channels: string[];
  allocation: Record<string, number>;
  durationDays: number;
  goal: number;
  raised: number;
  status: string;
  campaignState?: string;
  createdAt: string;
  submittedAt?: string;
  publishedAt?: string;
  setupReady?: boolean;
  deadline?: string;
  featured?: boolean;
  version?: number;
  publicContentHash?: string | null;
  feedback?: string;
  revisionPending?: boolean;
  rulesAccepted?: boolean;
  step?: number;
  currentStep?: number;
};
export type Payment = {
  id: string;
  campaignId: string;
  title: string;
  status: string;
  amount: number;
  fee: number;
  total: number;
  adBudget: number;
  reach: number;
  simulated: boolean;
  createdAt: string;
  receipt?: { id: string; url: string; token: string };
};
export type Notification = {
  id: string;
  title: string;
  body: string;
  category: string;
  campaignId?: string | null;
  campaignTitle?: string | null;
  destination?: {
    type: "campaign" | "creator" | "payments" | "report" | "profile";
    campaignId?: string;
    paymentId?: string;
  };
  createdAt: string;
  read: boolean;
};
export type Config = {
  feeRate: number;
  peoplePerAdDollar: number;
  currency: string;
  categories: string[];
  channels: string[];
  policies: Record<string, string>;
};
export type Me = {
  user: User;
  campaigns: Campaign[];
  payments: Payment[];
  saved: string[];
  followed: string[];
  preferences: {
    categories: Record<string, boolean>;
    delivery: Record<string, boolean>;
  };
};
export const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value || 0);
export const number = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    value || 0,
  );
export const quote = (
  amount: number,
  config?: Pick<Config, "feeRate" | "peoplePerAdDollar">,
) => {
  const amountCents = Math.round(amount * 100);
  const feeCents = Math.round(amountCents * (config?.feeRate ?? 0.05));
  const adCents = amountCents - feeCents;
  return {
    amount: amountCents / 100,
    fee: feeCents / 100,
    total: amountCents / 100,
    adBudget: adCents / 100,
    reach: Math.floor((adCents / 100) * (config?.peoplePerAdDollar ?? 27)),
  };
};
export const estimate = (amount: number, config?: Config) =>
  quote(amount, config).reach;
export const newDraft = (): Campaign => ({
  id: "",
  ownerId: "",
  title: "",
  category: "",
  creatorName: "",
  summary: "",
  coverImage: "",
  storyHeadline: "",
  intro: "",
  sections: [],
  sources: [],
  adImages: [],
  adHeadline: "",
  adDescription: "",
  cta: "Learn more",
  geography: "",
  interests: "",
  channels: ["Instagram", "Facebook"],
  allocation: { Instagram: 60, Facebook: 40 },
  durationDays: 14,
  goal: 0,
  raised: 0,
  status: "Draft",
  createdAt: new Date().toISOString(),
});
