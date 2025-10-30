import React, { useMemo, useState } from "react";
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
  Avatar,
  Input,
  Select,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "../../ui";
import { Check, Filter, MoreHorizontal, Search, X } from "lucide-react";

const Requests = () => {
  const {
    invoices = [],
    voucherRequests = [],
    approveVoucherRequest,
    setVoucherRequests,
  } = useOutletContext() || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmIds, setConfirmIds] = useState([]);

  const requested = useMemo(
    () => invoices.filter((inv) => voucherRequests.includes(inv.id)),
    [invoices, voucherRequests]
  );

  const filtered = requested.filter((inv) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = `${inv.id} ${inv.customer} ${inv.description}`.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "All Status"
        ? true
        : statusFilter === "Paid"
        ? inv.status === "paid"
        : inv.status === "pending";
    return matchesSearch && matchesStatus;
  });

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

  const confirmApprove = (ids) => setConfirmIds(ids);
  const closeConfirm = () => setConfirmIds([]);
  const doApprove = () => {
    confirmIds.forEach((id) => approveVoucherRequest?.(id));
    setSelectedIds((prev) => prev.filter((id) => !confirmIds.includes(id)));
    setConfirmIds([]);
  };

  const declineSelected = () => {
    if (selectedIds.length === 0) return;
    setVoucherRequests?.((prev) => prev.filter((id) => !selectedIds.includes(id)));
    setSelectedIds([]);
  };

  const declineOne = (id) => {
    setVoucherRequests?.((prev) => prev.filter((x) => x !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
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
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {["All Status", "Paid", "Pending"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>

            {/* More Filters */}
            <Button variant="secondary" size="icon">
              <Filter className="w-4 h-4" strokeWidth={1.5} />
            </Button>

            {/* More Options */}
            <Button variant="secondary" size="icon">
              <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
            </Button>

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

        {/* Requests Table (match Vouchers layout: no extra wrapper) */}
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
              <TableHead className="whitespace-nowrap">Voucher</TableHead>
              <TableHead className="whitespace-nowrap">Customer</TableHead>
              <TableHead className="whitespace-nowrap">Description</TableHead>
              <TableHead className="whitespace-nowrap">Amount</TableHead>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="w-12" isLast={true}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((invoice, index) => (
              <TableRow key={invoice.id} isLast={index === filtered.length - 1}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 rounded border-bd-50"
                    checked={selectedIds.includes(invoice.id)}
                    onChange={() => toggleSelect(invoice.id)}
                    aria-label={`Select voucher #${invoice.id}`}
                  />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">#{invoice.id}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>{String(invoice.customer || "").charAt(0)}</Avatar>
                    <span className="text-sm font-medium text-fg-40 whitespace-nowrap">{invoice.customer}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">{invoice.description}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-fg-40 whitespace-nowrap">${invoice.amount?.toLocaleString?.() ?? invoice.amount}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">{invoice.date}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={invoice.status === "paid" ? "success" : "warning"}>
                    {invoice.status === "paid" ? "PAID" : "PENDING"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {invoice.status !== "paid" && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="space-x-1"
                        onClick={() => declineOne(invoice.id)}
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="space-x-1"
                        onClick={() => confirmApprove([invoice.id])}
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
                <TableCell className="text-center" colSpan={8}>
                  <span className="text-sm text-fg-60">No voucher requests yet.</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Confirm Modal */}
        <Modal open={confirmIds.length > 0} onClose={closeConfirm}>
          <ModalHeader
            title={`Confirm Approve ${confirmIds.length} voucher${confirmIds.length > 1 ? 's' : ''}`}
            action={
              <Button variant="ghost" size="icon" onClick={closeConfirm}>
                <X className="w-4 h-4" />
              </Button>
            }
          />
          <ModalBody>
            <p className="text-sm text-fg-60">
              This will mark the selected voucher(s) as PAID and create corresponding bank and journal entries.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={closeConfirm}>Cancel</Button>
            <Button variant="primary" onClick={doApprove}>Confirm</Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default Requests;