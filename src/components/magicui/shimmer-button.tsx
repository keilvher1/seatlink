"use client";
import { cn } from "@/lib/utils";
import React from "react";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ShimmerButton({
  shimmerColor = "#ffffff",
  shimmerSize = "0.1em",
  shimmerDuration = "2s",
  borderRadius = "100px",
  background = "linear-gradient(110deg, #2563eb, #4f46e5, #2563eb)",
  className,
  children,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      style={{ "--shimmer-color": shimmerColor, "--radius": borderRadius, "--speed": shimmerDuration, "--bg": background, borderRadius } as React.CSSProperties}
      className={cn("group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 text-white font-bold [background:var(--bg)] transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px", className)}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius }}>
        <div className="absolute inset-[-100%] animate-[shimmer-slide_var(--speed)_ease-in-out_infinite]">
          <div className="absolute inset-0 [background:linear-gradient(transparent,transparent,var(--shimmer-color),transparent,transparent)] rotate-[30deg]" style={{ width: shimmerSize, margin: "0 auto" }} />
        </div>
      </div>
      <div className="absolute inset-[1px] rounded-[inherit] [background:var(--bg)]" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-30 [background:radial-gradient(circle_at_50%_50%,var(--shimmer-color),transparent_70%)]" />
    </button>
  );
}
