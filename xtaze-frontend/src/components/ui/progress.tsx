import * as React from "react";
import { cn } from "../../../lib/utils";
import { motion } from "framer-motion";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-800",
          className
        )}
        {...props}
      >
        <motion.div
          className="absolute left-0 h-full bg-cyan-600 dark:bg-neutral-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
