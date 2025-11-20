// frontend/src/App.jsx
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
import AppDashboard from "./components/pages/app/Dashboard";
import Vouchers from "./components/pages/app/vouchers/Vouchers";
import VouchersUploads from "./components/pages/app/vouchers/Uploads";
import VouchersGmail from "./components/pages/app/vouchers/Gmail";
import Requests from "./components/pages/app/Requests";
// Use the new folder-based Ledger page for consistency with other tabs
import Ledger from "./components/pages/app/ledger";
// Execution tab uses the existing Actions component implementation
import Actions from "./components/pages/app/actions";
import BankTransactions from "./components/pages/app/BankTransactions";
// Removed Bank Reconciliation, Expenses, Payroll per request

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
            <Route path="/invoices" element={<Invoices />}>
              <Route index element={<Dashboard />} />
              <Route path="list" element={<InvoicesList />} />
            </Route>
            <Route path="/invoices/v2" element={<InvoicesV2 />} />
            <Route path="/invoices/v3" element={<InvoicesV3 />} />

            {/* App routes */}
            <Route path="/app" element={<AppPage />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AppDashboard />} />
              <Route path="vouchers" element={<Vouchers />}>
                {/* Index route: default to uploads tab */}
                <Route index element={<Navigate to="uploads" replace />} />
                {/* Uploads tab content */}
                <Route path="uploads" element={<VouchersUploads />} />
                {/* Gmail tab content */}
                <Route path="gmail" element={<VouchersGmail />} />
              </Route>
              <Route path="requests" element={<Requests />} />
              {/* Renamed route: /app/execution */}
              <Route path="execution" element={<Actions />} />
              <Route path="ledger" element={<Ledger />} />
              <Route path="bank-transactions" element={<BankTransactions />} />
              {/* Removed routes: bank-reconciliation, expences, payroll */}
            </Route>
          </Routes>

        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
