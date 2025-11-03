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
import Requests from "./components/pages/app/Requests";
// Use the new folder-based Ledger page for consistency with other tabs
import Ledger from "./components/pages/app/ledger";
// Execution tab uses the existing Actions component implementation
import Actions from "./components/pages/app/actions";
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
              <Route path="vouchers" element={<Vouchers />} />
              <Route path="requests" element={<Requests />} />
              {/* Renamed route: /app/execution */}
              <Route path="execution" element={<Actions />} />
              <Route path="ledger" element={<Ledger />} />
              {/* Removed routes: bank-reconciliation, expences, payroll */}
            </Route>
          </Routes>

        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
