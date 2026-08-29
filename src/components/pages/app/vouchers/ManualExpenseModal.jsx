import React, { useMemo, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Select } from "../../../ui";
import { X, Plus, Trash2 } from "lucide-react";
import { createManualVoucher } from "../../../../api/apiFunction/voucherServices";
import TaxNatureFields from "../tax/TaxNatureFields";
import { getAvailablePeriods } from "../../../../utils/helperFunction";
import { toast } from "react-toastify";

const emptyItem = () => ({ description: "", qty: 1, unit_price: "", vat_percent: "", irpf_percent: "" });

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// Totals are derived from the line items so the payload stays consistent
const computeTotals = (items) =>
  items.reduce(
    (acc, item) => {
      const lineBase = (Number(item.qty) || 0) * (Number(item.unit_price) || 0);
      acc.base = round2(acc.base + lineBase);
      acc.VAT_amount = round2(acc.VAT_amount + (lineBase * (Number(item.vat_percent) || 0)) / 100);
      acc.IRPF_amount = round2(acc.IRPF_amount + (lineBase * (Number(item.irpf_percent) || 0)) / 100);
      acc.Total_with_Tax = round2(acc.base + acc.VAT_amount - acc.IRPF_amount);
      return acc;
    },
    { base: 0, VAT_amount: 0, IRPF_amount: 0, Total_with_Tax: 0 }
  );

const fmt = (n) => `€${Number(n || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })}`;

