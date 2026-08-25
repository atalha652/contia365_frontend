/** Shared tax-period helpers for quarterly vs monthly 303 (REDEME). */

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const MONTHS = MONTH_NAMES.map((fullLabel, index) => ({
  id: index + 1,
  label: fullLabel.slice(0, 3),
  fullLabel,
  color: [
    "from-blue-500 to-cyan-500",
    "from-blue-500 to-cyan-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-green-500 to-emerald-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-amber-500",
    "from-orange-500 to-amber-500",
    "from-orange-500 to-amber-500",
    "from-purple-500 to-pink-500",
    "from-purple-500 to-pink-500",
    "from-purple-500 to-pink-500",
  ][index],
}));

export const quarterFromMonth = (month) => Math.ceil(Number(month) / 3);

export const parseMonthParam = (raw) => {
  if (raw == null || raw === "") return null;
  const text = String(raw).trim();
  const asNumber = Number(text);
  if (Number.isInteger(asNumber) && asNumber >= 1 && asNumber <= 12) return asNumber;
  const named = MONTH_NAMES.findIndex(
    (name) => name.toLowerCase() === text.toLowerCase()
      || name.slice(0, 3).toLowerCase() === text.toLowerCase()
  );
  if (named >= 0) return named + 1;
  const iso = text.match(/(?:^|-)(\d{2})$/);
  if (iso) {
    const month = Number(iso[1]);
    if (month >= 1 && month <= 12) return month;
  }
  return null;
};

export const monthName = (month) => MONTH_NAMES[Number(month) - 1] || "";

export const monthlyPeriodKey = (year, month) =>
  `${year}-${String(month).padStart(2, "0")}`;

export const isMonthly303 = (profile) => {
  const item = (profile?.periodic_tax_obligations || []).find(
    (row) => String(row?.modelo || "") === "303"
  );
  if (!item) return false;
  if (item.redeme === true) return true;
  return String(item.periodicity || "").toUpperCase() === "MENSUAL";
};

export const isMonthlyModelo = (profile, modelo) => {
  if (String(modelo) !== "303") return false;
  return isMonthly303(profile);
};

export const formatFilingPeriod = (filing) => {
  if (!filing) return "";
  const year = filing.year || "";
  const month = Number(filing.month) || parseMonthParam(filing.period_key);
  if (month) return `${monthName(month)} ${year}`.trim();
  const quarter = filing.quarter || filing.current_period;
  if (quarter && !["ANNUAL", "ANUAL", "ALL"].includes(String(quarter).toUpperCase())) {
    return `${quarter} ${year}`.trim();
  }
  return year ? `Annual ${year}` : "Annual";
};

export const filingPeriodQuery = ({ year, semester, month }) => {
  const params = new URLSearchParams();
  if (year) params.set("year", String(year));
  if (semester) params.set("semester", String(semester));
  if (month) params.set("month", String(month));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};
