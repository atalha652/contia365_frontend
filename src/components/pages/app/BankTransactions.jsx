import React, { useState, useEffect } from "react";
import { Search, CreditCard, Building2, Landmark, ChevronRight, Plus, X, Filter, MoreHorizontal } from "lucide-react";
import { Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Select } from "../../ui";
import { useNavigate } from "react-router-dom";
import { createBankAccount, getBankAccounts } from "../../../api/apiFunction/bankServices";
import { toast } from "react-toastify";

// Static data for bank accounts
const staticBankAccounts = [
  {
    id: "ACC001",
    account_number: "****1234",
    account_name: "Business Checking",
    bank_name: "Chase Bank",
    account_type: "Checking",
    balance: 45000,
    currency: "USD",
    status: "active",
  },
  {
    id: "ACC002",
    account_number: "****5678",
    account_name: "Savings Account",
    bank_name: "Bank of America",
    account_type: "Savings",
    balance: 120000,
    currency: "USD",
    status: "active",
  },
  {
    id: "ACC003",
    account_number: "****9012",
    account_name: "Payroll Account",
    bank_name: "Wells Fargo",
    account_type: "Checking",
    balance: 78000,
    currency: "USD",
    status: "active",
  },
  {
    id: "ACC004",
    account_number: "****3456",
    account_name: "Investment Account",
    bank_name: "Citibank",
    account_type: "Investment",
    balance: 250000,
    currency: "USD",
    status: "active",
  },
];

// Static data for bank transactions (kept for future use)
const staticTransactions = [
  {
    id: "TXN001",
    date: "Nov, 18, 2025 10:30 AM",
    description: "Payment to Supplier ABC",
    reference: "REF-2025-001",
    debit: 5000,
    credit: 0,
    balance: 45000,
    type: "debit",
    status: "completed",
  },
  {
    id: "TXN002",
    date: "Nov, 17, 2025 02:15 PM",
    description: "Customer Payment Received",
    reference: "REF-2025-002",
    debit: 0,
    credit: 12000,
    balance: 50000,
    type: "credit",
    status: "completed",
  },
  {
    id: "TXN003",
    date: "Nov, 16, 2025 09:45 AM",
    description: "Office Rent Payment",
    reference: "REF-2025-003",
    debit: 8000,
    credit: 0,
    balance: 38000,
    type: "debit",
    status: "completed",
  },
  {
    id: "TXN004",
    date: "Nov, 15, 2025 11:20 AM",
    description: "Sales Revenue",
    reference: "REF-2025-004",
    debit: 0,
    credit: 15000,
    balance: 46000,
    type: "credit",
    status: "completed",
  },
  {
    id: "TXN005",
    date: "Nov, 14, 2025 03:30 PM",
    description: "Utility Bills Payment",
    reference: "REF-2025-005",
    debit: 2500,
    credit: 0,
    balance: 31000,
    type: "debit",
    status: "pending",
  },
];

