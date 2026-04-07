/**
 * Tax Calculation Services
 * API functions for VAT and IRPF calculations, modelo computations, and auto-mapping
 */

import { httpGet, httpPost, httpPatch } from "../../utils/httpMethods";
import { TAX_CALCULATION_URL, TAX_ENGINE_URL } from "../restEndpoint";

/**
 * Get VAT summary for a period (Modelo 303)
 * @param {Object} params
 * @param {string} params.startDate - Period start date (YYYY-MM-DD)
 * @param {string} params.endDate - Period end date (YYYY-MM-DD)
 * @param {string} params.userId - User/Organization ID (for public endpoint)
 * @returns {Promise<Object>} VAT summary with output, input, and payable amounts
 */
export const getVATSummary = async ({ startDate, endDate, userId }) => {
  try {
    // Use public endpoint if userId is provided, otherwise use authenticated endpoint
    const endpoint = userId 
      ? `${TAX_CALCULATION_URL}/vat/summary/public`
      : `${TAX_CALCULATION_URL}/vat/summary`;
    
    const params = {
      start_date: startDate,
      end_date: endDate,
    };
    
    if (userId) {
      params.organization_id = userId;
    }
    
    const response = await httpGet({
      url: endpoint,
      params,
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching VAT summary:", error);
    // Return empty data instead of throwing to prevent UI crashes
    return {
      output_vat: 0,
      input_vat: 0,
      vat_payable: 0,
      breakdown: []
    };
  }
};

/**
 * Get IRPF summary for a quarter (Modelo 130)
 * @param {Object} params
 * @param {string} params.startDate - Quarter start date (YYYY-MM-DD)
 * @param {string} params.endDate - Quarter end date (YYYY-MM-DD)
 * @param {number} params.quarter - Quarter number (1-4)
 * @param {string} params.userId - User/Organization ID (for public endpoint)
 * @param {number} [params.irpfRate=20] - IRPF rate percentage
 * @returns {Promise<Object>} IRPF summary with income, expenses, and payable amounts
 */
export const getIRPFSummary = async ({ startDate, endDate, quarter, userId, irpfRate = 20 }) => {
  try {
    // Use public endpoint if userId is provided, otherwise use authenticated endpoint
    const endpoint = userId
      ? `${TAX_CALCULATION_URL}/irpf/summary/public`
      : `${TAX_CALCULATION_URL}/irpf/summary`;
    
    const params = {
      start_date: startDate,
      end_date: endDate,
      quarter,
      irpf_rate: irpfRate,
    };
    
    if (userId) {
      params.organization_id = userId;
    }
    
    const response = await httpGet({
      url: endpoint,
      params,
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching IRPF summary:", error);
    // Return empty data instead of throwing to prevent UI crashes
    return {
      gross_income: 0,
      deductible_expenses: 0,
      net_income: 0,
      irpf_payable: 0,
      irpf_to_pay: 0
    };
  }
};

/**
 * Get calculated values for a specific modelo
 * @param {Object} params
 * @param {string} params.modeloNo - Modelo number (303, 130, etc.)
 * @param {string} params.startDate - Period start date (YYYY-MM-DD)
 * @param {string} params.endDate - Period end date (YYYY-MM-DD)
 * @param {string} params.userId - User/Organization ID (for public endpoint)
 * @returns {Promise<Object>} Modelo calculation with VAT or IRPF summary
 */
export const getModeloCalculation = async ({ modeloNo, startDate, endDate, userId }) => {
  try {
    // Use public endpoint if userId is provided, otherwise use authenticated endpoint
    const endpoint = userId
      ? `${TAX_CALCULATION_URL}/modelo/${modeloNo}/calculation/public`
      : `${TAX_CALCULATION_URL}/modelo/${modeloNo}/calculation`;
    
    const params = {
      start_date: startDate,
      end_date: endDate,
    };
    
    if (userId) {
      params.organization_id = userId;
    }
    
    const response = await httpGet({
      url: endpoint,
      params,
    });
    return response?.data;
  } catch (error) {
    console.error(`Error fetching modelo ${modeloNo} calculation:`, error);
    // Return empty data instead of throwing to prevent UI crashes
    return {
      modelo_no: modeloNo,
      period_start: startDate,
      period_end: endDate,
      summary: {}
    };
  }
};

/**
 * Auto-map transactions to modelos
 * @param {Object} params
 * @param {string} [params.startDate] - Optional start date for filtering
 * @param {string} [params.endDate] - Optional end date for filtering
 * @param {boolean} [params.forceRemap=false] - Force remap already mapped transactions
 * @returns {Promise<Object>} Mapping statistics
 */
export const autoMapTransactions = async ({ startDate, endDate, forceRemap = false }) => {
  try {
    const response = await httpPost({
      url: `${TAX_CALCULATION_URL}/auto-map`,
      payload: {
        start_date: startDate,
        end_date: endDate,
        force_remap: forceRemap,
      },
    });
    return response?.data;
  } catch (error) {
    console.error("Error auto-mapping transactions:", error);
    throw error;
  }
};

/**
 * Sync all tax data (create tax transactions and auto-map)
 * @param {Object} params
 * @param {string} [params.startDate] - Optional start date for filtering
 * @param {string} [params.endDate] - Optional end date for filtering
 * @returns {Promise<Object>} Sync statistics
 */
export const syncAllTaxData = async ({ startDate, endDate } = {}) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await httpPost({
      url: `${TAX_CALCULATION_URL}/sync-all`,
      payload: params,
    });
    return response?.data;
  } catch (error) {
    console.error("Error syncing tax data:", error);
    throw error;
  }
};

/**
 * Get transactions mapped to a specific modelo
 * @param {Object} params
 * @param {string} params.modeloId - Modelo ID
 * @param {string} params.startDate - Period start date (YYYY-MM-DD)
 * @param {string} params.endDate - Period end date (YYYY-MM-DD)
 * @returns {Promise<Object>} Ledger entries and tax transactions
 */
export const getModeloTransactions = async ({ modeloId, startDate, endDate }) => {
  try {
    const response = await httpGet({
      url: `${TAX_CALCULATION_URL}/modelo/${modeloId}/transactions`,
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching modelo transactions:", error);
    throw error;
  }
};

/**
 * Get modelo mapping configurations
 * @returns {Promise<Object>} Modelo mappings
 */
export const getModeloMappings = async () => {
  try {
    const response = await httpGet({
      url: `${TAX_CALCULATION_URL}/modelo-mappings`,
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching modelo mappings:", error);
    throw error;
  }
};

/**
 * Create tax transaction from a ledger entry
 * @param {Object} params
 * @param {string} params.entryId - Ledger entry ID
 * @returns {Promise<Object>} Created tax transaction info
 */
export const createTaxTransactionFromLedger = async ({ entryId }) => {
  try {
    const response = await httpPost({
      url: `${TAX_CALCULATION_URL}/ledger-entry/${entryId}/create-tax-transaction`,
    });
    return response?.data;
  } catch (error) {
    console.error("Error creating tax transaction:", error);
    throw error;
  }
};

/**
 * Health check for tax calculation service
 * @returns {Promise<Object>} Service health status
 */
export const getTaxCalculationHealth = async () => {
  try {
    const response = await httpGet({
      url: `${TAX_CALCULATION_URL}/health`,
    });
    return response?.data;
  } catch (error) {
    console.error("Error checking tax calculation health:", error);
    throw error;
  }
};

/**
 * Calculate tax for a specific modelo using the tax engine
 * @param {Object} params
 * @param {string} params.modeloNo - Modelo number (e.g. "115", "130", "303")
 * @param {string} params.startDate - Period start date (YYYY-MM-DD)
 * @param {string} params.endDate - Period end date (YYYY-MM-DD)
 * @param {number} params.year - Tax year
 * @param {string} params.quarter - Quarter string e.g. "Q1"
 * @param {string} [params.userId] - Optional organization/user ID
 * @returns {Promise<Object>} Tax engine calculation result
 */
export const getTaxEngineCalculation = async ({ modeloNo, startDate, endDate, year, quarter, userId }) => {
  try {
    const payload = {
      period: `${startDate}/${endDate}`,
      year: year ?? new Date(startDate).getFullYear(),
      quarter: quarter ?? `Q${Math.floor(new Date(startDate).getMonth() / 3) + 1}`,
    };
    if (userId) payload.organization_id = userId;

    const response = await httpPost({
      url: `${TAX_ENGINE_URL}/${modeloNo}/calculate`,
      payload,
    });
    return response?.data;
  } catch (error) {
    console.error(`Error fetching tax engine calculation for modelo ${modeloNo}:`, error);
    return null;
  }
};

// ── New flow: ledger-driven tax engine ───────────────────────────────────────

/**
 * Extract unique modelo numbers and their ObjectIDs from ledger entries.
 * Reads entry.tax_classification.matched_modelos[].modelo_no and .modelo_id
 * @param {Array} entries - Ledger entries array
 * @returns {{ modeloNos: string[], modeloIdMap: Record<string, string> }}
 */
export const extractModeloNosFromLedgers = (entries) => {
  const modeloIdMap = {};
  if (!Array.isArray(entries)) return { modeloNos: [], modeloIdMap };
  entries.forEach((entry) => {
    const matched = entry?.tax_classification?.matched_modelos;
    if (!Array.isArray(matched)) return;
    matched.forEach((m) => {
      const no = m?.modelo_no ? String(m.modelo_no) : null;
      const id = m?.modelo_id || m?._id || null;
      if (no && !modeloIdMap[no]) {
        modeloIdMap[no] = id || no;
      }
    });
  });
  return { modeloNos: Object.keys(modeloIdMap), modeloIdMap };
};

// Annual-only modelos (no quarter param)
export const ANNUAL_MODELOS = new Set(["190", "390"]);

/**
 * Run tax engine calculations for all relevant modelos in parallel.
 * Quarterly modelos: 303, 130, 115, 111 → { year, quarter, modelo_id? }
 * Annual modelos:    390, 190           → { year, modelo_id? }
 * @param {Object} params
 * @param {string[]} params.modeloNos - Modelos to calculate
 * @param {Record<string,string>} params.modeloIdMap - modelo_no → ObjectID
 * @param {number} params.year
 * @param {number|null} params.quarter - 1-4 for quarterly, null for annual view
 * @returns {Promise<Record<string, Object|null>>} map of modeloNo → result
 */
export const calculateAllTaxes = async ({ modeloNos, modeloIdMap, year, quarter }) => {
  const results = {};
  const tasks = modeloNos.map(async (modeloNo) => {
    const isAnnual = ANNUAL_MODELOS.has(modeloNo);
    // Skip quarterly modelos when in annual view, and annual modelos when in quarterly view
    if (isAnnual && quarter !== null) { results[modeloNo] = null; return; }
    if (!isAnnual && quarter === null) { results[modeloNo] = null; return; }

    try {
      const payload = { year };
      if (!isAnnual) payload.quarter = `Q${quarter}`;
      const modeloId = modeloIdMap[modeloNo];
      if (modeloId && modeloId !== modeloNo) payload.modelo_id = modeloId;

      const response = await httpPost({
        url: `${TAX_ENGINE_URL}/${modeloNo}/calculate`,
        payload,
      });
      results[modeloNo] = response?.data ?? null;
    } catch (err) {
      console.error(`Tax engine error for modelo ${modeloNo}:`, err);
      results[modeloNo] = null;
    }
  });
  await Promise.all(tasks);
  return results;
};

/**
 * Fetch all saved tax reports for the current user.
 * GET /api/tax-engine/reports
 * @returns {Promise<Array>}
 */
export const getTaxReports = async () => {
  try {
    const response = await httpGet({ url: `${TAX_ENGINE_URL}/reports` });
    return Array.isArray(response?.data) ? response.data : (response?.data?.reports ?? []);
  } catch (error) {
    console.error("Error fetching tax reports:", error);
    return [];
  }
};

/**
 * Update the status of a saved tax report.
 * PATCH /api/tax-engine/reports/{report_id}/status
 * @param {string} reportId
 * @param {string} status
 * @returns {Promise<Object>}
 */
export const updateTaxReportStatus = async (reportId, status) => {
  try {
    const response = await httpPatch({
      url: `${TAX_ENGINE_URL}/reports/${reportId}/status`,
      payload: { status },
    });
    return response?.data;
  } catch (error) {
    console.error("Error updating tax report status:", error);
    throw error;
  }
};
