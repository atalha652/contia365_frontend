// frontend/src/components/ui/Cta.jsx
import React from "react";

const Cta = ({ children, onClick, type = "button", disabled = false }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${disabled ? "bg-ac-01/70" : "bg-ac-02 hover:bg-ac-01"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ac-02 disabled:opacity-70`}
        >
            {children}
        </button>
    );
};

export default Cta;


