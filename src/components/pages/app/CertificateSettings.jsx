import React, { useState, useRef } from "react";
import { ShieldCheck, Upload, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import { uploadCertificate } from "../../../api/apiFunction/certificateServices";

const CertificateSettings = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [active, setActive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["p12", "pfx"].includes(ext)) {
      toast.error("Only .p12 or .pfx files are accepted");
      return;
    }
    setFile(f);
    setActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a certificate file"); return; }
    if (!password) { toast.error("Certificate password is required"); return; }
    setUploading(true);
    try {
      const res = await uploadCertificate({ file, password });
      if (res?.status === 200) {
        setActive(true);
        setPassword("");
        toast.success("Certificate uploaded and validated successfully");
      } else {
        const detail = res?.data?.detail;
        toast.error(
          typeof detail === "string" ? detail :
          detail?.[0]?.msg || "Upload failed — check your password and try again"
        );
      }
    } catch {
      toast.error("Upload failed. Please check your connection.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-fg-40 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-ac-02" />
            Digital Certificate
          </h1>
          <p className="text-sm text-fg-60 mt-1">
            Upload your .p12 certificate to enable AEAT VeriFactu invoice submission.
            Your password is validated once and never stored.
          </p>
        </div>

        {active && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-sm text-green-400 font-medium">Certificate Active</span>
            <span className="text-xs text-green-400/70 ml-1">— {file?.name}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-bg-50 border border-bd-50 rounded-2xl p-6 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors ${
              dragging ? "border-ac-02 bg-ac-02/5" : "border-bd-50 hover:border-ac-02/50 hover:bg-bg-40"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".p12,.pfx"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <Upload className="w-8 h-8 text-fg-60" strokeWidth={1.5} />
            {file ? (
              <div className="text-center">
                <p className="text-sm font-medium text-fg-40">{file.name}</p>
                <p className="text-xs text-fg-60 mt-0.5">{(file.size / 1024).toFixed(1)} KB — click to replace</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium text-fg-50">Drop your .p12 or .pfx file here</p>
                <p className="text-xs text-fg-60 mt-0.5">or click to browse</p>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-fg-60 mb-1.5">Certificate Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your .p12 password"
                className="w-full px-3 py-2.5 pr-10 text-sm bg-bg-40 border border-bd-50 rounded-lg text-fg-50 placeholder:text-fg-60 focus:outline-none focus:ring-2 focus:ring-ac-02"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-60 hover:text-fg-50"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-fg-60 mt-1">Used only to validate the certificate — never stored.</p>
          </div>

          <button
            type="submit"
            disabled={uploading || !file || !password}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-ac-02 hover:bg-ac-02/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading & Validating…</>
            ) : (
              <><ShieldCheck className="w-4 h-4" /> Upload Certificate</>
            )}
          </button>
        </form>

        <div className="mt-4 px-4 py-3 bg-bg-50 border border-bd-50 rounded-xl">
          <p className="text-xs text-fg-60 leading-relaxed">
            <span className="font-medium text-fg-50">Security note:</span> Your certificate bytes are encrypted with Fernet before storage in MongoDB.
            The password is validated in-memory to confirm the file is readable, then immediately discarded.
            You will be asked for the password again each time you submit an invoice to AEAT.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateSettings;
