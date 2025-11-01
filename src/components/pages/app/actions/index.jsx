import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Filter, MoreHorizontal, Loader2 } from "lucide-react";
import { Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Input, Select, ImagePreviewModal } from "../../../ui";
import { listUserVouchers, runVoucherOCR, getVoucherOCRJobStatus } from "../../../../api/apiFunction/voucherServices";
import { toast } from "react-toastify";

const Actions = () => {
  const { } = useOutletContext() || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedIds, setSelectedIds] = useState([]);
  // Track bulk OCR submission and per-row OCR submission states separately
  const [bulkSending, setBulkSending] = useState(false);
  const [rowSendingIds, setRowSendingIds] = useState([]);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const userId = user?.id || user?._id || user?.user_id || user?.uid;

  const [vouchers, setVouchers] = useState([]);

  // Fetch vouchers for the current user
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

  // Normalize vouchers to a consistent shape for display
  const normalized = useMemo(() => {
    const source = Array.isArray(vouchers) ? vouchers : [];
    return source.map((v) => ({
      id: v._id || v.id,
      title: v.title || v.description || "",
      category: v.category || "",
      status: v.status || "pending",
      created_at: v.created_at || v.date || "",
      files: Array.isArray(v.files) ? v.files : [],
      files_count: typeof v.files_count === "number" ? v.files_count : (Array.isArray(v.files) ? v.files.length : 0),
      ocr_status: v.OCR || v.ocr_status || undefined,
    }));
  }, [vouchers]);

  // Apply search and status filters
  const filtered = normalized.filter((v) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = `${v.id} ${v.title} ${v.category}`.toLowerCase().includes(search);
    const matchesStatus = statusFilter === "All Status" ? true : v.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Render date-time values consistently
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

  // Checkbox selections for all/individual rows on current page
  const allVisibleIds = filtered.map((v) => v.id);
  const allSelectedOnPage = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };
  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  // Open the image preview modal for the selected voucher files
  const openPreview = (files, index = 0) => {
    setPreviewFiles(Array.isArray(files) ? files : []);
    setPreviewIndex(index || 0);
    setPreviewOpen(true);
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-fg-40">Actions</h1>
              <p className="text-sm text-fg-60 mt-1">Review items and run OCR when ready.</p>
            </div>
            <div className="flex items-center space-x-3" />
          </div>
        </div>

        {/* Filters Section */}
        <div className="py-4">
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-60" strokeWidth={1.5} />
              <Input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>

            {/* Status Filter */}
            <div className="w-44">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {["All Status", "pending", "processed", "error"].map((option) => (
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

            {/* Bulk OCR button: runs OCR for selected voucher IDs only */}
            <Button
              variant="primary"
              disabled={selectedIds.length === 0 || bulkSending}
              className="whitespace-nowrap"
              onClick={async () => {
                if (!userId || selectedIds.length === 0) return;
                try {
                  setBulkSending(true);
                  const res = await runVoucherOCR({ user_id: userId, voucher_ids: selectedIds });
                  toast.success("OCR processing started");
                  // Optional: basic follow-up fetch to reflect any immediate status changes
                  setTimeout(async () => {
                    await fetchVouchers();
                  }, 1500);
                } catch (err) {
                  const message = err?.response?.data?.detail || err.message || "Failed to start OCR";
                  toast.error(message);
                } finally {
                  setBulkSending(false);
                }
              }}
            >
              Run OCR Selected ({selectedIds.length})
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

        {/* Actions Table */}
        <Table>
          <TableHeader>
            <TableRow isHeader={true}>
              <TableHead className="w-10" isFirst={true}>
                <input type="checkbox" className="form-checkbox h-4 w-4 rounded border-bd-50" checked={allSelectedOnPage} onChange={toggleSelectAll} aria-label="Select all" />
              </TableHead>
              <TableHead className="whitespace-nowrap">Item</TableHead>
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap">Files</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Created</TableHead>
              <TableHead className="w-44 whitespace-nowrap">Preview</TableHead>
              <TableHead className="whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell className="text-center" colSpan={9}>
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-fg-60" />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {filtered.length === 0 && !loading && (
              <TableRow>
                <TableCell className="text-center" colSpan={9}>
                  <div className="py-6 text-sm text-fg-60">No items found.</div>
                </TableCell>
              </TableRow>
            )}

            {filtered.map((item, index) => (
              <TableRow key={item.id} isLast={index === filtered.length - 1}>
                <TableCell>
                  <input type="checkbox" className="form-checkbox h-4 w-4 rounded border-bd-50" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} aria-label={`Select item ${item.id}`} />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">#{item.id}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-fg-40 whitespace-nowrap">{item.title || "-"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">{item.category || "-"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">{item.files_count ?? 0}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={item.status === "processed" ? "success" : item.status === "error" ? "error" : "warning"}>{String(item.status || "pending").toUpperCase()}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">{formatDateTime(item.created_at)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 w-[176px]">
                    {(item.files || []).slice(0, 3).map((f, i) => (
                      <button key={i} onClick={() => openPreview(item.files, i)} className="border border-bd-50 rounded-md p-0.5" title={f?.name || `File ${i + 1}`}>
                        <img src={f?.file_url || f?.url || ""} alt={f?.name || `File ${i + 1}`} className="w-8 h-8 rounded-md object-cover" />
                      </button>
                    ))}
                    {Array.isArray(item.files) && item.files.length > 5 && (
                      <span className="text-xs text-fg-60 whitespace-nowrap">and more…</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {/* Per-row OCR button: only disable the clicked row while processing */}
                  <Button
                    variant="primary"
                    disabled={rowSendingIds.includes(item.id)}
                    onClick={async () => {
                      if (!userId) return;
                      try {
                        setRowSendingIds((prev) => Array.from(new Set([...prev, item.id])));
                        await runVoucherOCR({ user_id: userId, voucher_ids: [item.id] });
                        toast.success(`OCR started for #${item.id}`);
                        setTimeout(async () => {
                          await fetchVouchers();
                        }, 1500);
                      } catch (err) {
                        const message = err?.response?.data?.detail || err.message || "Failed to start OCR";
                        toast.error(message);
                      } finally {
                        setRowSendingIds((prev) => prev.filter((id) => id !== item.id));
                      }
                    }}
                  >
                    Run OCR
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <ImagePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} files={previewFiles} initialIndex={previewIndex} />
      </div>
    </div>
  );
};

export default Actions;