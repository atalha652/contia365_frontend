import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Select } from "../../../ui";
import { X } from "lucide-react";
import { uploadVouchers } from "../../../../api/apiFunction/voucherServices";
import { toast } from "react-toastify";

const UploadVoucherModal = ({ open, onClose, onUploaded }) => {
  // Keep local state for form fields and submission
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  // New field: transaction type (credit/debit)
  const [transactionType, setTransactionType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Update local files list when user selects files
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  // Reset the modal's form state
  const reset = () => {
    setFiles([]);
    setTitle("");
    setDescription("");
    setCategory("");
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
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {["Bill", "Invoice", "Receipt", "Expense", "Other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              {/* Transaction type selection (credit/debit) */}
              <label className="block text-sm text-fg-60 mb-1">Transaction Type</label>
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
          {files.length > 0 && (
            <div className="bg-bg-60 rounded-lg border border-bd-50 p-3">
              {/* Preview of selected file names */}
              <div className="text-sm font-medium text-fg-50 mb-2">Selected Files</div>
              <ul className="text-sm text-fg-60 list-disc pl-5 space-y-1">
                {files.map((f, idx) => (
                  <li key={`${f.name}-${idx}`}>{f.name}</li>
                ))}
              </ul>
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