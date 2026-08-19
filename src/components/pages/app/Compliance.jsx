import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { Button, Badge } from "../../ui";
import { verifyInvoiceChain } from "../../../api/apiFunction/invoiceServices";

const Compliance = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    try {
      setLoading(true);
      const data = await verifyInvoiceChain();
      setResult(data);
      if (data?.valid === false) toast.warn("Invoice chain integrity check failed");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to run integrity check");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runCheck(); }, []);

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-fg-40">Invoice Chain Compliance</h1>
            <p className="text-sm text-fg-60 mt-1">VeriFactu hash chain integrity audit</p>
          </div>
          <Button variant="secondary" onClick={runCheck} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
            Run Integrity Check
          </Button>
        </div>

        {/* Skeleton */}
        {loading && !result && (
          <div className="space-y-4">
            <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-bg-40 rounded-xl animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-bg-40 rounded animate-pulse" />
                  <div className="h-3 w-56 bg-bg-40 rounded animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-bg-40 rounded-xl p-4 space-y-2 animate-pulse">
                    <div className="h-3 w-20 bg-bg-50 rounded" />
                    <div className="h-6 w-12 bg-bg-50 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Status card */}
            <div className={`border rounded-2xl p-6 ${result.valid ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${result.valid ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {result.valid
                    ? <ShieldCheck className="w-6 h-6 text-green-500" />
                    : <ShieldAlert className="w-6 h-6 text-red-500" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-fg-40">
                      {result.valid ? "Chain Healthy" : "Chain Integrity Failed"}
                    </h2>
                    <Badge variant={result.valid ? "success" : "error"}>
                      {result.valid ? "VALID" : "INVALID"}
                    </Badge>
                  </div>
                  <p className="text-sm text-fg-60 mt-0.5">{result.message || "—"}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="bg-bg-50 border border-bd-50 rounded-xl p-4">
                  <p className="text-xs text-fg-60 mb-1">Invoices Checked</p>
                  <p className="text-2xl font-bold text-fg-40">{result.total ?? 0}</p>
                </div>
                <div className="bg-bg-50 border border-bd-50 rounded-xl p-4">
                  <p className="text-xs text-fg-60 mb-1">Errors Found</p>
                  <p className={`text-2xl font-bold ${Array.isArray(result.errors) && result.errors.length > 0 ? "text-red-500" : "text-green-500"}`}>
                    {Array.isArray(result.errors) ? result.errors.length : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Errors list */}
            {Array.isArray(result.errors) && result.errors.length > 0 && (
              <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-fg-40 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Chain Errors
                </h3>
                <div className="space-y-2">
                  {result.errors.map((err, i) => {
                    const isObj = typeof err === "object" && err !== null;
                    return (
                      <div key={i} className="px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 font-mono text-xs flex-shrink-0">#{i + 1}</span>
                          {isObj && err.invoice_number && (
                            <span className="font-semibold text-fg-40">{err.invoice_number}</span>
                          )}
                          {isObj && err.error && (
                            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{err.error}</span>
                          )}
                          {!isObj && <span className="text-fg-60">{String(err)}</span>}
                        </div>
                        {isObj && err.expected_previous_fingerprint && (
                          <div className="text-xs text-fg-60 font-mono pl-5 space-y-0.5">
                            <div>Expected: <span className="text-fg-40">{err.expected_previous_fingerprint}</span></div>
                            <div>Stored: <span className="text-red-400">{err.stored_previous_fingerprint}</span></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All clear */}
            {result.valid && (
              <div className="bg-bg-50 border border-bd-50 rounded-2xl p-6 text-center">
                <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-fg-60">All {result.total ?? 0} invoices passed the hash chain verification. No tampering detected.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Compliance;
