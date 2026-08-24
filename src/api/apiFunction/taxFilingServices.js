import { TAX_FILINGS_URL } from "../restEndpoint";
import { httpGet, httpPost } from "../../utils/httpMethods";

export const FILING_STATUSES = [
  "DRAFT",
  "CALCULATED",
  "IN_REVIEW",
  "APPROVED",
  "SUBMITTED",
  "ACCEPTED",
  "REJECTED",
];

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
      calculated_at: source.calculated_at || filing.calculated_at,
      transactions_count: source.transactions_count ?? filing.transactions_count,
    };
  }
  const amountKeys = [
    "vat_payable", "output_vat", "input_vat", "irpf_payable", "irpf_to_pay", "net_income", "gross_income",
    "net_vat", "total_income", "total_expenses", "taxable_income", "total_base", "total_withholding",
  ];
  if (amountKeys.some((key) => source[key] != null || filing[key] != null)) {
    return {
      ...filing,
      ...source,
      totals: totals || source,
      modelo: filing.modelo,
      year: filing.year,
      quarter: filing.quarter,
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

export const createTaxFiling = async ({ modelo, year, quarter }) => {
  const payload = { modelo, year };
  if (quarter) payload.quarter = quarter;
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

export const submitTaxFiling = async (filingId, { comment, test_mode = true } = {}) => {
  const payload = { test_mode };
  if (comment) payload.comment = comment;
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
