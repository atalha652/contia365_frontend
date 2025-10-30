import { forwardRef } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(
  ({ className, size = "default", children, ...props }, ref) => {
    const baseStyles =
      "appearance-none bg-bg-50 border border-bd-50 text-fg-40 transition-colors focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent cursor-pointer hover:bg-bg-40 disabled:cursor-not-allowed disabled:opacity-50";

    const sizes = {
      sm: "h-8 px-3 pr-8 py-1 text-xs rounded-lg",
      default: "h-9 px-3 pr-8 py-2 text-sm rounded-xl",
      lg: "h-10 px-4 pr-10 py-2 text-base rounded-xl",
    };

    return (
      <div className="relative">
        <select
          className={clsx(baseStyles, sizes[size], className)}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={clsx(
            "absolute top-1/2 transform -translate-y-1/2 text-fg-60 pointer-events-none",
            size === "lg" ? "right-3 w-5 h-5" : "right-2 w-4 h-4"
          )}
          strokeWidth={1.5}
        />
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
