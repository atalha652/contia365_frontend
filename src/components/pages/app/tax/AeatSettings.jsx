import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, RefreshCw, AlertTriangle, CheckCircle2, FileText, Lock, ExternalLink, Scale } from "lucide-react";
import { toast } from "react-toastify";
import { Button, Badge } from "../../../ui";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../../ui/Modal";
import {
  getAeatConnectionStatus,
  revokeAeatConnection,
  confirmPersonAeatConnect,
  confirmAeatConnect,
} from "../../../../api/apiFunction/onboardingServices";

const AeatSettings = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [nifInput, setNifInput] = useState("");
  const [apoderamientoCode, setApoderamientoCode] = useState("");
  const [agreed, setAgreed] = useState(false);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await getAeatConnectionStatus();
      setStatus(data);
      if (data?.nif) {
        setNifInput(data.nif);
      }
      if (data?.apoderamiento_code) {
        setApoderamientoCode(data.apoderamiento_code);
      }
    } catch (err) {
      toast.error("Failed to load AEAT representation status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleRevoke = async () => {
    try {
      setBusy(true);
      const res = await revokeAeatConnection();
      if (res?.data?.connected === false || res?.status === 200) {
        toast.success("AEAT representation authority revoked.");
        setShowRevokeModal(false);
        await loadStatus();
      } else {
        toast.error(res?.data?.message || "Failed to revoke authorization.");
      }
    } catch (err) {
      toast.error("Error revoking authorization.");
    } finally {
      setBusy(false);
    }
  };

  const handleAuthorize = async () => {
    if (!nifInput.trim()) {
      toast.error("Please enter your NIF/NIE.");
      return;
    }
    if (!agreed) {
      toast.error("You must confirm the legal agreement checkbox.");
      return;
    }

    try {
      setBusy(true);
      let res;
      const codeToPass = apoderamientoCode.trim() || null;
      if (status?.user_type === "person") {
        res = await confirmPersonAeatConnect(nifInput.trim(), "v1.0-2026", codeToPass);
      } else {
        res = await confirmAeatConnect(nifInput.trim(), "v1.0-2026", codeToPass);
      }

      if (res?.status === 200 || res?.data?.aeat_connected || res?.data?.person_aeat_connected) {
        toast.success("AEAT representation confirmed & legal consent recorded!");
        setShowAuthModal(false);
        setAgreed(false);
        await loadStatus();
      } else {
        toast.error(res?.data?.message || res?.data?.detail || "Failed to confirm authorization.");
      }
    } catch (err) {
      toast.error("Error confirming authorization.");
    } finally {
      setBusy(false);
    }
  };

  const fmtDate = (val) => {
    if (!val) return "—";
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? String(val) : d.toLocaleString("en-GB");
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AEAT Representation & Apoderamiento</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage Contia365's legal authority to act on your behalf before AEAT (Agencia Tributaria)
            </p>
          </div>
          <button
            type="button"
            onClick={loadStatus}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap shrink-0 disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 text-[#582dee] ${loading ? "animate-spin" : ""}`} strokeWidth={2} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading && !status && (
          <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bg-40 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-40 bg-bg-40 rounded animate-pulse" />
                <div className="h-3 w-56 bg-bg-40 rounded animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Status Content */}
        {!loading && status && (
          <div className="space-y-6">
            {/* Status Card */}
            <div
              className={`border rounded-2xl p-6 ${
                status.connected
                  ? "bg-[#582dee]/5 border-[#582dee]/20"
                  : "bg-red-500/5 border-red-500/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      status.connected ? "bg-[#582dee]/10" : "bg-red-500/10"
                    }`}
                  >
                    {status.connected ? (
                      <ShieldCheck className="w-6 h-6 text-[#582dee]" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-fg-40">
                        {status.connected ? "Representation Active" : "Representation Revoked / Inactive"}
                      </h2>
                      <Badge variant={status.connected ? "success" : "error"}>
                        {status.connected ? "AUTHORIZED" : "REVOKED"}
                      </Badge>
                    </div>
                    <p className="text-sm text-fg-60 mt-0.5">
                      {status.connected
                        ? "Contia365 is authorized to submit tax filings (Modelos 303, 115, etc.) on your behalf."
                        : "Contia365 is NOT currently authorized to act on your behalf before AEAT."}
                    </p>
                  </div>
                </div>

                <div>
                  {status.connected ? (
                    <Button variant="danger" onClick={() => setShowRevokeModal(true)}>
                      Revoke Access
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={() => setShowAuthModal(true)}>
                      Authorize Contia365
                    </Button>
                  )}
                </div>
              </div>

              {/* Status details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-bd-50/50 text-sm">
                <div>
                  <p className="text-xs text-fg-60">Taxpayer / Rep NIF</p>
                  <p className="font-semibold text-fg-40 mt-0.5">{status.nif || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-fg-60">Authorized On</p>
                  <p className="font-semibold text-fg-40 mt-0.5">{fmtDate(status.connected_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-fg-60">Last AEAT Sync</p>
                  <p className="font-semibold text-fg-40 mt-0.5">{fmtDate(status.last_sync_at)}</p>
                </div>
              </div>

              {/* Formal Legal Audit Trail Section */}
              {status.connected && (
                <div className="mt-6 pt-6 border-t border-bd-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="w-4 h-4 text-ac-02" />
                    <h3 className="text-xs font-semibold text-fg-40 uppercase tracking-wider">
                      Formal Legal Audit Trail
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-bg-60 border border-bd-50 rounded-xl p-3.5">
                    <div>
                      <p className="text-fg-60">Terms Version</p>
                      <p className="font-mono font-medium text-fg-40 mt-0.5">
                        {status.representation_terms_version || "v1.0-2026"}
                      </p>
                    </div>
                    <div>
                      <p className="text-fg-60">Consent Timestamp</p>
                      <p className="font-medium text-fg-40 mt-0.5">
                        {fmtDate(status.consent_accepted_at || status.connected_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-fg-60">Recorded Client IP</p>
                      <p className="font-mono font-medium text-fg-40 mt-0.5">
                        {status.ip_address || "Captured on server"}
                      </p>
                    </div>
                    <div>
                      <p className="text-fg-60">Apoderamiento Receipt #</p>
                      <p className="font-mono font-medium text-fg-40 mt-0.5 truncate">
                        {status.apoderamiento_code || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Explanatory Box */}
            <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-fg-40 flex items-center gap-2">
                <FileText className="w-4 h-4 text-ac-02" />
                How AEAT Representation Works (Gestor Model)
              </h3>
              <p className="text-xs text-fg-60 leading-relaxed">
                Contia365 operates as an authorized representative (<em>gestor / colaborador social</em>) in Spain. 
                Instead of treating Contia365 as a separate taxpayer, tax filings (such as Modelo 303 or 115) are submitted 
                directly under your NIF/CIF while using Contia365's company digital certificate.
              </p>

              <div className="bg-bg-60 border border-bd-50 rounded-xl p-4 text-xs space-y-2">
                <p className="font-medium text-fg-40">To grant or update representation in AEAT:</p>
                <ol className="list-decimal list-inside space-y-1 text-fg-60">
                  <li>Log in to the AEAT Sede Electrónica portal with your personal digital certificate.</li>
                  <li>Navigate to <strong>Apoderamiento</strong> (Otorgar apoderamiento para trámites tributarios).</li>
                  <li>Add Contia365's corporate NIF (<code className="font-mono bg-bg-50 px-1 py-0.5 rounded text-ac-02 font-bold">12345678Z</code>) and grant powers for Modelo 303, 115, 130, 190, 390.</li>

                  <li>Click <strong>Authorize Contia365</strong> above to confirm your authorization in the app.</li>
                </ol>
                <a
                  href="https://sede.agenciatributaria.gob.es/Sede/procedimientoini/ZP01.shtml"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-ac-02 hover:underline mt-2 text-xs font-medium"
                >
                  Go to AEAT Sede Electrónica <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Revoke Confirmation Modal */}
        <Modal open={showRevokeModal} onClose={() => !busy && setShowRevokeModal(false)}>
          <ModalHeader title="Revoke AEAT Representation" />
          <ModalBody>
            <div className="space-y-3">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-400 font-medium">
                  Revoking authorization will prevent Contia365 from submitting tax filings in Gestor mode on your behalf.
                </p>
              </div>
              <p className="text-xs text-fg-60">
                Are you sure you want to revoke Contia365's representation authority? You can re-authorize at any time from this Settings page.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowRevokeModal(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRevoke} disabled={busy}>
              {busy ? "Revoking…" : "Confirm Revocation"}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Re-authorize Modal */}
        <Modal open={showAuthModal} onClose={() => !busy && setShowAuthModal(false)}>
          <ModalHeader title="Authorize Contia365 before AEAT" />
          <ModalBody>
            <div className="space-y-4">
              <p className="text-xs text-fg-60 leading-relaxed">
                By confirming below, you declare that you have granted Contia365 valid power of attorney (apoderamiento) 
                on the official AEAT portal.
              </p>

              <div>
                <label className="block text-xs font-medium text-fg-40 mb-1">
                  Taxpayer NIF / NIE
                </label>
                <input
                  type="text"
                  value={nifInput}
                  onChange={(e) => setNifInput(e.target.value)}
                  placeholder="e.g. 12345678X or B12345678"
                  className="w-full px-3 py-2 bg-bg-60 border border-bd-50 rounded-lg text-sm text-fg-40 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-fg-40 mb-1">
                  AEAT Apoderamiento Receipt / Reference # <span className="text-fg-60 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={apoderamientoCode}
                  onChange={(e) => setApoderamientoCode(e.target.value)}
                  placeholder="e.g. AEAT-REF-2026-98765"
                  className="w-full px-3 py-2 bg-bg-60 border border-bd-50 rounded-lg text-sm text-fg-40 font-mono"
                />
                <p className="text-[11px] text-fg-60 mt-1">
                  If AEAT generated a receipt code when you granted apoderamiento, enter it here for audit purposes.
                </p>
              </div>

              <div className="p-3 bg-bg-60 border border-bd-50 rounded-xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="legal-agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-bd-50 bg-bg-50 text-[#582dee] focus:ring-[#582dee]"
                />
                <label htmlFor="legal-agree" className="text-xs text-fg-60 cursor-pointer leading-snug">
                  I accept the <strong>Representation Terms v1.0-2026</strong> and confirm that Contia365 is authorized to present 
                  tax returns (Modelos 303, 115, 130, etc.) in my name and on my behalf as an authorized representative. 
                  My IP address and timestamp will be recorded for compliance.
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowAuthModal(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAuthorize} disabled={busy || !agreed || !nifInput}>
              {busy ? "Saving…" : "Confirm Authorization"}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default AeatSettings;
