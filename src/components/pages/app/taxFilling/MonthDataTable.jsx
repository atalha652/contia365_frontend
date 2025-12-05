import React, { useEffect, useMemo, useState } from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Badge,
    Button,
} from "../../../ui";
import { Info, Loader2, Trash2 } from "lucide-react";
import { listUserLedgers } from "../../../../api/apiFunction/ledgerServices";
import RightPanel from "../common/right-panel";

const MonthDataTable = ({ month, semester, year }) => {
    // Read current user from localStorage for API calls
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    }, []);
    const userId = user?.id || user?._id || user?.user_id || user?.uid;

    // State management
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [entries, setEntries] = useState([]);
    const [panelOpen, setPanelOpen] = useState(false);
    const [panelSection, setPanelSection] = useState(null);
    const [panelEntry, setPanelEntry] = useState(null);

    // Helper function to get month number from month name
    const getMonthNumber = (monthName) => {
        const months = {
            January: 0,
            February: 1,
            March: 2,
            April: 3,
            May: 4,
            June: 5,
            July: 6,
            August: 7,
            September: 8,
            October: 9,
            November: 10,
            December: 11,
        };
        return months[monthName];
    };

    // Format currency
    const formatCurrency = (value) => {
        const num = Number(value || 0);
        return num > 0 ? `$${num.toLocaleString()}` : "-";
    };

    // Format date time
    const formatDateTime = (value) => {
        if (!value) return "";
        const d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        const mon = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
        const day = String(d.getDate()).padStart(2, "0");
        const year = d.getFullYear();
        const time = new Intl.DateTimeFormat("en", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(d);
        return `${mon}, ${day}, ${year} ${time}`;
    };

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

    // Fetch ledger entries from backend
    const fetchLedgers = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            setError("");
            const { entries: items } = await listUserLedgers({ user_id: userId });
            setEntries(Array.isArray(items) ? items : []);
        } catch (err) {
            const message =
                err?.response?.data?.detail ||
                err.message ||
                "Failed to fetch ledger entries";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Load entries on mount and when month/semester/year changes
    useEffect(() => {
        fetchLedgers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, month, semester, year]);

    // Filter entries by selected month and year
    const filteredData = useMemo(() => {
        const monthNum = getMonthNumber(month);
        if (monthNum === undefined) return [];

        return entries.filter((entry) => {
            const createdDate = new Date(entry?.created_at);
            if (isNaN(createdDate.getTime())) return false;
            return createdDate.getMonth() === monthNum && createdDate.getFullYear() === year;
        });
    }, [entries, month, year]);

    // Calculate totals
    const totals = useMemo(() => {
        const sum = filteredData.reduce(
            (acc, e) => {
                const total = Number(
                    e?.invoice_data?.totals?.Total_with_Tax ||
                    e?.invoice_data?.totals?.total ||
                    0
                );
                return { count: acc.count + 1, total: acc.total + (total || 0) };
            },
            { count: 0, total: 0 }
        );
        return sum;
    }, [filteredData]);

    return (
        <div className="space-y-5">
            {/* Enhanced Header with month info and stats */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-bg-50 to-bg-60 rounded-xl border border-bd-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-ac-02 to-blue-600 rounded-lg shadow-md">
                        <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-fg-40">
                            {month} Ledger Entries
                        </h3>
                        <p className="text-xs text-fg-60 mt-0.5 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-ac-02"></span>
                                Quarter {semester}
                            </span>
                            <span>•</span>
                            <span>{filteredData.length} {filteredData.length === 1 ? 'entry' : 'entries'}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 shadow-sm">
                    <div className="text-right">
                        <div className="text-xs text-fg-60 font-medium">Total Amount</div>
                        <div className="text-lg font-bold text-green-600">
                            {formatCurrency(totals.total)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Notice */}
            {error && (
                <div className="mb-3">
                    <Badge variant="warning">{error}</Badge>
                </div>
            )}

            {/* Data Table */}
            <Table>
                <TableHeader>
                    <TableRow isHeader={true}>
                        <TableHead isFirst={true}>Invoice #</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>VAT %</TableHead>
                        <TableHead>VAT Amount</TableHead>
                        <TableHead>Total with Tax</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead isLast={true}>Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        // Skeleton loading rows
                        [...Array(3)].map((_, i) => (
                            <TableRow key={i} isLast={i === 2}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-bg-40 rounded animate-pulse" />
                                        <div className="h-3 w-20 bg-bg-40 rounded animate-pulse" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-bg-40 rounded animate-pulse" />
                                        <div className="h-3 w-32 bg-bg-40 rounded animate-pulse" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-bg-40 rounded animate-pulse" />
                                        <div className="h-3 w-28 bg-bg-40 rounded animate-pulse" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-bg-40 rounded animate-pulse" />
                                        <div className="h-3 w-8 bg-bg-40 rounded animate-pulse" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-3 w-16 bg-bg-40 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-3 w-12 bg-bg-40 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-3 w-16 bg-bg-40 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-3 w-16 bg-bg-40 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-6 w-16 bg-bg-40 rounded animate-pulse" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-3 w-32 bg-bg-40 rounded animate-pulse" />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8">
                                        <span className="text-sm text-fg-60">
                                            No ledger entries for {month}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((e, index) => {
                                    const entryId = e._id || e.id;

                                    return (
                                        <TableRow
                                            key={entryId || index}
                                            isLast={index === filteredData.length - 1}
                                        >
                                            {/* Invoice number with info icon */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        title="Invoice details"
                                                        className="text-fg-60 hover:text-fg-40"
                                                        onClick={() => openPanel("invoice", e)}
                                                    >
                                                        <Info className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm text-fg-60 whitespace-nowrap">
                                                        {e?.invoice_data?.invoice?.invoice_number || "-"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            {/* Supplier name with info icon */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        title="Supplier info"
                                                        className="text-fg-60 hover:text-fg-40"
                                                        onClick={() => openPanel("supplier", e)}
                                                    >
                                                        <Info className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm font-medium text-fg-40 whitespace-nowrap">
                                                        {e?.invoice_data?.supplier?.business_name || "-"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            {/* Customer with info icon */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        title="Customer info"
                                                        className="text-fg-60 hover:text-fg-40"
                                                        onClick={() => openPanel("customer", e)}
                                                    >
                                                        <Info className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm text-fg-60 whitespace-nowrap">
                                                        {e?.invoice_data?.customer?.company_name || "-"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            {/* Items count with info icon */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        title="View items"
                                                        className="text-fg-60 hover:text-fg-40"
                                                        onClick={() => openPanel("items", e)}
                                                    >
                                                        <Info className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm text-fg-60 whitespace-nowrap">
                                                        {Array.isArray(e?.invoice_data?.items)
                                                            ? e.invoice_data.items.length
                                                            : 0}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            {/* Show totals in separate columns */}
                                            <TableCell>
                                                <span className="text-sm text-fg-60 whitespace-nowrap">
                                                    {formatCurrency(e?.invoice_data?.totals?.total)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-fg-60 whitespace-nowrap">
                                                    {typeof e?.invoice_data?.totals?.VAT_rate === "number"
                                                        ? e.invoice_data.totals.VAT_rate.toFixed(2)
                                                        : e?.invoice_data?.totals?.VAT_rate ?? "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-fg-60 whitespace-nowrap">
                                                    {formatCurrency(e?.invoice_data?.totals?.VAT_amount)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-fg-60 whitespace-nowrap">
                                                    {formatCurrency(
                                                        e?.invoice_data?.totals?.Total_with_Tax ??
                                                        e?.invoice_data?.totals?.total
                                                    )}
                                                </span>
                                            </TableCell>
                                            {/* Transaction type (debit/credit) displayed as a badge */}
                                            <TableCell>
                                                {(() => {
                                                    const t = String(
                                                        e?.invoice_data?.transaction_type || "-"
                                                    ).toLowerCase();
                                                    const variant =
                                                        t === "credit"
                                                            ? "success"
                                                            : t === "debit"
                                                                ? "error"
                                                                : "info";
                                                    return (
                                                        <Badge variant={variant}>
                                                            {String(t || "-").toUpperCase()}
                                                        </Badge>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-fg-60 whitespace-nowrap">
                                                    {formatDateTime(e?.created_at)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </>
                    )}
                </TableBody>
            </Table>

            {/* Right-side info panel shows structured data based on selection */}
            {panelOpen && (
                <RightPanel
                    open={panelOpen}
                    onClose={closePanel}
                    title={
                        panelSection === "supplier"
                            ? "Supplier Details"
                            : panelSection === "customer"
                                ? "Customer Details"
                                : panelSection === "invoice"
                                    ? "Invoice Details"
                                    : panelSection === "items"
                                        ? "Items"
                                        : "Details"
                    }
                >
                    {/* Supplier panel content */}
                    {panelSection === "supplier" && (
                        <div className="space-y-2 text-sm text-fg-60">
                            <div>
                                <span className="font-medium text-fg-40">Name:</span>{" "}
                                {panelEntry?.invoice_data?.supplier?.business_name || "-"}
                            </div>
                            <div>
                                <span className="font-medium text-fg-40">Address 1:</span>{" "}
                                {panelEntry?.invoice_data?.supplier?.address_line1 || "-"}
                            </div>
                            <div>
                                <span className="font-medium text-fg-40">Address 2:</span>{" "}
                                {panelEntry?.invoice_data?.supplier?.address_line2 || "-"}
                            </div>
                            <div>
                                <span className="font-medium text-fg-40">Email:</span>{" "}
                                {panelEntry?.invoice_data?.supplier?.Email || "-"}
                            </div>
                        </div>
                    )}

                    {/* Customer panel content */}
                    {panelSection === "customer" && (
                        <div className="space-y-2 text-sm text-fg-60">
                            <div>
                                <span className="font-medium text-fg-40">Company:</span>{" "}
                                {panelEntry?.invoice_data?.customer?.company_name || "-"}
                            </div>
                            <div>
                                <span className="font-medium text-fg-40">Address 1:</span>{" "}
                                {panelEntry?.invoice_data?.customer?.address_line1 || "-"}
                            </div>
                            <div>
                                <span className="font-medium text-fg-40">Address 2:</span>{" "}
                                {panelEntry?.invoice_data?.customer?.address_line2 || "-"}
                            </div>
                            <div>
                                <span className="font-medium text-fg-40">Email:</span>{" "}
                                {panelEntry?.invoice_data?.customer?.Email || "-"}
                            </div>
                        </div>
                    )}

                    {/* Invoice panel content */}
                    {panelSection === "invoice" && (
                        <div className="space-y-2 text-sm text-fg-60">
                            <div>
                                <span className="font-medium text-fg-40">Invoice #:</span>{" "}
                                {panelEntry?.invoice_data?.invoice?.invoice_number || "-"}
                            </div>
                            <div>
                                <span className="font-medium text-fg-40">Invoice Date:</span>{" "}
                                {panelEntry?.invoice_data?.invoice?.invoice_date || "-"}
                            </div>
                            <div>
                                <span className="font-medium text-fg-40">Due Date:</span>{" "}
                                {panelEntry?.invoice_data?.invoice?.due_date || "-"}
                            </div>
                            <div>
                                <span className="font-medium text-fg-40">
                                    Amount in Words:
                                </span>{" "}
                                {panelEntry?.invoice_data?.invoice?.amount_in_words || "-"}
                            </div>
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
                                    {(Array.isArray(panelEntry?.invoice_data?.items)
                                        ? panelEntry.invoice_data.items
                                        : []
                                    ).map((it, idx) => (
                                        <tr key={idx} className="border-t border-bd-50">
                                            <td className="py-1 px-2">{it?.description || "-"}</td>
                                            <td className="py-1 px-2">{it?.qty ?? "-"}</td>
                                            <td className="py-1 px-2">
                                                {typeof it?.unit_price === "number"
                                                    ? it.unit_price.toFixed(2)
                                                    : it?.unit_price ?? "-"}
                                            </td>
                                            <td className="py-1 px-2">
                                                {typeof it?.subtotal === "number"
                                                    ? it.subtotal.toFixed(2)
                                                    : it?.subtotal ?? "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </RightPanel>
            )}
        </div>
    );
};

export default MonthDataTable;
