import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, TrendingUp, Calculator, BookOpen } from "lucide-react";
import MonthTabs from "./MonthTabs";
import TaxSummaryPanel from "./TaxSummaryPanel";
import {
  calculateAllTaxes,
  getTaxReports,
  updateTaxReportStatus,
  clearTaxCache,
  extractModeloNosFromLedgers,
} from "../../../../api/apiFunction/taxEngineServices";
import { listUserLedgers } from "../../../../api/apiFunction/ledgerServices";

const TaxFiling = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Build year list from user's created_at up to the current year
  const years = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const startYear = user?.created_at
        ? new Date(user.created_at).getFullYear()
        : new Date().getFullYear();
      const currentYear = new Date().getFullYear();
      const result = [];
      for (let y = startYear; y <= currentYear; y++) result.push(y);
      return result;
    } catch {
      return [new Date().getFullYear()];
    }
  }, []);

  const semesters = [
    { id: 1, label: "Q1", fullLabel: "1st Quarter", months: "Jan - Mar", color: "from-blue-500 to-cyan-500" },
    { id: 2, label: "Q2", fullLabel: "2nd Quarter", months: "Apr - Jun", color: "from-green-500 to-emerald-500" },
    { id: 3, label: "Q3", fullLabel: "3rd Quarter", months: "Jul - Sep", color: "from-orange-500 to-amber-500" },
    { id: 4, label: "Q4", fullLabel: "4th Quarter", months: "Oct - Dec", color: "from-purple-500 to-pink-500" },
  ];

  // Initialize selected year from URL or default to current year
  const [selectedYear, setSelectedYear] = useState(() => {
    const yearParam = searchParams.get("year");
    return yearParam ? parseInt(yearParam) : new Date().getFullYear();
  });

  // Initialize selected semester from URL or default to current quarter
  const [selectedSemester, setSelectedSemester] = useState(() => {
    const semesterParam = searchParams.get("semester");
    if (semesterParam) return semesterParam === 'annual' ? 'annual' : parseInt(semesterParam);
    // Default to current quarter based on today's month
    return Math.floor(new Date().getMonth() / 3) + 1;
  });

  // Update URL when year or semester changes
  useEffect(() => {
    setSearchParams({ year: selectedYear.toString(), semester: selectedSemester.toString() });
  }, [selectedYear, selectedSemester, setSearchParams]);

  const handleSemesterClick = (semesterId) => {
    setSelectedSemester(semesterId);
  };

  const currentSemester = semesters.find(s => s.id === selectedSemester);

  // ── Tab state ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("tax"); // "tax" | "ledger"

  // ── Tax Engine state ────────────────────────────────────────────────────────
  const [liveResult, setLiveResult]     = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [taxLoading, setTaxLoading]     = useState(false);
  const [taxError, setTaxError]         = useState("");

  // ── Ledger state — fetched once to derive which modelos are active ──────────
  const [allLedgerEntries, setAllLedgerEntries] = useState([]);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);
  const userId = user?.id || user?._id || user?.user_id || user?.uid;

  // Fetch all ledger entries for this user once on mount.
  // MonthDataTable fetches its own copy — this is a lightweight parallel fetch
  // used only to derive which modelo numbers are present in the data.
  useEffect(() => {
    if (!userId) return;
    listUserLedgers({ user_id: userId })
      .then(({ entries }) => setAllLedgerEntries(Array.isArray(entries) ? entries : []))
      .catch(() => {});
  }, [userId]);

  // Derive the set of modelo numbers AND their ObjectIDs from ledger tax_classification.
  // modeloNos gates which APIs to call. modeloIdsMap provides ObjectIDs for 115/111/390/190.
  const { modeloNos: activeModeloNos, modeloIdsMap: ledgerModeloIdsMap } = useMemo(
    () => extractModeloNosFromLedgers(allLedgerEntries),
    [allLedgerEntries]
  );

  // Map numeric quarter id → API quarter string
  const quarterLabel = useMemo(() => {
    const map = { 1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4" };
    return typeof selectedSemester === "number" ? map[selectedSemester] : null;
  }, [selectedSemester]);

  // Fetch saved reports — called on mount, year change, and after status updates
  const fetchReports = useCallback(async () => {
    try {
      const data = await getTaxReports();
      const list = Array.isArray(data) ? data : (data?.reports ?? []);
      setSavedReports(list);
    } catch {
      // non-blocking — reports table degrades gracefully
    }
  }, []);

  useEffect(() => { fetchReports(); }, [selectedYear, fetchReports]);

  // Clear live result when period changes — prevents stale data showing
  // for a different quarter. Cache in the service layer is preserved so
  // navigating back doesn't re-hit the network.
  useEffect(() => {
    setLiveResult(null);
    setTaxError("");
  }, [selectedYear, selectedSemester]);

  const handleCalculateTaxes = async () => {
    try {
      setTaxLoading(true);
      setTaxError("");
      const result = await calculateAllTaxes({
        year: selectedYear,
        quarter: quarterLabel,
        activeModeloNos,
        modelo_ids_map: ledgerModeloIdsMap,  // ObjectIDs sourced directly from ledger entries
        force: true,
      });
      setLiveResult(result);
      clearTaxCache(selectedYear, quarterLabel);
      fetchReports();
    } catch (err) {
      setTaxError(err?.response?.data?.detail || err?.message || "Tax calculation failed");
    } finally {
      setTaxLoading(false);
    }
  };
  const handleStatusUpdate = async ({ report_id, status }) => {
    await updateTaxReportStatus({ report_id, status });
    fetchReports();
  };

  return (
    <div className="flex-1 bg-bg-70 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Enhanced Page Header with gradient accent */}
        <div className="flex-shrink-0 px-6 pt-8 pb-6 border-b border-bd-50 bg-gradient-to-r from-bg-60 to-bg-70">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-ac-02 to-blue-600 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-fg-40 tracking-tight">
                    Tax Filing & Compliance
                  </h1>
                  <p className="text-sm text-fg-60 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Quarterly tax filings and compliance management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Year Selector */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 bg-bg-50 border border-bd-50 rounded-lg text-sm font-medium text-fg-40 focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {selectedSemester === 'annual' ? (
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-bg-50 rounded-lg border border-bd-50 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                    <span className="text-sm font-medium text-fg-40">
                      Annual Quarter View
                    </span>
                  </div>
                ) : currentSemester && (
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-bg-50 rounded-lg border border-bd-50 shadow-sm">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentSemester.color}`}></div>
                    <span className="text-sm font-medium text-fg-40">
                      {currentSemester.fullLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area with Vertical Tabs */}
        <div className="flex-1 px-6 py-6 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full">
            <div className="flex gap-6 h-full">
              {/* Enhanced Vertical Semester Tabs */}
              <div className="flex flex-col gap-3 min-w-[220px] flex-shrink-0">
                <div className="text-xs font-semibold text-fg-60 uppercase tracking-wider mb-1 px-2">
                  Quarters
                </div>
                
                {/* Annual Quarter Tab */}
                <button
                  onClick={() => handleSemesterClick('annual')}
                  className={`
                    group relative px-5 py-4 rounded-xl text-left transition-all duration-300
                    border-2 overflow-hidden
                    ${selectedSemester === 'annual'
                      ? "border-ac-02 bg-gradient-to-br from-ac-02/10 to-blue-500/5 shadow-lg scale-105"
                      : "border-bd-50 bg-bg-60 hover:border-ac-02/50 hover:bg-bg-50 hover:shadow-md hover:scale-102"
                    }
                  `}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 transition-all duration-300 ${selectedSemester === 'annual' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm
                      transition-all duration-300
                      ${selectedSemester === 'annual'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'bg-bg-50 text-fg-60 group-hover:bg-bg-40'
                      }
                    `}>
                      ALL
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold transition-colors ${selectedSemester === 'annual' ? 'text-fg-40' : 'text-fg-60 group-hover:text-fg-40'}`}>
                        Annual Quarter
                      </div>
                      <div className="text-xs text-fg-60 mt-0.5">
                        All Quarters
                      </div>
                    </div>
                  </div>
                </button>

                {semesters.map((semester) => (
                  <button
                    key={semester.id}
                    onClick={() => handleSemesterClick(semester.id)}
                    className={`
                      group relative px-5 py-4 rounded-xl text-left transition-all duration-300
                      border-2 overflow-hidden
                      ${selectedSemester === semester.id
                        ? "border-ac-02 bg-gradient-to-br from-ac-02/10 to-blue-500/5 shadow-lg scale-105"
                        : "border-bd-50 bg-bg-60 hover:border-ac-02/50 hover:bg-bg-50 hover:shadow-md hover:scale-102"
                      }
                    `}
                  >
                    {/* Gradient accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${semester.color} transition-all duration-300 ${selectedSemester === semester.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>

                    <div className="flex items-center gap-3">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg
                        transition-all duration-300
                        ${selectedSemester === semester.id
                          ? `bg-gradient-to-br ${semester.color} text-white shadow-md`
                          : 'bg-bg-50 text-fg-60 group-hover:bg-bg-40'
                        }
                      `}>
                        {semester.label}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold transition-colors ${selectedSemester === semester.id ? 'text-fg-40' : 'text-fg-60 group-hover:text-fg-40'}`}>
                          {semester.fullLabel}
                        </div>
                        <div className="text-xs text-fg-60 mt-0.5">
                          {semester.months}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Right panel — tabbed between Tax Engine and Ledger */}
              <div className="flex-1 bg-gradient-to-br from-bg-60 to-bg-70 rounded-2xl border border-bd-50 overflow-hidden">
                <div className="h-full flex flex-col">

                  {/* Tab bar */}
                  <div className="flex-shrink-0 flex items-center gap-1 px-4 pt-4 pb-0 border-b border-bd-50">
                    <button
                      onClick={() => setActiveTab("tax")}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg
                        border-b-2 transition-all duration-200
                        ${activeTab === "tax"
                          ? "border-ac-02 text-ac-02 bg-ac-02/5"
                          : "border-transparent text-fg-60 hover:text-fg-40 hover:bg-bg-50"
                        }
                      `}
                    >
                      <Calculator className="w-4 h-4" />
                      Tax Engine
                    </button>
                    <button
                      onClick={() => setActiveTab("ledger")}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg
                        border-b-2 transition-all duration-200
                        ${activeTab === "ledger"
                          ? "border-ac-02 text-ac-02 bg-ac-02/5"
                          : "border-transparent text-fg-60 hover:text-fg-40 hover:bg-bg-50"
                        }
                      `}
                    >
                      <BookOpen className="w-4 h-4" />
                      Ledger View
                    </button>
                  </div>

                  {/* Tab content */}
                  <div className="flex-1 overflow-auto p-6">
                    {activeTab === "tax" && (
                      <TaxSummaryPanel
                        quarter={quarterLabel ?? selectedSemester}
                        year={selectedYear}
                        liveResult={liveResult}
                        savedReports={savedReports}
                        activeModeloNos={activeModeloNos}
                        loading={taxLoading}
                        error={taxError}
                        onCalculate={handleCalculateTaxes}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    )}
                    {activeTab === "ledger" && (
                      <MonthTabs semester={selectedSemester} year={selectedYear} />
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxFiling;
