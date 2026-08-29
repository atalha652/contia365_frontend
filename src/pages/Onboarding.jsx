import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import {
  getUserTypes,
  selectCountry,
  selectUserType,
  uploadCensusDocument,
  getMyFiscalProfile,
  downloadCensusDocument,
  getCensusRecordId,
  getOnboardingStatus,
  syncOnboardingStatus,
  saveCensusProfile,
  updateCensusProfile,
  canonicalizeUserType,
  saveCompanyDetails,
  saveRepresentative,
  confirmAeatConnect,
} from "../api/apiFunction/onboardingServices";
import { getMyWaitlist, joinWaitlist } from "../api/apiFunction/waitlistServices";

const COUNTRIES = [
  {
    code: "ES",
    flag: "🇪🇸",
    name: "Spain",
    status: "Available",
    description: "Continue with Spanish accounting, tax, and AEAT services.",
  },
  {
    code: "IT",
    flag: "🇮🇹",
    name: "Italy",
    status: "Coming soon",
    description: "Italian tax is not live yet. Join the waitlist and we will contact you.",
  },
];

const WHITE_LABEL_ID = "white_label";

const USER_TYPE_DISPLAY = {
  person: {
    name: "Person",
    subtitle: "Autónomo",
    description: "Individual professional managing their own invoices and taxes.",
  },
  business: {
    name: "Business",
    subtitle: "Empresa",
    description: "Company with employees, accounting, and invoicing needs.",
  },
  advisor: {
    name: "Advisor",
    subtitle: "Asesor",
    description: "Tax advisor managing accounting and reports for multiple clients.",
  },
};

// Advisor is kept for existing accounts, but onboarding offers Person, Business,
// and White Label only. White Label is waitlist interest, not a stored type.
const HIDDEN_TYPE_IDS = ["advisor"];

const WHITE_LABEL_CARD = {
  id: WHITE_LABEL_ID,
  name: "White Label",
  subtitle: "Partner",
  description: "Offer Contia365 to your own clients under your brand.",
  comingSoon: true,
};

const TYPE_ICONS = {
  person: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  business: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  advisor: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  [WHITE_LABEL_ID]: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-6.586 6.586a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V5a2 2 0 012-2z" />
    </svg>
  ),
};

const EMPTY_FISCAL_FORM = {
  nif_nie: "",
  full_name: "",
  iae: "",
  vat_regime: "",
  irpf_method: "",
  address_line: "",
  postal_code: "",
  city: "",
  province: "",
};

const EMPTY_COMPANY_FORM = {
  legal_name: "",
  cif: "",
  company_type: "",
  address_line: "",
  postal_code: "",
  city: "",
  province: "",
};

const EMPTY_REP_FORM = {
  full_name: "",
  dni_nie: "",
  role: "",
};

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

const VAT_REGIMES = [
  { value: "general", label: "General" },
  { value: "simplified", label: "Simplified" },
  { value: "recargo_equivalencia", label: "Recargo de equivalencia" },
  { value: "exempt", label: "Exempt" },
  { value: "agriculture", label: "Agriculture" },
];

const iaeFromActivities = (activities = []) => {
  const first = activities[0];
  if (!first) return "";
  if (typeof first === "string") return first;
  return first.code || first.iae || first.epigrafe || first.description || "";
};

