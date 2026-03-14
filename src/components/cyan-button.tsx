import * as React from "react";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/purple-button";

export const CyanButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md bg-teal-600 text-sm font-medium text-white transition-all hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden shadow-[0_0_15px_rgba(4,128,146,0.4)] hover:shadow-[0_0_25px_rgba(4,128,146,0.6)]",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        {props.children}
      </button>
    );
  }
);
CyanButton.displayName = "CyanButton";
