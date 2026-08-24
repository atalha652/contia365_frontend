/**
 * ModeloCalculationCard
 * Renders tax engine results passed in as props (no internal fetching).
 * Priority: liveResult > savedReport > empty state
 */
import { FileText, TrendingUp, Calculator, Download, Building2, Receipt } from "lucide-react";
import { Button } from "../../../ui";

const fmt = (val) =>
  `€${Number(val || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })}`;

const pct = (val) => `${(Number(val || 0) * 100).toFixed(0)}%`;

const MODELO_CONFIG = {
  "115": { color: "from-purple-500 to-violet-600",  badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",  Icon: Building2 },
  "130": { color: "from-orange-500 to-amber-500",   badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",   Icon: Calculator },
  "303": { color: "from-red-500 to-rose-600",       badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",               Icon: TrendingUp },
  "111": { color: "from-blue-500 to-cyan-500",      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",           Icon: Receipt },
  "190": { color: "from-indigo-500 to-blue-600",    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",   Icon: Receipt },
  "390": { color: "from-teal-500 to-emerald-600",   badge: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",           Icon: TrendingUp },
};

const Row = ({ label, value, bold }) => (
  <div className={`flex items-center justify-between py-2 border-b border-bd-50 last:border-0 ${bold ? "font-semibold" : ""}`}>
    <span className={`text-sm ${bold ? "text-fg-50" : "text-fg-60"}`}>{label}</span>
    <span className={`text-sm ${bold ? "text-fg-40 font-bold" : "text-fg-40"}`}>{value}</span>
  </div>
);

const ModeloCalculationCard = ({ modeloNo, title, liveResult, savedReport, onStartFiling, startingFiling }) => {
  // Priority: live calculation > saved report > null
  const calculation = liveResult ?? savedReport ?? null;
  const isFromSavedReport = !liveResult && !!savedReport;

  const cfg = MODELO_CONFIG[modeloNo] ?? MODELO_CONFIG["303"];
  const BadgeIcon = cfg.Icon;

  // Empty state — no data yet
  if (!calculation) {
    return (
      <div className="bg-bg-50 border border-bd-50 rounded-xl p-6 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-fg-50">{title || `Modelo ${modeloNo}`}</h3>
            <p className="text-xs text-fg-60 mt-1">No data yet — click Calculate Taxes</p>
          </div>
          <div className={`w-10 h-10 bg-gradient-to-br ${cfg.color} rounded-xl flex items-center justify-center opacity-40`}>
            <FileText className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="h-16 bg-bg-60 rounded-lg border border-bd-50 flex items-center justify-center text-xs text-fg-60">
          Awaiting calculation
        </div>
        {onStartFiling && (
          <Button type="button" variant="primary" onClick={onStartFiling} disabled={startingFiling}>
            {startingFiling ? "Creating draft…" : "Start filing"}
          </Button>
        )}
      </div>
    );
  }

  // Live calculations expose "totals"; saved reports store the same payload as "results".
  const totals = calculation.totals ?? calculation.results ?? {};

  // The tax engine renamed several result fields; saved reports may still carry
  // the previous names, so every metric accepts both and falls back to the root.
  const pick = (...keys) => {
    for (const key of keys) {
      if (totals?.[key] != null) return totals[key];
      if (calculation?.[key] != null) return calculation[key];
    }
    return undefined;
  };

  // Rates the engine never used stay at zero — drop them instead of showing €0.00 rows.
  const vatByRateRows = Object.entries(totals.vat_by_rate ?? calculation.vat_by_rate ?? {})
    .map(([rate, data]) => ({
      rate,
      outputVat: Number(data?.output_vat || 0),
      inputVat: Number(data?.input_vat || 0),
    }))
    .filter(({ outputVat, inputVat }) => outputVat !== 0 || inputVat !== 0)
    .sort((a, b) => Number(b.rate) - Number(a.rate));

  return (
    <div className="bg-bg-50 border border-bd-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-fg-40">{title || `Modelo ${modeloNo}`}</h3>
          <p className="text-xs text-fg-60 mt-1 flex items-center gap-2">
            <span>Modelo {calculation.modelo ?? modeloNo}</span>
            {calculation.quarter && <span>· {calculation.quarter}</span>}
            {calculation.year && <span>· {calculation.year}</span>}
            {isFromSavedReport && (
              <span className="px-1.5 py-0.5 rounded bg-bg-60 border border-bd-50 text-fg-60">saved</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-bg-60 rounded-lg transition-colors" title="Download report">
            <Download className="w-4 h-4 text-fg-50" />
          </button>
          <div className={`w-10 h-10 bg-gradient-to-br ${cfg.color} rounded-xl flex items-center justify-center`}>
            <FileText className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* ── 303 — VAT Declaration ─────────────────────────────────────────── */}
      {modeloNo === "303" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-bg-60 to-bg-70 rounded-lg p-4 border border-bd-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-fg-60 mb-1">VAT Payable</p>
                <p className="text-2xl font-bold text-fg-40">{fmt(pick("vat_payable", "net_vat"))}</p>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${cfg.badge}`}>
                <BadgeIcon className="w-4 h-4" />
                <span className="text-xs font-medium">To Pay</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-60 rounded-lg p-3 border border-bd-50">
              <p className="text-xs text-fg-60 mb-1">Output VAT</p>
              <p className="text-lg font-semibold text-fg-40">{fmt(pick("output_vat", "total_output_vat"))}</p>
            </div>
            <div className="bg-bg-60 rounded-lg p-3 border border-bd-50">
              <p className="text-xs text-fg-60 mb-1">Input VAT</p>
              <p className="text-lg font-semibold text-fg-40">{fmt(pick("input_vat", "total_input_vat"))}</p>
            </div>
          </div>
          {vatByRateRows.length > 0 && (
            <div className="pt-3 border-t border-bd-50">
              <p className="text-xs font-medium text-fg-60 mb-2">Breakdown by Rate</p>
              <div className="space-y-1">
                <div className="grid grid-cols-4 gap-2 text-xs text-fg-60">
                  <span>Rate</span>
                  <span className="text-right">Output</span>
                  <span className="text-right">Input</span>
                  <span className="text-right">Net</span>
                </div>
                {vatByRateRows.map(({ rate, outputVat, inputVat }) => {
                  const net = outputVat - inputVat;
                  return (
                    <div key={rate} className="grid grid-cols-4 gap-2 text-sm">
                      <span className="text-fg-60">{rate}% VAT</span>
                      <span className="text-right text-fg-40">{fmt(outputVat)}</span>
                      <span className="text-right text-fg-40">{fmt(inputVat)}</span>
                      <span className={`text-right font-medium ${net >= 0 ? "text-red-500" : "text-green-500"}`}>{fmt(Math.abs(net))}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 130 — IRPF Quarterly Payment ─────────────────────────────────── */}
      {modeloNo === "130" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-bg-60 to-bg-70 rounded-lg p-4 border border-bd-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-fg-60 mb-1">IRPF to Pay</p>
                <p className="text-2xl font-bold text-fg-40">{fmt(pick("irpf_to_pay", "irpf_payable"))}</p>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${cfg.badge}`}>
                <BadgeIcon className="w-4 h-4" />
                <span className="text-xs font-medium">{pct(pick("irpf_rate"))}</span>
              </div>
            </div>
          </div>
          <div className="space-y-0">
            <Row label="Gross Income"        value={fmt(pick("gross_income", "total_income"))} />
            <Row label="Deductible Expenses" value={fmt(pick("deductible_expenses", "total_expenses"))} />
            <Row label="Net Income"          value={fmt(pick("net_income", "taxable_income"))} bold />
            {pick("previous_payments") > 0 && <Row label="Previous Payments" value={fmt(pick("previous_payments"))} />}
          </div>
        </div>
      )}

      {/* ── 115 — Rent IRPF Withholding ──────────────────────────────────── */}
      {modeloNo === "115" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-bg-60 to-bg-70 rounded-lg p-4 border border-bd-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-fg-60 mb-1">Withholding Payable</p>
                <p className="text-2xl font-bold text-fg-40">{fmt(pick("withholding_payable", "total_withholding", "irpf_payable"))}</p>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${cfg.badge}`}>
                <BadgeIcon className="w-4 h-4" />
                <span className="text-xs font-medium">{pct(pick("retention_rate"))}</span>
              </div>
            </div>
          </div>
          <div className="space-y-0">
            <Row label="Total Rent Base" value={fmt(pick("total_rent_base", "total_base"))} />
            <Row label="Retention Rate"  value={pct(pick("retention_rate"))} />
          </div>
        </div>
      )}

      {/* ── 111 — IRPF Withholding (Payroll) ─────────────────────────────── */}
      {modeloNo === "111" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-bg-60 to-bg-70 rounded-lg p-4 border border-bd-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-fg-60 mb-1">Withholding Payable</p>
                <p className="text-2xl font-bold text-fg-40">{fmt(pick("withholding_payable", "total_withholding", "irpf_payable"))}</p>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${cfg.badge}`}>
                <BadgeIcon className="w-4 h-4" />
                <span className="text-xs font-medium">{pct(pick("retention_rate"))}</span>
              </div>
            </div>
          </div>
          <div className="space-y-0">
            <Row label="Total Payroll Base" value={fmt(pick("total_payroll_base", "total_base"))} />
            <Row label="Retention Rate"     value={pct(pick("retention_rate"))} />
          </div>
        </div>
      )}

      {/* ── 190 — IRPF Annual Summary ─────────────────────────────────────── */}
      {modeloNo === "190" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-bg-60 to-bg-70 rounded-lg p-4 border border-bd-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-fg-60 mb-1">Total Withholding</p>
                <p className="text-2xl font-bold text-fg-40">{fmt(pick("total_withholding", "withholding_payable", "irpf_payable"))}</p>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${cfg.badge}`}>
                <BadgeIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Annual</span>
              </div>
            </div>
          </div>
          <div className="space-y-0">
            <Row label="Total Payroll Base" value={fmt(pick("total_payroll_base", "total_base"))} />
            <Row label="Total Income"       value={fmt(pick("total_income", "gross_income"))} bold />
          </div>
        </div>
      )}

      {/* ── 390 — VAT Annual Summary ──────────────────────────────────────── */}
      {modeloNo === "390" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-bg-60 to-bg-70 rounded-lg p-4 border border-bd-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-fg-60 mb-1">Annual VAT Payable</p>
                <p className="text-2xl font-bold text-fg-40">{fmt(pick("annual_vat_payable", "net_vat", "vat_payable"))}</p>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${cfg.badge}`}>
                <BadgeIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Annual</span>
              </div>
            </div>
          </div>
          <div className="space-y-0">
            <Row label="Total Output VAT" value={fmt(pick("total_output_vat", "output_vat"))} />
            <Row label="Total Input VAT"  value={fmt(pick("total_input_vat", "input_vat"))} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-bd-50 flex items-center justify-between text-xs text-fg-60">
        <span>{calculation.transactions_count ?? calculation.transaction_count ?? 0} transactions</span>
        <div className="flex items-center gap-2">
          {calculation.calculated_at && (
            <span>Calculated {new Date(calculation.calculated_at).toLocaleDateString("es-ES")}</span>
          )}
          {onStartFiling && (
            <Button type="button" variant="primary" size="sm" onClick={onStartFiling} disabled={startingFiling}>
              {startingFiling ? "Creating…" : "Start filing"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeloCalculationCard;