const CardSkeleton = () => (
  <div className="flex flex-col items-center p-6 rounded-2xl border-2 border-slate-200 bg-white animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-slate-200 mb-4" />
    <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
    <div className="h-3 w-16 bg-slate-100 rounded mb-3" />
    <div className="h-3 w-full bg-slate-100 rounded mb-1" />
    <div className="h-3 w-4/5 bg-slate-100 rounded" />
  </div>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}")?.country?.toUpperCase() || null;
    } catch {
      return null;
    }
  });
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [countryLoading, setCountryLoading] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [whiteLabelInterest, setWhiteLabelInterest] = useState(false);
  const [italyWaitlist, setItalyWaitlist] = useState(false);
  const [joinedInterests, setJoinedInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAEATModal, setShowAEATModal] = useState(false);
  const [aeatStep, setAeatStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [censusDocuments, setCensusDocuments] = useState([]);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState(null);
  const [censusRecordId, setCensusRecordId] = useState(null);
  const [fiscalForm, setFiscalForm] = useState(EMPTY_FISCAL_FORM);

  // Business onboarding state
  const [companyForm, setCompanyForm] = useState(EMPTY_COMPANY_FORM);
  const [repForm, setRepForm] = useState(EMPTY_REP_FORM);
  const [aeatConnecting, setAeatConnecting] = useState(false);

  const updateFiscalField = (field, value) => {
    setFiscalForm((prev) => ({ ...prev, [field]: value }));
  };

  const applyCensusRecord = useCallback((record) => {
    if (!record) return;
    const id = getCensusRecordId(record);
    if (id) setCensusRecordId(id);
    const identity = record.taxpayer_identity || {};
    const address = identity.fiscal_address || {};
    const prof = record.professional_registration || {};
    setCensusDocuments(Array.isArray(record.documents) ? record.documents : []);
    setFiscalForm({
      nif_nie: identity.nif_nie || "",
      full_name: identity.full_name || "",
      iae: iaeFromActivities(prof.economic_activities),
      vat_regime: prof.vat_regime || "",
      irpf_method: prof.irpf_method || "",
      address_line: address.address_line || "",
      postal_code: address.postal_code || "",
      city: address.city || "",
      province: address.province || "",
    });
  }, []);

  const buildCensusPayload = () => ({
    taxpayer_identity: {
      nif_nie: fiscalForm.nif_nie.trim(),
      full_name: fiscalForm.full_name.trim(),
      fiscal_address: {
        address_line: fiscalForm.address_line.trim(),
        postal_code: fiscalForm.postal_code.trim(),
        city: fiscalForm.city.trim(),
        province: fiscalForm.province.trim(),
      },
      resident_status: true,
    },
    professional_registration: {
      vat_regime: fiscalForm.vat_regime,
      irpf_method: fiscalForm.irpf_method.trim(),
      economic_activities: fiscalForm.iae.trim()
        ? [{ code: fiscalForm.iae.trim() }]
        : [],
    },
  });

  const censusErrorMessage = (response) => {
    const detail = response?.data?.detail;
    if (Array.isArray(detail)) return detail[0]?.msg;
    if (typeof detail === "string") return detail;
    return response?.data?.message || "Could not save your fiscal profile. Please try again.";
  };

  // Cards the user sees: API types with client-facing labels, plus White Label
  // which has no backend id yet.
  const displayTypes = useMemo(
    () => [
      ...userTypes
        .map((type) => {
          const id = canonicalizeUserType(type.id) || type.id;
          return { ...type, ...(USER_TYPE_DISPLAY[id] || {}), id };
        })
        .filter((type) => !HIDDEN_TYPE_IDS.includes(type.id)),
      WHITE_LABEL_CARD,
    ],
    [userTypes]
  );

  const fetchUserTypes = useCallback(async () => {
    setTypesLoading(true);
    const response = await getUserTypes();
    if (response?.status === 200) {
      setUserTypes(response.data);
    } else {
      toast.error("Could not load account types. Please refresh the page.");
    }
    setTypesLoading(false);
  }, []);

  const loadCanonicalFiscalProfile = useCallback(async () => {
    const record = await getMyFiscalProfile();
    if (record) {
      applyCensusRecord(record);
      setAeatStep(4);
    }
    return record;
  }, [applyCensusRecord]);

  const refreshOnboardingStatus = useCallback(async () => {
    const status = await getOnboardingStatus();
    if (!status) return null;
    syncOnboardingStatus(status);
    setOnboardingStatus(status);
    setSelectedCountry(status.country_selected?.toUpperCase() || null);
    setSelected(canonicalizeUserType(status.user_type_selected) || null);
    return status;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatusLoading(true);
    Promise.all([getOnboardingStatus(), getMyWaitlist()])
      .then(([status, rows]) => {
        if (cancelled) return;
        const interests = (rows || [])
          .map((row) => String(row?.interest || "").toLowerCase())
          .filter(Boolean);
        setJoinedInterests(interests);
        if (!status) return;
        syncOnboardingStatus(status);
        setOnboardingStatus(status);
        setSelectedCountry(status.country_selected?.toUpperCase() || null);
        setSelected(canonicalizeUserType(status.user_type_selected) || null);
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const currentStep = onboardingStatus?.current_step;
    if (!currentStep) return;
    if (currentStep === "completed") {
      navigate("/app/dashboard", { replace: true });
      return;
    }
    if (currentStep === "user_type_selection") {
      setShowAEATModal(false);
      fetchUserTypes();
      return;
    }
    if (currentStep === "fiscal_profile") {
      setShowAEATModal(true);
      loadCanonicalFiscalProfile();
      return;
    }
    // Business steps — close person modal if open
    if (["company_details", "representative", "aeat_connection"].includes(currentStep)) {
      setShowAEATModal(false);
      return;
    }
    setShowAEATModal(false);
  }, [onboardingStatus?.current_step, navigate, fetchUserTypes, loadCanonicalFiscalProfile]);

  const handleCountryContinue = async () => {
    if (!selectedCountry) return;
    setCountryLoading(true);
    try {
      if (selectedCountry === "IT") {
        const response = await joinWaitlist({ interest: "italy", source: "onboarding" });
        if (response?.status === 200 || response?.status === 201) {
          setJoinedInterests((prev) => (
            prev.includes("italy") ? prev : [...prev, "italy"]
          ));
          setItalyWaitlist(true);
          toast.success("You are on the Italy waitlist.");
        } else {
          const detail = response?.data?.detail;
          toast.error(
            (typeof detail === "string" && detail) || "Could not join the Italy waitlist."
          );
        }
        return;
      }
      const response = await selectCountry(selectedCountry);
      if (response?.status === 200) {
        toast.success(response.data?.message || "Country selected successfully.");
        await refreshOnboardingStatus();
      } else {
        const detail = response?.data?.detail;
        const message = Array.isArray(detail)
          ? detail[0]?.msg
          : detail || response?.data?.message;
        toast.error(message || "Failed to save your country. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setCountryLoading(false);
    }
  };

  useEffect(() => {
    if (!showAEATModal) {
      setAeatStep(1);
    }
  }, [showAEATModal]);

  const handleContinue = async () => {
    if (!selected) return;

    // White Label has no backend user type yet, so it never reaches the API
    // or the Spanish census flow.
    if (selected === WHITE_LABEL_ID) {
      setIsLoading(true);
      try {
        const response = await joinWaitlist({
          interest: "white_label",
          source: "onboarding",
        });
        if (response?.status === 200 || response?.status === 201) {
          setJoinedInterests((prev) => (
            prev.includes("white_label") ? prev : [...prev, "white_label"]
          ));
          setWhiteLabelInterest(true);
          toast.success("You are on the White Label waitlist.");
        } else {
          const detail = response?.data?.detail;
          toast.error(
            (typeof detail === "string" && detail) || "Could not join the waitlist."
          );
        }
      } catch {
        toast.error("Network error. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await selectUserType(canonicalizeUserType(selected) || selected);
      if (response?.status === 200) {
        toast.success(response.data?.message || "Account type selected successfully.");
        await refreshOnboardingStatus();
      } else {
        toast.error(response?.data?.message || "Failed to save account type. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAEATComplete = async () => {
    if (!fiscalForm.nif_nie.trim() || !fiscalForm.iae.trim() || !fiscalForm.vat_regime) {
      toast.error("Please fill NIF/NIE, IAE, and VAT regime.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = buildCensusPayload();
      const response = censusRecordId
        ? await updateCensusProfile(censusRecordId, payload)
        : await saveCensusProfile(payload);

      if (response?.status === 200 || response?.status === 201) {
        const saved = typeof response.data === "object" ? response.data : null;
        applyCensusRecord(saved);
        toast.success("Fiscal profile saved successfully.");
        const status = await refreshOnboardingStatus();
        if (status?.current_step !== "completed") {
          toast.error(status?.next_action || "Your fiscal profile is still incomplete.");
        }
      } else {
        toast.error(censusErrorMessage(response));
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Business step handlers ───────────────────────────────────────────────

  const handleCompanyDetailsSave = async () => {
    if (!companyForm.legal_name.trim()) {
      toast.error("Legal name is required.");
      return;
    }
    if (!companyForm.cif.trim()) {
      toast.error("CIF is required.");
      return;
    }
    if (!companyForm.company_type) {
      toast.error("Company type is required.");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        legal_name: companyForm.legal_name.trim(),
        cif: companyForm.cif.trim().toUpperCase(),
        company_type: companyForm.company_type,
        tax_address: {
          address_line: companyForm.address_line.trim() || null,
          postal_code: companyForm.postal_code.trim() || null,
          city: companyForm.city.trim() || null,
          province: companyForm.province.trim() || null,
        },
      };
      const response = await saveCompanyDetails(payload);
      if (response?.status === 200 || response?.status === 201) {
        toast.success("Company details saved.");
        await refreshOnboardingStatus();
      } else {
        const detail = response?.data?.detail;
        toast.error(typeof detail === "string" ? detail : "Failed to save company details.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepresentativeSave = async () => {
    if (!repForm.full_name.trim()) {
      toast.error("Full name is required.");
      return;
    }
    if (!repForm.dni_nie.trim()) {
      toast.error("DNI/NIE is required.");
      return;
    }
    if (!repForm.role) {
      toast.error("Role is required.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await saveRepresentative({
        full_name: repForm.full_name.trim(),
        dni_nie: repForm.dni_nie.trim().toUpperCase(),
        role: repForm.role,
      });
      if (response?.status === 200 || response?.status === 201) {
        toast.success("Representative saved.");
        await refreshOnboardingStatus();
      } else {
        const detail = response?.data?.detail;
        toast.error(typeof detail === "string" ? detail : "Failed to save representative.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAeatConnect = async () => {
    const repNif = repForm.dni_nie.trim().toUpperCase();
    if (!repNif) {
      toast.error("Representative DNI/NIE is required to confirm AEAT connection.");
      return;
    }
    setAeatConnecting(true);
    try {
      const response = await confirmAeatConnect(repNif);
      if (response?.status === 200 || response?.status === 201) {
        toast.success("AEAT connection confirmed. Onboarding complete.");
        await refreshOnboardingStatus();
      } else {
        const detail = response?.data?.detail;
        toast.error(typeof detail === "string" ? detail : "Failed to confirm AEAT connection.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setAeatConnecting(false);
    }
  };

  // ── File upload (person fiscal profile) ─────────────────────────────────

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isValidType =
      file.type === "application/pdf" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isValidType) {
      toast.error("Invalid file type. Please upload a PDF or Word (.docx) file.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadCensusDocument(file);
      if (response?.status === 201 || response?.status === 200) {
        setUploadedFile(file);
        const uploadedRecord = response?.data && typeof response.data === "object" ? response.data : null;
        applyCensusRecord(uploadedRecord);
        const canonicalProfile = await getMyFiscalProfile();
        if (canonicalProfile) applyCensusRecord(canonicalProfile);
        toast.success("Census document uploaded. Review and confirm your fiscal details.");
        setAeatStep(4);
      } else if (response?.status === 422) {
        const detail = response?.data?.detail;
        const isAIError = typeof detail === "string" && detail.includes("AI extraction failed");
        toast.error(
          isAIError
            ? "We could not extract data from this document. Please make sure it is a valid Census Certificate (Certificado de Situación Censal) and try again."
            : detail?.[0]?.msg || detail || "Invalid document. Please try again."
        );
      } else {
        toast.error(
          response?.data?.detail?.[0]?.msg ||
          response?.data?.message ||
          "Upload failed. Please try a different file."
        );
      }
    } catch {
      toast.error("Upload failed. Please check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentDownload = async (document) => {
    const fileId = document?.file_id;
    if (!fileId) return;
    setDownloadingDocumentId(fileId);
    try {
      const response = await downloadCensusDocument(fileId);
      const url = URL.createObjectURL(response.data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.filename || "census-document";
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download this census document.");
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  const renderAEATStep = () => {
    const steps = [
      {
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        ),
        title: "Step 1: Login to AEAT",
        description: "Access the Spanish Tax Agency portal to verify your professional status.",
        info: {
          label: "How to proceed",
          lines: [
            "Click the button below to open the AEAT portal in a new tab.",
            "Use your digital certificate or Cl@ve PIN to log in.",
            "Keep this window open — you will return here after downloading the PDF.",
          ],
        },
        action: (
          <button
            onClick={() => {
              window.open(
                "https://sede.agenciatributaria.gob.es/static_files/en_gb/common/html/selector_acceso/SelectorAccesos.html?rep=S&ref=%2Fwlpl%2FBUGC-JDIT%2FMdcAcceso&aut=CP",
                "_blank"
              );
              setAeatStep(2);
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] transition-all duration-200"
          >
            Open AEAT Portal
          </button>
        ),
      },
      {
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        ),
        title: "Step 2: Download Census Data",
        description: "Navigate to the Census Data section and download your professional status PDF.",
        info: {
          label: "Path to follow",
          lines: [
            "Procedures → Census → Census Data → Download PDF",
            'Look for "Datos del Censo" or "Census Information" section.',
            "The file will be a PDF — save it to your device.",
          ],
        },
        action: (
          <button
            onClick={() => setAeatStep(3)}
            className="px-6 py-2.5 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] transition-all duration-200"
          >
            I have Downloaded the PDF
          </button>
        ),
      },
    ];

    if (aeatStep === 1 || aeatStep === 2) {
      const s = steps[aeatStep - 1];
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-14 h-14 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {s.icon}
              </svg>
            </div>
          </div>
          <h4 className="text-base font-semibold text-center text-slate-800">{s.title}</h4>
          <p className="text-sm text-slate-500 text-center">{s.description}</p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{s.info.label}</p>
            <ul className="space-y-1.5">
              {s.info.lines.map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#027570] shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center pt-1">{s.action}</div>
        </div>
      );
    }

    if (aeatStep === 4) {
      const inputClass = "w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#027570]";
      const labelClass = "block text-xs font-medium text-slate-600 mb-1";
      return (
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-center text-slate-800">Step 4: Confirm fiscal profile</h4>
          <p className="text-sm text-slate-500 text-center">
            {censusRecordId
              ? "We filled these fields from your census document. Check them and save."
              : "Enter your Spain fiscal details. You can still upload the census PDF in the previous step."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>NIF / NIE <span className="text-red-500">*</span></label>
              <input className={inputClass} value={fiscalForm.nif_nie} onChange={(e) => updateFiscalField("nif_nie", e.target.value)} placeholder="12345678Z" />
            </div>
            <div>
              <label className={labelClass}>Full legal name</label>
              <input className={inputClass} value={fiscalForm.full_name} onChange={(e) => updateFiscalField("full_name", e.target.value)} placeholder="Nombre y apellidos" />
            </div>
            <div>
              <label className={labelClass}>IAE / activity code <span className="text-red-500">*</span></label>
              <input className={inputClass} value={fiscalForm.iae} onChange={(e) => updateFiscalField("iae", e.target.value)} placeholder="e.g. 763" />
            </div>
            <div>
              <label className={labelClass}>VAT regime <span className="text-red-500">*</span></label>
              <select className={inputClass} value={fiscalForm.vat_regime} onChange={(e) => updateFiscalField("vat_regime", e.target.value)}>
                <option value="">Select regime</option>
                {VAT_REGIMES.map((regime) => (
                  <option key={regime.value} value={regime.value}>{regime.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>IRPF method</label>
              <input className={inputClass} value={fiscalForm.irpf_method} onChange={(e) => updateFiscalField("irpf_method", e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input className={inputClass} value={fiscalForm.address_line} onChange={(e) => updateFiscalField("address_line", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Postal code</label>
              <input className={inputClass} value={fiscalForm.postal_code} onChange={(e) => updateFiscalField("postal_code", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input className={inputClass} value={fiscalForm.city} onChange={(e) => updateFiscalField("city", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Province</label>
              <input className={inputClass} value={fiscalForm.province} onChange={(e) => updateFiscalField("province", e.target.value)} />
            </div>
          </div>
          {censusDocuments.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Linked census documents
              </p>
              <div className="space-y-2">
                {censusDocuments.map((document, index) => (
                  <div
                    key={document.file_id || index}
                    className="flex items-center justify-between gap-3 bg-slate-50 rounded-lg px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {document.filename || "Census document"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {document.content_type || "Document"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDocumentDownload(document)}
                      disabled={downloadingDocumentId === document.file_id}
                      className="text-xs font-semibold text-[#027570] hover:underline disabled:opacity-50"
                    >
                      {downloadingDocumentId === document.file_id ? "Downloading…" : "Download"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Step 3
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="w-14 h-14 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
        </div>
        <h4 className="text-base font-semibold text-center text-slate-800">Step 3: Upload Census Document</h4>
        <p className="text-sm text-slate-500 text-center">
          Upload the census certificate, then confirm NIF, IAE, and VAT regime on the next step.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Accepted formats</p>
          <ul className="space-y-1.5">
            {["PDF — Certificado de Situación Censal", "Word (.docx) — Census certificate document", "Make sure the document is the official AEAT census certificate."].map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#027570] shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#027570] transition-colors duration-200">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="census-upload"
            disabled={isUploading}
          />
          <label htmlFor="census-upload" className={`cursor-pointer ${isUploading ? "pointer-events-none" : ""}`}>
            <div className="flex flex-col items-center">
              {isUploading ? (
                <svg className="animate-spin w-10 h-10 text-[#027570] mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
              <p className="text-sm font-medium text-slate-700">
                {isUploading ? "Uploading..." : uploadedFile ? uploadedFile.name : "Click to upload your document"}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF or Word (.docx)</p>
            </div>
          </label>
        </div>
        {uploadedFile && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#027570]/10 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#027570]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{uploadedFile.name}</p>
              <p className="text-xs text-slate-400">Uploaded successfully</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-9 h-9 rounded-full border-4 border-slate-200 border-t-[#027570] animate-spin" />
          <p className="text-sm">Loading your onboarding progress…</p>
        </div>
      </div>
    );
  }

  if (!onboardingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
          <h1 className="text-xl font-semibold text-slate-800">Could not load onboarding</h1>
          <p className="text-sm text-slate-500 mt-2">Please check your connection and try again.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2.5 bg-[#027570] text-white font-semibold rounded-xl"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (italyWaitlist) {
    let email = "";
    try {
      email = JSON.parse(localStorage.getItem("user") || "{}")?.email || "";
    } catch {
      email = "";
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center">
          <span className="inline-flex px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold uppercase tracking-wide">
            Coming soon
          </span>
          <h1 className="mt-4 text-3xl font-bold text-slate-800">Italy waitlist</h1>
          <p className="mt-3 text-slate-500">
            Italian tax is not available yet. Your interest is saved and sales can see it.
            Spanish modelos including 303 stay blocked for Italy.
          </p>
          {email && (
            <p className="mt-4 text-sm text-slate-600">
              We will send updates to <span className="font-semibold text-slate-800">{email}</span>.
            </p>
          )}
          <button
            type="button"
            onClick={() => { setItalyWaitlist(false); setSelectedCountry(null); }}
            className="mt-7 px-6 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Choose Spain instead
          </button>
        </div>
      </div>
    );
  }

  if (onboardingStatus?.current_step === "country_selection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-[#027570] uppercase tracking-widest mb-2">Step 1 of 3</p>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Select your country</h1>
            <p className="text-slate-500">Choose where you operate so Contia365 can apply the correct fiscal rules.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {COUNTRIES.map((country) => {
              const isSelected = selectedCountry === country.code;
              const isAvailable = country.status === "Available";
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => setSelectedCountry(country.code)}
                  aria-pressed={isSelected}
                  className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2 ${
                    isSelected
                      ? "border-[#027570] bg-white shadow-xl scale-[1.01]"
                      : "border-slate-200 bg-white hover:border-[#027570]/60 hover:shadow-md"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#027570] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="text-5xl mb-5" aria-hidden="true">{country.flag}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-slate-800">{country.name}</h2>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {country.status}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-500">{country.description}</p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleCountryContinue}
              disabled={!selectedCountry || countryLoading}
              className="min-w-44 px-10 py-3 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
            >
              {countryLoading
                ? "Saving..."
                : selectedCountry === "IT"
                  ? (joinedInterests.includes("italy") ? "On the waitlist" : "Join waitlist")
                  : "Continue"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Business screen: Company Details ────────────────────────────────────
  if (onboardingStatus?.current_step === "company_details") {
    const inputCls = "w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#027570]";
    const labelCls = "block text-xs font-medium text-slate-600 mb-1.5";
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
              {TYPE_ICONS.business}
            </div>
            <p className="text-xs font-semibold text-[#027570] uppercase tracking-widest mb-2">Step 3 of 5</p>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Company Details</h1>
            <p className="text-slate-500 text-sm">Enter your company's legal information. The CIF will be used for all AEAT submissions.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Legal name (Razón social) <span className="text-red-500">*</span></label>
                <input className={inputCls} value={companyForm.legal_name}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, legal_name: e.target.value }))}
                  placeholder="e.g. Empresa Ejemplo S.L." />
              </div>
              <div>
                <label className={labelCls}>CIF <span className="text-red-500">*</span></label>
                <input className={inputCls} value={companyForm.cif}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, cif: e.target.value.toUpperCase() }))}
                  placeholder="e.g. B12345678" maxLength={9} />
              </div>
              <div>
                <label className={labelCls}>Company type <span className="text-red-500">*</span></label>
                <select className={inputCls} value={companyForm.company_type}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, company_type: e.target.value }))}>
                  <option value="">Select type</option>
                  {COMPANY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 mt-2">Tax Address — Domicilio Fiscal</p>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Street address</label>
                <input className={inputCls} value={companyForm.address_line}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, address_line: e.target.value }))}
                  placeholder="Calle, número, piso..." />
              </div>
              <div>
                <label className={labelCls}>Postal code</label>
                <input className={inputCls} value={companyForm.postal_code}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, postal_code: e.target.value }))}
                  placeholder="28001" />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} value={companyForm.city}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="Madrid" />
              </div>
              <div>
                <label className={labelCls}>Province</label>
                <input className={inputCls} value={companyForm.province}
                  onChange={(e) => setCompanyForm((p) => ({ ...p, province: e.target.value }))}
                  placeholder="Madrid" />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button type="button" onClick={handleCompanyDetailsSave} disabled={isLoading}
                className="min-w-36 px-8 py-3 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
                {isLoading ? "Saving..." : "Continue →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Business screen: Authorized Representative ───────────────────────────
  if (onboardingStatus?.current_step === "representative") {
    const inputCls = "w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#027570]";
    const labelCls = "block text-xs font-medium text-slate-600 mb-1.5";
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-[#027570] uppercase tracking-widest mb-2">Step 4 of 5</p>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Authorized Representative</h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              In Spain, a company needs an authorized person to access AEAT — usually the
              administrator or registered legal representative. Only one person is needed.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <label className={labelCls}>Full name <span className="text-red-500">*</span></label>
              <input className={inputCls} value={repForm.full_name}
                onChange={(e) => setRepForm((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Name and surname(s)" />
            </div>
            <div>
              <label className={labelCls}>DNI / NIE <span className="text-red-500">*</span></label>
              <input className={inputCls} value={repForm.dni_nie}
                onChange={(e) => setRepForm((p) => ({ ...p, dni_nie: e.target.value.toUpperCase() }))}
                placeholder="e.g. 12345678Z or X1234567L" maxLength={9} />
            </div>
            <div>
              <label className={labelCls}>Role <span className="text-red-500">*</span></label>
              <select className={inputCls} value={repForm.role}
                onChange={(e) => setRepForm((p) => ({ ...p, role: e.target.value }))}>
                <option value="">Select role</option>
                {REP_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
              <strong>Note:</strong> This person will authenticate with AEAT in the next step using
              their digital certificate. Their DNI/NIE is recorded as the authorized contact for this company.
            </div>
            <div className="flex justify-end pt-2">
              <button type="button" onClick={handleRepresentativeSave} disabled={isLoading}
                className="min-w-36 px-8 py-3 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
                {isLoading ? "Saving..." : "Continue →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Business screen: AEAT Connection ────────────────────────────────────
  if (onboardingStatus?.current_step === "aeat_connection") {
    const repNif = repForm.dni_nie?.trim().toUpperCase() || "—";
    const contiaNif = import.meta.env.VITE_CONTIA_NIF || "B00000000";
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-[#027570] uppercase tracking-widest mb-2">Step 5 of 5</p>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Connect to AEAT</h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              The authorized representative needs to grant Contia365 permission to file taxes
              on behalf of your company. This is a one-time setup.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Steps to complete on AEAT portal
              </p>
              <ol className="space-y-2">
                {[
                  "Click the button below to open the AEAT portal in a new tab",
                  "Log in with the representative's digital certificate or Cl@ve",
                  "Go to: Representación → Otorgar apoderamiento",
                  `Enter Contia365's NIF: ${contiaNif}`,
                  "Select the tax procedures for your company (G303, G130, G111, etc.)",
                  "Save and return to this page",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#027570]/10 text-[#027570] text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-center justify-between bg-[#027570]/5 border border-[#027570]/20 rounded-xl px-4 py-3">
              <span className="text-xs font-medium text-slate-600">Contia365 NIF (who to authorize)</span>
              <span className="text-sm font-bold text-[#027570] font-mono">{contiaNif}</span>
            </div>

            <a href="https://sede.agenciatributaria.gob.es/Sede/procedimientoini/G322.shtml"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-[#027570] text-[#027570] font-semibold rounded-xl hover:bg-[#027570]/5 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open AEAT Portal
            </a>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500 mb-3 text-center">
                Once you have granted the authorization on AEAT, click below to complete onboarding.
              </p>
              <button type="button" onClick={handleAeatConnect} disabled={aeatConnecting}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
                {aeatConnecting ? "Confirming..." : "I've completed the authorization on AEAT ✓"}
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center">
              You will not need to repeat this step unless AEAT requires re-authentication.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (whiteLabelInterest) {
    let email = "";
    try {
      email = JSON.parse(localStorage.getItem("user") || "{}")?.email || "";
    } catch {
      email = "";
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-r from-[#027570] to-[#038a84] flex items-center justify-center text-white">
            {TYPE_ICONS[WHITE_LABEL_ID]}
          </div>
          <span className="inline-flex px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold uppercase tracking-wide">
            Coming soon
          </span>
          <h1 className="mt-4 text-3xl font-bold text-slate-800">White Label</h1>
          <p className="mt-3 text-slate-500">
            Partner accounts are not open yet. Your interest is saved and sales can see it.
            We will contact you before launch.
          </p>
          {email && (
            <p className="mt-4 text-sm text-slate-600">
              We will send updates to <span className="font-semibold text-slate-800">{email}</span>.
            </p>
          )}
          <button
            type="button"
            onClick={() => { setWhiteLabelInterest(false); setSelected(null); }}
            className="mt-7 px-6 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Choose another account type
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Contia365</h1>
          <p className="text-xs font-semibold text-[#027570] uppercase tracking-widest mb-2">Step 2 of 3</p>
          <p className="text-slate-500 text-base">Select your account type to get started</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {typesLoading
            ? [1, 2, 3].map((i) => <CardSkeleton key={i} />)
            : displayTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelected(type.id)}
                  className={`relative flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2 ${
                    selected === type.id
                      ? "border-[#027570] bg-gradient-to-b from-[#027570] to-[#038a84] text-white shadow-xl scale-[1.02]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#027570] hover:shadow-md"
                  }`}
                >
                  {selected === type.id && (
                    <div className="absolute top-3 right-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className={`mb-3 ${selected === type.id ? "text-white" : "text-[#027570]"}`}>
                    {TYPE_ICONS[type.id] ?? null}
                  </div>
                  <span className="text-lg font-bold">{type.name}</span>
                  <span className={`text-xs font-medium mb-2 ${selected === type.id ? "text-white/80" : "text-slate-400"}`}>
                    {type.subtitle}
                  </span>
                  {type.comingSoon && (
                    <span className={`mb-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      selected === type.id ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                    }`}>
                      Coming soon
                    </span>
                  )}
                  <p className={`text-xs leading-relaxed ${selected === type.id ? "text-white/90" : "text-slate-500"}`}>
                    {type.description}
                  </p>
                </button>
              ))
          }
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selected || isLoading || typesLoading}
            className="min-w-44 px-10 py-3 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
          >
            {isLoading
              ? "Saving..."
              : selected === WHITE_LABEL_ID
                ? (joinedInterests.includes("white_label") ? "On the waitlist" : "Join waitlist")
                : "Continue"}
          </button>
        </div>

        <Modal open={showAEATModal} onClose={() => {}}>
          <ModalHeader title="Spain fiscal profile" />
          <ModalBody className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-blue-800 font-medium text-sm">
                    Upload your census document and confirm your Spanish fiscal details.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-3">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= aeatStep ? "bg-[#027570] text-white" : "bg-slate-200 text-slate-500"
                      }`}>
                        {step < aeatStep ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step
                        )}
                      </div>
                      {step < 4 && (
                        <div className={`w-8 h-0.5 ${step < aeatStep ? "bg-[#027570]" : "bg-slate-200"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {renderAEATStep()}
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-between w-full gap-3">
              {aeatStep > 1 ? (
                <Button variant="secondary" onClick={() => setAeatStep(aeatStep - 1)}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              {aeatStep === 3 && (
                <button
                  type="button"
                  onClick={() => setAeatStep(4)}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {uploadedFile || censusRecordId ? "Review fiscal profile" : "Enter profile without document"}
                </button>
              )}
              {aeatStep === 4 && (
                <button
                  onClick={handleAEATComplete}
                  disabled={isLoading || isUploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
                >
                  {isLoading ? "Saving..." : censusRecordId ? "Save fiscal profile" : "Create fiscal profile"}
                </button>
              )}
              {aeatStep < 3 && (
                <div className="text-xs text-slate-500 text-center self-center">
                  Follow the steps above to continue
                </div>
              )}
            </div>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default Onboarding;
