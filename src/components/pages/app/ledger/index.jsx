// This page shows real ledger data from the API in a table, similar to Vouchers
import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, MoreHorizontal, Loader2, Trash2, Download, Info } from "lucide-react";
// Import UI components and image preview modal for thumbnails
// Import UI components for table rendering
import { Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Input, Select } from "../../../ui";
import RightPanel from "../common/right-panel";
// Import ledger API services for listing and deleting entries
import { listUserLedgers, deleteLedgerEntry } from "../../../../api/apiFunction/ledgerServices";

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

  // Load entries on mount and whenever the user changes
  useEffect(() => {
    fetchLedgers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Derive unique statuses for filtering (processing_status if present)
  const statusOptions = useMemo(() => {
    const set = new Set(entries.map((e) => (e?.processing_status || "")).filter(Boolean));
    return ["All Status", ...Array.from(set).sort()];
  }, [entries]);

  // Filter entries based on search and selected status
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
      list = list.filter((e) => String(e?.processing_status || "").toLowerCase() === String(statusFilter).toLowerCase());
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
              <Input type="text" placeholder="Search ledgers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
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
            <Button variant="secondary" size="icon">
              <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
            </Button>

            {/* Download Ledger CSV using current filtered rows */}
            <Button variant="primary" className="whitespace-nowrap" onClick={() => {
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
              <TableHead className="whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                {/* Adjusted colSpan to match 11 visible columns */}
                <TableCell className="text-center" colSpan={11}>
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-fg-60" />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {filtered.map((e, index) => (
              <TableRow key={e?._id || e?.id || index} isLast={index === filtered.length - 1}>
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
                  <div className="flex items-center">
                    <Button variant="secondary" size="icon" onClick={() => showDeleteConfirmation(e?._id || e?.id)} aria-label="Delete ledger entry">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && !loading && (
              <TableRow>
                {/* Adjusted colSpan to 11 to match headers */}
                <TableCell className="text-center" colSpan={11}>
                  <span className="text-sm text-fg-60">No ledger entries match your filters.</span>
                </TableCell>
              </TableRow>
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
        {deleteModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Ledger Entry</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this ledger entry? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
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
              </div>
            </div>
          </div>
        )}

        {/* Image preview modal removed for ledger */}
      </div>
    </div>
  );
};

export default Ledger;