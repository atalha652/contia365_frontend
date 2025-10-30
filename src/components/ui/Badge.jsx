import { forwardRef } from "react";
import { clsx } from "clsx";

const Badge = forwardRef(
  (
    { className, variant = "default", size = "default", children, ...props },
    ref
  ) => {
    const baseStyles = "inline-flex items-center font-medium transition-colors";

    const variants = {
      default: "bg-bg-30 dark:bg-bg-40 text-fg-60 dark:text-fg-50",
      success:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      warning:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      secondary:
        "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs rounded-lg",
      default: "px-2.5 py-0.5 text-xs rounded-lg",
      lg: "px-3 py-1 text-sm rounded-lg",
    };

    return (
      <span
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
