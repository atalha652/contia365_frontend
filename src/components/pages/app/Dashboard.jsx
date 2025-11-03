// Dashboard page that loads real backend data and shows cards + recent
import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, DollarSign, Wallet } from "lucide-react";
// Import services to fetch dashboard stats and summary
import { getDashboardStats, getDashboardSummary } from "../../../api/apiFunction/dashboardServices";

const Dashboard = () => {
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

  // Simple English: Fetch summary and stats when user id is available
  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        setIsLoading(true);
        setError("");
        const [sum, st] = await Promise.all([
          getDashboardSummary({ userId }),
          getDashboardStats({ userId })
        ]);
        setSummary(sum || {});
        setStats(st || {});
      } catch (err) {
        const message = err?.response?.data?.detail || err.message || "Failed to load dashboard";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userId]);

  // Derived numbers for cards using backend response
  const totalVouchers = Number(summary?.total_vouchers || 0);
  const pendingApproval = Number(summary?.pending_approval || 0);
  const approvedToday = Number(summary?.approved_today || 0);
  const ocrInProgress = Number(summary?.ocr_in_progress || 0);
  const recentCount = Array.isArray(stats?.recent_activity) ? stats.recent_activity.length : 0;

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
        </div>

        {/* Error banner for dashboard loading */}
        {error && (
          <div className="mb-3">
            <div className="text-sm text-fg-60 bg-bg-50 border border-bd-50 rounded-xl p-3">{error}</div>
          </div>
        )}

        {/* Recent Activity List from backend stats */}
        <div className="py-4">
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <h3 className="text-base font-semibold text-fg-50 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-fg-60 text-sm">Loading activity...</p>
              ) : Array.isArray(stats?.recent_activity) && stats.recent_activity.length > 0 ? (
                stats.recent_activity.map((v) => (
                  <div key={v._id} className="text-sm text-fg-60 border-l-2 border-pr-40 pl-3 py-1">
                    <span className="font-medium text-fg-40 mr-2">{v.title || "Voucher"}</span>
                    <span className="mr-2">Status: {String(v.status || "-").toUpperCase()}</span>
                    <span className="mr-2">OCR: {String(v.OCR || "-").toUpperCase()}</span>
                    <span className="mr-2">Type: {String(v.transaction_type || "-").toUpperCase()}</span>
                    <span className="text-fg-60">{new Date(v.created_at).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-fg-60 text-sm">No activity yet. Use Vouchers to get started.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;