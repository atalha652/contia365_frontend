import { X } from "lucide-react";

const ImageModal = ({ isOpen, onClose, imageUrl, title }) => {
    if (!isOpen || !imageUrl) return null;

    const handleClose = (e) => {
        e?.stopPropagation();
        onClose(e);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80" onClick={handleClose}>
            <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                    <X size={20} />
                </button>
                <img
                    src={imageUrl}
                    alt={title || "Image"}
                    className="max-w-full max-h-full object-contain rounded"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
};

export default ImageModal;