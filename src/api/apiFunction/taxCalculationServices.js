/**
 * Tax Calculation Services
 * API functions for VAT and IRPF calculations, modelo computations, and auto-mapping
 */

import { httpGet, httpPost } from "../../utils/httpMethods";
import { TAX_CALCULATION_URL } from "../restEndpoint";

/**
 * Get VAT summary for a period (Modelo 303)
 * @param {Object} params
 * @param {string} params.startDate - Period start date (YYYY-MM-DD)
 * @param {string} params.endDate - Period end date (YYYY-MM-DD)
 * @returns {Promise<Object>} VAT summary with output, input, and payable amounts
 */
export const getVATSummary = async ({ startDate, endDate }) => {
  try {
    const response = await httpGet({
      url: `${TAX_CALCULATION_URL}/vat/summary`,
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching VAT summary:", error);
    throw error;
  }
};

/**
 * Get IRPF summary for a quarter (Modelo 130)
 * @param {Object} params
 * @param {string} params.startDate - Quarter start date (YYYY-MM-DD)
 * @param {string} params.endDate - Quarter end date (YYYY-MM-DD)
 * @param {number} params.quarter - Quarter number (1-4)
 * @param {number} [params.irpfRate=20] - IRPF rate percentage
 * @returns {Promise<Object>} IRPF summary with income, expenses, and payable amounts
 */
export const getIRPFSummary = async ({ startDate, endDate, quarter, irpfRate = 20 }) => {
  try {
    const response = await httpGet({
      url: `${TAX_CALCULATION_URL}/irpf/summary`,
      params: {
        start_date: startDate,
        end_date: endDate,
        quarter,
        irpf_rate: irpfRate,
      },
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching IRPF summary:", error);
    throw error;
  }
};

/**
 * Get calculated values for a specific modelo
 * @param {Object} params
 * @param {string} params.modeloNo - Modelo number (303, 130, etc.)
 * @param {string} params.startDate - Period start date (YYYY-MM-DD)
 * @param {string} params.endDate - Period end date (YYYY-MM-DD)
 * @returns {Promise<Object>} Modelo calculation with VAT or IRPF summary
 */
export const getModeloCalculation = async ({ modeloNo, startDate, endDate }) => {
  try {
    const response = await httpGet({
      url: `${TAX_CALCULATION_URL}/modelo/${modeloNo}/calculation`,
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response?.data;
  } catch (error) {
    console.error(`Error fetching modelo ${modeloNo} calculation:`, error);
    throw error;
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
