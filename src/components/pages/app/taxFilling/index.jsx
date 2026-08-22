import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, TrendingUp, Calculator, Check, X } from "lucide-react";
import MonthTabs from "./MonthTabs";
import { Button } from "../../../ui";
import { listTaxFilings, getFilingStatus } from "../../../../api/apiFunction/taxFilingServices";

const SEMESTERS = [
  { id: 1, label: "Q1", fullLabel: "1st Quarter", months: "Jan - Mar", color: "from-blue-500 to-cyan-500" },
  { id: 2, label: "Q2", fullLabel: "2nd Quarter", months: "Apr - Jun", color: "from-green-500 to-emerald-500" },
  { id: 3, label: "Q3", fullLabel: "3rd Quarter", months: "Jul - Sep", color: "from-orange-500 to-amber-500" },
  { id: 4, label: "Q4", fullLabel: "4th Quarter", months: "Oct - Dec", color: "from-purple-500 to-pink-500" },
];

const TaxFiling = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [filings, setFilings] = useState([]);
  const [filingsLoading, setFilingsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setFilingsLoading(true);
    listTaxFilings({ year: selectedYear })
      .then((data) => {
        if (!cancelled) setFilings(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setFilings([]);
      })
      .finally(() => {
        if (!cancelled) setFilingsLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedYear]);

  const submittedStatuses = new Set(["SUBMITTED", "ACCEPTED"]);

  const getFilingQuarter = (filing) => {
    const raw = filing?.quarter ?? filing?.current_period ?? "";
    const text = String(raw).toUpperCase();
    if (!text || text === "ANNUAL" || text === "ALL") return "annual";
    const match = text.match(/Q?\s*([1-4])/);
    return match ? Number(match[1]) : "annual";
  };

  const isPeriodSubmitted = (period) =>
    filings.some((filing) => {
      const status = getFilingStatus(filing);
      if (!submittedStatuses.has(status)) return false;
      return getFilingQuarter(filing) === period;
    });

  useEffect(() => {
    setSearchParams({ year: selectedYear.toString(), semester: selectedSemester.toString() });
  }, [selectedYear, selectedSemester, setSearchParams]);

  const currentSemester = SEMESTERS.find((s) => s.id === selectedSemester);

  const openTaxCalculations = () => {
    navigate(`/app/tax-filings/calculate?year=${selectedYear}&semester=${selectedSemester}`);
  };

  return (
    <div className="flex-1 bg-bg-70 overflow-hidden">
      <div className="h-full flex flex-col">
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
                <Button type="button" variant="primary" onClick={openTaxCalculations}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Tax
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {filingsLoading ? (
              <div className="flex gap-6" style={{ minHeight: 420 }}>
                <div className="flex flex-col gap-3 min-w-[220px] flex-shrink-0">
                  <div className="h-3 w-20 bg-bg-40 rounded animate-pulse mb-1 px-2" />
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="px-5 py-4 rounded-xl border-2 border-bd-50 bg-bg-60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-40 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-24 bg-bg-40 rounded animate-pulse" />
                          <div className="h-2 w-16 bg-bg-40 rounded animate-pulse" />
                        </div>
                        <div className="w-6 h-6 rounded-full bg-bg-40 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-gradient-to-br from-bg-60 to-bg-70 rounded-2xl border border-bd-50 overflow-hidden">
                  <div className="h-full p-6 space-y-6">
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 w-24 bg-bg-40 rounded-lg animate-pulse" />
                      ))}
                    </div>
                    <div className="h-24 bg-bg-50 border border-bd-50 rounded-xl animate-pulse" />
                    <div className="space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-10 bg-bg-40 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            <div className="flex gap-6" style={{ minHeight: 420 }}>
              <div className="flex flex-col gap-3 min-w-[220px] flex-shrink-0">
                <div className="text-xs font-semibold text-fg-60 uppercase tracking-wider mb-1 px-2">Quarters</div>

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
                    {isPeriodSubmitted("annual") ? (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/15 text-green-600" title="Submitted">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/15 text-red-500" title="Not submitted">
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </span>
                    )}
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
                      {isPeriodSubmitted(semester.id) ? (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/15 text-green-600" title="Submitted">
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/15 text-red-500" title="Not submitted">
                          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex-1 bg-gradient-to-br from-bg-60 to-bg-70 rounded-2xl border border-bd-50 overflow-hidden">
                <div className="h-full p-6">
                  <MonthTabs semester={selectedSemester} year={selectedYear} />
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxFiling;
