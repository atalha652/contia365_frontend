// Gmail API service functions to integrate backend Gmail endpoints
import { GMAIL_URL } from "../restEndpoint";
import { httpGet, httpPost } from "../../utils/httpMethods";

// Check Gmail authentication status
// Simple English: This asks backend if Gmail is authenticated.
export const checkGmailAuth = async () => {
  try {
    const response = await httpGet({ url: `${GMAIL_URL}/auth` });
    return response?.data || { success: false };
  } catch (err) {
    console.error("Check Gmail auth error:", err);
    throw err;
  }
};

// Get OAuth2 authorization URL (redirect)
// Simple English: This returns a URL to start Gmail authorization.
export const authorizeGmailUrl = (user_id) => {
  if (!user_id) throw new Error("Missing user_id for Gmail authorization");
  return `${GMAIL_URL}/oauth2/authorize/?user_id=${encodeURIComponent(user_id)}`;
};

// Fetch purchase emails
// Simple English: This gets purchase emails with optional paging.
export const getGmailPurchases = async ({ user_id, max_results = 50, page_token = null }) => {
  try {
    if (!user_id) throw new Error("Missing user_id for Gmail purchases");
    const params = new URLSearchParams();
    params.append("user_id", user_id);
    if (max_results) params.append("max_results", String(max_results));
    if (page_token) params.append("page_token", page_token);
    const response = await httpGet({ url: `${GMAIL_URL}/purchases?${params.toString()}` });
    return response?.data || { emails: [], total_found: 0 };
  } catch (err) {
    console.error("Get Gmail purchases error:", err);
    throw err;
  }
};

// Search emails by Gmail query
// Simple English: This searches emails with a Gmail query string.
export const searchGmailEmails = async ({ user_id, query, max_results = 50 }) => {
  try {
    if (!user_id) throw new Error("Missing user_id for Gmail search");
    if (!query) throw new Error("Missing query for Gmail search");
    const url = `${GMAIL_URL}/search?user_id=${encodeURIComponent(user_id)}`;
    const response = await httpPost({ url, payload: { query, max_results } });
    return response?.data || { emails: [], total_found: 0 };
  } catch (err) {
    console.error("Search Gmail emails error:", err);
    throw err;
  }
};

// Filter purchase emails by criteria
// Simple English: This filters purchases by sender, subject, amount, date, etc.
export const filterGmailPurchases = async ({ user_id, filter }) => {
  try {
    if (!user_id) throw new Error("Missing user_id for Gmail filter");
    const url = `${GMAIL_URL}/purchases/filter?user_id=${encodeURIComponent(user_id)}`;
    const response = await httpPost({ url, payload: filter || {} });
    return response?.data || { emails: [], total_found: 0 };
  } catch (err) {
    console.error("Filter Gmail purchases error:", err);
    throw err;
  }
};

// Get purchases summary by merchant and type
// Simple English: This returns totals grouped by merchant and purchase type.
export const getGmailPurchaseSummary = async ({ user_id }) => {
  try {
    if (!user_id) throw new Error("Missing user_id for Gmail summary");
    const response = await httpGet({ url: `${GMAIL_URL}/purchases/summary?user_id=${encodeURIComponent(user_id)}` });
    return response?.data || { by_merchant: {}, by_purchase_type: {} };
  } catch (err) {
    console.error("Get Gmail purchase summary error:", err);
    throw err;
  }
};

// Get full details of a specific email
// Simple English: This fetches one email's full details by id.
export const getGmailEmailDetails = async ({ user_id, email_id }) => {
  try {
    if (!user_id) throw new Error("Missing user_id for email details");
    if (!email_id) throw new Error("Missing email_id for email details");
    const response = await httpGet({ url: `${GMAIL_URL}/${encodeURIComponent(email_id)}?user_id=${encodeURIComponent(user_id)}` });
    return response?.data || {};
  } catch (err) {
    console.error("Get Gmail email details error:", err);
    throw err;
  }
};

// Health check
// Simple English: This checks if Gmail APIs are healthy.
export const getGmailHealth = async () => {
  try {
    const response = await httpGet({ url: `${GMAIL_URL}/health` });
    return response?.data || { status: "unknown" };
  } catch (err) {
    console.error("Get Gmail health error:", err);
    throw err;
  }
};