export type TourRect = { x: number; y: number; width: number; height: number };
export type TourViewport = { width: number; height: number; top: number; bottom: number };

/** A partially hidden or stale target is not an available action. */
export function visibleTourTarget(rect: TourRect | null, viewport: TourViewport): TourRect | null {
  if (!rect || ![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite)) return null;
  if (rect.width < 12 || rect.height < 12 || rect.x < 0 || rect.y < viewport.top ||
    rect.x + rect.width > viewport.width + 1 || rect.y + rect.height > viewport.height - viewport.bottom + 1) return null;
  const x = Math.max(4, rect.x - 4), y = Math.max(viewport.top, rect.y - 4);
  return { x, y, width: Math.min(viewport.width - 4, rect.x + rect.width + 4) - x,
    height: Math.min(viewport.height - viewport.bottom, rect.y + rect.height + 4) - y };
}

export function placeTourCard(viewport: TourViewport, target: TourRect | null, measuredHeight: number) {
  const top = viewport.top + 12, bottom = viewport.height - viewport.bottom - 12;
  const maxHeight = Math.max(80, bottom - top);
  const height = Math.min(Math.max(1, measuredHeight), maxHeight);
  if (target) {
    const below = target.y + target.height + 12;
    const above = target.y - height - 12;
    if (below + height <= bottom) return { top: below, maxHeight: bottom - below, anchored: true };
    if (above >= top) return { top: above, maxHeight: target.y - 12 - top, anchored: true };
  }
  return { top: top + Math.max(0, (maxHeight - height) / 2), maxHeight, anchored: false };
}
