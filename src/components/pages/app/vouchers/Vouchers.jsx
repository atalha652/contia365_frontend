import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Search,
  MoreHorizontal,
  Plus,
  Upload,
  Filter,
  Download,
  X,
} from "lucide-react";
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
} from "../../../ui";
import UploadVoucherModal from "./UploadVoucherModal";

const Vouchers = () => {
  const { invoices = [], voucherRequests = [], createInvoice, addVoucherRequests } = useOutletContext() || {};

  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({ customer: "", amount: "", description: "" });
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };


  const moveSelectedToRequests = () => {
    if (selectedIds.length === 0) return;
    addVoucherRequests?.(selectedIds);
    setSelectedIds([]);
  };

  // Actions moved to Requests page; keep selected id helper as needed
  const openPaymentForm = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
  };

  const handleCreateInvoice = () => {
    createInvoice(invoiceForm);
    setInvoiceForm({ customer: "", amount: "", description: "" });
    setShowInvoiceForm(false);
  };

  // Payment confirmation occurs in Requests page now

  const filteredInvoices = (invoices || []).filter((inv) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = `${inv.id} ${inv.customer} ${inv.description}`
      .toLowerCase()
      .includes(search);
    const matchesStatus =
      statusFilter === "All Status"
        ? true
        : statusFilter === "Paid"
          ? inv.status === "paid"
          : inv.status === "pending";
    return matchesSearch && matchesStatus;
  });

  const allVisibleIds = filteredInvoices?.map?.((inv) => inv.id) || [];
  const allSelectedOnPage = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-fg-40">Vouchers</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="primary" className="space-x-2" onClick={() => setShowUploadModal(true)}>
                <Upload className="w-4 h-4" strokeWidth={1.5} />
                <span>Upload Voucher</span>
              </Button>
              <Button
                variant="secondary"
                className="space-x-2"
                onClick={() => setShowInvoiceForm(true)}
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                <span>Create Voucher</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="py-4">
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-60"
                strokeWidth={1.5}
              />
              <Input
                type="text"
                placeholder="Search vouchers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {[
                "All Status",
                "Paid",
                "Pending",
              ].map((option) => (
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
              variant="primary"
              onClick={moveSelectedToRequests}
              disabled={selectedIds.length === 0}
              className="whitespace-nowrap"
            >
              Send to Requests ({selectedIds.length})
            </Button>
          </div>
        </div>

        {/* Upload Voucher Modal */}
        <UploadVoucherModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploaded={() => {
            // Optional: refresh or notify; currently no vouchers list source
          }}
        />

        <Modal open={showInvoiceForm} onClose={() => setShowInvoiceForm(false)}>
          <ModalHeader
            title="New Voucher"
            action={
              <Button variant="ghost" size="icon" onClick={() => setShowInvoiceForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            }
          />
          <ModalBody>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-fg-60 mb-1">Customer Name</label>
                <Input
                  type="text"
                  value={invoiceForm.customer}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, customer: e.target.value })
                  }
                  placeholder="e.g., ABC Company"
                />
              </div>
              <div>
                <label className="block text-sm text-fg-60 mb-1">Amount ($)</label>
                <Input
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, amount: e.target.value })
                  }
                  placeholder="e.g., 5000"
                />
              </div>
              <div>
                <label className="block text-sm text-fg-60 mb-1">Description</label>
                <Input
                  type="text"
                  value={invoiceForm.description}
                  onChange={(e) =>
                    setInvoiceForm({ ...invoiceForm, description: e.target.value })
                  }
                  placeholder="e.g., Web Development Services"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowInvoiceForm(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateInvoice}>
              Save Voucher
            </Button>
          </ModalFooter>
        </Modal>

        {/* Payment confirmation moved to Requests page */}

        {/* Vouchers Table */}
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
              <TableHead className="whitespace-nowrap">
                Voucher
              </TableHead>
              <TableHead className="whitespace-nowrap">Customer</TableHead>
              <TableHead className="whitespace-nowrap">Description</TableHead>
              <TableHead className="whitespace-nowrap">Amount</TableHead>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="w-12" isLast={true}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice, index) => (
              <TableRow key={invoice.id} isLast={index === filteredInvoices.length - 1}>
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
                    <span className="text-sm font-medium text-fg-40 whitespace-nowrap">
                      {invoice.customer}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">
                    {invoice.description}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-fg-40 whitespace-nowrap">
                    ${invoice.amount?.toLocaleString?.() ?? invoice.amount}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-fg-60 whitespace-nowrap">
                    {invoice.date}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={invoice.status === "paid" ? "success" : "warning"}>
                    {invoice.status === "paid" ? "PAID" : "PENDING"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {voucherRequests.includes(invoice.id) ? (
                    <Badge variant="info">IN PROGRESS</Badge>
                  ) : (
                    <span className="text-xs text-fg-60"></span>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {filteredInvoices.length === 0 && (
              <TableRow>
                <TableCell className="text-center" colSpan={8}>
                  <span className="text-sm text-fg-60">No vouchers match your filters.</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Vouchers;