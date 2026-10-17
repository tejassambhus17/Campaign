export const detailSections = ["Story", "Updates", "Impact", "Sources"] as const;
export type DetailSection = typeof detailSections[number];

export function requestedDetailSection(value?: string | string[]): DetailSection {
  const label = Array.isArray(value) ? value[0] : value;
  return detailSections.find(section => section.toLowerCase() === label?.toLowerCase()) || "Story";
}

