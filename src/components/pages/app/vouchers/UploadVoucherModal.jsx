// This component renders the upload voucher modal and handles file selection, previews, and submission
import React, { useEffect, useState } from "react";
// Use shared themed Select which is now fully custom-styled
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Select } from "../../../ui";
import { X } from "lucide-react";
import { uploadVouchers } from "../../../../api/apiFunction/voucherServices";
import { toast } from "react-toastify";

const UploadVoucherModal = ({ open, onClose, onUploaded }) => {
  // Keep local state for form fields and submission
  // Keep a list of selected files
  const [files, setFiles] = useState([]);
  // Store generated preview URLs for the selected files
  const [previews, setPreviews] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Default category set to Bill so the upload button stays enabled without extra click
  const [category, setCategory] = useState("Bill");
  // New field: transaction type (credit/debit)
  const [transactionType, setTransactionType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Update local files list when user selects files
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  // Generate and cleanup object URLs for file previews
  useEffect(() => {
    // Create preview URLs for images and PDFs
    const urls = files.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type,
      name: f.name,
    }));
    setPreviews(urls);
    
    // Cleanup: revoke all URLs when files change or component unmounts
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u.url));
    };
  }, [files]);

  // Remove a single file from the selection by index
  const removeFileAt = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset the modal's form state
  const reset = () => {
    setFiles([]);
    setPreviews([]);
    setTitle("");
    setDescription("");
    setCategory("Bill");
    setTransactionType("");
    setError("");
  };

  // Close the modal safely (disabled during submit)
  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose && onClose();
  };

  // Submit the form to upload vouchers with optional transaction_type
  const handleUpload = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const user_id = user?.user_id;
      if (!user_id) throw new Error("User not found. Please sign in again.");
      if (!files || files.length === 0) {
        setError("Please select at least one file to upload");
        setIsSubmitting(false);
        return;
      }
      const data = await uploadVouchers({
        user_id,
        files,
        title,
        description,
        category,
        transaction_type: transactionType || undefined,
      });
      toast.success("Voucher uploaded successfully");
      onUploaded && onUploaded(data);
      handleClose();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.detail || err.message || "Upload failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalHeader
        title="Upload Voucher"
        action={
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isSubmitting}>
            <X className="w-4 h-4" />
          </Button>
        }
      />
      <ModalBody>
        <div className="space-y-4">
          {/* Title input takes full width */}
          <div>
            <label className="block text-sm text-fg-60 mb-1">Title</label>
            <Input
              type="text"
              placeholder="e.g., Hotel Invoice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          {/* Category and Transaction Type in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {/* Category selection for the voucher */}
              <label className="block text-sm text-fg-60 mb-1">Category</label>
              {/* Use global Select which renders custom dropdown with accent hover and bd-50 borders */}
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {["Bill", "Invoice", "Receipt", "Expense", "Other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              {/* Transaction type selection (credit/debit) */}
              <label className="block text-sm text-fg-60 mb-1">Transaction Type</label>
              {/* Use global Select which renders custom dropdown with accent hover and bd-50 borders */}
              <Select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                <option value="">Select type</option>
                <option value="credit">credit</option>
                <option value="debit">debit</option>
              </Select>
            </div>
          </div>
          <div>
            {/* Optional description for added context */}
            <label className="block text-sm text-fg-60 mb-1">Description</label>
            <Input
              type="text"
              placeholder="Add a short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            {/* File picker for images and PDFs */}
            <label className="block text-sm text-fg-60 mb-1">Select files</label>
            <Input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            <p className="text-xs text-fg-60 mt-2">Accepted: JPG, PNG, PDF</p>
          </div>
          {/* Show a single-row, scrollable preview of selected files with a cross icon on hover */}
          {previews.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto py-2">
              {previews.map((p, idx) => {
                const isImage = (p.type || "").startsWith("image/");
                return (
                  <div
                    key={`${p.name}-${idx}`}
                    className="group relative w-24 h-24 rounded-xl border border-bd-50 bg-bg-60 flex items-center justify-center shrink-0"
                    title={p.name}
                  >
                    {isImage ? (
                      <img
                        src={p.url}
                        alt={p.name}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-xs text-fg-60">
                        <span className="font-medium">PDF</span>
                        <span className="mt-1 line-clamp-1 max-w-[5rem]">{p.name}</span>
                      </div>
                    )}
                    {/* Cross icon appears on hover to remove this file */}
                    <button
                      type="button"
                      onClick={() => removeFileAt(idx)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-50 border border-bd-50 rounded-md p-1"
                      aria-label="Remove file"
                    >
                      <X className="w-3.5 h-3.5 text-fg-60" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </ModalBody>
      <ModalFooter>
        {/* Form actions: cancel or upload */}
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
        <Button variant="primary" onClick={handleUpload} disabled={isSubmitting || files.length === 0 || !title || !category}>
          {isSubmitting ? "Uploading..." : "Upload"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UploadVoucherModal;