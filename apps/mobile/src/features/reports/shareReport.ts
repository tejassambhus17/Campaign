import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Directory, File, Paths } from "expo-file-system";
import { canShareReport, ReportDocument, reportFilename, reportHtml } from "../../lib/report";

const CACHE_FOLDER = "campaign-public-reports-v1";
/** Retain shared files long enough for a receiving app to read its granted URI.
 * Only this public-report cache is pruned; never drafts, uploads or receipts. */
export function pruneReportCache() {
  if (Platform.OS === "web") return;
  try {
    const directory = new Directory(Paths.cache, CACHE_FOLDER);
    if (!directory.exists) return;
    for (const item of directory.list()) {
      if (item instanceof File && /^Campaign-[a-zA-Z0-9_-]+\.pdf$/.test(item.name) && item.modificationTime !== null && item.modificationTime < Date.now() - 24 * 60 * 60 * 1000) item.delete();
    }
  } catch { /* Best effort cache eviction must not block reading reports. */ }
}
export async function shareReport(document: ReportDocument, current: () => boolean) {
  if (!canShareReport(document.snapshot)) throw new Error("Only approved public campaign reports can be shared.");
  if (!current()) return;
  const html = reportHtml(document);
  if (Platform.OS === "web") throw new Error("PDF sharing is available in the Campaign Android app.");
  if (!await Sharing.isAvailableAsync()) throw new Error("Sharing is unavailable on this device. Try again when a sharing app is available.");
  if (!current()) return;
  pruneReportCache();
  let generated: File | undefined;
  try {
    const result = await Print.printToFileAsync({ html, width: 595, height: 842, textZoom: 100 });
    generated = new File(result.uri);
    if (!current()) { generated.delete(); return; }
    if (!generated.exists || generated.size <= 0 || result.numberOfPages < 1) throw new Error("The report could not be rendered. Please try again.");
    const folder = new Directory(Paths.cache, CACHE_FOLDER);
    folder.create({ intermediates: true, idempotent: true });
    const name = reportFilename(document).replace(/\.pdf$/, `-${Date.now().toString(36)}.pdf`);
    generated.move(new File(folder, name));
    if (!current()) { generated.delete(); return; }
    await Sharing.shareAsync(generated.uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: "Share campaign report" });
    // Chooser completion is not proof of delivery; never announce 'Sent'.
  } catch (error) {
    if (generated?.exists) generated.delete();
    throw error;
  }
}
