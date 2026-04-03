// Empty or unset VITE_APP_API_URL => relative "/api/..." (use with Vite dev proxy to avoid CORS).
const _apiBase = import.meta.env.VITE_APP_API_URL;
export const SERVER_PATH =
  _apiBase == null || String(_apiBase).trim() === ""
    ? ""
    : String(_apiBase).replace(/\/$/, "");

// Auth End Points
export const AUTH_URL = `${SERVER_PATH}/api/auth`;

// Project End Points
export const PROJECT_URL = `${SERVER_PATH}/api/project`;

// OCR End Point
export const OCR_URL = `${SERVER_PATH}/api/api/ocr`;

// Report End Points
export const REPORT_URL = `${SERVER_PATH}/api/report`;

// Vouchers End Points
export const VOUCHER_URL = `${SERVER_PATH}/api/accounting/voucher`;

// Ledgers End Points
// Base URL for ledger operations (GET by user, PUT update, DELETE entry)
export const LEDGERS_URL = `${SERVER_PATH}/api/accounting/ledgers`;

// Dashboard End Points
// Base URL for dashboard statistics and summary
export const DASHBOARD_URL = `${SERVER_PATH}/api/accounting/dashboard`;

// Gmail End Points
// Base URL for Gmail APIs (auth, purchases, search, filters, summary)
export const GMAIL_URL = `${SERVER_PATH}/api/gmail`;

// Bank End Points
// Base URL for bank operations (accounts, transactions, import, matching)
export const BANK_URL = `${SERVER_PATH}/api/bank`;

// Onboarding End Points
export const ONBOARDING_URL = `${SERVER_PATH}/api/onboarding`;

// Census Data End Points
export const CENSUS_URL = `${SERVER_PATH}/api/census-data`;

// Tax dashboard deadline endpoint
export const TAX_DASHBOARD_URL = `${SERVER_PATH}/api/tax-dashboard`;

// Tax Calculation End Points
// Base URL for tax calculation APIs (VAT, IRPF, modelo calculations, auto-mapping)
export const TAX_CALCULATION_URL = `${SERVER_PATH}/api/tax`;



