import { LEDGERS_URL, SERVER_PATH } from "../restEndpoint";
import { httpGet, httpPut, httpDelete, httpGetBlob } from "../../utils/httpMethods";

// This service fetches all ledger entries for a user and normalizes the response
export const getUserLedgers = async ({ user_id }) => {
  try {
    if (!user_id) throw new Error("Missing user_id");
    const response = await httpGet({ url: `${LEDGERS_URL}/user/${user_id}` });
    return response?.data;
  } catch (err) {
    console.error("Get ledgers by user error:", err);
    throw err;
  }
};

// This helper returns a normalized list and count for UI consumption
export const listUserLedgers = async ({ user_id }) => {
  try {
    const data = await getUserLedgers({ user_id });
    const entries = Array.isArray(data?.entries) ? data.entries : [];
    const total_count = Number(data?.total_count ?? entries.length);
    return { total_count, entries };
  } catch (err) {
    // Treat 404/empty cases as empty list rather than error
    const statusCode = err?.response?.status;
    if (statusCode === 404) {
      return { total_count: 0, entries: [] };
    }
    console.error("List user ledgers error:", err);
    throw err;
  }
};

// This service updates the invoice_data for a specific ledger entry
export const updateLedgerInvoiceData = async ({ ledger_id, invoice_data }) => {
  try {
    if (!ledger_id) throw new Error("Missing ledger_id");
    if (!invoice_data || typeof invoice_data !== "object") {
      throw new Error("invoice_data must be a valid object");
    }
    const response = await httpPut({
      url: `${LEDGERS_URL}/${ledger_id}`,
      payload: { invoice_data },
    });
    return response?.data;
  } catch (err) {
    console.error("Update ledger invoice_data error:", err);
    throw err;
  }
};

// This service deletes a ledger entry by ID
export const deleteLedgerEntry = async ({ ledger_id }) => {
  try {
    if (!ledger_id) throw new Error("Missing ledger_id");
    const response = await httpDelete({ url: `${LEDGERS_URL}/${ledger_id}` });
    return response?.data;
  } catch (err) {
    console.error("Delete ledger entry error:", err);
    throw err;
  }
};

// This service exports ledger entries as PDF for a user
export const exportUserLedgersPDF = async ({ user_id, from_date, to_date, entry_type, ids }) => {
  try {
    if (!user_id) throw new Error("Missing user_id");
    
    // Build query parameters object
    const params = {};
    if (from_date) params.from_date = from_date;
    if (to_date) params.to_date = to_date;
    if (entry_type) params.entry_type = entry_type;
    if (ids && Array.isArray(ids) && ids.length > 0) {
      params.ids = ids.join(",");
    }
    
    const url = `${LEDGERS_URL}/user/${user_id}/export-pdf`;
    
    const response = await httpGetBlob({ 
      url,
      params
    });
    return response?.data;
  } catch (err) {
    console.error("Export user ledgers PDF error:", err);
    throw err;
  }
};