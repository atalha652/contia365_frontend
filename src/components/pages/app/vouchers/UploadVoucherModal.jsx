import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input } from "../../../ui";
import { uploadVouchers } from "../../../../api/apiFunction/voucherServices";
import { toast } from "react-toastify";

const UploadVoucherModal = ({ open, onClose, onUploaded }) => {
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  const reset = () => {
    setFiles([]);
    setError("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose && onClose();
  };

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

      const data = await uploadVouchers({ user_id, files });
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
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Close
          </Button>
        }
      />
      <ModalBody>
        <div className="space-y-4">
          <div>
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
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
        <Button variant="primary" onClick={handleUpload} disabled={isSubmitting || files.length === 0}>
          {isSubmitting ? "Uploading..." : "Upload"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UploadVoucherModal;