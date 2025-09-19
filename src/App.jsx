// frontend/src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
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
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
