import { TAX_PERCIPIENTS_URL } from "../restEndpoint";
import { httpDelete, httpGet, httpPatch, httpPost } from "../../utils/httpMethods";

const unwrapList = (payload) => {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const unwrapRow = (payload) => {
  const data = payload?.data ?? payload;
  return data?.data && typeof data.data === "object" ? data.data : data;
};

export const listPercipients = async ({ year, quarter } = {}) => {
  const params = {};
  if (year) params.year = year;
  if (quarter) params.quarter = quarter;
  const response = await httpGet({ url: `${TAX_PERCIPIENTS_URL}/`, params });
  return unwrapList(response?.data);
};

export const createPercipient = async (payload) => {
  const response = await httpPost({ url: `${TAX_PERCIPIENTS_URL}/`, payload });
  return unwrapRow(response?.data);
};

export const updatePercipient = async (rowId, payload) => {
  const response = await httpPatch({ url: `${TAX_PERCIPIENTS_URL}/${rowId}`, payload });
  return unwrapRow(response?.data);
};

export const deletePercipient = async (rowId) => {
  await httpDelete({ url: `${TAX_PERCIPIENTS_URL}/${rowId}` });
};
