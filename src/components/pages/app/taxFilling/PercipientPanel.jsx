import { useEffect, useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "../../../ui";
import {
  createPercipient,
  deletePercipient,
  listPercipients,
} from "../../../../api/apiFunction/percipientServices";
import { formatTaxFilingError } from "../../../../api/apiFunction/taxFilingServices";

const KEY_OPTIONS = [
  { value: "A", label: "A — Employment" },
  { value: "G", label: "G — Professional" },
];

const emptyForm = {
  nif: "",
  full_name: "",
  perception_key: "G",
  perception_subkey: "01",
  base_amount: "",
  withheld_amount: "",
  province_code: "",
  kind: "professional",
};

const PercipientPanel = ({ modeloNo, year, quarter, onChanged }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      setLoading(true);
      const data = await listPercipients({
        year,
        quarter: modeloNo === "111" ? quarter : undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(formatTaxFilingError(err, "Failed to load percipients"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!year) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, quarter, modeloNo]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.nif.trim() || !form.full_name.trim()) {
      toast.error("NIF and name are required");
      return;
    }
    try {
      setSaving(true);
      await createPercipient({
        nif: form.nif.trim(),
        full_name: form.full_name.trim(),
        perception_key: form.perception_key,
        perception_subkey: form.perception_subkey || "01",
        year: Number(year),
        quarter: modeloNo === "111" ? quarter : undefined,
        base_amount: Number(form.base_amount || 0),
        withheld_amount: Number(form.withheld_amount || 0),
        province_code: form.province_code.trim() || undefined,
        kind: form.perception_key === "A" ? "employee" : "professional",
      });
      setForm(emptyForm);
      await load();
      onChanged?.();
      toast.success("Percipient saved. Recalculate the filing to include this line.");
    } catch (err) {
      toast.error(formatTaxFilingError(err, "Could not save percipient"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const id = row.id || row._id;
    if (!id) return;
    try {
      await deletePercipient(id);
      await load();
      onChanged?.();
      toast.success("Percipient removed. Recalculate the filing.");
    } catch (err) {
      toast.error(formatTaxFilingError(err, "Could not delete percipient"));
    }
  };

  const money = (value) =>
    `€${Number(value || 0).toLocaleString("es-ES", { minimumFractionDigits: 2 })}`;

  return (
    <div className="bg-bg-50 border border-bd-50 rounded-2xl p-5 mb-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-fg-40 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Percipients
          </h2>
          <p className="text-xs text-fg-60 mt-1">
            Modelo {modeloNo} cannot be sent to AEAT without employee or professional
            withholding lines. {modeloNo === "190"
              ? "These are annual summary lines, not an income return."
              : "Add each person paid this quarter."}
          </p>
        </div>
        <span className="text-xs text-fg-60">{rows.length} record{rows.length === 1 ? "" : "s"}</span>
      </div>

      <div className="overflow-auto border border-bd-50 rounded-xl mb-4">
        <table className="w-full text-sm">
          <thead className="bg-bg-60 text-xs text-fg-60">
            <tr>
              <th className="text-left px-3 py-2 font-medium">NIF</th>
              <th className="text-left px-3 py-2 font-medium">Name</th>
              <th className="text-left px-3 py-2 font-medium">Key</th>
              {modeloNo === "190" && (
                <th className="text-left px-3 py-2 font-medium">Quarter</th>
              )}
              <th className="text-right px-3 py-2 font-medium">Base</th>
              <th className="text-right px-3 py-2 font-medium">Withheld</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-fg-60">Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-fg-60">
                  No percipient records yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id || row._id} className="border-t border-bd-50">
                  <td className="px-3 py-2 text-fg-40 font-medium">{row.nif}</td>
                  <td className="px-3 py-2 text-fg-40">{row.full_name}</td>
                  <td className="px-3 py-2 text-fg-60">{row.perception_key}{row.perception_subkey ? `.${row.perception_subkey}` : ""}</td>
                  {modeloNo === "190" && (
                    <td className="px-3 py-2 text-fg-60">{row.quarter || "—"}</td>
                  )}
                  <td className="px-3 py-2 text-right text-fg-40">{money(row.base_amount)}</td>
                  <td className="px-3 py-2 text-right text-fg-40">{money(row.withheld_amount)}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      className="p-1.5 rounded-lg text-fg-60 hover:text-red-500 hover:bg-bg-60"
                      aria-label="Delete percipient"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleAdd} className="grid sm:grid-cols-2 lg:grid-cols-6 gap-2">
        <input
          value={form.nif}
          onChange={(e) => setField("nif", e.target.value.toUpperCase())}
          placeholder="NIF"
          className="px-3 py-2 text-sm bg-bg-60 border border-bd-50 rounded-lg text-fg-40"
        />
        <input
          value={form.full_name}
          onChange={(e) => setField("full_name", e.target.value)}
          placeholder="Full name"
          className="px-3 py-2 text-sm bg-bg-60 border border-bd-50 rounded-lg text-fg-40 lg:col-span-2"
        />
        <select
          value={form.perception_key}
          onChange={(e) => setField("perception_key", e.target.value)}
          className="px-3 py-2 text-sm bg-bg-60 border border-bd-50 rounded-lg text-fg-40"
        >
          {KEY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          value={form.base_amount}
          onChange={(e) => setField("base_amount", e.target.value)}
          placeholder="Base"
          className="px-3 py-2 text-sm bg-bg-60 border border-bd-50 rounded-lg text-fg-40"
        />
        <input
          type="number"
          step="0.01"
          value={form.withheld_amount}
          onChange={(e) => setField("withheld_amount", e.target.value)}
          placeholder="Withheld"
          className="px-3 py-2 text-sm bg-bg-60 border border-bd-50 rounded-lg text-fg-40"
        />
        <div className="sm:col-span-2 lg:col-span-6 flex justify-end">
          <Button type="submit" variant="secondary" disabled={saving}>
            <Plus className="w-4 h-4 mr-2" />
            {saving ? "Saving…" : "Add percipient"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PercipientPanel;
