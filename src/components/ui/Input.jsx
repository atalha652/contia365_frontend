import { forwardRef } from "react";
import { clsx } from "clsx";

const Input = forwardRef(
  ({ className, type = "text", size = "default", ...props }, ref) => {
    const baseStyles =
      "flex w-full border border-bd-50 bg-bg-50 text-fg-40 placeholder-fg-60 transition-colors focus:outline-none focus:ring-2 focus:ring-ac-02 focus:border-transparent hover:bg-bg-40 disabled:cursor-not-allowed disabled:opacity-50";

    const sizes = {
      sm: "h-8 px-3 py-1 text-xs rounded-lg",
      default: "h-9 px-3 py-1 text-sm rounded-xl",
      lg: "h-10 px-4 py-2 text-base rounded-xl",
    };

    return (
      <input
        type={type}
        className={clsx(baseStyles, sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
