import React from "react";
import { useOutletContext } from "react-router-dom";
import { BarChart3, Calendar, DollarSign, Wallet } from "lucide-react";

const Dashboard = () => {
  const { invoices = [], journalEntries = [] } = useOutletContext() || {};

  const totalVouchers = invoices.length;
  const unpaidAmount = invoices
    .filter((i) => i.status === "pending")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidAmount = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const recentCount = Math.min(journalEntries.length, 5);

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

        {/* Stats Cards (sample design parity) */}
        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-fg-60 mb-1">Total Vouchers</p>
                  <p className="text-2xl font-bold text-fg-40 mb-2">{totalVouchers}</p>
                  <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {invoices.filter((i) => i.status === "pending").length} pending
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
                  <p className="text-xs text-fg-60 mb-1">Unpaid Amount</p>
                  <p className="text-2xl font-bold text-fg-40 mb-2">${unpaidAmount.toLocaleString()}</p>
                  <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    Awaiting payment
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
                  <p className="text-xs text-fg-60 mb-1">Paid Amount</p>
                  <p className="text-2xl font-bold text-fg-40 mb-2">${paidAmount.toLocaleString()}</p>
                  <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Recorded in bank
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

        {/* Recent Activity List */}
        <div className="py-4">
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <h3 className="text-base font-semibold text-fg-50 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {journalEntries.length > 0 ? (
                journalEntries.slice(-5).reverse().map((entry) => (
                  <div key={entry.id} className="text-sm text-fg-60 border-l-2 border-pr-40 pl-3 py-1">
                    {entry.description}
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