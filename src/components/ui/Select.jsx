// This Select is a fully custom, themed dropdown with hover accent color and rounded borders
import React, { useEffect, useRef, useState, forwardRef } from "react";
import { clsx } from "clsx";
import { ChevronDown, Check } from "lucide-react";

// Helper: convert native <option> children to options array
const parseOptionsFromChildren = (children) => {
  const opts = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === "option") {
      const value = child.props.value ?? String(child.props.children ?? "");
      const label = String(child.props.children ?? value);
      opts.push({ value, label });
    }
  });
  return opts;
};

const Select = forwardRef(
  (
    {
      className,
      size = "default",
      children,
      value,
      onChange,
      options,
      placeholder = "Select...",
      disabled = false,
      ...props
    },
    ref
  ) => {
    // Create options list either from children or provided options prop
    const normalizedOptions = Array.isArray(options) && options.length > 0
      ? options
      : parseOptionsFromChildren(children);

    // Dropdown open state
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
      const handler = (e) => {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    const sizes = {
      sm: "h-8 px-3 py-1 text-xs",
      default: "h-9 px-3 py-2 text-sm",
      lg: "h-10 px-4 py-2 text-base",
    };

    // Find selected label
    const selected = normalizedOptions.find((o) => o.value === value);

    return (
      <div ref={containerRef} className={clsx("relative w-full inline-block", className)}>
        {/* Trigger button */}
        <button
          type="button"
          ref={ref}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={clsx(
            "w-full inline-flex items-center justify-between border bg-bg-50 text-fg-40",
            "border-bd-50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-ac-02",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-bd-50 hover:bg-bg-40",
            sizes[size]
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          {...props}
        >
          <span className={clsx("truncate", selected ? "text-fg-40" : "text-fg-60")}>{selected?.label || placeholder}</span>
          <ChevronDown className="w-4 h-4 text-fg-60" strokeWidth={1.5} />
        </button>

        {/* Menu */}
        {open && (
          <div
            role="listbox"
            className={clsx(
              "absolute z-50 mt-1 w-full max-h-56 overflow-auto",
              "bg-bg-50 border border-bd-50 rounded-xl shadow-lg"
            )}
          >
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange?.({ target: { value: opt.value } });
                    setOpen(false);
                  }}
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 text-left",
                    "transition-colors text-fg-40",
                    isSelected ? "bg-bg-50" : "",
                    "hover:bg-ac-01 hover:text-white"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-ac-02" strokeWidth={1.5} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
