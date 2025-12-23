// This page shows real ledger data from the API in a table, similar to Vouchers
import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, MoreHorizontal, Loader2, Trash2, Download, Info, FileText, X, ChevronDown, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// Import UI components and image preview modal for thumbnails
// Import UI components for table rendering
import { Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Input, Select } from "../../../ui";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../../ui/Modal";
import RightPanel from "../common/right-panel";
// Import ledger API services for listing and deleting entries
import { listUserLedgers, deleteLedgerEntry, exportUserLedgersPDF, updateLedgerEntryModelo } from "../../../../api/apiFunction/ledgerServices";
// Import modelos API service
import { getModelos } from "../../../../api/apiFunction/modeloServices";

// This small helper formats numbers as currency for totals
const formatCurrency = (value) => {
  const num = Number(value || 0);
  return num > 0 ? `$${num.toLocaleString()}` : "-";
};

// Format the Created date like other tables (e.g., "Nov, 02, 2025 01:23 PM")
const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const mon = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  const time = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: true }).format(d);
  return `${mon}, ${day}, ${year} ${time}`;
};

// This component fetches ledger entries and displays them in a themed table
const Ledger = () => {
  const navigate = useNavigate();
  
  // Read current user from localStorage for API calls
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const userId = user?.id || user?._id || user?.user_id || user?.uid;

  // Manage data, loading, and errors from the server
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState([]);

  // Local UI controls: search and status filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelSection, setPanelSection] = useState(null);
  const [panelEntry, setPanelEntry] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, ledgerId: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [pdfModal, setPdfModal] = useState({ open: false, pdfBlob: null });
  const [pdfLoading, setPdfLoading] = useState(false);

  // Modelos modal state for showing selected entries
  const [modelosModal, setModelosModal] = useState({ open: false, entries: [] });
  const [modelos, setModelos] = useState([]);
  const [modelosLoading, setModelosLoading] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState("");
  const [assignModeloLoading, setAssignModeloLoading] = useState(false);
  const [modeloDropdownOpen, setModeloDropdownOpen] = useState(false);
  const [modeloSearchQuery, setModeloSearchQuery] = useState("");

  // Create PDF URL only when blob is available
  const pdfUrl = useMemo(() => {
    if (pdfModal.pdfBlob && pdfModal.pdfBlob instanceof Blob) {
      return URL.createObjectURL(pdfModal.pdfBlob);
    }
    return null;
  }, [pdfModal.pdfBlob]);

  // Cleanup PDF URL when modal closes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Removed image preview functionality from ledger as requested

  // Open the right panel with the selected section
  const openPanel = (section, entry) => {
    setPanelSection(section);
    setPanelEntry(entry || null);
    setPanelOpen(true);
  };

  // Close the right panel
  const closePanel = () => {
    setPanelOpen(false);
    setPanelSection(null);
    setPanelEntry(null);
  };

  // This function loads ledger entries from backend for the logged in user
  const fetchLedgers = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError("");
      const { entries: items } = await listUserLedgers({ user_id: userId });
      setEntries(Array.isArray(items) ? items : []);
      
      // Also fetch modelos for lookup in the table
      if (modelos.length === 0) {
        try {
          const modeloData = await getModelos({ user_id: userId });
          setModelos(Array.isArray(modeloData) ? modeloData : []);
        } catch (err) {
          console.error("Failed to fetch modelos:", err);
        }
      }
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Failed to fetch ledger entries";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (ledger_id) => {
    setDeleteModal({ open: true, ledgerId: ledger_id });
  };

  // This function deletes a single ledger entry and refreshes the table
  const confirmDelete = async () => {
    const { ledgerId } = deleteModal;
    if (!ledgerId) return;
    
    try {
      setDeleteLoading(true);
      await deleteLedgerEntry({ ledger_id: ledgerId });
      setDeleteModal({ open: false, ledgerId: null });
      await fetchLedgers();
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Failed to delete ledger entry";
      setError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Modelos button click - show selected entries in modal
  const handleModelosButtonClick = async () => {
    const selectedEntries = filtered.filter((e) => {
      const entryId = e._id || e.id;
      return selectedIds.includes(entryId);
    });
    setModelosModal({ open: true, entries: selectedEntries });
    setSelectedModelo(""); // Reset selection when opening modal
    setModeloDropdownOpen(false); // Close dropdown when opening modal
    setModeloSearchQuery(""); // Reset search query

    // Fetch modelos if not already loaded
    if (modelos.length === 0 && !modelosLoading) {
      try {
        setModelosLoading(true);
        const data = await getModelos({ user_id: userId });
        setModelos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch modelos:", err);
        setError("Failed to load modelos");
      } finally {
        setModelosLoading(false);
      }
    }
  };

  // Handle Assign Modelo - call API for all selected entries
  const handleAssignModelo = async () => {
    if (!selectedModelo || selectedIds.length === 0) return;

    try {
      setAssignModeloLoading(true);
      setError("");

      // Find the selected modelo to get its ID
      const selectedModeloObj = modelos.find((m) => m.modelo_no === selectedModelo);
      if (!selectedModeloObj) {
        setError("Selected modelo not found");
        return;
      }

      // Try multiple ID field names (handle different API responses)
      const modeloId = selectedModeloObj.modeloId || selectedModeloObj._id || selectedModeloObj.id || selectedModeloObj.modelo_id;
      
      if (!modeloId) {
        console.error("Modelo object:", selectedModeloObj);
        setError("Modelo ID not found in selected modelo");
        return;
      }



      // Call API for each selected entry
      const updatePromises = selectedIds.map((entryId) =>
        updateLedgerEntryModelo({ entry_id: entryId, modelo_id: modeloId, user_id: userId })
      );

      await Promise.all(updatePromises);

      // Success - close modal and refresh ledgers
      toast.success(`Modelo assigned to ${selectedIds.length} entries`);
      setModelosModal({ open: false, entries: [] });
      setSelectedModelo("");
      setSelectedIds([]); // Clear selections
      
      // Refresh both ledgers and modelos to ensure column updates
      try {
        setLoading(true);
        const { entries: items } = await listUserLedgers({ user_id: userId });
        setEntries(Array.isArray(items) ? items : []);
        
        // Force refresh of modelos
        const modeloData = await getModelos({ user_id: userId });
        setModelos(Array.isArray(modeloData) ? modeloData : []);
      } catch (err) {
        console.error("Failed to refresh data:", err);
      } finally {
        setLoading(false);
      }

    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Failed to assign modelo";
      setError(message);
      toast.error(message);
    } finally {
      setAssignModeloLoading(false);
    }
  };

  // This function exports selected ledgers as PDF
  const handleExportPDF = async () => {
    if (!userId || selectedIds.length === 0) return;
    
    try {
      setPdfLoading(true);
      setError("");
      const pdfBlob = await exportUserLedgersPDF({ 
        user_id: userId,
        ids: selectedIds
      });
      setPdfModal({ open: true, pdfBlob });
      // Clear selections after successful export
      setSelectedIds([]);
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Failed to export PDF";
      setError(message);
    } finally {
      setPdfLoading(false);
    }
  };

  // Download the PDF from the modal
  const downloadPDF = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `ledgers_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Load entries on mount and whenever the user changes
  useEffect(() => {
    fetchLedgers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Derive unique transaction types for filtering (credit/debit)
  const statusOptions = useMemo(() => {
    const set = new Set(entries.map((e) => String(e?.invoice_data?.transaction_type || "").toUpperCase()).filter(Boolean));
    return ["All Status", ...Array.from(set).sort()];
  }, [entries]);

  // Filter entries based on search and selected transaction type
  const filtered = useMemo(() => {
    let list = entries;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((e) => {
        const supplier = e?.invoice_data?.supplier?.business_name || "";
        const customer = e?.invoice_data?.customer?.company_name || "";
        const invNo = e?.invoice_data?.invoice?.invoice_number || "";
        return (
          supplier.toLowerCase().includes(q) ||
          customer.toLowerCase().includes(q) ||
          String(invNo).toLowerCase().includes(q)
        );
      });
    }
    if (statusFilter !== "All Status") {
      list = list.filter((e) => String(e?.invoice_data?.transaction_type || "").toUpperCase() === String(statusFilter).toUpperCase());
    }
    return list;
  }, [entries, searchQuery, statusFilter]);

  // Compute totals across filtered rows for display purposes
  const totals = useMemo(() => {
    const sum = filtered.reduce(
      (acc, e) => {
        const total = Number(e?.invoice_data?.totals?.Total_with_Tax || e?.invoice_data?.totals?.total || 0);
        return { count: acc.count + 1, total: acc.total + (total || 0) };
      },
      { count: 0, total: 0 }
    );
    return sum;
  }, [filtered]);

  // Filter modelos based on search query
  const filteredModelos = useMemo(() => {
    if (!modeloSearchQuery.trim()) return modelos;
    const query = modeloSearchQuery.toLowerCase();
    return modelos.filter((m) => String(m.modelo_no || "").toLowerCase().includes(query));
  }, [modelos, modeloSearchQuery]);

  // Handle checkbox selection
  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allVisibleIds = filtered.map((e) => e._id || e.id);
  const allSelectedOnPage = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  
  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };

  // Render the ledger table layout with header, filters, and actions
  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header with title and actions */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-fg-40">Ledgers</h1>
              <p className="text-sm text-fg-60 mt-1">All entries produced by OCR and processing.</p>
            </div>
            <div className="flex items-center space-x-3">
              {selectedIds.length > 0 && (
                <Button 
                  variant="primary" 
                  onClick={handleExportPDF}
                  disabled={pdfLoading}
                  className="flex items-center gap-2"
                >
                  {pdfLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Export PDF ({selectedIds.length})
                    </>
                  )}
                </Button>
              )}
              <Button variant="secondary" onClick={fetchLedgers}>Refresh</Button>
            </div>
          </div>
        </div>

        {/* Filters Section with search and status filter */}
        <div className="py-4">
          <div className="flex items-center space-x-4">
            {/* Search Bar for supplier/customer/invoice number */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-60" strokeWidth={1.5} />
              <Input type="text" placeholder="Search Suppliers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>

            {/* Status Filter using the themed Select */}
            <div className="w-44">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </div>

            {/* More Filters button (placeholder for future) */}
            <Button variant="secondary" size="icon">
              <Filter className="w-4 h-4" strokeWidth={1.5} />
            </Button>

            {/* More Options button (placeholder for future) */}
            {/* <Button variant="secondary" size="icon">
              <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
            </Button> */}

            {/* Modelos Button - Only visible when rows are selected */}
            {selectedIds.length > 0 && (
              <Button 
                variant="primary" 
                className="whitespace-nowrap flex items-center gap-2"
                onClick={handleModelosButtonClick}
              >
                <span>Modelos</span>
              </Button>
            )}

            {/* Download Ledger CSV using current filtered rows */}
            <Button variant="primary" className="whitespace-nowrap flex items-center gap-2" onClick={() => {
              // Build CSV from filtered entries
              const header = [
                "Invoice #",
                "Supplier",
                "Customer",
                "Items Count",
                "Total",
                "VAT_rate",
                "VAT_amount",
                "Total_with_Tax",
                "Type",
                "Created"
              ].join(",");
              const lines = filtered.map((e) => {
                const sup = e?.invoice_data?.supplier?.business_name || "";
                const cus = e?.invoice_data?.customer?.company_name || "";
                const inv = e?.invoice_data?.invoice?.invoice_number || "";
                const total = e?.invoice_data?.totals?.total ?? 0;
                const vatRate = e?.invoice_data?.totals?.VAT_rate ?? "";
                const vatAmount = e?.invoice_data?.totals?.VAT_amount ?? 0;
                const totalWithTax = e?.invoice_data?.totals?.Total_with_Tax ?? e?.invoice_data?.totals?.total ?? 0;
                const txType = e?.invoice_data?.transaction_type || "";
                const created = e?.created_at || "";
                const itemsCount = Array.isArray(e?.invoice_data?.items) ? e.invoice_data.items.length : 0;
                return [
                  inv,
                  sup,
                  cus,
                  itemsCount,
                  total,
                  vatRate,
                  vatAmount,
                  totalWithTax,
                  txType,
                  created,
                ].map((v) => (typeof v === "string" ? '"' + String(v).replace(/"/g, '""') + '"' : v)).join(",");
              });
              const csv = [header, ...lines].join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "ledgers.csv";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}>
              <Download className="w-4 h-4" strokeWidth={1.5} />
              <span>Download Ledger</span>
            </Button>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-3">
            <Badge variant="warning">{error}</Badge>
          </div>
        )}

        {/* Ledgers Table: shows actual API data in a familiar UI */}
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
              {/* Put Invoice # first and remove internal ids */}
              <TableHead className="whitespace-nowrap">Invoice #</TableHead>
              <TableHead className="whitespace-nowrap">Supplier</TableHead>
              <TableHead className="whitespace-nowrap">Customer</TableHead>
              <TableHead className="whitespace-nowrap">Items</TableHead>
              {/* Split totals into separate columns */}
              <TableHead className="whitespace-nowrap">Total</TableHead>
              <TableHead className="whitespace-nowrap">VAT %</TableHead>
              <TableHead className="whitespace-nowrap">VAT Amount</TableHead>
              <TableHead className="whitespace-nowrap">Total with Tax</TableHead>
              {/* New transaction type column shows debit/credit as badges */}
              <TableHead className="whitespace-nowrap">Type</TableHead>
              <TableHead className="whitespace-nowrap">Created</TableHead>
              <TableHead className="whitespace-nowrap">Modelos</TableHead>
              <TableHead className="whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton loading rows
              [...Array(5)].map((_, i) => (
                <TableRow key={i} isLast={i === 4}>
                  {/* Checkbox skeleton */}
                  <TableCell>
                    <div className="w-4 h-4 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Invoice # skeleton */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-bg-40 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-bg-40 rounded animate-pulse" />
                    </div>
                  </TableCell>
                  {/* Supplier skeleton */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-bg-40 rounded animate-pulse" />
                      <div className="h-3 w-32 bg-bg-40 rounded animate-pulse" />
                    </div>
                  </TableCell>
                  {/* Customer skeleton */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-bg-40 rounded animate-pulse" />
                      <div className="h-3 w-28 bg-bg-40 rounded animate-pulse" />
                    </div>
                  </TableCell>
                  {/* Items skeleton */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-bg-40 rounded animate-pulse" />
                      <div className="h-3 w-8 bg-bg-40 rounded animate-pulse" />
                    </div>
                  </TableCell>
                  {/* Total skeleton */}
                  <TableCell>
                    <div className="h-3 w-16 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* VAT % skeleton */}
                  <TableCell>
                    <div className="h-3 w-12 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* VAT Amount skeleton */}
                  <TableCell>
                    <div className="h-3 w-16 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Total with Tax skeleton */}
                  <TableCell>
                    <div className="h-3 w-16 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Type badge skeleton */}
                  <TableCell>
                    <div className="h-6 w-16 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Created skeleton */}
                  <TableCell>
                    <div className="h-3 w-32 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Modelos skeleton */}
                  <TableCell>
                    <div className="h-3 w-16 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Actions skeleton */}
                  <TableCell>
                    <div className="w-8 h-8 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {filtered.map((e, index) => {
                  const entryId = e._id || e.id;
                  
                  return (
                    <TableRow key={entryId || index} isLast={index === filtered.length - 1}>
                      {/* Checkbox */}
                      <TableCell>
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 rounded border-bd-50"
                          checked={selectedIds.includes(entryId)}
                          onChange={() => toggleSelect(entryId)}
                          aria-label={`Select ledger entry ${entryId}`}
                        />
                      </TableCell>
                      {/* Invoice number with info icon placed on the left */}
                      <TableCell>
                  <div className="flex items-center gap-2">
                    <button title="Invoice details" className="text-fg-60 hover:text-fg-40" onClick={() => openPanel("invoice", e)}>
                      <Info className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-fg-60 whitespace-nowrap">{e?.invoice_data?.invoice?.invoice_number || "-"}</span>
                  </div>
                </TableCell>
                {/* Supplier name with info icon placed on the left */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button title="Supplier info" className="text-fg-60 hover:text-fg-40" onClick={() => openPanel("supplier", e)}>
                      <Info className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-fg-40 whitespace-nowrap">{e?.invoice_data?.supplier?.business_name || "-"}</span>
                  </div>
                </TableCell>
                {/* Customer with info icon placed on the left */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button title="Customer info" className="text-fg-60 hover:text-fg-40" onClick={() => openPanel("customer", e)}>
                      <Info className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-fg-60 whitespace-nowrap">{e?.invoice_data?.customer?.company_name || "-"}</span>
                  </div>
                </TableCell>
                {/* Items count with info icon placed on the left */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button title="View items" className="text-fg-60 hover:text-fg-40" onClick={() => openPanel("items", e)}>
                      <Info className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-fg-60 whitespace-nowrap">{Array.isArray(e?.invoice_data?.items) ? e.invoice_data.items.length : 0}</span>
                  </div>
                </TableCell>
                {/* Show totals directly in four separate columns */}
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">{formatCurrency(e?.invoice_data?.totals?.total)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">{typeof e?.invoice_data?.totals?.VAT_rate === "number" ? e.invoice_data.totals.VAT_rate.toFixed(2) : (e?.invoice_data?.totals?.VAT_rate ?? "-")}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">{formatCurrency(e?.invoice_data?.totals?.VAT_amount)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">{formatCurrency(e?.invoice_data?.totals?.Total_with_Tax ?? e?.invoice_data?.totals?.total)}</span>
                </TableCell>
                {/* Transaction type (debit/credit) displayed as a badge */}
                <TableCell>
                  {(() => {
                    const t = String(e?.invoice_data?.transaction_type || "-").toLowerCase();
                    const variant = t === "credit" ? "success" : t === "debit" ? "error" : "info";
                    return <Badge variant={variant}>{String(t || "-").toUpperCase()}</Badge>;
                  })()}
                </TableCell>
                <TableCell>
                   <span className="text-sm text-fg-60 whitespace-nowrap">{formatDateTime(e?.created_at)}</span>
                </TableCell>
                <TableCell>
                  {(() => {
                    const modeloId = e?.modelo_id;
                    if (!modeloId) {
                      return <span className="text-sm text-fg-60 whitespace-nowrap">N/A</span>;
                    }
                    const foundModelo = modelos.find((m) => m._id === modeloId || m.id === modeloId || m.modeloId === modeloId);
                    const modeloNo = foundModelo?.modelo_no;
                    
                    if (modeloNo === "600") {
                      return (
                        <span 
                          className="text-sm text-fg-40 whitespace-nowrap underline cursor-pointer hover:text-primary-500 transition-colors relative group"
                          onClick={() => navigate(`/app/modelos/modelo-600`, { state: { returnTo: location.pathname } })}
                        >
                          {modeloNo}
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-bg-30 text-fg-40 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Open Form
                          </span>
                        </span>
                      );
                    }
                    
                    return <span className="text-sm text-fg-60 whitespace-nowrap">{modeloNo || "N/A"}</span>;
                  })()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Button variant="secondary" size="icon" onClick={() => showDeleteConfirmation(e?._id || e?.id)} aria-label="Delete ledger entry">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
                  );
                })}

            {filtered.length === 0 && (
              <TableRow>
                 {/* Adjusted colSpan to 13 to match headers (added Modelos column) */}
                 <TableCell className="text-center" colSpan={13}>
                   <span className="text-sm text-fg-60">No ledger entries match your filters.</span>
                 </TableCell>
               </TableRow>
             )}
          </>
        )}
      </TableBody>
        </Table>

        {/* Totals row displayed separately below the table */}
        <div className="flex items-center justify-end py-3">
          <div className="text-sm text-fg-60">Total Amount: <span className="font-semibold text-fg-40">{formatCurrency(totals.total)}</span></div>
        </div>

        {/* Right-side info panel shows structured data based on selection */}
        {panelOpen && (
          <RightPanel
            open={panelOpen}
            onClose={closePanel}
            title={
              panelSection === "supplier" ? "Supplier Details" :
              panelSection === "customer" ? "Customer Details" :
              panelSection === "invoice" ? "Invoice Details" :
              panelSection === "items" ? "Items" :
              panelSection === "totals" ? "Totals" : "Details"
            }
          >
            {/* Supplier panel content */}
            {panelSection === "supplier" && (
              <div className="space-y-2 text-sm text-fg-60">
                <div><span className="font-medium text-fg-40">Name:</span> {panelEntry?.invoice_data?.supplier?.business_name || "-"}</div>
                <div><span className="font-medium text-fg-40">Address 1:</span> {panelEntry?.invoice_data?.supplier?.address_line1 || "-"}</div>
                <div><span className="font-medium text-fg-40">Address 2:</span> {panelEntry?.invoice_data?.supplier?.address_line2 || "-"}</div>
                <div><span className="font-medium text-fg-40">Email:</span> {panelEntry?.invoice_data?.supplier?.Email || "-"}</div>
              </div>
            )}

            {/* Customer panel content */}
            {panelSection === "customer" && (
              <div className="space-y-2 text-sm text-fg-60">
                <div><span className="font-medium text-fg-40">Company:</span> {panelEntry?.invoice_data?.customer?.company_name || "-"}</div>
                <div><span className="font-medium text-fg-40">Address 1:</span> {panelEntry?.invoice_data?.customer?.address_line1 || "-"}</div>
                <div><span className="font-medium text-fg-40">Address 2:</span> {panelEntry?.invoice_data?.customer?.address_line2 || "-"}</div>
                <div><span className="font-medium text-fg-40">Email:</span> {panelEntry?.invoice_data?.customer?.Email || "-"}</div>
              </div>
            )}

            {/* Invoice panel content */}
            {panelSection === "invoice" && (
              <div className="space-y-2 text-sm text-fg-60">
                <div><span className="font-medium text-fg-40">Invoice #:</span> {panelEntry?.invoice_data?.invoice?.invoice_number || "-"}</div>
                <div><span className="font-medium text-fg-40">Invoice Date:</span> {panelEntry?.invoice_data?.invoice?.invoice_date || "-"}</div>
                <div><span className="font-medium text-fg-40">Due Date:</span> {panelEntry?.invoice_data?.invoice?.due_date || "-"}</div>
                <div><span className="font-medium text-fg-40">Amount in Words:</span> {panelEntry?.invoice_data?.invoice?.amount_in_words || "-"}</div>
              </div>
            )}

            {/* Items panel content: minimal table */}
            {panelSection === "items" && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-fg-60">
                      <th className="py-1 px-2">Description</th>
                      <th className="py-1 px-2">Qty</th>
                      <th className="py-1 px-2">Price</th>
                      <th className="py-1 px-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(panelEntry?.invoice_data?.items) ? panelEntry.invoice_data.items : []).map((it, idx) => (
                      <tr key={idx} className="border-t border-bd-50">
                        <td className="py-1 px-2">{it?.description || "-"}</td>
                        <td className="py-1 px-2">{it?.qty ?? "-"}</td>
                        <td className="py-1 px-2">{typeof it?.unit_price === "number" ? it.unit_price.toFixed(2) : (it?.unit_price ?? "-")}</td>
                        <td className="py-1 px-2">{typeof it?.subtotal === "number" ? it.subtotal.toFixed(2) : (it?.subtotal ?? "-")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals panel content */}
            {panelSection === "totals" && (
              <div className="space-y-2 text-sm text-fg-60">
                <div><span className="font-medium text-fg-40">Total:</span> {panelEntry?.invoice_data?.totals?.total ?? "-"}</div>
                <div><span className="font-medium text-fg-40">VAT %:</span> {panelEntry?.invoice_data?.totals?.VAT_rate ?? "-"}</div>
                <div><span className="font-medium text-fg-40">VAT Amount:</span> {panelEntry?.invoice_data?.totals?.VAT_amount ?? "-"}</div>
                <div><span className="font-medium text-fg-40">Total with Tax:</span> {panelEntry?.invoice_data?.totals?.Total_with_Tax ?? "-"}</div>
              </div>
            )}
          </RightPanel>
        )}

        {/* Delete Confirmation Modal */}
        <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, ledgerId: null })}>
          <ModalHeader 
            title="Delete Ledger Entry"
            action={
              <Button variant="ghost" size="icon" onClick={() => setDeleteModal({ open: false, ledgerId: null })}>
                <X className="w-4 h-4" />
              </Button>
            }
          />
          <ModalBody>
            <p className="text-sm text-fg-60">Are you sure you want to delete this ledger entry? This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setDeleteModal({ open: false, ledgerId: null })} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmDelete} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700 disabled:opacity-50">
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </ModalFooter>
        </Modal>

        {/* PDF Preview Modal */}
        <Modal open={pdfModal.open && !!pdfUrl} onClose={() => setPdfModal({ open: false, pdfBlob: null })}>
          <ModalHeader 
            title="Ledger PDF Preview"
            action={
              <Button variant="ghost" size="icon" onClick={() => setPdfModal({ open: false, pdfBlob: null })}>
                <X className="w-4 h-4" />
              </Button>
            }
          />
          <ModalBody className="p-0">
            <div className="w-full h-[70vh] border-t border-b border-bd-50">
              {pdfUrl && (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setPdfModal({ open: false, pdfBlob: null })}>
              Close
            </Button>
            <Button variant="primary" onClick={downloadPDF} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </ModalFooter>
        </Modal>

        {/* Image preview modal removed for ledger */}

        {/* Modelos Selection Modal */}
        <Modal open={modelosModal.open} onClose={() => setModelosModal({ open: false, entries: [] })}>
          <ModalHeader 
            title={`Selected Entries (${modelosModal.entries.length})`}
            action={
              <Button variant="ghost" size="icon" onClick={() => setModelosModal({ open: false, entries: [] })}>
                <X className="w-4 h-4" />
              </Button>
            }
          />
          <ModalBody className="flex flex-col max-h-[70vh]">
            <div className="space-y-4 flex-1 overflow-y-auto hidden-scrollbar">
              {/* Modelo Selection Section */}
              <div className="border border-bd-50 rounded-lg p-4 bg-bg-60 sticky top-0 z-30">
                <label className="block text-sm font-medium text-fg-40 mb-3">Select Modelo</label>
                
                {/* Search Field */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Search by modelo no..."
                    value={modeloSearchQuery}
                    onChange={(e) => setModeloSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-bd-50 bg-bg-50 text-fg-40 text-sm focus:outline-none focus:ring-2 focus:ring-bd-40"
                    disabled={modelosLoading}
                  />
                </div>

                {/* Modelos Table */}
                <div className="border border-bd-50 rounded-lg overflow-hidden">
                  <div className="max-h-48 overflow-y-auto hidden-scrollbar">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-bg-50 border-b border-bd-50 sticky top-0">
                          <th className="py-2 px-3 text-left text-fg-60 w-12">Select</th>
                          <th className="py-2 px-3 text-left text-fg-60">Modelo No</th>
                          <th className="py-2 px-3 text-left text-fg-60">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modelosLoading ? (
                          <tr>
                            <td colSpan="3" className="py-4 text-center text-fg-60">Loading modelos...</td>
                          </tr>
                        ) : filteredModelos.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="py-4 text-center text-fg-60">No modelos found</td>
                          </tr>
                        ) : (
                          filteredModelos.map((modelo) => (
                            <tr key={modelo._id || modelo.modelo_no} className="border-b border-bd-50 hover:bg-bg-40">
                              <td className="py-2 px-3">
                                <input
                                  type="radio"
                                  name="modelo-select"
                                  checked={selectedModelo === modelo.modelo_no}
                                  onChange={() => setSelectedModelo(modelo.modelo_no)}
                                  className="form-radio h-4 w-4 rounded border-bd-50"
                                />
                              </td>
                              <td className="py-2 px-3 text-fg-40 font-medium">{modelo.modelo_no}</td>
                              <td className="py-2 px-3 text-fg-60">{modelo.name || modelo.description || "Modelo"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Selected Modelo Info */}
                {selectedModelo && modelos.length > 0 && (
                  <div className="mt-3 p-2 bg-bg-50 rounded text-sm text-fg-60 border border-bd-50">
                    <div className="font-medium text-fg-40">Selected: {selectedModelo}</div>
                    <div className="text-xs mt-1">{modelos.find(m => m.modelo_no === selectedModelo)?.name || modelos.find(m => m.modelo_no === selectedModelo)?.description || "Modelo"}</div>
                  </div>
                )}
              </div>

              {/* Selected Entries Table */}
              <div className="border border-bd-50 rounded-lg overflow-hidden">
                <div className="text-sm font-medium text-fg-40 px-4 py-2 bg-bg-50 border-b border-bd-50">Selected Entries ({modelosModal.entries.length})</div>
                <div className="overflow-x-auto overflow-y-auto hidden-scrollbar">
                  <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bd-50 text-left text-fg-60 bg-bg-50 sticky top-0">
                    <th className="py-2 px-2 whitespace-nowrap">Invoice #</th>
                    <th className="py-2 px-2 whitespace-nowrap">Supplier</th>
                    <th className="py-2 px-2 whitespace-nowrap">Customer</th>
                    <th className="py-2 px-2 whitespace-nowrap">Items</th>
                    <th className="py-2 px-2 whitespace-nowrap">Total</th>
                    <th className="py-2 px-2 whitespace-nowrap">VAT %</th>
                    <th className="py-2 px-2 whitespace-nowrap">VAT Amt</th>
                    <th className="py-2 px-2 whitespace-nowrap">Total w/ Tax</th>
                    <th className="py-2 px-2 whitespace-nowrap">Type</th>
                    <th className="py-2 px-2 whitespace-nowrap">Modelos</th>
                    <th className="py-2 px-2 whitespace-nowrap">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {modelosModal.entries.map((entry, idx) => (
                    <tr key={idx} className="border-b border-bd-50 hover:bg-bg-60">
                      <td className="py-2 px-2 text-fg-60 whitespace-nowrap">{entry?.invoice_data?.invoice?.invoice_number || "-"}</td>
                      <td className="py-2 px-2 text-fg-40 font-medium whitespace-nowrap">{entry?.invoice_data?.supplier?.business_name || "-"}</td>
                      <td className="py-2 px-2 text-fg-60 whitespace-nowrap">{entry?.invoice_data?.customer?.company_name || "-"}</td>
                      <td className="py-2 px-2 text-fg-60 text-center whitespace-nowrap">{Array.isArray(entry?.invoice_data?.items) ? entry.invoice_data.items.length : 0}</td>
                      <td className="py-2 px-2 text-fg-60 whitespace-nowrap">{formatCurrency(entry?.invoice_data?.totals?.total)}</td>
                      <td className="py-2 px-2 text-fg-60 whitespace-nowrap">{typeof entry?.invoice_data?.totals?.VAT_rate === "number" ? entry.invoice_data.totals.VAT_rate.toFixed(2) : (entry?.invoice_data?.totals?.VAT_rate ?? "-")}</td>
                      <td className="py-2 px-2 text-fg-60 whitespace-nowrap">{formatCurrency(entry?.invoice_data?.totals?.VAT_amount)}</td>
                      <td className="py-2 px-2 text-fg-60 whitespace-nowrap font-medium">{formatCurrency(entry?.invoice_data?.totals?.Total_with_Tax ?? entry?.invoice_data?.totals?.total)}</td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {(() => {
                          const t = String(entry?.invoice_data?.transaction_type || "-").toLowerCase();
                          const variant = t === "credit" ? "success" : t === "debit" ? "error" : "info";
                          return <Badge variant={variant}>{String(t || "-").toUpperCase()}</Badge>;
                        })()}
                      </td>
                      <td className="py-2 px-2 text-fg-60 whitespace-nowrap text-xs">
                        {(() => {
                          const modeloId = entry?.modelo_id;
                          if (!modeloId) {
                            return <span>N/A</span>;
                          }
                          const foundModelo = modelos.find((m) => m._id === modeloId || m.id === modeloId || m.modeloId === modeloId);
                          return <span>{foundModelo?.modelo_no || "N/A"}</span>;
                        })()}
                      </td>
                      <td className="py-2 px-2 text-fg-60 whitespace-nowrap text-xs">{formatDateTime(entry?.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              </div>
              </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="secondary" 
                  onClick={() => setModelosModal({ open: false, entries: [] })}
                  disabled={assignModeloLoading}
                >
                  Close
                </Button>
                <Button 
                  variant="primary" 
                  disabled={!selectedModelo || assignModeloLoading}
                  onClick={handleAssignModelo}
                >
                  {assignModeloLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Assigning...
                    </>
                  ) : (
                    "Assign Modelo"
                  )}
                </Button>
              </ModalFooter>
              </Modal>
        </div>
        </div>
        );
        };

        export default Ledger;