// This component displays rejection history details for a voucher
// It supports both a single rejection record and an array of rejection_history
import React from "react";

// Helper to format readable date and time
const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const mon = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  const time = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: true }).format(d);
  return `${mon}, ${day}, ${year} ${time}`;
};

const RejectionHistory = ({ voucher }) => {
  // Build rejection entries from array or single-record fields
  const itemsFromArray = Array.isArray(voucher?.rejection_history) ? voucher.rejection_history : [];
  const hasSingleRecord = Boolean(voucher?.rejection_reason || voucher?.rejected_at || voucher?.rejected_by);
  const itemsFromSingle = hasSingleRecord
    ? [{
        rejection_reason: voucher?.rejection_reason || "",
        rejected_at: voucher?.rejected_at || voucher?.updated_at || "",
        rejected_by: voucher?.rejected_by || voucher?.approver_id || "",
      }]
    : [];

  // Determine count and items; hide details when count is zero
  const provisionalItems = itemsFromArray.length > 0 ? itemsFromArray : itemsFromSingle;
  const count = typeof voucher?.rejection_count === "number" ? voucher.rejection_count : provisionalItems.length;
  const items = count === 0 ? [] : provisionalItems;

  // Compute the last rejection info (date/by/reason) for display in a concise summary
  let last = null;
  if (items.length > 0) {
    // Prefer the most recent by rejected_at when available; otherwise take the last entry
    last = items
      .slice()
      .sort((a, b) => new Date(b?.rejected_at || 0) - new Date(a?.rejected_at || 0))[0] || items[items.length - 1];
  }

  return (
    <div className="space-y-4">
      {/* Summary header showing total rejection count */}
      <div>
        <div className="text-sm text-fg-60">Total Rejections</div>
        <div className="text-2xl font-semibold text-fg-40">{count}</div>
      </div>

      {/* Summary rows: headings on left and values on right */}
      <div className="grid grid-cols-2 gap-y-2">
        {/* // Total Rejections
        <div className="text-sm text-fg-60">Total Rejections</div>
        <div className="text-sm text-fg-40 text-right">{count}</div> */}

        {/* Last rejection date (hidden when count is zero) */}
        {count > 0 && (
          <>
            <div className="text-sm text-fg-60">Last rejection date</div>
            <div className="text-sm text-fg-40 text-right">{formatDateTime(last?.rejected_at)}</div>
          </>
        )}

        {/* Last rejected by (hidden when count is zero) */}
        {count > 0 && (
          <>
            <div className="text-sm text-fg-60">Last rejected by</div>
            <div className="text-sm text-fg-40 text-right">{last?.rejected_by || "-"}</div>
          </>
        )}

        {/* Last rejection reason (hidden when count is zero) */}
        {count > 0 && (
          <>
            <div className="text-sm text-fg-60">Last rejection reason</div>
            <div className="text-sm text-fg-40 text-right">{last?.rejection_reason || "-"}</div>
          </>
        )}
      </div>

      {/* Empty state note when there are no rejections */}
      {count === 0 && (
        <div className="text-sm text-fg-60 mt-3">No rejections.</div>
      )}
    </div>
  );
};

export default RejectionHistory;