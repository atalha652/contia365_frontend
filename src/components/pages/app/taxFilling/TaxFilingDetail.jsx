import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";
import { Button, Badge } from "../../../ui";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../../ui/Modal";
import {
  approveTaxFiling,
  calculateTaxFiling,
  getFilingCalculation,
  getFilingId,
  getFilingStatus,
  getTaxFiling,
  recordTaxFilingResult,
  reviewTaxFiling,
  submitTaxFiling,
} from "../../../../api/apiFunction/taxFilingServices";
import ModeloCalculationCard from "./ModeloCalculationCard";
import { extractModeloNosFromLedgers } from "../../../../api/apiFunction/taxCalculationServices";
import { listUserLedgers } from "../../../../api/apiFunction/ledgerServices";
import { getMyFiscalProfile } from "../../../../api/apiFunction/onboardingServices";

const MODELO_LABELS = {
  "115": "Modelo 115 – IRPF Rent Withholding",
  "130": "Modelo 130 – IRPF Quarterly Payment",
  "190": "Modelo 190 – IRPF Annual Summary",
  "111": "Modelo 111 – IRPF Withholding (Payroll)",
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
  const calendarQuery = `?year=${searchParams.get("year") || ""}&semester=${searchParams.get("semester") || ""}`;

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

  const loadFiling = async () => {
    try {
      setLoading(true);
      const data = await getTaxFiling(filingId);
      setFiling(data);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to load tax filing");
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
  const currentIndex = STEPS.indexOf(status === "ACCEPTED" || status === "REJECTED" ? "SUBMITTED" : status);

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
      toast.success("Filing updated");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Action failed");
    } finally {
      setBusy(false);
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
              Modelo {filing.modelo} · {filing.quarter || "Annual"} {filing.year}
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

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-fg-40 mb-3">Calculation</h2>
          <ModeloCalculationCard
            modeloNo={modeloNo}
            title={MODELO_LABELS[modeloNo] || `Modelo ${modeloNo}`}
            liveResult={calculation}
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
          {(status === "DRAFT" || status === "REJECTED") && (
            <Button variant="primary" onClick={() => setAction("calculate")}>Calculate</Button>
          )}
          {status === "CALCULATED" && (
            <Button variant="primary" onClick={() => setAction("review")}>Send to review</Button>
          )}
          {status === "IN_REVIEW" && (
            <Button variant="primary" onClick={() => setAction("approve")}>Approve</Button>
          )}
          {status === "APPROVED" && (
            <Button variant="primary" onClick={() => setAction("submit")}>Submit (test)</Button>
          )}
          {status === "SUBMITTED" && (
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

      <Modal open={Boolean(action)} onClose={() => !busy && setAction(null)}>
        <ModalHeader title="Update filing" />
        <ModalBody>
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
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setAction(null)} disabled={busy}>Cancel</Button>
          <Button variant="primary" onClick={runAction} disabled={busy}>
            {busy ? "Saving…" : "Confirm"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default TaxFilingDetail;
