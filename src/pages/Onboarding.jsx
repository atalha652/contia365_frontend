import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { getUserTypes, selectUserType, uploadCensusDocument } from "../api/apiFunction/onboardingServices";

const TYPE_ICONS = {
  freelancer: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  company: (
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
};

const VERIFICATION_LIMIT = 3 * 60;

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
  const [userTypes, setUserTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAEATModal, setShowAEATModal] = useState(false);
  const [aeatStep, setAeatStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(VERIFICATION_LIMIT);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    const fetchUserTypes = async () => {
      const response = await getUserTypes();
      if (response?.status === 200) {
        setUserTypes(response.data);
      } else {
        toast.error("Could not load account types. Please refresh the page.");
      }
      setTypesLoading(false);
    };

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.user_type && user?.census_data_uploaded) {
      navigate("/app/dashboard", { replace: true });
      return;
    }

    fetchUserTypes();

    if (user?.user_type) {
      setSelected(user.user_type);
      setShowAEATModal(true);
    }
  }, []);

  useEffect(() => {
    if (!showAEATModal) {
      setTimeLeft(VERIFICATION_LIMIT);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setShowAEATModal(false);
          toast.error("3-minute verification window expired. Please try again.");
          navigate("/onboarding");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showAEATModal]);

  const handleContinue = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      const response = await selectUserType(selected);
      if (response?.status === 200) {
        const { user_type } = response.data;
        localStorage.setItem("user_type", user_type);
        setShowAEATModal(true);
      } else {
        toast.error(response?.data?.message || "Failed to save account type. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAEATComplete = () => {
    toast.success("Verification complete! Welcome to Contia365.");
    navigate("/app/dashboard");
  };

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
        toast.success("Census document uploaded. You can now complete verification.");
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
          Upload the downloaded PDF or Word file to complete your verification.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Contia365</h1>
          <p className="text-slate-500 text-base">Select your account type to get started</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {typesLoading
            ? [1, 2, 3].map((i) => <CardSkeleton key={i} />)
            : userTypes.map((type) => (
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
            className="px-10 py-3 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
          >
            {isLoading ? "Setting up..." : "Continue"}
          </button>
        </div>

        <Modal open={showAEATModal} onClose={() => {}}>
          <ModalHeader
            title="AEAT Verification - Required Step"
            action={
              <button
                onClick={() => { setShowAEATModal(false); navigate("/onboarding"); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            }
          />
          <ModalBody>
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-blue-800 font-medium text-sm">
                      This verification is required to complete your registration
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm">Verify your professional status within 3 minutes</p>
                <div className={`mt-2 text-2xl font-bold tabular-nums ${timeLeft <= 30 ? "text-red-500" : "text-[#027570]"}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-4">
                  {[1, 2, 3].map((step) => (
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
                      {step < 3 && (
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
            <div className="flex justify-between w-full">
              {aeatStep > 1 ? (
                <Button variant="secondary" onClick={() => setAeatStep(aeatStep - 1)}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              {aeatStep === 3 && uploadedFile ? (
                <button
                  onClick={handleAEATComplete}
                  disabled={isLoading || isUploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
                >
                  {isLoading ? "Completing..." : "Complete Verification"}
                </button>
              ) : aeatStep < 3 ? (
                <div className="text-xs text-slate-500 text-center">
                  Follow the steps above to continue
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center">
                  Please upload your Census Data PDF to continue
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
