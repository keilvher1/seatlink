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
      <div className="absolute inset-[var(--border-width)] rounded-[inherit] [mask-composite:exclude] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]">
        <div className="absolute -inset-[var(--border-width)] animate-[border-beam_var(--duration)_linear_var(--delay)_infinite] [background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] [width:var(--size)] [offset-path:rect(0_auto_auto_0_round_calc(var(--size)))]" />
      </div>
    </div>
  );
}
