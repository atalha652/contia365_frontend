// Analytics API service functions for fetching real backend data
import { REPORT_URL } from "../restEndpoint";
import { httpGet } from "../../utils/httpMethods";

// Get user monthly report data for revenue analytics
export const getUserMonthlyReport = async (userId) => {
  try {
    if (!userId) throw new Error('Missing userId for fetching monthly report');
    const response = await httpGet({ 
      url: `${REPORT_URL}/report/${userId}`
    });
    return response?.data || [];
  } catch (err) {
    console.error('Get monthly report error:', err);
    throw err;
  }
};

// Get projects by date range for trend analysis
export const getProjectsByDateRange = async (userId, startDate, endDate) => {
  try {
    if (!userId) throw new Error('Missing userId for fetching projects by date range');
    const response = await httpGet({ 
      url: `${REPORT_URL}/projects/date-range?user_id=${userId}&start_date=${startDate}&end_date=${endDate}`
    });
    return response?.data || { count: 0, data: [] };
  } catch (err) {
    console.error('Get projects by date range error:', err);
    throw err;
  }
};