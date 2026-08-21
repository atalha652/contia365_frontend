import { ONBOARDING_URL, CENSUS_URL } from "../restEndpoint";
import { httpGet, httpPost, httpPatch, httpPostBlob } from "../../utils/httpMethods";

const unwrapCensusRecord = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  if (payload.taxpayer_identity || payload.professional_registration) return payload;
  return payload.data || payload.record || payload.census || payload;
};

export const getCensusRecordId = (record) =>
  record?._id || record?.id || record?.record_id || record?.census_id || null;

export const selectCountry = async (country) => {
  try {
    const response = await httpPost({
      url: ONBOARDING_URL + "/select-country",
      payload: { country },
    });
    return response;
  } catch (err) {
    console.error("Select country error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};

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
    return unwrapCensusRecord(response?.data);
  } catch (err) {
    console.error("Get latest census record error:", err);
    return null;
  }
};

export const saveCensusProfile = async (payload) => {
  try {
    const response = await httpPost({
      url: `${CENSUS_URL}/`,
      payload,
    });
    return response;
  } catch (err) {
    console.error("Save census profile error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};

export const updateCensusProfile = async (recordId, payload) => {
  try {
    const response = await httpPatch({
      url: `${CENSUS_URL}/${recordId}`,
      payload,
    });
    return response;
  } catch (err) {
    console.error("Update census profile error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};
