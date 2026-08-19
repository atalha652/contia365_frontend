import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, RotateCw, FileText, Eye, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  Button, Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell, Badge, Input, Select,
} from "../../../ui";
import { listInvoices } from "../../../../api/apiFunction/invoiceServices";

const STATUS_VARIANTS = {
  draft: "warning",
  issued: "success",
  submitted: "info",
  cancelled: "error",
};

const fmt = (v) => {
  const n = Number(v || 0);
  return n ? `€${n.toLocaleString("es-ES", { minimumFractionDigits: 2 })}` : "—";
};

const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await listInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const filtered = useMemo(() => {
    let list = invoices;
    if (statusFilter !== "all") list = list.filter((i) => i.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        (i.invoice_number || "").toLowerCase().includes(q) ||
        (i.customer?.name || i.customer?.company_name || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoices, statusFilter, search]);

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="pt-8 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-fg-40">Invoices</h1>
            <p className="text-sm text-fg-60 mt-1">Manage your invoice lifecycle.</p>
          </div>
          <Button variant="secondary" onClick={fetchInvoices}>
            <RotateCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="py-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-60" strokeWidth={1.5} />
            <Input placeholder="Search by number or customer…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="w-44">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="submitted">Submitted</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
          <Button variant="secondary" size="icon">
            <Filter className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow isHeader>
              <TableHead isFirst>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} isLast={i === 4}>
                  {[...Array(7)].map((__, j) => (
                    <TableCell key={j}><div className="h-3 w-24 bg-bg-40 rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                {filtered.map((inv, idx) => {
                  const id = inv._id || inv.id;
                  const isDraft = inv.status === "draft";
                  return (
                    <TableRow key={id} isLast={idx === filtered.length - 1}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-fg-60" strokeWidth={1.5} />
                          <span className="text-sm font-medium text-fg-40">
                            {inv.invoice_number || <span className="text-fg-60 italic">Draft</span>}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-fg-60">
                          {inv.customer?.name || inv.customer?.company_name || "—"}
                        </span>
                      </TableCell>
                      <TableCell><span className="text-sm text-fg-60">{fmtDate(inv.issue_date || inv.created_at)}</span></TableCell>
                      <TableCell><span className="text-sm text-fg-60">{fmtDate(inv.due_date)}</span></TableCell>
                      <TableCell><span className="text-sm font-medium text-fg-40">{fmt(inv.totals?.total_amount ?? inv.total)}</span></TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[inv.status] || "info"}>
                          {String(inv.status || "draft").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isDraft ? (
                            <Button variant="secondary" size="sm" onClick={() => navigate(`/app/invoices/${id}`)}>
                              Edit
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/app/invoices/view/${id}`)}>
                              <Eye className="w-4 h-4 mr-1" strokeWidth={1.5} />
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <span className="text-sm text-fg-60">No invoices found.</span>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InvoiceList;
