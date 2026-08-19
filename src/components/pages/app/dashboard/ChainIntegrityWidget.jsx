import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { verifyInvoiceChain } from "../../../../api/apiFunction/invoiceServices";

const ChainIntegrityWidget = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyInvoiceChain()
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      onClick={() => navigate("/app/compliance")}
      className="bg-bg-50 border border-bd-50 rounded-xl p-6 cursor-pointer hover:bg-bg-40 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-fg-60 mb-1">Invoice Integrity</p>
          {loading ? (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="w-4 h-4 animate-spin text-fg-60" />
              <span className="text-sm text-fg-60">Checking…</span>
            </div>
          ) : result === null ? (
            <p className="text-sm text-fg-60 mt-1">Unavailable</p>
          ) : (
            <>
              <p className={`text-lg font-bold mt-1 ${result.valid ? "text-green-500" : "text-red-500"}`}>
                {result.valid ? "Chain Healthy" : "Chain Broken"}
              </p>
              <p className="text-xs text-fg-60 mt-1">
                {result.total ?? 0} invoices checked
                {!result.valid && Array.isArray(result.errors) && result.errors.length > 0
                  ? ` · ${result.errors.length} error${result.errors.length > 1 ? "s" : ""}`
                  : ""}
              </p>
              <p className="text-xs text-ac-02 mt-2 hover:underline">View details →</p>
            </>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          loading ? "bg-bg-70" : result?.valid ? "bg-green-500/10" : "bg-red-500/10"
        }`}>
          {loading
            ? <Loader2 className="w-5 h-5 animate-spin text-fg-60" />
            : result?.valid
            ? <ShieldCheck className="w-5 h-5 text-green-500" />
            : <ShieldAlert className="w-5 h-5 text-red-500" />}
        </div>
      </div>
    </div>
  );
};

export default ChainIntegrityWidget;
