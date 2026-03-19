// frontend/src/pages/SignIn.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { updatePageTitle } from "../utils/titleUtils";
import { login, loginWithGoogle } from "../api/apiFunction/authServices";
import { toast } from "react-toastify";

const SignIn = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => { updatePageTitle("Sign In"); }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const response = await loginWithGoogle();
      if (response?.data?.url) window.location.href = response.data.url;
    } catch (err) {
      console.error("Google login failed:", err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) { setError("Email and password are required"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { setError("Please enter a valid email address"); return; }
    setIsLoading(true);
    try {
      const response = await login({ email: formData.email, password: formData.password });
      if (response.status === 200) {
        localStorage.setItem("user", JSON.stringify(response.data));
        toast.success("Login successful! Redirecting...");
        const { user_type, census_data_uploaded } = response.data;
        if (user_type && census_data_uploaded) { navigate("/app/dashboard"); } else { navigate("/onboarding"); }
      } else {
        throw new Error(response.data?.detail || response.data?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      const msg = err.message || "An error occurred during login. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#027570] to-[#038a84] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Welcome to Contia 365</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to your account to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          {error && (
            <div className="mb-5 bg-red-50 border-l-4 border-red-400 p-4 rounded-xl flex items-center gap-3">
              <svg className="h-5 w-5 text-red-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input id="email" name="email" type="email" required
                className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:border-[#027570] text-sm transition-colors"
                placeholder="you@example.com" value={formData.email} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input id="password" name="password" type="password" required
                className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:border-[#027570] text-sm transition-colors"
                placeholder="••••••••" value={formData.password} onChange={handleChange} />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#027570] focus:ring-[#027570]" />
                <span className="text-sm text-slate-500">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-[#027570] hover:text-[#038a84] transition-colors">Forgot password?</a>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#027570] to-[#038a84] hover:from-[#038a84] hover:to-[#027570] shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2 transition-all duration-200">
              {isLoading && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled={isGoogleLoading} onClick={handleGoogleLogin}
              className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-600 hover:border-[#027570] hover:text-[#027570] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {isGoogleLoading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545 12.151c0 1.054.855 1.909 1.909 1.909h3.536c-.624 2.699-2.731 4.728-5.445 4.728-3.073 0-5.565-2.492-5.565-5.565s2.492-5.565 5.565-5.565c1.404 0 2.683.523 3.658 1.381l2.474-2.474C17.052 4.702 14.945 3.667 12.545 3.667c-4.923 0-8.909 3.986-8.909 8.909s3.986 8.909 8.909 8.909c4.923 0 8.909-3.986 8.909-8.909 0-.276-.012-.549-.034-.818H12.545z" />
                </svg>
              )}
              Google
            </button>

            <button type="button"
              className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-600 hover:border-[#027570] hover:text-[#027570] transition-all duration-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link to="/sign-up" className="font-semibold text-[#027570] hover:text-[#038a84] transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
