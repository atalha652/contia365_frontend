// frontend/src/components/ui/SelectInput.jsx
import React from "react";

const SelectInput = ({
    id,
    label,
    value,
    onChange,
    required = false,
    children,
    error = "",
}) => {
    return (
        <div>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-fg-50">
                    {label}
                </label>
            )}
            <div className="mt-1">
                <select
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={`appearance-none block w-full px-3 py-2 border ${error ? "border-red-400" : "border-bd-50"
                        } bg-bg-60 rounded-md shadow-sm text-fg-50 focus:outline-none focus:ring-ac-02 focus:border-ac-02 sm:text-sm`}
                >
                    {children}
                </select>
            </div>
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
};

export default SelectInput;


