import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  ExternalLink,
  MapPin,
  UserCheck,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getBusinessProfile,
  updateBusinessProfile,
} from "../../../../api/apiFunction/onboardingServices";

const COMPANY_TYPES = [
  { value: "S.L.", label: "S.L. — Sociedad Limitada" },
  { value: "S.A.", label: "S.A. — Sociedad Anónima" },
  { value: "S.L.U.", label: "S.L.U. — Sociedad Limitada Unipersonal" },
  { value: "S.C.P.", label: "S.C.P. — Sociedad Civil Profesional" },
  { value: "C.B.", label: "C.B. — Comunidad de Bienes" },
  { value: "S.L.L.", label: "S.L.L. — Sociedad Laboral Limitada" },
  { value: "S.A.L.", label: "S.A.L. — Sociedad Laboral Anónima" },
  { value: "Cooperativa", label: "Cooperativa" },
  { value: "Asociación", label: "Asociación" },
  { value: "Fundación", label: "Fundación" },
  { value: "Other", label: "Other" },
];

const REP_ROLES = [
  { value: "administrador", label: "Administrador" },
  { value: "representante_legal", label: "Representante Legal" },
  { value: "apoderado", label: "Apoderado" },
];

const CompanySettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    legal_name: "",
    cif: "",
    company_type: "S.L.",
    address_line: "",
    postal_code: "",
    city: "",
    province: "",
  });

  const [repForm, setRepForm] = useState({
    full_name: "",
    dni_nie: "",
    role: "administrador",
  });

  const [aeatConn, setAeatConn] = useState(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getBusinessProfile();
      if (data) {
        const comp = data.company || {};
        const addr = comp.tax_address || {};
        const rep = data.representative || {};

        setCompanyForm({
          legal_name: comp.legal_name || "",
          cif: comp.cif || "",
          company_type: comp.company_type || "S.L.",
          address_line: addr.address_line || "",
          postal_code: addr.postal_code || "",
          city: addr.city || "",
          province: addr.province || "",
        });

        setRepForm({
          full_name: rep.full_name || "",
          dni_nie: rep.dni_nie || "",
          role: rep.role || "administrador",
        });

        setAeatConn(data.aeat_connection || null);
      }
    } catch (err) {
      toast.error("Failed to load company profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!companyForm.legal_name.trim()) {
      toast.error("Legal name is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        legal_name: companyForm.legal_name.trim(),
        company_type: companyForm.company_type,
        tax_address: {
          address_line: companyForm.address_line.trim(),
          postal_code: companyForm.postal_code.trim(),
          city: companyForm.city.trim(),
          province: companyForm.province.trim(),
        },
        representative_full_name: repForm.full_name.trim(),
        representative_role: repForm.role,
      };

      const res = await updateBusinessProfile(payload);
      if (res?.status === 200 || res?.status === 201) {
        toast.success("Company profile updated successfully.");
        await loadProfile();
      } else {
        toast.error(res?.data?.detail || "Failed to update profile.");
      }
    } catch (err) {
      toast.error("Network error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#582dee] animate-spin" />
      </div>
    );
  }

  const isConnected = aeatConn?.connected === true;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#582dee]" />
            Company Profile & Fiscal Information
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your registered corporate entity, tax address, and authorized representative.
          </p>
        </div>
        <button
          onClick={loadProfile}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Company Legal Identity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-[#582dee]" />
            <h2 className="text-base font-semibold text-slate-800">
              Corporate Legal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Legal Name / Razón Social *
              </label>
              <input
                type="text"
                value={companyForm.legal_name}
                onChange={(e) =>
                  setCompanyForm((prev) => ({ ...prev, legal_name: e.target.value }))
                }
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#582dee]/30 focus:border-[#582dee]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                <span>Company NIF / CIF</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-normal text-slate-400">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={companyForm.cif}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 font-mono cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                CIF is linked to your AEAT tax identification. To update, contact support.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Company Entity Type
              </label>
              <select
                value={companyForm.company_type}
                onChange={(e) =>
                  setCompanyForm((prev) => ({ ...prev, company_type: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#582dee]/30 focus:border-[#582dee]"
              >
                {COMPANY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Fiscal Address (Domicilio Fiscal) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-[#582dee]" />
            <h2 className="text-base font-semibold text-slate-800">
              Tax Address (Domicilio Fiscal)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Street Address
              </label>
              <input
                type="text"
                value={companyForm.address_line}
                onChange={(e) =>
                  setCompanyForm((prev) => ({ ...prev, address_line: e.target.value }))
                }
                placeholder="Calle Gran Vía 1, 3º Izq"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#582dee]/30 focus:border-[#582dee]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Postal Code
              </label>
              <input
                type="text"
                value={companyForm.postal_code}
                onChange={(e) =>
                  setCompanyForm((prev) => ({ ...prev, postal_code: e.target.value }))
                }
                placeholder="28013"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#582dee]/30 focus:border-[#582dee]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                City / Municipio
              </label>
              <input
                type="text"
                value={companyForm.city}
                onChange={(e) =>
                  setCompanyForm((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="Madrid"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#582dee]/30 focus:border-[#582dee]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Province
              </label>
              <input
                type="text"
                value={companyForm.province}
                onChange={(e) =>
                  setCompanyForm((prev) => ({ ...prev, province: e.target.value }))
                }
                placeholder="Madrid"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#582dee]/30 focus:border-[#582dee]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Authorized Representative */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-5 h-5 text-[#582dee]" />
            <h2 className="text-base font-semibold text-slate-800">
              Authorized Representative
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Representative Full Name
              </label>
              <input
                type="text"
                value={repForm.full_name}
                onChange={(e) =>
                  setRepForm((prev) => ({ ...prev, full_name: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#582dee]/30 focus:border-[#582dee]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                <span>DNI / NIE</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-normal text-slate-400">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              </label>
              <input
                type="text"
                value={repForm.dni_nie}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 font-mono cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Role in Company
              </label>
              <select
                value={repForm.role}
                onChange={(e) =>
                  setRepForm((prev) => ({ ...prev, role: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#582dee]/30 focus:border-[#582dee]"
              >
                {REP_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: AEAT Connection Overview Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <ShieldCheck className="w-5 h-5 text-[#582dee]" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              )}
              <h2 className="text-base font-semibold text-slate-800">
                AEAT Delegation & Apoderamiento
              </h2>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isConnected
                  ? "bg-[#582dee]/10 text-[#582dee] border border-[#582dee]/20"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {isConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
              {isConnected ? "ACTIVE & AUTHORIZED" : "NOT AUTHORIZED"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="space-y-1">
              <p>
                <span className="font-semibold text-slate-700">Representation Model:</span>{" "}
                Gestor / Apoderamiento (Contia365 Corporate Certificate)
              </p>
              {aeatConn?.connected_at && (
                <p>
                  <span className="font-semibold text-slate-700">Authorized On:</span>{" "}
                  {new Date(aeatConn.connected_at).toLocaleString()}
                </p>
              )}
              {aeatConn?.verification_status && (
                <p>
                  <span className="font-semibold text-slate-700">Live AEAT Status:</span>{" "}
                  <span className="font-mono font-bold text-[#582dee]">
                    {aeatConn.verification_status}
                  </span>
                </p>
              )}
            </div>

            <Link
              to="/app/settings/aeat"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#582dee] text-[#582dee] font-medium text-xs rounded-xl hover:bg-[#582dee]/5 transition-colors self-start sm:self-auto"
            >
              <span>Manage AEAT Authority</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#582dee] hover:bg-[#4622c7] text-white font-semibold rounded-xl shadow hover:shadow-md disabled:opacity-50 transition-all text-sm"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving Changes..." : "Save Company Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;
