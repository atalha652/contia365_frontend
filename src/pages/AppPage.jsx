import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../components/pages/app/Sidebar";
import Header from "../components/pages/app/Header";
import { updatePageTitle } from "../utils/titleUtils";
import { toast } from "react-toastify";

const AppPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [headerTitle, setHeaderTitle] = useState("App");

  // Shared state (ported from sample.jsx)
  const [invoices, setInvoices] = useState([]);
  const [voucherRequests, setVoucherRequests] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([
    { id: 1, name: "John Smith", salary: 5000, status: "active" },
    { id: 2, name: "Sarah Johnson", salary: 4500, status: "active" },
  ]);

  // Actions (match sample.jsx behaviors)
  const createInvoice = (invoiceForm) => {
    if (!invoiceForm?.customer || !invoiceForm?.amount || !invoiceForm?.description) {
      toast.error("Please fill all voucher fields");
      return;
    }

    const newInvoice = {
      id: invoices.length + 1,
      customer: invoiceForm.customer,
      amount: parseFloat(invoiceForm.amount),
      description: invoiceForm.description,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    };
    setInvoices((prev) => [...prev, newInvoice]);

    const entry = {
      id: journalEntries.length + 1,
      date: newInvoice.date,
      description: `Voucher #${newInvoice.id} created for ${newInvoice.customer}`,
      type: "Voucher Created",
      entries: [
        { account: "Accounts Receivable", debit: newInvoice.amount, credit: 0 },
        { account: "Revenue", debit: 0, credit: newInvoice.amount },
      ],
    };
    setJournalEntries((prev) => [...prev, entry]);

    toast.success(`Voucher #${newInvoice.id} created! Journal recorded.`);
  };

  const receivePayment = (selectedInvoiceId) => {
    const invoice = invoices.find((i) => i.id === selectedInvoiceId);
    if (!invoice) return;

    setInvoices((prev) => prev.map((i) => (i.id === selectedInvoiceId ? { ...i, status: "paid" } : i)));

    const bankTx = {
      id: bankTransactions.length + 1,
      date: new Date().toISOString().split("T")[0],
      description: `Payment from ${invoice.customer}`,
      amount: invoice.amount,
      invoiceId: invoice.id,
    };
    setBankTransactions((prev) => [...prev, bankTx]);

    const entry = {
      id: journalEntries.length + 1,
      date: bankTx.date,
      description: `Payment received from ${invoice.customer} for Voucher #${invoice.id}`,
      type: "Payment Received",
      entries: [
        { account: "Bank Account", debit: invoice.amount, credit: 0 },
        { account: "Accounts Receivable", debit: 0, credit: invoice.amount },
      ],
    };
    setJournalEntries((prev) => [...prev, entry]);

    toast.success("Payment received! Bank reconciled and journal recorded.");
  };

  const createExpense = (expenseForm) => {
    if (!expenseForm?.employee || !expenseForm?.amount || !expenseForm?.category || !expenseForm?.description) {
      toast.error("Please fill all expense fields");
      return;
    }

    const newExpense = {
      id: expenses.length + 1,
      employee: expenseForm.employee,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      description: expenseForm.description,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    };
    setExpenses((prev) => [...prev, newExpense]);
    toast.success("Expense submitted for approval");
  };

  const approveExpense = (expenseId) => {
    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) return;

    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? { ...e, status: "approved" } : e)));

    const entry = {
      id: journalEntries.length + 1,
      date: new Date().toISOString().split("T")[0],
      description: `Expense approved: ${expense.description} - ${expense.employee}`,
      type: "Expense Approved",
      entries: [
        { account: `Expense - ${expense.category}`, debit: expense.amount, credit: 0 },
        { account: "Accounts Payable", debit: 0, credit: expense.amount },
      ],
    };
    setJournalEntries((prev) => [...prev, entry]);

    toast.success("Expense approved! Journal recorded.");
  };

  const reimburseExpense = (expenseId) => {
    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) return;

    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? { ...e, status: "reimbursed" } : e)));

    const entry = {
      id: journalEntries.length + 1,
      date: new Date().toISOString().split("T")[0],
      description: `Expense reimbursed to ${expense.employee}`,
      type: "Expense Reimbursed",
      entries: [
        { account: "Accounts Payable", debit: expense.amount, credit: 0 },
        { account: "Bank Account", debit: 0, credit: expense.amount },
      ],
    };
    setJournalEntries((prev) => [...prev, entry]);

    toast.success("Reimbursement processed! Bank updated and journal recorded.");
  };

  const runPayroll = () => {
    const totalPayroll = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);

    const entry = {
      id: journalEntries.length + 1,
      date: new Date().toISOString().split("T")[0],
      description: `Monthly payroll run for ${employees.length} employees`,
      type: "Payroll Run",
      entries: [
        { account: "Salary Expense", debit: totalPayroll, credit: 0 },
        { account: "Bank Account", debit: 0, credit: totalPayroll },
      ],
    };
    setJournalEntries((prev) => [...prev, entry]);
    toast.success(`Payroll processed! Total: ${totalPayroll.toLocaleString()} paid`);
  };

  // Requests flow: add to requests and approve
  const addVoucherRequests = (ids = []) => {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    if (unique.length === 0) return;
    setVoucherRequests((prev) => Array.from(new Set([...prev, ...unique])));
    toast.success(`${unique.length} voucher${unique.length > 1 ? 's' : ''} moved to Requests`);
  };

  const approveVoucherRequest = (id) => {
    if (!id) return;
    receivePayment(id);
    setVoucherRequests((prev) => prev.filter((x) => x !== id));
    // receivePayment already toasts payment events
  };

  // Page title sync
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    let label = "App";
    if (path.includes("/app/dashboard")) label = "Dashboard";
    else if (path.includes("/app/vouchers")) label = "Vouchers";
    else if (path.includes("/app/requests")) label = "Requests";
    else if (path.includes("/app/bank-reconciliation")) label = "Bank Reconciliation";
    else if (path.includes("/app/ledger")) label = "Ledger";
    else if (path.includes("/app/expences")) label = "Expenses";
    else if (path.includes("/app/payroll")) label = "Payroll";
    setHeaderTitle(label);
    updatePageTitle(label);
  }, [location]);

  const context = {
    invoices,
    setInvoices,
    voucherRequests,
    setVoucherRequests,
    journalEntries,
    setJournalEntries,
    bankTransactions,
    setBankTransactions,
    expenses,
    setExpenses,
    employees,
    setEmployees,
    createInvoice,
    receivePayment,
    addVoucherRequests,
    approveVoucherRequest,
    createExpense,
    approveExpense,
    reimburseExpense,
    runPayroll,
  };

  return (
    // Outer container bg-bg-70 with visible gap between sidebar and right column
    <div className="flex h-screen bg-bg-70 text-fg-50 overflow-hidden">
      <Sidebar
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />

      {/* Right column wrapper with header above main card */}
      <div className="flex-1 min-w-0 flex flex-col my-4 overflow-hidden">
        {/* Header card (outside of main right card) */}
        <div className="px-4 pt-0">
          <div className="">
            <Header
              sidebarExpanded={sidebarExpanded}
              toggleSidebar={() => setSidebarExpanded(!sidebarExpanded)}
              theme={theme}
              toggleTheme={toggleTheme}
              title={headerTitle}
            />
          </div>
        </div>

        {/* Main right card below header with gap */}
        <div className="flex-1 min-h-0 overflow-y-auto px-0 pt-4 custom-scrollbar">
          <div className="h-full">
            <Outlet context={context} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPage;