import React, { useState } from "react";
import { Search, Filter, MoreHorizontal, Download, RefreshCw } from "lucide-react";
import { Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Input, Select } from "../../ui";

// Static data for bank transactions
const staticTransactions = [
  {
    id: "TXN001",
    date: "Nov, 18, 2025 10:30 AM",
    description: "Payment to Supplier ABC",
    reference: "REF-2025-001",
    debit: 5000,
    credit: 0,
    balance: 45000,
    type: "debit",
    status: "completed",
  },
  {
    id: "TXN002",
    date: "Nov, 17, 2025 02:15 PM",
    description: "Customer Payment Received",
    reference: "REF-2025-002",
    debit: 0,
    credit: 12000,
    balance: 50000,
    type: "credit",
    status: "completed",
  },
  {
    id: "TXN003",
    date: "Nov, 16, 2025 09:45 AM",
    description: "Office Rent Payment",
    reference: "REF-2025-003",
    debit: 8000,
    credit: 0,
    balance: 38000,
    type: "debit",
    status: "completed",
  },
  {
    id: "TXN004",
    date: "Nov, 15, 2025 11:20 AM",
    description: "Sales Revenue",
    reference: "REF-2025-004",
    debit: 0,
    credit: 15000,
    balance: 46000,
    type: "credit",
    status: "completed",
  },
  {
    id: "TXN005",
    date: "Nov, 14, 2025 03:30 PM",
    description: "Utility Bills Payment",
    reference: "REF-2025-005",
    debit: 2500,
    credit: 0,
    balance: 31000,
    type: "debit",
    status: "pending",
  },
];

const BankTransactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading] = useState(false);

  // Format currency
  const formatCurrency = (value) => {
    return value > 0 ? `$${value.toLocaleString()}` : "-";
  };

  // Filter transactions
  const filtered = staticTransactions.filter((txn) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = `${txn.id} ${txn.description} ${txn.reference}`.toLowerCase().includes(search);
    const matchesStatus = statusFilter === "All Status" ? true : txn.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalDebit = filtered.reduce((sum, txn) => sum + txn.debit, 0);
  const totalCredit = filtered.reduce((sum, txn) => sum + txn.credit, 0);

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-fg-40">Bank Transactions</h1>
              <p className="text-sm text-fg-60 mt-1">View and manage your bank transactions.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary">
                <RefreshCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
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
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="w-44">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {["All Status", "completed", "pending", "failed"].map((option) => (
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

            {/* Download CSV */}
            <Button variant="primary" className="whitespace-nowrap flex items-center gap-2">
              <Download className="w-4 h-4" strokeWidth={1.5} />
              <span>Download CSV</span>
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <Table>
          <TableHeader>
            <TableRow isHeader={true}>
              <TableHead className="whitespace-nowrap">Transaction ID</TableHead>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="whitespace-nowrap">Description</TableHead>
              <TableHead className="whitespace-nowrap">Reference</TableHead>
              <TableHead className="whitespace-nowrap">Debit</TableHead>
              <TableHead className="whitespace-nowrap">Credit</TableHead>
              <TableHead className="whitespace-nowrap">Balance</TableHead>
              <TableHead className="whitespace-nowrap">Type</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton loading rows
              [...Array(5)].map((_, i) => (
                <TableRow key={i} isLast={i === 4}>
                  {/* Transaction ID skeleton */}
                  <TableCell>
                    <div className="h-3 w-20 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Date skeleton */}
                  <TableCell>
                    <div className="h-3 w-32 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Description skeleton */}
                  <TableCell>
                    <div className="h-3 w-40 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Reference skeleton */}
                  <TableCell>
                    <div className="h-3 w-24 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Debit skeleton */}
                  <TableCell>
                    <div className="h-3 w-16 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Credit skeleton */}
                  <TableCell>
                    <div className="h-3 w-16 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Balance skeleton */}
                  <TableCell>
                    <div className="h-3 w-20 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Type badge skeleton */}
                  <TableCell>
                    <div className="h-6 w-16 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                  {/* Status badge skeleton */}
                  <TableCell>
                    <div className="h-6 w-20 bg-bg-40 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {filtered.map((txn, index) => (
                  <TableRow key={txn.id} isLast={index === filtered.length - 1}>
                    <TableCell>
                      <span className="text-sm text-fg-60 whitespace-nowrap">{txn.id}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-fg-60 whitespace-nowrap">{txn.date}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-fg-40 whitespace-nowrap">{txn.description}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-fg-60 whitespace-nowrap">{txn.reference}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-fg-60 whitespace-nowrap">{formatCurrency(txn.debit)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-fg-60 whitespace-nowrap">{formatCurrency(txn.credit)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-fg-40 whitespace-nowrap">{formatCurrency(txn.balance)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={txn.type === "credit" ? "success" : "error"}>
                        {txn.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={txn.status === "completed" ? "success" : txn.status === "pending" ? "warning" : "error"}>
                        {txn.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center" colSpan={9}>
                      <span className="text-sm text-fg-60">No transactions found.</span>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>

        {/* Summary Section */}
        <div className="flex items-center justify-end py-3 space-x-6">
          <div className="text-sm text-fg-60">
            Total Debit: <span className="font-semibold text-red-600">{formatCurrency(totalDebit)}</span>
          </div>
          <div className="text-sm text-fg-60">
            Total Credit: <span className="font-semibold text-green-600">{formatCurrency(totalCredit)}</span>
          </div>
          <div className="text-sm text-fg-60">
            Net: <span className="font-semibold text-fg-40">{formatCurrency(totalCredit - totalDebit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankTransactions;
