import React, { useEffect, useMemo, useState } from "react";
import {
    Table, TableHeader, TableBody, TableRow,
    TableHead, TableCell, Badge, Button,
} from "../../../ui";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { listUserLedgers } from "../../../../api/apiFunction/ledgerServices";
import { getModeloIds, getMatchedModelos, getSignals } from "../../../../api/apiFunction/taxEngineServices";
import RightPanel from "../common/right-panel";

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_INDEX = {
    January: 0, February: 1, March: 2, April: 3,
    May: 4, June: 5, July: 6, August: 7,
    September: 8, October: 9, November: 10, December: 11,
};

const MODELO_COLORS = {
    "303": "info",
    "130": "warning",
    "111": "secondary",
    "115": "secondary",
    "unclassified": "default",
};

const fmtCurrency = (v) => {
    const n = Number(v || 0);
    return n > 0 ? n.toLocaleString() : "-";
};

const fmtDateTime = (v) => {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    const mon = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
    const day = String(d.getDate()).padStart(2, "0");
    const yr  = d.getFullYear();
    const time = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: true }).format(d);
    return `${mon}, ${day}, ${yr} ${time}`;
};

// ── Modelo badges — uses modelo_no from matched_modelos for display ───────────
const getModeloDisplayNames = (entry) => {
    const matched = getMatchedModelos(entry);
    if (matched.length) {
        const seen = new Set();
        return matched.reduce((acc, m) => {
            const name = m.modelo_no ?? m.modelo_name ?? m.modelo_number ?? m.name ?? String(m.modelo_id ?? "");
            if (name && !seen.has(name)) { seen.add(name); acc.push(name); }
            return acc;
        }, []);
    }
    return [];
};

const ModeloBadges = ({ entry }) => {
    const names = getModeloDisplayNames(entry);
    if (!names.length) return <Badge variant="default" size="sm">Unclassified</Badge>;
    return (
        <div className="flex flex-wrap gap-1">
            {names.map((name) => (
                <Badge key={name} variant={MODELO_COLORS[String(name)] ?? "secondary"} size="sm">
                    {name}
                </Badge>
            ))}
        </div>
    );
};

