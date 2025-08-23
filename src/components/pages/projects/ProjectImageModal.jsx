// frontend/src/components/pages/projects/ProjectImageModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const ProjectImageModal = ({ imageUrl, onClose, title = 'Preview' }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!imageUrl) return null;

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (e) => {
    e.currentTarget.alt = 'Unable to load image';
    setIsLoading(false);
  };

  return (
    <div className="inset-0 z-50 flex items-center justify-center" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 max-w-5xl w-[90vw] max-h-[90vh] bg-bg-60 border border-bd-50 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bd-50">
          <h3 className="text-sm font-semibold text-fg-50 truncate pr-2">{title}</h3>
          <button
            className="p-2 text-fg-60 hover:text-fg-50"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="w-full max-h-[76vh] overflow-auto flex items-center justify-center bg-bg-50 rounded-md">
            {isLoading && (
              <div className="p-8 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-fg-60" />
                <p className="mt-2 text-sm text-fg-60">Loading preview...</p>
              </div>
            )}
            <img
              src={imageUrl}
              alt="Project Package"
              className={`max-w-full max-h-[74vh] object-contain ${isLoading ? 'hidden' : 'block'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectImageModal;