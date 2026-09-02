import { forwardRef } from "react";
import { clsx } from "clsx";

const Button = forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "default",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ac-02 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shrink-0";

    const variants = {
      primary: "bg-[#582dee] text-white hover:bg-[#4622c7] shadow-sm font-semibold",
      secondary: "bg-bg-50 text-fg-40 border border-bd-50 hover:bg-bg-40",
      ghost: "text-fg-60 hover:text-fg-40 hover:bg-bg-60",
      outline: "border border-bd-50 bg-transparent text-fg-40 hover:bg-bg-50",
      danger: "bg-white text-red-700 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm font-semibold",
      success: "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 shadow-sm font-semibold",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg",
      default: "h-9 px-3 py-2 text-sm rounded-xl",
      lg: "h-10 px-4 py-2 text-base rounded-xl",
      icon: "h-9 w-9 rounded-xl",
    };

    return (
      <button
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
