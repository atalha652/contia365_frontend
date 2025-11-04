export const SERVER_PATH = import.meta.env.VITE_APP_API_URL;

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
