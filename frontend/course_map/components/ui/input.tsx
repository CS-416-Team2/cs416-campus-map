import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative flex items-center">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            {icon}
          </span>
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border border-outline-variant bg-surface pl-12 pr-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors",
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
      );
    }
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
