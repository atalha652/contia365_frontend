/**
 * IRPF Summary Widget
 * Displays current quarter's IRPF to pay (Income - Expenses × Rate)
 */

import React, { useEffect, useState } from "react";
import { Calculator, TrendingUp, Wallet } from "lucide-react";
import { getIRPFSummary } from "../../../../api/apiFunction/taxCalculationServices";

const IRPFSummaryWidget = ({ startDate, endDate, quarter, title = "IRPF Summary" }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getIRPFSummary({ startDate, endDate, quarter });
        setSummary(data);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load IRPF summary");
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate && quarter) {
      fetchSummary();
    }
  }, [startDate, endDate, quarter]);

  if (loading) {
    return (
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-4 w-32 bg-bg-40 rounded mb-2 animate-pulse" />
            <div className="h-3 w-24 bg-bg-40 rounded animate-pulse" />
          </div>
          <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-fg-50" strokeWidth={1.5} />
          </div>
        </div>
        <div className="h-8 w-40 bg-bg-40 rounded mb-4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-bg-40 rounded animate-pulse" />
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
            <p className="text-xs text-fg-60 mt-1">Modelo 130 • Q{quarter}</p>
          </div>
          <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-fg-50" strokeWidth={1.5} />
          </div>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const irpfToPay = Number(summary.irpf_to_pay || 0);
  const grossIncome = Number(summary.gross_income || 0);
  const deductibleExpenses = Number(summary.deductible_expenses || 0);
  const netIncome = Number(summary.net_income || 0);
  const irpfRate = Number(summary.irpf_rate || 20);

  return (
    <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-fg-50">{title}</h3>
          <p className="text-xs text-fg-60 mt-1">Modelo 130 • Q{quarter}</p>
        </div>
        <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center">
          <Calculator className="w-5 h-5 text-fg-50" strokeWidth={1.5} />
        </div>
      </div>

      {/* IRPF to Pay Amount */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-fg-40">
            €{irpfToPay.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
            <TrendingUp className="w-3 h-3" />
            To Pay
          </span>
        </div>
        <p className="text-xs text-fg-60 mt-1">IRPF Payable (Q{quarter})</p>
      </div>

      {/* Income & Expenses Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between py-2 border-t border-bd-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-fg-60">Gross Income</span>
          </div>
          <span className="text-sm font-medium text-fg-40">
            €{grossIncome.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs text-fg-60">Deductible Expenses</span>
          </div>
          <span className="text-sm font-medium text-fg-40">
            €{deductibleExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-bd-50">
          <div className="flex items-center gap-2">
            <Wallet className="w-3 h-3 text-fg-60" />
            <span className="text-xs font-semibold text-fg-50">Net Income</span>
          </div>
          <span className="text-sm font-bold text-fg-40">
            €{netIncome.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* IRPF Rate */}
      <div className="mt-4 pt-4 border-t border-bd-50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-fg-60">IRPF Rate</span>
          <span className="font-medium text-fg-50">{irpfRate}%</span>
        </div>
      </div>

      {/* Previous Quarters Info (if applicable) */}
      {quarter > 1 && summary.previous_quarters_irpf > 0 && (
        <div className="mt-4 pt-4 border-t border-bd-50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-60">Previous Quarters Paid</span>
            <span className="font-medium text-fg-50">
              €{Number(summary.previous_quarters_irpf || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IRPFSummaryWidget;
