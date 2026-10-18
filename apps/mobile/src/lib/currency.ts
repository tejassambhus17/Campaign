/** USD is the immutable accounting currency. INR is a dated display/entry conversion. */
export type DisplayCurrency = "USD" | "INR";
export type ReferenceRate = { base: "USD"; quote: "INR"; rate: number; date: string; fetchedAt: string; source: "Frankfurter"; cached?: boolean };
export type MoneySnapshot = { currency: DisplayCurrency; rate: ReferenceRate | null; unavailable: boolean };
export type MoneyEntryRecord = { raw: string; canonicalUsd: number; snapshot: MoneySnapshot };
export const CURRENCY_KEY = "campaign:currency:v1";
export const RATE_KEY = "campaign:currency-rate:v1";
export const RATE_URL = "https://api.frankfurter.dev/v2/rate/USD/INR";
export const RATE_REFRESH_MS = 24 * 60 * 60 * 1000;
export const RATE_MAX_AGE_MS = 7 * RATE_REFRESH_MS;
export const normalizeCurrency = (value: unknown): DisplayCurrency => value === "INR" ? "INR" : "USD";
export function parseReferenceRate(value: unknown, fetchedAt: string, now = Date.now()): ReferenceRate | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Record<string, unknown>;
  if (r.base !== "USD" || r.quote !== "INR" || typeof r.rate !== "number" || !Number.isFinite(r.rate) || r.rate <= 0 || r.rate > 10000 || typeof r.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return null;
  const observed = Date.parse(`${r.date}T00:00:00Z`), fetched = Date.parse(fetchedAt);
  if (!Number.isFinite(observed) || new Date(observed).toISOString().slice(0, 10) !== r.date || observed > now || !Number.isFinite(fetched) || fetched > now + 60000) return null;
  return { base: "USD", quote: "INR", rate: r.rate, date: r.date, fetchedAt, source: "Frankfurter" };
}
export function rateUsable(rate: ReferenceRate | null, now = Date.now()) {
  return !!rate && now - Date.parse(`${rate.date}T00:00:00Z`) <= RATE_MAX_AGE_MS;
}
export function rateStale(rate: ReferenceRate | null, now = Date.now()) {
  return !!rate && (now - Date.parse(rate.fetchedAt) >= RATE_REFRESH_MS || now - Date.parse(`${rate.date}T00:00:00Z`) > 4 * RATE_REFRESH_MS);
}
export function freezeMoneySnapshot(currency: DisplayCurrency, rate: ReferenceRate | null, now = Date.now()): MoneySnapshot {
  const usable = rateUsable(rate, now);
  return { currency: currency === "INR" && usable ? "INR" : "USD", rate: usable && rate ? { ...rate } : null, unavailable: currency === "INR" && !usable };
}
/** Integer minor units and a decimal rate ratio; every conversion rounds once, half up. */
export function convertMinor(units: number, rate: number, direction: "toINR" | "toUSD"): number {
  if (!Number.isSafeInteger(units) || !Number.isFinite(rate) || rate <= 0) return NaN;
  const scale = 1000000n, numerator = BigInt(Math.round(rate * Number(scale)));
  if (numerator <= 0) return NaN;
  const [multiplier, divisor] = direction === "toINR" ? [numerator, scale] : [scale, numerator];
  const sign = units < 0 ? -1n : 1n;
  const result = sign * ((BigInt(Math.abs(units)) * multiplier + divisor / 2n) / divisor);
  const value = Number(result);
  return Number.isSafeInteger(value) ? value : NaN;
}
export function formatNativeMoney(value: number, currency: DisplayCurrency = "USD") {
  const amount = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, minimumFractionDigits: amount % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(amount);
}
export function formatMoney(value: number, snapshot: MoneySnapshot) {
  const cents = Math.round(value * 100);
  if (snapshot.currency === "INR" && snapshot.rate) {
    const converted = convertMinor(cents, snapshot.rate.rate, "toINR");
    if (Number.isFinite(converted)) return formatNativeMoney(converted / 100, "INR");
  }
  return `${formatNativeMoney(value)}${snapshot.unavailable ? " USD" : ""}`;
}
export function inputForUsd(value: number, snapshot: MoneySnapshot) {
  if (!value) return "";
  const units = snapshot.currency === "INR" && snapshot.rate ? convertMinor(Math.round(value * 100), snapshot.rate.rate, "toINR") : Math.round(value * 100);
  return (units / 100).toFixed(2).replace(/\.00$/, "");
}
export function usdFromInput(input: string, snapshot: MoneySnapshot): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(input)) return null;
  const [whole, fraction = ""] = input.split(".");
  const units = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(units)) return null;
  const cents = snapshot.currency === "INR" && snapshot.rate ? convertMinor(units, snapshot.rate.rate, "toUSD") : units;
  return Number.isSafeInteger(cents) ? cents / 100 : null;
}
export function moneyInputWithinLimits(input: string, snapshot: MoneySnapshot, minUsd: number, maxUsd: number) {
  if (usdFromInput(input, snapshot) === null) return false;
  const enteredMinor = Math.round(Number(input) * 100);
  const displayMinor = (usd: number) => snapshot.currency === "INR" && snapshot.rate ? convertMinor(Math.round(usd * 100), snapshot.rate.rate, "toINR") : Math.round(usd * 100);
  return enteredMinor >= displayMinor(minUsd) && enteredMinor <= displayMinor(maxUsd);
}
/** Reject corrupt/stale edits whose recorded USD no longer matches the draft. */
export function restoreMoneyEntry(value: unknown, canonicalUsd: number, fallback: MoneySnapshot): MoneyEntryRecord {
  if (value && typeof value === "object") {
    const entry = value as MoneyEntryRecord;
    const snapshot = entry.snapshot;
    if (typeof entry.raw === "string" && /^\d{0,10}(\.\d{0,2})?$/.test(entry.raw) && entry.canonicalUsd === canonicalUsd && snapshot && (snapshot.currency === "USD" || snapshot.currency === "INR")) {
      const rate = snapshot.rate && parseReferenceRate(snapshot.rate, snapshot.rate.fetchedAt);
      if (snapshot.currency === "USD" || rate) {
        const validSnapshot = { currency: snapshot.currency, rate: rate ? { ...rate, cached: true } : null, unavailable: snapshot.unavailable === true };
        const parsed = usdFromInput(entry.raw, validSnapshot) ?? 0;
        if (parsed === canonicalUsd) return { raw: entry.raw, canonicalUsd, snapshot: validSnapshot };
      }
    }
  }
  return { raw: inputForUsd(canonicalUsd, fallback), canonicalUsd, snapshot: fallback };
}
export function conversionCaption(snapshot: MoneySnapshot, now = Date.now()) {
  if (snapshot.unavailable) return "INR unavailable · showing USD";
  if (snapshot.currency !== "INR" || !snapshot.rate) return "";
  return `INR estimate · Frankfurter ${snapshot.rate.date}${rateStale(snapshot.rate, now) ? " · cached/stale" : snapshot.rate.cached ? " · cached" : ""}`;
}
export function referenceDescription(snapshot: MoneySnapshot, now = Date.now()) {
  if (snapshot.unavailable) return "INR conversion unavailable. Amounts and entry stay in USD; retry Currency in Profile.";
  if (snapshot.currency === "USD" || !snapshot.rate) return "Campaign accounting remains in USD.";
  return `Frankfurter reference · ${snapshot.rate.date} · $1 USD = ${formatNativeMoney(snapshot.rate.rate, "INR")}${rateStale(snapshot.rate, now) ? " · cached/stale" : snapshot.rate.cached ? " · cached" : ""}. Display estimate, not a live payment quote. Rounded to minor units; accounting stays in USD.`;
}

