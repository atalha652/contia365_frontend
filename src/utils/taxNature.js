export const OPERATION_TYPES = [
  { value: "general", label: "General IVA" },
  { value: "isp", label: "Reverse charge (ISP)" },
  { value: "intra", label: "Intra-community" },
  { value: "import", label: "Import" },
  { value: "recargo", label: "Recargo de equivalencia" },
  { value: "used_goods", label: "Used goods (REBU)" },
  { value: "investment", label: "Investment goods" },
];

export const WITHHOLDING_TYPES = [
  { value: "none", label: "No withholding" },
  { value: "irpf_work", label: "IRPF — work / generic" },
  { value: "professional", label: "Professional (Modelo 111)" },
  { value: "rental", label: "Rental (Modelo 115)" },
];

export const operationLabel = (value) =>
  OPERATION_TYPES.find((item) => item.value === value)?.label || value || "General IVA";

export const withholdingLabel = (value) =>
  WITHHOLDING_TYPES.find((item) => item.value === value)?.label || value || "No withholding";

export const entryOperationType = (entry) =>
  entry?.invoice_data?.operation_type
  || entry?.operation_type
  || entry?.invoice_data?.totals?.vat_regime
  || "general";

export const entryWithholdingType = (entry) =>
  entry?.invoice_data?.withholding_type || entry?.withholding_type || "none";

export const matchedModelos = (entry) => {
  const matched = entry?.tax_classification?.matched_modelos;
  return Array.isArray(matched) ? matched : [];
};

export const matchedModeloNos = (entry) =>
  matchedModelos(entry).map((item) => String(item?.modelo_no || "")).filter(Boolean);

export const entryHasModelo = (entry, modeloNo) =>
  matchedModeloNos(entry).includes(String(modeloNo));

const parseEntryDate = (entry) => {
  const period = String(entry?.period || "");
  const [year, month] = period.split("-").map(Number);
  if (year && month) return { year, month };
  const raw = entry?.invoice_data?.invoice?.invoice_date || entry?.transaction_date || entry?.created_at;
  const date = raw ? new Date(raw) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
};

export const entryInPeriod = (entry, { year, quarter = null, month = null, annual = false }) => {
  const parsed = parseEntryDate(entry);
  if (!parsed) return false;
  if (parsed.year !== Number(year)) return false;
  if (annual) return true;
  if (month) return parsed.month === Number(month);
  if (quarter) {
    const start = (Number(quarter) - 1) * 3 + 1;
    return parsed.month >= start && parsed.month < start + 3;
  }
  return true;
};

export const invoiceLabel = (entry) =>
  entry?.invoice_data?.invoice?.invoice_number
  || entry?.description
  || "Untitled invoice";
