import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";
import { Button, Badge } from "../../../ui";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../../ui/Modal";
import {
  approveTaxFiling,
  calculateTaxFiling,
  downloadTaxFilingJustificante,
  getFilingCalculation,
  getFilingId,
  getFilingStatus,
  getTaxFiling,
  canLiveSubmitFiling,
  filingNeedsPercipients,
  formatTaxFilingError,
  recordTaxFilingResult,
  reviewTaxFiling,
  submitTaxFiling,
} from "../../../../api/apiFunction/taxFilingServices";
import ModeloCalculationCard from "./ModeloCalculationCard";
import PercipientPanel from "./PercipientPanel";
import { extractModeloNosFromLedgers } from "../../../../api/apiFunction/taxCalculationServices";
import { listUserLedgers } from "../../../../api/apiFunction/ledgerServices";
import { getMyFiscalProfile } from "../../../../api/apiFunction/onboardingServices";
import { filingPeriodQuery, formatFilingPeriod, parseMonthParam } from "../../../../utils/taxPeriod";

const MODELO_LABELS = {
  "115": "Modelo 115 – IRPF Rent Withholding",
  "130": "Modelo 130 – IRPF Quarterly Payment",
  "190": "Modelo 190 – Annual Withholding Summary",
  "111": "Modelo 111 – IRPF Withholding",
  "303": "Modelo 303 – VAT Declaration",
  "390": "Modelo 390 – VAT Annual Summary",
};

const STEPS = ["DRAFT", "CALCULATED", "IN_REVIEW", "APPROVED", "SUBMITTED"];

const STATUS_VARIANT = {
  DRAFT: "secondary",
  CALCULATED: "info",
  IN_REVIEW: "warning",
  APPROVED: "success",
  SUBMITTED: "info",
  ACCEPTED: "success",
  REJECTED: "error",
};

const fmtDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("en-GB");
};