const ManualExpenseModal = ({ open, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Expense");
  const [transactionType, setTransactionType] = useState("debit");
  const [period, setPeriod] = useState(() => getAvailablePeriods().at(-1)?.value ?? "");
  const [supplierName, setSupplierName] = useState("");
  const [supplierNif, setSupplierNif] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerNif, setCustomerNif] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [operationType, setOperationType] = useState("general");
  const [withholdingType, setWithholdingType] = useState("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(() => computeTotals(items), [items]);

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItemAt = (index) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("Expense");
    setTransactionType("debit");
    setPeriod(getAvailablePeriods().at(-1)?.value ?? "");
    setSupplierName("");
    setSupplierNif("");
    setSupplierAddress("");
    setSupplierEmail("");
    setCustomerName("");
    setCustomerNif("");
    setInvoiceNumber("");
    setInvoiceDate("");
    setItems([emptyItem()]);
    setOperationType("general");
    setWithholdingType("none");
    setError("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose && onClose();
  };

  const hasValidItem = items.some((item) => item.description.trim() && Number(item.unit_price) > 0);
  const canSubmit = Boolean(title && category && period && hasValidItem);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const user_id = user?.user_id || user?.id || user?._id || user?.uid;
      if (!user_id) throw new Error("User not found. Please sign in again.");

      const payloadItems = items
        .filter((item) => item.description.trim() || Number(item.unit_price) > 0)
        .map((item) => ({
          description: item.description.trim(),
          qty: Number(item.qty) || 0,
          unit_price: Number(item.unit_price) || 0,
          vat_percent: Number(item.vat_percent) || 0,
          irpf_percent: Number(item.irpf_percent) || 0,
        }));

      const data = await createManualVoucher({
        user_id,
        title,
        description,
        category,
        period,
        transaction_type: transactionType || undefined,
        supplier: supplierName || supplierNif || supplierAddress || supplierEmail
          ? {
              name: supplierName,
              business_name: supplierName,
              nif: supplierNif,
              nif_nie: supplierNif,
              tax_id: supplierNif,
              address: supplierAddress,
              address_line1: supplierAddress,
              email: supplierEmail,
              Email: supplierEmail,
            }
          : undefined,
        customer: customerName || customerNif
          ? {
              name: customerName,
              company_name: customerName,
              nif: customerNif,
              nif_nie: customerNif,
              tax_id: customerNif,
            }
          : undefined,
        invoice_number: invoiceNumber || undefined,
        invoice_date: invoiceDate || undefined,
        items: payloadItems,
        totals,
        operation_type: operationType,
        withholding_type: withholdingType,
      });

      toast.success(data?.invoice_id ? "Expense added. Draft invoice created." : "Expense added");
      onCreated && onCreated(data);
      handleClose();
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      const message = status === 403
        ? "This tax period is closed. Deadlines are the 10th of the following month."
        : Array.isArray(detail)
          ? detail[0]?.msg || "Validation failed"
          : detail || err.message || "Failed to add expense";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} size="lg">
      <ModalHeader
        title="Add Expense"
        action={
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isSubmitting}>
            <X className="w-4 h-4" />
          </Button>
        }
      />
      <ModalBody>
        <div className="space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
          <p className="text-xs text-fg-60">
            Enter the expense by hand. It is approved on save. No file, OCR, or approval request.
          </p>

          <div>
            <label className="block text-sm text-fg-60 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g., Office rent — August"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-fg-60 mb-1">Category</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {["Expense", "Bill", "Invoice", "Receipt", "Other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm text-fg-60 mb-1">Transaction Type</label>
              <Select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                <option value="">Select type</option>
                <option value="debit">debit</option>
                <option value="credit">credit</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-fg-60 mb-1">
                Tax Period <span className="text-red-500">*</span>
              </label>
              <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                {getAvailablePeriods().map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-fg-60 mb-1">Invoice Number</label>
              <Input
                type="text"
                placeholder="e.g., A-2026-014"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-fg-60 mb-1">Invoice Date</label>
              <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
          </div>

          {/* Supplier */}
          <div className="border-t border-bd-50 pt-4">
            <h3 className="text-sm font-semibold text-fg-40 mb-3">Supplier</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-fg-60 mb-1">Name</label>
                <Input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-fg-60 mb-1">NIF / CIF</label>
                <Input type="text" value={supplierNif} onChange={(e) => setSupplierNif(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-fg-60 mb-1">Address</label>
                <Input type="text" value={supplierAddress} onChange={(e) => setSupplierAddress(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-fg-60 mb-1">Email</label>
                <Input type="email" value={supplierEmail} onChange={(e) => setSupplierEmail(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="border-t border-bd-50 pt-4">
            <h3 className="text-sm font-semibold text-fg-40 mb-3">Customer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-fg-60 mb-1">Name</label>
                <Input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-fg-60 mb-1">NIF / CIF</label>
                <Input type="text" value={customerNif} onChange={(e) => setCustomerNif(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="border-t border-bd-50 pt-4">
            <h3 className="text-sm font-semibold text-fg-40 mb-1">Tax nature</h3>
            <p className="text-xs text-fg-60 mb-3">
              Choose the form this expense belongs on. The line description is not used.
            </p>
            <TaxNatureFields
              operationType={operationType}
              withholdingType={withholdingType}
              onOperationType={setOperationType}
              onWithholdingType={setWithholdingType}
            />
          </div>

          {/* Items */}
          <div className="border-t border-bd-50 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-fg-40">
                Line Items <span className="text-red-500">*</span>
              </h3>
              <Button variant="secondary" size="sm" onClick={addItem} className="flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add line
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-xs text-fg-60 mb-1">Description</label>
                    <Input
                      type="text"
                      placeholder="What was purchased"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 md:col-span-1">
                    <label className="block text-xs text-fg-60 mb-1">Qty</label>
                    <Input
                      type="number"
                      min="0"
                      value={item.qty}
                      onChange={(e) => updateItem(index, "qty", e.target.value)}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-xs text-fg-60 mb-1">Unit Price</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-2">
                    <label className="block text-xs text-fg-60 mb-1">VAT %</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.vat_percent}
                      onChange={(e) => updateItem(index, "vat_percent", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-2">
                    <label className="block text-xs text-fg-60 mb-1">IRPF %</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.irpf_percent}
                      onChange={(e) => updateItem(index, "irpf_percent", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItemAt(index)}
                      disabled={items.length === 1}
                      aria-label="Remove line"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Derived totals sent with the payload */}
            <div className="mt-4 pt-4 border-t border-bd-50 flex flex-col items-end gap-1 text-sm">
              <div className="flex gap-8 text-fg-60">
                <span>Base</span>
                <span className="w-28 text-right font-medium text-fg-40">{fmt(totals.base)}</span>
              </div>
              <div className="flex gap-8 text-fg-60">
                <span>VAT</span>
                <span className="w-28 text-right font-medium text-fg-40">+{fmt(totals.VAT_amount)}</span>
              </div>
              {totals.IRPF_amount > 0 && (
                <div className="flex gap-8 text-fg-60">
                  <span>IRPF</span>
                  <span className="w-28 text-right font-medium text-red-400">-{fmt(totals.IRPF_amount)}</span>
                </div>
              )}
              <div className="flex gap-8 text-fg-40 font-semibold text-base mt-1 pt-1 border-t border-bd-50">
                <span>Total</span>
                <span className="w-28 text-right">{fmt(totals.Total_with_Tax)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-fg-60 mb-1">Description</label>
            <Input
              type="text"
              placeholder="Add a short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={isSubmitting || !canSubmit}>
          {isSubmitting ? "Saving..." : "Add Expense"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ManualExpenseModal;
