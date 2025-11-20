import React, { useMemo, useState, useEffect } from "react";
import { Search, Loader2, RotateCw } from "lucide-react";
import { Button, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../ui";
import {
  checkGmailAuth,
  authorizeGmailUrl,
  getGmailPurchases,
  searchGmailEmails,
} from "../../../../api/apiFunction/gmailServices";
import { convertEmailsToToon, listUserVouchers } from "../../../../api/apiFunction/voucherServices";

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

  // Simple English: States for Gmail auth, loading, error, list, paging, search, and selection.
  const [gmailAuth, setGmailAuth] = useState({ success: false });
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState("");
  const [gmailPurchases, setGmailPurchases] = useState([]);
  const [gmailNextPageToken, setGmailNextPageToken] = useState(null);
  const [gmailSearch, setGmailSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // This checks Gmail auth status by calling backend
  const checkAuth = async () => {
    try {
      setGmailError("");
      const info = await checkGmailAuth();
      setGmailAuth(info || { success: false });
      return info?.success || false;
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Failed to check Gmail auth";
      setGmailError(message);
      return false;
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

  // Automatically check auth and load purchases when component mounts
  useEffect(() => {
    loadGmailPurchases();

  }, [userId]);

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

  // This toggles an email id selection
  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // This selects or deselects all visible emails
  const allVisibleIds = gmailPurchases.map((email) => email.id);
  const allSelectedOnPage = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
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

  // This converts selected emails to TOON vouchers
  const [convertLoading, setConvertLoading] = useState(false);
  const convertSelectedEmailsToToon = async () => {
    if (!userId || selectedIds.length === 0) return;

    try {
      setConvertLoading(true);
      setGmailError(""); // Clear any previous errors
      // Filter the selected emails from the gmailPurchases array
      const selectedEmails = gmailPurchases.filter(email => selectedIds.includes(email.id));

      if (selectedEmails.length === 0) {
        setGmailError("No selected emails found");
        setConvertLoading(false);
        return;
      }

      // Check if any of the selected emails have already been converted to vouchers
      let vouchers = [];
      try {
        const voucherData = await listUserVouchers({ user_id: userId });
        vouchers = voucherData.vouchers || [];
      } catch (voucherErr) {
        console.error("Error fetching vouchers:", voucherErr);
        // Even if there's an error fetching vouchers, we'll allow conversion but log the error
        console.warn("Proceeding with conversion despite voucher fetch error");
      }
      
      // Debug logging
      console.log("Selected emails for conversion:", selectedEmails);
      console.log("Existing vouchers for user:", vouchers);
      
      // Create a set of email IDs that have already been converted to vouchers
      // We check multiple possible fields that might contain the source email ID
      const existingVoucherEmailIds = new Set();
      if (Array.isArray(vouchers)) {
        vouchers.forEach(voucher => {
          // Check direct email ID fields
          if (voucher.source_email_id) {
            existingVoucherEmailIds.add(voucher.source_email_id);
          }
          if (voucher.email_id) {
            existingVoucherEmailIds.add(voucher.email_id);
          }
          if (voucher.gmail_message_id) {
            existingVoucherEmailIds.add(voucher.gmail_message_id);
          }
          
          // Check the original_email.id field in files array
          if (Array.isArray(voucher.files)) {
            voucher.files.forEach(file => {
              if (file.original_email && file.original_email.id) {
                existingVoucherEmailIds.add(file.original_email.id);
              }
            });
          }
          
          // Check if voucher title or description contains the email ID
          if (voucher.title) {
            selectedEmails.forEach(email => {
              if (voucher.title.includes(email.id)) {
                existingVoucherEmailIds.add(email.id);
              }
            });
          }
          
          if (voucher.description) {
            selectedEmails.forEach(email => {
              if (voucher.description.includes(email.id)) {
                existingVoucherEmailIds.add(email.id);
              }
            });
          }
        });
      }

      console.log("Existing voucher email IDs:", Array.from(existingVoucherEmailIds));
      
      const alreadyConvertedEmails = selectedEmails.filter(email => existingVoucherEmailIds.has(email.id));
      
      if (alreadyConvertedEmails.length > 0) {
        const emailSubjects = alreadyConvertedEmails.map(email => `"${email.subject}"`).join(", ");
        setGmailError(`The following emails have already been converted to TOON vouchers: ${emailSubjects}. Please select emails that haven't been converted yet.`);
        setConvertLoading(false);
        return;
      }

      // Call the convertEmailsToToon API function
      const response = await convertEmailsToToon({
        user_id: userId,
        emails: selectedEmails
      });

      // Console log the response
      console.log("Convert Emails to TOON Response:", response);

      // Show success message or handle response as needed
      // For now, we'll just show a success message in the error field
      setGmailError(`Successfully converted ${selectedEmails.length} emails to TOON`);

      // Optionally, you could refresh the list or clear selections
      // setSelectedIds([]);
      // loadGmailPurchases();
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Failed to convert emails to TOON";
      console.error("Convert Emails to TOON Error:", err);
      setGmailError(message);
    } finally {
      setConvertLoading(false);
    }
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
          <Button variant="secondary" onClick={loadGmailPurchases}>
            <RotateCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Refresh
          </Button>
          {/* Action Buttons */}
          {selectedIds.length > 0 && (
            <div>
              <Button variant="primary" onClick={convertSelectedEmailsToToon} disabled={convertLoading}>
                {convertLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Convert {selectedIds.length} Selected Email{selectedIds.length > 1 ? 's' : ''} to TOON
              </Button>
            </div>
          )}
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


      {/* Purchases Table */}
      <Table>
        <TableHeader>
          <TableRow isHeader={true}>
            <TableHead className="w-10" isFirst={true}>
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 rounded border-bd-50"
                checked={allSelectedOnPage}
                onChange={toggleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="whitespace-nowrap">Sender</TableHead>
            <TableHead className="whitespace-nowrap">Subject</TableHead>
            <TableHead className="whitespace-nowrap">Amount</TableHead>
            <TableHead className="whitespace-nowrap">Order Number</TableHead>
            <TableHead className="whitespace-nowrap">Type</TableHead>
            <TableHead className="whitespace-nowrap">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gmailLoading && (
            <TableRow>
              <TableCell className="text-center" colSpan={7}>
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-fg-60" />
                </div>
              </TableCell>
            </TableRow>
          )}

          {!gmailLoading && gmailPurchases.map((email, index) => (
            <TableRow key={email.id || index} isLast={index === gmailPurchases.length - 1}>
              <TableCell>
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 rounded border-bd-50"
                  checked={selectedIds.includes(email.id)}
                  onChange={() => toggleSelect(email.id)}
                  aria-label={`Select email ${email.id}`}
                />
              </TableCell>
              <TableCell>
                <div className="text-sm text-fg-60 whitespace-nowrap">
                  <div className="font-medium text-fg-40">{email.sender_name || "Unknown Sender"}</div>
                  <div className="text-xs">{email.sender_email || ""}</div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-fg-40 whitespace-nowrap">{email.subject || "(No subject)"}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-fg-60 whitespace-nowrap">
                  {typeof email.amount === "number" ? `${email.currency || ""} ${email.amount}` : "-"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-fg-60 whitespace-nowrap">
                  {email.order_number || "-"}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="info">{(email.purchase_type || "unknown").toUpperCase()}</Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-fg-60 whitespace-nowrap">{formatEmailDate(email.date || email.internal_date)}</span>
              </TableCell>
            </TableRow>
          ))}

          {!gmailLoading && gmailPurchases.length === 0 && (
            <TableRow>
              <TableCell className="text-center" colSpan={7}>
                <span className="text-sm text-fg-60">No Gmail purchases found.</span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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