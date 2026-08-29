import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Calculator, RefreshCw, ShieldAlert, TrendingUp } from "lucide-react";
import ModeloCalculationCard from "./ModeloCalculationCard";
import { listUserLedgers } from "../../../../api/apiFunction/ledgerServices";
import {
  extractModeloNosFromLedgers,
  calculateAllTaxes,
  getTaxReports,
  ANNUAL_MODELOS,
} from "../../../../api/apiFunction/taxCalculationServices";
import {
  createTaxFiling,
  formatTaxFilingError,
  getFilingConflict,
  getFilingId,
} from "../../../../api/apiFunction/taxFilingServices";
import { verifyInvoiceChain } from "../../../../api/apiFunction/invoiceServices";
import { entryHasModelo, entryInPeriod, matchedModeloNos } from "../../../../utils/taxNature";
import { getMyFiscalProfile } from "../../../../api/apiFunction/onboardingServices";
import {
  MONTHS,
  filingPeriodQuery,
  isMonthly303,
  monthName,
  monthlyPeriodKey,
  parseMonthParam,
  quarterFromMonth,
} from "../../../../utils/taxPeriod";
import { toast } from "react-toastify";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../../ui/Modal";
import { Button } from "../../../ui";

const MODELO_LABELS = {
  "115": "Modelo 115 – IRPF Rent Withholding",
  "130": "Modelo 130 – IRPF Quarterly Payment",
  "190": "Modelo 190 – Annual Withholding Summary",
  "111": "Modelo 111 – IRPF Withholding",
  "303": "Modelo 303 – VAT Declaration",
  "390": "Modelo 390 – VAT Annual Summary",
};

