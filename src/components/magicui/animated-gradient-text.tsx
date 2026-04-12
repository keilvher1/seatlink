"use client";

import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function AnimatedGradientText({
  children,
  className,
  ...props
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "inline animate-gradient bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#2563eb] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
        className
      )}
      style={{ "--bg-size": "300%" } as React.CSSProperties}
      {...props}
    >
      {children}
    </span>
  );
}
