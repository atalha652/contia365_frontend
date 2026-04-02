import { TAX_ENGINE_URL } from "../restEndpoint";
import { httpPost, httpGet, httpPatch } from "../../utils/httpMethods";

// ── In-memory cache ───────────────────────────────────────────────────────────
// Keyed by "modeloNo:year:quarter" (quarter omitted for annual modelos).
const _calcCache = new Map();

const cacheKey = (modeloNo, year, quarter) =>
  quarter ? `${modeloNo}:${year}:${quarter}` : `${modeloNo}:${year}`;

export const clearTaxCache = (year, quarter) => {
  if (year && quarter) {
    // Remove all entries for this year+quarter across all modelos
    for (const k of _calcCache.keys()) {
      if (k.includes(`:${year}:${quarter}`)) _calcCache.delete(k);
    }
  } else {
    _calcCache.clear();
  }
};

// ── Ledger tax_classification selectors ──────────────────────────────────────
// These are the ONLY functions allowed to derive tax groupings from ledger data.
// All logic is based exclusively on backend-provided tax_classification fields.
// No VAT math, no transaction_type inference, no OCR text parsing.

/**
 * Returns the modelo_ids array from a ledger entry's tax_classification.
 * Falls back to [] if the field is absent (unclassified entry).
 */
export const getModeloIds = (entry) =>
  entry?.tax_classification?.modelo_ids ?? [];

/**
 * Groups an array of ledger entries by their modelo IDs.
 * An entry can appear in multiple groups if it has multiple modelo_ids.
 * Returns a Map<modeloId, entry[]>.
 */
export const groupLedgersByModelo = (entries) => {
  const map = new Map();
  for (const entry of entries ?? []) {
    const ids = getModeloIds(entry);
    if (ids.length === 0) {
      // Unclassified entries go into a special "unclassified" bucket
      const bucket = map.get("unclassified") ?? [];
      bucket.push(entry);
      map.set("unclassified", bucket);
    } else {
      for (const id of ids) {
        const bucket = map.get(String(id)) ?? [];
        bucket.push(entry);
        map.set(String(id), bucket);
      }
    }
  }
  return map;
};

/**
 * Returns matched_modelos array from a ledger entry for audit display.
 * Shape: [{ modelo_id, explanation, signals[] }]
 */
export const getMatchedModelos = (entry) =>
  entry?.tax_classification?.matched_modelos ?? [];

/**
 * Returns signals from a ledger entry's tax_classification as a string array.
 * Handles both array format ["has_vat", ...] and object format {"has_vat": true, ...}.
 * Only returns truthy signal names for the object format.
 */
export const getSignals = (entry) => {
  const raw = entry?.tax_classification?.signals;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  // Object format: { has_vat: true, has_irpf: true, is_rent: false, ... }
  // Return only the keys where value is true
  return Object.entries(raw)
    .filter(([, v]) => v === true)
    .map(([k]) => k);
};

/**
 * Extracts all unique modelo numbers (e.g. "303", "130", "115") present
 * across a list of ledger entries, reading from matched_modelos[].modelo_no.
 * Also builds a modelo_ids_map: { "115": "<objectId>", "130": "<objectId>" }
 * using the first encountered modelo_id per modelo_no.
 * Returns { modeloNos: Set<string>, modeloIdsMap: Record<string, string> }
 */
export const extractModeloNosFromLedgers = (entries) => {
  const modeloNos = new Set();
  const modeloIdsMap = {};
  for (const entry of entries ?? []) {
    const matched = entry?.tax_classification?.matched_modelos ?? [];
    for (const m of matched) {
      const no = m.modelo_no ?? m.modelo_name ?? m.modelo_number ?? m.name;
      if (no) {
        modeloNos.add(String(no));
        // Capture the ObjectID for this modelo (used by 115/111/390/190 APIs)
        if (!modeloIdsMap[String(no)] && m.modelo_id) {
          modeloIdsMap[String(no)] = String(m.modelo_id);
        }
      }
    }
  }
  return { modeloNos, modeloIdsMap };
};

// ── API calls ─────────────────────────────────────────────────────────────────

// ── Quarterly modelos (303, 130, 115, 111) ────────────────────────────────────

export const calculateModelo303 = async ({ year, quarter }) => {
  try {
    const response = await httpPost({ url: `${TAX_ENGINE_URL}/303/calculate`, payload: { year, quarter } });
    return response?.data;
  } catch (err) { console.error("Modelo 303 error:", err); throw err; }
};

