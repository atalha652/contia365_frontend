import { ONBOARDING_URL, CENSUS_URL } from "../restEndpoint";
import { httpGet, httpPost, httpPostBlob } from "../../utils/httpMethods";

export const getUserTypes = async () => {
  try {
    const response = await httpGet({ url: ONBOARDING_URL + "/user-types" });
    return response;
  } catch (err) {
    console.error("Get user types error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};

export const selectUserType = async (userType) => {
  try {
    const response = await httpPost({
      url: ONBOARDING_URL + "/select-user-type",
      payload: { user_type: userType, additional_info: {} },
    });
    return response;
  } catch (err) {
    console.error("Onboarding error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};

export const uploadCensusDocument = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await httpPostBlob({
      url: CENSUS_URL + "/upload",
      payload: formData,
    });
    return response;
  } catch (err) {
    console.error("Census upload error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};

export const getLatestCensusRecord = async () => {
  try {
    const response = await httpGet({ url: CENSUS_URL + "/latest" });
    return response?.data || null;
  } catch (err) {
    console.error("Get latest census record error:", err);
    return null;
  }
};