type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> };
type RateResponse = { ok: boolean; json(): Promise<unknown> };
export function createCurrencyStore(storage: Storage, fetchRate: (url: string) => Promise<RateResponse>, now = () => Date.now()) {
  let state = { preference: "USD" as DisplayCurrency, rate: null as ReferenceRate | null, ready: false, loading: false, error: "" };
  const listeners = new Set<() => void>();
  let restorePromise: Promise<void> | undefined, inFlight: Promise<void> | undefined, writes: Promise<void> = Promise.resolve(), revision = 0;
  const update = (patch: Partial<typeof state>) => { state = { ...state, ...patch }; listeners.forEach(fn => fn()); };
  const refreshRate = (force = false) => {
    if (inFlight) return inFlight;
    if (!force && rateUsable(state.rate, now()) && !rateStale(state.rate, now())) return Promise.resolve();
    update({ loading: true, error: "" });
    inFlight = (async () => {
      try {
        const response = await fetchRate(RATE_URL);
        if (!response.ok) throw new Error("Reference rate request failed.");
        const rate = parseReferenceRate(await response.json(), new Date(now()).toISOString(), now());
        if (!rate || !rateUsable(rate, now())) throw new Error("No recent USD/INR reference rate was returned.");
        update({ rate });
        await storage.setItem(RATE_KEY, JSON.stringify(rate)).catch(() => update({ error: "Reference rate loaded but could not be cached on this device." }));
      } catch { update({ error: rateUsable(state.rate, now()) ? "Rate refresh unavailable. Using the dated cached reference." : "INR conversion unavailable. USD remains available." }); }
      finally { update({ loading: false }); inFlight = undefined; }
    })();
    return inFlight;
  };
  const restore = () => {
    if (restorePromise) return restorePromise;
    const initial = revision;
    restorePromise = (async () => {
      try {
        const [preference, cached] = await Promise.all([storage.getItem(CURRENCY_KEY), storage.getItem(RATE_KEY)]);
        let rate: ReferenceRate | null = null;
        try { const r = cached ? JSON.parse(cached) : null; rate = parseReferenceRate(r, r?.fetchedAt, now()); } catch { /* Invalid cache must never become a made-up rate. */ }
        update({ ...(revision === initial ? { preference: normalizeCurrency(preference) } : {}), rate: state.rate || (rate ? { ...rate, cached: true } : null) });
      } catch { update({ error: "Currency preference could not be restored. Using USD for now." }); }
      finally { update({ ready: true }); }
      if (state.preference === "INR") void refreshRate();
    })();
    return restorePromise;
  };
  const setPreference = async (value: DisplayCurrency) => {
    ++revision;
    const preference = normalizeCurrency(value);
    update({ preference, error: "" });
    const write = writes.catch(() => undefined).then(() => storage.setItem(CURRENCY_KEY, preference)); writes = write;
    if (preference === "INR") void refreshRate();
    try { await write; } catch (error) { update({ error: "Currency changed but could not be saved. Try again." }); throw error; }
  };
  return { getSnapshot: () => state, subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; }, restore, refreshRate, setPreference };
}
