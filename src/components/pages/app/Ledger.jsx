import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Filter, MoreHorizontal, Download } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/Table";
import { Input } from "../../ui/Input";
import { Button, Select } from "../../ui";

const Ledger = () => {
  const { journalEntries = [] } = useOutletContext() || {};
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");

  const rows = useMemo(() => {
    return journalEntries.flatMap((entry) =>
      (entry?.entries || []).map((line, idx) => ({
        key: `${entry.id}-${idx}`,
        date: entry.date,
        description: entry.description,
        type: entry.type,
        account: line.account,
        debit: Number(line.debit || 0),
        credit: Number(line.credit || 0),
      }))
    );
  }, [journalEntries]);

  const types = useMemo(() => {
    const set = new Set(rows.map((r) => r.type).filter(Boolean));
    return ["All Types", ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    let result = rows;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((r) =>
        r.account?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.type?.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "All Types") {
      result = result.filter((r) => r.type === typeFilter);
    }
    return result;
  }, [rows, query, typeFilter]);

  const totals = useMemo(() => {
    return {
      debit: filtered.reduce((sum, r) => sum + (r.debit || 0), 0),
      credit: filtered.reduce((sum, r) => sum + (r.credit || 0), 0),
    };
  }, [filtered]);

  const downloadCsv = () => {
    const header = ["Date", "Description", "Type", "Account", "Debit", "Credit"].join(",");
    const lines = filtered.map((r) =>
      [r.date, r.description, r.type, r.account, r.debit, r.credit]
        .map((v) => (typeof v === "string" ? '"' + v.replace(/"/g, '""') + '"' : v))
        .join(",")
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ledger.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-fg-40">Ledger</h1>
              <p className="text-sm text-fg-60 mt-1">A detailed record of all financial transactions classified by account.</p>
            </div>
          </div>
        </div>

        {/* Tools Section: search should flex to fill remaining space, filter has fixed width */}
        <div className="py-4">
          <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-60" strokeWidth={1.5} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ledger..."
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <div className="w-44">
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
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

          {/* Download Ledger */}
          <Button variant="primary" className="whitespace-nowrap" onClick={downloadCsv}>
            <Download className="w-4 h-4" strokeWidth={1.5} />
            <span>Download Ledger</span>
          </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-bg-50 border border-bd-50 rounded-xl overflow-hidden">
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[200px]">Account</TableHead>
                  <TableHead className="w-[120px] text-right">Debit</TableHead>
                  <TableHead className="w-[120px] text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.key}>
                    <TableCell className="text-xs text-fg-70">{r.date}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span className="text-fg-60">{r.description}</span>
                        <span className="text-[11px] text-fg-50/60">{r.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-fg-70">{r.account}</TableCell>
                    <TableCell className="text-right text-xs text-ac-03">
                      {r.debit > 0 ? `$${r.debit.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="text-right text-xs text-wa-03">
                      {r.credit > 0 ? `$${r.credit.toLocaleString()}` : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals row */}
                <TableRow>
                  <TableCell colSpan={3} className="text-xs font-medium">TOTAL</TableCell>
                  <TableCell className="text-right text-xs font-semibold text-ac-03">
                    ${totals.debit.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold text-wa-03">
                    ${totals.credit.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-fg-60">No entries yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ledger;