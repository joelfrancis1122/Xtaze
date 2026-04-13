import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "../../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-white-900 text-white hover:bg-gray-600",
        outline: "border border-gray-300 text-gray-900 hover:  bg-gray-800",
        ghost: "text-white-800 hover:bg-gray-900",
        destructive: " border border-gray-300 text-gray hover:  bg-gray-800",
      },
      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  }
);

Button.displayName = "Button";
export { Button, buttonVariants };
