import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, TrendingUp, Calculator, Check, X, Clock } from "lucide-react";
import MonthTabs from "./MonthTabs";
import { Button } from "../../../ui";
import { listTaxFilings, getFilingStatus } from "../../../../api/apiFunction/taxFilingServices";
import { getMyFiscalProfile } from "../../../../api/apiFunction/onboardingServices";
import {
  MONTHS,
  filingPeriodQuery,
  isMonthly303,
  monthName,
  parseMonthParam,
  quarterFromMonth,
} from "../../../../utils/taxPeriod";

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
    const month = parseMonthParam(searchParams.get("month"));
    if (p === "annual") return "annual";
    if (month) return quarterFromMonth(month);
    if (p) return parseInt(p);
    return Math.floor(new Date().getMonth() / 3) + 1;
  });
  const [filings, setFilings] = useState([]);
  const [filingsLoading, setFilingsLoading] = useState(true);
  const [fiscalProfile, setFiscalProfile] = useState(null);

  const monthly303 = isMonthly303(fiscalProfile);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const fromUrl = parseMonthParam(searchParams.get("month"));
    if (fromUrl) return fromUrl;
    const sem = searchParams.get("semester");
    const current = new Date().getMonth() + 1;
    if (sem && sem !== "annual") {
      const quarter = parseInt(sem, 10);
      if (quarterFromMonth(current) === quarter) return current;
      if (quarter >= 1 && quarter <= 4) return (quarter - 1) * 3 + 1;
    }
    return current;
  });

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

  useEffect(() => {
    getMyFiscalProfile()
      .then(setFiscalProfile)
      .catch(() => setFiscalProfile(null));
  }, []);

  const submittedStatuses = new Set(["SUBMITTED", "ACCEPTED"]);

  const getFilingQuarter = (filing) => {
    const raw = filing?.quarter ?? filing?.current_period ?? "";
    const text = String(raw).toUpperCase();
    if (!text || text === "ANNUAL" || text === "ALL") return "annual";
    const match = text.match(/Q?\s*([1-4])/);
    return match ? Number(match[1]) : "annual";
  };

  const getFilingMonth = (filing) => {
    const month = Number(filing?.month);
    if (month >= 1 && month <= 12) return month;
    return parseMonthParam(filing?.period_key);
  };

  const isPeriodSubmitted = (period) =>
    filings.some((filing) => {
      const status = getFilingStatus(filing);
      if (!submittedStatuses.has(status)) return false;
      if (monthly303 && period !== "annual") {
        return getFilingMonth(filing) === period && String(filing.modelo) === "303";
      }
      return getFilingQuarter(filing) === period;
    });

  const now = new Date();
  const liveYear = now.getFullYear();
  const liveQuarter = Math.floor(now.getMonth() / 3) + 1;
  const liveMonth = now.getMonth() + 1;

  const isPeriodStarted = (period) => {
    if (selectedYear < liveYear) return true;
    if (selectedYear > liveYear) return false;
    if (period === "annual") return false;
    if (monthly303) return Number(period) <= liveMonth;
    return Number(period) <= liveQuarter;
  };

  const isPeriodRunning = (period) =>
    selectedYear === liveYear
    && period !== "annual"
    && Number(period) === (monthly303 ? liveMonth : liveQuarter);

  const renderPeriodStatus = (period) => {
    if (!isPeriodStarted(period)) return null;
    if (isPeriodSubmitted(period)) {
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/15 text-green-600" title="Submitted">
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
        </span>
      );
    }
    if (isPeriodRunning(period)) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap"
          title="In progress"
        >
          <Clock className="w-3 h-3" strokeWidth={2.5} />
          In progress
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/15 text-red-500" title="Not submitted">
        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
      </span>
    );
  };

  useEffect(() => {
    const params = {
      year: selectedYear.toString(),
      semester: selectedSemester.toString(),
    };
    if (selectedSemester !== "annual") {
      const month = monthly303 ? selectedMonth : parseMonthParam(searchParams.get("month"));
      if (monthly303 && selectedMonth) {
        params.month = monthName(selectedMonth);
      } else if (month) {
        params.month = searchParams.get("month");
      }
    }
    setSearchParams(params);
  }, [selectedYear, selectedSemester, selectedMonth, monthly303, setSearchParams]);

  const currentSemester = SEMESTERS.find((s) => s.id === selectedSemester);
  const currentMonth = MONTHS.find((m) => m.id === selectedMonth);

  const selectMonth = (monthId) => {
    setSelectedMonth(monthId);
    setSelectedSemester(quarterFromMonth(monthId));
  };

  const openTaxCalculations = () => {
    navigate(`/app/tax-filings/calculate${filingPeriodQuery({
      year: selectedYear,
      semester: selectedSemester,
      month: monthly303 && selectedSemester !== "annual" ? selectedMonth : undefined,
    })}`);
  };

  return (
    <div className="flex-1 bg-bg-70 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 px-6 pt-8 pb-6 border-b border-bd-50 bg-gradient-to-r from-bg-60 to-bg-70">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#582dee] rounded-xl shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-fg-40 tracking-tight">Tax Filing & Compliance</h1>
                  <p className="text-sm text-fg-60 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {monthly303
                      ? "Monthly IVA (REDEME) and periodic tax filings"
                      : "Quarterly tax filings and compliance management"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 bg-bg-50 border border-bd-50 rounded-lg text-sm font-medium text-fg-40 focus:outline-none focus:ring-2 focus:ring-[#582dee] focus:border-transparent"
                >
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                {selectedSemester === "annual" ? (
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-bg-50 rounded-lg border border-bd-50 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#582dee]" />
                    <span className="text-sm font-medium text-fg-40">Annual Quarter View</span>
                  </div>
                ) : monthly303 && currentMonth ? (
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-bg-50 rounded-lg border border-bd-50 shadow-sm">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentMonth.color}`} />
                    <span className="text-sm font-medium text-fg-40">{currentMonth.fullLabel}</span>
                  </div>
                ) : currentSemester && (
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-bg-50 rounded-lg border border-bd-50 shadow-sm">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentSemester.color}`} />
                    <span className="text-sm font-medium text-fg-40">{currentSemester.fullLabel}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={openTaxCalculations}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#582dee] hover:bg-[#4622c7] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 shrink-0 whitespace-nowrap"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calculate Tax</span>
                </button>
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
                <div className="text-xs font-semibold text-fg-60 uppercase tracking-wider mb-1 px-2">
                  {monthly303 ? "Months" : "Quarters"}
                </div>

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
                    {renderPeriodStatus("annual")}
                  </div>
                </button>

                {monthly303 ? (
                  MONTHS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectMonth(item.id)}
                      className={`group relative px-5 py-4 rounded-xl text-left transition-all duration-300 border-2 overflow-hidden
                        ${selectedSemester !== "annual" && selectedMonth === item.id
                          ? "border-ac-02 bg-gradient-to-br from-ac-02/10 to-blue-500/5 shadow-lg scale-105"
                          : "border-bd-50 bg-bg-60 hover:border-ac-02/50 hover:bg-bg-50 hover:shadow-md"}`}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color} transition-all duration-300 ${selectedSemester !== "annual" && selectedMonth === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm transition-all duration-300
                          ${selectedSemester !== "annual" && selectedMonth === item.id ? `bg-gradient-to-br ${item.color} text-white shadow-md` : "bg-bg-50 text-fg-60"}`}>
                          {item.label}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-semibold transition-colors ${selectedSemester !== "annual" && selectedMonth === item.id ? "text-fg-40" : "text-fg-60 group-hover:text-fg-40"}`}>{item.fullLabel}</div>
                          <div className="text-xs text-fg-60 mt-0.5">Q{quarterFromMonth(item.id)}</div>
                        </div>
                        {renderPeriodStatus(item.id)}
                      </div>
                    </button>
                  ))
                ) : SEMESTERS.map((semester) => (
                  <button
                    key={semester.id}
                    type="button"
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
                      {renderPeriodStatus(semester.id)}
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
