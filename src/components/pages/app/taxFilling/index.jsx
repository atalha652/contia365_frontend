import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, TrendingUp, Calculator, RefreshCw } from "lucide-react";
import MonthTabs from "./MonthTabs";
import ModeloCalculationCard from "./ModeloCalculationCard";
import { listUserLedgers } from "../../../../api/apiFunction/ledgerServices";
import {
  extractModeloNosFromLedgers,
  calculateAllTaxes,
  getTaxReports,
  ANNUAL_MODELOS,
} from "../../../../api/apiFunction/taxCalculationServices";

const MODELO_LABELS = {
  "115": "Modelo 115 – IRPF Rent Withholding",
  "130": "Modelo 130 – IRPF Quarterly Payment",
  "190": "Modelo 190 – IRPF Annual Summary",
  "111": "Modelo 111 – IRPF Withholding (Payroll)",
  "303": "Modelo 303 – VAT Declaration",
  "390": "Modelo 390 – VAT Annual Summary",
};

const SEMESTERS = [
  { id: 1, label: "Q1", fullLabel: "1st Quarter", months: "Jan - Mar", color: "from-blue-500 to-cyan-500" },
  { id: 2, label: "Q2", fullLabel: "2nd Quarter", months: "Apr - Jun", color: "from-green-500 to-emerald-500" },
  { id: 3, label: "Q3", fullLabel: "3rd Quarter", months: "Jul - Sep", color: "from-orange-500 to-amber-500" },
  { id: 4, label: "Q4", fullLabel: "4th Quarter", months: "Oct - Dec", color: "from-purple-500 to-pink-500" },
];

