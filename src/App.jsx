// frontend/src/App.jsx
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Invoices from "./pages/Invoices";
import InvoicesList from "./components/pages/invoices/InvoicesList";
import Dashboard from "./components/pages/invoices/Dashboard";
import InvoicesV2 from "./pages/InvoicesV2";
import InvoicesV3 from "./pages/InvoicesV3";

import AppPage from "./pages/AppPage";
import Onboarding from "./pages/Onboarding";
import AppDashboard from "./components/pages/app/Dashboard";
import Vouchers from "./components/pages/app/vouchers/Vouchers";
import VouchersUploads from "./components/pages/app/vouchers/Uploads";
import VouchersGmail from "./components/pages/app/vouchers/Gmail";
import Requests from "./components/pages/app/Requests";
// Use the new folder-based Ledger page for consistency with other tabs
import Ledger from "./components/pages/app/ledger";
import LedgerEntryView from "./components/pages/app/ledger/LedgerEntryView";
// Execution tab uses the existing Actions component implementation
import Actions from "./components/pages/app/actions";
import BankTransactions from "./components/pages/app/BankTransactions";
import BankTransactionDetails from "./components/pages/app/BankTransactionDetails";
import TaxFiling from "./components/pages/app/taxFilling";
import TaxCalculations from "./components/pages/app/taxFilling/TaxCalculations";
import TaxFilingList from "./components/pages/app/taxFilling/TaxFilingList";
import TaxFilingDetail from "./components/pages/app/taxFilling/TaxFilingDetail";
import SalesWaitlist from "./components/pages/app/SalesWaitlist";
import AdminUsers from "./components/pages/app/AdminUsers";
import {
  canViewAdminUsers,
  getStoredUser,
} from "./api/apiFunction/adminUserServices";
// Removed Bank Reconciliation, Expenses, Payroll per request
import InvoiceList from "./components/pages/app/invoices/InvoiceList";
import InvoiceEditor from "./components/pages/app/invoices/InvoiceEditor";
import InvoiceView from "./components/pages/app/invoices/InvoiceView";
import Compliance from "./components/pages/app/Compliance";
import CertificateSettings from "./components/pages/app/CertificateSettings";
import {
  getOnboardingStatus,
  syncOnboardingStatus,
} from "./api/apiFunction/onboardingServices";

const CountryProtectedApp = () => {
  const [accessState, setAccessState] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    getOnboardingStatus().then((status) => {
      if (cancelled) return;
      if (status) syncOnboardingStatus(status);
      let role = String(status?.role || "").toLowerCase();
      if (!role) {
        try {
          role = String(
            JSON.parse(localStorage.getItem("user") || "{}").role || ""
          ).toLowerCase();
        } catch {
          role = "";
        }
      }
      const completed = status?.current_step === "completed";
      setAccessState(completed || role === "admin" ? "allowed" : "blocked");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (accessState === "loading") {
    return (
      <div className="min-h-screen bg-bg-50 flex items-center justify-center">
        <div className="w-9 h-9 rounded-full border-4 border-bd-50 border-t-ac-02 animate-spin" />
      </div>
    );
  }

  return accessState === "allowed"
    ? <AppPage />
    : <Navigate to="/onboarding" replace />;
};

const AppHomeRedirect = () => {
  const to = canViewAdminUsers(getStoredUser()) ? "users" : "dashboard";
  return <Navigate to={to} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-bg-50">
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/invoices" element={<Invoices />}>
              <Route index element={<Dashboard />} />
              <Route path="list" element={<InvoicesList />} />
            </Route>
            <Route path="/invoices/v2" element={<InvoicesV2 />} />
            <Route path="/invoices/v3" element={<InvoicesV3 />} />

            {/* App routes */}
            <Route path="/app" element={<CountryProtectedApp />}>
              <Route index element={<AppHomeRedirect />} />
              <Route path="dashboard" element={<AppDashboard />} />
              <Route path="expenses" element={<Vouchers />}>
                <Route index element={<Navigate to="uploads" replace />} />
                <Route path="uploads" element={<VouchersUploads />} />
                <Route path="gmail" element={<VouchersGmail />} />
              </Route>
              <Route path="vouchers" element={<Navigate to="/app/expenses" replace />} />
              <Route path="vouchers/uploads" element={<Navigate to="/app/expenses/uploads" replace />} />
              <Route path="vouchers/gmail" element={<Navigate to="/app/expenses/gmail" replace />} />
              <Route path="requests" element={<Requests />} />
              {/* Renamed route: /app/execution */}
              <Route path="execution" element={<Actions />} />
              <Route path="ledger" element={<Ledger />} />
              <Route path="ledger/:ledgerId" element={<LedgerEntryView />} />
              <Route path="tax-filings" element={<TaxFiling />} />
              <Route path="tax-filings/calculate" element={<TaxCalculations />} />
              <Route path="tax-filings/cases" element={<TaxFilingList />} />
              <Route path="tax-filings/cases/:filingId" element={<TaxFilingDetail />} />
              <Route path="waitlist" element={<SalesWaitlist />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="bank-transactions" element={<BankTransactions />} />
              <Route path="bank-transactions/:accountId" element={<BankTransactionDetails />} />
              {/* Invoice lifecycle routes */}
              <Route path="invoices" element={<InvoiceList />} />
              <Route path="invoices/:invoiceId" element={<InvoiceEditor />} />
              <Route path="invoices/view/:invoiceId" element={<InvoiceView />} />
              <Route path="compliance" element={<Compliance />} />
              <Route path="settings/compliance" element={<CertificateSettings />} />
              {/* Removed routes: bank-reconciliation, expences, payroll */}
            </Route>
          </Routes>

        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
