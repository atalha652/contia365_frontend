import { forwardRef } from "react";
import { clsx } from "clsx";

const Avatar = forwardRef(
  ({ className, size = "default", children, ...props }, ref) => {
    const baseStyles =
      "flex items-center justify-center rounded-full bg-ac-01 dark:bg-ac-02 text-white dark:text-fg-40 font-medium";

    const sizes = {
      sm: "w-6 h-6 text-xs",
      default: "w-8 h-8 text-sm",
      lg: "w-10 h-10 text-base",
      xl: "w-12 h-12 text-lg",
    };

    return (
      <div
        className={clsx(baseStyles, sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
