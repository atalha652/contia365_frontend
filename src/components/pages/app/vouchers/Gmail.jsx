import React, { useMemo, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button, Badge, Input } from "../../../ui";
import {
  checkGmailAuth,
  authorizeGmailUrl,
  getGmailPurchases,
  searchGmailEmails,
} from "../../../../api/apiFunction/gmailServices";

// This component manages Gmail: auth, search, and purchases listing
const VouchersGmail = () => {
  // Simple English: Read user id from local storage.
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const userId = user?.id || user?._id || user?.user_id || user?.uid;

  // Simple English: States for Gmail auth, loading, error, list, paging, and search.
  const [gmailAuth, setGmailAuth] = useState({ success: false });
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState("");
  const [gmailPurchases, setGmailPurchases] = useState([]);
  const [gmailNextPageToken, setGmailNextPageToken] = useState(null);
  const [gmailSearch, setGmailSearch] = useState("");

  // This checks Gmail auth status by calling backend
  const checkAuth = async () => {
    try {
      setGmailError("");
      const info = await checkGmailAuth();
      setGmailAuth(info || { success: false });
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Failed to check Gmail auth";
      setGmailError(message);
    }
  };

  // This loads Gmail purchase emails for the current user
  const loadGmailPurchases = async (opts = {}) => {
    if (!userId) return;
    try {
      setGmailLoading(true);
      setGmailError("");
      const data = await getGmailPurchases({ user_id: userId, max_results: opts.max_results || 50, page_token: opts.page_token || null });
      const emails = Array.isArray(data?.emails) ? data.emails : [];
      setGmailPurchases(emails);
      setGmailNextPageToken(data?.next_page_token || null);
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Failed to load Gmail purchases";
      setGmailError(message);
    } finally {
      setGmailLoading(false);
    }
  };

  // This searches Gmail using a query string
  const runGmailSearch = async () => {
    if (!userId || !gmailSearch) return;
    try {
      setGmailLoading(true);
      setGmailError("");
      const data = await searchGmailEmails({ user_id: userId, query: gmailSearch, max_results: 50 });
      const emails = Array.isArray(data?.emails) ? data.emails : [];
      setGmailPurchases(emails);
      setGmailNextPageToken(null);
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Failed to search Gmail";
      setGmailError(message);
    } finally {
      setGmailLoading(false);
    }
  };

  // This formats email dates into readable strings
  const formatEmailDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    const mon = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    const time = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: true }).format(d);
    return `${mon}, ${day}, ${year} ${time}`;
  };

  // This renders the Gmail UI: auth buttons, search, list, and paging
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-fg-40">Gmail Purchases</h2>
          <p className="text-sm text-fg-60">Connect Gmail and list purchase emails.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={checkAuth}>Check Gmail</Button>
          <Button
            variant="primary"
            onClick={() => {
              try {
                const url = authorizeGmailUrl(userId);
                window.open(url, "_blank");
              } catch (e) {
                setGmailError(e.message);
              }
            }}
          >Authorize Gmail</Button>
          <Button variant="secondary" onClick={() => loadGmailPurchases()} disabled={!gmailAuth?.success}>Load Purchases</Button>
        </div>
      </div>

      {/* Error Notice */}
      {gmailError && (
        <div className="mb-3">
          <Badge variant="warning">{gmailError}</Badge>
        </div>
      )}

      {/* Search Input */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-60" strokeWidth={1.5} />
          <Input type="text" placeholder="Gmail query (e.g., from:amazon subject:order)" value={gmailSearch} onChange={(e) => setGmailSearch(e.target.value)} className="pl-10" />
        </div>
        <Button variant="secondary" onClick={runGmailSearch} disabled={!gmailAuth?.success || !gmailSearch}>Search</Button>
      </div>

      {/* Purchases List */}
      <div className="space-y-2">
        {gmailLoading && (
          <div className="border border-bd-50 bg-bg-50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-fg-60">Loading Gmail purchases…</span>
            </div>
          </div>
        )}

        {!gmailLoading && gmailPurchases.map((email, idx) => (
          <div key={email.id || idx} className="border border-bd-50 bg-bg-50 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {/* Compact avatar */}
                <div className="w-8 h-8 rounded-lg bg-bg-70 flex items-center justify-center text-fg-50 text-xs">
                  {(email.purchase_type || "?").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-fg-40 truncate max-w-[540px]">{email.subject || "(No subject)"}</span>
                    <Badge variant="info">{(email.purchase_type || "unknown").toUpperCase()}</Badge>
                  </div>
                  <p className="text-xs text-fg-60 mt-1">
                    {email.merchant || email.sender_name || email.sender_email || "Unknown merchant"}
                    {typeof email.amount === "number" && (
                      <> • {email.currency || ""} {email.amount}</>
                    )}
                    {email.order_number && (
                      <> • Order: {email.order_number}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-xs text-fg-60 whitespace-nowrap">{formatEmailDate(email.date || email.internal_date)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination actions */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-fg-60">{Array.isArray(gmailPurchases) ? gmailPurchases.length : 0} items</div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={!gmailNextPageToken} onClick={() => loadGmailPurchases({ page_token: gmailNextPageToken })}>Next Page</Button>
        </div>
      </div>
    </div>
  );
};

export default VouchersGmail;