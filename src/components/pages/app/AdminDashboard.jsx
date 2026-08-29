import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Inbox,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { Badge } from "../../ui";
import {
  canViewAdminUsers,
  getAdminDashboard,
} from "../../../api/apiFunction/adminUserServices";

const STATUS_LABEL = {
  DRAFT: "Draft",
  CALCULATED: "Calculated",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  SUBMITTED: "Submitted",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

const KIND_VARIANT = {
  onboarding: "warning",
  fiscal_profile: "warning",
  certificate: "info",
  rejected_filing: "error",
  stuck_draft: "secondary",
};

const emptySnapshot = {
  users: {
    total: 0,
    admins: 0,
    by_country: { ES: 0, IT: 0, unset: 0 },
    by_type: { person: 0, business: 0, advisor: 0, unset: 0 },
    recent_signups_7d: 0,
  },
  spain: {
    onboarding: { complete: 0, incomplete: 0 },
    fiscal_profile: { complete: 0, incomplete: 0 },
    certificate: { present: 0, missing: 0 },
  },
  filings: {
    total: 0,
    by_status: {},
    by_modelo: {},
    submit_mode: { test: 0, live: 0, not_submitted: 0 },
    modelo_303: { quarterly: 0, redeme_monthly: 0 },
  },
  waitlist: { italy: 0, white_label: 0, total: 0 },
  queue: [],
  live_modelos: ["111", "115", "130", "190", "303", "390"],
};

const StatCard = ({ label, value, hint, icon: Icon }) => (
  <div className="bg-bg-50 border border-bd-50 rounded-xl p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs text-fg-60 mb-1">{label}</p>
        <p className="text-2xl font-bold text-fg-40">{value}</p>
        {hint ? <p className="text-xs text-fg-60 mt-2">{hint}</p> : null}
      </div>
      {Icon ? (
        <div className="w-10 h-10 bg-bg-70 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-fg-50" strokeWidth={1.5} />
        </div>
      ) : null}
    </div>
  </div>
);

const AdminDashboard = () => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const allowed = canViewAdminUsers(user);
  const [data, setData] = useState(emptySnapshot);
  const [loading, setLoading] = useState(allowed);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!allowed) return undefined;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const snapshot = await getAdminDashboard();
        if (!cancelled) setData({ ...emptySnapshot, ...snapshot });
      } catch (err) {
        const detail = err?.response?.data?.detail;
        if (!cancelled) {
          setError(
            typeof detail === "string"
              ? detail
              : "Could not load the admin dashboard."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  if (!allowed) {
    return (
      <div className="flex-1 bg-bg-70 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-fg-40">Admin dashboard</h1>
          <p className="text-sm text-fg-60 mt-2">
            Only admin accounts can open this page.
          </p>
        </div>
      </div>
    );
  }

  const spainUsers = data.users?.by_country?.ES || 0;
  const liveModelos = data.live_modelos || emptySnapshot.live_modelos;
  const statusOrder = Object.keys(STATUS_LABEL);
  const queue = Array.isArray(data.queue) ? data.queue : [];

  return (
    <div className="flex-1 bg-bg-70 overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-fg-40">Admin dashboard</h1>
          <p className="text-sm text-fg-60 mt-1">
            Platform view of Spain tax filing. This is not a taxpayer workspace.
          </p>
        </div>

        {error ? (
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6 text-sm text-red-500 mb-6">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Spain users"
            value={loading ? "—" : spainUsers}
            hint={`${data.users?.by_country?.IT || 0} Italy · ${data.users?.by_country?.unset || 0} unset`}
            icon={Users}
          />
          <StatCard
            label="Onboarding incomplete (ES)"
            value={loading ? "—" : data.spain?.onboarding?.incomplete || 0}
            hint={`${data.spain?.onboarding?.complete || 0} complete`}
            icon={UserCog}
          />
          <StatCard
            label="Fiscal profile incomplete (ES)"
            value={loading ? "—" : data.spain?.fiscal_profile?.incomplete || 0}
            hint={`${data.spain?.fiscal_profile?.complete || 0} complete`}
            icon={FileText}
          />
          <StatCard
            label="Certificate missing (ES)"
            value={loading ? "—" : data.spain?.certificate?.missing || 0}
            hint={`${data.spain?.certificate?.present || 0} uploaded`}
            icon={ShieldCheck}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-fg-40">Filings by status</h2>
              <span className="text-xs text-fg-60">{data.filings?.total || 0} total</span>
            </div>
            {loading ? (
              <div className="h-24 bg-bg-60 border border-bd-50 rounded-lg animate-pulse" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {statusOrder.map((status) => (
                  <Badge
                    key={status}
                    variant={
                      status === "ACCEPTED"
                        ? "success"
                        : status === "REJECTED"
                          ? "error"
                          : status === "DRAFT"
                            ? "secondary"
                            : "info"
                    }
                  >
                    {STATUS_LABEL[status]} · {data.filings?.by_status?.[status] || 0}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-fg-60 mt-4">
              Accepted is not paid. NRC / cargo is not in the product yet.
            </p>
          </div>
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-fg-40 mb-4">AEAT submit mode</h2>
            <p className="text-sm text-fg-50">
              Live {data.filings?.submit_mode?.live || 0} · Test {data.filings?.submit_mode?.test || 0}
            </p>
            <p className="text-xs text-fg-60 mt-2">
              {data.filings?.submit_mode?.not_submitted || 0} not submitted
            </p>
            <p className="text-xs text-fg-60 mt-4">
              Invoice VeriFactu and modelo presentación are separate pipes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-fg-40 mb-4">Live modelos</h2>
            <div className="space-y-2">
              {liveModelos.map((modelo) => (
                <div key={modelo} className="flex items-center justify-between text-sm">
                  <span className="text-fg-50">Modelo {modelo}</span>
                  <span className="text-fg-40 font-medium">
                    {data.filings?.by_modelo?.[modelo] || 0}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-fg-60 mt-4">
              303 quarterly {data.filings?.modelo_303?.quarterly || 0} · REDEME monthly{" "}
              {data.filings?.modelo_303?.redeme_monthly || 0}
            </p>
          </div>
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-fg-50" />
              <h2 className="text-sm font-semibold text-fg-40">Attention queue</h2>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-bg-60 border border-bd-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : queue.length === 0 ? (
              <p className="text-sm text-fg-60">No exceptions in the current snapshot.</p>
            ) : (
              <div className="space-y-2">
                {queue.map((item, index) => (
                  <Link
                    key={`${item.kind}-${index}`}
                    to={item.href || "/app/users"}
                    className="flex items-center justify-between gap-3 bg-bg-60 border border-bd-50 rounded-lg px-3 py-2.5 hover:bg-bg-40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-fg-40 truncate">{item.title}</p>
                      <p className="text-xs text-fg-60 truncate">{item.detail}</p>
                    </div>
                    <Badge variant={KIND_VARIANT[item.kind] || "secondary"}>{item.kind}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/app/users"
            className="bg-bg-50 border border-bd-50 rounded-xl p-5 hover:bg-bg-40"
          >
            <UserCog className="w-5 h-5 text-fg-50 mb-3" />
            <p className="text-sm font-semibold text-fg-40">Users</p>
            <p className="text-xs text-fg-60 mt-1">
              {data.users?.total || 0} accounts · {data.users?.recent_signups_7d || 0} new in 7 days
            </p>
          </Link>
          <Link
            to="/app/waitlist"
            className="bg-bg-50 border border-bd-50 rounded-xl p-5 hover:bg-bg-40"
          >
            <Inbox className="w-5 h-5 text-fg-50 mb-3" />
            <p className="text-sm font-semibold text-fg-40">Sales waitlist</p>
            <p className="text-xs text-fg-60 mt-1">
              Italy {data.waitlist?.italy || 0} · White Label {data.waitlist?.white_label || 0}
            </p>
          </Link>
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-5">
            <Users className="w-5 h-5 text-fg-50 mb-3" />
            <p className="text-sm font-semibold text-fg-40">User types</p>
            <p className="text-xs text-fg-60 mt-1">
              Person {data.users?.by_type?.person || 0} · Business {data.users?.by_type?.business || 0} · Advisor{" "}
              {data.users?.by_type?.advisor || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
