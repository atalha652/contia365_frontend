/**
 * Modelo Calculation Card
 * Displays calculated values for a specific modelo (303 or 130)
 */

import React, { useEffect, useState } from "react";
import { FileText, TrendingUp, Calculator, Download } from "lucide-react";
import { getModeloCalculation } from "../../../../api/apiFunction/taxCalculationServices";

const ModeloCalculationCard = ({ modeloNo, startDate, endDate, title, userId }) => {
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getModeloCalculation({ modeloNo, startDate, endDate, userId });
        setCalculation(data);
      } catch (err) {
        setError(err?.response?.data?.detail || `Failed to load Modelo ${modeloNo}`);
      } finally {
        setLoading(false);
      }
    };

    if (modeloNo && startDate && endDate) {
      fetchCalculation();
    }
  }, [modeloNo, startDate, endDate, userId]);

  if (loading) {
    return (
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-5 w-40 bg-bg-40 rounded mb-2 animate-pulse" />
            <div className="h-3 w-32 bg-bg-40 rounded animate-pulse" />
          </div>
          <div className="w-10 h-10 bg-bg-70 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-bg-40 rounded animate-pulse" />
          <div className="h-4 w-full bg-bg-40 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-bg-40 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-fg-50">{title || `Modelo ${modeloNo}`}</h3>
            <p className="text-xs text-fg-60 mt-1">Tax calculation</p>
          </div>
          <FileText className="w-5 h-5 text-fg-50" />
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!calculation) {
    return null;
  }

  const isVAT = modeloNo === "303";
  const isIRPF = modeloNo === "130";

  return (
    <div className="bg-bg-50 border border-bd-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-fg-40">{title || calculation.modelo_name}</h3>
          <p className="text-xs text-fg-60 mt-1">
            Modelo {calculation.modelo_no} • {calculation.period_type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-bg-60 rounded-lg transition-colors"
            title="Download report"
          >
            <Download className="w-4 h-4 text-fg-50" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-ac-02 to-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* VAT Summary */}
      {isVAT && calculation.vat_summary && (
        <div className="space-y-4">
          {/* Main Amount */}
          <div className="bg-gradient-to-br from-bg-60 to-bg-70 rounded-lg p-4 border border-bd-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-fg-60 mb-1">VAT Payable</p>
                <p className="text-2xl font-bold text-fg-40">
                  €{Number(calculation.vat_summary.vat_payable || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">To Pay</span>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-60 rounded-lg p-3 border border-bd-50">
              <p className="text-xs text-fg-60 mb-1">Output VAT</p>
              <p className="text-lg font-semibold text-fg-40">
                €{Number(calculation.vat_summary.output_vat_amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-fg-60 mt-1">
                {calculation.vat_summary.output_transactions_count || 0} transactions
              </p>
            </div>
            <div className="bg-bg-60 rounded-lg p-3 border border-bd-50">
              <p className="text-xs text-fg-60 mb-1">Input VAT</p>
              <p className="text-lg font-semibold text-fg-40">
                €{Number(calculation.vat_summary.input_vat_amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-fg-60 mt-1">
                {calculation.vat_summary.input_transactions_count || 0} transactions
              </p>
            </div>
          </div>

          {/* By Rate */}
          {calculation.vat_summary.vat_by_rate && Object.keys(calculation.vat_summary.vat_by_rate).length > 0 && (
            <div className="pt-3 border-t border-bd-50">
              <p className="text-xs font-medium text-fg-60 mb-2">Breakdown by Rate</p>
              <div className="space-y-2">
                {Object.entries(calculation.vat_summary.vat_by_rate).map(([rate, data]) => {
                  const netVAT = (data.output_vat || 0) - (data.input_vat || 0);
                  return (
                    <div key={rate} className="flex items-center justify-between text-sm">
                      <span className="text-fg-60">{rate}% VAT</span>
                      <span className={`font-medium ${netVAT >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        €{Math.abs(netVAT).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* IRPF Summary */}
      {isIRPF && calculation.irpf_summary && (
        <div className="space-y-4">
          {/* Main Amount */}
          <div className="bg-gradient-to-br from-bg-60 to-bg-70 rounded-lg p-4 border border-bd-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-fg-60 mb-1">IRPF to Pay (Q{calculation.irpf_summary.quarter})</p>
                <p className="text-2xl font-bold text-fg-40">
                  €{Number(calculation.irpf_summary.irpf_to_pay || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                <Calculator className="w-4 h-4" />
                <span className="text-xs font-medium">{calculation.irpf_summary.irpf_rate}%</span>
              </div>
            </div>
          </div>

          {/* Income & Expenses */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-bd-50">
              <span className="text-sm text-fg-60">Gross Income</span>
              <span className="text-sm font-semibold text-fg-40">
                €{Number(calculation.irpf_summary.gross_income || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-bd-50">
              <span className="text-sm text-fg-60">Deductible Expenses</span>
              <span className="text-sm font-semibold text-fg-40">
                €{Number(calculation.irpf_summary.deductible_expenses || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-fg-50">Net Income</span>
              <span className="text-sm font-bold text-fg-40">
                €{Number(calculation.irpf_summary.net_income || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Previous Quarters */}
          {calculation.irpf_summary.quarter > 1 && calculation.irpf_summary.previous_quarters_irpf > 0 && (
            <div className="pt-3 border-t border-bd-50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-fg-60">Previous Quarters Paid</span>
                <span className="font-medium text-fg-50">
                  €{Number(calculation.irpf_summary.previous_quarters_irpf || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-bd-50 flex items-center justify-between text-xs text-fg-60">
        <span>
          {calculation.transaction_count || 0} transactions
        </span>
        <span>
          Calculated {new Date(calculation.calculated_at).toLocaleDateString('es-ES')}
        </span>
      </div>
    </div>
  );
};

export default ModeloCalculationCard;