// ── Expandable audit section — matched_modelos + signals ──────────────────────
const TaxAuditRow = ({ entry, colSpan }) => {
    const matched = getMatchedModelos(entry);
    const signals = getSignals(entry);

    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="bg-bg-50 px-6 py-4">
                <div className="space-y-4">
                    {/* Matched modelos with explanation */}
                    {matched.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-fg-60 uppercase tracking-wider">
                                Matched Modelos
                            </div>
                            {matched.map((m, i) => {
                                const name = m.modelo_no ?? m.modelo_name ?? m.modelo_number ?? m.name ?? String(m.modelo_id ?? "");
                                return (
                                    <div key={i} className="flex items-start gap-3 px-3 py-2 bg-bg-60 rounded-lg border border-bd-50">
                                        <Badge variant={MODELO_COLORS[String(name)] ?? "secondary"} size="sm">
                                            {name}
                                        </Badge>
                                        <span className="text-xs text-fg-60 flex-1">{m.explanation ?? "-"}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Signals */}
                    {signals.length > 0 && (
                        <div className="space-y-1.5">
                            <div className="text-xs font-semibold text-fg-60 uppercase tracking-wider">
                                Classification Signals
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {signals.map((s, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-ac-02/10 border border-ac-02/20 rounded-md text-xs text-fg-40">
                                        <span className="w-1 h-1 rounded-full bg-ac-02 shrink-0" />
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {matched.length === 0 && signals.length === 0 && (
                        <span className="text-xs text-fg-60">No classification data available for this entry.</span>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
};

// ── Single data row ───────────────────────────────────────────────────────────
const LedgerRow = ({ entry, index, isLast, onOpenPanel }) => {
    const [expanded, setExpanded] = useState(false);
    const entryId = entry._id || entry.id;
    const COL_COUNT = 10;

    return (
        <>
            <TableRow key={entryId || index} isLast={isLast && !expanded}>
                {/* Invoice # */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <button className="text-fg-60 hover:text-fg-40" onClick={() => onOpenPanel("invoice", entry)}>
                            <Info className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-fg-60 whitespace-nowrap">
                            {entry?.invoice_data?.invoice?.invoice_number || "-"}
                        </span>
                    </div>
                </TableCell>

                {/* Supplier */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <button className="text-fg-60 hover:text-fg-40" onClick={() => onOpenPanel("supplier", entry)}>
                            <Info className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium text-fg-40 whitespace-nowrap">
                            {entry?.invoice_data?.supplier?.business_name || "-"}
                        </span>
                    </div>
                </TableCell>

                {/* Customer */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <button className="text-fg-60 hover:text-fg-40" onClick={() => onOpenPanel("customer", entry)}>
                            <Info className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-fg-60 whitespace-nowrap">
                            {entry?.invoice_data?.customer?.company_name || "-"}
                        </span>
                    </div>
                </TableCell>

                {/* Items */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <button className="text-fg-60 hover:text-fg-40" onClick={() => onOpenPanel("items", entry)}>
                            <Info className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-fg-60">
                            {Array.isArray(entry?.invoice_data?.items) ? entry.invoice_data.items.length : 0}
                        </span>
                    </div>
                </TableCell>

                {/* Total */}
                <TableCell>
                    <span className="text-sm text-fg-60 whitespace-nowrap">
                        {fmtCurrency(entry?.invoice_data?.totals?.total)}
                    </span>
                </TableCell>

                {/* VAT % */}
                <TableCell>
                    <span className="text-sm text-fg-60 whitespace-nowrap">
                        {typeof entry?.invoice_data?.totals?.VAT_rate === "number"
                            ? entry.invoice_data.totals.VAT_rate.toFixed(2)
                            : entry?.invoice_data?.totals?.VAT_rate ?? "-"}
                    </span>
                </TableCell>

                {/* VAT Amount */}
                <TableCell>
                    <span className="text-sm text-fg-60 whitespace-nowrap">
                        {fmtCurrency(entry?.invoice_data?.totals?.VAT_amount)}
                    </span>
                </TableCell>

                {/* Total with Tax */}
                <TableCell>
                    <span className="text-sm text-fg-60 whitespace-nowrap">
                        {fmtCurrency(
                            entry?.invoice_data?.totals?.Total_with_Tax ??
                            entry?.invoice_data?.totals?.total
                        )}
                    </span>
                </TableCell>

                {/* Modelo badges — sourced from tax_classification.modelo_ids only */}
                <TableCell>
                    <ModeloBadges entry={entry} />
                </TableCell>

                {/* Created + audit toggle */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-fg-60 whitespace-nowrap">
                            {fmtDateTime(entry?.created_at)}
                        </span>
                        <button
                            onClick={() => setExpanded((p) => !p)}
                            className="p-1 rounded text-fg-60 hover:text-fg-40 hover:bg-bg-50 transition-colors"
                            title="Toggle tax classification details"
                        >
                            {expanded
                                ? <ChevronUp className="w-3.5 h-3.5" />
                                : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </TableCell>
            </TableRow>

            {/* Expandable audit row */}
            {expanded && <TaxAuditRow entry={entry} colSpan={COL_COUNT} />}
        </>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const MonthDataTable = ({ month, semester, year }) => {
    const user = useMemo(() => {
        try { return JSON.parse(localStorage.getItem("user") || "{}"); }
        catch { return {}; }
    }, []);
    const userId = user?.id || user?._id || user?.user_id || user?.uid;

    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState("");
    const [entries, setEntries]     = useState([]);
    const [panelOpen, setPanelOpen] = useState(false);
    const [panelSection, setPanelSection] = useState(null);
    const [panelEntry, setPanelEntry]     = useState(null);

    const openPanel  = (section, entry) => { setPanelSection(section); setPanelEntry(entry); setPanelOpen(true); };
    const closePanel = () => { setPanelOpen(false); setPanelSection(null); setPanelEntry(null); };

    const fetchLedgers = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            setError("");
            const { entries: items } = await listUserLedgers({ user_id: userId });
            setEntries(Array.isArray(items) ? items : []);
        } catch (err) {
            setError(err?.response?.data?.detail || err.message || "Failed to fetch ledger entries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLedgers(); }, [userId, month, semester, year]); // eslint-disable-line

    // Filter by month + year — client-side date filter only, no tax logic
    const filteredData = useMemo(() => {
        const monthNum = MONTH_INDEX[month];
        if (monthNum === undefined) return [];
        return entries.filter((e) => {
            const d = new Date(e?.created_at);
            return !isNaN(d.getTime()) && d.getMonth() === monthNum && d.getFullYear() === year;
        });
    }, [entries, month, year]);

    // Total derived from invoice_data — display only, no tax computation
    const totalAmount = useMemo(() =>
        filteredData.reduce((sum, e) => {
            const v = Number(
                e?.invoice_data?.totals?.Total_with_Tax ??
                e?.invoice_data?.totals?.total ?? 0
            );
            return sum + (isNaN(v) ? 0 : v);
        }, 0),
    [filteredData]);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-bg-50 to-bg-60 rounded-xl border border-bd-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-ac-02 to-blue-600 rounded-lg shadow-md">
                        <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-fg-40">{month} Ledger Entries</h3>
                        <p className="text-xs text-fg-60 mt-0.5 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-ac-02" />
                                Quarter {semester}
                            </span>
                            <span>•</span>
                            <span>{filteredData.length} {filteredData.length === 1 ? "entry" : "entries"}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 shadow-sm">
                    <div className="text-right">
                        <div className="text-xs text-fg-60 font-medium">Total Amount</div>
                        <div className="text-lg font-bold text-green-600">{totalAmount.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {error && <Badge variant="warning">{error}</Badge>}

            {/* Table */}
            <Table>
                <TableHeader>
                    <TableRow isHeader>
                        <TableHead isFirst>Invoice #</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>VAT %</TableHead>
                        <TableHead>VAT Amount</TableHead>
                        <TableHead>Total with Tax</TableHead>
                        <TableHead>Modelos</TableHead>
                        <TableHead isLast>Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <TableRow key={i} isLast={i === 2}>
                                {[...Array(10)].map((__, j) => (
                                    <TableCell key={j}>
                                        <div className="h-3 w-full bg-bg-40 rounded animate-pulse" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : filteredData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center py-8">
                                <span className="text-sm text-fg-60">No ledger entries for {month}</span>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredData.map((entry, index) => (
                            <LedgerRow
                                key={entry._id || entry.id || index}
                                entry={entry}
                                index={index}
                                isLast={index === filteredData.length - 1}
                                onOpenPanel={openPanel}
                            />
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Right panel */}
            {panelOpen && (
                <RightPanel
                    open={panelOpen}
                    onClose={closePanel}
                    title={
                        panelSection === "supplier" ? "Supplier Details"
                        : panelSection === "customer" ? "Customer Details"
                        : panelSection === "invoice"  ? "Invoice Details"
                        : panelSection === "items"    ? "Items"
                        : "Details"
                    }
                >
                    {panelSection === "supplier" && (
                        <div className="space-y-2 text-sm text-fg-60">
                            <div><span className="font-medium text-fg-40">Name:</span> {panelEntry?.invoice_data?.supplier?.business_name || "-"}</div>
                            <div><span className="font-medium text-fg-40">Address 1:</span> {panelEntry?.invoice_data?.supplier?.address_line1 || "-"}</div>
                            <div><span className="font-medium text-fg-40">Address 2:</span> {panelEntry?.invoice_data?.supplier?.address_line2 || "-"}</div>
                            <div><span className="font-medium text-fg-40">Email:</span> {panelEntry?.invoice_data?.supplier?.Email || "-"}</div>
                        </div>
                    )}
                    {panelSection === "customer" && (
                        <div className="space-y-2 text-sm text-fg-60">
                            <div><span className="font-medium text-fg-40">Company:</span> {panelEntry?.invoice_data?.customer?.company_name || "-"}</div>
                            <div><span className="font-medium text-fg-40">Address 1:</span> {panelEntry?.invoice_data?.customer?.address_line1 || "-"}</div>
                            <div><span className="font-medium text-fg-40">Address 2:</span> {panelEntry?.invoice_data?.customer?.address_line2 || "-"}</div>
                            <div><span className="font-medium text-fg-40">Email:</span> {panelEntry?.invoice_data?.customer?.Email || "-"}</div>
                        </div>
                    )}
                    {panelSection === "invoice" && (
                        <div className="space-y-2 text-sm text-fg-60">
                            <div><span className="font-medium text-fg-40">Invoice #:</span> {panelEntry?.invoice_data?.invoice?.invoice_number || "-"}</div>
                            <div><span className="font-medium text-fg-40">Invoice Date:</span> {panelEntry?.invoice_data?.invoice?.invoice_date || "-"}</div>
                            <div><span className="font-medium text-fg-40">Due Date:</span> {panelEntry?.invoice_data?.invoice?.due_date || "-"}</div>
                            <div><span className="font-medium text-fg-40">Amount in Words:</span> {panelEntry?.invoice_data?.invoice?.amount_in_words || "-"}</div>
                        </div>
                    )}
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
                                            <td className="py-1 px-2">{typeof it?.unit_price === "number" ? it.unit_price.toFixed(2) : it?.unit_price ?? "-"}</td>
                                            <td className="py-1 px-2">{typeof it?.subtotal === "number" ? it.subtotal.toFixed(2) : it?.subtotal ?? "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tax classification audit section in right panel */}
                    <div className="mt-6 pt-4 border-t border-bd-50 space-y-3">
                        <div className="text-xs font-semibold text-fg-60 uppercase tracking-wider">Tax Classification</div>
                        <div className="flex flex-wrap gap-1">
                            <ModeloBadges entry={panelEntry} />
                        </div>
                        {getMatchedModelos(panelEntry).map((m, i) => {
                            const name = m.modelo_no ?? m.modelo_name ?? m.modelo_number ?? m.name ?? String(m.modelo_id ?? "");
                            return (
                                <div key={i} className="px-3 py-2 bg-bg-60 rounded-lg border border-bd-50 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={MODELO_COLORS[String(name)] ?? "secondary"} size="sm">{name}</Badge>
                                        <span className="text-xs text-fg-60">{m.explanation ?? "-"}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {getSignals(panelEntry).length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {getSignals(panelEntry).map((s, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-ac-02/10 border border-ac-02/20 rounded text-xs text-fg-40">{s}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </RightPanel>
            )}
        </div>
    );
};

export default MonthDataTable;
