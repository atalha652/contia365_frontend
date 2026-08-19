import { INVOICE_URL } from "../restEndpoint";
import { httpGet, httpPost, httpPatch, httpGetBlob } from "../../utils/httpMethods";

// Create a draft invoice from an approved voucher.
// Response includes ocr_source, ocr_ledger_id, and auto-filled customer/lines from OCR.
export const createInvoiceFromVoucher = async ({ voucherId }) => {
  const response = await httpPost({ url: `${INVOICE_URL}/from-voucher/${voucherId}` });
  return response?.data;
};

// List all invoices. Response includes ocr_source, ocr_ledger_id, fingerprint,
// previous_fingerprint, and totals.income_amount / totals.expense_amount.
export const listInvoices = async ({ status } = {}) => {
  const params = {};
  if (status) params.status = status;
  const response = await httpGet({ url: INVOICE_URL, params });
  const data = response?.data;
  if (Array.isArray(data)) return data;
  return data?.invoices ?? data?.items ?? [];
};

// Get a single invoice by ID.
export const getInvoice = async ({ invoiceId }) => {
  const response = await httpGet({ url: `${INVOICE_URL}/${invoiceId}` });
  return response?.data;
};

// Update a draft invoice (PATCH).
// Accepts: invoice_type ("income"|"expense"), series, customer, lines.
// Changing invoice_type recalculates income_amount / expense_amount server-side.
export const updateInvoice = async ({ invoiceId, payload }) => {
  const response = await httpPatch({ url: `${INVOICE_URL}/${invoiceId}`, payload });
  return response?.data;
};

// Issue an invoice — locks it, assigns sequential number, posts ledger entry.
// Response includes fingerprint, previous_fingerprint, and income/expense amounts.
export const issueInvoice = async ({ invoiceId }) => {
  const response = await httpPost({ url: `${INVOICE_URL}/${invoiceId}/issue`, payload: {} });
  return response?.data;
};

// Refresh OCR data on a stale draft invoice.
// Re-fills customer, lines, and totals from the linked OCR ledger record.
// Use for drafts created before OCR ran or before voucher_id linkage was fixed.
export const refreshInvoiceOCR = async ({ invoiceId }) => {
  const response = await httpPost({ url: `${INVOICE_URL}/${invoiceId}/refresh-ocr`, payload: {} });
  return response?.data;
};

// Cancel an issued invoice.
export const cancelInvoice = async ({ invoiceId, reason }) => {
  const response = await httpPost({ url: `${INVOICE_URL}/${invoiceId}/cancel`, payload: { reason } });
  return response?.data;
};

// Verify the VeriFactu hash chain integrity for this organization.
// Returns { valid, total, errors, message }.
// errors[] includes invoice_number, error, expected_previous_fingerprint, stored_previous_fingerprint.
export const verifyInvoiceChain = async () => {
  const response = await httpGet({ url: `${INVOICE_URL}/verify-chain` });
  const data = response?.data;
  if (typeof data === "string") {
    try { return JSON.parse(data); } catch { return { valid: true, total: 0, errors: [], message: data }; }
  }
  return data;
};

// Get the VeriFactu QR URL string for an issued invoice.
// Backend may return a plain string or { invoice_id, qr_url }.
export const getInvoiceQR = async ({ invoiceId }) => {
  const response = await httpGet({ url: `${INVOICE_URL}/${invoiceId}/qr` });
  const data = response?.data;
  if (data && typeof data === "object") return data.qr_url ?? null;
  return data ?? null; // plain string fallback
};

// Download Facturae 3.2.2 XML for an issued invoice.
export const downloadFacturae = async ({ invoiceId }) => {
  const response = await httpGetBlob({ url: `${INVOICE_URL}/${invoiceId}/facturae` });
  return response;
};

// Sign and submit invoice to AEAT VeriFactu.
// payload: { cert_password: string }
// Returns the CSV (Secure Verification Code) on success.
export const submitInvoiceToAEAT = async ({ invoiceId, certPassword }) => {
  const response = await httpPost({
    url: `${INVOICE_URL}/${invoiceId}/submit`,
    payload: { cert_password: certPassword },
  });
  return response?.data;
};
