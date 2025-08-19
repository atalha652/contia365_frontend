// frontend/src/pages/SignUp.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updatePageTitle } from "../utils/titleUtils";
import { getOrgTypes, signUp } from "../api/apiFunction/authServices";
import Stepper from "../components/ui/Stepper";
import Card from "../components/ui/card";
import TextInput from "../components/ui/TextInput";
import SelectInput from "../components/ui/SelectInput";
import Cta from "../components/ui/Cta";

const SignUp = () => {
  const navigate = useNavigate();

  // global ui
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [orgTypes, setOrgTypes] = useState([]);

  // wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCertificate, setHasCertificate] = useState(null); // true | false | null
  const [profileType, setProfileType] = useState(null); // 'personal' | 'company' | null
  const [administrationType, setAdministrationType] = useState("individual"); // 'joint' | 'individual'
  const [isAdministrator, setIsAdministrator] = useState(true);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // files (not uploaded yet, UI only)
  const [certificateFiles, setCertificateFiles] = useState([]);
  const [companyDeedFile, setCompanyDeedFile] = useState(null);
  const [adminCertificates, setAdminCertificates] = useState([]);

  // form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
    const hasFlow = hasCertificate === true ? "yes_flow" : hasCertificate === false ? "no_flow" : null;
    const registrationFlow = userType === "organization" ? "company_flow" : "personal_flow";
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
    form.append("dni_nie", userType === "individual" ? (formData.tax_id || "") : "");
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
    form.append("administrator_check", userType === "organization" ? String(!!isAdministrator) : "false");
    form.append("type_of_administration", userType === "organization" ? administrationType : "");
    if (adminCertificates && adminCertificates.length > 0) {
      const other = adminCertificates.map((f) => ({ name: f.name, url_: "" }));
      form.append("other_certificate", JSON.stringify(other));
    } else {
      form.append("other_certificate", "");
    }
    form.append("payment_method", isPaymentConfirmed ? "Stripe" : "");
    return form;
  };

  const steps = useMemo(() => ([
    { key: "cert-q", label: "Certificate" },
    { key: "cert-upload", label: "Upload/Connect" },
    { key: "profile", label: "Profile" },
    { key: profileType === "company" ? "company" : "personal", label: profileType === "company" ? "Company" : "Personal" },
    { key: "payment", label: "Payment" },
    { key: "security", label: "Security" },
    { key: "review", label: "Finish" },
  ]), [profileType]);

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
    const isReview = stepKey === "review";
    const isPayment = stepKey === "payment";
    const nextDisabled = isLoading || (isPayment && !isPaymentConfirmed);
    return (
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-fg-60">
          Already have an account? <Link to="/sign-in" className="font-medium text-ac-02 hover:text-ac-01">Sign in</Link>
        </p>
        <div className="flex items-center gap-3">
          {!isFirst && (
            <button type="button" onClick={goBack} className="px-4 py-2 rounded-md border border-bd-50 text-fg-50">Back</button>
          )}
          {isReview ? (
            <Cta onClick={submitRegistration} disabled={isLoading || !termsAccepted}>{isLoading ? "Submitting..." : "Finish & Create Account"}</Cta>
          ) : (
            <Cta onClick={handleNext} disabled={nextDisabled || (stepKey === "cert-q" && hasCertificate === null) || (stepKey === "profile" && !profileType)}>Continue</Cta>
          )}
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
    const selected = orgTypes.find((t) => String(t.id) === String(e.target.value));
    if (!selected) return;
    updateOrgField("type_id", selected.id);
    updateOrgField("type_name", selected.name);
  };

  const validateCurrentStep = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // step-dependent minimal validation
    const stepKey = steps[currentStep]?.key;
    if (stepKey === "initial" || stepKey === "cert-q") {
      if (hasCertificate === null) {
        setError("Please select an option to continue");
        return false;
      }
    }
    if (stepKey === "profile") {
      if (!profileType) {
        setError("Please select a profile type");
        return false;
      }
    }
    if (stepKey === "cert-upload") {
      if (certificateFiles.length === 0) {
        setError("Please upload or connect your certificate");
        return false;
      }
    }
    if (stepKey === "details" || stepKey === "personal" || stepKey === "company") {
      if (!formData.email || !emailRegex.test(formData.email)) {
        setError("Valid email is required");
        return false;
      }
      if (!formData.phone) {
        setError("Phone is required");
        return false;
      }
      if (!formData.bank_iban || !formData.bank_account_holder) {
        setError("Bank IBAN and account holder are required");
        return false;
      }
    }
    if (stepKey === "personal") {
      if (!formData.name || !formData.tax_id) {
        setError("Full name and DNI/NIE are required");
        return false;
      }
    }
    if (stepKey === "company") {
      if (!isAdministrator) {
        setError("Only an administrator can proceed with company onboarding");
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
      if (administrationType === "joint" && adminCertificates.length === 0) {
        setError("Please attach administrator certificates for joint administration");
        return false;
      }
    }
    if (stepKey === "payment") {
      if (!isPaymentConfirmed) {
        setError("Please complete the €20 payment to continue");
        return false;
      }
    }
    if (stepKey === "security") {
      if (!formData.password || formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
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
      if (!termsAccepted) {
        throw new Error("Please accept the Terms of Service and Privacy Policy");
      }

      const form = buildRegistrationFormData();
      const response = await signUp(form);
      if (response.status === 201 || response.status === 200) {
        toast.success("Registration successful! Please login to continue.");
        navigate("/sign-in");
      } else {
        const errorMessage = response.data?.detail || response.data?.message || "Registration failed. Please try again.";
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
      case "initial":
      case "cert-q":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-fg-50">Do you already have a Digital Certificate?</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setHasCertificate(true); }}
                className={`px-4 py-3 rounded-md border ${hasCertificate === true ? "bg-bg-40 text-white border-bd-50" : "border-bd-50 bg-bg-60 text-fg-50 hover:bg-bg-40"}`}
              >
                Yes, I have one
              </button>
              <button
                type="button"
                onClick={() => { setHasCertificate(false); }}
                className={`px-4 py-3 rounded-md border ${hasCertificate === false ? "bg-bg-40 text-white border-bd-50" : "border-bd-50 bg-bg-60 text-fg-50 hover:bg-bg-40"}`}
              >
                No, help me get one
              </button>
            </div>
          </div>
        );
      case "cert-upload":
        return (
          <div className="space-y-6">
            <TextInput
              id="certificate"
              label="Upload your certificate (.pdf/.docx)"
              type="file"
              onChange={(e) => setCertificateFiles(Array.from(e.target.files || []))}
            />

          </div>
        );
      case "details":
        return (
          <div className="space-y-4">
            <TextInput id="name" label="Full Name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} required placeholder="John Doe" />
            <TextInput id="email" label="Email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} required placeholder="you@example.com" />
            <TextInput id="phone" label="Phone" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+34 600 000 000" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput id="bank_iban" label="IBAN" value={formData.bank_iban} onChange={(e) => updateField("bank_iban", e.target.value)} placeholder="ES91 2100 0418 4502 0005 1332" />
              <TextInput id="bank_account_holder" label="Account Holder" value={formData.bank_account_holder} onChange={(e) => updateField("bank_account_holder", e.target.value)} placeholder="John Doe" />
            </div>

          </div>
        );
      case "profile":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-fg-50">Are you registering as an individual or a company?</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setProfileType("personal"); setCurrentStep(2); }}
                className={`px-4 py-3 rounded-md border border-bd-50 ${profileType === "personal" ? "bg-bg-40 text-white" : "bg-bg-60 text-fg-50 hover:bg-bg-40"}`}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => { setProfileType("company"); setCurrentStep(2); }}
                className={`px-4 py-3 rounded-md border border-bd-50 ${profileType === "company" ? "bg-bg-40 text-white" : "bg-bg-60 text-fg-50 hover:bg-bg-40"}`}
              >
                Company
              </button>
            </div>

          </div>
        );
      case "personal":
        return (
          <div className="space-y-4">
            <TextInput id="name" label="Full Name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} required placeholder="John Doe" />
            <TextInput id="tax_id" label="DNI/NIE" value={formData.tax_id} onChange={(e) => updateField("tax_id", e.target.value)} required placeholder="00000000A" />
            <TextInput id="email" label="Email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} required placeholder="you@example.com" />
            <TextInput id="phone" label="Phone" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+34 600 000 000" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput id="bank_iban" label="IBAN" value={formData.bank_iban} onChange={(e) => updateField("bank_iban", e.target.value)} placeholder="ES91 2100 0418 4502 0005 1332" />
              <TextInput id="bank_account_holder" label="Account Holder" value={formData.bank_account_holder} onChange={(e) => updateField("bank_account_holder", e.target.value)} placeholder="John Doe" />
            </div>

          </div>
        );
      case "company":
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <input id="admin_check" type="checkbox" checked={isAdministrator} onChange={(e) => setIsAdministrator(e.target.checked)} className="h-4 w-4 text-ac-02 focus:ring-ac-02 border-bd-50 rounded" />
              <label htmlFor="admin_check" className="text-sm text-fg-50">I am an administrator of the company</label>
            </div>
            <div>
              <span className="block text-sm font-medium text-fg-50 mb-2">Administration Type</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAdministrationType("individual")} className={`px-3 py-2 rounded-md border ${administrationType === "individual" ? "bg-bg-40 text-white border-bd-50" : "border-bd-50 bg-bg-60 text-fg-50"}`}>Individual (Solidario)</button>
                <button type="button" onClick={() => setAdministrationType("joint")} className={`px-3 py-2 rounded-md border ${administrationType === "joint" ? "bg-bg-40 text-white border-bd-50" : "border-bd-50 bg-bg-60 text-fg-50"}`}>Joint (Mancomunado)</button>
              </div>
            </div>
            <TextInput id="company_name" label="Company Name" value={formData.organization_info.company_name} onChange={(e) => updateOrgField("company_name", e.target.value)} required placeholder="Acme S.L." />
            <SelectInput id="org_type" label="Company Type" value={formData.organization_info.type_id} onChange={handleOrgTypeChange} required>
              <option value="">Select type</option>
              {orgTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </SelectInput>
            <TextInput id="org_address" label="Address" value={formData.organization_info.address} onChange={(e) => updateOrgField("address", e.target.value)} placeholder="Street, City, ZIP" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput id="email" label="Email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} required placeholder="you@example.com" />
              <TextInput id="phone" label="Phone" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+34 600 000 000" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput id="bank_iban" label="IBAN" value={formData.bank_iban} onChange={(e) => updateField("bank_iban", e.target.value)} placeholder="ES91 2100 0418 4502 0005 1332" />
              <TextInput id="bank_account_holder" label="Account Holder" value={formData.bank_account_holder} onChange={(e) => updateField("bank_account_holder", e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-50">Company Registration / Deed</label>
              <input type="file" onChange={(e) => setCompanyDeedFile((e.target.files || [])[0] || null)} className="mt-1 block w-full text-fg-50" />
            </div>
            {administrationType === "joint" && (
              <div>
                <label className="block text-sm font-medium text-fg-50">Administrator Certificates</label>
                <input type="file" multiple onChange={(e) => setAdminCertificates(Array.from(e.target.files || []))} className="mt-1 block w-full text-fg-50" />
              </div>
            )}

          </div>
        );
      case "payment":
        return (
          <div className="space-y-6">
            <div className="p-4 border border-bd-50 rounded-md bg-bg-60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-fg-50 font-medium">Digital Certificate Onboarding</p>
                  <p className="text-fg-60 text-sm">Secure processing and appointment scheduling</p>
                </div>
                <p className="text-fg-50 font-semibold">€20</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPaymentConfirmed(true)}
              className={`w-full py-2 rounded-md ${isPaymentConfirmed ? "bg-bg-40" : "bg-ac-02 hover:bg-ac-01"} text-white`}
            >
              {isPaymentConfirmed ? "Payment Confirmed" : "Pay €20"}
            </button>

          </div>
        );
      case "security":
        return (
          <div className="space-y-4">
            <TextInput id="password" label="Create Password" type="password" value={formData.password} onChange={(e) => updateField("password", e.target.value)} required placeholder="••••••••" helpText="At least 6 characters" />
            <TextInput id="confirm_password" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} required placeholder="••••••••" error={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords don't match" : ""} />

          </div>
        );
      case "review":
        return (
          <div className="space-y-4">
            <div className="text-fg-60 text-sm">
              <p>Review your information and finish registration. You can edit email, phone, and bank details later in your profile.</p>
            </div>
            <div className="mb-4 flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 text-ac-01 focus:ring-ac-02 border-bd-50 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-fg-50">
                  I agree to the <Link to="/terms" className="font-medium text-ac-01 hover:text-ac-02" onClick={(e) => e.stopPropagation()}>Terms of Service</Link> and <Link to="/privacy" className="font-medium text-ac-01 hover:text-ac-02" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>
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
    return "We’ll guide you step by step. You can edit email, phone and bank later.";
  }, []);

  return (
    <div className="min-h-screen bg-bg-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-6 flex justify-center">
            <div className="w-full">
              <Stepper steps={steps} currentStep={visibleStepIndex} />
            </div>
          </div>
          <Card title={title} subtitle={subtitle}>
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {renderStep()}
            {renderFooterRow()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
