"use client";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 12,
  borderWidth = 1.5,
  colorFrom = "#2563eb",
  colorTo = "#a855f7",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={{
        ["--size" as string]: `${size}px`,
        ["--duration" as string]: `${duration}s`,
        ["--delay" as string]: `-${delay}s`,
        ["--color-from" as string]: colorFrom,
        ["--color-to" as string]: colorTo,
        ["--border-width" as string]: `${borderWidth}px`,
      }}
    >
      <div 
        className="absolute inset-0 rounded-[inherit]"
        style={{
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "var(--border-width)",
        }}
      >
        <div 
          className="absolute animate-[border-beam_var(--duration)_linear_var(--delay)_infinite]"
          style={{
            width: "var(--size)",
            height: "var(--size)",
            background: `radial-gradient(var(--color-from) 40%, var(--color-to) 60%, transparent 80%)`,
            offsetPath: "rect(0 100% 100% 0 round 16px)",
            offsetDistance: "0%",
          }}
        />
      </div>
    </div>
  );
}
