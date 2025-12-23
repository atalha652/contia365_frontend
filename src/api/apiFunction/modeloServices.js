import { MODELOS_URL, SERVER_PATH } from "../restEndpoint";
import { httpGet, httpPut, httpPost } from "../../utils/httpMethods";

// This service fetches app ledger data (GET /app/ledger)
export const getAppLedger = async ({ user_id, filters = {} }) => {
  try {
    if (!user_id) throw new Error("Missing user_id");
    
    // Build query parameters
    const params = { user_id, ...filters };
    
    const response = await httpGet({ 
      url: `${SERVER_PATH}/app/ledger`,
      params 
    });
    return response?.data;
  } catch (err) {
    console.error("Get app ledger error:", err);
    throw err;
  }
};

// This service fetches all modelos (GET /api/modelos)
export const getModelos = async ({ user_id, filters = {} }) => {
  try {
    // Build query parameters
    const params = {};
    if (user_id) params.user_id = user_id;
    Object.assign(params, filters);
    
    const response = await httpGet({ 
      url: `${MODELOS_URL}`,
      params 
    });
    
    return response?.data;
  } catch (err) {
    console.error("Get modelos error:", err);
    throw err;
  }
};

// This service searches for a modelo by number (GET /api/modelos/search/by-number/{modelo_no})
export const searchModeloByNumber = async ({ modelo_no }) => {
  try {
    if (!modelo_no) throw new Error("Missing modelo_no");
    
    const response = await httpGet({ 
      url: `${MODELOS_URL}/search/by-number/${modelo_no}` 
    });
    return response?.data;
  } catch (err) {
    console.error("Search modelo by number error:", err);
    throw err;
  }
};

// This service updates an existing modelo (PUT /api/modelos/{modelo_id})
export const updateModelo = async ({ modelo_id, modelo_data }) => {
  try {
    if (!modelo_id) throw new Error("Missing modelo_id");
    if (!modelo_data || typeof modelo_data !== "object") {
      throw new Error("modelo_data must be a valid object");
    }
    
    const response = await httpPut({
      url: `${MODELOS_URL}/${modelo_id}`,
      payload: modelo_data,
    });
    return response?.data;
  } catch (err) {
    console.error("Update modelo error:", err);
    throw err;
  }
};

// This service creates or submits a modelo (POST /api/modelos/{modelo_id})
export const createModelo = async ({ modelo_id, modelo_data }) => {
  try {
    if (!modelo_id) throw new Error("Missing modelo_id");
    if (!modelo_data || typeof modelo_data !== "object") {
      throw new Error("modelo_data must be a valid object");
    }
    
    const response = await httpPost({
      url: `${MODELOS_URL}/${modelo_id}`,
      payload: modelo_data,
    });
    return response?.data;
  } catch (err) {
    console.error("Create modelo error:", err);
    throw err;
  }
};