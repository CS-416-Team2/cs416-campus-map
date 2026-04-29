import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-semibold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-on-secondary",
        secondary:
          "bg-secondary-container text-on-secondary-container",
        outline: "border border-outline-variant text-on-surface",
        orange: "bg-[#f59e0b] text-white",
        green: "bg-[#10b981] text-white",
        blue: "bg-[#3b82f6] text-white",
        error: "bg-error-container text-on-error-container",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
