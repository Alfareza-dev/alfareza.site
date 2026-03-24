import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const PurpleButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-zinc-200 text-sm font-bold text-[#1c2438] transition-all hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {props.children}
      </button>
    );
  }
);
PurpleButton.displayName = "PurpleButton";
