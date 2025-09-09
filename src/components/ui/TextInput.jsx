// frontend/src/components/ui/TextInput.jsx
import React from "react";

const TextInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  helpText = "",
  error = "",
  autoComplete,
  endAdornment, // ✅ new prop
}) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-fg-50"
        >
          {label}
        </label>
      )}

      <div className="mt-1 relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`appearance-none block w-full px-3 py-2 border ${
            error ? "border-red-400" : "border-bd-50"
          } bg-bg-60 rounded-md shadow-sm placeholder-fg-70 text-fg-50 focus:outline-none focus:ring-ac-02 focus:border-ac-02 sm:text-sm ${
            endAdornment ? "pr-10" : "" // ✅ padding if icon exists
          }`}
        />

        {endAdornment && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            {endAdornment}
          </div>
        )}
      </div>

      {helpText && !error && (
        <p className="mt-1 text-xs text-fg-60">{helpText}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default TextInput;
