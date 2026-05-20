"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Trophy,
  ChevronDown,
  ChevronUp,
  Calendar,
  ArrowRight,
  Zap,
  RotateCcw,
} from "lucide-react";
import { cn, normalizeDate } from "@/lib/utils";
import { formatDistanceToNow, format, isAfter, isBefore, differenceInDays } from "date-fns";

export interface RevisionHistoryEntry {
  id: string;
  revisionNumber: number;
  revisedAt: string | Date;
  nextRevisionDate?: string | Date | null;
  previousNextDate?: string | Date | null;
  status: string;
  notes?: string | null;
  daysGap?: number | null;
  createdAt: string | Date;
}

interface RevisionTimelineProps {
  history: RevisionHistoryEntry[];
  nextRevision?: string | Date;
  lastRevised?: string | Date;
  isLoading?: boolean;
}

// ── Utilities ─────────────────────────────────────────────

// ── Summary Cards ─────────────────────────────────────────

function SummaryCards({
  totalRevisions,
  lastRevisedDate,
  nextScheduledDate,
  revisionStreak,
}: {
  totalRevisions: number;
  lastRevisedDate: unknown;
  nextScheduledDate: unknown;
  revisionStreak: number;
}) {
  const now = new Date();
  const nextDate = normalizeDate(nextScheduledDate);
  const lastRevDate = normalizeDate(lastRevisedDate);
  const isOverdue = nextDate ? isBefore(nextDate, now) : false;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Total Revisions */}
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-500/10 dark:to-indigo-500/5 rounded-xl p-4 border border-indigo-100 dark:border-indigo-500/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest">
            Total Revisions
          </span>
        </div>
        <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300 leading-none">
          {totalRevisions}
        </span>
      </div>

      {/* Last Revised */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5 rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest">
            Last Revised
          </span>
        </div>
        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 leading-tight">
          {lastRevDate
            ? formatDistanceToNow(lastRevDate, { addSuffix: true })
            : "Never"}
        </span>
      </div>

      {/* Next Scheduled */}
      <div
        className={cn(
          "rounded-xl p-4 border",
          isOverdue
            ? "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/10 dark:to-rose-500/5 border-rose-100 dark:border-rose-500/20"
            : "bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-500/10 dark:to-sky-500/5 border-sky-100 dark:border-sky-500/20"
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              "p-1.5 rounded-lg",
              isOverdue
                ? "bg-rose-100 dark:bg-rose-500/20"
                : "bg-sky-100 dark:bg-sky-500/20"
            )}
          >
            <Calendar
              className={cn(
                "w-3.5 h-3.5",
                isOverdue
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-sky-600 dark:text-sky-400"
              )}
            />
          </div>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              isOverdue
                ? "text-rose-600/70 dark:text-rose-400/70"
                : "text-sky-600/70 dark:text-sky-400/70"
            )}
          >
            {isOverdue ? "Overdue" : "Next Revision"}
          </span>
        </div>
        <span
          className={cn(
            "text-sm font-bold leading-tight",
            isOverdue
              ? "text-rose-700 dark:text-rose-300"
              : "text-sky-700 dark:text-sky-300"
          )}
        >
          {nextDate
            ? formatDistanceToNow(nextDate, { addSuffix: true })
            : "Not scheduled"}
        </span>
      </div>

      {/* Revision Streak */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 rounded-xl p-4 border border-amber-100 dark:border-amber-500/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
          </div>
          <span className="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/70 uppercase tracking-widest">
            Streak
          </span>
        </div>
        <span className="text-2xl font-black text-amber-700 dark:text-amber-300 leading-none">
          {revisionStreak}
          <span className="text-xs font-bold text-amber-500/60 dark:text-amber-400/50 ml-1">
            on-time
          </span>
        </span>
      </div>
    </div>
  );
}

// ── Timeline Entry ────────────────────────────────────────

