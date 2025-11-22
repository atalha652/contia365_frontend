import React, { useEffect, useMemo, useState } from "react";
import { Upload, Search, Filter, MoreHorizontal, Loader2, History, RotateCw } from "lucide-react";
import { Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Input, Select, ImagePreviewModal } from "../../../ui";
import UploadVoucherModal from "./UploadVoucherModal";
import RightPanel from "../common/right-panel";
import RejectionHistory from "../common/right-panel/RejectionHistory";
import { listUserVouchers, sendVouchersForRequest } from "../../../../api/apiFunction/voucherServices";

// This component manages uploads: listing vouchers, filtering, preview, and sending for approval
const VouchersUploads = () => {
  // Simple English: Local states for modal, table, filters, selection, and panels.
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sending, setSending] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelVoucher, setPanelVoucher] = useState(null);

  // Simple English: Read user info from local storage and get id.
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const userId = user?.id || user?._id || user?.user_id || user?.uid;

  // This function fetches vouchers for the current user
  const fetchVouchers = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError("");
      const { vouchers: items } = await listUserVouchers({ user_id: userId });
      setVouchers(Array.isArray(items) ? items : []);
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Failed to fetch vouchers";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // This effect loads vouchers when the component mounts or user changes
  useEffect(() => {
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // This toggles a voucher id selection
  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // This moves selected vouchers to requests (send for approval)
  const moveSelectedToRequests = async () => {
    if (selectedIds.length === 0 || !userId) return;
    try {
      setSending(true);
      setError("");
      await sendVouchersForRequest({ voucher_ids: selectedIds, approver_id: userId });
      setSelectedIds([]);
      await fetchVouchers();
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Failed to send for request";
      setError(message);
    } finally {
      setSending(false);
    }
  };

  // This normalizes the API data into table items
  const normalized = Array.isArray(vouchers)
    ? vouchers.map((v) => ({
        id: v._id || v.id,
        status: v.status || "pending",
        title: v.title || "",
        description: v.description || "",
        category: v.category || "",
        created_at: v.created_at || v.date || "",
        files: Array.isArray(v.files) ? v.files : [],
        files_count: typeof v.files_count === "number" ? v.files_count : Array.isArray(v.files) ? v.files.length : 0,
        ocr: v.OCR || v.ocr_status || "",
        rejection_count: typeof v.rejection_count === "number" ? v.rejection_count : 0,
        rejected_at: v.rejected_at,
        rejected_by: v.rejected_by,
        rejection_reason: v.rejection_reason,
        approver_id: v.approver_id,
      }))
    : [];

  // This filters vouchers by search and status
  const filtered = normalized.filter((v) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = `${v.id} ${v.title} ${v.category}`.toLowerCase().includes(search);
    const matchesStatus = statusFilter === "All Status" ? true : v.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // This formats a date-time value into a readable string
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

  // Simple English: Helpers for select-all and preview modal
  const allVisibleIds = filtered.map((v) => v.id);
  const allSelectedOnPage = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };

  // Simple English: Image preview modal state and actions
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const openPreview = (files, index = 0) => {
    setPreviewFiles(Array.isArray(files) ? files : []);
    setPreviewIndex(index || 0);
    setPreviewOpen(true);
  };

  // Simple English: Right panel actions to view rejection history
  const openRejectionPanel = (voucher) => {
    setPanelVoucher(voucher);
    setPanelOpen(true);
  };
  const closePanel = () => {
    setPanelOpen(false);
    setPanelVoucher(null);
  };

  // This renders the uploads UI: filters, table, and actions
  return (
    <div>
      {/* Section Header: matches Gmail header sizes and appears under tabs */}
      <div className="pt-2 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-fg-40">Vouchers</h2>
            <p className="text-sm text-fg-60">Manage uploads and Gmail purchases.</p>
          </div>
          {/* Header actions: Upload and Refresh placed opposite to the text, like Gmail */}
          <div className="flex items-center gap-2">
            <Button variant="primary" className="space-x-2" onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4" strokeWidth={1.5} />
              <span>Upload Voucher</span>
            </Button>
            <Button variant="secondary" onClick={fetchVouchers}>
              <RotateCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Refresh
            </Button>
          </div>
        </div>
      </div>
      {/* Filters Section */}
      <div className="py-4">
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-60" strokeWidth={1.5} />
            <Input type="text" placeholder="Search title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>

          {/* Status Filter */}
          <div className="w-44">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {["All Status", "pending", "awaiting_approval", "approved", "rejected"].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          </div>

          {/* More Filters */}
          <Button variant="secondary" size="icon">
            <Filter className="w-4 h-4" strokeWidth={1.5} />
          </Button>

          {/* More Options */}
          {/* <Button variant="secondary" size="icon">
            <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
          </Button> */}

          {/* Send for approval */}
          <Button variant="primary" onClick={moveSelectedToRequests} disabled={selectedIds.length === 0 || sending} className="whitespace-nowrap">
            {sending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending…</span>
              </span>
            ) : (
              <>Send for approval ({selectedIds.length})</>
            )}
          </Button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-3">
          <Badge variant="warning">{error}</Badge>
        </div>
      )}

      {/* Vouchers Table */}
      <Table>
        <TableHeader>
          <TableRow isHeader={true}>
            <TableHead className="w-10" isFirst={true}>
              <input type="checkbox" className="form-checkbox h-4 w-4 rounded border-bd-50" checked={allSelectedOnPage} onChange={toggleSelectAll} aria-label="Select all" />
            </TableHead>
            <TableHead className="whitespace-nowrap">Title</TableHead>
            <TableHead className="whitespace-nowrap">Category</TableHead>
            <TableHead className="whitespace-nowrap">Files</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Rejection Count</TableHead>
            <TableHead className="whitespace-nowrap">Created</TableHead>
            <TableHead className="whitespace-nowrap">Preview</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Skeleton loading rows
            [...Array(5)].map((_, i) => (
              <TableRow key={i} isLast={i === 4}>
                {/* Checkbox skeleton */}
                <TableCell>
                  <div className="w-4 h-4 bg-bg-40 rounded animate-pulse" />
                </TableCell>
                {/* Title skeleton */}
                <TableCell>
                  <div className="h-3 w-32 bg-bg-40 rounded animate-pulse" />
                </TableCell>
                {/* Category skeleton */}
                <TableCell>
                  <div className="h-3 w-24 bg-bg-40 rounded animate-pulse" />
                </TableCell>
                {/* Files skeleton */}
                <TableCell>
                  <div className="h-3 w-8 bg-bg-40 rounded animate-pulse" />
                </TableCell>
                {/* Status badge skeleton */}
                <TableCell>
                  <div className="h-6 w-24 bg-bg-40 rounded animate-pulse" />
                </TableCell>
                {/* Rejection count skeleton */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-bg-40 rounded animate-pulse" />
                    <div className="h-3 w-6 bg-bg-40 rounded animate-pulse" />
                  </div>
                </TableCell>
                {/* Created skeleton */}
                <TableCell>
                  <div className="h-3 w-32 bg-bg-40 rounded animate-pulse" />
                </TableCell>
                {/* Preview thumbnails skeleton */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-bg-40 rounded-md animate-pulse" />
                    <div className="w-8 h-8 bg-bg-40 rounded-md animate-pulse" />
                    <div className="w-8 h-8 bg-bg-40 rounded-md animate-pulse" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <>
              {filtered.map((voucher, index) => (
            <TableRow key={voucher.id} isLast={index === filtered.length - 1}>
              <TableCell>
                <input type="checkbox" className="form-checkbox h-4 w-4 rounded border-bd-50" checked={selectedIds.includes(voucher.id)} onChange={() => toggleSelect(voucher.id)} aria-label={`Select voucher ${voucher.id}`} />
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-fg-40 whitespace-nowrap">{voucher.title || "-"}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-fg-60 whitespace-nowrap">{voucher.category || "-"}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-fg-60 whitespace-nowrap">{voucher.files_count ?? 0}</span>
              </TableCell>
              <TableCell>
                <Badge variant={voucher.status === "approved" ? "success" : voucher.status === "rejected" ? "error" : voucher.status === "awaiting_approval" ? "info" : "warning"}>
                  {String(voucher.status || "pending").toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <button className="inline-flex items-center gap-2 text-fg-60 hover:text-fg-40" onClick={() => openRejectionPanel(voucher)} title="View rejection history">
                  <History className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-sm whitespace-nowrap">{typeof voucher.rejection_count === "number" ? voucher.rejection_count : 0}</span>
                </button>
              </TableCell>
              <TableCell>
                <span className="text-sm text-fg-60 whitespace-nowrap">{formatDateTime(voucher.created_at)}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {(voucher.files || []).slice(0, 3).map((f, i) => (
                    <button key={i} onClick={() => openPreview(voucher.files, i)} className="border border-bd-50 rounded-md p-0.5" title={f?.name || `File ${i + 1}`}>
                      <img src={f?.file_url || f?.url || ""} alt={f?.name || `File ${i + 1}`} className="w-8 h-8 rounded-md object-cover" />
                    </button>
                  ))}
                  {Array.isArray(voucher.files) && voucher.files.length > 5 && (
                    <span className="text-xs text-fg-60 whitespace-nowrap">and more...</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell className="text-center" colSpan={8}>
                    <span className="text-sm text-fg-60">No vouchers match your filters.</span>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>

      {/* Upload Voucher Modal */}
      <UploadVoucherModal open={showUploadModal} onClose={() => setShowUploadModal(false)} onUploaded={() => { fetchVouchers(); }} />

      {/* Preview modal to view files */}
      <ImagePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} files={previewFiles} initialIndex={previewIndex} />

      {/* Right Panel for rejection history */}
      <RightPanel open={panelOpen} onClose={closePanel} title="Rejection History">
        <RejectionHistory voucher={panelVoucher} />
      </RightPanel>

      {/* Removed duplicate bottom action buttons to keep header clean */}
    </div>
  );
};

export default VouchersUploads;