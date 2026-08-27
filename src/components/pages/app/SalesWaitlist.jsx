import React, { useEffect, useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import { Badge } from "../../ui";
import {
  canViewSalesWaitlist,
  listSalesWaitlist,
} from "../../../api/apiFunction/waitlistServices";

const INTEREST_LABEL = {
  italy: "Italy",
  white_label: "White Label",
};

const formatWhen = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("en-GB");
};

const SalesWaitlist = () => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const allowed = canViewSalesWaitlist(user);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(allowed);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!allowed) return undefined;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await listSalesWaitlist();
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        const detail = err?.response?.data?.detail;
        if (!cancelled) {
          setError(
            typeof detail === "string"
              ? detail
              : "Could not load the sales waitlist."
          );
          setRows([]);
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
          <h1 className="text-2xl font-bold text-fg-40">Sales waitlist</h1>
          <p className="text-sm text-fg-60 mt-2">
            Only admin or advisor accounts can see Italy and White Label waitlist rows.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-70 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-fg-40">Sales waitlist</h1>
          <p className="text-sm text-fg-60 mt-1">
            Italy and White Label interest captured from onboarding. Visible to sales (admin or advisor).
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-bg-50 border border-bd-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-8 text-sm text-red-500">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-8 text-sm text-fg-60 text-center">
            No waitlist rows yet.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row._id || `${row.user_id}-${row.interest}`}
                className="bg-bg-50 border border-bd-50 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-bg-60 border border-bd-50 flex items-center justify-center flex-shrink-0">
                      <Inbox className="w-4 h-4 text-fg-50" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-fg-40 truncate">
                        {row.name || row.email || row.user_id || "Unknown"}
                      </p>
                      <p className="text-xs text-fg-60 truncate">{row.email || "—"}</p>
                      <p className="text-xs text-fg-60 mt-1">
                        {row.country || "—"} · {row.source || "onboarding"} · {formatWhen(row.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={row.interest === "italy" ? "info" : "warning"}>
                    {INTEREST_LABEL[row.interest] || row.interest}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesWaitlist;
