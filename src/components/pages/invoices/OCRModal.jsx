import { X, Copy } from "lucide-react";
import { useState } from "react";

const OCRModal = ({ isOpen, onClose, ocrText, pdfUrl, loading }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(ocrText || "");
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            console.error("Failed to copy text:", e);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-bg-60 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-bd-50">
                    <h2 className="text-lg font-medium text-fg-50">OCR Result</h2>
                    <button
                        onClick={onClose}
                        className="text-fg-60 hover:text-fg-50 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <p className="text-sm text-fg-60">Processing OCR, please wait…</p>
                    ) : pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            title="OCR PDF"
                            className="w-full h-[70vh] border rounded-md"
                        />
                    ) : (
                        <pre className="whitespace-pre-wrap text-sm text-fg-50 bg-bg-40 p-3 rounded-md border border-bd-50">
                            {ocrText || "No text extracted"}
                        </pre>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-4 py-3 border-t border-bd-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-fg-60 hover:text-fg-50 transition-colors"
                    >
                        Close
                    </button>
                    {!loading && ocrText && !pdfUrl && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 bg-ac-02 hover:bg-ac-01 text-white rounded-md font-medium transition-colors"
                        >
                            <Copy size={16} />
                            {copied ? "Copied!" : "Copy Text"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OCRModal;
