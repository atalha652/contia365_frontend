import React from "react";

// Pure presentation — receives backend result objects directly, no computation.
const fmt = (v) => {
  const n = Number(v ?? 0);
  return isNaN(n) ? "-" : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Unwrap nested results key if present
const d = (raw) => raw?.results ?? raw ?? {};

const MetricCard = ({ label, value, sub, highlight }) => (
  <div className={`flex flex-col gap-1 px-4 py-3 rounded-xl border ${highlight ? "bg-ac-02/5 border-ac-02/30" : "bg-bg-70 border-bd-50"}`}>
    <span className="text-xs text-fg-60 font-medium">{label}</span>
    <span className={`text-lg font-bold ${highlight ? "text-ac-02" : "text-fg-40"}`}>{value ?? "-"}</span>
    {sub && <span className="text-xs text-fg-60">{sub}</span>}
  </div>
);

const SectionHeader = ({ dot, label }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className={`w-2 h-2 rounded-full ${dot}`} />
    <span className="text-sm font-semibold text-fg-40">{label}</span>
  </div>
);

export const TaxMetricsSkeleton = () => (
  <div className="grid grid-cols-2 gap-4">
    {[3, 4, 3, 3, 3, 3].map((cols, k) => (
      <div key={k} className="space-y-3 p-4 bg-bg-60 rounded-xl border border-bd-50">
        <div className="h-4 w-36 bg-bg-40 rounded animate-pulse" />
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-14 bg-bg-40 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ── Modelo 303 — VAT (quarterly) ──────────────────────────────────────────────
const Modelo303Section = ({ data }) => {
  const v = d(data);
  const isRefund = Number(v.vat_payable) < 0;
  return (
    <div className="p-4 bg-bg-60 rounded-xl border border-bd-50 space-y-3">
      <SectionHeader dot="bg-blue-500" label="Modelo 303 — VAT" />
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label="Output VAT" value={fmt(v.output_vat)} />
        <MetricCard label="Input VAT"  value={fmt(v.input_vat)} />
        <MetricCard label="VAT Payable" value={fmt(v.vat_payable)} sub={isRefund ? "Refund" : "To pay"} highlight={!isRefund} />
      </div>
    </div>
  );
};

// ── Modelo 130 — IRPF quarterly (autónomos) ───────────────────────────────────
const Modelo130Section = ({ data }) => {
  const v = d(data);
  return (
    <div className="p-4 bg-bg-60 rounded-xl border border-bd-50 space-y-3">
      <SectionHeader dot="bg-purple-500" label="Modelo 130 — IRPF" />
      <div className="grid grid-cols-4 gap-2">
        <MetricCard label="Income"         value={fmt(v.total_income   ?? v.income)} />
        <MetricCard label="Expenses"       value={fmt(v.total_expenses ?? v.expenses)} />
        <MetricCard label="Taxable Income" value={fmt(v.taxable_income)} />
        <MetricCard label="IRPF Payable"   value={fmt(v.irpf_payable)} highlight={Number(v.irpf_payable) > 0} />
      </div>
    </div>
  );
};

// ── Modelo 115 — Rental withholding (quarterly) ───────────────────────────────
// API returns: { total_rent_base, retention_rate, withholding_payable }
const Modelo115Section = ({ data }) => {
  const v = d(data);
  return (
    <div className="p-4 bg-bg-60 rounded-xl border border-bd-50 space-y-3">
      <SectionHeader dot="bg-orange-500" label="Modelo 115 — Rental Withholding" />
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label="Rental Base"      value={fmt(v.total_rent_base   ?? v.rental_income ?? v.total_rental_income)} />
        <MetricCard label="Retention Rate"   value={v.retention_rate != null ? `${(Number(v.retention_rate) * 100).toFixed(0)}%` : v.withholding_rate != null ? `${v.withholding_rate}%` : "-"} />
        <MetricCard label="Withholding"      value={fmt(v.withholding_payable ?? v.tax_withheld ?? v.withholding_amount)} highlight={Number(v.withholding_payable ?? v.tax_withheld ?? 0) > 0} />
      </div>
    </div>
  );
};

// ── Modelo 111 — Employee withholding (quarterly) ─────────────────────────────
const Modelo111Section = ({ data }) => {
  const v = d(data);
  return (
    <div className="p-4 bg-bg-60 rounded-xl border border-bd-50 space-y-3">
      <SectionHeader dot="bg-rose-500" label="Modelo 111 — Employee Withholding" />
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label="Total Salaries"  value={fmt(v.total_salaries  ?? v.total_wages)} />
        <MetricCard label="Withholding %"   value={v.withholding_rate != null ? `${v.withholding_rate}%` : "-"} />
        <MetricCard label="Tax Withheld"    value={fmt(v.tax_withheld   ?? v.withholding_amount)} highlight={Number(v.tax_withheld ?? v.withholding_amount) > 0} />
      </div>
    </div>
  );
};

// ── Modelo 390 — Annual VAT summary ──────────────────────────────────────────
const Modelo390Section = ({ data }) => {
  const v = d(data);
  return (
    <div className="p-4 bg-bg-60 rounded-xl border border-bd-50 space-y-3">
      <SectionHeader dot="bg-cyan-500" label="Modelo 390 — Annual VAT Summary" />
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label="Annual Output VAT" value={fmt(v.annual_output_vat ?? v.output_vat)} />
        <MetricCard label="Annual Input VAT"  value={fmt(v.annual_input_vat  ?? v.input_vat)} />
        <MetricCard label="Annual Balance"    value={fmt(v.annual_balance    ?? v.vat_balance)} highlight={Number(v.annual_balance ?? v.vat_balance) > 0} />
      </div>
    </div>
  );
};

// ── Modelo 190 — Annual employee withholding summary ─────────────────────────
const Modelo190Section = ({ data }) => {
  const v = d(data);
  return (
    <div className="p-4 bg-bg-60 rounded-xl border border-bd-50 space-y-3">
      <SectionHeader dot="bg-emerald-500" label="Modelo 190 — Annual Withholding Summary" />
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label="Total Salaries"      value={fmt(v.total_salaries      ?? v.total_wages)} />
        <MetricCard label="Total Withheld"      value={fmt(v.total_withheld      ?? v.total_tax_withheld)} />
        <MetricCard label="Employees Reported"  value={v.employees_count ?? v.total_employees ?? "-"} />
      </div>
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────
const TaxMetricsCards = ({ modelo303, modelo130, modelo115, modelo111, modelo390, modelo190 }) => {
  const hasAny = modelo303 || modelo130 || modelo115 || modelo111 || modelo390 || modelo190;
  if (!hasAny) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      {modelo303  && <Modelo303Section  data={modelo303} />}
      {modelo130  && <Modelo130Section  data={modelo130} />}
      {modelo115  && <Modelo115Section  data={modelo115} />}
      {modelo111  && <Modelo111Section  data={modelo111} />}
      {modelo390  && <Modelo390Section  data={modelo390} />}
      {modelo190  && <Modelo190Section  data={modelo190} />}
    </div>
  );
};

export default TaxMetricsCards;
