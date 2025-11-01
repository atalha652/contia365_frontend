import { VOUCHER_URL } from "../restEndpoint";
import { httpPost, httpGet } from "../../utils/httpMethods";
import { SERVER_PATH } from "../restEndpoint";

// Upload voucher(s): receipts or invoices with optional transaction_type
// This sends the user's files and metadata to the backend upload endpoint.
export const uploadVouchers = async ({ user_id, files, title, description, category, transaction_type }) => {
  try {
    if (!user_id) throw new Error("Missing user_id for voucher upload");
    if (!files || files.length === 0) throw new Error("Please select at least one file");
    if (!title) throw new Error("Please provide a title");
    if (!category) throw new Error("Please select a category");
    // If transaction_type is provided, ensure it's one of the accepted values
    if (transaction_type && !["credit", "debit"].includes(transaction_type)) {
      throw new Error("transaction_type must be either 'credit' or 'debit'");
    }

    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("title", title);
    formData.append("description", description || "");
    formData.append("category", category);
    if (transaction_type) formData.append("transaction_type", transaction_type);
    files.forEach((file) => formData.append("files", file));

    const response = await httpPost({
      url: `${VOUCHER_URL}/upload`,
      payload: formData,
    });
    return response?.data;
  } catch (err) {
    console.error("Upload vouchers error:", err);
    throw err;
  }
};

// Optional: fetch vouchers for a user (not used yet)
export const getVouchers = async ({ user_id, status }) => {
  try {
    if (!user_id) throw new Error("Missing user_id");
    const query = new URLSearchParams();
    query.append("user_id", user_id);
    if (status) query.append("status", status);
    const response = await httpGet({
      url: `${VOUCHER_URL}/?${query.toString()}`,
    });
    return response?.data;
  } catch (err) {
    console.error("Get vouchers error:", err);
    throw err;
  }
};

// Normalized helper: returns an array of vouchers and count
export const listUserVouchers = async ({ user_id, status }) => {
  try {
    const data = await getVouchers({ user_id, status });
    // Backend returns { count, vouchers } or throws 404 when none
    if (!data) return { count: 0, vouchers: [] };
    // Some versions may return vouchers directly; normalize
    if (Array.isArray(data)) return { count: data.length, vouchers: data };
    const count = Number(data?.count || 0);
    const vouchers = Array.isArray(data?.vouchers) ? data.vouchers : [];
    return { count, vouchers };
  } catch (err) {
    // Treat 404 (No vouchers found) as empty list rather than error
    const statusCode = err?.response?.status;
    if (statusCode === 404) {
      return { count: 0, vouchers: [] };
    }
    console.error("List user vouchers error:", err);
    throw err;
  }
};

// Fetch vouchers awaiting approval for a user
export const getAwaitingApprovalVouchers = async ({ user_id }) => {
  try {
    if (!user_id) throw new Error("Missing user_id");
    const query = new URLSearchParams();
    query.append("user_id", user_id);
    const response = await httpGet({
      url: `${VOUCHER_URL}/awaiting-approval?${query.toString()}`,
    });
    const data = response?.data;
    if (!data) return { count: 0, vouchers: [] };
    if (Array.isArray(data)) return { count: data.length, vouchers: data };
    return {
      count: Number(data?.count || 0),
      vouchers: Array.isArray(data?.vouchers) ? data.vouchers : [],
    };
  } catch (err) {
    const statusCode = err?.response?.status;
    if (statusCode === 404) {
      return { count: 0, vouchers: [] };
    }
    console.error("Get awaiting approval vouchers error:", err);
    throw err;
  }
};

// Send one or multiple vouchers for approval
export const sendVouchersForRequest = async ({ voucher_ids, approver_id }) => {
  try {
    if (!Array.isArray(voucher_ids) || voucher_ids.length === 0)
      throw new Error("Select at least one voucher to send");
    if (!approver_id) throw new Error("Missing approver_id");
    const response = await httpPost({
      url: `${VOUCHER_URL}/send-for-request`,
      payload: { voucher_ids, approver_id },
    });
    return response?.data;
  } catch (err) {
    console.error("Send vouchers for request error:", err);
    throw err;
  }
};

// Approve vouchers in bulk
export const approveVouchers = async ({ voucher_ids, approver_id, notes }) => {
  try {
    if (!Array.isArray(voucher_ids) || voucher_ids.length === 0)
      throw new Error("Select at least one voucher to approve");
    if (!approver_id) throw new Error("Missing approver_id");
    const response = await httpPost({
      url: `${VOUCHER_URL}/approve`,
      payload: { voucher_ids, approver_id, notes },
    });
    return response?.data;
  } catch (err) {
    console.error("Approve vouchers error:", err);
    throw err;
  }
};

// Reject vouchers in bulk
export const rejectVouchers = async ({ voucher_ids, rejected_by, rejection_reason }) => {
  try {
    if (!Array.isArray(voucher_ids) || voucher_ids.length === 0)
      throw new Error("Select at least one voucher to reject");
    if (!rejected_by) throw new Error("Missing rejected_by");
    if (!rejection_reason) throw new Error("Please provide a rejection reason");
    const response = await httpPost({
      url: `${VOUCHER_URL}/reject`,
      payload: { voucher_ids, rejected_by, rejection_reason },
    });
    return response?.data;
  } catch (err) {
    console.error("Reject vouchers error:", err);
    throw err;
  }
};

// Start OCR job for vouchers (bulk or single)
export const runVoucherOCR = async ({ user_id, voucher_ids }) => {
  try {
    if (!user_id) throw new Error("Missing user_id");
    const ids = Array.isArray(voucher_ids) ? voucher_ids : [voucher_ids].filter(Boolean);
    if (ids.length === 0) throw new Error("Select at least one voucher to run OCR");

    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("voucher_ids", ids.join(","));

    const response = await httpPost({
      url: `${SERVER_PATH}/api/accounting/ocr/voucher_ocr`,
      payload: formData,
    });
    return response?.data;
  } catch (err) {
    console.error("Run voucher OCR error:", err);
    throw err;
  }
};

// Check OCR job status
export const getVoucherOCRJobStatus = async ({ job_id }) => {
  try {
    if (!job_id) throw new Error("Missing job_id");
    const response = await httpGet({
      url: `${SERVER_PATH}/api/accounting/ocr/job/${job_id}`,
    });
    return response?.data;
  } catch (err) {
    console.error("Get voucher OCR job status error:", err);
    throw err;
  }
};