const TaxFilingDetail = () => {
  const { filingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const calendarQuery = filingPeriodQuery({
    year: searchParams.get("year") || undefined,
    semester: searchParams.get("semester") || undefined,
    month: parseMonthParam(searchParams.get("month")) || undefined,
  });

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);
  const userId = user?.id || user?._id || user?.user_id || user?.uid;

  const [filing, setFiling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState("");
  const [action, setAction] = useState(null);
  const [modeloId, setModeloId] = useState("");
  const [nif, setNif] = useState("");
  const [certPassword, setCertPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  const loadFiling = async () => {
    try {
      setLoading(true);
      const data = await getTaxFiling(filingId);
      setFiling(data);
    } catch (err) {
      toast.error(formatTaxFilingError(err, "Failed to load tax filing"));
      navigate(`/app/tax-filings/cases${calendarQuery}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filingId]);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      listUserLedgers({ user_id: userId }).catch(() => ({ entries: [] })),
      getMyFiscalProfile().catch(() => null),
    ]).then(([{ entries }, profile]) => {
      setNif(profile?.taxpayer_identity?.nif_nie || "");
      const { modeloIdMap } = extractModeloNosFromLedgers(entries || []);
      (profile?.periodic_tax_obligations || []).forEach((item) => {
        const modelo = String(item?.modelo || "");
        const id = item?.modelo_id || item?._id;
        if (modelo && id && !modeloIdMap[modelo]) modeloIdMap[modelo] = id;
      });
      const currentModelo = String(filing?.modelo || "");
      if (currentModelo && modeloIdMap[currentModelo]) {
        setModeloId(String(modeloIdMap[currentModelo]));
      }
    });
  }, [userId, filing?.modelo]);

  const status = getFilingStatus(filing);
  const calculation = getFilingCalculation(filing);
  const modeloNo = String(filing?.modelo || "");
  const canLiveSubmit = canLiveSubmitFiling(filing);
  const needsPercipients = filingNeedsPercipients(filing);
  const legallyComplete = Boolean(
    calculation?.totals?.legally_complete
    ?? calculation?.legally_complete
    ?? (calculation?.totals?.lines || calculation?.lines || []).length
  );
  const liveReady = !needsPercipients || legallyComplete;
  const liveSubmit = action === "submit" && canLiveSubmit;
  const aeatResult = filing?.aeat_result && typeof filing.aeat_result === "object"
    ? filing.aeat_result
    : null;
  const aeatMessage = aeatResult?.message || aeatResult?.description || "";
  const canDownloadJustificante = Boolean(
    filing?.justificante_available || aeatResult?.has_justificante
  );
  const showResultPanel = Boolean(
    aeatResult && (status === "ACCEPTED" || status === "REJECTED")
  );
  const currentIndex = STEPS.indexOf(status === "ACCEPTED" || status === "REJECTED" ? "SUBMITTED" : status);

  const closeModal = () => {
    if (busy) return;
    setAction(null);
    setComment("");
    setCertPassword("");
    setShowPassword(false);
  };

  const runAction = async () => {
    const id = getFilingId(filing) || filingId;
    try {
      setBusy(true);
      let updated = filing;
      if (action === "calculate") {
        updated = await calculateTaxFiling(id, { modelo_id: modeloId || undefined, comment });
      } else if (action === "review") {
        updated = await reviewTaxFiling(id, { comment });
      } else if (action === "approve") {
        updated = await approveTaxFiling(id, { comment });
      } else if (action === "submit") {
        if (!liveReady) {
          toast.error("Add percipient records and recalculate before live submit.");
          return;
        }
        if (!certPassword.trim()) {
          toast.error("Certificate password is required");
          return;
        }
        updated = await submitTaxFiling(id, {
          comment,
          test_mode: false,
          cert_password: certPassword,
        });
      } else if (action === "submit_test") {
        updated = await submitTaxFiling(id, { comment, test_mode: true });
      } else if (action === "accept" || action === "reject") {
        updated = await recordTaxFilingResult(id, {
          accepted: action === "accept",
          code: action === "accept" ? "TEST-OK" : "TEST-KO",
          description: comment || (action === "accept" ? "Accepted in test mode" : "Rejected in test mode"),
          comment,
        });
      }
      setFiling(updated);
      const refreshed = await getTaxFiling(id).catch(() => updated);
      setFiling(refreshed || updated);
      setAction(null);
      setComment("");
      setCertPassword("");
      setShowPassword(false);
      const aeatMessage = (refreshed || updated)?.aeat_result?.message
        || (refreshed || updated)?.aeat_result?.description;
      toast.success(aeatMessage || "Filing updated");
    } catch (err) {
      toast.error(formatTaxFilingError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadJustificante = async () => {
    const id = getFilingId(filing) || filingId;
    try {
      setDownloadingReceipt(true);
      await downloadTaxFilingJustificante(
        id,
        `justificante-modelo-${modeloNo}-${filing.year}.pdf`
      );
    } catch (err) {
      toast.error(formatTaxFilingError(err, "Could not download justificante"));
    } finally {
      setDownloadingReceipt(false);
    }
  };

  if (loading || !filing) {
    return (
      <div className="flex-1 bg-bg-70 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-fg-60" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-70 overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-fg-40">
              Modelo {filing.modelo} · {formatFilingPeriod(filing)}
            </h1>
            <p className="text-sm text-fg-60 mt-1">Tax filing workflow</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[status] || "secondary"}>{status.replace("_", " ")}</Badge>
            <Button variant="secondary" onClick={() => navigate(`/app/tax-filings/cases${calendarQuery}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              All filings
            </Button>
          </div>
        </div>

        <div className="bg-bg-50 border border-bd-50 rounded-2xl p-5 mb-6">
          <div className="flex flex-wrap gap-2">
            {STEPS.map((step, index) => (
              <div
                key={step}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  index <= currentIndex
                    ? "bg-ac-02/10 text-fg-40 border-ac-02/30"
                    : "bg-bg-60 text-fg-60 border-bd-50"
                }`}
              >
                {index + 1}. {step.replace("_", " ")}
              </div>
            ))}
            {(status === "ACCEPTED" || status === "REJECTED") && (
              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                status === "ACCEPTED"
                  ? "bg-green-500/10 text-green-600 border-green-500/30"
                  : "bg-red-500/10 text-red-600 border-red-500/30"
              }`}>
                {status}
              </div>
            )}
          </div>
        </div>

        {showResultPanel && (
          <div
            className={`border rounded-2xl p-5 mb-6 ${
              status === "REJECTED"
                ? "bg-red-500/5 border-red-500/30"
                : "bg-green-500/5 border-green-500/30"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-fg-40">AEAT result</p>
                <p className="text-xs text-fg-60 mt-0.5">
                  {status === "REJECTED"
                    ? "AEAT rejected this filing. Review the error, then calculate again."
                    : "AEAT accepted this filing."}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleDownloadJustificante}
                disabled={!canDownloadJustificante || downloadingReceipt}
              >
                {downloadingReceipt ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download justificante
              </Button>
            </div>
            <dl className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-fg-60">Code</dt>
                <dd className="text-fg-40 font-medium mt-0.5">{aeatResult.code || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-fg-60">CSV</dt>
                <dd className="text-fg-40 font-medium mt-0.5 break-all">{aeatResult.csv || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-fg-60">Message</dt>
                <dd className={`mt-0.5 font-medium ${status === "REJECTED" ? "text-red-600" : "text-fg-40"}`}>
                  {aeatMessage || "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-fg-60">Justificante</dt>
                <dd className="text-fg-40 font-medium mt-0.5">{aeatResult.justificante || "—"}</dd>
              </div>
            </dl>
            {!canDownloadJustificante && (
              <p className="text-xs text-fg-60 mt-3">No justificante number or CSV was returned, so download is unavailable.</p>
            )}
          </div>
        )}

        {canLiveSubmit && status === "SUBMITTED" && (
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-4 mb-6 text-sm text-fg-60">
            This Modelo {modeloNo} was submitted in test mode and was not sent to AEAT. There is no AEAT result panel.
            Live submit is required for ACCEPTED or REJECTED from AEAT.
          </div>
        )}

        {needsPercipients && (
          <PercipientPanel
            modeloNo={modeloNo}
            year={filing.year}
            quarter={filing.quarter}
          />
        )}

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-fg-40 mb-3">Calculation</h2>
          <ModeloCalculationCard
            modeloNo={modeloNo}
            title={MODELO_LABELS[modeloNo] || `Modelo ${modeloNo}`}
            liveResult={calculation}
            nif={nif}
            filingStatus={status}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-4 text-sm">
            <p className="text-xs text-fg-60 mb-2">Reviewer</p>
            <p className="text-fg-40 font-medium">{filing.reviewer || filing.reviewed_by || "—"}</p>
            <p className="text-xs text-fg-60 mt-1">{fmtDate(filing.reviewed_at)}</p>
            {filing.review_comment && <p className="text-xs text-fg-60 mt-2">{filing.review_comment}</p>}
          </div>
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-4 text-sm">
            <p className="text-xs text-fg-60 mb-2">Approver</p>
            <p className="text-fg-40 font-medium">{filing.approver || filing.approved_by || "—"}</p>
            <p className="text-xs text-fg-60 mt-1">{fmtDate(filing.approved_at)}</p>
            {filing.approval_comment && <p className="text-xs text-fg-60 mt-2">{filing.approval_comment}</p>}
          </div>
        </div>

        {Array.isArray(filing.validation_results) && filing.validation_results.length > 0 && (
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-fg-60" />
              <p className="text-sm font-medium text-fg-40">Validation results</p>
            </div>
            <pre className="text-xs text-fg-60 overflow-auto">{JSON.stringify(filing.validation_results, null, 2)}</pre>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {(status === "DRAFT" || status === "REJECTED" || filing?.can_recalculate) && (
            <Button variant="primary" onClick={() => setAction("calculate")}>Calculate</Button>
          )}
          {status === "CALCULATED" && (
            <Button variant="primary" onClick={() => setAction("review")}>Send to review</Button>
          )}
          {status === "IN_REVIEW" && (
            <Button variant="primary" onClick={() => setAction("approve")}>Approve</Button>
          )}
          {status === "APPROVED" && canLiveSubmit && (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  if (!liveReady) {
                    toast.error("Add percipient records and recalculate before live submit.");
                    return;
                  }
                  setAction("submit");
                }}
                disabled={!liveReady}
                title={!liveReady ? "Percipient records are required" : undefined}
              >
                Submit to AEAT
              </Button>
              <Button variant="secondary" onClick={() => setAction("submit_test")}>
                Submit (test)
              </Button>
              {!liveReady && (
                <p className="w-full text-xs text-amber-600 mt-1">
                  Add percipient records above, then Calculate again before submitting to AEAT.
                </p>
              )}
            </>
          )}
          {status === "APPROVED" && !canLiveSubmit && (
            <Button variant="primary" onClick={() => setAction("submit_test")}>
              Submit (test)
            </Button>
          )}
          {status === "SUBMITTED" && !canLiveSubmit && (
            <>
              <Button variant="primary" onClick={() => setAction("accept")}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Record accepted
              </Button>
              <Button variant="secondary" onClick={() => setAction("reject")}>Record rejected</Button>
            </>
          )}
        </div>
      </div>

      <Modal open={Boolean(action)} onClose={closeModal}>
        <ModalHeader title={liveSubmit ? `Submit Modelo ${modeloNo} to AEAT` : "Update filing"} />
        <ModalBody>
          {liveSubmit ? (
            <div className="space-y-4">
              <p className="text-sm text-fg-60">
                This builds the official Modelo {modeloNo} file and sends it to AEAT. Status will become
                ACCEPTED or REJECTED from the AEAT response, not from a manual button.
              </p>
              <div>
                <label className="block text-xs font-medium text-fg-60 mb-1.5">
                  Certificate password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={certPassword}
                    onChange={(e) => setCertPassword(e.target.value)}
                    placeholder="Enter your .p12 password"
                    autoComplete="off"
                    className="w-full px-3 py-2.5 pr-10 text-sm bg-bg-60 border border-bd-50 rounded-lg text-fg-40 placeholder:text-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && certPassword.trim() && !busy) runAction();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-60 hover:text-fg-40"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-fg-60 mt-1">Used in-memory only — never stored.</p>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-bg-60 border border-bd-50 rounded-lg text-sm text-fg-40"
                placeholder="Optional comment"
              />
            </div>
          ) : (
            <>
              <p className="text-sm text-fg-60 mb-3">
                Optional comment is stored with reviewer/approver timestamps.
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-bg-60 border border-bd-50 rounded-lg text-sm text-fg-40"
                placeholder="Comment"
              />
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={closeModal} disabled={busy}>Cancel</Button>
          <Button
            variant="primary"
            onClick={runAction}
            disabled={busy || (liveSubmit && !certPassword.trim())}
          >
            {busy ? "Saving…" : liveSubmit ? "Confirm & submit" : "Confirm"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default TaxFilingDetail;
