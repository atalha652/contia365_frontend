// Dashboard page that loads real backend data and shows cards + recent
import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, CheckCircle2, DollarSign, Loader2, Wallet } from "lucide-react";
import { toast } from "react-toastify";
// Import services to fetch dashboard stats and summary
import {
  completeTaxObligation,
  getDashboardStats,
  getDashboardSummary,
  getTaxDashboardDeadline,
} from "../../../api/apiFunction/dashboardServices";
import { Button } from "../../ui";
import MonthTabs from "./taxFilling/MonthTabs";
import VATSummaryWidget from "./dashboard/VATSummaryWidget";
import IRPFSummaryWidget from "./dashboard/IRPFSummaryWidget";
import ChainIntegrityWidget from "./dashboard/ChainIntegrityWidget";

const Dashboard = () => {
  const { currentYear, currentQuarterId, currentMonthStart, currentMonthEnd, currentQuarterStart, currentQuarterEnd } = useMemo(() => {
    const now = new Date();
    const monthIndex = now.getMonth(); // 0-11
    const quarterId = Math.floor(monthIndex / 3) + 1; // 1-4
    
    // Current month dates
    const monthStart = new Date(now.getFullYear(), monthIndex, 1);
    const monthEnd = new Date(now.getFullYear(), monthIndex + 1, 0);
    
    // Current quarter dates
    const quarterStartMonth = (quarterId - 1) * 3;
    const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
    const quarterEnd = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
    
    return {
      currentYear: now.getFullYear(),
      currentQuarterId: quarterId,
      currentMonthStart: monthStart.toISOString().split('T')[0],
      currentMonthEnd: monthEnd.toISOString().split('T')[0],
      currentQuarterStart: quarterStart.toISOString().split('T')[0],
      currentQuarterEnd: quarterEnd.toISOString().split('T')[0],
    };
  }, []);

  // Helper: Format dates in a readable short format
  const formatDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    const mon = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    const time = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: true }).format(d);
    return `${mon} ${day}, ${year} ${time}`;
  };

  // Helper: Decide badge color by voucher status in simple English
  const statusColor = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'approved') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (s === 'awaiting_approval' || s === 'pending') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    if (s === 'rejected' || s === 'failed') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-fg-20 text-fg-70';
  };

  // Get current user id from localStorage
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);
  const userId = user?.id || user?._id || user?.user_id || user?.uid;

  // Manage loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // Store summary and detailed stats from backend
  const [summary, setSummary] = useState({});
  const [stats, setStats] = useState({});
  const [taxDeadline, setTaxDeadline] = useState(null);
  const [fiscalYear, setFiscalYear] = useState(currentYear);
  const [completingObligation, setCompletingObligation] = useState(null);

  // Simple English: Fetch summary and stats when user id is available
  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        setIsLoading(true);
        setError("");
        const [sumRes, stRes, taxRes] = await Promise.allSettled([
          getDashboardSummary({ userId }),
          getDashboardStats({ userId }),
          getTaxDashboardDeadline({ year: fiscalYear })
        ]);

        if (sumRes.status === "fulfilled") setSummary(sumRes.value || {});
        else setSummary({});

        if (stRes.status === "fulfilled") setStats(stRes.value || {});
        else setStats({});

        if (taxRes.status === "fulfilled") setTaxDeadline(taxRes.value || null);
        else setTaxDeadline(null);
      } catch (err) {
        const message = err?.response?.data?.detail || err.message || "Failed to load dashboard";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userId, fiscalYear]);

  const obligationsByStatus = useMemo(() => {
    const groups = { upcoming: [], due: [], overdue: [], completed: [] };
    (taxDeadline?.deadlines || []).forEach((obligation) => {
      const status = String(obligation?.status || "upcoming").toLowerCase();
      if (groups[status]) groups[status].push(obligation);
    });
    return groups;
  }, [taxDeadline]);

  const handleCompleteObligation = async (obligation) => {
    const key = `${obligation.modelo}-${obligation.year}-${obligation.quarter || "annual"}`;
    const isAnnual = ["ANUAL", "ANNUAL"].includes(
      String(obligation.periodicity || "").toUpperCase()
    );
    try {
      setCompletingObligation(key);
      await completeTaxObligation({
        modelo: obligation.modelo,
        year: obligation.year,
        quarter: isAnnual ? undefined : obligation.quarter || undefined,
      });
      const refreshed = await getTaxDashboardDeadline({ year: fiscalYear });
      setTaxDeadline(refreshed);
      toast.success(`Modelo ${obligation.modelo} marked completed`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to complete obligation");
    } finally {
      setCompletingObligation(null);
    }
  };

  // Derived numbers for cards using backend response
  const totalVouchers = Number(summary?.total_vouchers || 0);
  const pendingApproval = Number(summary?.pending_approval || 0);
  const approvedToday = Number(summary?.approved_today || 0);
  const ocrInProgress = Number(summary?.ocr_in_progress || 0);
  const recentCount = Array.isArray(stats?.recent_activity) ? stats.recent_activity.length : 0;
  const obligationStatusConfig = {
    upcoming: {
      label: "Upcoming",
      classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    },
    due: {
      label: "Due",
      classes: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    },
    overdue: {
      label: "Overdue",
      classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    },
    completed: {
      label: "Completed",
      classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    },
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Dashboard Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-fg-40">Dashboard</h1>
              <p className="text-sm text-fg-60 mt-1">Overview of your finances</p>
            </div>
          </div>
        </div>

        {/* Stats Cards from backend summary */}
        <div className="py-4">
          {isLoading ? (
            // Simple English: Show skeletons for the main cards while loading
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-bg-50 border border-bd-50 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-bg-40 rounded mb-2 animate-pulse" />
                      <div className="h-6 w-20 bg-bg-40 rounded mb-3 animate-pulse" />
                      <div className="h-4 w-28 bg-bg-40 rounded animate-pulse" />
                    </div>
                    <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center">
                      <div className="w-5 h-5 bg-bg-40 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-fg-60 mb-1">Total Vouchers</p>
                    <p className="text-2xl font-bold text-fg-40 mb-2">{totalVouchers}</p>
                    <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {pendingApproval} pending approval
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-fg-50" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-fg-60 mb-1">Approved Today</p>
                    <p className="text-2xl font-bold text-fg-40 mb-2">{approvedToday}</p>
                    <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      New approvals
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-fg-50" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-fg-60 mb-1">OCR In Progress</p>
                    <p className="text-2xl font-bold text-fg-40 mb-2">{ocrInProgress}</p>
                    <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Processing OCR jobs
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-fg-50" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-fg-60 mb-1">Recent Activity</p>
                    <p className="text-2xl font-bold text-fg-40 mb-2">{recentCount}</p>
                    <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      Last 5 entries
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-fg-50" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error banner for dashboard loading */}
        {error && (
          <div className="mb-3">
            <div className="text-sm text-fg-60 bg-bg-50 border border-bd-50 rounded-xl p-3">{error}</div>
          </div>
        )}

        {/* Tax Summary Widgets */}
        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VATSummaryWidget
              startDate={currentMonthStart}
              endDate={currentMonthEnd}
              userId={userId}
              title="VAT Summary (Current Month)"
            />
            <IRPFSummaryWidget
              startDate={currentQuarterStart}
              endDate={currentQuarterEnd}
              quarter={currentQuarterId}
              userId={userId}
              title="IRPF Summary (Current Quarter)"
            />
          </div>
        </div>

        {/* Invoice Chain Integrity */}
        <div className="pb-2">
          <ChainIntegrityWidget />
        </div>

        {/* Recent Activity redesign: single-row sub cards with one badge */}
        <div className="py-4">
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <h3 className="text-base font-semibold text-fg-50 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {isLoading ? (
                // Simple English: Show 4 loading sub-card placeholders
                [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-bg-60 border border-bd-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bg-40 animate-pulse" />
                      <div>
                        <div className="h-3 w-40 bg-bg-40 rounded mb-2 animate-pulse" />
                        <div className="h-2 w-24 bg-bg-40 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-bg-40 rounded animate-pulse" />
                  </div>
                ))
              ) : Array.isArray(stats?.recent_activity) && stats.recent_activity.length > 0 ? (
                stats.recent_activity.map((v) => (
                  // Simple English: Each activity as a full-width sub card in one row
                  <div key={v._id} className="bg-bg-60 border border-bd-50 rounded-lg p-4 flex items-center justify-between">
                    {/* Left: compact type avatar and title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${String(v.transaction_type || '').toLowerCase() === 'credit' ? 'bg-green-900/20 text-green-300' : 'bg-blue-900/20 text-blue-300'}`}>
                        <span className="text-xs font-bold">{String(v.transaction_type || 'D').toUpperCase().startsWith('C') ? 'C' : 'D'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-fg-40 truncate">{v.title || 'Voucher'}</div>
                        <div className="text-xs text-fg-60 truncate">OCR: {String(v.OCR || '-').toUpperCase()} • Type: {String(v.transaction_type || '-').toUpperCase()} • {formatDateTime(v.created_at)}</div>
                      </div>
                    </div>

                    {/* Right: single status badge only */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs whitespace-nowrap ${statusColor(v.status)}`}>
                      {String(v.status || '-').toUpperCase()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-fg-60 text-sm">No activity yet. Use Expenses to get started.</p>
              )}
            </div>
          </div>
        </div>

        {/* Fiscal obligations: status calendar + grouped list */}
        <div className="py-4 pb-8">
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold text-fg-50">Fiscal Calendar</h3>
                {taxDeadline?.full_name && (
                  <p className="text-sm text-fg-60 mt-1">{taxDeadline.full_name} · NIF {taxDeadline.nif_nie}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={fiscalYear}
                  onChange={(event) => setFiscalYear(Number(event.target.value))}
                  className="px-3 py-2 bg-bg-70 border border-bd-50 rounded-lg text-sm font-medium text-fg-40 focus:outline-none focus:ring-2 focus:ring-ac-02"
                >
                  {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-fg-50" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {Object.entries(obligationStatusConfig).map(([status, config]) => (
                <div key={status} className="bg-bg-60 border border-bd-50 rounded-xl p-3">
                  <p className="text-xs text-fg-60">{config.label}</p>
                  <p className="text-xl font-bold text-fg-40 mt-1">
                    {Number(taxDeadline?.counts?.[status] ?? obligationsByStatus[status].length)}
                  </p>
                </div>
              ))}
            </div>

            {/* Calendar */}
            <div className="bg-gradient-to-br from-bg-60 to-bg-70 rounded-2xl border border-bd-50 overflow-hidden mb-4">
              <div className="p-6">
                <MonthTabs
                  semester="annual"
                  year={fiscalYear}
                  disableUrlSync={true}
                  defaultQuarterId={fiscalYear === currentYear ? currentQuarterId : 1}
                  contentMode="dates"
                  deadlines={Array.isArray(taxDeadline?.deadlines) ? taxDeadline.deadlines : []}
                />
              </div>
            </div>

            {/* Obligations grouped by backend status */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-bg-60 border border-bd-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-40 animate-pulse" />
                      <div>
                        <div className="h-3 w-48 bg-bg-40 rounded mb-2 animate-pulse" />
                        <div className="h-2 w-32 bg-bg-40 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-bg-40 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : Number(taxDeadline?.total || 0) > 0 ? (
              <div className="space-y-5">
                {Object.entries(obligationStatusConfig).map(([status, config]) => {
                  const obligations = obligationsByStatus[status];
                  if (!obligations.length) return null;
                  return (
                    <section key={status}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.classes}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-fg-60">{obligations.length}</span>
                      </div>
                      <div className="space-y-3">
                        {obligations.map((obligation) => {
                          const deadlineDate = obligation.deadline_date
                            ? new Date(...obligation.deadline_date.split("-").map(Number).map((value, index) => index === 1 ? value - 1 : value))
                                .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                            : "-";
                          const obligationKey = `${obligation.modelo}-${obligation.year}-${obligation.quarter || "annual"}`;
                          return (
                            <div key={obligationKey} className="bg-bg-60 border border-bd-50 rounded-lg p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-bg-50 border border-bd-50 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-fg-40">{obligation.modelo}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-fg-40 truncate">{obligation.description}</p>
                                  <p className="text-xs text-fg-60">
                                    {obligation.periodicity} · {obligation.current_period} · Due {deadlineDate}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.classes}`}>
                                  {config.label}
                                </span>
                                {status !== "completed" && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleCompleteObligation(obligation)}
                                    disabled={completingObligation === obligationKey}
                                  >
                                    {completingObligation === obligationKey
                                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                                    Mark completed
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              !isLoading && <p className="text-fg-60 text-sm">No fiscal obligations found for {fiscalYear}.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;