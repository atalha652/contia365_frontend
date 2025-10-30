import React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "../../utils/utils";

/**
 * Switch component for toggling between on/off states
 * Built with Radix UI primitives for accessibility
 * Uses custom CSS variables for theming
 */
const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      // Using your CSS variables
      "data-[state=checked]:bg-[var(--ac-02)] data-[state=unchecked]:bg-[var(--bg-40)]",
      // Focus ring using your variables
      "focus-visible:ring-[var(--ac-01)] focus-visible:ring-offset-[var(--bg-60)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        // Using your CSS variables for the thumb background
        "bg-[var(--bg-60)]"
      )}
    />
  </SwitchPrimitives.Root>
));

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };