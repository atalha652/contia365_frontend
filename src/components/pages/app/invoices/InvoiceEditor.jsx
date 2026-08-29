import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Loader2, Lock, ArrowLeft, Send, Cpu, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { Button, Badge } from "../../../ui";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../../ui/Modal";
import { getInvoice, updateInvoice, issueInvoice, refreshInvoiceOCR } from "../../../../api/apiFunction/invoiceServices";
import TaxNatureFields from "../tax/TaxNatureFields";

const emptyLine = () => ({ description: "", quantity: 1, unit_price: 0, vat_rate: 21 });

const InvoiceEditor = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [issueModal, setIssueModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [customer, setCustomer] = useState({ name: "", email: "", address: "", tax_id: "" });
  const [lines, setLines] = useState([emptyLine()]);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [invoiceType, setInvoiceType] = useState("income"); // "income" | "expense"
  const [operationType, setOperationType] = useState("general");
  const [withholdingType, setWithholdingType] = useState("none");

  const isDraft = invoice?.status === "draft";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getInvoice({ invoiceId });
        setInvoice(data);
        // Populate form from existing data
        if (data?.customer) setCustomer({ name: data.customer.name || data.customer.company_name || "", email: data.customer.email || "", address: data.customer.address || "", tax_id: data.customer.tax_id || "" });
        if (Array.isArray(data?.lines) && data.lines.length) setLines(data.lines);
        if (data?.notes) setNotes(data.notes);
        if (data?.due_date) setDueDate(data.due_date.split("T")[0]);
        if (data?.invoice_type) setInvoiceType(data.invoice_type);
        if (data?.operation_type) setOperationType(data.operation_type);
        if (data?.withholding_type) setWithholdingType(data.withholding_type);
        // If not draft, redirect to view
        if (data?.status && data.status !== "draft") {
          navigate(`/app/invoices/view/${invoiceId}`, { replace: true });
        }
      } catch (err) {
        toast.error("Failed to load invoice");
        navigate("/app/invoices");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [invoiceId, navigate]);

  // Totals — subtotal pre-VAT, vat sum, irpf sum, total = subtotal + vat - irpf
  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + Number(l.quantity || 0) * Number(l.unit_price || 0), 0);
    const vat = lines.reduce((s, l) => {
      const base = Number(l.quantity || 0) * Number(l.unit_price || 0);
      return s + base * (Number(l.vat_rate || 0) / 100);
    }, 0);
    const irpf = lines.reduce((s, l) => {
      const base = Number(l.quantity || 0) * Number(l.unit_price || 0);
      return s + (l.irpf_amount ?? base * (Number(l.irpf_rate || 0) / 100));
    }, 0);
    return { subtotal, vat, irpf, total: subtotal + vat - irpf };
  }, [lines]);

  const fmt = (n) => `€${Number(n).toLocaleString("es-ES", { minimumFractionDigits: 2 })}`;

  const updateLine = (idx, field, value) => {
    setLines((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  // Build the PATCH payload matching the API schema exactly
  const buildPatchPayload = () => ({
    invoice_type: invoiceType,
    customer: {
      name: customer.name,
      tax_id: customer.tax_id,
      address: customer.address,
      email: customer.email,
    },
    lines: lines.map((l) => ({
      description: l.description,
      quantity: Number(l.quantity) || 1,
      unit_price: Number(l.unit_price) || 0,
      vat_rate: Number(l.vat_rate) || 0,
      irpf_rate: Number(l.irpf_rate) || 0,
    })),
    operation_type: operationType,
    withholding_type: withholdingType,
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateInvoice({ invoiceId, payload: buildPatchPayload() });
      toast.success("Draft saved");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail.map((d) => d.msg).join(", ") : detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Re-pull OCR data for stale drafts — updates customer, lines, totals in place
  const handleRefreshOCR = async () => {
    try {
      setRefreshing(true);
      const updated = await refreshInvoiceOCR({ invoiceId });
      setInvoice(updated);
      if (updated?.customer) setCustomer({ name: updated.customer.name || "", email: updated.customer.email || "", address: updated.customer.address || "", tax_id: updated.customer.tax_id || "" });
      if (Array.isArray(updated?.lines) && updated.lines.length) setLines(updated.lines);
      if (updated?.invoice_type) setInvoiceType(updated.invoice_type);
      if (updated?.operation_type) setOperationType(updated.operation_type);
      if (updated?.withholding_type) setWithholdingType(updated.withholding_type);
      toast.success("OCR data refreshed");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail.map((d) => d.msg).join(", ") : detail || "Failed to refresh OCR");
    } finally {
      setRefreshing(false);
    }
  };

  const handleIssue = async () => {
    try {
      setIssuing(true);
      // PATCH first to persist customer + lines, then issue
      await updateInvoice({ invoiceId, payload: buildPatchPayload() });
      const issued = await issueInvoice({ invoiceId });
      toast.success(`Invoice ${issued?.invoice_number || ""} issued`);
      navigate(`/app/invoices/view/${invoiceId}`);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d) => d.msg).join(", ")
        : detail || "Failed to issue invoice";
      toast.error(msg);
    } finally {
      setIssuing(false);
      setIssueModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-fg-60" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/app/invoices")} className="p-2 rounded-lg text-fg-60 hover:text-fg-50 hover:bg-bg-50 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-fg-40">
                {isDraft ? "Edit Invoice" : "Invoice"}
                {invoice?.invoice_number && <span className="ml-2 text-fg-60">#{invoice.invoice_number}</span>}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={invoice?.status === "draft" ? "warning" : "success"}>
                  {String(invoice?.status || "draft").toUpperCase()}
                </Badge>
                {invoice?.ocr_source && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Cpu className="w-3 h-3" /> OCR
                  </span>
                )}
                {!isDraft && <Lock className="w-3.5 h-3.5 text-fg-60" />}
              </div>
            </div>
          </div>
          {isDraft && (
            <div className="flex items-center gap-2">
              {/* Show Refresh OCR only when OCR data is missing/stale */}
              {!invoice?.ocr_source && invoice?.source !== "manual" && (
                <Button variant="secondary" onClick={handleRefreshOCR} disabled={refreshing} className="flex items-center gap-2">
                  {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {refreshing ? "Refreshing…" : "Refresh OCR"}
                </Button>
              )}
              <Button variant="secondary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Draft"}
              </Button>
              <Button variant="primary" onClick={() => setIssueModal(true)} className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Issue Invoice
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Customer Details */}
          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-fg-40">Customer Details</h2>
              {/* Invoice type toggle — affects income_amount / expense_amount on server */}
              <div className="flex items-center gap-1 bg-bg-40 border border-bd-50 rounded-lg p-1">
                {["income", "expense"].map((t) => (
                  <button
                    key={t}
                    disabled={!isDraft}
                    onClick={() => setInvoiceType(t)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                      invoiceType === t
                        ? "bg-ac-02 text-white"
                        : "text-fg-60 hover:text-fg-50"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Name / Company", field: "name" },
                { label: "Tax ID (NIF/CIF)", field: "tax_id" },
                { label: "Email", field: "email" },
                { label: "Address", field: "address" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs text-fg-60 mb-1">{label}</label>
                  <input
                    disabled={!isDraft}
                    value={customer[field]}
                    onChange={(e) => setCustomer((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-bg-40 border border-bd-50 rounded-lg text-fg-50 placeholder:text-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-xs text-fg-60 mb-1">Due Date</label>
              <input
                type="date"
                disabled={!isDraft}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-3 py-2 text-sm bg-bg-40 border border-bd-50 rounded-lg text-fg-50 focus:outline-none focus:ring-2 focus:ring-ac-02 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-fg-40 mb-1">Tax nature</h2>
            <p className="text-xs text-fg-60 mb-4">
              These fields put the invoice on the right modelo. Changing the line description does not.
            </p>
            <TaxNatureFields
              operationType={operationType}
              withholdingType={withholdingType}
              onOperationType={setOperationType}
              onWithholdingType={setWithholdingType}
              disabled={!isDraft}
            />
          </div>

          {/* Line Items */}
          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-fg-40">Line Items</h2>
              {isDraft && (
                <Button variant="secondary" size="sm" onClick={() => setLines((p) => [...p, emptyLine()])}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Line
                </Button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-fg-60 border-b border-bd-50">
                    <th className="pb-2 pr-4 font-medium">Description</th>
                    <th className="pb-2 pr-4 font-medium w-20">Qty</th>
                    <th className="pb-2 pr-4 font-medium w-28">Unit Price</th>
                    <th className="pb-2 pr-4 font-medium w-20">VAT %</th>
                    <th className="pb-2 pr-4 font-medium w-20">IRPF %</th>
                    <th className="pb-2 pr-4 font-medium w-28 text-right">Total</th>
                    {isDraft && <th className="pb-2 w-10" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd-50">
                  {lines.map((line, idx) => {
                    const base = Number(line.quantity || 0) * Number(line.unit_price || 0);
                    const vatAmt = base * (Number(line.vat_rate || 0) / 100);
                    const irpfAmt = line.irpf_amount ?? base * (Number(line.irpf_rate || 0) / 100);
                    const lineTotal = base + vatAmt - irpfAmt;
                    return (
                      <tr key={idx}>
                        <td className="py-2 pr-4">
                          <input disabled={!isDraft} value={line.description} onChange={(e) => updateLine(idx, "description", e.target.value)}
                            className="w-full px-2 py-1 bg-bg-40 border border-bd-50 rounded text-fg-50 focus:outline-none focus:ring-1 focus:ring-ac-02 disabled:opacity-60" />
                        </td>
                        <td className="py-2 pr-4">
                          <input type="number" min="0" disabled={!isDraft} value={line.quantity} onChange={(e) => updateLine(idx, "quantity", e.target.value)}
                            className="w-full px-2 py-1 bg-bg-40 border border-bd-50 rounded text-fg-50 focus:outline-none focus:ring-1 focus:ring-ac-02 disabled:opacity-60" />
                        </td>
                        <td className="py-2 pr-4">
                          <input type="number" min="0" disabled={!isDraft} value={line.unit_price} onChange={(e) => updateLine(idx, "unit_price", e.target.value)}
                            className="w-full px-2 py-1 bg-bg-40 border border-bd-50 rounded text-fg-50 focus:outline-none focus:ring-1 focus:ring-ac-02 disabled:opacity-60" />
                        </td>
                        <td className="py-2 pr-4">
                          <div className="relative">
                            <input type="number" min="0" max="100" step="1" disabled={!isDraft}
                              value={line.vat_rate}
                              onChange={(e) => updateLine(idx, "vat_rate", Math.min(100, Math.max(0, Number(e.target.value))))}
                              className="w-full pl-2 pr-6 py-1 bg-bg-40 border border-bd-50 rounded text-fg-50 focus:outline-none focus:ring-1 focus:ring-ac-02 disabled:opacity-60" />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-fg-60 pointer-events-none">%</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="relative">
                            <input type="number" min="0" max="100" step="1" disabled={!isDraft}
                              value={line.irpf_rate ?? 0}
                              onChange={(e) => updateLine(idx, "irpf_rate", Math.min(100, Math.max(0, Number(e.target.value))))}
                              className="w-full pl-2 pr-6 py-1 bg-bg-40 border border-bd-50 rounded text-fg-50 focus:outline-none focus:ring-1 focus:ring-ac-02 disabled:opacity-60" />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-fg-60 pointer-events-none">%</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4 text-right">
                          <div className="text-fg-40 font-medium">{fmt(lineTotal)}</div>
                          {vatAmt > 0 && <div className="text-xs text-fg-60">+{fmt(vatAmt)} VAT</div>}
                          {irpfAmt > 0 && <div className="text-xs text-red-400">-{fmt(irpfAmt)} IRPF</div>}
                        </td>
                        {isDraft && (
                          <td className="py-2">
                            <button onClick={() => setLines((p) => p.filter((_, i) => i !== idx))} disabled={lines.length === 1}
                              className="p-1 text-fg-60 hover:text-red-400 disabled:opacity-30 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-bd-50 flex flex-col items-end gap-1 text-sm">
              <div className="flex gap-8 text-fg-60"><span>Subtotal</span><span className="w-28 text-right font-medium text-fg-40">{fmt(totals.subtotal)}</span></div>
              {totals.vat > 0 && <div className="flex gap-8 text-fg-60"><span>VAT</span><span className="w-28 text-right font-medium text-fg-40">+{fmt(totals.vat)}</span></div>}
              {totals.irpf > 0 && <div className="flex gap-8 text-fg-60"><span>IRPF</span><span className="w-28 text-right font-medium text-red-400">-{fmt(totals.irpf)}</span></div>}
              <div className="flex gap-8 text-fg-40 font-semibold text-base mt-1 pt-1 border-t border-bd-50"><span>Total</span><span className="w-28 text-right">{fmt(totals.total)}</span></div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-fg-40 mb-3">Notes</h2>
            <textarea
              disabled={!isDraft}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Payment terms, additional info…"
              className="w-full px-3 py-2 text-sm bg-bg-40 border border-bd-50 rounded-lg text-fg-50 placeholder:text-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Issue Confirmation Modal */}
      <Modal open={issueModal} onClose={() => setIssueModal(false)}>
        <ModalHeader title="Issue Invoice" action={
          <button onClick={() => setIssueModal(false)} className="p-1 text-fg-60 hover:text-fg-50 hover:bg-bg-40 rounded-md transition-colors">✕</button>
        } />
        <ModalBody>
          <p className="text-sm text-fg-60">
            Once issued, this invoice will be <span className="font-semibold text-fg-40">locked and immutable</span>. A legal sequential number will be assigned. Are you sure?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIssueModal(false)} disabled={issuing}>Cancel</Button>
          <Button variant="primary" onClick={handleIssue} disabled={issuing} className="flex items-center gap-2">
            {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {issuing ? "Issuing…" : "Confirm & Issue"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default InvoiceEditor;
