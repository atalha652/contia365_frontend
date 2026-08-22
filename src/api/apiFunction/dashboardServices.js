// Dashboard API service functions to integrate backend stats and summary
import { DASHBOARD_URL, TAX_DASHBOARD_URL } from "../restEndpoint";
import { httpGet, httpPost } from "../../utils/httpMethods";

// Fetch detailed dashboard stats with optional filters
// Simple English: This gets counts, summaries, and recent activity.
export const getDashboardStats = async ({ userId, date_from = null, date_to = null, status = null, transaction_type = null }) => {
  try {
    if (!userId) throw new Error("Missing userId for dashboard stats");
    const params = {};
    if (date_from) params.date_from = date_from;
    if (date_to) params.date_to = date_to;
    if (status) params.status = status;
    if (transaction_type) params.transaction_type = transaction_type;
    const response = await httpGet({ url: `${DASHBOARD_URL}/stats/${userId}`, params });
    return response?.data || {};
  } catch (err) {
    console.error("Get dashboard stats error:", err);
    throw err;
  }
};

// Fetch quick summary for header cards
// Simple English: This gets quick counts used by the top cards.
export const getDashboardSummary = async ({ userId }) => {
  try {
    if (!userId) throw new Error("Missing userId for dashboard summary");
    const response = await httpGet({ url: `${DASHBOARD_URL}/summary/${userId}` });
    return response?.data || {};
  } catch (err) {
    console.error("Get dashboard summary error:", err);
    throw err;
  }
};

// Fetch tax dashboard deadline details for current user
// Uses authenticated endpoint GET /api/tax-dashboard/deadlines
export const getTaxDashboardDeadline = async ({ year } = {}) => {
  try {
    const params = {};
    if (year) params.year = year;
    const response = await httpGet({
      url: `${TAX_DASHBOARD_URL}/deadlines`,
      params,
    });
    return response?.data || { deadlines: [], total: 0 };
  } catch (err) {
    console.error("Get tax dashboard deadline error:", err);
    return { deadlines: [], total: 0 };
  }
};

export const completeTaxObligation = async ({ modelo, year, quarter }) => {
  const payload = { modelo, year };
  if (quarter) payload.quarter = quarter;
  const response = await httpPost({
    url: `${TAX_DASHBOARD_URL}/obligations/complete`,
    payload,
  });
  return response?.data;
};