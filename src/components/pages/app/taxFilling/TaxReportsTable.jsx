import React, { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Badge, Button } from "../../../ui";

const STATUS_VARIANTS = { draft: "warning", finalized: "info", filed: "success" };
const STATUS_NEXT     = { draft: "finalized", finalized: "filed" };
const STATUS_LABEL    = { draft: "Mark as Finalized", finalized: "Mark as Filed" };

// Purely presentational — receives reports[] and an onStatusUpdate callback.
// Has no knowledge of the API layer; status updates are delegated upward.
const TaxReportsTable = ({ reports, onStatusUpdate }) => {
  const [updatingId, setUpdatingId] = useState(null);

  if (!reports?.length) return null;

  const handleUpdate = async (report) => {
    const nextStatus = STATUS_NEXT[report.status];
    if (!nextStatus) return;
    const id = report._id || report.id;
    try {
      setUpdatingId(id);
      await onStatusUpdate({ report_id: id, status: nextStatus });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-fg-60 uppercase tracking-wider">Saved Reports</div>
      <div className="overflow-x-auto rounded-xl border border-bd-50">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-bg-50 text-fg-60 text-xs">
              <th className="px-4 py-2 text-left font-semibold">Modelo</th>
              <th className="px-4 py-2 text-left font-semibold">Period</th>
              <th className="px-4 py-2 text-left font-semibold">Transactions</th>
              <th className="px-4 py-2 text-left font-semibold">Status</th>
              <th className="px-4 py-2 text-left font-semibold">Calculated</th>
              <th className="px-4 py-2 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => {
              const id = r._id || r.id;
              return (
                <tr key={id || i} className="border-t border-bd-50 hover:bg-bg-60 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-fg-40">Modelo {r.modelo}</td>
                  <td className="px-4 py-2.5 text-fg-60">{r.year} {r.quarter}</td>
                  <td className="px-4 py-2.5 text-fg-60">{r.transactions_count ?? "-"}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={STATUS_VARIANTS[r.status] || "default"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-fg-60">
                    {r.calculated_at
                      ? new Date(r.calculated_at).toLocaleDateString()
                      : r.created_at
                        ? new Date(r.created_at).toLocaleDateString()
                        : "-"}
                  </td>
                  <td className="px-4 py-2.5">
                    {STATUS_NEXT[r.status] ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingId === id}
                        onClick={() => handleUpdate(r)}
                      >
                        {updatingId === id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : STATUS_LABEL[r.status]}
                      </Button>
                    ) : (
                      <span className="text-xs text-fg-60 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" /> Filed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxReportsTable;
