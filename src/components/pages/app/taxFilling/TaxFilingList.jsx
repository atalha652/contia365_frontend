import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { Button, Badge, Select } from "../../../ui";
import {
  createTaxFiling,
  FILING_STATUSES,
  getFilingId,
  getFilingStatus,
  listTaxFilings,
} from "../../../../api/apiFunction/taxFilingServices";
import { ANNUAL_MODELOS } from "../../../../api/apiFunction/taxCalculationServices";
import { getMyFiscalProfile } from "../../../../api/apiFunction/onboardingServices";
import {
  filingPeriodQuery,
  formatFilingPeriod,
  isMonthlyModelo,
  parseMonthParam,
} from "../../../../utils/taxPeriod";

const STATUS_VARIANT = {
  DRAFT: "secondary",
  CALCULATED: "info",
  IN_REVIEW: "warning",
  APPROVED: "success",
  SUBMITTED: "info",
  ACCEPTED: "success",
  REJECTED: "error",
};

const TaxFilingList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const semester = searchParams.get("semester") || "";
  const monthFromUrl = parseMonthParam(searchParams.get("month"));

  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const [modelo, setModelo] = useState("303");
  const [fiscalProfile, setFiscalProfile] = useState(null);

  const calendarQuery = filingPeriodQuery({
    year,
    semester: semester || undefined,
    month: monthFromUrl || undefined,
  });
  const isAnnual = semester === "annual";
  const quarter = isAnnual ? null : semester ? `Q${semester}` : `Q${Math.floor(new Date().getMonth() / 3) + 1}`;
  const selectedMonth = monthFromUrl || (isAnnual ? null : new Date().getMonth() + 1);

  const loadFilings = async () => {
    try {
      setLoading(true);
      const data = await listTaxFilings({
        year,
        status: statusFilter || undefined,
      });
      setFilings(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to load tax filings");
      setFilings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, statusFilter]);

  useEffect(() => {
    getMyFiscalProfile()
      .then(setFiscalProfile)
      .catch(() => setFiscalProfile(null));
  }, []);

  const handleCreate = async () => {
    try {
      setCreating(true);
      const annual = ANNUAL_MODELOS.has(String(modelo));
      const monthly = isMonthlyModelo(fiscalProfile, modelo);
      if (monthly && !selectedMonth) {
        toast.error("Pick a month to create a monthly 303 filing.");
        return;
      }
      const filing = await createTaxFiling({
        modelo,
        year,
        month: monthly ? selectedMonth : undefined,
        quarter: annual || monthly ? undefined : quarter,
      });
      const id = getFilingId(filing);
      toast.success(`Draft filing created for modelo ${modelo}`);
      if (id) navigate(`/app/tax-filings/cases/${id}${calendarQuery}`);
      else loadFilings();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to create tax filing");
    } finally {
      setCreating(false);
    }
  };

  const rows = useMemo(() => filings, [filings]);

  return (
    <div className="flex-1 bg-bg-70 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-fg-40">Tax Filings</h1>
            <p className="text-sm text-fg-60 mt-1">
              DRAFT → CALCULATED → IN_REVIEW → APPROVED → SUBMITTED → ACCEPTED/REJECTED
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/app/tax-filings/calculate${calendarQuery}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to calculations
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="w-36">
            <Select value={modelo} onChange={(e) => setModelo(e.target.value)}>
              {["111", "115", "130", "190", "303", "390"].map((no) => (
                <option key={no} value={no}>Modelo {no}</option>
              ))}
            </Select>
          </div>
          <Button variant="primary" onClick={handleCreate} disabled={creating}>
            <Plus className="w-4 h-4 mr-2" />
            {creating ? "Creating…" : "Create draft"}
          </Button>
          <div className="w-44 ml-auto">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {FILING_STATUSES.map((status) => (
                <option key={status} value={status}>{status.replace("_", " ")}</option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-bg-50 border border-bd-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-8 text-sm text-fg-60 text-center">
            No tax filings for {year}. Create a draft to start the workflow.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((filing) => {
              const id = getFilingId(filing);
              const status = getFilingStatus(filing);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => id && navigate(`/app/tax-filings/cases/${id}${calendarQuery}`)}
                  className="w-full text-left bg-bg-50 border border-bd-50 rounded-xl p-4 hover:border-ac-02/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-bg-60 border border-bd-50 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-fg-50" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-fg-40">
                          Modelo {filing.modelo} · {formatFilingPeriod(filing)}
                        </p>
                        <p className="text-xs text-fg-60 truncate">
                          {filing.reviewer || filing.approver
                            ? `Reviewer ${filing.reviewer || "—"} · Approver ${filing.approver || "—"}`
                            : "No reviewer or approver yet"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={STATUS_VARIANT[status] || "secondary"}>{status.replace("_", " ")}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxFilingList;
