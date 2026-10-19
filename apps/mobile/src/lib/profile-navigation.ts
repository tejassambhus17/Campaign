export type ProfileSection = "Overview" | "Studio" | "Created" | "Backed" | "Saved" | "Payments" | "Notifications" | "Edit" | "Appearance" | "Currency" | "Help" | "Review";
export type ProfileEntry = "profile" | "welcome" | "login" | "register";
const sections: readonly ProfileSection[] = ["Overview", "Studio", "Created", "Backed", "Saved", "Payments", "Notifications", "Edit", "Appearance", "Currency", "Help", "Review"];
export function routeValue(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" ? first : undefined;
}
export function profileSection(value: unknown): ProfileSection | null {
  const name = routeValue(value);
  if (name === "Settings") return "Overview"; // Existing notification/deep links stay safe.
  return sections.includes(name as ProfileSection) ? name as ProfileSection : null;
}
export function publicProfileSection(section: ProfileSection): boolean {
  return ["Overview", "Help", "Appearance", "Currency"].includes(section);
}
export function profileEntry({ signedIn, onboarding, auth, section }: {
  signedIn: boolean; onboarding: string; auth?: unknown; section?: unknown;
}): ProfileEntry {
  if (signedIn) return "profile";
  const intent = routeValue(auth);
  if (intent === "login" || intent === "register") return intent;
  const destination = profileSection(section);
  if (destination && !publicProfileSection(destination)) return "login";
  return onboarding === "complete" ? "profile" : "welcome";
}
