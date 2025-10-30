import { VOUCHER_URL } from "../restEndpoint";
import { httpPost, httpGet } from "../../utils/httpMethods";

// Upload voucher(s): receipts or invoices
export const uploadVouchers = async ({ user_id, files }) => {
  try {
    if (!user_id) throw new Error("Missing user_id for voucher upload");
    if (!files || files.length === 0) throw new Error("Please select at least one file");

    const formData = new FormData();
    formData.append("user_id", user_id);
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