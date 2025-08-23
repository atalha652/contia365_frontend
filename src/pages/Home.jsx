// frontend/src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { ArrowRight, User, Building2, GraduationCap, FileText, Cpu, FileCheck, UploadCloud } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-teal-600 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold">CONTIA365</div>
        <button onClick={() => navigate('/sign-in')} className="text-white hover:bg-teal-700 flex items-center gap-2 px-4 py-2 rounded-md transition-colors">
          Start Now
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Accounting with Just a Photo—
              <span className="block">100% Automated</span>
            </h1>
            <p className="text-xl mb-8 text-teal-100">
              Let AI handle your invoices, receipts, expenses, and bookkeeping. Automated, Legal, System, PCC Ready
            </p>
            <button onClick={() => navigate('/sign-in')} className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 text-lg rounded-md transition-colors">
              Start Now
            </button>
          </div>

          {/* Receipt Mockups */}
          <div className="relative">
            <div className="absolute top-0 right-0 w-64 bg-white text-black shadow-xl transform rotate-3 rounded-lg">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <h3 className="font-semibold mb-3">Receipt</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Product</span>
                    <span className="text-teal-600">GROCERIES</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount</span>
                    <span>$24.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$2.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-64 bg-white text-black shadow-xl transform -rotate-2 mt-8 rounded-lg">
              <div className="p-4">
                <h3 className="font-semibold mb-3">Accounting Entry</h3>
                <div className="flex gap-2">
                  <button className="text-xs bg-transparent border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 transition-colors">
                    Active
                  </button>
                  <button className="text-xs bg-transparent border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 transition-colors">
                    Archive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-12 mt-16 text-teal-200">
          <span>CERTIFIED SOCIAL</span>
          <span>TRUSTED</span>
          <span>SECURE</span>
        </div>
      </section>

      {/* Choose How to Get Started */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center">Choose how to get started</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white text-black rounded-xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-8">Self Employed</h3>
              <div className="flex gap-4 justify-center">
                <button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg transition-colors font-medium">
                  Learn More
                </button>
                <button className="border-2 border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-lg transition-colors font-medium">
                  Get Started
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white text-black rounded-xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-8">Company</h3>
              <div className="flex gap-4 justify-center">
                <button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg transition-colors font-medium">
                  Learn More
                </button>
                <button className="border-2 border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-lg transition-colors font-medium">
                  Get Started
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white text-black rounded-xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-6">I Want to Learn</h3>
              <p className="text-gray-600 mb-6">We can help guide you through the process</p>
              <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg transition-colors font-medium w-full">
                Get Free Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center">How it Works</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Upload Your Receipt</h3>
            <p className="text-teal-100">Simply take a photo or upload your receipt to get started</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cpu className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">AI Processing</h3>
            <p className="text-teal-100">Our AI extracts and categorizes all the important information automatically</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-6">
              <FileCheck className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Ready for Accounting</h3>
            <p className="text-teal-100">Your data is processed and ready for your accounting system</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center">Features</h2>
        <div className="bg-white text-black rounded-xl shadow-xl p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <h3 className="text-3xl font-bold">Try It Now</h3>
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium">Upload Your Receipt</span>
                <UploadCloud className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            <button className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-lg transition-colors font-medium text-lg">
              Get Your First CONTIA365 Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
