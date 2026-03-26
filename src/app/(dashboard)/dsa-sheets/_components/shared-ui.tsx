"use client";

import { cn } from "@/lib/utils";

export const DIFFICULTY_COLOR: Record<string, string> = {
  Basic: "text-slate-400",
  Easy: "text-emerald-500",
  Medium: "text-orange-400",
  Hard: "text-rose-500",
};

export const HIGHLIGHT_THEMES: Record<string, string> = {
  default: "",
  yellow: "bg-yellow-100/80 border-yellow-200 dark:bg-yellow-900/40 dark:border-yellow-800",
  blue: "bg-blue-100/80 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800",
  rose: "bg-rose-100/80 border-rose-200 dark:bg-rose-900/40 dark:border-rose-800",
  emerald: "bg-emerald-100/80 border-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-800",
  purple: "bg-purple-100/80 border-purple-200 dark:bg-purple-900/40 dark:border-purple-800",
};

export const THEME_OPTIONS = [
  { id: "default", bg: "bg-slate-200 dark:bg-slate-600" },
  { id: "yellow", bg: "bg-yellow-400 dark:bg-yellow-500" },
  { id: "blue", bg: "bg-blue-400 dark:bg-blue-500" },
  { id: "rose", bg: "bg-rose-400 dark:bg-rose-500" },
  { id: "emerald", bg: "bg-emerald-400 dark:bg-emerald-500" },
  { id: "purple", bg: "bg-purple-400 dark:bg-purple-500" },
];

export const CircularProgress = ({
  difficultyCounts,
  size = 100,
  strokeWidth = 8,
  total
}: {
  difficultyCounts: { Basic: number, Easy: number, Medium: number, Hard: number },
  size?: number,
  strokeWidth?: number,
  total: number
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const totalSolved = difficultyCounts.Basic + difficultyCounts.Easy + difficultyCounts.Medium + difficultyCounts.Hard;
  const percentage = total === 0 ? 0 : Math.round((totalSolved / total) * 100);

  // Cumulative percentages in reverse order for layering (Hard -> Medium -> Easy -> Basic)
  const segments = [
    { name: 'Hard', count: difficultyCounts.Hard, color: '#f43f5e', cumulative: totalSolved },
    { name: 'Medium', count: difficultyCounts.Medium, color: '#fb923c', cumulative: totalSolved - difficultyCounts.Hard },
    { name: 'Easy', count: difficultyCounts.Easy, color: '#10b981', cumulative: totalSolved - difficultyCounts.Hard - difficultyCounts.Medium },
    { name: 'Basic', count: difficultyCounts.Basic, color: '#94a3b8', cumulative: difficultyCounts.Basic },
  ];

  return (
    <div className="relative flex items-center justify-center font-black" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        {segments.map((s, i) => {
          if (s.count === 0 && s.cumulative === 0) return null;
          const offset = total === 0 ? circumference : circumference - (s.cumulative / total) * circumference;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{totalSolved}</span>
        <div className="w-8 h-px bg-slate-500 dark:bg-slate-400 my-1" />
        <span className="text-[18px] font-black text-slate-800 dark:text-white leading-none">{total}</span>
      </div>
    </div>
  );
};

export const ProgressTopBar = ({ current, total, className }: { current: number, total: number, className?: string }) => {
  const percentage = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));
  return (
    <div className={cn("h-1 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden", className)}>
      <div
        className="h-full bg-[#2dd4bf] transition-all duration-700 ease-out shadow-[0_0_8px_rgba(45,212,191,0.3)]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
