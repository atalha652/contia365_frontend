import { WAITLIST_URL } from "../restEndpoint";
import { httpGet, httpPost } from "../../utils/httpMethods";

export const canViewSalesWaitlist = (user = {}) => {
  const role = String(user.role || "").toLowerCase();
  const type = String(
    user.user_type_selection || user.user_type || user.type || ""
  ).toLowerCase();
  return role === "admin" || type === "advisor" || type === "asesor";
};

export const joinWaitlist = async ({ interest, source = "onboarding" }) => {
  const response = await httpPost({
    url: `${WAITLIST_URL}/`,
    payload: { interest, source },
  });
  return response;
};

export const getMyWaitlist = async () => {
  try {
    const response = await httpGet({ url: `${WAITLIST_URL}/me` });
    const data = response?.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const listSalesWaitlist = async () => {
  const response = await httpGet({ url: `${WAITLIST_URL}/` });
  const data = response?.data;
  return Array.isArray(data) ? data : [];
};
