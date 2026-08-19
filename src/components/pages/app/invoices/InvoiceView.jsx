import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Lock, BookOpen, XCircle, Cpu, Loader2,
  Download, Send, ShieldCheck, Eye, EyeOff, CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { Button, Badge } from "../../../ui";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../../ui/Modal";
import {
  getInvoice,
  cancelInvoice,
  getInvoiceQR,
  downloadFacturae,
  submitInvoiceToAEAT,
} from "../../../../api/apiFunction/invoiceServices";

const fmt = (n) => `€${Number(n || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })}`;
const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? String(v) : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_VARIANTS = {
  draft: "warning",
  issued: "success",
  submitted: "info",
  cancelled: "error",
};

const InvoiceView = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState(null);

  // Cancel modal
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Submit modal
  const [submitModal, setSubmitModal] = useState(false);
  const [certPassword, setCertPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await getInvoice({ invoiceId });
      setInvoice(data);
      if (data?.status === "draft") navigate(`/app/invoices/${invoiceId}`, { replace: true });
      // Fetch QR for issued or submitted invoices
      if (data?.status === "issued" || data?.status === "submitted") {
        try {
          const url = await getInvoiceQR({ invoiceId });
          if (url) setQrUrl(url);
        } catch {
          // QR not critical — silently skip
        }
      }
    } catch {
      toast.error("Failed to load invoice");
      navigate("/app/invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoice(); }, [invoiceId]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await cancelInvoice({ invoiceId, reason: cancelReason });
      toast.success("Invoice cancelled");
      setCancelModal(false);
      await loadInvoice();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to cancel invoice");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadFacturae = async () => {
    try {
      const res = await downloadFacturae({ invoiceId });
      const blob = new Blob([res.data], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facturae-${invoice.invoice_number || invoiceId}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download Facturae XML");
    }
  };

  const handleSubmit = async () => {
    if (!certPassword) { toast.error("Certificate password is required"); return; }
    try {
      setSubmitting(true);
      await submitInvoiceToAEAT({ invoiceId, certPassword });
      setSubmitModal(false);
      setCertPassword("");
      // Confetti celebration
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#027570", "#038a84", "#10b981", "#ffffff"] });
      toast.success("Invoice submitted to AEAT successfully");
      await loadInvoice();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Submission failed. Check your certificate and try again.";
      toast.error(typeof msg === "string" ? msg : msg?.[0]?.msg || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const lines = Array.isArray(invoice.lines) ? invoice.lines : [];
  const subtotal = invoice.totals?.subtotal ?? 0;
  const vat = invoice.totals?.total_vat ?? 0;
  const total = invoice.totals?.total_amount ?? 0;
  const isIssued = invoice.status === "issued";
  const isSubmitted = invoice.status === "submitted";

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
              <h1 className="text-xl font-semibold text-fg-40 flex items-center gap-2">
                Invoice
                {invoice.invoice_number && <span className="text-ac-02 font-bold">#{invoice.invoice_number}</span>}
                <Lock className="w-4 h-4 text-fg-60" />
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={STATUS_VARIANTS[invoice.status] || "info"}>
                  {String(invoice.status || "").toUpperCase()}
                </Badge>
                {isSubmitted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                    <ShieldCheck className="w-3 h-3" /> Verified by AEAT
                  </span>
                )}
                {invoice.ocr_source && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Cpu className="w-3 h-3" /> OCR
                  </span>
                )}
                {invoice.ledger_entry_id && (
                  <button onClick={() => navigate("/app/ledger")} className="flex items-center gap-1 text-xs text-ac-02 hover:underline">
                    <BookOpen className="w-3.5 h-3.5" /> View in Ledger
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isIssued && (
              <>
                <Button variant="secondary" onClick={handleDownloadFacturae} className="flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> Facturae XML
                </Button>
                <button
                  onClick={() => setSubmitModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white bg-ac-02 hover:bg-ac-02/90 transition-colors"
                >
                  <Send className="w-4 h-4" /> Submit to AEAT
                </button>
              </>
            )}
            {isIssued && (
              <Button variant="secondary" onClick={() => setCancelModal(true)} className="flex items-center gap-2 text-red-400 border-red-400/30 hover:bg-red-400/10">
                <XCircle className="w-4 h-4" /> Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Meta info */}
          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-fg-60 mb-1">Customer</p>
              <p className="text-sm font-medium text-fg-40">{invoice.customer?.name || invoice.customer?.company_name || "—"}</p>
              {invoice.customer?.tax_id && <p className="text-xs text-fg-60 mt-0.5">NIF/CIF: {invoice.customer.tax_id}</p>}
              {invoice.customer?.email && <p className="text-xs text-fg-60">{invoice.customer.email}</p>}
              {invoice.customer?.address && <p className="text-xs text-fg-60">{invoice.customer.address}</p>}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-fg-60">Issue Date</p>
                <p className="text-sm text-fg-40">{fmtDate(invoice.issued_at || invoice.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-fg-60">Due Date</p>
                <p className="text-sm text-fg-40">{fmtDate(invoice.due_date)}</p>
              </div>
              {invoice.invoice_type && (
                <div>
                  <p className="text-xs text-fg-60">Type</p>
                  <p className="text-sm text-fg-40 capitalize">{invoice.invoice_type}</p>
                </div>
              )}
              {invoice.fingerprint && (
                <div>
                  <p className="text-xs text-fg-60">Fingerprint (SHA-256)</p>
                  <p className="text-xs text-fg-60 font-mono truncate">{invoice.fingerprint}</p>
                </div>
              )}
            </div>
          </div>

          {/* CSV code for submitted invoices */}
          {isSubmitted && invoice.csv_code && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 flex items-start gap-4">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-400 mb-1">Secure Verification Code (CSV)</p>
                <p className="text-base font-mono font-semibold text-fg-40 tracking-widest">{invoice.csv_code}</p>
                <p className="text-xs text-fg-60 mt-1">Issued by AEAT — use this code to verify the invoice at the AEAT portal.</p>
              </div>
            </div>
          )}

          {/* Line Items */}
          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-fg-40 mb-4">Line Items</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-fg-60 border-b border-bd-50">
                  <th className="pb-2 pr-4 font-medium">Description</th>
                  <th className="pb-2 pr-4 font-medium w-16">Qty</th>
                  <th className="pb-2 pr-4 font-medium w-28">Unit Price</th>
                  <th className="pb-2 pr-4 font-medium w-20">VAT %</th>
                  <th className="pb-2 pr-4 font-medium w-20">IRPF %</th>
                  <th className="pb-2 font-medium w-28 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bd-50">
                {lines.map((l, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-4 text-fg-60">{l.description || "—"}</td>
                    <td className="py-2 pr-4 text-fg-60">{l.quantity}</td>
                    <td className="py-2 pr-4 text-fg-60">{fmt(l.unit_price)}</td>
                    <td className="py-2 pr-4 text-fg-60">
                      {Number(l.vat_rate) > 0 ? `${l.vat_rate}%` : "—"}
                      {Number(l.vat_amount) > 0 && <div className="text-xs text-fg-60">{fmt(l.vat_amount)}</div>}
                    </td>
                    <td className="py-2 pr-4 text-fg-60">
                      {Number(l.irpf_rate) > 0 ? `${l.irpf_rate}%` : "—"}
                      {Number(l.irpf_amount) > 0 && <div className="text-xs text-red-400">-{fmt(l.irpf_amount)}</div>}
                    </td>
                    <td className="py-2 text-right font-medium text-fg-40">{fmt(l.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 pt-4 border-t border-bd-50 flex flex-col items-end gap-1 text-sm">
              <div className="flex gap-8 text-fg-60"><span>Subtotal</span><span className="w-28 text-right font-medium text-fg-40">{fmt(subtotal)}</span></div>
              {vat > 0 && <div className="flex gap-8 text-fg-60"><span>VAT ({invoice.totals?.vat_rate ?? ""}%)</span><span className="w-28 text-right font-medium text-fg-40">+{fmt(vat)}</span></div>}
              {Number(invoice.totals?.irpf_rate) > 0 && (
                <div className="flex gap-8 text-fg-60">
                  <span>IRPF ({invoice.totals.irpf_rate}%)</span>
                  <span className="w-28 text-right font-medium text-red-400">-{fmt(invoice.totals.irpf_amount)}</span>
                </div>
              )}
              <div className="flex gap-8 text-fg-40 font-semibold text-base mt-1 pt-1 border-t border-bd-50">
                <span>Total</span><span className="w-28 text-right">{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-fg-40 mb-2">Notes</h2>
              <p className="text-sm text-fg-60 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Compliance block — shown for issued and submitted */}
          {(isIssued || isSubmitted) && (
            <div className="bg-bg-50 border border-bd-50 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-bd-50 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-ac-02" />
                <h2 className="text-sm font-semibold text-fg-40">VeriFactu Compliance</h2>
              </div>
              <div className="p-6 flex items-start gap-8">
                {/* QR code */}
                <div className="flex-shrink-0">
                  {qrUrl ? (
                    <div className="p-3 bg-white rounded-xl border border-bd-50">
                      <QRCodeSVG value={qrUrl} size={120} level="M" />
                    </div>
                  ) : (
                    <div className="w-[146px] h-[146px] bg-bg-40 rounded-xl border border-bd-50 flex items-center justify-center">
                      <span className="text-xs text-fg-60 text-center px-2">QR not available</span>
                    </div>
                  )}
                </div>
                {/* Legal legend + info */}
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-medium text-fg-40 italic">
                    "Factura verificable en la sede electrónica de la AEAT"
                  </p>
                  {qrUrl && (
                    <div>
                      <p className="text-xs text-fg-60 mb-1">Verification URL</p>
                      <a
                        href={qrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-ac-02 hover:underline break-all"
                      >
                        {qrUrl}
                      </a>
                    </div>
                  )}
                  {isSubmitted && (
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">Submitted & verified by AEAT</span>
                    </div>
                  )}
                  {isIssued && (
                    <p className="text-xs text-fg-60">
                      Scan the QR code to verify this invoice on the AEAT electronic office.
                      Submit to AEAT to obtain the CSV verification code.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal open={cancelModal} onClose={() => setCancelModal(false)}>
        <ModalHeader title="Cancel Invoice" action={
          <button onClick={() => setCancelModal(false)} className="p-1 text-fg-60 hover:text-fg-50 hover:bg-bg-40 rounded-md transition-colors">✕</button>
        } />
        <ModalBody>
          <p className="text-sm text-fg-60 mb-4">
            Cancelling invoice <span className="font-semibold text-fg-40">#{invoice.invoice_number}</span> is irreversible. Please provide a reason.
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Reason for cancellation…"
            className="w-full px-3 py-2 text-sm bg-bg-40 border border-bd-50 rounded-lg text-fg-50 placeholder:text-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02 resize-none"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setCancelModal(false)} disabled={cancelling}>Back</Button>
          <button
            onClick={handleCancel}
            disabled={cancelling || !cancelReason.trim()}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            {cancelling ? "Cancelling…" : "Confirm Cancel"}
          </button>
        </ModalFooter>
      </Modal>

      {/* Submit to AEAT Modal */}
      <Modal open={submitModal} onClose={() => !submitting && setSubmitModal(false)}>
        <ModalHeader title="Submit to AEAT" action={
          !submitting && (
            <button onClick={() => setSubmitModal(false)} className="p-1 text-fg-60 hover:text-fg-50 hover:bg-bg-40 rounded-md transition-colors">✕</button>
          )
        } />
        <ModalBody>
          {submitting ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="w-10 h-10 text-ac-02 animate-spin" />
              <p className="text-sm font-medium text-fg-40">Signing and Transmitting to AEAT…</p>
              <p className="text-xs text-fg-60 text-center">
                Generating Facturae XML, signing with XAdES-EPES, and submitting via SOAP + mTLS.
                This may take a few seconds.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-ac-02/5 border border-ac-02/20 rounded-xl">
                <Send className="w-4 h-4 text-ac-02 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-fg-40">Submit Invoice #{invoice.invoice_number}</p>
                  <p className="text-xs text-fg-60 mt-0.5">
                    This will sign the invoice with your .p12 certificate and transmit it to AEAT VeriFactu.
                    The invoice status will change to SUBMITTED and you will receive a CSV code.
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-60 mb-1.5">
                  Certificate Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={certPassword}
                    onChange={(e) => setCertPassword(e.target.value)}
                    placeholder="Enter your .p12 password"
                    className="w-full px-3 py-2.5 pr-10 text-sm bg-bg-40 border border-bd-50 rounded-lg text-fg-50 placeholder:text-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-60 hover:text-fg-50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-fg-60 mt-1">Used in-memory only — never logged or stored.</p>
              </div>
            </div>
          )}
        </ModalBody>
        {!submitting && (
          <ModalFooter>
            <Button variant="secondary" onClick={() => setSubmitModal(false)}>Cancel</Button>
            <button
              onClick={handleSubmit}
              disabled={!certPassword}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-ac-02 hover:bg-ac-02/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" /> Confirm & Submit
            </button>
          </ModalFooter>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceView;