const BankTransactions = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [error, setError] = useState("");
  
  // Form state for creating bank account
  const [formData, setFormData] = useState({
    account_name: "",
    account_number: "",
    iban: "",
    swift_bic: "",
    bank_name: "",
    currency: "EUR",
    opening_balance: 0,
  });

  // Fetch bank accounts on component mount
  useEffect(() => {
    fetchBankAccounts();
  }, []);

  // Fetch bank accounts from API
  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const accounts = await getBankAccounts();
      setBankAccounts(accounts || []);
    } catch (err) {
      console.error("Fetch bank accounts error:", err);
      const errorMessage = err?.response?.data?.detail || err.message || "Failed to load bank accounts";
      setError(errorMessage);
      // Fallback to static data on error
      setBankAccounts(staticBankAccounts);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return value > 0 ? `${value.toLocaleString()}` : "-";
  };

  // Filter bank accounts
  const filtered = bankAccounts.filter((account) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = `${account.account_number || ''} ${account.account_name || ''} ${account.bank_name || ''}`.toLowerCase().includes(search);
    const matchesStatus = statusFilter === "All Status" ? true : account.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Handle card click to navigate to transaction details
  const handleAccountClick = (account) => {
    // Use _id or id from API response
    const accountId = account._id || account.id;
    if (accountId) {
      navigate(`/app/bank-transactions/${accountId}`);
    } else {
      console.error("Account ID not found", account);
      toast.error("Unable to open account details");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle create bank account
  const handleCreateAccount = async () => {
    // Validate form
    if (!formData.account_name || !formData.account_number || !formData.iban || !formData.swift_bic || !formData.bank_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setCreateLoading(true);
      
      // Call API to create bank account
      await createBankAccount(formData);
      
      // Success: close modal and reset form
      toast.success("Bank account created successfully!");
      setShowCreateModal(false);
      setFormData({
        account_name: "",
        account_number: "",
        iban: "",
        swift_bic: "",
        bank_name: "",
        currency: "EUR",
        opening_balance: 0,
      });
      
      // Refresh the bank accounts list after creation
      fetchBankAccounts();
    } catch (err) {
      console.error("Create account error:", err);
      const errorMessage = err?.response?.data?.detail || err.message || "Failed to create bank account";
      toast.error(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      account_name: "",
      account_number: "",
      iban: "",
      swift_bic: "",
      bank_name: "",
      currency: "EUR",
      opening_balance: 0,
    });
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-fg-40">Bank Accounts</h1>
              <p className="text-sm text-fg-60 mt-1">Select an account to view transactions.</p>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-3">
            <div className="text-sm text-fg-60 bg-bg-50 border border-bd-50 rounded-xl p-3">{error}</div>
          </div>
        )}

        {/* Search and Filters Section */}
        <div className="py-4">
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-60" strokeWidth={1.5} />
              <Input
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="w-44">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {["All Status", "active", "inactive", "closed"].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </div>

            {/* More Filters */}
            <Button variant="secondary" size="icon">
              <Filter className="w-4 h-4" strokeWidth={1.5} />
            </Button>

            {/* More Options */}
            {/* <Button variant="secondary" size="icon">
              <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
            </Button> */}

            {/* Create Bank Account */}
            <Button variant="primary" onClick={() => setShowCreateModal(true)} className="whitespace-nowrap flex items-center gap-2">
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              <span>Create Account</span>
            </Button>
          </div>
        </div>

        {/* Bank Accounts Cards */}
        <div className="py-4">
          {loading ? (
            // Skeleton loading cards matching Dashboard.jsx pattern
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-bg-50 border border-bd-50 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-bg-40 rounded-xl animate-pulse" />
                    <div className="h-5 w-5 bg-bg-40 rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-bg-40 rounded animate-pulse" />
                    <div className="h-8 w-28 bg-bg-40 rounded animate-pulse" />
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-24 bg-bg-40 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-bg-40 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-16 bg-bg-40 rounded animate-pulse" />
                      <div className="h-6 w-16 bg-bg-40 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((account) => (
                <button
                  key={account._id || account.id}
                  onClick={() => handleAccountClick(account)}
                  className="bg-bg-50 border border-bd-50 rounded-xl p-6 hover:border-ac-02 hover:shadow-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-bg-70 rounded-xl flex items-center justify-center group-hover:bg-ac-02 transition-colors">
                      <Landmark className="w-6 h-6 text-fg-50 group-hover:text-white" strokeWidth={1.5} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-fg-60 group-hover:text-ac-02 transition-colors" strokeWidth={1.5} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-fg-40 group-hover:text-ac-02 transition-colors">
                      {account.account_name}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-fg-60 mt-3">
                      <span>{account.bank_name}</span>
                      <span>{account.iban || account.account_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {account.swift_bic && (
                        <span className="px-2 py-1 bg-bg-70 rounded text-fg-60">{account.swift_bic}</span>
                      )}
                      {account.account_type && (
                        <span className="px-2 py-1 bg-bg-70 rounded text-fg-60">{account.account_type}</span>
                      )}
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded">
                        {(account.status || 'active').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-sm text-fg-60">No bank accounts found.</p>
            </div>
          )}
        </div>

        {/* Create Bank Account Modal */}
        <Modal open={showCreateModal} onClose={handleCloseModal}>
          <ModalHeader
            title="Create Bank Account"
            action={
              <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                <X className="w-4 h-4" />
              </Button>
            }
          />
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-fg-60 mb-1 block">Account Name *</label>
                <Input
                  type="text"
                  name="account_name"
                  placeholder="e.g., Business Checking"
                  value={formData.account_name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-fg-60 mb-1 block">Account Number *</label>
                <Input
                  type="text"
                  name="account_number"
                  placeholder="e.g., 1234567890"
                  value={formData.account_number}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-fg-60 mb-1 block">IBAN *</label>
                <Input
                  type="text"
                  name="iban"
                  placeholder="e.g., DE89370400440532013000"
                  value={formData.iban}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-fg-60 mb-1 block">SWIFT/BIC *</label>
                <Input
                  type="text"
                  name="swift_bic"
                  placeholder="e.g., DEUTDEFF"
                  value={formData.swift_bic}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-fg-60 mb-1 block">Bank Name *</label>
                <Input
                  type="text"
                  name="bank_name"
                  placeholder="e.g., Deutsche Bank"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-fg-60 mb-1 block">Currency *</label>
                <Select name="currency" value={formData.currency} onChange={handleInputChange}>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="CHF">CHF</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-fg-60 mb-1 block">Opening Balance *</label>
                <Input
                  type="number"
                  name="opening_balance"
                  placeholder="0"
                  value={formData.opening_balance}
                  onChange={handleInputChange}
                  step="0.01"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateAccount} disabled={createLoading}>
              {createLoading ? "Creating..." : "Create Account"}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default BankTransactions;
