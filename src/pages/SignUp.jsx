// frontend/src/pages/SignUp.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { PiCertificateLight } from "react-icons/pi";
import { TfiEmail } from "react-icons/tfi";
import { updatePageTitle } from "../utils/titleUtils";
import { getOrgTypes, signUp } from "../api/apiFunction/authServices";
import Stepper from "../components/ui/Stepper";
// import Card from "../components/ui/card";
import TextInput from "../components/ui/TextInput";
import SelectInput from "../components/ui/SelectInput";
// import Cta from "../components/ui/Cta";

const SignUp = () => {
  const navigate = useNavigate();

  // global ui
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [orgTypes, setOrgTypes] = useState([]);

  // wizard state - restructured for new flow
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCertificate, setHasCertificate] = useState(null); // true | false | null
  const [profileType, setProfileType] = useState(null); // 'personal' | 'company' | null
  const [administrationType, setAdministrationType] = useState("individual"); // 'joint' | 'individual'
  const [isAdministrator, setIsAdministrator] = useState(true);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(""); // 'stripe' | 'redsys' | 'bizum'
  const [certificateUploaded, setCertificateUploaded] = useState(false);
  const [autoFilledData, setAutoFilledData] = useState(false);

  // membership check state
  const [certificateId, setCertificateId] = useState("");
  const [membershipEmail, setMembershipEmail] = useState("");
  const [isMembershipValid, setIsMembershipValid] = useState(null); // true | false | "assistance" | null
  const [isCertificateVerified, setIsCertificateVerified] = useState(false);

  // assistance flow state
  const [assistanceChoice, setAssistanceChoice] = useState(""); // 'myself' | 'help'
  const [applicationType, setApplicationType] = useState(""); // 'personal' | 'company'
  const [assistancePaymentConfirmed, setAssistancePaymentConfirmed] =
    useState(false);

  // files (not uploaded yet, UI only)
  const [certificateFiles, setCertificateFiles] = useState([]);
  const [companyDeedFile, setCompanyDeedFile] = useState(null);
  const [adminCertificates, setAdminCertificates] = useState([]);

  // form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    password: "",
    confirmPassword: "",
    tax_id: "", // DNI/NIE or VAT
    bank_iban: "",
    bank_account_holder: "",
    organization_info: {
      company_name: "",
      type_id: "",
      type_name: "",
      address: "",
    },
  });

  useEffect(() => {
    updatePageTitle("Sign Up");
    (async () => {
      const types = await getOrgTypes();
      setOrgTypes(types || []);
    })();
  }, []);

  const buildRegistrationFormData = () => {
    const form = new FormData();
    const userType = profileType === "company" ? "organization" : "individual";
    const hasFlow =
      hasCertificate === true
        ? "yes_flow"
        : hasCertificate === false
        ? "no_flow"
        : null;
    const registrationFlow =
      userType === "organization" ? "company_flow" : "personal_flow";
    form.append("name", formData.name || "");
    form.append("email", formData.email || "");
    form.append("password", formData.password || "");
    form.append("type", userType);
    form.append("phone", formData.phone || "");
    form.append("tax_id", formData.tax_id || "");
    form.append("registration_flow", registrationFlow);
    form.append("role", "user");
    form.append("has_digital_certificate", hasFlow || "");
    form.append("auto_fill", hasCertificate ? "true" : "false");
    form.append(
      "dni_nie",
      userType === "individual" ? formData.tax_id || "" : ""
    );
    form.append("iban", formData.bank_iban || "");
    form.append("account_holder", formData.bank_account_holder || "");
    // primary certificate
    if (certificateFiles && certificateFiles[0]) {
      form.append("certificate", certificateFiles[0]);
    }
    // defaults for backend automation
    form.append("connect_to_fnmt", hasCertificate ? "false" : "true");
    form.append("connect_to_aeat", hasCertificate ? "false" : "true");
    form.append("status", "false");
    form.append(
      "administrator_check",
      userType === "organization" ? String(!!isAdministrator) : "false"
    );
    form.append(
      "type_of_administration",
      userType === "organization" ? administrationType : ""
    );
    if (adminCertificates && adminCertificates.length > 0) {
      const other = adminCertificates.map((f) => ({ name: f.name, url_: "" }));
      form.append("other_certificate", JSON.stringify(other));
    } else {
      form.append("other_certificate", "");
    }
    form.append("payment_method", isPaymentConfirmed ? "Stripe" : "");
    return form;
  };

  const steps = useMemo(() => {
    if (hasCertificate === true) {
      // YES Flow with assistance path
      const baseSteps = [
        { key: "cert-question", label: "Verfication" },
        { key: "membership-check", label: "Assistance Offer" },
      ];

      // If certificate ID correct but email wrong -> assistance flow
      if (isMembershipValid === "assistance") {
        baseSteps.push({
          key: "assistance-offer-certificate",
          label: "Assistance",
        });

        if (assistanceChoice === "help") {
          baseSteps.push({
            key: "choose-application-type",
            label: "Application Type",
          });

          if (applicationType === "personal") {
            baseSteps.push(
              { key: "personal-details", label: "Personal Info" },
              { key: "assistance-payment", label: "Payment" }
            );
          } else if (applicationType === "company") {
            baseSteps.push(
              { key: "company-details", label: "Company Info" },
              { key: "assistance-payment", label: "Payment" }
            );
          }
        }
      } else {
        // Normal YES flow
        baseSteps.push(
          { key: "editable-form", label: "Verify Details" },
          { key: "dashboard", label: "Complete" }
        );
      }

      return baseSteps;
    } else if (hasCertificate === false) {
      // NO Flow: Certificate → Assistance Offer → Profile/Application Type → Personal/Company → Payment → Complete
      const flowSteps = [
        { key: "cert-question", label: "Create Profile" },
        { key: "assistance-offer", label: "Assistance Offer" },
      ];

      if (assistanceChoice === "help") {
        flowSteps.push({
          key: "choose-application-type",
          label: "Application Type",
        });

        if (applicationType === "personal") {
          flowSteps.push(
            { key: "personal-details", label: "Personal Info" },
            { key: "assistance-payment", label: "Payment" }
          );
        } else if (applicationType === "company") {
          flowSteps.push(
            { key: "company-details", label: "Company Info" },
            { key: "assistance-payment", label: "Payment" }
          );
        }
      } else if (assistanceChoice === "myself") {
        // User will be redirected to NADRA, no additional steps needed
      } else {
        // Default flow if no assistance choice made yet
        flowSteps.push({ key: "profile-select", label: "Profile Type" });

        if (profileType === "personal") {
          flowSteps.push(
            { key: "personal-details", label: "Personal Info" },
            { key: "payment", label: "Payment" },
            { key: "complete", label: "Complete" }
          );
        } else if (profileType === "company") {
          flowSteps.push(
            { key: "company-details", label: "Company Info" },
            { key: "payment", label: "Payment" },
            { key: "complete", label: "Complete" }
          );
        }
      }

      return flowSteps;
    } else {
      // Initial state
      return [{ key: "cert-question", label: "Certificate" }];
    }
  }, [
    hasCertificate,
    profileType,
    isMembershipValid,
    assistanceChoice,
    applicationType,
  ]);

  const visibleStepIndex = useMemo(() => {
    // Map our logical currentStep to index within steps array, given dynamic personal/company step
    return currentStep;
  }, [currentStep]);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const renderFooterRow = () => {
    const stepKey = steps[currentStep]?.key;
    const isFirst = currentStep === 0;
    const isComplete = stepKey === "complete";
    const isDashboard = stepKey === "dashboard";
    const isEditableForm = stepKey === "editable-form";
    const isMembershipCheck = stepKey === "membership-check";
    const isAssistanceOffer = stepKey === "assistance-offer-certificate";
    const isChooseApplicationType = stepKey === "choose-application-type";
    const isAssistancePayment = stepKey === "assistance-payment";
    const isAssistanceConfirmation = stepKey === "assistance-confirmation";

    // Hide footer for steps with custom navigation
    if (
      isDashboard ||
      isEditableForm ||
      isMembershipCheck ||
      isAssistancePayment ||
      isAssistanceConfirmation
      // isAssistanceOffer ||
      // isChooseApplicationType
    ) {
      return null;
    }

    return (
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="font-semibold text-[#027570] hover:text-[#038a84] transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
          <div className="flex items-center gap-3">
            {!isFirst && !isComplete && (
              <button
                type="button"
                onClick={goBack}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
              >
                Back
              </button>
            )}
            {isComplete ? (
              <button
                onClick={submitRegistration}
                disabled={isLoading || !termsAccepted}
                className="px-8 py-2.5 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  "Finish & Create Account"
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="px-8 py-2.5 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
              >
                {stepKey === "cert-upload"
                  ? "Verify Details"
                  : stepKey === "payment"
                  ? "Complete Registration"
                  : "Continue"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const updateOrgField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      organization_info: { ...prev.organization_info, [key]: value },
    }));
    setError("");
  };

  const handleOrgTypeChange = (e) => {
    const selected = orgTypes.find(
      (t) => String(t.id) === String(e.target.value)
    );
    if (!selected) return;
    updateOrgField("type_id", selected.id);
    updateOrgField("type_name", selected.name);
  };

  const validateCurrentStep = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const stepKey = steps[currentStep]?.key;

    // Step 1: Certificate question
    if (stepKey === "cert-question") {
      if (hasCertificate === null) {
        setError("Please select whether you have a digital certificate");
        return false;
      }
    }

    // YES Flow validations
    if (stepKey === "membership-check") {
      if (!certificateId || certificateId.trim() === "") {
        setError("Certificate ID is required");
        return false;
      }
      // Email is optional, but if provided, it must be valid
      if (membershipEmail && !emailRegex.test(membershipEmail)) {
        setError("Please enter a valid email address");
        return false;
      }
    }

    if (stepKey === "cert-upload") {
      if (certificateFiles.length === 0) {
        setError("Please upload your digital certificate");
        return false;
      }
    }

    if (stepKey === "editable-form") {
      if (!formData.name || formData.name.trim() === "") {
        setError("Full name is required");
        return false;
      }
      if (!formData.tax_id || formData.tax_id.trim() === "") {
        setError("DNI/NIE is required");
        return false;
      }
      if (!formData.email || !emailRegex.test(formData.email)) {
        setError("Valid email is required");
        return false;
      }
      if (!formData.password || formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return false;
      }
      if (!formData.phone || formData.phone.trim() === "") {
        setError("Phone number is required");
        return false;
      }
      if (!formData.bank_iban || formData.bank_iban.trim() === "") {
        setError("IBAN is required");
        return false;
      }
      if (
        !formData.bank_account_holder ||
        formData.bank_account_holder.trim() === ""
      ) {
        setError("Account holder name is required");
        return false;
      }
    }

    // NO Flow validations
    if (stepKey === "profile-select") {
      if (!profileType) {
        setError("Please select your profile type (Personal or Company)");
        return false;
      }
    }

    if (stepKey === "personal-details") {
      if (!formData.name || !formData.tax_id) {
        setError("Full name and DNI/NIE are required");
        return false;
      }
      if (!formData.email || !emailRegex.test(formData.email)) {
        setError("Valid email is required");
        return false;
      }
      if (!formData.phone) {
        setError("Phone number is required");
        return false;
      }
      if (!formData.bank_iban || !formData.bank_account_holder) {
        setError("Bank details (IBAN and account holder) are required");
        return false;
      }
    }

    if (stepKey === "company-details") {
      if (!isAdministrator) {
        setError("Only company administrators can proceed with registration");
        return false;
      }
      if (!formData.organization_info.company_name) {
        setError("Company name is required");
        return false;
      }
      if (!formData.organization_info.type_id) {
        setError("Please select company type");
        return false;
      }
      if (!formData.email || !emailRegex.test(formData.email)) {
        setError("Valid email is required");
        return false;
      }
      if (!formData.phone) {
        setError("Phone number is required");
        return false;
      }
      if (!formData.bank_iban || !formData.bank_account_holder) {
        setError("Bank details (IBAN and account holder) are required");
        return false;
      }
      if (!companyDeedFile) {
        setError("Please upload company registration/deed document");
        return false;
      }
      if (administrationType === "joint" && adminCertificates.length === 0) {
        setError(
          "Please upload administrator certificates for joint administration"
        );
        return false;
      }
    }

    if (stepKey === "payment") {
      if (!paymentMethod) {
        setError("Please select a payment method");
        return false;
      }
      if (!isPaymentConfirmed) {
        setError("Please complete the €20 payment to continue");
        return false;
      }
    }

    if (stepKey === "complete") {
      if (!termsAccepted) {
        setError("Please accept the Terms of Service and Privacy Policy");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    goNext();
  };

  const submitRegistration = async () => {
    setError("");
    setIsLoading(true);
    try {
      // const stepKey = steps[currentStep]?.key;
      // if (stepKey !== "editable-form" && !termsAccepted) {
      //   throw new Error(
      //     "Please accept the Terms of Service and Privacy Policy"
      //   );
      // }

      const form = buildRegistrationFormData();
      const response = await signUp(form);
      if (response.status === 201 || response.status === 200) {
        toast.success("Registration successful! Please login to continue.");
        navigate("/sign-in");
      } else {
        const errorMessage =
          response.data?.detail ||
          response.data?.message ||
          "Registration failed. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (err) {
      const message = err?.message || "An error occurred during registration.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    const stepKey = steps[currentStep]?.key;
    switch (stepKey) {
      case "cert-question":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Digital Certificate
              </h3>
              <p className="text-slate-600">
                Do you already have a Digital Certificate?
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setHasCertificate(true);
                  setCurrentStep(1);
                }}
                className={`group relative px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                  hasCertificate === true
                    ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#027570] hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <svg
                    className={`w-6 h-6 ${
                      hasCertificate === true ? "text-white" : "text-[#027570]"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="font-semibold">Yes, I have one</span>
                <p className="text-xs mt-2 opacity-80">
                  Upload your existing certificate
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasCertificate(false);
                  setCurrentStep(1);
                }}
                className={`group relative px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                  hasCertificate === false
                    ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#027570] hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <svg
                    className={`w-6 h-6 ${
                      hasCertificate === false ? "text-white" : "text-[#027570]"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <span className="font-semibold">No, help me get one</span>
                <p className="text-xs mt-2 opacity-80">
                  Guided onboarding process
                </p>
              </button>
            </div>
          </div>
        );
      case "membership-check":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Membership Check
              </h3>
              <p className="text-slate-600">
                Enter your Certificate ID and email address (optional)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-blue-800 font-medium">
                    Hardcoded Test Data:
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    Certificate ID:{" "}
                    <span className="font-mono">INV-2024-001</span>
                  </p>
                  <p className="text-blue-700 text-sm">
                    Email: <span className="font-mono">member@example.com</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <TextInput
                id="certificate_id"
                label="Certificate ID"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                required
                placeholder="Enter your certificate ID"
                endAdornment={<PiCertificateLight />}
              />

              <TextInput
                id="membership_email"
                label="Email Address (Optional)"
                type="email"
                value={membershipEmail}
                onChange={(e) => setMembershipEmail(e.target.value)}
                placeholder="Enter your email address"
                endAdornment={<TfiEmail />}
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={goBack}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => {
                  const hardcodedEmail = "member@example.com";
                  const hardcodedCertificateId = "INV-2024-001";

                  // Check certificate ID first
                  if (certificateId !== hardcodedCertificateId) {
                    // Wrong certificate ID - redirect to profile select
                    setHasCertificate(false);
                    setCurrentStep(1);
                    return;
                  }

                  // Certificate ID is correct, now check email
                  if (membershipEmail === hardcodedEmail) {
                    // Both correct - redirect to sign in
                    setIsMembershipValid(true);
                    navigate("/sign-in");
                  } else {
                    // Correct certificate ID but wrong/empty email - assistance flow
                    setIsMembershipValid("assistance");
                    goNext();
                  }
                }}
                disabled={!certificateId}
                className="px-6 py-2.5 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
              >
                Check Membership
              </button>
            </div>

            {isMembershipValid === false && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-yellow-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-yellow-800 font-medium">
                    No existing membership found. Proceeding with new
                    registration.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "assistance-offer-certificate":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Assistance Maintenance
              </h3>
              <p className="text-slate-600">
                This procedure is free if you do it yourself. If you want us to
                handle it, there is a processing fee.
              </p>
            </div>

            <div className="w-full">
              <button
                type="button"
                onClick={() => {
                  setAssistanceChoice("help");
                  goNext();
                }}
                className={`w-full group relative px-6 py-6 rounded-xl border-2 transition-all duration-200 ${
                  assistanceChoice === "help"
                    ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#027570] hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className={`w-8 h-8 mb-3 ${
                      assistanceChoice === "help"
                        ? "text-white"
                        : "text-[#027570]"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-bold text-lg">Yes, I Need Help</span>
                  <span
                    className={`text-sm mt-1 ${
                      assistanceChoice === "help"
                        ? "text-orange-100"
                        : "text-orange-600"
                    }`}
                  >
                    Processing Fee
                  </span>
                  <p className="text-xs mt-2 opacity-80">
                    We handle everything for you
                  </p>
                </div>
              </button>
            </div>
          </div>
        );

      case "assistance-offer":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Assistance Offer
              </h3>
              <p className="text-slate-600">
                This procedure is free if you do it yourself. If you want us to
                handle it, there is a processing fee.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setAssistanceChoice("myself");
                  // Redirect to NADRA website
                  window.open("https://id.nadra.gov.pk/e-id/", "_blank");
                }}
                className="group relative px-6 py-6 rounded-xl border-2 border-slate-200 bg-white text-slate-700 hover:border-green-500 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-8 h-8 text-green-600 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-bold text-lg">Do it yourself</span>
                  <span className="text-sm mt-1 text-green-600">Free</span>
                  <p className="text-xs mt-2 opacity-80">Self-service option</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAssistanceChoice("help");
                }}
                className={`group relative px-6 py-6 rounded-xl border-2 transition-all duration-200 ${
                  assistanceChoice === "help"
                    ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#027570] hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className={`w-8 h-8 mb-3 ${
                      assistanceChoice === "help"
                        ? "text-white"
                        : "text-[#027570]"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-bold text-lg">Yes, I Need Help</span>
                  <span
                    className={`text-sm mt-1 ${
                      assistanceChoice === "help"
                        ? "text-orange-100"
                        : "text-orange-600"
                    }`}
                  >
                    Processing Fee
                  </span>
                  <p className="text-xs mt-2 opacity-80">
                    We handle everything for you
                  </p>
                </div>
              </button>
            </div>
          </div>
        );

      case "choose-application-type":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Choose Application Type
              </h3>
              <p className="text-slate-600">
                What type of application do you need?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setApplicationType("personal");
                  setProfileType("personal");
                  goNext();
                }}
                className={`group relative px-6 py-6 rounded-xl border-2 transition-all duration-200 ${
                  applicationType === "personal"
                    ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#027570] hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className={`w-8 h-8 mb-3 ${
                      applicationType === "personal"
                        ? "text-white"
                        : "text-[#027570]"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-bold text-lg">Personal</span>
                  <span
                    className={`text-lg font-bold mt-1 ${
                      applicationType === "personal"
                        ? "text-teal-100"
                        : "text-[#027570]"
                    }`}
                  >
                    €20
                  </span>
                  <p className="text-xs mt-2 opacity-80">
                    Individual certificate application
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setApplicationType("company");
                  setProfileType("company");
                  goNext();
                }}
                className={`group relative px-6 py-6 rounded-xl border-2 transition-all duration-200 ${
                  applicationType === "company"
                    ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#027570] hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className={`w-8 h-8 mb-3 ${
                      applicationType === "company"
                        ? "text-white"
                        : "text-[#027570]"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="font-bold text-lg">Company</span>
                  <span
                    className={`text-lg font-bold mt-1 ${
                      applicationType === "company"
                        ? "text-teal-100"
                        : "text-[#027570]"
                    }`}
                  >
                    €50
                  </span>
                  <p className="text-xs mt-2 opacity-80">
                    Business / Third-Party application
                  </p>
                </div>
              </button>
            </div>
          </div>
        );

      case "profile-select":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Profile Type
              </h3>
              <p className="text-slate-600">
                Are you registering as an individual or a company?
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setProfileType("personal");
                  setCurrentStep(2);
                }}
                className={`group relative px-6 py-6 rounded-xl border-2 transition-all duration-200 ${
                  profileType === "personal"
                    ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#027570] hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center mb-3">
                    <svg
                      className={`w-8 h-8 ${
                        profileType === "personal"
                          ? "text-white"
                          : "text-[#027570]"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <span className="font-bold text-lg">Personal</span>
                  <span
                    className={`text-sm mt-1 ${
                      profileType === "personal"
                        ? "text-teal-100"
                        : "text-slate-500"
                    }`}
                  >
                    Individual account - Faster process
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileType("company");
                  setCurrentStep(2);
                }}
                className={`group relative px-6 py-6 rounded-xl border-2 transition-all duration-200 ${
                  profileType === "company"
                    ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#027570] hover:shadow-md"
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center mb-3">
                    <svg
                      className={`w-8 h-8 ${
                        profileType === "company"
                          ? "text-white"
                          : "text-[#027570]"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <span className="font-bold text-lg">Company</span>
                  <span
                    className={`text-sm mt-1 ${
                      profileType === "company"
                        ? "text-teal-100"
                        : "text-slate-500"
                    }`}
                  >
                    Business account - May require multiple certificates
                  </span>
                </div>
              </button>
            </div>
          </div>
        );
      case "personal-details":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Personal Information
              </h3>
              <p className="text-slate-600">
                Enter your personal details for certificate request
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                id="name"
                label="Full Name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
                placeholder="John Doe"
              />
              <TextInput
                id="tax_id"
                label="DNI/NIE"
                value={formData.tax_id}
                onChange={(e) => updateField("tax_id", e.target.value)}
                required
                placeholder="00000000A"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
                placeholder="you@example.com"
              />
              <TextInput
                id="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
                placeholder="*********"
              />
            </div>
            <TextInput
              id="phone"
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+34 600 000 000"
            />

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-3">
                Bank Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  id="bank_iban"
                  label="IBAN"
                  value={formData.bank_iban}
                  onChange={(e) => updateField("bank_iban", e.target.value)}
                  placeholder="ES91 2100 0418 4502 0005 1332"
                />
                <TextInput
                  id="bank_account_holder"
                  label="Account Holder"
                  value={formData.bank_account_holder}
                  onChange={(e) =>
                    updateField("bank_account_holder", e.target.value)
                  }
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-blue-800 font-medium text-sm">
                    Next Steps
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    After payment, we'll connect to FNMT to generate your
                    request code and schedule an AEAT appointment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "company-details":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Company Information
              </h3>
              <p className="text-slate-600">
                Enter your company details for certificate request
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <input
                  id="admin_check"
                  type="checkbox"
                  checked={isAdministrator}
                  onChange={(e) => setIsAdministrator(e.target.checked)}
                  className="h-4 w-4 text-[#027570] focus:ring-[#027570] border-slate-300 rounded"
                />
                <label
                  htmlFor="admin_check"
                  className="text-sm font-medium text-slate-700"
                >
                  I am an administrator of the company
                </label>
              </div>
              {!isAdministrator && (
                <p className="text-red-600 text-sm mt-2">
                  Only company administrators can proceed with registration.
                </p>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-3">
                Administration Type
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdministrationType("individual")}
                  className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    administrationType === "individual"
                      ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-[#027570]"
                  }`}
                >
                  <div className="text-center">
                    <span className="font-semibold">
                      Individual (Solidario)
                    </span>
                    <p className="text-xs mt-1 opacity-80">
                      Only one administrator certificate needed
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAdministrationType("joint")}
                  className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    administrationType === "joint"
                      ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-[#027570]"
                  }`}
                >
                  <div className="text-center">
                    <span className="font-semibold">Joint (Mancomunado)</span>
                    <p className="text-xs mt-1 opacity-80">
                      All administrators must provide certificates
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                id="company_name"
                label="Company Name"
                value={formData.organization_info.company_name}
                onChange={(e) => updateOrgField("company_name", e.target.value)}
                required
                placeholder="Acme S.L."
              />
              <SelectInput
                id="org_type"
                label="Company Type"
                value={formData.organization_info.type_id}
                onChange={handleOrgTypeChange}
                required
              >
                <option value="">Select type</option>
                {Array.isArray(orgTypes) &&
                  orgTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
              </SelectInput>
            </div>

            <TextInput
              id="org_address"
              label="Address"
              value={formData.organization_info.address}
              onChange={(e) => updateOrgField("address", e.target.value)}
              placeholder="Street, City, ZIP"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
                placeholder="company@example.com"
              />
              <TextInput
                id="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
                placeholder="*********"
              />
            </div>

            <TextInput
              id="phone"
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+34 900 000 000"
            />

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-3">
                Bank Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  id="bank_iban"
                  label="IBAN"
                  value={formData.bank_iban}
                  onChange={(e) => updateField("bank_iban", e.target.value)}
                  placeholder="ES91 2100 0418 4502 0005 1332"
                />
                <TextInput
                  id="bank_account_holder"
                  label="Account Holder"
                  value={formData.bank_account_holder}
                  onChange={(e) =>
                    updateField("bank_account_holder", e.target.value)
                  }
                  placeholder="Company Name S.L."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Registration / Deed (PDF/JPG)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#027570] transition-colors duration-200">
                  <input
                    type="file"
                    id="company_deed"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setCompanyDeedFile((e.target.files || [])[0] || null)
                    }
                    className="hidden"
                  />
                  <label htmlFor="company_deed" className="cursor-pointer">
                    <svg
                      className="w-8 h-8 text-slate-400 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-sm text-slate-600">
                      {companyDeedFile
                        ? companyDeedFile.name
                        : "Click to upload company registration"}
                    </p>
                  </label>
                </div>
              </div>

              {administrationType === "joint" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Administrator Certificates (Multiple files)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#027570] transition-colors duration-200">
                    <input
                      type="file"
                      id="admin_certs"
                      multiple
                      accept=".pdf,.p12,.pfx,.crt,.cer"
                      onChange={(e) =>
                        setAdminCertificates(Array.from(e.target.files || []))
                      }
                      className="hidden"
                    />
                    <label htmlFor="admin_certs" className="cursor-pointer">
                      <svg
                        className="w-8 h-8 text-slate-400 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-slate-600">
                        {adminCertificates.length > 0
                          ? `${adminCertificates.length} certificate(s) selected`
                          : "Click to upload administrator certificates"}
                      </p>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-blue-800 font-medium text-sm">
                    Company Flow Process
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    After payment, we'll use the uploaded certificates to
                    request your company certificate and connect to FNMT/AEAT
                    for processing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "payment":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Payment
              </h3>
              <p className="text-slate-600">
                Complete your €20 payment to proceed with certificate processing
              </p>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-teal-50 border border-slate-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-xl flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold text-lg">
                      Digital Certificate Processing
                    </p>
                    <p className="text-slate-600 text-sm">
                      FNMT connection & AEAT appointment scheduling
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#027570]">€20</p>
                  <p className="text-slate-500 text-sm">One-time fee</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 mb-3">
                Choose Payment Method
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    paymentMethod === "stripe"
                      ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white shadow-lg"
                      : "border-slate-300 bg-white text-slate-700 hover:border-[#027570] hover:shadow-md"
                  }`}
                >
                  <div className="text-center">
                    <svg
                      className={`w-8 h-8 mx-auto mb-2 ${
                        paymentMethod === "stripe"
                          ? "text-white"
                          : "text-[#635bff]"
                      }`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                    </svg>
                    <span className="font-semibold">Stripe</span>
                    <p className="text-xs mt-1 opacity-80">Credit/Debit Card</p>
                  </div>
                </button>

                {/* Redsys Button */}
                <button
                  disabled
                  type="button"
                  onClick={() => setPaymentMethod("redsys")}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    paymentMethod === "redsys"
                      ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white shadow-lg"
                      : "border-slate-300 bg-white text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <div className="text-center">
                    <svg
                      className={`w-8 h-8 mx-auto mb-2 ${
                        paymentMethod === "redsys"
                          ? "text-white"
                          : "text-red-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span className="font-semibold">Redsys</span>
                    <p className="text-xs mt-1 opacity-50">Spanish Banks</p>
                  </div>
                </button>

                {/* Bizum Button */}
                <button
                  disabled
                  type="button"
                  onClick={() => setPaymentMethod("bizum")}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    paymentMethod === "bizum"
                      ? "border-[#027570] bg-gradient-to-r from-[#027570] to-[#038a84] text-white shadow-lg"
                      : "border-slate-300 bg-white text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <div className="text-center">
                    <svg
                      className={`w-8 h-8 mx-auto mb-2 ${
                        paymentMethod === "bizum"
                          ? "text-white"
                          : "text-blue-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="font-semibold">Bizum</span>
                    <p className="text-xs mt-1 opacity-50">Mobile Payment</p>
                  </div>
                </button>
              </div>
            </div>

            {paymentMethod && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentConfirmed(true);
                    // Here you would integrate with the actual payment provider
                    console.log(`Processing payment with ${paymentMethod}`);
                  }}
                  disabled={isPaymentConfirmed}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isPaymentConfirmed
                      ? "bg-green-500 text-white shadow-lg cursor-not-allowed"
                      : "bg-gradient-to-r from-[#027570] to-[#038a84] text-white shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570]"
                  } focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2`}
                >
                  {isPaymentConfirmed ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Payment Confirmed - €20 via{" "}
                      {paymentMethod.charAt(0).toUpperCase() +
                        paymentMethod.slice(1)}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Pay €20 with{" "}
                      {paymentMethod.charAt(0).toUpperCase() +
                        paymentMethod.slice(1)}
                    </div>
                  )}
                </button>
              </div>
            )}

            {isPaymentConfirmed && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <p className="text-green-800 font-medium">
                      Payment successful!
                    </p>
                    <p className="text-green-700 text-sm">
                      Processing your certificate request...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "assistance-payment":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Assistance Payment
              </h3>
              <p className="text-slate-600">
                Complete payment for professional assistance
              </p>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-teal-50 border border-slate-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-xl flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold text-lg">
                      {applicationType === "personal"
                        ? "Personal Application"
                        : "Company Application"}
                    </p>
                    <p className="text-slate-600 text-sm">
                      Professional assistance service
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#027570]">
                    €{applicationType === "personal" ? "20" : "50"}
                  </p>
                  <p className="text-slate-500 text-sm">Processing fee</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={goBack}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
              >
                Back
              </button>

              {/* <button
                type="button"
                onClick={() => {
                  setAssistancePaymentConfirmed(true);
                  toast.success(
                    "Payment successful! Please complete your registration."
                  );
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
              >
                Pay Now €{applicationType === "personal" ? "20" : "50"}
              </button> */}
              <div className="flex gap-4">
                {/* Cash Payment Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAssistancePaymentConfirmed(true);
                    toast.success(
                      "Cash payment confirmed! Please complete your registration."
                    );
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-yellow-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
                >
                   Cash €{applicationType === "personal" ? "20" : "50"}
                </button>

                {/* Bank Payment Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAssistancePaymentConfirmed(true);
                    toast.success(
                      "Bank payment successful! Please complete your registration."
                    );
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
                >
                  Pay with Bank €{applicationType === "personal" ? "20" : "50"}
                </button>
              </div>
            </div>

            {assistancePaymentConfirmed && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <div>
                      <p className="text-green-800 font-medium">
                        Payment successful!
                      </p>
                      <p className="text-green-700 text-sm">
                        Please complete your registration to create your
                        account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <button
                    type="button"
                    onClick={submitRegistration}
                    disabled={isLoading}
                    className="w-full px-8 py-3 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading
                      ? "Creating Account..."
                      : "Complete Registration"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case "complete":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Registration Complete!
              </h3>
              <p className="text-slate-600">
                Your certificate request has been submitted successfully
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-800 font-medium">
                    Payment processed (€20)
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-800 font-medium">
                    FNMT connection initiated
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-800 font-medium">
                    AEAT appointment scheduled
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-blue-800 font-medium text-sm">
                    What's Next?
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    You'll receive an email with your appointment details and
                    further instructions. You can track your certificate status
                    in your dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-5 w-5 text-[#027570] focus:ring-[#027570] border-slate-300 rounded-md transition-colors duration-200"
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="terms"
                  className="text-slate-700 leading-relaxed"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="font-semibold text-[#027570] hover:text-[#038a84] underline decoration-2 underline-offset-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-semibold text-[#027570] hover:text-[#038a84] underline decoration-2 underline-offset-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const title = useMemo(() => {
    return "Create your account";
  }, []);

  const subtitle = useMemo(() => {
    return "We'll guide you step by step. You can edit email, phone and bank later.";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header with Logo/Brand */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl shadow-lg mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCheckCircle className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-[#027570] to-[#038a84] bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Invoice Automate
            </motion.h1>
            <motion.p
              className="text-slate-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Streamline your invoice management
            </motion.p>
          </motion.div>

          <div className="mb-8 flex justify-center">
            <div className="w-full">
              <Stepper steps={steps} currentStep={visibleStepIndex} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-[#027570] to-[#038a84] px-8 py-6">
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              <p className="text-teal-100">{subtitle}</p>
            </div>
            <div className="p-8">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                          className="h-4 w-4 text-red-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {renderStep()}
              {renderFooterRow()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
