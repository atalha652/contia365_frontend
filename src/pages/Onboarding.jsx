import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const USER_TYPES = [
  {
    key: "freelancer",
    label: "Freelancer",
    sublabel: "Autónomo",
    description: "I work independently and manage my own taxes and invoices.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: "company",
    label: "Company",
    sublabel: "Empresa",
    description: "I represent a business with employees and corporate tax obligations.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    key: "advisor",
    label: "Advisor",
    sublabel: "Asesor",
    description: "I manage accounting and tax filings on behalf of multiple clients.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      // TODO: persist user type to backend
      // await saveUserType(selected);
      localStorage.setItem("user_type", selected);
      toast.success("Profile configured successfully!");
      navigate("/app/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
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

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {USER_TYPES.map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => setSelected(type.key)}
              className={`relative flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2 ${
                selected === type.key
                  ? "border-[#027570] bg-gradient-to-b from-[#027570] to-[#038a84] text-white shadow-xl scale-[1.02]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#027570] hover:shadow-md"
              }`}
            >
              {selected === type.key && (
                <div className="absolute top-3 right-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className={`mb-3 ${selected === type.key ? "text-white" : "text-[#027570]"}`}>
                {type.icon}
              </div>
              <span className="text-lg font-bold">{type.label}</span>
              <span className={`text-xs font-medium mb-2 ${selected === type.key ? "text-white/80" : "text-slate-400"}`}>
                {type.sublabel}
              </span>
              <p className={`text-xs leading-relaxed ${selected === type.key ? "text-white/90" : "text-slate-500"}`}>
                {type.description}
              </p>
            </button>
          ))}
        </div>

        {/* Continue button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selected || isLoading}
            className="px-10 py-3 bg-gradient-to-r from-[#027570] to-[#038a84] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#038a84] hover:to-[#027570] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#027570] focus:ring-offset-2"
          >
            {isLoading ? "Setting up..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
