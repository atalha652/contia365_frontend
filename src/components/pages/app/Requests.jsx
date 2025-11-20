import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Input,
  Select,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ImagePreviewModal,
} from "../../ui";
// Import icons including History for rejection count panel
import { Check, Filter, MoreHorizontal, Search, X, Loader2, History } from "lucide-react";
import { getAwaitingApprovalVouchers, approveVouchers, rejectVouchers } from "../../../api/apiFunction/voucherServices";
// Import reusable right panel and rejection history component
import RightPanel from "./common/right-panel";
import RejectionHistory from "./common/right-panel/RejectionHistory";

const Requests = () => {
  const { approveVoucherRequest } = useOutletContext() || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vouchers, setVouchers] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmIds, setConfirmIds] = useState([]);
  const [approveNote, setApproveNote] = useState("");
  const [declineIds, setDeclineIds] = useState([]);
  const [declineNote, setDeclineNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  // State to manage right panel for rejection history
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

  const fetchRequests = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError("");
      const { vouchers: items } = await getAwaitingApprovalVouchers({ user_id: userId });
      setVouchers(Array.isArray(items) ? items : []);
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || "Failed to fetch requests";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Normalize awaiting approval vouchers to table-ready shape
  const normalized = Array.isArray(vouchers)
    ? vouchers.map((v) => ({
        id: v._id || v.id,
        status: v.status || "awaiting_approval",
        title: v.title || "",
        description: v.description || "",
        category: v.category || "",
        created_at: v.created_at || v.date || "",
        approval_requested_at: v.approval_requested_at || "",
        approver_id: v.approver_id || "",
        rejection_count: typeof v.rejection_count === "number" ? v.rejection_count : 0,
        // Include last rejection fields if present
        rejected_at: v.rejected_at,
        rejected_by: v.rejected_by,
        rejection_reason: v.rejection_reason,
        files: Array.isArray(v.files) ? v.files : [],
        files_count: typeof v.files_count === "number" ? v.files_count : (Array.isArray(v.files) ? v.files.length : 0),
      }))
    : [];

  const filtered = normalized.filter((v) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = `${v.id} ${v.title} ${v.category}`.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "All Status" ? true : v.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

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

  const formatStatusLabel = (value) => {
    if (!value) return "";
    return String(value).replace(/_/g, " ").toUpperCase();
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Open image preview modal
  const openPreview = (files, index = 0) => {
    setPreviewFiles(Array.isArray(files) ? files : []);
    setPreviewIndex(index || 0);
    setPreviewOpen(true);
  };

  // Open right panel with rejection history for a voucher
  const openRejectionPanel = (voucher) => {
    setPanelVoucher(voucher);
    setPanelOpen(true);
  };

  // Close right panel and clear voucher
  const closePanel = () => {
    setPanelOpen(false);
    setPanelVoucher(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const allVisibleIds = filtered.map((f) => f.id);
  const allSelectedOnPage = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };

  const confirmApprove = (ids) => {
    setApproveNote("");
    setConfirmIds(ids);
  };
  const closeConfirm = () => {
    setApproveNote("");
    setConfirmIds([]);
  };
  const doApprove = async () => {
    if (!userId || confirmIds.length === 0) return;
    try {
      setActionLoading(true);
      await approveVouchers({ voucher_ids: confirmIds, approver_id: userId, notes: approveNote || undefined });
      setSelectedIds((prev) => prev.filter((id) => !confirmIds.includes(id)));
      setConfirmIds([]);
      setApproveNote("");
      await fetchRequests();
    } catch (err) {
      console.error("Approve action failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const declineSelected = () => {
    if (selectedIds.length === 0) return;
    setDeclineNote("");
    setDeclineIds(selectedIds);
  };

  const declineOne = (id) => {
    setDeclineNote("");
    setDeclineIds([id]);
  };

  const closeDecline = () => {
    setDeclineNote("");
    setDeclineIds([]);
  };

  const doDecline = async () => {
    if (!userId || declineIds.length === 0 || !declineNote) return;
    try {
      setActionLoading(true);
      await rejectVouchers({ voucher_ids: declineIds, rejected_by: userId, rejection_reason: declineNote });
      setSelectedIds((prev) => prev.filter((id) => !declineIds.includes(id)));
      setDeclineIds([]);
      setDeclineNote("");
      await fetchRequests();
    } catch (err) {
      console.error("Reject action failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-fg-40">Requests</h1>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="py-4">
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-60" strokeWidth={1.5} />
              <Input
                type="text"
                placeholder="Search vouchers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="w-44">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {["All Status", "awaiting_approval", "approved", "rejected"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
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

            <Button
              variant="secondary"
              className="space-x-2 whitespace-nowrap"
              disabled={selectedIds.length === 0}
              onClick={declineSelected}
            >
              <X className="w-4 h-4" />
              <span>Decline Selected ({selectedIds.length})</span>
            </Button>

            <Button
              variant="primary"
              className="space-x-2 whitespace-nowrap"
              disabled={selectedIds.length === 0}
              onClick={() => confirmApprove(selectedIds)}
            >
              <Check className="w-4 h-4" />
              <span>Approve Selected ({selectedIds.length})</span>
            </Button>
          </div>
        </div>

        {/* Requests Table (match Vouchers layout) */}
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
              {/* Removed Voucher column as voucher id isn't needed */}
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap">Files</TableHead>
              <TableHead className="whitespace-nowrap">Rejections</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Created</TableHead>
              <TableHead className="w-[160px] whitespace-nowrap">Preview</TableHead>
              <TableHead className="w-12" isLast={true}></TableHead>
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
                  {/* Rejections skeleton */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-bg-40 rounded animate-pulse" />
                      <div className="h-3 w-6 bg-bg-40 rounded animate-pulse" />
                    </div>
                  </TableCell>
                  {/* Status badge skeleton */}
                  <TableCell>
                    <div className="h-6 w-24 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Created skeleton */}
                  <TableCell>
                    <div className="h-3 w-32 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Preview thumbnails skeleton */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-bg-40 rounded-md animate-pulse" />
                      <div className="w-10 h-10 bg-bg-40 rounded-md animate-pulse" />
                      <div className="w-10 h-10 bg-bg-40 rounded-md animate-pulse" />
                    </div>
                  </TableCell>
                  {/* Actions buttons skeleton */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-20 bg-bg-40 rounded animate-pulse" />
                      <div className="h-8 w-20 bg-bg-40 rounded animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {filtered.map((voucher, index) => (
              <TableRow key={voucher.id} isLast={index === filtered.length - 1}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 rounded border-bd-50"
                    checked={selectedIds.includes(voucher.id)}
                    onChange={() => toggleSelect(voucher.id)}
                    aria-label={`Select voucher #${voucher.id}`}
                  />
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
                  {/* Rejection count with history icon to open side panel */}
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
                  <Badge variant={voucher.status === "approved" ? "success" : voucher.status === "rejected" ? "error" : "info"}>
                    {formatStatusLabel(voucher.status || "awaiting_approval")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">{formatDateTime(voucher.created_at)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[140px]">
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
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      </button>
                    ))}
                    {Array.isArray(voucher.files) && voucher.files.length > 5 && (
                      <span className="text-xs text-fg-60 whitespace-nowrap">and more...</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {voucher.status !== "approved" && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="space-x-1"
                        onClick={() => declineOne(voucher.id)}
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="space-x-1"
                        onClick={() => confirmApprove([voucher.id])}
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center" colSpan={9}>
                      <span className="text-sm text-fg-60">No voucher requests yet.</span>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>

        {/* Approve Modal */}
        <Modal open={confirmIds.length > 0} onClose={closeConfirm}>
          <ModalHeader
            title={`Approve ${confirmIds.length} voucher${confirmIds.length > 1 ? 's' : ''}`}
            action={
              <Button variant="ghost" size="icon" onClick={closeConfirm}>
                <X className="w-4 h-4" />
              </Button>
            }
          />
          <ModalBody>
            <div className="space-y-3">
              <p className="text-sm text-fg-60">
                Approving will set status to <span className="font-medium">APPROVED</span>.
              </p>
              <div>
                <label className="text-sm text-fg-60">Optional Note</label>
                <Input
                  type="text"
                  placeholder="Add an approval note (optional)"
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={closeConfirm}>Cancel</Button>
            <Button variant="primary" onClick={doApprove} disabled={actionLoading}>
              {actionLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Approving…</span></span>
              ) : (
                <>Confirm</>
              )}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Decline Modal */}
        <Modal open={declineIds.length > 0} onClose={closeDecline}>
          <ModalHeader
            title={`Decline ${declineIds.length} voucher${declineIds.length > 1 ? 's' : ''}`}
            action={
              <Button variant="ghost" size="icon" onClick={closeDecline}>
                <X className="w-4 h-4" />
              </Button>
            }
          />
          <ModalBody>
            <div className="space-y-3">
              <p className="text-sm text-fg-60">Provide a reason to reject the selected voucher(s).</p>
              <div>
                <label className="text-sm text-fg-60">Rejection Note</label>
                <Input
                  type="text"
                  placeholder="Enter rejection reason"
                  value={declineNote}
                  onChange={(e) => setDeclineNote(e.target.value)}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={closeDecline}>Cancel</Button>
            <Button variant="primary" onClick={doDecline} disabled={actionLoading || !declineNote}>
              {actionLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Declining…</span></span>
              ) : (
                <>Confirm</>
              )}
            </Button>
          </ModalFooter>
        </Modal>

        <ImagePreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          files={previewFiles}
          initialIndex={previewIndex}
        />

        {/* Right Panel to display rejection history for awaiting approval vouchers */}
        <RightPanel open={panelOpen} onClose={closePanel} title="Rejection History">
          <RejectionHistory voucher={panelVoucher} />
        </RightPanel>
      </div>
    </div>
  );
};

export default Requests;