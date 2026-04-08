// frontend/src/pages/SignUp.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updatePageTitle } from "../utils/titleUtils";
import { signUp } from "../api/apiFunction/authServices";

const SignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    company_name: "",
  });

  useEffect(() => { updatePageTitle("Sign Up"); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim()) { setError("Full name is required"); return false; }
    if (!formData.email || !emailRegex.test(formData.email)) { setError("Please enter a valid email address"); return false; }
    if (!formData.phone.trim()) { setError("Phone number is required"); return false; }
    if (!formData.password || formData.password.length < 6) { setError("Password must be at least 6 characters"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setIsLoading(true);
    try {
      const form = new FormData();
      form.append("name", formData.name.trim());
      form.append("email", formData.email.trim());
      form.append("phone", formData.phone.trim());
      form.append("password", formData.password);
      if (formData.company_name.trim()) {
        form.append("company_name", formData.company_name.trim());
      }
      // Required backend fields with sensible defaults
      form.append("type", "individual");
      form.append("role", "user");
      form.append("registration_flow", "personal_flow");
      form.append("status", "false");

      const response = await signUp(form);
      if (response.status === 201 || response.status === 200) {
        toast.success("Account created! Completing your profile...");
        navigate("/onboarding");
      } else {
        throw new Error(response.data?.detail || response.data?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      const message = err?.message || "An error occurred during registration.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:border-[#027570] text-sm transition-colors";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Create your account</h2>
          <p className="mt-2 text-sm text-slate-500">Get started with Contia 365</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          {/* Error banner */}
          {error && (
            <div className="mb-5 bg-red-50 border-l-4 border-red-400 p-4 rounded-xl flex items-center gap-3">
              <svg className="h-5 w-5 text-red-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label htmlFor="name" className={labelClass}>Full Name <span className="text-red-500">*</span></label>
              <input id="name" name="name" type="text" required autoComplete="name"
                className={inputClass} placeholder="John Smith"
                value={formData.name} onChange={handleChange} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>Email Address <span className="text-red-500">*</span></label>
              <input id="email" name="email" type="email" required autoComplete="email"
                className={inputClass} placeholder="you@example.com"
                value={formData.email} onChange={handleChange} />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
              <input id="phone" name="phone" type="tel" required autoComplete="tel"
                className={inputClass} placeholder="+34 600 000 000"
                value={formData.phone} onChange={handleChange} />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClass}>Password <span className="text-red-500">*</span></label>
              <input id="password" name="password" type="password" required autoComplete="new-password"
                className={inputClass} placeholder="Min. 6 characters"
                value={formData.password} onChange={handleChange} />
            </div>

            {/* Company Name (optional) */}
            <div>
              <label htmlFor="company_name" className={labelClass}>
                Company Name <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input id="company_name" name="company_name" type="text" autoComplete="organization"
                className={inputClass} placeholder="My Company SL"
                value={formData.company_name} onChange={handleChange} />
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#027570] to-[#038a84] hover:from-[#038a84] hover:to-[#027570] shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2 transition-all duration-200">
              {isLoading && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/sign-in" className="font-semibold text-[#027570] hover:text-[#038a84] transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
