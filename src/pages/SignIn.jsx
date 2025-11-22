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

  // form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // update page title
  useEffect(() => {
    updatePageTitle('Sign In');
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const response = await loginWithGoogle();
      console.log("Google Login Response:", response);

      // 🔹 If your API returns a redirect URL (like OAuth)
      if (response?.data?.url) {
        //   window.location.href = response.data.url; // redirect user to Google OAuth
      }

      // 🔹 If your API directly returns a token/session
      else if (response?.data?.token) {
        //   localStorage.setItem("token", response.data.token);
        // alert("Login successful!");
      }
    } catch (error) {
      console.error("Google login failed:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });

      if (response.status === 200) {
        // Store the complete response object in localStorage as "user"
        localStorage.setItem('user', JSON.stringify(response.data));

        toast.success("Login successful! Redirecting...");
        navigate("/app/dashboard");
      } else {
        // Extract the exact error message from the API response
        const errorMessage = response.data?.detail || response.data?.message || "Login failed. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.message || "An error occurred during login. Please try again.";

      // Show error in both the form and as a toast notification
      setError(errorMessage);
      toast.error(errorMessage, {});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-50">
      <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-fg-50">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-fg-60">
              Sign in to your account to continue
            </p>
          </div>

          <div className="mt-8 bg-bg-60 rounded-lg shadow-lg p-8 border border-bd-50">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
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
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-fg-50"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-bd-50 bg-bg-60 rounded-md shadow-sm placeholder-fg-70 text-fg-50 focus:outline-none focus:ring-ac-02 focus:border-ac-02 sm:text-sm"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-fg-50"
                  >
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-bd-50 bg-bg-60 rounded-md shadow-sm placeholder-fg-70 text-fg-50 focus:outline-none focus:ring-ac-02 focus:border-ac-02 sm:text-sm"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-ac-02 focus:ring-ac-02 border-bd-50 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-fg-60"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-ac-02 hover:text-ac-01"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-ac-01' : 'bg-ac-02 hover:bg-ac-01'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ac-02 disabled:opacity-70`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-bd-50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-bg-60 text-fg-60">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <button
                    type="button"
                    disabled={isGoogleLoading}
                    className={`w-full inline-flex justify-center py-2 px-4 border border-bd-50 rounded-md shadow-sm text-sm font-medium ${isGoogleLoading ? 'bg-bg-40 text-fg-70' : 'bg-bg-60 text-fg-60 hover:bg-bg-40'} disabled:opacity-70`}
                    onClick={handleGoogleLogin}
                  >
                    <span className="sr-only">Sign in with Google</span>
                    {isGoogleLoading ? (
                      <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.624,2.699-2.731,4.728-5.445,4.728c-3.073,0-5.565-2.492-5.565-5.565S9.472,7.576,12.545,7.576c1.404,0,2.683,0.523,3.658,1.381l2.474-2.474C17.052,4.702,14.945,3.667,12.545,3.667c-4.923,0-8.909,3.986-8.909,8.909s3.986,8.909,8.909,8.909c4.923,0,8.909-3.986,8.909-8.909c0-0.276-0.012-0.549-0.034-0.818H12.545z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-2 px-4 border border-bd-50 rounded-md shadow-sm bg-bg-60 text-sm font-medium text-fg-60 hover:bg-bg-40"
                  >
                    <span className="sr-only">Sign in with GitHub</span>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-fg-60">
                Don't have an account?{" "}
                <Link
                  to="/sign-up"
                  className="font-medium text-ac-02 hover:text-ac-01"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;