const TaxFiling = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);
  const userId = user?.id || user?._id || user?.user_id || user?.uid;

  const years = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const startYear = u?.created_at ? new Date(u.created_at).getFullYear() : new Date().getFullYear();
      const currentYear = new Date().getFullYear();
      const result = [];
      for (let y = startYear; y <= currentYear; y++) result.push(y);
      return result;
    } catch {
      return [new Date().getFullYear()];
    }
  }, []);

  const [selectedYear, setSelectedYear] = useState(() => {
    const p = searchParams.get("year");
    return p ? parseInt(p) : new Date().getFullYear();
  });

  const [selectedSemester, setSelectedSemester] = useState(() => {
    const p = searchParams.get("semester");
    if (p) return p === "annual" ? "annual" : parseInt(p);
    return Math.floor(new Date().getMonth() / 3) + 1;
  });

  useEffect(() => {
    setSearchParams({ year: selectedYear.toString(), semester: selectedSemester.toString() });
  }, [selectedYear, selectedSemester, setSearchParams]);

  // ── Ledger data & modelo extraction ────────────────────────────────────────
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgersLoading, setLedgersLoading] = useState(true);
  const [modeloNos, setModeloNos] = useState([]);
  const [modeloIdMap, setModeloIdMap] = useState({});

  useEffect(() => {
    if (!userId) return;
    setLedgersLoading(true);
    listUserLedgers({ user_id: userId })
      .then(({ entries }) => {
        setLedgerEntries(entries);
        const { modeloNos: nos, modeloIdMap: idMap } = extractModeloNosFromLedgers(entries);
        setModeloNos(nos);
        setModeloIdMap(idMap);
      })
      .catch(() => {})
      .finally(() => setLedgersLoading(false));
  }, [userId]);

  // ── Saved reports ───────────────────────────────────────────────────────────
  const [savedReports, setSavedReports] = useState([]);

  const loadReports = useCallback(() => {
    getTaxReports().then(setSavedReports).catch(() => {});
  }, []);

  useEffect(() => { loadReports(); }, [loadReports, selectedYear]);

  // Helper: find a saved report for a given modelo + period
  const getSavedReport = useCallback((modeloNo, quarter) => {
    return savedReports.find((r) => {
      const matchModelo = String(r?.modelo ?? r?.modelo_no ?? "") === String(modeloNo);
      const matchYear = Number(r?.year) === selectedYear;
      if (quarter === null) return matchModelo && matchYear; // annual
      return matchModelo && matchYear && (String(r?.quarter) === `Q${quarter}` || Number(r?.quarter) === quarter);
    }) ?? null;
  }, [savedReports, selectedYear]);

  // ── Calculation results cache: key = "year:quarter" ────────────────────────
  const calcCache = useRef({});
  const [calcResults, setCalcResults] = useState(null); // current view results
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState(null);

  const cacheKey = selectedSemester === "annual"
    ? `${selectedYear}:annual`
    : `${selectedYear}:${selectedSemester}`;

  // When view changes, restore from cache if available
  useEffect(() => {
    setCalcResults(calcCache.current[cacheKey] ?? null);
    setCalcError(null);
  }, [cacheKey]);

  const quarterParam = selectedSemester === "annual" ? null : selectedSemester;

  const hasClassifiedLedgers = modeloNos.length > 0;

  const handleCalculate = async () => {
    if (!hasClassifiedLedgers) return;
    setCalculating(true);
    setCalcError(null);
    try {
      const results = await calculateAllTaxes({
        modeloNos,
        modeloIdMap,
        year: selectedYear,
        quarter: quarterParam,
      });
      calcCache.current[cacheKey] = results;
      setCalcResults(results);
    } catch (err) {
      setCalcError("Calculation failed. Please try again.");
    } finally {
      setCalculating(false);
    }
  };

  // Modelos relevant to the current view
  const visibleModelos = useMemo(() => {
    return modeloNos.filter((no) =>
      selectedSemester === "annual" ? ANNUAL_MODELOS.has(no) : !ANNUAL_MODELOS.has(no)
    );
  }, [modeloNos, selectedSemester]);

  const currentSemester = SEMESTERS.find((s) => s.id === selectedSemester);

  return (
    <div className="flex-1 bg-bg-70 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-8 pb-6 border-b border-bd-50 bg-gradient-to-r from-bg-60 to-bg-70">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-ac-02 to-blue-600 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-fg-40 tracking-tight">Tax Filing & Compliance</h1>
                  <p className="text-sm text-fg-60 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Quarterly tax filings and compliance management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 bg-bg-50 border border-bd-50 rounded-lg text-sm font-medium text-fg-40 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent"
                >
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                {selectedSemester === "annual" ? (
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-bg-50 rounded-lg border border-bd-50 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" />
                    <span className="text-sm font-medium text-fg-40">Annual Quarter View</span>
                  </div>
                ) : currentSemester && (
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-bg-50 rounded-lg border border-bd-50 shadow-sm">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentSemester.color}`} />
                    <span className="text-sm font-medium text-fg-40">{currentSemester.fullLabel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-6" style={{ minHeight: 420 }}>
              {/* Quarter sidebar */}
              <div className="flex flex-col gap-3 min-w-[220px] flex-shrink-0">
                <div className="text-xs font-semibold text-fg-60 uppercase tracking-wider mb-1 px-2">Quarters</div>

                {/* Annual tab */}
                <button
                  onClick={() => setSelectedSemester("annual")}
                  className={`group relative px-5 py-4 rounded-xl text-left transition-all duration-300 border-2 overflow-hidden
                    ${selectedSemester === "annual"
                      ? "border-ac-02 bg-gradient-to-br from-ac-02/10 to-blue-500/5 shadow-lg scale-105"
                      : "border-bd-50 bg-bg-60 hover:border-ac-02/50 hover:bg-bg-50 hover:shadow-md"}`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 transition-all duration-300 ${selectedSemester === "annual" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm transition-all duration-300
                      ${selectedSemester === "annual" ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md" : "bg-bg-50 text-fg-60"}`}>
                      ALL
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold transition-colors ${selectedSemester === "annual" ? "text-fg-40" : "text-fg-60 group-hover:text-fg-40"}`}>Annual Quarter</div>
                      <div className="text-xs text-fg-60 mt-0.5">All Quarters</div>
                    </div>
                  </div>
                </button>

                {SEMESTERS.map((semester) => (
                  <button
                    key={semester.id}
                    onClick={() => setSelectedSemester(semester.id)}
                    className={`group relative px-5 py-4 rounded-xl text-left transition-all duration-300 border-2 overflow-hidden
                      ${selectedSemester === semester.id
                        ? "border-ac-02 bg-gradient-to-br from-ac-02/10 to-blue-500/5 shadow-lg scale-105"
                        : "border-bd-50 bg-bg-60 hover:border-ac-02/50 hover:bg-bg-50 hover:shadow-md"}`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${semester.color} transition-all duration-300 ${selectedSemester === semester.id ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg transition-all duration-300
                        ${selectedSemester === semester.id ? `bg-gradient-to-br ${semester.color} text-white shadow-md` : "bg-bg-50 text-fg-60"}`}>
                        {semester.label}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold transition-colors ${selectedSemester === semester.id ? "text-fg-40" : "text-fg-60 group-hover:text-fg-40"}`}>{semester.fullLabel}</div>
                        <div className="text-xs text-fg-60 mt-0.5">{semester.months}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Month tabs + ledger table */}
              <div className="flex-1 bg-gradient-to-br from-bg-60 to-bg-70 rounded-2xl border border-bd-50 overflow-hidden">
                <div className="h-full p-6">
                  <MonthTabs semester={selectedSemester} year={selectedYear} />
                </div>
              </div>
            </div>

            {/* Tax Calculations section */}
            <div className="mt-6 pb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-fg-40 flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Tax Calculations
                  </h2>
                  <p className="text-sm text-fg-60 mt-1">
                    {selectedSemester === "annual"
                      ? `Annual summaries for ${selectedYear}`
                      : `Automated calculations for Q${selectedSemester} ${selectedYear}`}
                  </p>
                </div>
                <button
                  onClick={handleCalculate}
                  disabled={!hasClassifiedLedgers || calculating || ledgersLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ac-02 to-blue-600 text-white text-sm font-medium rounded-lg shadow hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${calculating ? "animate-spin" : ""}`} />
                  {calculating ? "Calculating…" : "Calculate Taxes"}
                </button>
              </div>

              {!hasClassifiedLedgers && !ledgersLoading && (
                <div className="bg-bg-50 border border-bd-50 rounded-xl p-6 text-sm text-fg-60">
                  No tax-classified ledger entries found. Upload and classify invoices first.
                </div>
              )}

              {calcError && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
                  {calcError}
                </div>
              )}

              {visibleModelos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visibleModelos.map((modeloNo) => {
                    const liveResult = calcResults?.[modeloNo] ?? null;
                    const savedReport = getSavedReport(modeloNo, quarterParam);
                    return (
                      <ModeloCalculationCard
                        key={modeloNo}
                        modeloNo={modeloNo}
                        title={MODELO_LABELS[modeloNo] || `Modelo ${modeloNo}`}
                        liveResult={liveResult}
                        savedReport={savedReport}
                        onReportStatusChange={loadReports}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxFiling;
