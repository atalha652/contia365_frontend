import React, { useMemo, useState } from "react";
import { Calculator, AlertCircle, Clock, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Badge, Button } from "../../../ui";
import TaxMetricsCards, { TaxMetricsSkeleton } from "./TaxMetricsCards";
import TaxReportsTable from "./TaxReportsTable";

// ── Deterministic report resolution ──────────────────────────────────────────
// Priority: LIVE calculation → saved report for period → null
// activeModeloNos gates which modelos are shown — only those present in ledgers.
const resolveReport = (liveResult, savedReports, year, quarter, activeModeloNos) => {
  // If ledgers haven't loaded yet (empty set), show nothing — don't fall through to "allow all"
  if (activeModeloNos.size === 0) return null;

  const allowed = (no) => activeModeloNos.has(String(no));

  if (liveResult && Object.values(liveResult).some(Boolean)) {
    return Object.fromEntries(
      Object.entries(liveResult).filter(([k, v]) => {
        const no = k.replace("modelo", "");
        return v && allowed(no);
      })
    );
  }

  if (!savedReports?.length) return null;
  const forPeriod = savedReports.filter(
    (r) => String(r.year) === String(year) &&
           (quarter === "annual" ? true : r.quarter === quarter)
  );
  if (!forPeriod.length) return null;

  const find = (no) => allowed(no)
    ? (forPeriod.find((r) => String(r.modelo) === String(no)) ?? null)
    : null;

  // Annual modelos (390, 190) match any saved report for the year regardless of quarter
  const findAnnual = (no) => {
    if (!allowed(no)) return null;
    return savedReports.find(
      (r) => String(r.year) === String(year) && String(r.modelo) === String(no)
    ) ?? null;
  };

  const result = {
    modelo303: find("303"),
    modelo130: find("130"),
    modelo115: find("115"),
    modelo111: find("111"),
    modelo390: findAnnual("390"),
    modelo190: findAnnual("190"),
  };
  return Object.values(result).some(Boolean) ? result : null;
};

// ── TaxSummaryPanel ───────────────────────────────────────────────────────────
// Thin orchestrator: resolves data source, delegates rendering to sub-components.
// No API calls here — all side effects live in TaxFiling (index.jsx).
const TaxSummaryPanel = ({
  quarter,
  year,
  liveResult,
  savedReports,
  activeModeloNos = new Set(),  // Set<string> from ledger tax_classification
  loading,
  error,
  onCalculate,
  onStatusUpdate,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Single deterministic resolution — no ambiguity
  const resolved = useMemo(
    () => resolveReport(liveResult, savedReports, year, quarter, activeModeloNos),
    [liveResult, savedReports, year, quarter, activeModeloNos]
  );

  const hasResults = !!(resolved && Object.values(resolved).some(Boolean));
  const isAnnual   = quarter === "annual";

  // Reports filtered to current period for the table (show all periods in table)
  const periodReports = useMemo(() => {
    if (!savedReports?.length) return [];
    return savedReports.filter(
      (r) => String(r.year) === String(year) &&
             r.quarter === quarter &&
             (activeModeloNos.size === 0 || activeModeloNos.has(String(r.modelo)))
    );
  }, [savedReports, year, quarter, activeModeloNos]);

  return (
    <div className="flex-shrink-0 mb-4 bg-gradient-to-br from-bg-60 to-bg-70 rounded-2xl border border-bd-50 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-bd-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-ac-02 to-blue-600 rounded-lg shadow">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-fg-40">Tax Engine</span>
            <span className="ml-2 text-xs text-fg-60">
              {isAnnual ? `${year} — All Quarters` : `${year} — ${quarter}`}
            </span>
          </div>
          {hasResults && !loading && (
            <Badge variant={liveResult ? "success" : "info"} size="sm">
              {liveResult ? "Live" : "Saved"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            disabled={loading || activeModeloNos.size === 0}
            onClick={onCalculate}
            title={activeModeloNos.size === 0 ? "No classified ledger entries found" : ""}
          >
            {loading
              ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Calculating…</>
              : <><Calculator className="w-3 h-3 mr-1" />Calculate Taxes</>}
          </Button>
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="p-1.5 rounded-lg text-fg-60 hover:text-fg-40 hover:bg-bg-50 transition-colors"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed
              ? <ChevronDown className="w-4 h-4" />
              : <ChevronUp   className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      {!collapsed && (
        <div className="px-6 py-5 space-y-5">

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-400/30 rounded-xl text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Empty / prompt state */}
          {!loading && !hasResults && !error && (
            <div className="flex items-center gap-3 px-4 py-4 bg-bg-50 rounded-xl border border-bd-50 text-sm text-fg-60">
              <Clock className="w-4 h-4 shrink-0" />
              {activeModeloNos.size === 0
                ? "No tax-classified ledger entries found. Add ledger entries with tax classification to enable calculations."
                : isAnnual
                  ? `Click "Calculate Taxes" to compute annual Modelo 390 & 190 for ${year}.`
                  : `Click "Calculate Taxes" to compute ${[...activeModeloNos].map(n => `Modelo ${n}`).join(", ")} for ${year} ${quarter}.`}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && <TaxMetricsSkeleton />}

          {/* Metric cards — delegated to TaxMetricsCards */}
          {!loading && hasResults && (
            <TaxMetricsCards
              modelo303={resolved.modelo303}
              modelo130={resolved.modelo130}
              modelo115={resolved.modelo115}
              modelo111={resolved.modelo111}
              modelo390={resolved.modelo390}
              modelo190={resolved.modelo190}
            />
          )}

          {/* Reports table — delegated to TaxReportsTable */}
          <TaxReportsTable
            reports={isAnnual ? savedReports : periodReports}
            onStatusUpdate={onStatusUpdate}
          />

        </div>
      )}
    </div>
  );
};

export default TaxSummaryPanel;
