"use client";
import { cn } from "@/lib/utils";

interface AnimatedShinyTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerWidth?: number;
}

export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
}: AnimatedShinyTextProps) {
  return (
    <span
      style={{ "--shimmer-width": `${shimmerWidth}px` } as React.CSSProperties}
      className={cn(
        "inline-block animate-[shiny-text_4s_linear_infinite] bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] bg-gradient-to-r from-transparent via-blue-600/80 via-50% to-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}