const TaxCalculations = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);
  const userId = user?.id || user?._id || user?.user_id || user?.uid;

  const selectedYear = useMemo(() => {
    const p = searchParams.get("year");
    return p ? parseInt(p, 10) : new Date().getFullYear();
  }, [searchParams]);

  const selectedSemester = useMemo(() => {
    const p = searchParams.get("semester");
    if (p === "annual") return "annual";
    if (p) return parseInt(p, 10);
    return Math.floor(new Date().getMonth() / 3) + 1;
  }, [searchParams]);

  const selectedMonth = useMemo(() => {
    const fromUrl = parseMonthParam(searchParams.get("month"));
    if (fromUrl) return fromUrl;
    if (selectedSemester === "annual") return null;
    const now = new Date();
    const current = now.getMonth() + 1;
    if (now.getFullYear() === selectedYear && quarterFromMonth(current) === selectedSemester) {
      return current;
    }
    return Number(selectedSemester) ? (Number(selectedSemester) - 1) * 3 + 1 : current;
  }, [searchParams, selectedSemester, selectedYear]);

  const [ledgersLoading, setLedgersLoading] = useState(true);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerModeloIdMap, setLedgerModeloIdMap] = useState({});
  const [fiscalProfile, setFiscalProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLedgersLoading(true);
    listUserLedgers({ user_id: userId })
      .then(({ entries }) => {
        const list = Array.isArray(entries) ? entries : [];
        setLedgerEntries(list);
        const { modeloIdMap: idMap } = extractModeloNosFromLedgers(list);
        setLedgerModeloIdMap(idMap);
      })
      .catch(() => {})
      .finally(() => setLedgersLoading(false));
  }, [userId]);

  useEffect(() => {
    setProfileLoading(true);
    getMyFiscalProfile()
      .then(setFiscalProfile)
      .finally(() => setProfileLoading(false));
  }, []);

  const modeloNos = useMemo(() => {
    const obligations = fiscalProfile?.periodic_tax_obligations;
    if (!Array.isArray(obligations)) return [];
    return Array.from(new Set(
      obligations.map((item) => String(item?.modelo || "")).filter(Boolean)
    ));
  }, [fiscalProfile]);

  const modeloIdMap = useMemo(() => {
    const result = { ...ledgerModeloIdMap };
    (fiscalProfile?.periodic_tax_obligations || []).forEach((item) => {
      const modelo = String(item?.modelo || "");
      const id = item?.modelo_id || item?._id;
      if (modelo && id && !result[modelo]) result[modelo] = id;
    });
    return result;
  }, [ledgerModeloIdMap, fiscalProfile]);

  const monthly303 = isMonthly303(fiscalProfile);
  const monthlyModelos = useMemo(
    () => (monthly303 ? new Set(["303"]) : new Set()),
    [monthly303]
  );

  const taxDataLoading = ledgersLoading || profileLoading;

  const [savedReports, setSavedReports] = useState([]);

  const loadReports = useCallback(() => {
    getTaxReports().then(setSavedReports).catch(() => {});
  }, []);

  useEffect(() => { loadReports(); }, [loadReports, selectedYear]);

  const getSavedReport = useCallback((modeloNo, quarter, month = null) => {
    return savedReports.find((r) => {
      const matchModelo = String(r?.modelo ?? r?.modelo_no ?? "") === String(modeloNo);
      const matchYear = Number(r?.year) === selectedYear;
      if (!matchModelo || !matchYear) return false;
      if (month != null) {
        const padded = String(month).padStart(2, "0");
        return (
          Number(r?.month) === Number(month)
          || String(r?.period_key || "") === monthlyPeriodKey(selectedYear, month)
          || String(r?.quarter) === `M${padded}`
        );
      }
      if (quarter === null) return true;
      return String(r?.quarter) === `Q${quarter}` || Number(r?.quarter) === quarter;
    }) ?? null;
  }, [savedReports, selectedYear]);

  const calcCache = useRef({});
  const [calcResults, setCalcResults] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState(null);
  const [chainModal, setChainModal] = useState(false);
  const [startingModelo, setStartingModelo] = useState(null);

  const cacheKey = selectedSemester === "annual"
    ? `${selectedYear}:annual`
    : monthly303
      ? `${selectedYear}:m${selectedMonth}`
      : `${selectedYear}:${selectedSemester}`;

  useEffect(() => {
    setCalcResults(calcCache.current[cacheKey] ?? null);
    setCalcError(null);
  }, [cacheKey]);

  const quarterParam = selectedSemester === "annual" ? null : selectedSemester;
  const hasApplicableModelos = modeloNos.length > 0;

  const handleCalculate = async (nos = modeloNos, idMap = modeloIdMap) => {
    if (!nos.length) return;
    try {
      const chain = await verifyInvoiceChain();
      if (chain?.valid === false) { setChainModal(true); return; }
    } catch { /* if check fails, allow calculation to proceed */ }
    setCalculating(true);
    setCalcError(null);
    try {
      const results = await calculateAllTaxes({
        modeloNos: nos,
        modeloIdMap: idMap,
        year: selectedYear,
        quarter: quarterParam,
        month: monthly303 ? selectedMonth : null,
        monthlyModelos,
      });
      calcCache.current[cacheKey] = results;
      setCalcResults(results);
    } catch {
      setCalcError("Calculation failed. Please try again.");
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (taxDataLoading) return;
    if (!modeloNos.length) return;
    if (calcCache.current[cacheKey]) return;
    handleCalculate(modeloNos, modeloIdMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxDataLoading, cacheKey]);

  const visibleModelos = useMemo(() => {
    return modeloNos.filter((no) =>
      selectedSemester === "annual" ? ANNUAL_MODELOS.has(no) : !ANNUAL_MODELOS.has(no)
    );
  }, [modeloNos, selectedSemester]);

  const periodFilter = useMemo(() => ({
    year: selectedYear,
    quarter: selectedSemester === "annual" ? null : selectedSemester,
    month: monthly303 ? selectedMonth : null,
    annual: selectedSemester === "annual",
  }), [selectedYear, selectedSemester, monthly303, selectedMonth]);

  const periodEntries = useMemo(
    () => ledgerEntries.filter((entry) => entryInPeriod(entry, periodFilter)),
    [ledgerEntries, periodFilter]
  );

  const unclassifiedInPeriod = useMemo(
    () => periodEntries.filter((entry) => matchedModeloNos(entry).length === 0),
    [periodEntries]
  );

  const entriesByModelo = useMemo(() => {
    const map = {};
    visibleModelos.forEach((no) => {
      map[no] = periodEntries.filter((entry) => entryHasModelo(entry, no));
    });
    return map;
  }, [visibleModelos, periodEntries]);

  const calendarQuery = filingPeriodQuery({
    year: selectedYear,
    semester: selectedSemester,
    month: monthly303 ? selectedMonth : searchParams.get("month"),
  });

  const handleStartFiling = async (modeloNo) => {
    try {
      setStartingModelo(modeloNo);
      const annual = ANNUAL_MODELOS.has(String(modeloNo));
      const monthly = monthlyModelos.has(String(modeloNo));
      const filing = await createTaxFiling({
        modelo: String(modeloNo),
        year: selectedYear,
        month: monthly ? selectedMonth : undefined,
        quarter: annual || monthly || selectedSemester === "annual"
          ? undefined
          : `Q${selectedSemester}`,
      });
      const id = getFilingId(filing);
      toast.success(`Draft filing created for modelo ${modeloNo}`);
      if (id) navigate(`/app/tax-filings/cases/${id}${calendarQuery}`);
    } catch (err) {
      const conflict = getFilingConflict(err);
      if (conflict?.filingId) {
        toast.info(
          `This period already exists${conflict.periodKey ? ` (${conflict.periodKey})` : ""}. Opening that filing.`
        );
        navigate(`/app/tax-filings/cases/${conflict.filingId}${calendarQuery}`);
      } else {
        toast.error(formatTaxFilingError(err, "Failed to create tax filing"));
      }
    } finally {
      setStartingModelo(null);
    }
  };

  return (
    <div className="flex-1 bg-bg-70 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 px-6 pt-8 pb-6 border-b border-bd-50 bg-gradient-to-r from-bg-60 to-bg-70">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-ac-02 to-blue-600 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-fg-40 tracking-tight">Tax Filing & Compliance</h1>
                  <p className="text-sm text-fg-60 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {monthly303
                      ? "Monthly IVA (REDEME) and periodic tax filings"
                      : "Quarterly tax filings and compliance management"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/app/tax-filings${calendarQuery}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 overflow-auto">
          <div className="max-w-7xl mx-auto pb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-fg-40 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Tax Calculations
                </h2>
                <p className="text-sm text-fg-60 mt-1">
                  {selectedSemester === "annual"
                    ? `Annual summaries for ${selectedYear}`
                    : monthly303
                      ? `Automated calculations for ${monthName(selectedMonth)} ${selectedYear}`
                      : `Automated calculations for Q${selectedSemester} ${selectedYear}`}
                </p>
                {fiscalProfile && (
                  <p className="text-xs text-fg-60 mt-1">
                    Canonical profile · NIF {fiscalProfile?.taxpayer_identity?.nif_nie || "—"}
                    {" · "}
                    {modeloNos.length} applicable modelo{modeloNos.length === 1 ? "" : "s"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(`/app/tax-filings/cases${calendarQuery}`)}
                >
                  View filings
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleCalculate()}
                  disabled={!hasApplicableModelos || calculating || taxDataLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${calculating ? "animate-spin" : ""}`} />
                  {calculating ? "Calculating…" : "Calculate Taxes"}
                </Button>
              </div>
            </div>

            {monthly303 && selectedSemester !== "annual" && (
              <div className="flex flex-wrap gap-2 mb-4">
                {MONTHS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set("year", String(selectedYear));
                      params.set("semester", String(quarterFromMonth(item.id)));
                      params.set("month", String(item.id));
                      navigate(`/app/tax-filings/calculate?${params.toString()}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedMonth === item.id
                        ? "border-ac-02 bg-ac-02/10 text-fg-40"
                        : "border-bd-50 bg-bg-50 text-fg-60 hover:border-ac-02/50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {!profileLoading && !fiscalProfile && (
              <div className="bg-bg-50 border border-bd-50 rounded-xl p-6 text-sm text-fg-60">
                No canonical fiscal profile found. Complete your Spain fiscal profile before calculating taxes.
              </div>
            )}

            {fiscalProfile && !hasApplicableModelos && !profileLoading && (
              <div className="bg-bg-50 border border-bd-50 rounded-xl p-6 text-sm text-fg-60">
                Your fiscal profile has no applicable periodic tax obligations.
              </div>
            )}

            {unclassifiedInPeriod.length > 0 && (
              <div className="mb-4 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-600">
                {unclassifiedInPeriod.length} invoice{unclassifiedInPeriod.length === 1 ? "" : "s"} in this period
                {" "}{unclassifiedInPeriod.length === 1 ? "has" : "have"} no modelo.
                Open the ledger and set the tax type — the description is not used.
              </div>
            )}

            {calcError && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
                {calcError}
              </div>
            )}

            {(taxDataLoading || calculating) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(visibleModelos.length || 2)].map((_, i) => (
                  <div key={i} className="bg-bg-50 border border-bd-50 rounded-xl p-6 space-y-4 animate-pulse">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-48 bg-bg-40 rounded" />
                        <div className="h-3 w-32 bg-bg-40 rounded" />
                      </div>
                      <div className="w-10 h-10 bg-bg-40 rounded-xl" />
                    </div>
                    <div className="bg-bg-60 rounded-lg p-4 border border-bd-50 space-y-2">
                      <div className="h-3 w-24 bg-bg-40 rounded" />
                      <div className="h-7 w-36 bg-bg-40 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-bg-60 rounded-lg p-3 border border-bd-50 space-y-2">
                        <div className="h-3 w-20 bg-bg-40 rounded" />
                        <div className="h-5 w-24 bg-bg-40 rounded" />
                      </div>
                      <div className="bg-bg-60 rounded-lg p-3 border border-bd-50 space-y-2">
                        <div className="h-3 w-20 bg-bg-40 rounded" />
                        <div className="h-5 w-24 bg-bg-40 rounded" />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-bd-50 flex justify-between">
                      <div className="h-3 w-24 bg-bg-40 rounded" />
                      <div className="h-3 w-32 bg-bg-40 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!taxDataLoading && !calculating && visibleModelos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visibleModelos.map((modeloNo) => {
                  const liveResult = calcResults?.[modeloNo] ?? null;
                  const savedReport = getSavedReport(
                    modeloNo,
                    quarterParam,
                    monthlyModelos.has(String(modeloNo)) ? selectedMonth : null
                  );
                  return (
                    <ModeloCalculationCard
                      key={modeloNo}
                      modeloNo={modeloNo}
                      title={
                        modeloNo === "303" && monthly303
                          ? "Modelo 303 – Monthly VAT (REDEME)"
                          : MODELO_LABELS[modeloNo] || `Modelo ${modeloNo}`
                      }
                      liveResult={liveResult}
                      savedReport={savedReport}
                      nif={fiscalProfile?.taxpayer_identity?.nif_nie}
                      onStartFiling={() => handleStartFiling(modeloNo)}
                      startingFiling={startingModelo === modeloNo}
                      includedEntries={entriesByModelo[modeloNo] || []}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={chainModal} onClose={() => setChainModal(false)}>
        <ModalHeader title="Tax Filing Blocked" action={
          <button onClick={() => setChainModal(false)} className="p-1 text-fg-60 hover:text-fg-50 hover:bg-bg-40 rounded-md transition-colors">✕</button>
        } />
        <ModalBody>
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-fg-40 mb-1">Invoice chain integrity check failed</p>
              <p className="text-sm text-fg-60">
                Tax filing cannot proceed because one or more invoices in the VeriFactu hash chain appear to have been deleted or tampered with. Please resolve the integrity issues before calculating taxes.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setChainModal(false)}>Close</Button>
          <Button variant="primary" onClick={() => { setChainModal(false); window.location.href = "/app/compliance"; }}>
            View Compliance Report
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default TaxCalculations;
