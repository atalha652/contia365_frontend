import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./Modal";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";

const ImagePreviewModal = ({ open, onClose, files = [], initialIndex = 0 }) => {
  const [index, setIndex] = useState(initialIndex || 0);

  useEffect(() => {
    if (open) {
      setIndex(initialIndex || 0);
    }
  }, [open, initialIndex]);

  const hasFiles = Array.isArray(files) && files.length > 0;
  const current = hasFiles ? files[index] : null;

  const prev = () => {
    if (!hasFiles || files.length <= 1) return;
    setIndex((i) => (i > 0 ? i - 1 : files.length - 1));
  };
  const next = () => {
    if (!hasFiles || files.length <= 1) return;
    setIndex((i) => (i < files.length - 1 ? i + 1 : 0));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader
        title="Preview Files"
        action={
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        }
      />
      <ModalBody>
        <div className="flex flex-col gap-4">
          {hasFiles ? (
            <div className="flex items-center justify-center">
              <img
                src={current?.file_url || current?.url || ""}
                alt={current?.name || "Preview"}
                className="max-h-[60vh] rounded-xl object-contain border border-bd-50"
              />
            </div>
          ) : (
            <div className="text-sm text-fg-60">No files to preview.</div>
          )}

          {/* Thumbnails */}
          {hasFiles && (
            <div className="flex items-center gap-2 overflow-x-auto">
              {files.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`border ${i === index ? "border-ac-02" : "border-bd-50"} rounded-lg p-0.5`}
                  title={f?.name || `File ${i + 1}`}
                >
                  <img
                    src={f?.file_url || f?.url || ""}
                    alt={f?.name || `File ${i + 1}`}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={prev} disabled={!hasFiles || files.length <= 1}>
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </Button>
            <Button variant="secondary" onClick={next} disabled={!hasFiles || files.length <= 1}>
              <ChevronRight className="w-4 h-4" />
              <span>Next</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {current?.file_url && (
              <a
                href={current.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-ac-02 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open externally</span>
              </a>
            )}
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ImagePreviewModal;