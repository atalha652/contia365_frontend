import { ONBOARDING_URL, CENSUS_URL } from "../restEndpoint";
import { httpGet, httpPost, httpPatch, httpPostBlob, httpGetBlob } from "../../utils/httpMethods";

const USER_TYPE_ALIASES = {
  person: "person",
  freelancer: "person",
  autonomo: "person",
  "autónomo": "person",
  individual: "person",
  business: "business",
  company: "business",
  empresa: "business",
  organization: "business",
  advisor: "advisor",
  asesor: "advisor",
};

export const canonicalizeUserType = (id) => {
  if (id == null || id === "") return id;
  const key = String(id).trim().toLowerCase();
  return USER_TYPE_ALIASES[key] || key;
};

const unwrapCensusRecord = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  if (payload.taxpayer_identity || payload.professional_registration) return payload;
  return payload.data || payload.record || payload.census || payload;
};

export const getCensusRecordId = (record) =>
  record?._id || record?.id || record?.record_id || record?.census_id || null;

export const syncOnboardingStatus = (status) => {
  if (!status) return null;
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }
  const merged = {
    ...user,
    country: status.country_selected ?? user.country,
    user_type: canonicalizeUserType(status.user_type_selected)
      ?? canonicalizeUserType(user.user_type)
      ?? user.user_type,
    user_type_selection: canonicalizeUserType(status.user_type_selected)
      ?? canonicalizeUserType(user.user_type_selection)
      ?? user.user_type_selection,
    role: status.role ?? user.role,
    current_step: status.current_step,
    onboarding_completed: status.onboarding_completed,
    fiscal_profile_completed: status.fiscal_profile_completed,
    census_data_uploaded: status.census_data_uploaded,
    // Business flags
    business_profile_completed: status.business_profile_completed,
    representative_completed: status.representative_completed,
    aeat_connected: status.aeat_connected,
    // Person certificate flags
    certificate_uploaded: status.certificate_uploaded,
    person_aeat_connected: status.person_aeat_connected,
    next_action: status.next_action,
  };
  localStorage.setItem("user", JSON.stringify(merged));
  return merged;
};

export const getOnboardingStatus = async () => {
  try {
    const response = await httpGet({ url: ONBOARDING_URL + "/status" });
    return response?.data || null;
  } catch (err) {
    console.error("Get onboarding status error:", err);
    return null;
  }
};

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

export const getMyFiscalProfile = async () => {
  try {
    const response = await httpGet({ url: `${CENSUS_URL}/me` });
    return unwrapCensusRecord(response?.data);
  } catch (err) {
    if (err?.response?.status !== 404) {
      console.error("Get fiscal profile error:", err);
    }
    return null;
  }
};

export const downloadCensusDocument = async (fileId) => {
  const response = await httpGetBlob({
    url: `${CENSUS_URL}/documents/${fileId}`,
  });
  return response;
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

// ---------------------------------------------------------------------------
// Business onboarding API calls
// ---------------------------------------------------------------------------

export const saveCompanyDetails = async (payload) => {
  try {
    const response = await httpPost({
      url: `${ONBOARDING_URL}/business/company-details`,
      payload,
    });
    return response;
  } catch (err) {
    console.error("Save company details error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};

export const saveRepresentative = async (payload) => {
  try {
    const response = await httpPost({
      url: `${ONBOARDING_URL}/business/representative`,
      payload,
    });
    return response;
  } catch (err) {
    console.error("Save representative error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};

export const confirmAeatConnect = async (representativeNif, termsVersion = "v1.0-2026", apoderamientoCode = null) => {
  try {
    const response = await httpPost({
      url: `${ONBOARDING_URL}/business/aeat-connect`,
      payload: {
        representative_nif: representativeNif,
        representation_terms_version: termsVersion,
        apoderamiento_code: apoderamientoCode,
      },
    });
    return response;
  } catch (err) {
    console.error("AEAT connect error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};

export const aeatSync = async () => {
  try {
    const response = await httpPost({
      url: `${ONBOARDING_URL}/aeat-sync`,
      payload: {},
    });
    return response;
  } catch (err) {
    console.error("AEAT sync error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};

// ---------------------------------------------------------------------------
// Person onboarding — certificate upload & AEAT connect
// ---------------------------------------------------------------------------

export const uploadPersonCertificate = async (file, password) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);
    const response = await httpPostBlob({
      url: `${ONBOARDING_URL}/person/certificate`,
      payload: formData,
    });
    return response;
  } catch (err) {
    console.error("Certificate upload error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};

export const getPersonCertificateStatus = async () => {
  try {
    const response = await httpGet({ url: `${ONBOARDING_URL}/person/certificate` });
    return response?.data || null;
  } catch (err) {
    console.error("Get certificate status error:", err);
    return null;
  }
};

export const confirmPersonAeatConnect = async (nifNie, termsVersion = "v1.0-2026", apoderamientoCode = null) => {
  try {
    const response = await httpPost({
      url: `${ONBOARDING_URL}/person/aeat-connect`,
      payload: {
        nif_nie: nifNie,
        representation_terms_version: termsVersion,
        apoderamiento_code: apoderamientoCode,
      },
    });
    return response;
  } catch (err) {
    console.error("Person AEAT connect error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};


export const getAeatConnectionStatus = async () => {
  try {
    const response = await httpGet({ url: `${ONBOARDING_URL}/aeat-connection/status` });
    return response?.data || null;
  } catch (err) {
    console.error("Get AEAT connection status error:", err);
    return null;
  }
};

export const revokeAeatConnection = async () => {
  try {
    const response = await httpPost({
      url: `${ONBOARDING_URL}/aeat-connection/revoke`,
      payload: {},
    });
    return response;
  } catch (err) {
    console.error("Revoke AEAT connection error:", err);
    return err?.response || { status: 500, data: { message: "An unexpected error occurred" } };
  }
};

