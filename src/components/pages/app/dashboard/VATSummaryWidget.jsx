/**
 * VAT Summary Widget
 * Displays current month's VAT payable (Output VAT - Input VAT)
 */

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { getVATSummary } from "../../../../api/apiFunction/taxCalculationServices";

const VATSummaryWidget = ({ startDate, endDate, userId, title = "VAT Summary" }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getVATSummary({ startDate, endDate, userId });
        setSummary(data);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load VAT summary");
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchSummary();
    }
  }, [startDate, endDate, userId]);

  if (loading) {
    return (
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-4 w-32 bg-bg-40 rounded mb-2 animate-pulse" />
            <div className="h-3 w-24 bg-bg-40 rounded animate-pulse" />
          </div>
          <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-fg-50" strokeWidth={1.5} />
          </div>
        </div>
        <div className="h-8 w-40 bg-bg-40 rounded mb-4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-bg-40 rounded animate-pulse" />
          <div className="h-3 w-full bg-bg-40 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-fg-50">{title}</h3>
            <p className="text-xs text-fg-60 mt-1">Modelo 303</p>
          </div>
          <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-fg-50" strokeWidth={1.5} />
          </div>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const vatPayable = Number(summary.vat_payable || 0);
  const outputVAT = Number(summary.output_vat_amount || 0);
  const inputVAT = Number(summary.input_vat_amount || 0);
  const isPositive = vatPayable >= 0;

  return (
    <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-fg-50">{title}</h3>
          <p className="text-xs text-fg-60 mt-1">Modelo 303</p>
        </div>
        <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-fg-50" strokeWidth={1.5} />
        </div>
      </div>

      {/* VAT Payable Amount */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-fg-40">
            €{Math.abs(vatPayable).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {isPositive ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              <TrendingUp className="w-3 h-3" />
              To Pay
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <TrendingDown className="w-3 h-3" />
              Refund
            </span>
          )}
        </div>
        <p className="text-xs text-fg-60 mt-1">VAT Payable</p>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between py-2 border-t border-bd-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-fg-60">Output VAT (Sales)</span>
          </div>
          <span className="text-sm font-medium text-fg-40">
            €{outputVAT.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-fg-60">Input VAT (Purchases)</span>
          </div>
          <span className="text-sm font-medium text-fg-40">
            €{inputVAT.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Transaction Count */}
      <div className="mt-4 pt-4 border-t border-bd-50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-fg-60">Transactions</span>
          <span className="font-medium text-fg-50">
            {summary.output_transactions_count || 0} sales • {summary.input_transactions_count || 0} purchases
          </span>
        </div>
      </div>

      {/* VAT by Rate (if available) */}
      {summary.vat_by_rate && Object.keys(summary.vat_by_rate).length > 0 && (
        <div className="mt-4 pt-4 border-t border-bd-50">
          <p className="text-xs font-medium text-fg-60 mb-2">By Rate</p>
          <div className="space-y-1">
            {Object.entries(summary.vat_by_rate).map(([rate, data]) => {
              const netVAT = (data.output_vat || 0) - (data.input_vat || 0);
              return (
                <div key={rate} className="flex items-center justify-between text-xs">
                  <span className="text-fg-60">{rate}%</span>
                  <span className={`font-medium ${netVAT >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    €{Math.abs(netVAT).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VATSummaryWidget;
