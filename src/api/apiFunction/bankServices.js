// Bank API service functions to integrate backend bank endpoints
import { BANK_URL } from "../restEndpoint";
import { httpGet, httpPost, httpPatch } from "../../utils/httpMethods";

// Get all bank accounts
// Simple English: This fetches all bank accounts for the user.
export const getBankAccounts = async () => {
  try {
    const response = await httpGet({ url: `${BANK_URL}/accounts` });
    return response?.data || [];
  } catch (err) {
    console.error("Get bank accounts error:", err);
    throw err;
  }
};

// Create a new bank account
// Simple English: This creates a new bank account with the provided data.
export const createBankAccount = async (accountData) => {
  try {
    if (!accountData) throw new Error("Missing account data");
    const response = await httpPost({ 
      url: `${BANK_URL}/accounts`, 
      payload: accountData 
    });
    return response?.data;
  } catch (err) {
    console.error("Create bank account error:", err);
    throw err;
  }
};

// Get a specific bank account by ID
// Simple English: This fetches details of a single bank account.
export const getBankAccountById = async ({ account_id }) => {
  try {
    if (!account_id) throw new Error("Missing account_id");
    const response = await httpGet({ 
      url: `${BANK_URL}/accounts/${encodeURIComponent(account_id)}` 
    });
    return response?.data || {};
  } catch (err) {
    console.error("Get bank account by ID error:", err);
    throw err;
  }
};

// Import bank transactions
// Simple English: This imports bank transactions from a file or external source.
export const importBankTransactions = async (importData) => {
  try {
    if (!importData) throw new Error("Missing import data");
    const response = await httpPost({ 
      url: `${BANK_URL}/import`, 
      payload: importData 
    });
    return response?.data;
  } catch (err) {
    console.error("Import bank transactions error:", err);
    throw err;
  }
};

// Get all bank transactions
// Simple English: This fetches all bank transactions with optional filters.
export const getBankTransactions = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.bank_account_id) queryParams.append("bank_account_id", params.bank_account_id);
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);
    if (params.status) queryParams.append("status", params.status);
    if (params.match_status) queryParams.append("match_status", params.match_status);
    
    const url = queryParams.toString() 
      ? `${BANK_URL}/transactions?${queryParams.toString()}`
      : `${BANK_URL}/transactions`;
    
    const response = await httpGet({ url });
    return response?.data || [];
  } catch (err) {
    console.error("Get bank transactions error:", err);
    throw err;
  }
};

// Get a specific bank transaction by ID
// Simple English: This fetches details of a single bank transaction.
export const getBankTransactionById = async ({ transaction_id }) => {
  try {
    if (!transaction_id) throw new Error("Missing transaction_id");
    const response = await httpGet({ 
      url: `${BANK_URL}/transactions/${encodeURIComponent(transaction_id)}` 
    });
    return response?.data || {};
  } catch (err) {
    console.error("Get bank transaction by ID error:", err);
    throw err;
  }
};

// Update a bank transaction
// Simple English: This updates a bank transaction with new data.
export const updateBankTransaction = async ({ transaction_id, updateData }) => {
  try {
    if (!transaction_id) throw new Error("Missing transaction_id");
    if (!updateData) throw new Error("Missing update data");
    const response = await httpPatch({ 
      url: `${BANK_URL}/transactions/${encodeURIComponent(transaction_id)}`, 
      payload: updateData 
    });
    return response?.data;
  } catch (err) {
    console.error("Update bank transaction error:", err);
    throw err;
  }
};

// Match a bank transaction with a voucher/ledger entry
// Simple English: This matches a bank transaction to a voucher or ledger entry.
export const matchBankTransaction = async ({ transaction_id, matchData }) => {
  try {
    if (!transaction_id) throw new Error("Missing transaction_id");
    if (!matchData) throw new Error("Missing match data");
    const response = await httpPost({ 
      url: `${BANK_URL}/transactions/${encodeURIComponent(transaction_id)}/match`, 
      payload: matchData 
    });
    return response?.data;
  } catch (err) {
    console.error("Match bank transaction error:", err);
    throw err;
  }
};

// Unmatch a bank transaction
// Simple English: This removes the match between a bank transaction and a voucher/ledger entry.
export const unmatchBankTransaction = async ({ transaction_id }) => {
  try {
    if (!transaction_id) throw new Error("Missing transaction_id");
    const response = await httpPost({ 
      url: `${BANK_URL}/transactions/${encodeURIComponent(transaction_id)}/unmatch`, 
      payload: {} 
    });
    return response?.data;
  } catch (err) {
    console.error("Unmatch bank transaction error:", err);
    throw err;
  }
};

// Match all unmatched bank transactions automatically
// Simple English: This attempts to automatically match all unmatched transactions.
export const matchAllBankTransactions = async (matchCriteria = {}) => {
  try {
    const response = await httpPost({ 
      url: `${BANK_URL}/match-all`, 
      payload: matchCriteria 
    });
    return response?.data || { matched_count: 0, unmatched_count: 0 };
  } catch (err) {
    console.error("Match all bank transactions error:", err);
    throw err;
  }
};

// Send bank transactions to ledger
// Simple English: This sends selected bank transactions to the ledger system.
export const sendTransactionsToLedger = async (transactionData) => {
  try {
    if (!transactionData) throw new Error("Missing transaction data");
    console.log("Sending to ledger:", transactionData);
    const response = await httpPost({ 
      url: `${BANK_URL}/transactions/to-ledger`, 
      payload: transactionData 
    });
    console.log("Ledger response:", response);
    return response?.data;
  } catch (err) {
    console.error("Send transactions to ledger error:", err);
    console.error("Error details:", err?.response);
    throw err;
  }
};
