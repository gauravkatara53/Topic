"use client";

import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/types/placement";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] ?? {
    bg: "bg-slate-100 dark:bg-slate-700",
    text: "text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
        colors.bg,
        colors.text,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span className={cn("rounded-full shrink-0", colors.dot, size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2")} />
      {status}
    </span>
  );
}
