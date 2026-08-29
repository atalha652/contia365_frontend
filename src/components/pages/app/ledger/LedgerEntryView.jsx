import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, Cpu, Building2, User, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button, Badge } from "../../../ui";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../../ui/Modal";
import { getLedgerEntry, deleteLedgerEntry, overrideLedgerClassification } from "../../../../api/apiFunction/ledgerServices";
import { getMyFiscalProfile } from "../../../../api/apiFunction/onboardingServices";
import TaxNatureFields from "../tax/TaxNatureFields";
import { entryOperationType, entryWithholdingType, matchedModeloNos } from "../../../../utils/taxNature";

const fmt = (n) => `€${Number(n || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })}`;
const fmtRate = (v) => (v == null || v === "" ? "—" : `${Number(v).toFixed(2)}%`);
const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? String(v) : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const TYPE_VARIANTS = {
  credit: "success",
  debit: "error",
};

const LedgerEntryView = () => {
  const { ledgerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [entry, setEntry] = useState(location.state?.entry || null);
  const [loading, setLoading] = useState(!location.state?.entry);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [operationType, setOperationType] = useState(() => entryOperationType(location.state?.entry));
  const [withholdingType, setWithholdingType] = useState(() => entryWithholdingType(location.state?.entry));
  const [selectedModelos, setSelectedModelos] = useState(() => matchedModeloNos(location.state?.entry));
  const [applicableModelos, setApplicableModelos] = useState([]);
  const [savingTax, setSavingTax] = useState(false);

  const userId = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.id || user?._id || user?.user_id || user?.uid;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getLedgerEntry({ ledger_id: ledgerId, user_id: userId });
        if (active) {
          setEntry(data);
          setOperationType(entryOperationType(data));
          setWithholdingType(entryWithholdingType(data));
          setSelectedModelos(matchedModeloNos(data));
        }
      } catch {
        if (!active) return;
        toast.error("Failed to load ledger entry");
        navigate("/app/ledger");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    getMyFiscalProfile()
      .then((profile) => {
        const nos = (profile?.periodic_tax_obligations || [])
          .map((item) => String(item?.modelo || ""))
          .filter(Boolean);
        if (active) setApplicableModelos(Array.from(new Set(nos)));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [ledgerId, userId, navigate]);

  const applyClassification = (result) => {
    setEntry((prev) => ({
      ...prev,
      invoice_data: {
        ...(prev?.invoice_data || {}),
        operation_type: result?.signals?.operation_type || operationType,
        withholding_type: result?.signals?.withholding_type || withholdingType,
      },
      tax_classification: {
        ...(prev?.tax_classification || {}),
        matched_modelos: result?.matched_modelos || [],
        modelo_ids: result?.modelo_ids || [],
        signals: result?.signals,
        user_override: result?.user_override,
      },
    }));
    setSelectedModelos((result?.matched_modelos || []).map((item) => String(item.modelo_no)));
  };

  const saveTaxNature = async () => {
    try {
      setSavingTax(true);
      const result = await overrideLedgerClassification({
        ledger_id: ledgerId,
        operation_type: operationType,
        withholding_type: withholdingType,
      });
      applyClassification(result);
      toast.success("Tax type saved — modelos updated from amounts, not the description");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to save tax type");
    } finally {
      setSavingTax(false);
    }
  };

  const saveModeloOverride = async (next) => {
    try {
      setSavingTax(true);
      setSelectedModelos(next);
      const result = await overrideLedgerClassification({
        ledger_id: ledgerId,
        modelo_nos: next,
      });
      applyClassification(result);
      toast.success("Assigned modelos updated");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to override modelos");
    } finally {
      setSavingTax(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteLedgerEntry({ ledger_id: ledgerId });
      toast.success("Ledger entry deleted");
      navigate("/app/ledger");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to delete ledger entry");
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !entry) {
    return (
      <div className="flex-1 bg-bg-70">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-bg-40 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-48 bg-bg-40 rounded animate-pulse" />
              <div className="h-4 w-24 bg-bg-40 rounded animate-pulse" />
            </div>
          </div>
          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6 grid grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-bg-40 rounded animate-pulse" />
                <div className="h-4 w-40 bg-bg-40 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-bg-40 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!entry) return null;

  const data = entry.invoice_data || {};
  const supplier = data.supplier || {};
  const customer = data.customer || {};
  const invoice = data.invoice || {};
  const totals = data.totals || {};
  const items = Array.isArray(data.items) ? data.items : [];
  const type = String(data.transaction_type || "").toLowerCase();
  const total = totals.Total_with_Tax ?? totals.total ?? 0;

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app/ledger")}
              className="p-2 rounded-lg text-fg-60 hover:text-fg-50 hover:bg-bg-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-fg-40 flex items-center gap-2">
                Ledger Entry
                {invoice.invoice_number && <span className="text-ac-02 font-bold">#{invoice.invoice_number}</span>}
                <BookOpen className="w-4 h-4 text-fg-60" />
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {type && <Badge variant={TYPE_VARIANTS[type] || "info"}>{type.toUpperCase()}</Badge>}
                {entry.period && <Badge variant="info">{entry.period}</Badge>}
                {matchedModeloNos(entry).map((no) => (
                  <span key={no} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Cpu className="w-3 h-3" /> {no}
                  </span>
                ))}
                {entry.tax_classification?.user_override && (
                  <Badge variant="warning">Override</Badge>
                )}
                {!matchedModeloNos(entry).length && (
                  <span className="text-xs text-amber-500">Unclassified</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal(true)}
              className="flex items-center gap-2 text-red-400 border-red-400/30 hover:bg-red-400/10"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Parties */}
          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-fg-60 mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Supplier
              </p>
              <p className="text-sm font-medium text-fg-40">{supplier.business_name || "—"}</p>
              {supplier.address_line1 && <p className="text-xs text-fg-60 mt-0.5">{supplier.address_line1}</p>}
              {supplier.address_line2 && <p className="text-xs text-fg-60">{supplier.address_line2}</p>}
              {supplier.Email && <p className="text-xs text-fg-60">{supplier.Email}</p>}
            </div>
            <div>
              <p className="text-xs text-fg-60 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Customer
              </p>
              <p className="text-sm font-medium text-fg-40">{customer.company_name || "—"}</p>
              {customer.address_line1 && <p className="text-xs text-fg-60 mt-0.5">{customer.address_line1}</p>}
              {customer.address_line2 && <p className="text-xs text-fg-60">{customer.address_line2}</p>}
              {customer.Email && <p className="text-xs text-fg-60">{customer.Email}</p>}
            </div>
          </div>

          {/* Invoice meta */}
          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6 grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-fg-60">Invoice Date</p>
              <p className="text-sm text-fg-40">{fmtDate(invoice.invoice_date)}</p>
            </div>
            <div>
              <p className="text-xs text-fg-60">Due Date</p>
              <p className="text-sm text-fg-40">{fmtDate(invoice.due_date)}</p>
            </div>
            <div>
              <p className="text-xs text-fg-60">Recorded</p>
              <p className="text-sm text-fg-40">{fmtDate(entry.created_at)}</p>
            </div>
            {invoice.amount_in_words && (
              <div className="col-span-3">
                <p className="text-xs text-fg-60">Amount in Words</p>
                <p className="text-sm text-fg-40">{invoice.amount_in_words}</p>
              </div>
            )}
          </div>

          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-fg-40">Tax nature</h2>
              <p className="text-xs text-fg-60 mt-1">
                Description is commercial text only. These fields decide which modelo the invoice lands on.
              </p>
            </div>
            <TaxNatureFields
              operationType={operationType}
              withholdingType={withholdingType}
              onOperationType={setOperationType}
              onWithholdingType={setWithholdingType}
            />
            <Button variant="secondary" onClick={saveTaxNature} disabled={savingTax}>
              {savingTax ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save tax type"}
            </Button>
            {applicableModelos.length > 0 && (
              <div>
                <p className="text-xs text-fg-60 mb-2">Assigned modelos (override if auto is wrong)</p>
                <div className="flex flex-wrap gap-2">
                  {applicableModelos.map((no) => {
                    const checked = selectedModelos.includes(no);
                    return (
                      <button
                        key={no}
                        type="button"
                        disabled={savingTax}
                        onClick={() => {
                          const next = checked
                            ? selectedModelos.filter((item) => item !== no)
                            : [...selectedModelos, no];
                          saveModeloOverride(next);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                          checked
                            ? "bg-ac-02 text-white border-ac-02"
                            : "bg-bg-40 text-fg-60 border-bd-50"
                        }`}
                      >
                        {no}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-fg-40 mb-4">Line Items</h2>
            {items.length === 0 ? (
              <p className="text-sm text-fg-60">No items were extracted for this entry.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-fg-60 border-b border-bd-50">
                    <th className="pb-2 pr-4 font-medium">Description</th>
                    <th className="pb-2 pr-4 font-medium w-16">Qty</th>
                    <th className="pb-2 pr-4 font-medium w-28">Unit Price</th>
                    <th className="pb-2 font-medium w-28 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd-50">
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-4 text-fg-60">{it?.description || "—"}</td>
                      <td className="py-2 pr-4 text-fg-60">{it?.qty ?? "—"}</td>
                      <td className="py-2 pr-4 text-fg-60">{fmt(it?.unit_price)}</td>
                      <td className="py-2 text-right font-medium text-fg-40">{fmt(it?.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="mt-4 pt-4 border-t border-bd-50 flex flex-col items-end gap-1 text-sm">
              <div className="flex gap-8 text-fg-60">
                <span>Base</span>
                <span className="w-28 text-right font-medium text-fg-40">{fmt(totals.base)}</span>
              </div>
              <div className="flex gap-8 text-fg-60">
                <span>Total</span>
                <span className="w-28 text-right font-medium text-fg-40">{fmt(totals.total)}</span>
              </div>
              <div className="flex gap-8 text-fg-60">
                <span>VAT ({fmtRate(totals.VAT_rate)})</span>
                <span className="w-28 text-right font-medium text-fg-40">+{fmt(totals.VAT_amount)}</span>
              </div>
              {Number(totals.IRPF_amount) > 0 && (
                <div className="flex gap-8 text-fg-60">
                  <span>IRPF ({fmtRate(totals.IRPF_rate)})</span>
                  <span className="w-28 text-right font-medium text-red-400">-{fmt(totals.IRPF_amount)}</span>
                </div>
              )}
              <div className="flex gap-8 text-fg-40 font-semibold text-base mt-1 pt-1 border-t border-bd-50">
                <span>Total with Tax</span>
                <span className="w-28 text-right">{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal open={deleteModal} onClose={() => !deleting && setDeleteModal(false)}>
        <ModalHeader
          title="Delete Ledger Entry"
          action={
            !deleting && (
              <button
                onClick={() => setDeleteModal(false)}
                className="p-1 text-fg-60 hover:text-fg-50 hover:bg-bg-40 rounded-md transition-colors"
              >
                ✕
              </button>
            )
          }
        />
        <ModalBody>
          <p className="text-sm text-fg-60">
            Are you sure you want to delete this ledger entry? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteModal(false)} disabled={deleting}>
            Cancel
          </Button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default LedgerEntryView;