export const calculateModelo130 = async ({ year, quarter }) => {
  try {
    const response = await httpPost({ url: `${TAX_ENGINE_URL}/130/calculate`, payload: { year, quarter } });
    return response?.data;
  } catch (err) { console.error("Modelo 130 error:", err); throw err; }
};

// modelo_id = backend ObjectID for the modelo definition (from tax_classification)
export const calculateModelo115 = async ({ year, quarter, modelo_id }) => {
  try {
    const response = await httpPost({ url: `${TAX_ENGINE_URL}/115/calculate`, payload: { year, quarter, modelo_id } });
    return response?.data;
  } catch (err) { console.error("Modelo 115 error:", err); throw err; }
};

export const calculateModelo111 = async ({ year, quarter, modelo_id }) => {
  try {
    const response = await httpPost({ url: `${TAX_ENGINE_URL}/111/calculate`, payload: { year, quarter, modelo_id } });
    return response?.data;
  } catch (err) { console.error("Modelo 111 error:", err); throw err; }
};

// ── Annual modelos (390, 190) — no quarter ────────────────────────────────────

export const calculateModelo390 = async ({ year, modelo_id }) => {
  try {
    const response = await httpPost({ url: `${TAX_ENGINE_URL}/390/calculate`, payload: { year, modelo_id } });
    return response?.data;
  } catch (err) { console.error("Modelo 390 error:", err); throw err; }
};

export const calculateModelo190 = async ({ year, modelo_id }) => {
  try {
    const response = await httpPost({ url: `${TAX_ENGINE_URL}/190/calculate`, payload: { year, modelo_id } });
    return response?.data;
  } catch (err) { console.error("Modelo 190 error:", err); throw err; }
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const getTaxReports = async ({ modelo } = {}) => {
  try {
    const params = modelo ? { modelo } : {};
    const response = await httpGet({ url: `${TAX_ENGINE_URL}/reports`, params });
    return response?.data;
  } catch (err) { console.error("Get tax reports error:", err); throw err; }
};

export const updateTaxReportStatus = async ({ report_id, status }) => {
  try {
    if (!report_id) throw new Error("Missing report_id");
    const response = await httpPatch({ url: `${TAX_ENGINE_URL}/reports/${report_id}/status`, payload: { status } });
    return response?.data;
  } catch (err) { console.error("Update tax report status error:", err); throw err; }
};

// ── calculateAllTaxes ─────────────────────────────────────────────────────────
// Only fires APIs for modelos present in activeModeloNos (derived from ledger
// tax_classification.matched_modelos[].modelo_no).
//
// Rules:
//   111, 115, 130, 303 → quarterly, only fire when quarter is provided
//   390, 190           → annual, fire when year is provided (no quarter needed)
//
// If activeModeloNos is empty (ledgers not yet loaded), nothing fires.
// Pass force=true to bypass cache on explicit user action.
export const calculateAllTaxes = async ({
  year,
  quarter,
  activeModeloNos = new Set(),
  modelo_ids_map = {},
  force = false,
}) => {
  // Nothing to do until ledgers have loaded and classified entries exist
  if (activeModeloNos.size === 0) return {};

  const key = cacheKey("all", year, quarter);
  if (!force && _calcCache.has(key)) return _calcCache.get(key);

  const has = (no) => activeModeloNos.has(String(no));
  const idFor = (no) => modelo_ids_map[no] ? { modelo_id: modelo_ids_map[no] } : {};
  const tasks = {};

  // ── Quarterly modelos — only when a specific quarter is selected ──────────
  if (quarter) {
    if (has("303")) tasks.modelo303 = calculateModelo303({ year, quarter }).catch(() => null);
    if (has("130")) tasks.modelo130 = calculateModelo130({ year, quarter }).catch(() => null);
    if (has("115")) tasks.modelo115 = calculateModelo115({ year, quarter, ...idFor("115") }).catch(() => null);
    if (has("111")) tasks.modelo111 = calculateModelo111({ year, quarter, ...idFor("111") }).catch(() => null);
  }

  // ── Annual modelos — fire whenever they appear in ledgers, quarter-agnostic ─
  if (has("390")) tasks.modelo390 = calculateModelo390({ year, ...idFor("390") }).catch(() => null);
  if (has("190")) tasks.modelo190 = calculateModelo190({ year, ...idFor("190") }).catch(() => null);

  if (Object.keys(tasks).length === 0) return {};

  const keys = Object.keys(tasks);
  const values = await Promise.all(Object.values(tasks));
  const result = Object.fromEntries(keys.map((k, i) => [k, values[i]]));

  _calcCache.set(key, result);
  return result;
};
