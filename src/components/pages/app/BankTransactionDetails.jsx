import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Filter, MoreHorizontal, Download, ArrowLeft, Upload, X } from "lucide-react";
import { Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Input, Select, Modal, ModalHeader, ModalBody, ModalFooter } from "../../ui";
import { importBankTransactions, getBankTransactions, getBankAccountById, sendTransactionsToLedger } from "../../../api/apiFunction/bankServices";
import { toast } from "react-toastify";


const BankTransactionDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importFormat, setImportFormat] = useState("pdf");
  const [transactions, setTransactions] = useState([]);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sendingToLedger, setSendingToLedger] = useState(false);

  // Fetch account details and transactions on mount
  useEffect(() => {
    if (accountId) {
      fetchAccountDetails();
      fetchTransactions();
    }
  }, [accountId]);

  // Fetch account details
  const fetchAccountDetails = async () => {
    try {
      const accountData = await getBankAccountById({ account_id: accountId });
      setAccount(accountData);
    } catch (err) {
      console.error("Fetch account details error:", err);
      // Fallback to static data
      setAccount(staticBankAccounts[accountId]);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const txnData = await getBankTransactions({ bank_account_id: accountId });
      setTransactions(txnData || []);
    } catch (err) {
      console.error("Fetch transactions error:", err);
      const errorMessage = err?.response?.data?.detail || err.message || "Failed to load transactions";
      setError(errorMessage);
      // Fallback to static data
      setTransactions(staticTransactions[accountId] || []);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return value > 0 ? `${value.toLocaleString()}` : "-";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const mon = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      const time = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: true }).format(date);
      return `${mon}, ${day}, ${year} ${time}`;
    } catch {
      return dateString;
    }
  };

  // Get unique status values from transactions
  const uniqueStatuses = React.useMemo(() => {
    const statuses = transactions
      .map(txn => txn.status)
      .filter(status => status) // Remove null/undefined
      .map(status => status.toLowerCase()); // Normalize to lowercase
    return Array.from(new Set(statuses)); // Get unique values
  }, [transactions]);

  // Filter transactions
  const filtered = transactions.filter((txn) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = `${txn._id || txn.id || ''} ${txn.description || ''} ${txn.reference || ''}`.toLowerCase().includes(search);
    const matchesStatus = statusFilter === "All Status" ? true : txn.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalDebit = filtered.reduce((sum, txn) => sum + (txn.debit || txn.amount < 0 ? Math.abs(txn.amount || 0) : 0), 0);
  const totalCredit = filtered.reduce((sum, txn) => sum + (txn.credit || txn.amount > 0 ? txn.amount || 0 : 0), 0);

  // Handle checkbox selection
  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allVisibleIds = filtered.map((txn) => txn._id || txn.id);
  const allSelectedOnPage = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  
  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle import transactions
  const handleImportTransactions = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to import");
      return;
    }

    if (!accountId) {
      toast.error("Account ID is missing");
      return;
    }

    try {
      setImportLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("bank_account_id", accountId);
      formData.append("format", importFormat);

      const result = await importBankTransactions(formData);

      // Show success message with details
      toast.success(
        `Import successful! Transactions imported: ${result.transactions_imported || 0}, Exact matches: ${result.matching_stats?.exact_matches || 0}, Unmatched: ${result.matching_stats?.unmatched || 0}`
      );

      // Close modal and reset
      setShowImportModal(false);
      setSelectedFile(null);
      setImportFormat("pdf");

      // Refresh transactions list
      fetchTransactions();
    } catch (err) {
      console.error("Import transactions error:", err);
      let errorMessage = err?.response?.data?.detail || err.message || "Failed to import transactions";
      
      // Add helpful suggestions based on error type
      if (errorMessage.includes("No tabular content detected")) {
        toast.error("No tabular content detected. Try using CSV format instead, or ensure your PDF contains a clear transaction table.");
      } else if (errorMessage.includes("Failed to parse")) {
        toast.error("Failed to parse file. Make sure the file format matches the selected format type.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setImportLoading(false);
    }
  };

  // Close import modal
  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setImportFormat("pdf");
  };

  // Send selected transactions to ledger
  const handleSendToLedger = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one transaction");
      return;
    }

    try {
      setSendingToLedger(true);
      
      // Call API to send transactions to ledger
      const result = await sendTransactionsToLedger({ 
        transaction_ids: selectedIds 
      });

      // Show success message
      toast.success(`Successfully sent ${selectedIds.length} transaction(s) to ledger!`);
      
      // Clear selection and refresh transactions
      setSelectedIds([]);
      fetchTransactions();
    } catch (err) {
      console.error("Send to ledger error:", err);
      const errorMessage = err?.response?.data?.detail || err.message || "Failed to send transactions to ledger";
      toast.error(errorMessage);
    } finally {
      setSendingToLedger(false);
    }
  };

  // Export filtered transactions to CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    // CSV headers
    const headers = ["Transaction ID", "Date", "Description", "Reference", "Debit", "Credit", "Balance", "Type", "Status"];
    
    // CSV rows
    const rows = filtered.map((txn) => {
      const isCredit = txn.type === "credit" || txn.amount > 0;
      const isDebit = txn.type === "debit" || txn.amount < 0;
      const debitAmount = isDebit ? Math.abs(txn.amount || txn.debit || 0) : 0;
      const creditAmount = isCredit ? (txn.amount || txn.credit || 0) : 0;
      
      return [
        txn._id || txn.id || '-',
        formatDate(txn.transaction_date || txn.date),
        txn.description || '-',
        txn.reference || '-',
        debitAmount,
        creditAmount,
        txn.balance || 0,
        isCredit ? "CREDIT" : "DEBIT",
        (txn.status || 'pending').toUpperCase()
      ];
    });

    // Add totals row
    rows.push([
      "",
      "",
      "",
      "Totals:",
      totalDebit,
      totalCredit,
      totalCredit - totalDebit,
      "",
      ""
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${accountId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Transactions exported successfully!");
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => navigate("/app/bank-transactions")} className="mb-2 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Back to Accounts
              </Button>
              <h1 className="text-2xl font-semibold text-fg-40">{account?.account_name || "Account Transactions"}</h1>
              <p className="text-sm text-fg-60 mt-1">
                {account?.bank_name} • {account?.iban || account?.account_number}
              </p>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-3">
            <div className="text-sm text-fg-60 bg-bg-50 border border-bd-50 rounded-xl p-3">{error}</div>
          </div>
        )}

        {/* Filters Section */}
        <div className="py-4">
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-60" strokeWidth={1.5} />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="w-44">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All Status">All Status</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.toUpperCase()}
                  </option>
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

            {/* Send to Ledger */}
            <Button 
              variant="primary" 
              onClick={handleSendToLedger} 
              disabled={selectedIds.length === 0 || sendingToLedger}
              className="whitespace-nowrap flex items-center gap-2"
            >
              <Download className="w-4 h-4" strokeWidth={1.5} />
              <span>{sendingToLedger ? "Sending..." : `Send to Ledger (${selectedIds.length})`}</span>
            </Button>

            {/* Export CSV */}
            <Button variant="secondary" onClick={handleExportCSV} className="whitespace-nowrap flex items-center gap-2">
              <Download className="w-4 h-4" strokeWidth={1.5} />
              <span>Export</span>
            </Button>

            {/* Import Transactions */}
            <Button variant="secondary" onClick={() => setShowImportModal(true)} className="whitespace-nowrap flex items-center gap-2">
              <Upload className="w-4 h-4" strokeWidth={1.5} />
              <span>Import</span>
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <Table>
          <TableHeader>
            <TableRow isHeader={true}>
              <TableHead className="w-10" isFirst={true}>
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 rounded border-bd-50"
                  checked={allSelectedOnPage}
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="whitespace-nowrap">Transaction ID</TableHead>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="whitespace-nowrap">Description</TableHead>
              <TableHead className="whitespace-nowrap">Reference</TableHead>
              <TableHead className="whitespace-nowrap">Debit</TableHead>
              <TableHead className="whitespace-nowrap">Credit</TableHead>
              <TableHead className="whitespace-nowrap">Balance</TableHead>
              <TableHead className="whitespace-nowrap">Type</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton loading rows matching Dashboard.jsx pattern
              [...Array(8)].map((_, i) => (
                <TableRow key={i} isLast={i === 7}>
                  <TableCell><div className="w-4 h-4 bg-bg-40 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-3 w-20 bg-bg-40 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-3 w-36 bg-bg-40 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-3 w-48 bg-bg-40 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-3 w-28 bg-bg-40 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-3 w-16 bg-bg-40 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-3 w-16 bg-bg-40 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-3 w-20 bg-bg-40 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-bg-40 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 w-24 bg-bg-40 rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {filtered.map((txn, index) => {
                  const isCredit = txn.type === "credit" || txn.amount > 0;
                  const isDebit = txn.type === "debit" || txn.amount < 0;
                  const debitAmount = isDebit ? Math.abs(txn.amount || txn.debit || 0) : 0;
                  const creditAmount = isCredit ? (txn.amount || txn.credit || 0) : 0;
                  const txnId = txn._id || txn.id;
                  
                  return (
                    <TableRow key={txnId} isLast={index === filtered.length - 1}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 rounded border-bd-50"
                          checked={selectedIds.includes(txnId)}
                          onChange={() => toggleSelect(txnId)}
                          aria-label={`Select transaction ${txnId}`}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-fg-60 whitespace-nowrap">{txnId || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-fg-60 whitespace-nowrap">{formatDate(txn.transaction_date || txn.date)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-fg-40 whitespace-nowrap">{txn.description || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-fg-60 whitespace-nowrap">{txn.reference || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-fg-60 whitespace-nowrap">{formatCurrency(debitAmount)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-fg-60 whitespace-nowrap">{formatCurrency(creditAmount)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-fg-40 whitespace-nowrap">{formatCurrency(txn.balance || 0)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isCredit ? "success" : "error"}>
                          {isCredit ? "CREDIT" : "DEBIT"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={txn.status === "completed" ? "success" : txn.status === "pending" ? "warning" : "error"}>
                          {(txn.status || 'pending').toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center" colSpan={10}>
                      <span className="text-sm text-fg-60">No transactions found.</span>
                    </TableCell>
                  </TableRow>
                )}

                {/* Totals Row */}
                {!loading && filtered.length > 0 && (
                  <TableRow isLast={true}>
                    <TableCell colSpan={5} className="text-right">
                      <span className="text-sm font-semibold text-fg-40">Totals:</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-red-600">{formatCurrency(totalDebit)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-green-600">{formatCurrency(totalCredit)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-fg-40">{formatCurrency(totalCredit - totalDebit)}</span>
                    </TableCell>
                    <TableCell colSpan={2}>
                      <span className="text-xs text-fg-60">Net Balance</span>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>

        {/* Import Transactions Modal */}
        <Modal open={showImportModal} onClose={handleCloseImportModal}>
          <ModalHeader
            title="Import Bank Transactions"
            action={
              <Button variant="ghost" size="icon" onClick={handleCloseImportModal}>
                <X className="w-4 h-4" />
              </Button>
            }
          />
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-fg-60 mb-1 block">Account ID</label>
                <Input
                  type="text"
                  value={accountId || ""}
                  disabled
                  className="bg-bg-60"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-fg-60 mb-1 block">File Format *</label>
                <Select value={importFormat} onChange={(e) => setImportFormat(e.target.value)}>
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="camt053">CAMT053</option>
                  <option value="mt940">MT940</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-fg-60 mb-1 block">Select File *</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.csv,.xml,.txt"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {selectedFile && (
                    <span className="text-xs text-fg-60 whitespace-nowrap">{selectedFile.name}</span>
                  )}
                </div>
                <p className="text-xs text-fg-60 mt-1">
                  Supported formats: PDF (with tables), CSV, CAMT053, MT940
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Note: PDF files must contain clear transaction tables. CSV format is recommended for best results.
                </p>
              </div>

              {selectedFile && (
                <div className="bg-bg-60 border border-bd-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-fg-60" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-fg-40">{selectedFile.name}</p>
                      <p className="text-xs text-fg-60">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseImportModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleImportTransactions} disabled={importLoading || !selectedFile}>
              {importLoading ? "Importing..." : "Import Transactions"}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default BankTransactionDetails;
