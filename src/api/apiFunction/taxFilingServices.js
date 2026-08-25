import { TAX_FILINGS_URL } from "../restEndpoint";
import { httpGet, httpGetBlob, httpPost } from "../../utils/httpMethods";

export const FILING_STATUSES = [
  "DRAFT",
  "CALCULATED",
  "IN_REVIEW",
  "APPROVED",
  "SUBMITTED",
  "ACCEPTED",
  "REJECTED",
];

export const LIVE_MODELOS = new Set(["111", "115", "130", "190", "303", "390"]);
export const PERCIPIENT_MODELOS = new Set(["111", "190"]);

export const canLiveSubmitFiling = (filing) => {
  if (typeof filing?.can_live_submit === "boolean") return filing.can_live_submit;
  return LIVE_MODELOS.has(String(filing?.modelo || ""));
};

export const filingNeedsPercipients = (filing) => {
  if (typeof filing?.needs_percipients === "boolean") return filing.needs_percipients;
  return PERCIPIENT_MODELOS.has(String(filing?.modelo || ""));
};

export const getFilingId = (filing) =>
  filing?._id || filing?.id || filing?.filing_id || null;

export const getFilingStatus = (filing) =>
  String(filing?.status || "DRAFT").toUpperCase();

export const getFilingCalculation = (filing) => {
  if (!filing || typeof filing !== "object") return null;
  const nested =
    filing.calculation ||
    filing.calculated ||
    filing.result ||
    filing.tax_result ||
    filing.engine_result ||
    filing.tax_engine_result;
  const source = nested && typeof nested === "object" && !Array.isArray(nested) ? nested : filing;
  const totals = source.totals || filing.totals;
  if (totals && typeof totals === "object" && !Array.isArray(totals)) {
    return {
      ...source,
      totals,
      modelo: source.modelo || filing.modelo,
      year: source.year || filing.year,
      quarter: source.quarter || filing.quarter,
      month: source.month || filing.month,
      period_key: source.period_key || filing.period_key,
      calculated_at: source.calculated_at || filing.calculated_at,
      transactions_count: source.transactions_count ?? filing.transactions_count,
    };
  }
  const amountKeys = [
    "vat_payable", "output_vat", "input_vat", "irpf_payable", "irpf_to_pay", "net_income", "gross_income",
    "net_vat", "total_income", "total_expenses", "taxable_income", "total_base", "total_withholding",
    "total_withheld", "withholding_payable", "percipient_count",
  ];
  if (amountKeys.some((key) => source[key] != null || filing[key] != null)) {
    return {
      ...filing,
      ...source,
      totals: totals || source,
      modelo: filing.modelo,
      year: filing.year,
      quarter: filing.quarter,
      month: filing.month,
      period_key: filing.period_key,
    };
  }
  return null;
};

const unwrapFiling = (payload) => {
  if (typeof payload === "string") return { id: payload, _id: payload };
  if (!payload || typeof payload !== "object") return payload;
  if (payload.status || payload.modelo || payload._id || payload.id) {
    if (payload.data && typeof payload.data === "object" && (payload.data.status || payload.data.modelo)) {
      return payload.data;
    }
    return payload;
  }
  return payload.data || payload.filing || payload;
};

const unwrapFilingList = (payload) => {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.filings)) return data.filings;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const createTaxFiling = async ({ modelo, year, quarter, month, period_key }) => {
  const payload = { modelo, year };
  if (month) payload.month = Number(month);
  else if (period_key) payload.period_key = period_key;
  else if (quarter) payload.quarter = quarter;
  const response = await httpPost({ url: `${TAX_FILINGS_URL}/`, payload });
  return unwrapFiling(response?.data);
};

export const listTaxFilings = async ({ status, year, modelo } = {}) => {
  const params = {};
  if (status) params.status = status;
  if (year) params.year = year;
  if (modelo) params.modelo = modelo;
  const response = await httpGet({ url: `${TAX_FILINGS_URL}/`, params });
  return unwrapFilingList(response?.data);
};

export const getTaxFiling = async (filingId) => {
  const response = await httpGet({ url: `${TAX_FILINGS_URL}/${filingId}` });
  return unwrapFiling(response?.data);
};

export const calculateTaxFiling = async (filingId, { modelo_id, comment } = {}) => {
  const payload = {};
  if (modelo_id) payload.modelo_id = modelo_id;
  if (comment) payload.comment = comment;
  const response = await httpPost({
    url: `${TAX_FILINGS_URL}/${filingId}/calculate`,
    payload,
  });
  return unwrapFiling(response?.data);
};

export const reviewTaxFiling = async (filingId, { comment } = {}) => {
  const response = await httpPost({
    url: `${TAX_FILINGS_URL}/${filingId}/review`,
    payload: comment ? { comment } : {},
  });
  return unwrapFiling(response?.data);
};

export const approveTaxFiling = async (filingId, { comment } = {}) => {
  const response = await httpPost({
    url: `${TAX_FILINGS_URL}/${filingId}/approve`,
    payload: comment ? { comment } : {},
  });
  return unwrapFiling(response?.data);
};

export const formatTaxFilingError = (err, fallback = "Action failed") => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (detail && typeof detail === "object") {
    return (
      detail.description ||
      detail.detail ||
      (typeof detail.error === "string" ? detail.error : null) ||
      fallback
    );
  }
  return err?.message || fallback;
};

export const submitTaxFiling = async (
  filingId,
  { comment, test_mode = true, cert_password } = {}
) => {
  const payload = { test_mode: Boolean(test_mode) };
  if (comment) payload.comment = comment;
  if (!payload.test_mode) {
    const password = String(cert_password || "").trim();
    if (!password) {
      throw new Error("cert_password is required for live AEAT submission.");
    }
    payload.cert_password = password;
  }
  const response = await httpPost({
    url: `${TAX_FILINGS_URL}/${filingId}/submit`,
    payload,
  });
  return unwrapFiling(response?.data);
};

export const recordTaxFilingResult = async (filingId, payload) => {
  const response = await httpPost({
    url: `${TAX_FILINGS_URL}/${filingId}/result`,
    payload,
  });
  return unwrapFiling(response?.data);
};

const filenameFromDisposition = (header, fallback) => {
  const match = String(header || "").match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
  if (!match) return fallback;
  try {
    return decodeURIComponent(match[1].replace(/"/g, "").trim());
  } catch {
    return match[1].replace(/"/g, "").trim() || fallback;
  }
};

export const downloadTaxFilingJustificante = async (filingId, fallbackName) => {
  const response = await httpGetBlob({
    url: `${TAX_FILINGS_URL}/${filingId}/justificante`,
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const filename = filenameFromDisposition(
    response.headers?.["content-disposition"],
    fallbackName || `justificante-${filingId}.pdf`
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return filename;
};
