import * as React from "react";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/purple-button";

export const CyanButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md bg-transparent text-sm font-medium text-white transition-all border border-white/20 hover:bg-white/5 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
          className
        )}
        {...props}
      >
        {props.children}
      </button>
    );
  }
);
CyanButton.displayName = "CyanButton";
