import { X, Download, Eye, FileText } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import ImageModal from "./ImageModal";

const OCRResultsModal = ({ isOpen, onClose, project, ocrData }) => {
    const [activeTab, setActiveTab] = useState('results');
    const [imageModal, setImageModal] = useState({ isOpen: false, url: '', title: '' });

    if (!isOpen || !project) return null;

    const ocrResults = ocrData?.results || [];
    console.log("ocrResults", ocrResults)
    const hasResults = ocrResults.length > 0;

    const handleDownload = (url, filename) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white dark:bg-bg-60 rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-bd-50">
                    <h2 className="text-xl font-semibold text-fg-50">OCR Results - {project.title}</h2>
                    <button
                        onClick={onClose}
                        className="text-fg-60 hover:text-fg-50 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-bd-50">
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'results'
                                ? 'text-ac-02 border-b-2 border-ac-02'
                                : 'text-fg-60 hover:text-fg-50'
                        }`}
                    >
                        OCR Results ({ocrResults.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('changes')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'changes'
                                ? 'text-ac-02 border-b-2 border-ac-02'
                                : 'text-fg-60 hover:text-fg-50'
                        }`}
                    >
                        Change History
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'results' && (
                        <div className="space-y-6">
                            {!hasResults ? (
                                <div className="text-center py-12">
                                    <FileText size={48} className="text-fg-60 mx-auto mb-4" />
                                    <p className="text-fg-60">No OCR results available</p>
                                </div>
                            ) : (
                                <div className="bg-bg-50 rounded-lg border border-bd-50 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-bg-40 border-b border-bd-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">
                                                        OCR ID
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">
                                                        Image
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">
                                                        PDF
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-fg-60 uppercase tracking-wider">
                                                        Extracted Text
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-bd-50">
                                                {ocrResults.map((result, index) => (
                                                    <tr key={index} className="hover:bg-bg-40 transition-colors">
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm font-mono text-fg-50">
                                                                {result.ocr_id}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {ocrData?.file_urls?.[index] ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setImageModal({ isOpen: true, url: ocrData.file_urls[index], title: `OCR Image - ${result.ocr_id}` });
                                                                    }}
                                                                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                                    title="View Image"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                            ) : (
                                                                <span className="text-sm text-fg-60">No image</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {result.result_url ? (
                                                                <button
                                                                    onClick={() => handleDownload(result.result_url, `ocr-result-${result.ocr_id}.pdf`)}
                                                                    className="p-1 text-ac-02 hover:text-ac-01 transition-colors"
                                                                    title="Download PDF"
                                                                >
                                                                    <Download size={16} />
                                                                </button>
                                                            ) : (
                                                                <span className="text-sm text-fg-60">No PDF</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {result.ocr_text ? (
                                                                <div className="max-w-md">
                                                                    <div className="text-sm text-fg-50 line-clamp-3">
                                                                        {result.ocr_text.substring(0, 100)}
                                                                        {result.ocr_text.length > 100 && '...'}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-fg-60">No text</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'changes' && (
                        <div className="space-y-4">
                            <div className="bg-bg-50 rounded-lg border border-bd-50 p-6">
                                <h3 className="text-lg font-medium text-fg-50 mb-4">Project Status Changes</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b border-bd-50">
                                        <span className="text-sm text-fg-60">Created</span>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Pending
                                            </span>
                                            <span className="text-sm text-fg-60">
                                                {new Date(project.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    {project.last_processed_at && (
                                        <div className="flex items-center justify-between py-2 border-b border-bd-50">
                                            <span className="text-sm text-fg-60">Last Processed</span>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    In Progress
                                                </span>
                                                <span className="text-sm text-fg-60">
                                                    {new Date(project.last_processed_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {project.status === 'done' && (
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-sm text-fg-60">Completed</span>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Done
                                                </span>
                                                <span className="text-sm text-fg-60">
                                                    {new Date().toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-bg-50 rounded-lg border border-bd-50 p-6">
                                <h3 className="text-lg font-medium text-fg-50 mb-4">Processing Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-fg-60">Total Images:</label>
                                        <p className="text-2xl font-bold text-fg-50">{project.total_images || 0}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-fg-60">Processed Count:</label>
                                        <p className="text-2xl font-bold text-fg-50">{project.processed_count || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-bd-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-fg-60 hover:text-fg-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
            
            {/* Image Modal - Rendered at document body level */}
            {imageModal.isOpen && createPortal(
                <ImageModal
                    isOpen={imageModal.isOpen}
                    onClose={(e) => {
                        e?.stopPropagation();
                        setImageModal({ isOpen: false, url: '', title: '' });
                    }}
                    imageUrl={imageModal.url}
                    title={imageModal.title}
                />,
                document.body
            )}
        </div>
    );
};

export default OCRResultsModal;