// frontend/src/pages/SignUp.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { updatePageTitle } from "../utils/titleUtils";
import { signUp, getOrgTypes } from "../api/apiFunction/authServices";
import { toast } from "react-toastify";

const SignUp = () => {
  const navigate = useNavigate();
  const [isOrgRegister, setIsOrgRegister] = useState(false);
  const [orgTypes, setOrgTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");

  // defining payload
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    type: "organization",
    organization_info: {
      org_name: "",
      type_id: "",
      type_name: "",
      website: "",
    },
  });

  // fetching org types & update page title
  useEffect(() => {
    updatePageTitle("Sign Up");
    fetchOrgTypes();
  }, []);

  // fetching org types
  const fetchOrgTypes = async () => {
    try {
      const types = await getOrgTypes();
      setOrgTypes(types);
    } catch (err) {
      console.error("Failed to fetch organization types:", err);
      setError("Failed to load organization types. Please try again later.");
    }
  };

  // handle change & update form data
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("org_")) {
      // Handle organization info fields
      const orgField = name.replace("org_", "");
      setFormData((prev) => ({
        ...prev,
        organization_info: {
          ...prev.organization_info,
          [orgField]: value,
        },
      }));
    } else {
      // Handle regular fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError("");
  };

  // handle org type change & update form data
  const handleOrgTypeChange = (e) => {
    const selectedType = orgTypes.find((type) => type.id === e.target.value);
    setFormData((prev) => ({
      ...prev,
      organization_info: {
        ...prev.organization_info,
        type_id: selectedType.id,
        type_name: selectedType.name,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!termsAccepted) {
      setError("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error("Name, email, and password are required");
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Password validation
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Prepare base user data common to both types
      const baseUserData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        type: isOrgRegister ? "organization" : "individual",
      };

      let apiData;

      if (isOrgRegister) {
        // Organization registration data
        if (
          !formData.organization_info.org_name ||
          !formData.organization_info.type_id
        ) {
          throw new Error("Organization name and type are required");
        }

        // Prepare organization registration data
        apiData = {
          ...baseUserData,
          organization_info: {
            org_name: formData.organization_info.org_name,
            type_id: formData.organization_info.type_id,
            type_name: formData.organization_info.type_name,
            website: formData.organization_info.website || null,
          },
        };
      } else {
        // Individual registration data
        apiData = { ...baseUserData };
        // Add any individual-specific fields here if needed in the future
        // Example:
        // apiData.some_individual_field = someValue;
      }

      // Call the signup API with the prepared data
      const response = await signUp(apiData);

      if (response.status === 201 || response.status === 200) {
        toast.success("Registration successful! Please login to continue.", {});
        navigate("/sign-in");
      } else {
        throw new Error(
          response.data?.message || "Registration failed. Please try again."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.message ||
          "An error occurred during registration. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrgRegistration = () => {
    setIsOrgRegister(!isOrgRegister);
    setFormData((prev) => ({
      ...prev,
      type: !isOrgRegister ? "organization" : "individual",
      organization_info: {
        ...prev.organization_info,
        org_name: "",
        type_id: "",
        type_name: "",
        website: "",
      },
    }));
  };

  return (
    <div className="min-h-screen bg-bg-50">
      <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-fg-50">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-fg-60">Join us to get started</p>
          </div>

          <div className="mt-8 bg-bg-60 rounded-2xl shadow-lg p-8 border border-bd-50">
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

            <div className="flex justify-left mb-6">
              <button
                type="button"
                onClick={toggleOrgRegistration}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !isOrgRegister
                    ? "bg-bg-40 text-white"
                    : "bg-bg-60 text-fg-50 hover:bg-bd-50"
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={toggleOrgRegistration}
                className={`ml-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isOrgRegister
                    ? "bg-bg-40 text-white"
                    : "bg-bg-60 text-fg-50 hover:bg-bd-50"
                }`}
              >
                Organization
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-fg-50"
                  >
                    {isOrgRegister ? "Owner Name" : "Name"}
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-bd-50 bg-bg-60 rounded-md shadow-sm placeholder-fg-70 text-fg-50 focus:outline-none focus:ring-ac-02 focus:border-ac-02 sm:text-sm"
                      placeholder={isOrgRegister ? "John Doe" : "Name"}
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {isOrgRegister && (
                  <>
                    <div>
                      <label
                        htmlFor="org_name"
                        className="block text-sm font-medium text-fg-50"
                      >
                        Organization Name *
                      </label>
                      <div className="mt-1">
                        <input
                          id="org_name"
                          name="org_org_name"
                          type="text"
                          required
                          className="appearance-none block w-full px-3 py-2 border border-bd-50 bg-bg-60 rounded-md shadow-sm placeholder-fg-70 text-fg-50 focus:outline-none focus:ring-ac-02 focus:border-ac-02 sm:text-sm"
                          placeholder="Acme Inc."
                          value={formData.organization_info.org_name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="org_type"
                        className="block text-sm font-medium text-fg-50"
                      >
                        Organization Type *
                      </label>
                      <div className="mt-1">
                        <select
                          id="org_type"
                          name="org_type"
                          required
                          className="appearance-none block w-full px-3 py-2 border border-bd-50 bg-bg-60 rounded-md shadow-sm placeholder-fg-70 text-fg-50 focus:outline-none focus:ring-ac-02 focus:border-ac-02 sm:text-sm"
                          value={formData.organization_info.type_id}
                          onChange={handleOrgTypeChange}
                        >
                          <option value="">Select organization type</option>
                          {orgTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="org_website"
                        className="block text-sm font-medium text-fg-50"
                      >
                        Website
                      </label>
                      <div className="mt-1">
                        <input
                          id="org_website"
                          name="org_website"
                          type="url"
                          className="appearance-none block w-full px-3 py-2 border border-bd-50 bg-bg-60 rounded-md shadow-sm placeholder-fg-70 text-fg-50 focus:outline-none focus:ring-ac-02 focus:border-ac-02 sm:text-sm"
                          placeholder="https://your-org.com"
                          value={formData.organization_info.website}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-fg-50"
                  >
                    Email
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
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-fg-50"
                    >
                      Password
                    </label>
                    {formData.password && formData.password.length < 6 && (
                      <span className="text-xs text-amber-400">
                        At least 6 characters
                      </span>
                    )}
                  </div>
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
                {isOrgRegister && (
                  <div>
                    <div className="flex justify-between items-center">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-fg-50"
                      >
                        Confirm Password
                      </label>
                      {formData.confirmPassword &&
                        formData.password !== formData.confirmPassword && (
                          <span className="text-xs text-red-400">
                            Passwords don't match
                          </span>
                        )}
                    </div>
                    <div className="mt-1">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required={isOrgRegister}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          formData.confirmPassword &&
                          formData.password !== formData.confirmPassword
                            ? "border-red-400"
                            : "border-bd-50"
                        } bg-bg-60 rounded-md shadow-sm placeholder-fg-70 text-fg-50 focus:outline-none focus:ring-ac-02 focus:border-ac-02 sm:text-sm`}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-4 flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 text-ac-01 focus:ring-ac-02 border-bd-50 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-fg-50">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="font-medium text-ac-01 hover:text-ac-02"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="font-medium text-ac-01 hover:text-ac-02"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ac-02 hover:bg-ac-01 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ac-02"
                >
                  Create account
                </button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-fg-60">
                Already have an account?{" "}
                <Link
                  to="/sign-in"
                  className="font-medium text-ac-02 hover:text-ac-01"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
