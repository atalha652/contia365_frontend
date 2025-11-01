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
  // Build a list of rejection items from API response structure
  const itemsFromArray = Array.isArray(voucher?.rejection_history) ? voucher.rejection_history : [];

  // Fallback to single record if array is not present
  const itemsFromSingle = (voucher?.rejection_reason || voucher?.rejected_at || voucher?.rejected_by)
    ? [{
        rejection_reason: voucher?.rejection_reason || "",
        rejected_at: voucher?.rejected_at || voucher?.updated_at || "",
        rejected_by: voucher?.rejected_by || voucher?.approver_id || "",
      }]
    : [];

  // Combine both sources of history
  const items = itemsFromArray.length > 0 ? itemsFromArray : itemsFromSingle;

  // Get the count from response when available
  const count = typeof voucher?.rejection_count === "number" ? voucher.rejection_count : items.length;

  return (
    <div className="space-y-4">
      {/* Summary header showing total rejection count */}
      <div>
        <div className="text-sm text-fg-60">Total Rejections</div>
        <div className="text-2xl font-semibold text-fg-40">{count}</div>
      </div>

      {/* Detailed list of each rejection entry */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="border border-bd-50 rounded-lg p-3">
              {/* Rejection date and by whom */}
              <div className="text-sm text-fg-60">
                <span className="font-medium text-fg-50">Date:</span> {formatDateTime(item?.rejected_at)}
              </div>
              <div className="text-sm text-fg-60 mt-1">
                <span className="font-medium text-fg-50">By:</span> {item?.rejected_by || "-"}
              </div>
              {/* Rejection reason */}
              <div className="text-sm text-fg-60 mt-2">
                <span className="font-medium text-fg-50">Reason:</span> {item?.rejection_reason || "-"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state when there are no rejection entries
        <div className="text-sm text-fg-60">No rejection history found for this voucher.</div>
      )}
    </div>
  );
};

export default RejectionHistory;