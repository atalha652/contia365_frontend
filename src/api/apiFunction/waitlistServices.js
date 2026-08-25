import { WAITLIST_URL } from "../restEndpoint";
import { httpGet, httpPost } from "../../utils/httpMethods";

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
