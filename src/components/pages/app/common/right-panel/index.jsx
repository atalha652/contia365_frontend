// This component renders a generic right-side panel with overlay
// It can be reused to show different contextual details like rejection history
import React from "react";

const RightPanel = ({ open, onClose, title, children }) => {
  // Do not render anything if the panel is not open
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Overlay behind the panel */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right side sliding panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-bg-70 border-l border-bd-50 shadow-xl flex flex-col">
        {/* Panel header with title and close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bd-50">
          <h3 className="text-lg font-semibold text-fg-40">{title || "Details"}</h3>
          <button onClick={onClose} className="text-fg-60 hover:text-fg-40">Close</button>
        </div>

        {/* Panel content area */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;