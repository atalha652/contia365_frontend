import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
// Import page icons and tools
import { Upload, Search, Filter, MoreHorizontal, Loader2, History } from "lucide-react";
import { Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Input, Select, ImagePreviewModal } from "../../../ui";
import UploadVoucherModal from "./UploadVoucherModal";
// Import right panel components to show contextual details like rejection history
import RightPanel from "../common/right-panel";
import RejectionHistory from "../common/right-panel/RejectionHistory";
import { listUserVouchers, sendVouchersForRequest } from "../../../../api/apiFunction/voucherServices";

const Vouchers = () => {
  const { addVoucherRequests } = useOutletContext() || {};

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sending, setSending] = useState(false);
  // Local state to manage right panel open/close and selected voucher for history view
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelVoucher, setPanelVoucher] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const userId = user?.id || user?._id || user?.user_id || user?.uid;

  // Fetch vouchers for the current user and store in local state
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

  useEffect(() => {
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Toggle selection state for a voucher id
  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Move selected vouchers to requests list (send for approval)
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

  // Normalize API response to table-friendly shape and include OCR & rejection info
  const normalized = Array.isArray(vouchers)
    ? vouchers.map((v) => ({
        id: v._id || v.id,
        status: v.status || "pending",
        title: v.title || "",
        description: v.description || "",
        category: v.category || "",
        created_at: v.created_at || v.date || "",
        files: Array.isArray(v.files) ? v.files : [],
        files_count: typeof v.files_count === "number" ? v.files_count : (Array.isArray(v.files) ? v.files.length : 0),
        // OCR status from API (e.g. "Done", "Processing", "Failed")
        ocr: v.OCR || v.ocr_status || "",
        // Rejection count from API
        rejection_count: typeof v.rejection_count === "number" ? v.rejection_count : 0,
        // Additional fields that may be useful for history panel
        rejected_at: v.rejected_at,
        rejected_by: v.rejected_by,
        rejection_reason: v.rejection_reason,
        approver_id: v.approver_id,
      }))
    : [];

  const filtered = normalized.filter((v) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = `${v.id} ${v.title} ${v.category}`.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "All Status" ? true : v.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Format a datetime value into a readable string
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

  const allVisibleIds = filtered.map((v) => v.id);
  const allSelectedOnPage = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  // Toggle select all for currently visible vouchers
  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Open image preview modal with selected files
  const openPreview = (files, index = 0) => {
    setPreviewFiles(Array.isArray(files) ? files : []);
    setPreviewIndex(index || 0);
    setPreviewOpen(true);
  };

  // Open the rejection history right panel for a specific voucher
  const openRejectionPanel = (voucher) => {
    setPanelVoucher(voucher);
    setPanelOpen(true);
  };

  // Close the rejection history right panel
  const closePanel = () => {
    setPanelOpen(false);
    setPanelVoucher(null);
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-fg-40">Vouchers</h1>
              <p className="text-sm text-fg-60 mt-1">Upload voucher files (PDFs, images) to process.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="primary" className="space-x-2" onClick={() => setShowUploadModal(true)}>
                <Upload className="w-4 h-4" strokeWidth={1.5} />
                <span>Upload Voucher</span>
              </Button>
              <Button variant="secondary" onClick={fetchVouchers}>Refresh</Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="py-4">
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-60" strokeWidth={1.5} />
              <Input type="text" placeholder="Search vouchers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
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
            <Button variant="secondary" size="icon">
              <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
            </Button>

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

        {/* Error/Loading Notices */}
        {error && (
          <div className="mb-3">
            <Badge variant="warning">{error}</Badge>
          </div>
        )}
        {false && loading}

        {/* Vouchers Table */}
        <Table>
          <TableHeader>
            <TableRow isHeader={true}>
              <TableHead className="w-10" isFirst={true}>
                <input type="checkbox" className="form-checkbox h-4 w-4 rounded border-bd-50" checked={allSelectedOnPage} onChange={toggleSelectAll} aria-label="Select all" />
              </TableHead>
              {/* Removed Voucher column since voucher id isn't needed */}
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap">Files</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Rejection Count</TableHead>
              <TableHead className="whitespace-nowrap">Created</TableHead>
              <TableHead className="whitespace-nowrap">Preview</TableHead>
              {/* Actions column removed since not used */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                {/* Loading row uses colSpan=8 to match current headers */}
                <TableCell className="text-center" colSpan={8}>
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-fg-60" />
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((voucher, index) => (
              <TableRow key={voucher.id} isLast={index === filtered.length - 1}>
                <TableCell>
                  <input type="checkbox" className="form-checkbox h-4 w-4 rounded border-bd-50" checked={selectedIds.includes(voucher.id)} onChange={() => toggleSelect(voucher.id)} aria-label={`Select voucher ${voucher.id}`} />
                </TableCell>
                {/* Removed Voucher id cell */}
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
                  {/* Rejection count with a history icon to open right panel */}
                  <button
                    className="inline-flex items-center gap-2 text-fg-60 hover:text-fg-40"
                    onClick={() => openRejectionPanel(voucher)}
                    title="View rejection history"
                  >
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
                      <button
                        key={i}
                        onClick={() => openPreview(voucher.files, i)}
                        className="border border-bd-50 rounded-md p-0.5"
                        title={f?.name || `File ${i + 1}`}
                      >
                        <img
                          src={f?.file_url || f?.url || ""}
                          alt={f?.name || `File ${i + 1}`}
                          className="w-8 h-8 rounded-md object-cover"
                        />
                      </button>
                    ))}
                    {Array.isArray(voucher.files) && voucher.files.length > 5 && (
                      <span className="text-xs text-fg-60 whitespace-nowrap">and more...</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && !loading && (
              <TableRow>
                <TableCell className="text-center" colSpan={8}>
                  <span className="text-sm text-fg-60">No vouchers match your filters.</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Upload Voucher Modal */}
        <UploadVoucherModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploaded={() => {
            fetchVouchers();
          }}
        />

        <ImagePreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          files={previewFiles}
          initialIndex={previewIndex}
        />

        {/* Right Panel to show contextual rejection history */}
        <RightPanel open={panelOpen} onClose={closePanel} title="Rejection History">
          <RejectionHistory voucher={panelVoucher} />
        </RightPanel>

        {/* Manual entries are available in Text Vouchers */}
      </div>
    </div>
  );
};

export default Vouchers;