function TimelineEntry({
  entry,
  isFirst,
  isLast,
  isFirstSolve,
}: {
  entry: RevisionHistoryEntry;
  isFirst: boolean;
  isLast: boolean;
  isFirstSolve: boolean;
}) {
  const now = new Date();
  const revisedDate = normalizeDate(entry.revisedAt) || new Date();
  const nextDate = normalizeDate(entry.nextRevisionDate);

  // Determine status badge
  const getStatusInfo = () => {
    if (isFirstSolve) {
      return {
        label: "First Solve",
        icon: <Trophy className="w-3 h-3" />,
        classes:
          "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
        dotClasses: "bg-amber-500 ring-amber-100 dark:ring-amber-900/50",
      };
    }
    if (entry.status === "Completed") {
      return {
        label: "Completed",
        icon: <CheckCircle2 className="w-3 h-3" />,
        classes:
          "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
        dotClasses: "bg-emerald-500 ring-emerald-100 dark:ring-emerald-900/50",
      };
    }
    if (nextDate && isBefore(nextDate, now)) {
      return {
        label: "Overdue",
        icon: <AlertCircle className="w-3 h-3" />,
        classes:
          "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
        dotClasses: "bg-rose-500 ring-rose-100 dark:ring-rose-900/50",
      };
    }
    return {
      label: "Upcoming",
      icon: <Clock className="w-3 h-3" />,
      classes:
        "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/30",
      dotClasses: "bg-sky-500 ring-sky-100 dark:ring-sky-900/50",
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="relative flex gap-4 group">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={cn(
            "w-3.5 h-3.5 rounded-full ring-4 z-10 transition-all group-hover:scale-125",
            statusInfo.dotClasses,
            isFirstSolve && "w-4 h-4"
          )}
        />
        {!isLast && (
          <div className="w-[2px] flex-1 bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 min-h-[24px]" />
        )}
      </div>

      {/* Content card */}
      <div className="flex-1 pb-6">
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-shadow">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">
                #{entry.revisionNumber}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border",
                  statusInfo.classes
                )}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </div>
            {entry.daysGap !== null && entry.daysGap !== undefined && (
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ArrowRight className="w-2.5 h-2.5" />
                {entry.daysGap}d gap
              </span>
            )}
          </div>

          {/* Date info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Revised on
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
                  {format(revisedDate, "MMM dd, yyyy")}
                </span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  {formatDistanceToNow(revisedDate, { addSuffix: true })}
                </span>
              </div>
            </div>

            {nextDate && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Next set to
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
                    {format(nextDate, "MMM dd, yyyy")}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      isBefore(nextDate, now)
                        ? "text-rose-500 dark:text-rose-400"
                        : "text-sky-500 dark:text-sky-400"
                    )}
                  >
                    {formatDistanceToNow(nextDate, { addSuffix: true })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Notes if any */}
          {entry.notes && (
            <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-700/50">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 italic leading-relaxed">
                {entry.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────

function TimelineSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 mt-1" />
          <div className="flex-1 h-28 rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────

function EmptyTimeline() {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4">
        <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
      </div>
      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
        No Revision History
      </h4>
      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 max-w-[220px]">
        Set revision dates for this question to start tracking your revision
        timeline.
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────

export function RevisionTimeline({
  history,
  nextRevision,
  lastRevised,
  isLoading = false,
}: RevisionTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const COLLAPSED_LIMIT = 5;

  if (isLoading) return <TimelineSkeleton />;
  if (!history || history.length === 0) return <EmptyTimeline />;

  // Sort by revisedAt descending (most recent first)
  const sorted = [...history].sort((a, b) => {
    const aTime = normalizeDate(a.revisedAt)?.getTime() || 0;
    const bTime = normalizeDate(b.revisedAt)?.getTime() || 0;
    return bTime - aTime;
  });

  const displayItems = isExpanded
    ? sorted
    : sorted.slice(0, COLLAPSED_LIMIT);

  // Calculate summary stats
  const totalRevisions = history.length;
  const lastRevisedDate =
    lastRevised || (sorted[0] ? sorted[0].revisedAt : null);

  // Calculate revision streak (consecutive on-time completions)
  const onTimeRevisions = [...sorted]
    .reverse()
    .reduce((streak, entry, idx) => {
      if (idx === 0) return 1;
      // A revision is "on-time" if it was completed before/on the previousNextDate
      if (entry.previousNextDate) {
        const prevNext = normalizeDate(entry.previousNextDate);
        const revised = normalizeDate(entry.revisedAt);
        if (prevNext && revised) {
          if (revised <= prevNext || differenceInDays(revised, prevNext) <= 1) {
            return streak + 1;
          }
          return 0; // streak broken
        }
      }
      return streak;
    }, 0);

  return (
    <div>
      {/* Summary Cards */}
      <SummaryCards
        totalRevisions={totalRevisions}
        lastRevisedDate={lastRevisedDate}
        nextScheduledDate={nextRevision || null}
        revisionStreak={Math.max(onTimeRevisions, 0)}
      />

      {/* Timeline */}
      <div className="relative">
        {displayItems.map((entry, idx) => (
          <TimelineEntry
            key={entry.id}
            entry={entry}
            isFirst={idx === 0}
            isLast={idx === displayItems.length - 1}
            isFirstSolve={
              entry.revisionNumber === 1 ||
              idx === displayItems.length - 1 && sorted.length === displayItems.length
            }
          />
        ))}
      </div>

      {/* Expand/Collapse Button */}
      {sorted.length > COLLAPSED_LIMIT && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl text-[11px] font-bold text-slate-500 dark:text-slate-400 transition-all group"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              Show All {sorted.length} Revisions
            </>
          )}
        </button>
      )}
    </div>
  );
}
